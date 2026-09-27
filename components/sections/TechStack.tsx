"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TransitionLink } from "@/components/ui/PageTransition";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Spotlight } from "@/components/ui/Spotlight";
import { getProject } from "@/data/projects";
import { skillCategories, skills, skillsByCategory } from "@/data/skills";
import { useDevice, useMediaQuery } from "@/lib/hooks/use-device";
import type { Skill } from "@/lib/types";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Orbital layout                                                       */
/* ------------------------------------------------------------------ */
interface Orbit {
  radius: number;
  speed: number;
  items: Skill[];
}

const TILT = 62; // degrees the disc is tilted away from the viewer

function useOrbits(): Orbit[] {
  return useMemo(
    () =>
      skillCategories.map((cat, i) => ({
        // Radii are fractions of the container width; the outer ring must stay inside it.
        radius: 0.16 + i * 0.052,
        speed: (i % 2 === 0 ? 1 : -1) * (0.05 - i * 0.004),
        items: skillsByCategory(cat),
      })),
    [],
  );
}

function OrbitSystem({ selected, onSelect }: { selected: Skill | null; onSelect: (s: Skill | null) => void }) {
  const orbits = useOrbits();
  const containerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const { reducedMotion } = useDevice();
  const paused = useRef(false);
  const time = useRef(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!paused.current && !reducedMotion) time.current += dt;
      const el = containerRef.current;
      if (el) {
        const size = el.clientWidth;
        const c = size / 2;
        orbits.forEach((orbit, oi) => {
          const n = orbit.items.length;
          orbit.items.forEach((skill, i) => {
            const chip = chipRefs.current.get(skill.name);
            if (!chip) return;
            const a = (i / n) * Math.PI * 2 + time.current * orbit.speed * Math.PI * 2 + oi * 0.7;
            const r = orbit.radius * size;
            const x = c + Math.cos(a) * r;
            const y = c + Math.sin(a) * r;
            // Depth cue: chips at the back (sin < 0) are smaller and dimmer.
            const depth = (Math.sin(a) + 1) / 2; // 0 back … 1 front
            const scale = 0.78 + depth * 0.32;
            chip.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotateX(${-TILT}deg) scale(${scale})`;
            chip.style.opacity = String(0.65 + depth * 0.35);
            chip.style.zIndex = String(Math.round(depth * 100));
          });
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [orbits, reducedMotion]);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[720px] [perspective:2000px]"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ transform: `rotateX(${TILT}deg)`, transformStyle: "preserve-3d" }}
      >
        {/* Rings */}
        {orbits.map((o, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line"
            style={{ width: `${o.radius * 200}%`, height: `${o.radius * 200}%` }}
          />
        ))}
        {/* Core */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[12%] w-[12%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glaze/10 blur-md"
        />
        {/* Chips */}
        {orbits.flatMap((o) =>
          o.items.map((skill) => (
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
              aria-pressed={selected?.name === skill.name}
              className={cn(
                "absolute left-0 top-0 min-h-9 whitespace-nowrap rounded-full border px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 will-change-transform",
                selected?.name === skill.name
                  ? "border-glaze bg-glaze text-ink"
                  : "border-line-strong bg-ink/80 text-bone backdrop-blur hover:border-bone",
              )}
              style={{ transformOrigin: "center" }}
            >
              {skill.name}
            </button>
          )),
        )}
      </div>
      {/* Centre label sits above the tilted plane. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="label-mono">Ecosystem</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Detail panel                                                         */
/* ------------------------------------------------------------------ */
function SkillDetail({ skill }: { skill: Skill | null }) {
  return (
    <Spotlight className="glass min-h-[220px] rounded-2xl p-6 md:p-7">
      <div aria-live="polite">
      <AnimatePresence mode="wait">
        {skill ? (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: ease.outQuart }}
          >
            <span className="label-mono">{skill.category}</span>
            <h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] text-bone">{skill.name}</h3>
            <p className="mt-4 text-sm leading-relaxed text-bone-2">{skill.usage}</p>
            {skill.projects && skill.projects.length > 0 && (
              <div className="mt-5">
                <span className="label-mono">Used in</span>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {skill.projects.map((slug) => {
                    const p = getProject(slug);
                    if (!p) return null;
                    return (
                      <li key={slug}>
                        <TransitionLink
                          href={`/projects/${slug}`}
                          className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-bone"
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
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span className="label-mono">Hover or focus a technology</span>
            <p className="mt-4 text-sm leading-relaxed text-bone-2">
              {skills.length} technologies across {skillCategories.length} groups, every one backed by the resume or a shipped project.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </Spotlight>
  );
}

/* ------------------------------------------------------------------ */
/* Compact list for small screens                                       */
/* ------------------------------------------------------------------ */
function CompactStack({ selected, onSelect }: { selected: Skill | null; onSelect: (s: Skill | null) => void }) {
  return (
    <div className="flex flex-col gap-6">
      {skillCategories.map((cat) => (
        <div key={cat}>
          <h3 className="label-mono">{cat}</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {skillsByCategory(cat).map((skill) => (
              <li key={skill.name}>
                <button
                  type="button"
                  onClick={() => onSelect(selected?.name === skill.name ? null : skill)}
                  aria-pressed={selected?.name === skill.name}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                    selected?.name === skill.name ? "border-glaze bg-glaze text-ink" : "border-line-strong text-bone",
                  )}
                >
                  {skill.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function TechStack() {
  const [selected, setSelected] = useState<Skill | null>(null);
  const wide = useMediaQuery("(min-width: 768px)", true);

  return (
    <section id="stack" className="container-x relative scroll-mt-24 overflow-x-clip py-24 md:py-32" aria-labelledby="stack-title">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          index="04"
          label="Stack"
          title="The ecosystem I work in."
          accent={["ecosystem"]}
          description="Not a list. Hover a technology to see how it is actually used and where."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            {wide ? <OrbitSystem selected={selected} onSelect={setSelected} /> : <CompactStack selected={selected} onSelect={setSelected} />}
          </div>
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SkillDetail skill={selected} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
