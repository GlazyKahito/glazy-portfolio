"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLite } from "@/lib/capability";
import { useDevice } from "@/lib/hooks/use-device";
import { ease } from "@/lib/motion";

const COLS = 4;
const ROWS = 3;
/** How far a knob reaches past its cell, as a fraction of the cell. */
const M = 0.26;
const FLIGHT = 1.45;
const STAGGER = 0.06;
const START = 0.25;
/** When the last piece has landed (s). */
export const PUZZLE_DONE = START + STAGGER * (COLS * ROWS - 1) + FLIGHT;

/** A small seeded PRNG, so the cut is the same on the server and in the browser. */
function prng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One jigsaw edge from (0,0) to (1,0); u is how far a point sits outward. A knob of ±M. */
const KNOB: [number, number][][] = [
  // [control1, control2, end] for each cubic, along the edge (t) and outward (u)
  [[0.34, 0], [0.4, 0], [0.4, 0.06]],
  [[0.4, 0.12], [0.32, 0.26], [0.5, 0.26]],
  [[0.68, 0.26], [0.6, 0.12], [0.6, 0.06]],
  [[0.6, 0], [0.66, 0], [1, 0]],
];

/** The clip path of piece (c, r) in objectBoundingBox units, given its four edge types (1 knob out, -1 socket, 0 border). */
function piecePath(top: number, right: number, bottom: number, left: number) {
  const map = (x: number, y: number) => `${((x + M) / (1 + 2 * M)).toFixed(4)} ${((y + M) / (1 + 2 * M)).toFixed(4)}`;
  const edges: { type: number; at: (t: number, u: number) => [number, number] }[] = [
    { type: top, at: (t, u) => [t, -u] },
    { type: right, at: (t, u) => [1 + u, t] },
    { type: bottom, at: (t, u) => [1 - t, 1 + u] },
    { type: left, at: (t, u) => [-u, 1 - t] },
  ];
  let d = `M ${map(0, 0)}`;
  for (const e of edges) {
    if (e.type === 0) {
      d += ` L ${map(...e.at(1, 0))}`;
      continue;
    }
    for (const [c1, c2, end] of KNOB) {
      const pts = [c1, c2, end].map(([t, u]) => map(...e.at(t, (u / 0.26) * M * e.type)));
      d += ` C ${pts.join(", ")}`;
    }
  }
  return `${d} Z`;
}

