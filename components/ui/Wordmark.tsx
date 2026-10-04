"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";

/**
 * GLAZY logotype: five monoline geometric letters on a 60×80 grid.
 * Drawn as strokes so the intro can trace it and the hero can light it.
 */
export const LETTERS: { d: string; x: number }[] = [
  { d: "M50 23 A26 26 0 1 0 50 57 L50 41 L36 41", x: 0 }, // G
  { d: "M6 8 L6 72 L50 72", x: 76 }, // L
  { d: "M4 72 L30 8 L56 72 M15 48 L45 48", x: 152 }, // A
  { d: "M6 8 L54 8 L6 72 L54 72", x: 228 }, // Z
  { d: "M6 8 L30 40 L54 8 M30 40 L30 72", x: 304 }, // Y
];

export const WORDMARK_VIEWBOX = "0 0 364 80";

interface WordmarkProps {
  className?: string;
  /** Trace the letters in. */
  draw?: boolean;
  /** Delay before the trace starts (s). */
  delay?: number;
  /** Duration of each letter trace (s). */
  duration?: number;
  stroke?: string;
  strokeWidth?: number;
  /** Adds the glaze sheen gradient as the stroke. */
  sheen?: boolean;
  title?: string;
}

export function Wordmark({
  className,
  draw = false,
  delay = 0,
  duration = 0.9,
  stroke = "currentColor",
  strokeWidth = 9,
  sheen = false,
  title = "GLAZY",
}: WordmarkProps) {
  const reduce = useReducedMotion();
  const animate = draw && !reduce;
  const strokeValue = sheen ? "url(#glaze-sheen)" : stroke;

  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      className={cn("h-auto w-full overflow-visible", className)}
      role="img"
      aria-label={title}
      fill="none"
    >
      {sheen && (
        <defs>
          <linearGradient id="glaze-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f5f5f7" />
            <stop offset="0.45" stopColor="#f5f5f7" />
            <stop offset="0.55" stopColor="#ff6a33" />
            <stop offset="0.62" stopColor="#ff7a5c" />
            <stop offset="0.7" stopColor="#f5f5f7" />
            <stop offset="1" stopColor="#f5f5f7" />
          </linearGradient>
        </defs>
      )}
      {LETTERS.map((letter, i) => (
        <motion.path
          key={i}
          d={letter.d}
          transform={`translate(${letter.x} 0)`}
          stroke={strokeValue}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
          transition={
            animate
              ? {
                  pathLength: { duration, delay: delay + i * 0.14, ease: ease.inOutQuart },
                  opacity: { duration: 0.2, delay: delay + i * 0.14 },
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}
