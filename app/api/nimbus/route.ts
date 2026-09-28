import { NextResponse } from "next/server";
import { apiKey, askNimbus, type ChatTurn } from "@/lib/server/nimbus-brain";

/**
 * POST /api/nimbus — one turn of conversation with Mr. Nimbus.
 * GET  /api/nimbus — whether his AI is connected (a key is configured).
 *
 * Limits: 12 turns of history, 600 characters per message, 20 requests per
 * minute per visitor. Messages are not stored or logged.
 */

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function GET() {
  return NextResponse.json({ ai: !!apiKey() });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "slow-down" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const turns: ChatTurn[] = raw
    .slice(-12)
    .filter((m): m is ChatTurn => !!m && (m.from === "you" || m.from === "nimbus") && typeof m.text === "string")
    .map((m) => ({ from: m.from, text: m.text.slice(0, 600) }));
  // The conversation must end with the visitor.
  if (!turns.length || turns[turns.length - 1].from !== "you") return NextResponse.json({ error: "bad-request" }, { status: 400 });
  // Gemini expects the first turn from the user.
  while (turns.length && turns[0].from !== "you") turns.shift();

  const result = await askNimbus(turns);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: result.reason === "no-key" ? 503 : 502 });
  return NextResponse.json({ reply: result.reply, intent: result.intent });
}
