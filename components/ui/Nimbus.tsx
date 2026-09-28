"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useIntro } from "@/components/ui/Intro";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { useTransition } from "@/components/ui/PageTransition";
import { ResumeViewer } from "@/components/ui/ResumeViewer";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import type { ChapterId } from "@/data/scenes";
import { skillCategories, skillsByCategory } from "@/data/skills";
import { gotoChapter } from "@/lib/deck";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Nimbus: Krutik's cat, and the site's guide. Helps visitors get what they
 * came for.
 *
 * For now Nimbus is a guided assistant, not a language model: it recognises
 * what people ask about (a website, hiring, projects, the stack, contact)
 * and answers from the same data the site is built from, with buttons that
 * do the thing. It says so openly, and that AI is being linked to it soon.
 */

type Action =
  | { kind: "link"; label: string; href: string }
  | { kind: "chapter"; label: string; chapter: ChapterId }
  | { kind: "resume"; label: string };

interface Message {
  id: number;
  from: "nimbus" | "you";
  text: string;
  actions?: Action[];
  replies?: string[];
}

const whatsapp = `https://wa.me/${profile.phone.replace(/\D/g, "")}`;
const mail = (subject: string) => `mailto:${profile.email}?subject=${encodeURIComponent(subject)}`;

const QUICK = ["I need a website", "I'm hiring", "Show me the projects", "What does he build with?", "How do I contact him?"];

function answer(input: string): Omit<Message, "id" | "from"> {
  const q = input.toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));

  const project = projects.find((p) => q.includes(p.title.toLowerCase()) || q.includes(p.slug.replace(/-/g, " ")));
  if (project) {
    return {
      text: `${project.title}: ${project.tagline} ${project.description}`,
      actions: [
        { kind: "link", label: "Open the case study", href: `/projects/${project.slug}` },
        ...(project.live ? [{ kind: "link" as const, label: "Live site", href: project.live }] : []),
      ],
    };
  }
  if (has("price", "cost", "charge", "budget", "quote", "rate")) {
    return {
      text: "It depends on what you need. Send a short brief (what the site is for, any site you have now, and your timeline) and Krutik replies with a plan and a quote.",
      actions: [
        { kind: "link", label: "Send a brief", href: mail("Website project") },
        { kind: "link", label: "WhatsApp", href: whatsapp },
      ],
    };
  }
  if (has("website", "site", "landing", "web app", "build me", "business", "shop", "redesign", "fix my", "develop")) {
    return {
      text: "Krutik builds websites and web apps as paid projects, fully online over email, WhatsApp and video calls. Business sites, web apps like CRM360, AI features, or fixing a site that isn't working.",
      actions: [
        { kind: "link", label: "Start a project", href: mail("Website project") },
        { kind: "link", label: "WhatsApp", href: whatsapp },
        { kind: "chapter", label: "See how it works", chapter: "hire" },
      ],
    };
  }
  if (has("hire", "hiring", "intern", "job", "role", "recruit", "position", "opening", "resume", "cv")) {
    return {
      text: `He's looking for paid remote internships. He's a B.Tech student at KJ Somaiya (2025–2029) and has completed a web development internship at ${profile.experience[0].company}.`,
      actions: [
        { kind: "resume", label: "View resume" },
        { kind: "link", label: "Email him", href: mail("Internship opportunity") },
        { kind: "link", label: "LinkedIn", href: profile.socials.find((s) => s.label === "LinkedIn")?.href ?? "#" },
      ],
    };
  }
  if (has("project", "work", "portfolio", "built", "made", "show")) {
    return {
      text: `Six projects, all live or open source: ${projects.map((p) => p.title).join(", ")}. Ask me about any of them by name.`,
      actions: [{ kind: "chapter", label: "Walk through the work", chapter: "work" }],
      replies: projects.slice(0, 3).map((p) => p.title),
    };
  }
  if (has("stack", "skill", "tech", "language", "framework", "react", "next", "node", "build with", "tools")) {
    const lines = skillCategories.map((c) => `${c}: ${skillsByCategory(c).map((s) => s.name).join(", ")}`);
    return { text: lines.join("\n"), actions: [{ kind: "chapter", label: "See the ecosystem", chapter: "stack" }] };
  }
  if (has("contact", "email", "mail", "phone", "whatsapp", "reach", "call", "talk to him")) {
    return {
      text: `Email ${profile.email}, or message him on WhatsApp. He reads everything that lands in his inbox.`,
      actions: [
        { kind: "link", label: "Email", href: `mailto:${profile.email}` },
        { kind: "link", label: "WhatsApp", href: whatsapp },
      ],
    };
  }
  if (has("available", "free", "when", "start", "open to")) {
    return { text: "Yes: he's open to paid remote internships and paid web projects right now.", replies: ["I need a website", "I'm hiring"] };
  }
  if (has("who", "about", "student", "college", "study", "experience", "krutik")) {
    return { text: profile.about[0], actions: [{ kind: "chapter", label: "Meet him properly", chapter: "about" }] };
  }
  if (has("hi", "hello", "hey", "yo", "sup")) {
    return { text: "Meow! Hi. What brings you here?", replies: QUICK };
  }
  return {
    text: "Mrrp? That one's beyond me for now. AI is being linked to me, and soon you'll be able to chat with me about anything. Until then, I can help with these:",
    replies: QUICK,
  };
}

