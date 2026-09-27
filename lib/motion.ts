import type { Transition, Variants } from "motion/react";

/**
 * One motion vocabulary for the whole site.
 * Every animation picks an ease and a duration from here.
 */
export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  outQuart: [0.25, 1, 0.5, 1] as const,
  inOutQuart: [0.76, 0, 0.24, 1] as const,
  inQuart: [0.5, 0, 0.75, 0] as const,
};

export const duration = {
  fast: 0.35,
  base: 0.7,
  slow: 1.1,
  cinematic: 1.6,
};

export const spring = {
  snappy: { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as Transition,
  soft: { type: "spring", stiffness: 120, damping: 24, mass: 1 } as Transition,
  magnetic: { type: "spring", stiffness: 220, damping: 18, mass: 0.6 } as Transition,
};

/** Container that staggers its children's `fadeUp`/`reveal` variants. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.outExpo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: ease.outQuart } },
};

/** Masked line reveal — pair with an `overflow-hidden` parent. */
export const lineReveal: Variants = {
  hidden: { y: "110%", rotate: 2 },
  visible: {
    y: "0%",
    rotate: 0,
    transition: { duration: duration.slow, ease: ease.outExpo },
  },
};

/** Clip-path wipe for images and panels. */
export const wipeUp: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)", scale: 1.08 },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    scale: 1,
    transition: { duration: duration.cinematic, ease: ease.outExpo },
  },
};

export const viewportOnce = { once: true, amount: 0.25 } as const;
