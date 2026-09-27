"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CanvasGate } from "@/components/3d/CanvasGate";
import { useIntro } from "@/components/ui/Intro";
import { ArrowIcon, MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { ResumeViewer } from "@/components/ui/ResumeViewer";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { Wordmark } from "@/components/ui/Wordmark";
import { profile } from "@/data/profile";
import { useMounted } from "@/lib/hooks/use-device";
import { ease } from "@/lib/motion";

const STATEMENT =
  "I build digital products that show their working: AI tools that cite their sources, security analysts that explain their verdicts, and simulations that compute every packet.";

/** CSS-only stand-in for the WebGL surface (reduced motion, low-end, no WebGL). */
function HeroFallback() {
  return (
    <div className="absolute inset-0 bg-ink">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 35%, rgb(255 45 26 / 0.10), transparent 70%), radial-gradient(45% 40% at 20% 80%, rgb(255 217 168 / 0.06), transparent 70%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}

function LocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {time || "--:--"}
    </span>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { done, prime } = useIntro();
  // Server HTML and the hydration render show the hero content (so it paints at first
  // paint, behind the intro overlay, and counts as LCP). Once mounted it snaps to hidden
  // and then plays its entrance when the curtain lifts.
  const mounted = useMounted();
  // With `font-display: block` the headline only paints once Archivo/Fraunces arrive, so
  // the snap-to-hidden waits for the fonts (plus a frame to paint). Behind the overlay this
  // is invisible; it just guarantees the first paint happens before the words are masked.
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) setFontsReady(true);
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const play = mounted && fontsReady ? done : true;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const markY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
      aria-label="Introduction"
    >
      {/* The WebGL surface waits until the intro is about to lift: one GPU context at a time. */}
      <CanvasGate scene="hero" scroll={scrollYProgress} fallback={<HeroFallback />} className="absolute inset-0" defer={!prime} />

      {/* Depth: vertical guide lines that sit between the surface and the type. */}
      <div aria-hidden className="container-x pointer-events-none absolute inset-0 z-[1]">
        <div className="mx-auto grid h-full max-w-[1500px] grid-cols-4 md:grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={i > 3 ? "hidden border-l border-line/40 md:block" : "border-l border-line/40"} />
          ))}
        </div>
      </div>

      <div className="container-x relative z-10 flex flex-1 flex-col justify-end pb-8 pt-[calc(var(--nav-height)+3vh)] sm:pb-10">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col">
          <motion.div style={{ y: markY }} className="w-full">
            {/* Fixed aspect box reserves the wordmark's space before it mounts (no layout shift). */}
            <motion.div
              className="aspect-[364/80] w-full text-bone"
              initial={{ opacity: 0 }}
              animate={{ opacity: done ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {done && (
                <div className="relative">
                  <Wordmark draw delay={0.1} duration={0.9} strokeWidth={7.5} />
                  {/* Sheen sweep: a second copy masked by the moving gradient. */}
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 text-glaze mix-blend-screen"
                    initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.9 }}
                    animate={{ clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)", "inset(0 0% 0 100%)"], opacity: [0.9, 0.9, 0] }}
                    transition={{ duration: 1.8, delay: 1.1, ease: ease.inOutQuart, times: [0, 0.55, 1] }}
                  >
                    <Wordmark strokeWidth={7.5} />
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            className="mt-8 grid min-h-[17rem] grid-cols-1 gap-8 md:mt-12 md:min-h-[12rem] md:grid-cols-12 md:items-end lg:mt-14"
          >
            <div className="md:col-span-7 lg:col-span-7">
              {/* Rendered visible in the server HTML (paints at first paint, behind the intro),
                  snapped hidden on hydration, then played once the curtain lifts. */}
              <Reveal play={play} delay={0.9} variant="fade">
                <p className="label-mono flex flex-wrap gap-x-3 gap-y-1">
                  {profile.roles.map((r, i) => (
                    <span key={r} className="flex items-center gap-3">
                      {i > 0 && <span aria-hidden className="h-px w-4 bg-bone-3/50" />}
                      <ScrambleText text={r} play={done} delay={1000 + i * 180} duration={1100} />
                    </span>
                  ))}
                </p>
              </Reveal>
              <RevealWords
                as="h1"
                play={play}
                delay={1.05}
                staggerDelay={0.028}
                text={STATEMENT}
                accent={["show", "their", "working:"]}
                className="mt-5 min-h-[8lh] max-w-[42rem] font-display text-[clamp(1.35rem,2.6vw,2.1rem)] font-medium leading-[1.2] tracking-[-0.02em] text-bone sm:min-h-[6lh]"
              />
            </div>
            <div className="md:col-span-5 md:flex md:justify-end">
              <Reveal play={play} delay={1.5} variant="fade">
                  <div className="flex flex-wrap gap-3">
                    <MagneticButton href="/#projects" icon={<ArrowIcon />} size="lg">
                      View projects
                    </MagneticButton>
                    <ResumeViewer>
                      <button
                        type="button"
                        className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full border border-line-strong px-8 font-mono text-xs uppercase tracking-[0.18em] text-bone transition-colors duration-500 hover:border-bone"
                      >
                        <span className="relative block overflow-hidden">
                          <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">
                            My resume
                          </span>
                          <span aria-hidden className="absolute left-0 top-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
                            My resume
                          </span>
                        </span>
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-glaze [animation:pulse-dot_2.4s_ease-out_infinite]" />
                      </button>
                    </ResumeViewer>
                  </div>
              </Reveal>
            </div>
          </motion.div>

          <motion.div
            className="mt-10 flex items-center justify-between border-t border-line pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-3 sm:text-[11px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: done ? 1 : 0 }}
            transition={{ delay: 1.9, duration: 0.8 }}
          >
            <span className="flex items-center gap-3">
              <span aria-hidden className="relative flex h-3 w-2 items-start justify-center overflow-hidden">
                <span className="h-full w-px bg-bone-3 [animation:scan_1.8s_ease-in-out_infinite]" />
              </span>
              Scroll
            </span>
            <span className="hidden sm:inline">{profile.name} — {profile.location}</span>
            <span>
              Mumbai <LocalTime />
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
