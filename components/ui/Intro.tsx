"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import dynamic from "next/dynamic";
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
import type { WarpClock } from "@/components/3d/WarpIntro";
import { Wordmark } from "@/components/ui/Wordmark";
import { useDevice } from "@/lib/hooks/use-device";
import { ease } from "@/lib/motion";

const WarpIntro = dynamic(() => import("@/components/3d/WarpIntro").then((m) => m.WarpIntro), {
  ssr: false,
  loading: () => null,
});

/** Total time the overlay stays before the curtain lifts (ms). */
const INTRO_MS = 3000;
/** Shorter sequence when the warp tunnel cannot run. */
const INTRO_STATIC_MS = 2200;
/** How long before the curtain lifts the hero scene should start warming up (ms). */
const PRIME_LEAD_MS = 1100;

interface IntroContextValue {
  /** True once the opening sequence has finished (or was skipped). */
  done: boolean;
  /** True shortly before the curtain lifts: heavy hero work may start. */
  prime: boolean;
}

const IntroContext = createContext<IntroContextValue>({ done: true, prime: true });

export function useIntro() {
  return useContext(IntroContext);
}

/**
 * Opening sequence, after the DCN Virtual Lab boot: a warp tunnel of light
 * streaks accelerates, collapses onto the vanishing point, the wordmark
 * traces itself, and the curtain lifts into the hero.
 *
 * The overlay is part of the server HTML on the home page so the hero
 * underneath paints at first paint (LCP) while the sequence plays on top.
 * Click, Escape, Enter or Space skips it. Reduced motion skips it entirely.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const { webgl, tier, pending } = useDevice();
  const warp = !pending && webgl && tier !== "low";
  const total = warp ? INTRO_MS : INTRO_STATIC_MS;

  const [show, setShow] = useState<boolean>(isHome);
  const [done, setDone] = useState(!isHome);
  const [prime, setPrime] = useState(!isHome);
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const finishedRef = useRef(false);
  const clock = useRef<WarpClock>({ t: 0 });

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setShow(false);
    setDone(true);
    setPrime(true);
    document.documentElement.dataset.introDone = "true";
  }, []);

  // Reduced motion: drop the overlay as soon as we know.
  useEffect(() => {
    if (reduce) finish();
  }, [reduce, finish]);

  // Keep the latest Lenis instance without restarting the sequence when it arrives.
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
    if (show && !finishedRef.current) lenis?.stop();
  }, [lenis, show]);

  // Run the sequence: drive the warp clock, the counter, the flash and the prime signal.
  useEffect(() => {
    if (!show || reduce) return;
    lenisRef.current?.stop();
    const start = performance.now();
    let raf = 0;
    let flashed = false;
    let primed = false;
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      clock.current.t = elapsed;
      const t = Math.min(1, elapsed / ((total - 700) / 1000));
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (warp && !flashed && elapsed > 1.8) {
        flashed = true;
        setFlash(true);
      }
      if (!primed && elapsed * 1000 > total - PRIME_LEAD_MS) {
        primed = true;
        setPrime(true);
      }
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const timer = window.setTimeout(finish, total);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [show, reduce, finish, total, warp]);

  // Skip on keyboard.
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, finish]);

  // Release scroll once the curtain has left.
  useEffect(() => {
    if (done) lenis?.start();
  }, [done, lenis]);

  const value = useMemo(() => ({ done, prime }), [done, prime]);
  const markDelay = warp ? 1.35 : 0.15;

  return (
    <IntroContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[110] overflow-hidden bg-ink"
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.95, ease: ease.inOutQuart }}
            onClick={finish}
            role="presentation"
          >
            <div aria-hidden className="absolute inset-0">
              {warp && <WarpIntro clock={clock} />}

              {/* Collapse flash */}
              <motion.div
                className="pointer-events-none absolute inset-0 bg-bone"
                initial={{ opacity: 0 }}
                animate={{ opacity: flash ? [0, 0.85, 0] : 0 }}
                transition={{ duration: 0.7, times: [0, 0.15, 1], ease: "easeOut" }}
              />

              <div className="container-x relative flex h-full w-full flex-col items-center justify-center gap-10">
                <motion.div
                  className="w-[min(58vw,380px)] text-bone"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: markDelay, duration: 0.6, ease: ease.outExpo }}
                >
                  <Wordmark draw delay={markDelay} duration={0.75} strokeWidth={8} />
                </motion.div>
                <div className="flex w-full max-w-[380px] items-end justify-between">
                  <motion.span
                    className="label-mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    a digital space
                  </motion.span>
                  <span className="font-mono text-sm tabular-nums text-bone-2">{String(count).padStart(3, "0")}</span>
                </div>
                <div className="h-px w-full max-w-[380px] overflow-hidden bg-line">
                  <motion.div
                    className="h-full bg-bone"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: (total - 700) / 1000, ease: ease.outQuart }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-line-strong" />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                finish();
              }}
              className="absolute bottom-6 right-[var(--gutter)] rounded-full border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-2 transition-colors hover:border-bone hover:text-bone"
            >
              Skip intro
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
