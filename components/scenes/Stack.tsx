"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment, useEffect, useRef } from "react";
import { TransitionLink } from "@/components/ui/PageTransition";
import { Spotlight } from "@/components/ui/Spotlight";
import { getProject } from "@/data/projects";
import { skillCategories, skills, skillsByCategory } from "@/data/skills";
import { useDevice } from "@/lib/hooks/use-device";
import type { Skill } from "@/lib/types";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Constellation layout                                                 */
/* ------------------------------------------------------------------ */
const TILT = 50; // degrees the disc is tilted away from the viewer
const CHIP_H = 30; // a chip's height (h-[30px] below)
const GAP = 8; // the least space between two chips, at any angle
const HUB = 96; // the "Ecosystem" label at the centre, kept clear
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const RINGS = [0.24, 0.36, 0.48];
/** `label-mono` without its colour, so each label can set its own over the footage. */
const label = "font-mono text-[0.6875rem] uppercase tracking-[0.18em]";

interface Point {
  x: number;
  y: number;
}

/**
 * Seeds chips on a phyllotaxis spiral (the widest in the middle, where they
 * have room), then relaxes them apart using each chip's measured width, so no
 * two chips can overlap at any angle of the turn. Two chips on the tilted
 * disc stay clear of each other at every rotation exactly when their distance
 * is at least the diagonal of their combined box, with the tilt's vertical
 * squash undone (`sep`). Chips never scale above 1 (see `draw`), so that
 * distance holds on screen as well. The label at the centre is a fixed
 * obstacle, and every chip stays inside the disc.
 */
function layout(widths: number[], size: number): Point[] {
  const n = widths.length;
  const radius = size * 0.48;
  const cos = Math.cos((TILT * Math.PI) / 180);
  const sep = (a: number, b: number) => Math.hypot((a + b) / 2 + GAP, (CHIP_H + GAP) / cos);
  const order = widths.map((_, i) => i).sort((a, b) => widths[b] - widths[a]);
  const pts: Point[] = new Array(n);
  order.forEach((idx, k) => {
    const r = radius * Math.sqrt((k + 0.5) / n);
    const a = k * GOLDEN;
    pts[idx] = { x: r * Math.cos(a), y: r * Math.sin(a) };
  });
  for (let k = 0; k < 400; k++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pts[j].x - pts[i].x;
        const dy = pts[j].y - pts[i].y;
        const d = Math.hypot(dx, dy) || 0.001;
        const s = sep(widths[i], widths[j]);
        if (d < s) {
          const push = (s - d) / 2 + 0.01;
          const nx = dx / d;
          const ny = dy / d;
          pts[i].x -= nx * push;
          pts[i].y -= ny * push;
          pts[j].x += nx * push;
          pts[j].y += ny * push;
          moved = true;
        }
      }
    }
    pts.forEach((p, i) => {
      // Clear of the label at the centre.
      const d = Math.hypot(p.x, p.y) || 0.001;
      const hub = sep(widths[i], HUB);
      if (d < hub) {
        p.x *= hub / d;
        p.y *= hub / d;
        moved = true;
      }
      // Inside the container at any angle: the centre no further out than half the box minus half the chip.
      const bound = Math.min(radius, size / 2 - widths[i] / 2 - 6);
      if (d > bound) {
        p.x *= bound / d;
        p.y *= bound / d;
      }
    });
    if (!moved) break;
  }
  return pts;
}

/**
 * The toolkit as a slowly turning disc of chips. It turns only while the
 * scene is on screen (`play`), and stops while the pointer rests on it; the
 * chips are placed once on mount so they are in place as the scene arrives.
 * The disc's size comes from a ResizeObserver, never from reading layout
 * every frame.
 */
