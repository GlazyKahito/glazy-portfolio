"use client";

import dynamic from "next/dynamic";
import { useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import { useDevice } from "@/lib/hooks/use-device";

/* Scenes are split into their own chunks; three.js only loads when a scene mounts. */
const HeroScene = dynamic(() => import("@/components/3d/HeroScene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => null,
});
const ProgressScene = dynamic(
  () => import("@/components/3d/ProgressScene").then((m) => m.ProgressScene),
  { ssr: false, loading: () => null },
);

export interface SceneProps {
  /** 0 → 1 scroll progress through the owning section. */
  scroll?: MotionValue<number>;
  /** Whether the scene should render frames. */
  active: boolean;
  tier: "high" | "mid";
  /** Extra scene input; ProgressScene uses it as completion 0-1. */
  value?: number;
  /** prefers-reduced-motion: slow idle motion to a crawl, keep pointer response. */
  reduced?: boolean;
}

interface CanvasGateProps {
  scene: "hero" | "progress";
  fallback: ReactNode;
  scroll?: MotionValue<number>;
  value?: number;
  className?: string;
}

/**
 * Decides whether a WebGL scene is worth rendering on this device and only
 * renders frames while the scene is on screen and the tab is visible.
 */
export function CanvasGate({ scene, fallback, scroll, value, className }: CanvasGateProps) {
  const { tier, reducedMotion, webgl, pending } = useDevice();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "20% 0px 20% 0px" });
  const [visible, setVisible] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    // If WebGL context creation throws inside three, fall back gracefully.
    const onError = (e: ErrorEvent) => {
      if (/WebGL|THREE/i.test(String(e.message))) setFailed(true);
    };
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);

  // Reduced motion keeps the scene (it is the visual identity) but the scenes
  // read `reducedMotion` and slow their idle animation right down.
  const allowed = !pending && webgl && tier !== "low" && !failed;

  return (
    <div ref={ref} className={className} aria-hidden>
      {allowed ? (
        scene === "hero" ? (
          <HeroScene scroll={scroll} active={inView && visible} tier={tier === "high" ? "high" : "mid"} reduced={reducedMotion} />
        ) : (
          <ProgressScene active={inView && visible} tier={tier === "high" ? "high" : "mid"} value={value} reduced={reducedMotion} />
        )
      ) : (
        fallback
      )}
    </div>
  );
}
