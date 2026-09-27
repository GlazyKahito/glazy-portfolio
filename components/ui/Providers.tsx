"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { IntroProvider } from "@/components/ui/Intro";
import { TransitionProvider } from "@/components/ui/PageTransition";

/**
 * Client-side providers: smooth scrolling, the opening sequence, and
 * route transitions. Order matters: transitions need Lenis to scroll to top.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        wheelMultiplier: 0.95,
        smoothWheel: true,
        // Native touch scrolling stays native; smoothing touch feels wrong on phones.
        syncTouch: false,
      }}
    >
      <IntroProvider>
        <TransitionProvider>{children}</TransitionProvider>
      </IntroProvider>
    </ReactLenis>
  );
}
