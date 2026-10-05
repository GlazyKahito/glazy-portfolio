"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { TransitionLink } from "@/components/ui/PageTransition";
import { PUZZLE_DONE, PuzzleImage } from "@/components/scenes/PuzzleImage";
import { RevealWords } from "@/components/ui/Reveal";
import { featuredProjects } from "@/data/projects";
import { useDevice } from "@/lib/hooks/use-device";
import { ease } from "@/lib/motion";
import type { Project } from "@/lib/types";
import { cn, prettyUrl, tint } from "@/lib/utils";

const STATUS: Record<Project["status"], string> = {
  live: "Live",
  shipped: "Shipped",
  "in-progress": "In progress",
  archived: "Archived",
};

/** A browser window (its screen assembling like a jigsaw) and a phone, tilting toward the pointer with a moving glare. */
function Stage({ project, play }: { project: Project; play: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { touch, reducedMotion } = useDevice();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [7, -7]), { stiffness: 90, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-9, 9]), { stiffness: 90, damping: 18 });
  const glareX = useTransform(mx, [-1, 1], ["20%", "80%"]);
  const glareY = useTransform(my, [-1, 1], ["10%", "70%"]);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(40% 50% at ${x} ${y}, rgb(255 255 255 / 0.16), transparent 70%)`);
  const tilt = !touch && !reducedMotion;
  const url = project.live ?? project.github;

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[min(860px,92vh)] [perspective:1600px]"
      onPointerMove={(e) => {
        if (!tilt || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        initial={false}
        animate={play ? { opacity: 1, y: 0, rotateZ: 0, scale: 1 } : { opacity: 0, y: 60, rotateZ: -1.5, scale: 0.96 }}
        transition={{ duration: 1.3, ease: ease.outExpo, delay: play ? 0.15 : 0 }}
        className="relative"
      >
        {/* Colour spill from the project's hue, kept in the warm band (the scene clips it at the screen's edge).
            Soft by gradient, not by a blur filter: cheaper to draw, and lite mode (no filters) keeps it soft. */}
        <div
          aria-hidden
          className="absolute -inset-x-6 -bottom-24 top-0 -z-10 opacity-70 sm:-inset-x-24"
          style={{ background: `radial-gradient(closest-side, ${tint(project.hue, 80, 50, 0.38)}, ${tint(project.hue, 80, 50, 0.14)} 55%, transparent)` }}
        />

        {/* Browser window. */}
        {/* No overflow clipping here: the puzzle pieces fly in from outside the window. */}
        <div className="rounded-[18px] border border-white/15 bg-ink-2/90 shadow-[0_50px_120px_-30px_rgb(0_0_0/0.9)] backdrop-blur-xl [transform-style:preserve-3d]">
          <div className="flex h-9 items-center gap-3 rounded-t-[17px] border-b border-white/10 bg-white/[0.04] px-4">
            {/* Window controls in the palette's own warm greys, as on the case-study frames. */}
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-bone-3/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-bone-3/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-bone-3/25" />
            </span>
            <span className="mx-auto flex h-6 min-w-[45%] max-w-[65%] items-center justify-center gap-2 truncate rounded-md bg-white/[0.06] px-3 font-sans text-[11px] text-bone-2">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 shrink-0 opacity-70" aria-hidden>
                <path d="M3 5V3.5a3 3 0 0 1 6 0V5M2.5 5h7v5.5h-7z" fill="none" stroke="currentColor" strokeWidth="1.1" />
              </svg>
              {url ? prettyUrl(url) : project.title}
            </span>
            <span className="w-12" />
          </div>
          <PuzzleImage src={project.image.src} alt={project.image.alt} seed={project.slug} play={play} sizes="(min-width: 1024px) 55vw, 92vw">
            <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} />
          </PuzzleImage>
        </div>

        {/* Phone, its screen slowly scrolling the mobile capture. It overhangs the window only on
            wide screens, where the copy column leaves room; on tablets it stays inside the frame. */}
        {project.mobileImage && (
          <motion.div
            className="absolute -bottom-10 left-2 hidden w-[23%] min-w-[110px] sm:block lg:-left-10"
            style={{ transform: "translateZ(60px)" }}
            initial={false}
            animate={play ? { opacity: 1, y: 0, rotate: -5 } : { opacity: 0, y: 50, rotate: 0 }}
            transition={{ duration: 1.1, ease: ease.outExpo, delay: play ? PUZZLE_DONE - 0.4 : 0 }}
          >
            <div className="overflow-hidden rounded-[26px] border-[5px] border-ink-4 bg-black shadow-[0_30px_70px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
              <div className="relative aspect-[390/760] overflow-hidden">
                <Image
                  src={project.mobileImage.src}
                  alt={project.mobileImage.alt}
                  fill
                  sizes="180px"
                  quality={80}
                  className="object-cover [animation:phone-scroll_14s_ease-in-out_infinite_alternate]"
                />
                <div aria-hidden className="absolute left-1/2 top-1.5 h-4 w-14 -translate-x-1/2 rounded-full bg-black" />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export function ProjectScene({ project, index, play }: { project: Project; index: number; play: boolean }) {
  const href = project.caseStudy === false ? (project.live ?? project.github ?? "/") : `/projects/${project.slug}`;
  const fade = (d: number) => ({
    initial: false as const,
    animate: play ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.9, ease: ease.outExpo, delay: play ? d : 0 },
  });

  return (
    // overflow-x-clip: the window's glow and the phone may overhang the frame, but never widen the scene.
    <div className="container-x relative flex min-h-full items-center overflow-x-clip pb-[var(--dock-clear)] pt-[calc(var(--nav-height)+1rem)] md:pr-[max(var(--gutter),4.5rem)] lg:pt-[calc(var(--nav-height)+0.5rem)]">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div data-copy-wrap className="order-2 lg:order-1 lg:col-span-5">
          <motion.p {...fade(0.05)} className="legible flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/80">
            <span className="tabular-nums text-bone">{String(index + 1).padStart(2, "0")}</span>
            <span className="h-px w-6 bg-bone/40" />
            <span className="tabular-nums">{String(featuredProjects.length).padStart(2, "0")}</span>
            <span className="ml-2">{project.category}</span>
          </motion.p>
          <RevealWords
            as="h2"
            play={play}
            delay={0.1}
            text={project.title}
            className="legible mt-4 font-display text-[clamp(2.8rem,min(6.6vw,11vh),6.8rem)] leading-[0.9] tracking-[-0.03em] text-bone"
          />
          <motion.p {...fade(0.35)} className="legible mt-4 font-display text-2xl italic leading-snug text-bone/90 md:text-[1.75rem]">
            {project.tagline}
          </motion.p>
          <motion.p {...fade(0.45)} className="legible mt-5 max-w-[46ch] text-[15px] leading-relaxed text-bone/80">
            {project.description}
          </motion.p>

          <motion.dl {...fade(0.55)} className="legible mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">Status</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm text-bone">
                <span className={cn("h-1.5 w-1.5 rounded-full bg-glaze", project.status === "live" && "pulse-dot")} />
                {STATUS[project.status]}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">Year</dt>
              <dd className="mt-1 text-sm text-bone">{project.year}</dd>
            </div>
            <div className="min-w-0 flex-1">
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">Built with</dt>
              <dd className="mt-1 truncate text-sm text-bone">{project.technologies.slice(0, 4).join(" · ")}</dd>
            </div>
          </motion.dl>

          <motion.div {...fade(0.65)} className="mt-7 flex flex-wrap items-center gap-3">
            <TransitionLink
              href={href}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink transition-[background-color,transform] duration-300 hover:scale-[1.03] hover:bg-white"
            >
              Open case study <ArrowUpRight />
            </TransitionLink>
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 text-sm text-bone backdrop-blur-xl transition-colors hover:bg-white/[0.12]"
              >
                Live site <ArrowUpRight />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 text-sm text-bone backdrop-blur-xl transition-colors hover:bg-white/[0.12]"
              >
                Watch the demo <ArrowUpRight />
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer noopener"
                className="legible inline-flex h-12 items-center gap-2 rounded-full px-3 text-sm text-bone/80 transition-colors hover:text-bone"
              >
                Code <ArrowUpRight />
              </a>
            )}
          </motion.div>
        </div>

        <div data-stage-wrap className="order-1 [transform-style:preserve-3d] lg:order-2 lg:col-span-7">
          <Stage project={project} play={play} />
        </div>
      </div>
    </div>
  );
}