export function OrbitSystem({ selected, onSelect, play = true }: { selected: Skill; onSelect: (s: Skill) => void; play?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const { reducedMotion } = useDevice();
  const paused = useRef(false);
  const time = useRef(0);
  /** Starts the frame loop again (set by the effect below). */
  const resume = useRef<() => void>(() => {});

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    let last = 0;
    let size = el.clientWidth;
    let points: Point[] | null = null;
    const turning = play && !reducedMotion;

    const draw = () => {
      if (!size) return;
      if (!points) {
        const widths = skills.map((s) => chipRefs.current.get(s.name)?.offsetWidth ?? 90);
        points = layout(widths, size);
      }
      const c = size / 2;
      const radius = size * 0.48;
      const theta = time.current * 0.07;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      skills.forEach((skill, i) => {
        const chip = chipRefs.current.get(skill.name);
        const p = points![i];
        if (!chip || !p) return;
        const x = p.x * cosT - p.y * sinT;
        const y = p.x * sinT + p.y * cosT;
        // Depth cue: chips toward the bottom of the disc are nearer the viewer. Never above 1, so the
        // spacing the layout guarantees holds on screen.
        const depth = Math.min(1, Math.max(0, (y / radius + 1) / 2));
        const scale = 0.88 + depth * 0.12;
        chip.style.transform = `translate(-50%, -50%) translate3d(${c + x}px, ${c + y}px, 0) rotateX(${-TILT}deg) scale(${scale})`;
        chip.style.opacity = String(0.72 + depth * 0.28);
        chip.style.zIndex = String(Math.round(depth * 100));
      });
    };

    const tick = (now: number) => {
      if (paused.current) {
        raf = 0;
        return;
      }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      time.current += dt;
      draw();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!turning || raf) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    resume.current = start;

    const ro = new ResizeObserver(() => {
      const next = el.clientWidth;
      if (Math.abs(next - size) <= 2 && points) return;
      size = next;
      points = null;
      draw();
    });
    ro.observe(el);
    draw();
    start();
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      resume.current = () => {};
    };
  }, [play, reducedMotion]);

  return (
    // Wider than tall: a tilted disc is only about two thirds as tall as it is wide. Sized by the
    // height left between the header and the dock as well, so it never runs under either.
    <div
      data-orbit
      className="relative mx-auto aspect-[10/7] w-full max-w-[min(900px,calc((100svh-var(--nav-height)-var(--dock-clear))*1.4))]"
      onPointerEnter={() => {
        paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
        resume.current();
      }}
    >
      {/* The disc, a square as wide as the box, sitting a little high: its near edge looms larger. */}
      <div className="absolute inset-x-0 top-[44%] aspect-square -translate-y-1/2 [perspective:3000px]">
        <div ref={containerRef} className="absolute inset-0" style={{ transform: `rotateX(${TILT}deg)`, transformStyle: "preserve-3d" }}>
          {RINGS.map((r) => (
            <div
              key={r}
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line"
              style={{ width: `${r * 200}%`, height: `${r * 200}%` }}
            />
          ))}
          <div aria-hidden className="absolute left-1/2 top-1/2 h-[16%] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-glaze-dim),transparent)]" />
          {skills.map((skill) => (
            <button
              key={skill.name}
              ref={(el) => {
                if (el) chipRefs.current.set(skill.name, el);
                else chipRefs.current.delete(skill.name);
              }}
              type="button"
              onPointerEnter={() => onSelect(skill)}
              onFocus={() => onSelect(skill)}
              onClick={() => onSelect(skill)}
              aria-pressed={selected.name === skill.name}
              className={cn(
                // Solid chips, no backdrop blur: 34 of them move every frame.
                "absolute left-0 top-0 flex h-[30px] items-center whitespace-nowrap rounded-full border px-2.5 font-mono text-[10px] uppercase leading-none tracking-[0.1em] transition-colors duration-300 will-change-transform",
                selected.name === skill.name ? "border-glaze bg-glaze text-ink" : "border-line-strong bg-ink/85 text-bone hover:border-bone",
              )}
              style={{ transformOrigin: "center" }}
            >
              {skill.name}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <span className={cn(label, "text-bone/75")}>Ecosystem</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Detail panel                                                         */
/* ------------------------------------------------------------------ */
export function SkillDetail({ skill, compact = false }: { skill: Skill; compact?: boolean }) {
  return (
    <Spotlight className={cn("rounded-3xl border border-white/10 bg-black/55 backdrop-blur-md", compact ? "p-5" : "min-h-[220px] p-6 md:p-7")}>
      <div aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: ease.outQuart }}
          >
            <span className={cn(label, "text-bone/75")}>{skill.category}</span>
            <h3 className={cn("mt-2 font-display tracking-[-0.02em] text-bone", compact ? "text-2xl" : "text-3xl")}>{skill.name}</h3>
            <p className={cn("text-sm leading-relaxed text-bone/85", compact ? "mt-2" : "mt-4")}>{skill.usage}</p>
            {skill.projects && skill.projects.length > 0 && (
              <div className={compact ? "mt-4" : "mt-5"}>
                <span className={cn(label, "text-bone/75")}>Used in</span>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {skill.projects.map((slug) => {
                    const p = getProject(slug);
                    if (!p) return null;
                    return (
                      <li key={slug}>
                        <TransitionLink
                          href={`/projects/${slug}`}
                          className="inline-flex min-h-8 items-center rounded-full border border-line-strong px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-bone"
                        >
                          {p.title}
                        </TransitionLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Spotlight>
  );
}

/* ------------------------------------------------------------------ */
/* Compact list for smaller screens                                     */
/* ------------------------------------------------------------------ */
/**
 * The technologies by group. The detail opens right under the group of the
 * one selected (the first, to begin with), so a tap never sends the answer
 * somewhere off screen.
 */
export function CompactStack({ selected, onSelect }: { selected: Skill; onSelect: (s: Skill) => void }) {
  return (
    <div className="flex flex-col gap-6">
      {skillCategories.map((cat) => (
        <Fragment key={cat}>
          <div>
            <h3 className={cn(label, "legible text-bone/80")}>{cat}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {skillsByCategory(cat).map((skill) => (
                <li key={skill.name}>
                  <button
                    type="button"
                    onClick={() => onSelect(skill)}
                    aria-pressed={selected.name === skill.name}
                    className={cn(
                      "min-h-8 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                      selected.name === skill.name ? "border-glaze bg-glaze text-ink" : "border-line-strong bg-black/35 text-bone",
                    )}
                  >
                    {skill.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {selected.category === cat && <SkillDetail skill={selected} compact />}
        </Fragment>
      ))}
    </div>
  );
}
