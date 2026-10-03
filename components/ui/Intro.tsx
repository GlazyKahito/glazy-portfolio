"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LETTERS, Wordmark } from "@/components/ui/Wordmark";
import { useDevice, useMounted } from "@/lib/hooks/use-device";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { inspectGpu, setLite, useLite } from "@/lib/capability";
import { getDeck } from "@/lib/deck";

/** Shortest time the countdown runs, even on a warm cache (s). */
const MIN_LOAD = 2.4;
/** Give up waiting for the footage and continue on its poster frame (s). */
const FOOTAGE_TIMEOUT = 20;
const TITLE_HOLD = 1.5;
const OPENING = 2.6;

interface IntroContextValue {
  /** True once the opening has finished (or was skipped). */
  done: boolean;
}

const IntroContext = createContext<IntroContextValue>({ done: true });

export function useIntro() {
  return useContext(IntroContext);
}

type Phase = "loading" | "title" | "opening";

function Timecode({ run }: { run: boolean }) {
  const [frames, setFrames] = useState(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const id = window.setInterval(() => setFrames(Math.floor(((performance.now() - start) / 1000) * 24)), 42);
    return () => window.clearInterval(id);
  }, [run]);
  const f = frames % 24;
  const s = Math.floor(frames / 24) % 60;
  return (
    <span className="tabular-nums">
      00:00:{String(s).padStart(2, "0")}:{String(f).padStart(2, "0")}
    </span>
  );
}

/**
 * The loader's centrepiece: the GLAZY wordmark filling with liquid glaze.
 * The level is the real loading progress; a slow wave rolls across its
 * surface, and a hot line glows where the glaze meets the empty stroke.
 */