/** Nimbus's face: ears, eyes that blink now and then, whiskers. */
function CatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 9.5 4.2 3.8l4.6 3.1a8.6 8.6 0 0 1 6.4 0l4.6-3.1-.8 5.7A7.6 7.6 0 0 1 20 13.5c0 4-3.6 6.5-8 6.5s-8-2.5-8-6.5c0-1.5.4-2.9 1-4Z" />
      <g className="origin-center [animation:cat-blink_5s_infinite]" style={{ transformBox: "fill-box" }}>
        <ellipse cx="9" cy="12.6" rx="0.9" ry="1.2" fill="currentColor" stroke="none" />
        <ellipse cx="15" cy="12.6" rx="0.9" ry="1.2" fill="currentColor" stroke="none" />
      </g>
      <path d="M11.3 15.2h1.4l-.7.7Z" fill="currentColor" />
      <path d="M2.5 14.5 7 15M2.8 17l4.2-1M21.5 14.5 17 15M21.2 17 17 16" strokeWidth="1" />
    </svg>
  );
}

export function Nimbus() {
  const { done } = useIntro();
  const pathname = usePathname();
  const { navigate } = useTransition();
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 0,
      from: "nimbus",
      text: "Mrrp! I'm Nimbus, Krutik's cat. I know my way around this place. What brings you in?",
      replies: QUICK,
    },
  ]);
  const idRef = useRef(1);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  // The invitation: once per visit, a little after the opening.
  useEffect(() => {
    if (!done) return;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem("nimbus:invited") === "1";
    } catch {}
    if (seen) return;
    const t = window.setTimeout(() => setBubble(true), 7000);
    return () => window.clearTimeout(t);
  }, [done]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const dismissBubble = () => {
    setBubble(false);
    try {
      window.sessionStorage.setItem("nimbus:invited", "1");
    } catch {}
  };

  const ask = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: idRef.current++, from: "you", text: t }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: idRef.current++, from: "nimbus", ...answer(t) }]);
    }, 550 + Math.min(900, t.length * 12));
  };

  const goChapter = (c: ChapterId) => {
    setOpen(false);
    window.setTimeout(() => {
      if (pathname === "/") gotoChapter(c);
      else navigate(c === "work" ? "/#projects" : `/#${c}`);
    }, 250);
  };

  const renderAction = (a: Action, i: number): ReactNode => {
    const cls = "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[13px] text-bone transition-colors hover:bg-white/[0.14]";
    if (a.kind === "resume")
      return (
        <ResumeViewer key={i}>
          <button type="button" className={cls}>
            {a.label}
          </button>
        </ResumeViewer>
      );
    if (a.kind === "chapter")
      return (
        <button key={i} type="button" onClick={() => goChapter(a.chapter)} className={cls}>
          {a.label} →
        </button>
      );
    const internal = a.href.startsWith("/");
    return (
      <a
        key={i}
        href={a.href}
        className={cls}
        onClick={(e) => {
          if (internal) {
            e.preventDefault();
            setOpen(false);
            navigate(a.href);
          }
        }}
        {...(!internal && a.href.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {a.label} {!internal && <ArrowUpRight />}
      </a>
    );
  };

  if (!done) return null;

  return (
    <>
      {/* Launcher and invitation. */}
      <div className="fixed bottom-5 right-5 z-[104] flex flex-col items-end gap-3">
        <AnimatePresence>
          {bubble && !open && (
            <motion.div
              className="relative max-w-[250px] rounded-2xl rounded-br-md border border-white/15 bg-[#121214]/92 p-4 text-sm text-bone shadow-[0_20px_50px_-15px_rgb(0_0_0/0.8)] backdrop-blur-md"
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.5, ease: ease.outExpo }}
            >
              <button type="button" onClick={dismissBubble} aria-label="Dismiss" className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-bone-2 hover:text-bone">
                ×
              </button>
              <p className="pr-4 font-medium">Have a doubt?</p>
              <p className="mt-1 leading-snug text-bone-2">Talk to Nimbus, Krutik&apos;s cat. It knows its way around and can take you straight to him.</p>
              <button
                type="button"
                onClick={() => {
                  dismissBubble();
                  setOpen(true);
                }}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-bone px-4 text-[13px] font-medium text-ink"
              >
                Talk to Nimbus
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          type="button"
          onClick={() => {
            dismissBubble();
            setOpen((o) => !o);
          }}
          aria-expanded={open}
          aria-controls="nimbus-panel"
          className="flex h-12 items-center gap-2 rounded-full border border-white/15 bg-[#121214]/85 pl-3 pr-4 text-sm text-bone shadow-[0_12px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur-md transition-colors hover:bg-[#1c1c20]/90"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: ease.outExpo, delay: 0.8 }}
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#ffcf9e] to-[#ff8a3d] text-white">
            <CatIcon className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[#121214] bg-[#28c840]" />
          </span>
          {open ? "Close" : "Nimbus"}
        </motion.button>
      </div>

      {/* Panel. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="nimbus-panel"
            role="dialog"
            aria-label="Nimbus, site guide"
            data-lenis-prevent
            className="fixed bottom-20 right-5 z-[104] flex h-[min(560px,calc(100svh-7rem))] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0f0f11]/95 text-bone shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-md"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.45, ease: ease.outExpo }}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ffcf9e] to-[#ff8a3d] text-white">
                <CatIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-medium">Nimbus</p>
                <p className="text-xs text-bone-2">Krutik&apos;s cat · site guide · awake</p>
              </div>
            </div>
            <p className="border-b border-white/10 bg-[#ff8a3d]/10 px-4 py-2.5 text-[12px] leading-snug text-[#ffd9b8]">
              AI is being linked to Nimbus. Soon you&apos;ll be able to chat with it freely; for now it answers the common questions.
            </p>

            <div ref={list} className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex flex-col gap-2", m.from === "you" ? "items-end" : "items-start")}>
                  <p
                    className={cn(
                      "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
                      m.from === "you" ? "rounded-br-md bg-[#ff7a2e] text-white" : "rounded-bl-md bg-white/[0.07] text-bone",
                    )}
                  >
                    {m.text}
                  </p>
                  {m.actions && <div className="flex flex-wrap gap-2">{m.actions.map(renderAction)}</div>}
                  {m.replies && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.replies.map((r) => (
                        <button key={r} type="button" onClick={() => ask(r)} className="rounded-full border border-[#ff8a3d]/50 px-3 py-1.5 text-[13px] text-[#ffd9b8] transition-colors hover:bg-[#ff8a3d]/15">
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex w-14 items-center justify-center gap-1 rounded-2xl rounded-bl-md bg-white/[0.07] py-3" aria-label="Nimbus is thinking">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-bone/70 [animation:twinkle_1s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>

            <form
              className="flex items-center gap-2 border-t border-white/10 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
                field.current?.focus();
              }}
            >
              <label htmlFor="nimbus-input" className="sr-only">
                Ask Nimbus
              </label>
              <input
                id="nimbus-input"
                ref={field}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a website, hiring, a project…"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.05] px-4 text-[14px] text-bone placeholder:text-bone-3 focus:border-[#ff8a3d]/60 focus:outline-none"
              />
              <button type="submit" aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ff7a2e] text-white disabled:opacity-40" disabled={!input.trim()}>
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
