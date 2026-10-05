"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { IntroProvider } from "@/components/ui/Intro";
import { TransitionProvider } from "@/components/ui/PageTransition";

/** The scene deck owns the home page: the page itself never scrolls there. */
const inDeck = () => document.documentElement.classList.contains("deck-mode");

/**
 * Lenis runs on this frame loop instead of its own: never on the home page
 * (the deck locks page scroll), and elsewhere only while the page is
 * scrolling. Input wakes it; a settled page costs no frames.
 */
function LenisFrames() {
  const lenis = useLenis();
  const pathname = usePathname();
  const deck = pathname === "/";

  useEffect(() => {
    if (!lenis || deck) return;
    let raf = 0;
    let quiet = 0;
    // Lenis sees a clock that stands still while the loop sleeps: a pause counts as one frame,
    // so the first frame after it does not jump the whole pause at once.
    let last = 0;
    let paused = 0;
    let resumed = false;
    const tick = (t: number) => {
      if (resumed) paused += Math.max(0, t - last - 1000 / 60);
      resumed = false;
      last = t;
      lenis.raf(t - paused);
      quiet = lenis.isScrolling ? 0 : quiet + 1;
      raf = quiet > 45 ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      quiet = 0;
      if (raf) return;
      resumed = last > 0;
      raf = requestAnimationFrame(tick);
    };
    const offScroll = lenis.on("virtual-scroll", wake);
    const opts = { capture: true, passive: true } as const;
    window.addEventListener("pointerdown", wake, opts);
    window.addEventListener("keydown", wake, opts);
    wake();
    return () => {
      offScroll();
      window.removeEventListener("pointerdown", wake, opts);
      window.removeEventListener("keydown", wake, opts);
      cancelAnimationFrame(raf);
    };
  }, [lenis, deck]);

  return null;
}

/**
 * Client-side providers: smooth scrolling, the opening sequence, and
 * route transitions. Order matters: transitions need Lenis to scroll to top.
 * Motion follows the visitor's reduced-motion setting everywhere.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      autoRaf={false}
      options={{
        lerp: 0.09,
        wheelMultiplier: 0.95,
        smoothWheel: true,
        // Native touch scrolling stays native; smoothing touch feels wrong on phones.
        syncTouch: false,
        // In the deck, wheel and touch belong to the deck (and to scenes that scroll inside).
        virtualScroll: () => !inDeck(),
      }}
    >
      <LenisFrames />
      <MotionConfig reducedMotion="user">
        <IntroProvider>
          <TransitionProvider>{children}</TransitionProvider>
        </IntroProvider>
      </MotionConfig>
    </ReactLenis>
  );
}