function makePuzzle(seed: string) {
  const rand = prng(seed);
  // Edge types between neighbours: what is a knob on one side is a socket on the other.
  const h = Array.from({ length: ROWS - 1 }, () => Array.from({ length: COLS }, () => (rand() < 0.5 ? 1 : -1)));
  const v = Array.from({ length: ROWS }, () => Array.from({ length: COLS - 1 }, () => (rand() < 0.5 ? 1 : -1)));
  // Fisher-Yates with a fixed number of draws: the same order on the server and in the browser.
  const order = Array.from({ length: COLS * ROWS }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return Array.from({ length: COLS * ROWS }, (_, i) => {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    const top = r === 0 ? 0 : -h[r - 1][c];
    const bottom = r === ROWS - 1 ? 0 : h[r][c];
    const left = c === 0 ? 0 : -v[r][c - 1];
    const right = c === COLS - 1 ? 0 : v[r][c];
    const side = c < COLS / 2 ? -1 : 1;
    return {
      c,
      r,
      path: piecePath(top, right, bottom, left),
      delay: START + order.indexOf(i) * STAGGER,
      from: {
        x: `${Math.round(side * (60 + rand() * 120))}%`,
        y: `${Math.round((rand() - 0.5) * 260)}%`,
        z: Math.round(-280 + rand() * 520),
        rotate: Math.round((rand() - 0.5) * 70),
        rotateX: Math.round((rand() - 0.5) * 100),
        rotateY: Math.round((rand() - 0.5) * 120),
      },
    };
  });
}

/**
 * Cut the screenshot into its pieces: one small canvas per piece, holding
 * exactly its shape (the image drawn as `object-cover object-top` would
 * place it, clipped by the piece's outline).
 */
function cutPieces(img: HTMLImageElement, box: HTMLElement, pieces: ReturnType<typeof makePuzzle>, canvases: (HTMLCanvasElement | null)[]) {
  const w = box.clientWidth;
  const h = box.clientHeight;
  if (!w || !h || !img.naturalWidth) return false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // object-cover, anchored to the top.
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const iw = img.naturalWidth * scale;
  const ih = img.naturalHeight * scale;
  const ix = (w - iw) / 2;
  const pw = ((1 + 2 * M) / COLS) * w;
  const ph = ((1 + 2 * M) / ROWS) * h;
  pieces.forEach((p, i) => {
    const canvas = canvases[i];
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = Math.max(1, Math.round(pw * dpr));
    canvas.height = Math.max(1, Math.round(ph * dpr));
    ctx.save();
    ctx.scale(canvas.width, canvas.height);
    ctx.clip(new Path2D(p.path));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // The piece's box starts (c - M) columns across and (r - M) rows down.
    ctx.drawImage(img, ix - ((p.c - M) / COLS) * w, -((p.r - M) / ROWS) * h, iw, ih);
    ctx.restore();
  });
  return true;
}

/**
 * A project's screen that assembles like a jigsaw. The cover is cut into
 * interlocking pieces (a knob on one piece is the socket of its neighbour)
 * that fly in from all sides in 3D and snap into place each time the scene
 * arrives; once they have landed, the intact image settles underneath and a
 * glint crosses it. Lite mode and reduced motion show the image straight away.
 *
 * The pieces are cut once, into small canvases, as soon as the screenshot has
 * loaded: in flight they are twelve ready textures, with no clip-path masks
 * and no twelve copies of the full screenshot for the GPU to rasterise. Once
 * they have landed they are put away, and the intact image is all there is.
 */
export function PuzzleImage({ src, alt, seed, play, sizes, children }: { src: string; alt: string; seed: string; play: boolean; sizes: string; children?: ReactNode }) {
  const { reducedMotion } = useDevice();
  const lite = useLite();
  const pieces = useMemo(() => makePuzzle(seed), [seed]);
  const box = useRef<HTMLDivElement>(null);
  const intact = useRef<HTMLImageElement>(null);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  /** The pieces have been cut (until then, and if they cannot be, the image shows without the puzzle). */
  const [cut, setCut] = useState(false);
  /** The pieces have landed: the intact image is all there is. */
  const [landed, setLanded] = useState(false);
  if (!play && landed) setLanded(false);
  const puzzle = !reducedMotion && !lite && cut;

  // Cut the pieces once the screenshot has loaded, and again if the frame changes size.
  useEffect(() => {
    const img = intact.current;
    const frame = box.current;
    if (reducedMotion || lite || !img || !frame) return;
    let alive = true;
    let width = 0;
    let queue = Promise.resolve();
    const run = async () => {
      if (!img.complete) await new Promise((r) => img.addEventListener("load", r, { once: true }));
      await img.decode().catch(() => {});
      if (!alive || frame.clientWidth === width) return;
      width = frame.clientWidth;
      if (cutPieces(img, frame, pieces, canvases.current)) setCut(true);
    };
    // Called once on observing, then on each resize; one cut at a time.
    const ro = new ResizeObserver(() => {
      queue = queue.then(run);
    });
    ro.observe(frame);
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [pieces, reducedMotion, lite]);

  // Put the pieces away once they have landed and the intact image has taken over.
  useEffect(() => {
    if (!play || !puzzle) return;
    const t = window.setTimeout(() => setLanded(true), (PUZZLE_DONE + 0.7) * 1000);
    return () => window.clearTimeout(t);
  }, [play, puzzle]);

  return (
    <div ref={box} className="relative aspect-[16/10]">
      <div className="absolute inset-0 overflow-hidden rounded-b-[17px]">
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: !puzzle || play ? 1 : 0 }}
          transition={{ duration: 0.35, delay: puzzle && play ? PUZZLE_DONE : 0 }}
        >
          <Image ref={intact} src={src} alt={alt} fill sizes={sizes} quality={85} className="object-cover object-top" />
        </motion.div>
        {puzzle && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(100deg,transparent,rgb(255_255_255/0.22),transparent)] mix-blend-screen"
            initial={false}
            animate={play ? { x: "400%" } : { x: "0%" }}
            transition={{ duration: play ? 1.1 : 0, ease: ease.inOutQuart, delay: play ? PUZZLE_DONE + 0.1 : 0 }}
          />
        )}
        {children}
      </div>

      {!reducedMotion && !lite && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 [perspective:1400px]"
          style={{ display: puzzle && !landed ? undefined : "none" }}
          initial={false}
          animate={{ opacity: play ? 0 : 1 }}
          transition={{ duration: play ? 0.3 : 0, delay: play ? PUZZLE_DONE + 0.3 : 0 }}
        >
          {pieces.map((p, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${(((p.c - M) / COLS) * 100).toFixed(3)}%`,
                top: `${(((p.r - M) / ROWS) * 100).toFixed(3)}%`,
                width: `${(((1 + 2 * M) / COLS) * 100).toFixed(3)}%`,
                height: `${(((1 + 2 * M) / ROWS) * 100).toFixed(3)}%`,
              }}
              initial={false}
              animate={
                play
                  ? { x: "0%", y: "0%", z: 0, rotate: 0, rotateX: 0, rotateY: 0, opacity: 1 }
                  : { ...p.from, opacity: 0 }
              }
              transition={play ? { duration: FLIGHT, ease: ease.outQuart, delay: p.delay, opacity: { duration: 0.12, delay: p.delay } } : { duration: 0 }}
            >
              <canvas
                ref={(el) => {
                  canvases.current[i] = el;
                }}
                className="absolute inset-0 h-full w-full"
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
