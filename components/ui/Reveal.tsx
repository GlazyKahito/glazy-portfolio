"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { ease, fadeUp, lineReveal, stagger, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Two ways to drive a reveal:
 *  - default: hidden on mount, plays when scrolled into view (or on mount with `immediate`)
 *  - `play` given: rendered VISIBLE in the server HTML (so it paints at first paint and
 *    counts for LCP), snapped to hidden on hydration, then played when `play` turns true.
 *    Use this for content that sits behind the opening sequence.
 */
interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Animate immediately instead of when scrolled into view. */
  immediate?: boolean;
  /** Controlled mode; see above. */
  play?: boolean;
  delay?: number;
  variant?: "line" | "fade";
  as?: "div" | "span" | "p" | "li";
}

const instant = { duration: 0 };

export function Reveal({
  children,
  className,
  immediate = false,
  play,
  delay = 0,
  variant = "line",
  as = "div",
}: RevealProps) {
  const Tag = motion[as];
  const variants: Variants =
    variant === "line"
      ? {
          hidden: { ...lineReveal.hidden, transition: instant },
          visible: {
            ...lineReveal.visible,
            transition: { duration: 1.1, ease: ease.outExpo, delay },
          },
        }
      : {
          hidden: { ...fadeUp.hidden, transition: instant },
          visible: {
            ...fadeUp.visible,
            transition: { duration: 0.8, ease: ease.outExpo, delay },
          },
        };

  const control =
    play !== undefined
      ? { initial: false as const, animate: play ? "visible" : "hidden" }
      : immediate
        ? { initial: "hidden", animate: "visible" }
        : { initial: "hidden", whileInView: "visible", viewport: viewportOnce };

  return (
    <Tag className={cn(variant === "line" && "overflow-hidden", className)}>
      <motion.span className="block" variants={variants} {...control}>
        {children}
      </motion.span>
    </Tag>
  );
}

interface RevealWordsProps {
  text: string;
  className?: string;
  wordClassName?: string;
  immediate?: boolean;
  /** Controlled mode; see `Reveal`. */
  play?: boolean;
  delay?: number;
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Words rendered in the serif italic accent, matched case-insensitively. */
  accent?: string[];
}

const wordVariants: Variants = {
  hidden: { ...lineReveal.hidden, transition: instant },
  visible: lineReveal.visible,
};

/** Splits text into words and reveals each with a staggered mask. */
export function RevealWords({
  text,
  className,
  wordClassName,
  immediate = false,
  play,
  delay = 0,
  staggerDelay = 0.045,
  as = "p",
  accent = [],
}: RevealWordsProps) {
  const Tag = motion[as];
  const words = text.split(" ");
  const accents = new Set(accent.map((w) => w.toLowerCase()));

  const control =
    play !== undefined
      ? { initial: false as const, animate: play ? "visible" : "hidden" }
      : immediate
        ? { initial: "hidden", animate: "visible" }
        : { initial: "hidden", whileInView: "visible", viewport: viewportOnce };

  return (
    <Tag className={cn("flex flex-wrap", className)} variants={stagger(staggerDelay, delay)} {...control}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => {
        const clean = word.replace(/[^\w']/g, "").toLowerCase();
        const isAccent = accents.has(clean);
        return (
          <span key={i} className="mr-[0.28em] inline-block overflow-hidden pb-[0.08em]" aria-hidden>
            <motion.span
              className={cn(
                "inline-block",
                isAccent && "font-serif italic font-normal text-bone-2",
                wordClassName,
              )}
              variants={wordVariants}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
