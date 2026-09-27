"use client";

import { useLenis } from "lenis/react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserFrame, PhoneFrame } from "@/components/projects/Frames";
import { ArrowIcon, ArrowUpRight } from "@/components/ui/MagneticButton";
import { TransitionLink, useTransition } from "@/components/ui/PageTransition";
import { projectNumber, projects } from "@/data/projects";
import { useMediaQuery } from "@/lib/hooks/use-device";
import type { Project } from "@/lib/types";
import { ease } from "@/lib/motion";
import { clamp, cn, hsl } from "@/lib/utils";

const STATUS_LABEL: Record<Project["status"], string> = {
  live: "Live",
  shipped: "Shipped",
  "in-progress": "In progress",
  archived: "Archived",
};

const N = projects.length;
/** Extra viewport heights of scroll per project step. */
const STEP_VH = 70;

/* ------------------------------------------------------------------ */
/* Wheel card                                                           */
/* ------------------------------------------------------------------ */
function WheelCard({
  project,
  index,
  position,
  active,
  onSelect,
}: {
  project: Project;
  index: number;
  position: MotionValue<number>;
  active: boolean;
  onSelect: (index: number) => void;
}) {
  const d = useTransform(position, (p) => index - p);
  const x = useTransform(d, (v) => `${v * 46}vw`);
  const rotateY = useTransform(d, (v) => clamp(-v * 18, -48, 48));
  const z = useTransform(d, (v) => -Math.abs(v) * 260);
  const scale = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 3) * 0.06);
  const opacity = useTransform(d, (v) => clamp(1 - (Math.abs(v) - 0.35) * 0.75, 0, 1));
  const zIndex = useTransform(d, (v) => 100 - Math.round(Math.abs(v) * 10));
  const { navigate } = useTransition();
  const tint = `linear-gradient(160deg, ${hsl(project.hue, 70, 60, 0.32)}, transparent 60%)`;

  return (
    <div className="absolute left-1/2 top-1/2 w-[min(58vw,880px)] -translate-x-1/2 -translate-y-1/2">
      <motion.div
        style={{ x, rotateY, z, scale, opacity, zIndex, transformStyle: "preserve-3d" }}
        className="relative"
      >
        <a
          href={`/projects/${project.slug}`}
          aria-label={active ? `Open ${project.title}` : `Show ${project.title}`}
          aria-current={active ? "true" : undefined}
          data-cursor="view"
          data-cursor-label={active ? "Open" : "View"}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            if (active) navigate(`/projects/${project.slug}`);
            else onSelect(index);
          }}
          className="group relative block outline-none focus-visible:ring-2 focus-visible:ring-glaze"
          tabIndex={active ? 0 : -1}
        >
          {/* Glow plate */}
          <motion.div
            aria-hidden
            className="absolute -inset-x-10 -bottom-12 top-10 -z-10 rounded-[100%] blur-3xl"
            style={{ background: hsl(project.hue, 70, 55, 0.35) }}
            animate={{ opacity: active ? 1 : 0.25 }}
            transition={{ duration: 0.8 }}
          />
          <BrowserFrame
            image={project.image}
            url={project.live ?? project.github}
            tint={tint}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className={cn("transition-[border-color] duration-700", active ? "border-bone/30" : "border-line")}
          />
          {project.mobileImage && (
            <motion.div
              className="absolute -bottom-8 -right-6 w-[21%] lg:-right-10"
              initial={false}
              animate={active ? { opacity: 1, y: 0, rotate: -6, scale: 1 } : { opacity: 0, y: 30, rotate: 0, scale: 0.92 }}
              transition={{ duration: 0.9, ease: ease.outExpo, delay: active ? 0.15 : 0 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <PhoneFrame image={project.mobileImage} sizes="14vw" />
            </motion.div>
          )}
          {/* Number tag */}
          <span className="absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-ink font-mono text-[11px] text-bone">
            {projectNumber(project)}
          </span>
        </a>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop wheel                                                        */
/* ------------------------------------------------------------------ */
function Wheel() {
  const runway = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const { scrollYProgress } = useScroll({ target: runway, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, [0, 1], [0, N - 1]);
  const position = useSpring(raw, { stiffness: 90, damping: 22, mass: 0.6 });
  const [active, setActive] = useState(0);

  useMotionValueEvent(raw, "change", (v) => setActive(clamp(Math.round(v), 0, N - 1)));

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = runway.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const travel = el.offsetHeight - window.innerHeight;
      const y = top + (clamp(index, 0, N - 1) / (N - 1)) * travel;
      if (lenis) lenis.scrollTo(y, { duration: 1.1 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    },
    [lenis],
  );

  // Arrow keys move the wheel while it is on screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = runway.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top > 0 || r.bottom < window.innerHeight) return;
      if (e.key === "ArrowRight") scrollToIndex(active + 1);
      if (e.key === "ArrowLeft") scrollToIndex(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, scrollToIndex]);

  const project = projects[active];

  return (
    <div ref={runway} className="relative" style={{ height: `calc(100vh + ${(N - 1) * STEP_VH}vh)` }}>
      <div className="sticky top-0 flex h-[100vh] flex-col overflow-hidden">
        {/* Top rail */}
        <div className="container-x flex items-center justify-between pt-24">
          <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between">
            <span className="label-mono">
              Exhibition <span className="mx-1 text-bone-3/60">/</span>{" "}
              <span className="text-bone tabular-nums">{String(active + 1).padStart(2, "0")}</span>
              <span className="text-bone-3/60"> — {String(N).padStart(2, "0")}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollToIndex(active - 1)}
                disabled={active === 0}
                aria-label="Previous project"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-bone transition-colors hover:border-bone disabled:opacity-30"
              >
                <ArrowIcon className="rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => scrollToIndex(active + 1)}
                disabled={active === N - 1}
                aria-label="Next project"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-bone transition-colors hover:border-bone disabled:opacity-30"
              >
                <ArrowIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Wheel */}
        <div className="relative flex-1 [perspective:1800px]">
          {projects.map((p, i) => (
            <WheelCard key={p.id} project={p} index={i} position={position} active={i === active} onSelect={scrollToIndex} />
          ))}
        </div>

        {/* Caption */}
        <div className="container-x pb-10">
          <div className="mx-auto grid w-full max-w-[1500px] items-end gap-6 border-t border-line pt-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: ease.outQuart }}
                >
                  <h3 className="font-display text-display-sm font-semibold leading-none tracking-[-0.03em] text-bone">
                    {project.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-bone-2">{project.tagline}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-5 md:justify-end">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={project.id}
                  className="flex flex-wrap items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="label-mono">{project.category}</span>
                  <span aria-hidden className="h-px w-3 bg-bone-3/50" />
                  <span className="label-mono">{project.year}</span>
                  <span aria-hidden className="h-px w-3 bg-bone-3/50" />
                  <span className="label-mono flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rounded-full", project.status === "live" ? "bg-glaze" : "bg-bone-3")} />
                    {STATUS_LABEL[project.status]}
                  </span>
                </motion.div>
              </AnimatePresence>
              <TransitionLink
                href={`/projects/${project.slug}`}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-bone px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-glaze"
              >
                Open project <ArrowUpRight />
              </TransitionLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile: snap carousel                                                */
/* ------------------------------------------------------------------ */
function Carousel() {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth * 0.86;
      setActive(clamp(Math.round(el.scrollLeft / w), 0, N - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      <ul
        ref={track}
        className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4"
        aria-label="Projects"
      >
        {projects.map((p) => (
          <li key={p.id} className="w-[86%] shrink-0 snap-center">
            <TransitionLink href={`/projects/${p.slug}`} className="block">
              <div className="relative">
                <BrowserFrame
                  image={p.image}
                  url={p.live ?? p.github}
                  sizes="86vw"
                  tint={`linear-gradient(160deg, ${hsl(p.hue, 70, 60, 0.32)}, transparent 60%)`}
                />
                {p.mobileImage && (
                  <div className="absolute -bottom-5 -right-2 w-[24%] rotate-[-6deg]">
                    <PhoneFrame image={p.mobileImage} sizes="24vw" />
                  </div>
                )}
              </div>
              <div className="mt-8 flex items-baseline gap-3">
                <span className="font-mono text-xs text-glaze">{projectNumber(p)}</span>
                <h3 className="font-display text-2xl font-semibold leading-none tracking-[-0.03em] text-bone">{p.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-bone-2">{p.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="label-mono">{p.category}</span>
                <span aria-hidden className="h-px w-3 bg-bone-3/50" />
                <span className="label-mono">{p.year}</span>
              </div>
            </TransitionLink>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between">
        <span className="label-mono tabular-nums">
          {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5" aria-hidden>
          {projects.map((p, i) => (
            <span key={p.id} className={cn("h-1 rounded-full transition-all duration-500", i === active ? "w-6 bg-bone" : "w-2 bg-bone-3/50")} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectShowcase() {
  const wide = useMediaQuery("(min-width: 1024px)", true);
  return wide ? <Wheel /> : <Carousel />;
}
