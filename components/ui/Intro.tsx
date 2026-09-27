"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
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
import { Wordmark } from "@/components/ui/Wordmark";
import { ease } from "@/lib/motion";

/** Total time the overlay stays before the curtain lifts (ms). */
const INTRO_MS = 2400;

interface IntroContextValue {
  /** True once the opening sequence has finished (or was skipped). */
  done: boolean;
}

const IntroContext = createContext<IntroContextValue>({ done: true });

export function useIntro() {
  return useContext(IntroContext);
}

/**
 * Opening sequence. Plays once per browser session on first load:
 * the wordmark traces itself while a counter runs, then the curtain lifts.
 * Skipped entirely for reduced-motion users and on return visits in-session.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  // `null` = undecided (server / first client render). Keeps SSR markup stable.
  const [show, setShow] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setShow(false);
    setDone(true);
    document.documentElement.dataset.introDone = "true";
  }, []);

  // Decide on mount whether to play. Plays on every full load of the home
  // page (client-side navigations never remount this provider).
  useEffect(() => {
    const isHome = window.location.pathname === "/";
    if (reduce || !isHome) {
      finish();
      return;
    }
    // Defer one frame: state is set from a callback, not synchronously in the effect.
    const raf = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(raf);
  }, [reduce, finish]);

  // Keep the latest Lenis instance without restarting the sequence when it arrives.
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
    if (show === true && !finishedRef.current) lenis?.stop();
  }, [lenis, show]);

  // Run the sequence.
  useEffect(() => {
    if (show !== true) return;
    lenisRef.current?.stop();
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (INTRO_MS - 500));
      // Ease the counter so it decelerates into 100.
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const timer = window.setTimeout(finish, INTRO_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [show, finish]);

  // Release scroll once the curtain has left.
  useEffect(() => {
    if (done) lenis?.start();
  }, [done, lenis]);

  const value = useMemo(() => ({ done }), [done]);

  return (
    <IntroContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {show === true && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[110] flex items-center justify-center bg-ink"
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.95, ease: ease.inOutQuart }}
            aria-hidden
          >
            <div className="container-x flex w-full max-w-[1400px] flex-col items-center gap-10">
              <div className="w-[min(58vw,380px)] text-bone">
                <Wordmark draw delay={0.15} duration={0.8} strokeWidth={8} />
              </div>
              <div className="flex w-full max-w-[380px] items-end justify-between">
                <motion.span
                  className="label-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  a digital space
                </motion.span>
                <span className="font-mono text-sm tabular-nums text-bone-2">
                  {String(count).padStart(3, "0")}
                </span>
              </div>
              <div className="h-px w-full max-w-[380px] overflow-hidden bg-line">
                <motion.div
                  className="h-full bg-bone"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: (INTRO_MS - 500) / 1000, ease: ease.outQuart }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
            </div>
            {/* Bottom edge highlight so the curtain reads as a surface when it lifts. */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-line-strong" />
          </motion.div>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
