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
  id?: string;
  className?: string;
  wordClassName?: string;
  immediate?: boolean;
  /** Controlled mode; see `Reveal`. */
  play?: boolean;
  delay?: number;
  /** Delay between letters (or words when `by="word"`). */
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Words rendered in the serif italic accent, matched case-insensitively. */
  accent?: string[];
  /** Words (after cleaning) that also take the accent colour. */
  highlight?: string[];
  /** Animate each letter (titles) or each word (paragraphs). */
  by?: "char" | "word";
}

/*
 * A title-sequence reveal: each letter (or word) rises out of a soft blur,
 * slightly rotated back in depth, and settles. Opacity, transform and filter
 * only, so it stays on the compositor.
 */
const unitVariants: Variants = {
  hidden: { opacity: 0, y: "0.55em", rotateX: -55, filter: "blur(10px)", transition: instant },
  visible: {
    opacity: 1,
    y: "0em",
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease: ease.outExpo },
  },
};

export function RevealWords({
  text,
  id,
  className,
  wordClassName,
  immediate = false,
  play,
  delay = 0,
  staggerDelay,
  as = "p",
  accent = [],
  highlight = [],
  by = "char",
}: RevealWordsProps) {
  const Tag = motion[as];
  const words = text.split(" ");
  const accents = new Set(accent.map((w) => w.toLowerCase()));
  const highlights = new Set(highlight.map((w) => w.toLowerCase()));
  const step = staggerDelay ?? (by === "char" ? 0.018 : 0.04);

  const control =
    play !== undefined
      ? { initial: false as const, animate: play ? "visible" : "hidden" }
      : immediate
        ? { initial: "hidden", animate: "visible" }
        : { initial: "hidden", whileInView: "visible", viewport: viewportOnce };

  return (
    <Tag id={id} className={cn("flex flex-wrap [perspective:900px]", className)} variants={stagger(step, delay)} {...control}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => {
        const clean = word.replace(/[^\w']/g, "").toLowerCase();
        const isAccent = accents.has(clean) || accents.has(word.toLowerCase());
        const isHighlight = highlights.has(clean);
        const cls = cn(
          "inline-block [transform-style:preserve-3d]",
          isAccent && "font-serif italic text-bone-2",
          isHighlight && "text-glaze",
          wordClassName,
        );
        return (
          <span key={i} className="mr-[0.26em] inline-block whitespace-nowrap pb-[0.08em]" aria-hidden>
            {by === "word" ? (
              <motion.span className={cls} variants={unitVariants}>
                {word}
              </motion.span>
            ) : (
              Array.from(word).map((ch, j) => (
                <motion.span key={j} className={cls} variants={unitVariants}>
                  {ch}
                </motion.span>
              ))
            )}
          </span>
        );
      })}
    </Tag>
  );
}