function GlazeMark({ progress }: { progress: number }) {
  // viewBox is the wordmark's 364×80 grid plus room for the stroke.
  const top = -8;
  const bottom = 88;
  const level = bottom - (bottom - top) * progress;
  const p = Math.min(1, Math.max(0, progress));
  return (
    <svg viewBox="-8 -8 380 96" className="w-[min(82vw,720px)] overflow-visible" role="img" aria-label={`GLAZY, ${Math.round(progress * 100)} percent loaded`}>
      <defs>
        {/* A hard edge at the fill level: glaze below, nothing above. User-space, so thin strokes still fill. */}
        <linearGradient id="glaze-fill" gradientUnits="userSpaceOnUse" x1="0" y1={bottom} x2="0" y2={top}>
          <stop offset="0" stopColor="#9e1008" />
          <stop offset={p * 0.55} stopColor="#ff2d1a" />
          <stop offset={Math.max(0, p - 0.02)} stopColor="#ff8a3d" />
          <stop offset={p} stopColor="#ffd9a8" />
          <stop offset={p} stopColor="#ffd9a8" stopOpacity="0" />
          <stop offset="1" stopColor="#ffd9a8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* The empty mould. */}
      {LETTERS.map((l, i) => (
        <path key={`m${i}`} d={l.d} transform={`translate(${l.x} 0)`} fill="none" stroke="rgb(245 245 247 / 0.14)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {/* The glaze. */}
      {LETTERS.map((l, i) => (
        <path
          key={`g${i}`}
          d={l.d}
          transform={`translate(${l.x} 0)`}
          fill="none"
          stroke="url(#glaze-fill)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 10px rgb(255 90 30 / 0.45))" }}
        />
      ))}
      {/* The molten surface. */}
      {p > 0.01 && p < 0.999 && (
        <g className="[animation:glaze-wave_2.4s_linear_infinite]">
          <path
            d={`M -48 ${level} q 10 -2.4 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0`}
            fill="none"
            stroke="#ffb27a"
            strokeWidth={0.7}
            opacity={0.55}
            style={{ filter: "drop-shadow(0 0 4px #ff6a2a)" }}
          />
        </g>
      )}
    </svg>
  );
}

/**
 * GLAZY's opening, as a film would open.
 *
 * 1. A film leader counts down while the site genuinely loads: the fonts,
 *    then the opening scene's 4K planes. The count is tied to real
 *    progress, never faked ahead of it.
 * 2. The device check: if graphics run without hardware acceleration, or
 *    the connection is slow or on data saver, it says so plainly and offers
 *    the lite version. Otherwise everyone gets the full 4K experience.
 * 3. A flash, the title card between letterbox bars over the live footage,
 *    then the bars open, and only once they have fully opened do the
 *    headline and buttons rise in.
 *
 * The skip button or Escape goes straight in.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const { pending } = useDevice();
  const lite = useLite();
  const mounted = useMounted();

  const [show, setShow] = useState<boolean>(isHome);
  const [done, setDone] = useState(!isHome);
  const [phase, setPhase] = useState<Phase>("loading");
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("Starting the projector");
  const [acknowledged, setAcknowledged] = useState(false);
  const finishedRef = useRef(false);
  const timers = useRef<number[]>([]);

  const report = mounted ? inspectGpu() : null;
  const serious = !!report && report.serious;

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    timers.current.forEach((t) => window.clearTimeout(t));
    setShow(false);
    setDone(true);
    document.documentElement.dataset.introDone = "true";
  }, []);

  // Reduced motion: no opening sequence.
  useEffect(() => {
    if (reduce) finish();
  }, [reduce, finish]);

  // Keep scrolling locked while the opening plays.
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
    if (show && !finishedRef.current) lenis?.stop();
  }, [lenis, show]);
  useEffect(() => {
    if (done) lenis?.start();
  }, [done, lenis]);

  // 1. Loading: measure real progress every frame.
  const fontsRef = useRef(false);
  useEffect(() => {
    document.fonts?.ready.then(() => {
      fontsRef.current = true;
    });
  }, []);
  useEffect(() => {
    if (!show || reduce || phase !== "loading" || pending) return;
    const start = performance.now();
    let raf = 0;
    let shown = 0;
    let lastLabel = "";
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const a = getDeck().assets;
      const footage = Math.min(1, a.loaded / Math.max(1, a.total));
      let target = (fontsRef.current ? 0.25 : Math.min(0.2, t * 0.1)) + 0.75 * footage;
      const text = !fontsRef.current
        ? "Setting the type"
        : footage < 1
          ? lite
            ? "Loading the opening frame"
            : "Loading the opening scene · 4K"
          : "Threading the reel";
      // Never faster than the minimum run, never ahead of the truth.
      target = Math.min(target, t / MIN_LOAD);
      shown += (target - shown) * 0.12;
      if (target >= 0.999 && shown > 0.985) shown = 1;
      const timedOut = t > FOOTAGE_TIMEOUT;
      if (timedOut) shown = 1;
      setProgress(shown);
      if (text !== lastLabel) {
        lastLabel = text;
        setLabel(text);
      }
      if (shown >= 1) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show, reduce, phase, pending, lite]);

  // 2 + 3. Title, then opening. Waits for the visitor if the device check found a real problem.
  const blocked = serious && !acknowledged;
  useEffect(() => {
    if (!show || reduce || phase !== "loading" || progress < 1 || blocked) return;
    const t1 = window.setTimeout(() => setPhase("title"), 250);
    timers.current.push(t1);
    return () => window.clearTimeout(t1);
  }, [show, reduce, phase, progress, blocked]);

  useEffect(() => {
    if (phase !== "title") return;
    const t = window.setTimeout(() => setPhase("opening"), TITLE_HOLD * 1000);
    timers.current.push(t);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "opening") return;
    // The kingfisher rule: nothing on the page moves until the bars have fully opened.
    const t1 = window.setTimeout(() => {
      setDone(true);
      document.documentElement.dataset.introDone = "true";
    }, OPENING * 0.85 * 1000);
    const t2 = window.setTimeout(() => {
      finishedRef.current = true;
      setShow(false);
    }, (OPENING + 0.3) * 1000);
    timers.current.push(t1, t2);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [phase]);

  // Skip on Escape.
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, finish]);

  const value = useMemo(() => ({ done }), [done]);
  const opening = phase === "opening";
  const titled = phase !== "loading";

  return (
    <IntroContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[110] overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            role="dialog"
            aria-modal="true"
            aria-label="Loading GLAZY"
          >
            {/* Black stage while loading; over the footage only the letterbox bars stay. */}
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-black"
              initial={false}
              animate={{ opacity: titled ? 0 : 1 }}
              transition={{ duration: 0.9, ease: ease.outQuart }}
            />
            <motion.div
              aria-hidden
              className="absolute inset-x-0 top-0 bg-black"
              initial={false}
              animate={{ height: opening ? "0vh" : "13vh" }}
              transition={{ duration: 1.6, ease: ease.inOutQuart }}
            />
            <motion.div
              aria-hidden
              className="absolute inset-x-0 bottom-0 bg-black"
              initial={false}
              animate={{ height: opening ? "0vh" : "13vh" }}
              transition={{ duration: 1.6, ease: ease.inOutQuart }}
            />
            {/* The opening scene develops behind the mark, like a print in the darkroom. */}
            {!titled && (
              <div aria-hidden className="absolute inset-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative, must paint immediately */}
                <img
                  src="/scenes/glazy-poster.jpg"
                  alt=""
                  className="absolute inset-0 h-full w-full scale-110 object-cover"
                  style={{ opacity: 0.08 + progress * 0.5, filter: `blur(${36 - progress * 26}px) saturate(${0.3 + progress * 0.9})`, transition: "opacity 0.4s, filter 0.4s" }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgb(0_0_0/0.85)_75%)]" />
              </div>
            )}

            {/* Flash at the cut from leader to title. */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-bone"
              initial={false}
              animate={{ opacity: phase === "title" ? [0, 0.9, 0] : 0 }}
              transition={{ duration: 0.7, times: [0, 0.12, 1] }}
            />

            {/* Corner slate. */}
            <div className="absolute inset-x-0 top-0 flex justify-between px-[var(--gutter)] pt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-bone/60 sm:text-[11px]">
              <span>GLAZY · Reel 01</span>
              {!titled && <Timecode run={show} />}
              <span className="hidden sm:inline">Krutik Mhatre</span>
            </div>

            <AnimatePresence mode="wait">
              {!titled ? (
                <motion.div
                  key="leader"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-10 pb-24"
                  exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
                  transition={{ duration: 0.5 }}
                >
                  <GlazeMark progress={progress} />
                  <div className="flex w-[min(82vw,720px)] items-end justify-between gap-6">
                    <span className="max-w-[70%] truncate font-mono text-[11px] uppercase tracking-[0.2em] text-bone-2" aria-live="polite">
                      {label}
                    </span>
                    <span className="font-display text-5xl leading-none tabular-nums text-bone md:text-6xl">
                      {Math.round(progress * 100)}
                      <span className="text-2xl text-bone-2">%</span>
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="title"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: opening ? 0 : 1, y: opening ? -30 : 0, filter: opening ? "blur(10px)" : "blur(0px)" }}
                  transition={{ duration: opening ? 1.2 : 0.6, ease: ease.outQuart, delay: opening ? 0.4 : 0.15 }}
                >
                  <div className="w-[min(70vw,460px)] text-bone">
                    <Wordmark draw delay={0.15} duration={0.8} strokeWidth={7} />
                  </div>
                  <p className="font-display text-2xl italic text-bone/90 md:text-3xl">A web studio by Krutik Mhatre</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Device notes. */}
            {!titled && report && (
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-[var(--gutter)] pb-6">
                {report.concerns.length > 0 ? (
                  <div
                    className={cn(
                      "w-full max-w-[560px] rounded-xl border px-5 py-4 text-left",
                      serious ? "border-[#ffb35c]/60 bg-[#1a1208]/90" : "border-line-strong bg-ink/70",
                    )}
                  >
                    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#ffc98f]">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#ffb35c]" />
                      Heads up: your device may not show this site correctly
                    </p>
                    <ul className="mt-2 flex flex-col gap-1 text-sm leading-relaxed text-bone-2">
                      {report.concerns.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    {serious && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setAcknowledged(true)}
                          className="rounded-full bg-bone px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-glaze hover:text-bone"
                        >
                          Continue anyway
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLite(true);
                            setAcknowledged(true);
                          }}
                          className="rounded-full border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone"
                        >
                          Use the lite version
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/45">
                    Best in a desktop browser with hardware acceleration
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={finish}
              className="absolute right-[var(--gutter)] top-12 rounded-full border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-2 transition-colors hover:border-bone hover:text-bone"
            >
              Skip intro
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
