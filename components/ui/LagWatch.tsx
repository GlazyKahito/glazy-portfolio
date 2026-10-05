"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useIntro } from "@/components/ui/Intro";
import { setLite, useLite } from "@/lib/capability";
import { useDeck } from "@/lib/deck";
import { ease } from "@/lib/motion";

/**
 * Watches the frame rate. If the site is struggling on this device, a small
 * note offers the lite version (stills instead of 4K video). The L key
 * toggles lite mode anywhere, and a brief toast confirms the switch.
 *
 * It only watches when lag would show: for ten seconds after the opening or
 * a new page, and through every move of the deck until a few seconds after it
 * lands. The rest of the time it costs no frames.
 */
export function LagWatch() {
  const { done } = useIntro();
  const lite = useLite();
  const [offer, setOffer] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dismissed = useRef(false);
  const { moving } = useDeck();
  const pathname = usePathname();
  /** Watch for the next `ms` (set by the sampler effect; a no-op while it is off). */
  const watch = useRef<(ms: number, exact?: boolean) => void>(() => {});

  // Keyboard shortcut: L.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "l" || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest("input,textarea,select,[contenteditable]")) return;
      const next = !lite;
      setLite(next);
      setOffer(false);
      setToast(next ? "Lite mode on · stills instead of 4K video" : "Full 4K mode on");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lite]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Frame-rate watch: sample in 2 s windows while watching; two slow windows in a row trigger the offer.
  useEffect(() => {
    if (!done || lite || dismissed.current) return;
    let raf = 0;
    let frames = 0;
    let start = 0;
    let slow = 0;
    let until = 0;
    // One offer per visit: once made (and taken, or turned down), the watch stops for good.
    let offered = false;
    const tick = (now: number) => {
      frames++;
      const elapsed = now - start;
      if (elapsed >= 2000) {
        const fps = (frames * 1000) / elapsed;
        // Hidden tabs throttle rAF; only judge while visible.
        if (document.visibilityState === "visible") slow = fps < 38 ? slow + 1 : 0;
        frames = 0;
        start = now;
        if (slow >= 2) {
          raf = 0;
          offered = true;
          setOffer(true);
          return;
        }
      }
      raf = now < until ? requestAnimationFrame(tick) : 0;
    };
    watch.current = (ms, exact = false) => {
      if (offered || dismissed.current) return;
      const end = performance.now() + ms;
      until = exact ? end : Math.max(until, end);
      if (raf) return;
      frames = 0;
      start = performance.now();
      raf = requestAnimationFrame(tick);
    };
    // Give the first scene a moment to settle before judging.
    const t = window.setTimeout(() => watch.current(10000), 2500);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
      watch.current = () => {};
    };
  }, [done, lite]);

  // Watch every move of the deck, until a few seconds after it lands.
  useEffect(() => {
    if (moving) watch.current(20000);
    else watch.current(4000, true);
  }, [moving]);

  // And the first seconds of every page.
  useEffect(() => {
    watch.current(10000);
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {offer && !lite && (
          <motion.div
            role="alertdialog"
            aria-labelledby="lag-title"
            aria-describedby="lag-body"
            className="fixed bottom-5 left-5 z-[92] flex max-w-[calc(100vw-7rem)] items-center gap-3 rounded-full border border-white/15 bg-ink-3/92 py-1.5 pl-4 pr-1.5 text-bone shadow-[0_20px_60px_-15px_rgb(0_0_0/0.8)] backdrop-blur-md"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.6, ease: ease.outExpo }}
          >
            <p className="min-w-0 text-[13px] leading-tight">
              <span id="lag-title" className="font-medium">Lagging?</span>{" "}
              <span id="lag-body" className="hidden text-bone-2 md:inline">
                Lite mode swaps 4K video for stills.
              </span>
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setLite(true);
                  setOffer(false);
                  setToast("Lite mode on · stills instead of 4K video");
                }}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-bone px-3.5 text-[13px] font-medium text-ink"
              >
                Switch to lite
                <kbd className="rounded-md border border-ink/20 px-1.5 font-mono text-[11px]">L</kbd>
              </button>
              <button
                type="button"
                onClick={() => {
                  dismissed.current = true;
                  setOffer(false);
                }}
                className="h-9 rounded-full px-3 text-[13px] text-bone-2 hover:text-bone"
              >
                Keep 4K
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            className="fixed left-1/2 top-5 z-[106] -translate-x-1/2 rounded-full border border-white/15 bg-ink-3/90 px-4 py-2 text-sm text-bone backdrop-blur-md"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: ease.outExpo }}
          >
            {toast} <span className="ml-2 text-bone-2">Press L to switch back</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
