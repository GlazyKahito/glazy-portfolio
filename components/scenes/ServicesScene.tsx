"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { useEffect, useState } from "react";
import { Kicker, PillCTA, Rise } from "@/components/scenes/ChapterScenes";
import { TransitionLink } from "@/components/ui/PageTransition";
import { getProject } from "@/data/projects";
import { services } from "@/data/services";
import { gotoChapter } from "@/lib/deck";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** How long each service holds the poster before the next one takes it. */
const CYCLE = 5200;

const word: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.018 } },
};
const letter: Variants = {
  // Transform and opacity only: blurring 30vh glyphs letter by letter costs a repaint every frame.
  hidden: { y: "105%", opacity: 0 },
  show: { y: "0%", opacity: 1, transition: { duration: 1, ease: ease.outExpo } },
  exit: { y: "-35%", opacity: 0, transition: { duration: 0.32, ease: ease.inOutQuart } },
};
const copy: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: ease.outExpo, delay: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

/** Every word set to the same height where there is room; long words shrink to fit their column (cqw). */
const wordSize = (w: string) => `min(30vh, ${(100 / (w.length * 0.6)).toFixed(2)}cqw)`;

/**
 * 01 · What we make. A film-poster layout: the service as a giant word in
 * cream across the frame, a frosted strip of the services across
 * the top, and the details beside the word. The poster turns over on its
 * own until the visitor picks one.
 */
export function ServicesScene({ play }: { play: boolean }) {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hold, setHold] = useState(false);
  const service = services[index];
  const proof = service.proof ? getProject(service.proof) : undefined;
  const running = play && auto && !hold;

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setIndex((n) => (n + 1) % services.length), CYCLE);
    return () => window.clearTimeout(t);
  }, [running, index]);

  return (
    <div className="container-x relative flex min-h-full flex-col pb-28 pt-[calc(var(--nav-height)+0.25rem)]">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col">
        <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
          <Kicker number="01" label="What we make" play={play} />
          <h2 className="sr-only">What we make</h2>
          <Rise play={play} delay={0.25} className="max-w-full">
            <div
              role="group"
              aria-label="Services"
              onPointerEnter={() => setHold(true)}
              onPointerLeave={() => setHold(false)}
              onFocus={() => setHold(true)}
              onBlur={() => setHold(false)}
              className="no-scrollbar flex max-w-full overflow-x-auto rounded-full border border-white/10 bg-black/45 p-1 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.7)] backdrop-blur-xl"
            >
              {services.map((s, n) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={n === index}
                  aria-controls="service-detail"
                  onClick={() => {
                    setIndex(n);
                    setAuto(false);
                  }}
                  className={cn(
                    "relative shrink-0 rounded-full px-4 py-2.5 text-[13px] transition-colors duration-300",
                    n === index ? "text-cream" : "text-cream/60 hover:text-cream",
                  )}
                >
                  {n === index && (
                    <motion.span layoutId="service-pill" className="absolute inset-0 rounded-full bg-white/[0.11]" transition={{ duration: 0.6, ease: ease.outExpo }} />
                  )}
                  <span className="relative">{s.title}</span>
                  {n === index && running && (
                    <motion.span
                      key={`timer-${index}`}
                      aria-hidden
                      className="absolute inset-x-4 bottom-1 h-px origin-left bg-cream/60"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: CYCLE / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </Rise>
        </div>

        {/* Centred in the space under the strip, so the poster balances at any size. */}
        <div className="my-auto grid gap-8 pt-10 lg:grid-cols-12 lg:items-end">
          {/* The poster word. Decorative: the service's name is read from the strip and the details. */}
          <div className="min-w-0 [container-type:inline-size] lg:col-span-8" aria-hidden>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={service.id}
                variants={word}
                initial="hidden"
                animate={play ? "show" : "hidden"}
                exit="exit"
                className="flex overflow-hidden whitespace-nowrap pb-[0.1em] font-sans font-semibold leading-[0.84] tracking-[-0.065em] text-cream [text-shadow:0_10px_60px_rgb(0_0_0/0.25)]"
                style={{ fontSize: wordSize(service.word) }}
              >
                {Array.from(service.word).map((ch, i) => (
                  <motion.span key={i} variants={letter} className="inline-block whitespace-pre">
                    {ch}
                  </motion.span>
                ))}
              </motion.p>
            </AnimatePresence>
          </div>

          <div id="service-detail" aria-live="polite" className="lg:col-span-4 lg:pb-[1.2vh] [text-shadow:0_1px_14px_rgb(0_0_0/0.5)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={service.id} variants={copy} initial="hidden" animate={play ? "show" : "hidden"} exit="exit">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream">{service.title}</h3>
                <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-cream/85">{service.body}</p>
                <ul className="mt-4 flex flex-col gap-2">
                  {service.includes.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[13px] text-cream/75">
                      <span aria-hidden className="h-px w-4 bg-cream/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
            <Rise play={play} delay={0.6} className="mt-6 flex flex-wrap items-center gap-4">
              <PillCTA onClick={() => gotoChapter("contact")}>Start a project</PillCTA>
              {proof && (
                <TransitionLink href={`/projects/${proof.slug}`} className="text-sm text-cream/80 underline-offset-4 transition-colors hover:text-cream hover:underline">
                  See it in {proof.title}
                </TransitionLink>
              )}
            </Rise>
          </div>
        </div>
      </div>
    </div>
  );
}
