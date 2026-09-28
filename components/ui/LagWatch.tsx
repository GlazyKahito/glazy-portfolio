"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useIntro } from "@/components/ui/Intro";
import { setLite, useLite } from "@/lib/capability";
import { ease } from "@/lib/motion";

/**
 * Watches the frame rate. If the site is struggling on this device, a small
 * note offers the lite version (stills instead of 4K video). The L key
 * toggles lite mode anywhere, and a brief toast confirms the switch.
 */
export function LagWatch() {
  const { done } = useIntro();
  const lite = useLite();
  const [offer, setOffer] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dismissed = useRef(false);

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

  // Frame-rate watch: after the opening, sample in 2 s windows; two slow windows in a row trigger the offer.
  useEffect(() => {
    if (!done || lite || dismissed.current) return;
    let raf = 0;
    let frames = 0;
    let start = performance.now();
    let slow = 0;
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
          setOffer(true);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    // Give the first scene a moment to settle before judging.
    const t = window.setTimeout(() => {
      start = performance.now();
      raf = requestAnimationFrame(tick);
    }, 2500);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [done, lite]);

  return (
    <>
      <AnimatePresence>
        {offer && !lite && (
          <motion.div
            role="alertdialog"
            aria-labelledby="lag-title"
            aria-describedby="lag-body"
            className="fixed bottom-5 left-5 z-[105] w-[min(92vw,360px)] rounded-3xl border border-white/15 bg-[#121214]/90 p-5 text-bone shadow-[0_20px_60px_-15px_rgb(0_0_0/0.8)] backdrop-blur-md"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.6, ease: ease.outExpo }}
          >
            <p id="lag-title" className="text-[15px] font-medium">Is it lagging?</p>
            <p id="lag-body" className="mt-1.5 text-sm leading-relaxed text-bone-2">
              Your device is dropping frames. Lite mode swaps the 4K video for still frames and keeps everything else.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLite(true);
                  setOffer(false);
                  setToast("Lite mode on · stills instead of 4K video");
                }}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-bone px-4 text-sm font-medium text-ink"
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
                className="h-10 rounded-full px-4 text-sm text-bone-2 hover:text-bone"
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
            className="fixed left-1/2 top-5 z-[106] -translate-x-1/2 rounded-full border border-white/15 bg-[#121214]/90 px-4 py-2 text-sm text-bone backdrop-blur-md"
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
