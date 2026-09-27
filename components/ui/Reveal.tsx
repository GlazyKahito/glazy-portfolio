"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { ease, fadeUp, lineReveal, stagger, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Animate immediately instead of when scrolled into view. */
  immediate?: boolean;
  delay?: number;
  /** Which variant to use. */
  variant?: "line" | "fade";
  as?: "div" | "span" | "p" | "li";
}

/** Masks its children and slides them up into view. */
export function Reveal({
  children,
  className,
  immediate = false,
  delay = 0,
  variant = "line",
  as = "div",
}: RevealProps) {
  const Tag = motion[as];
  const variants: Variants =
    variant === "line"
      ? {
          hidden: lineReveal.hidden,
          visible: {
            ...lineReveal.visible,
            transition: { duration: 1.1, ease: ease.outExpo, delay },
          },
        }
      : {
          hidden: fadeUp.hidden,
          visible: {
            ...fadeUp.visible,
            transition: { duration: 0.8, ease: ease.outExpo, delay },
          },
        };

  return (
    <Tag className={cn(variant === "line" && "overflow-hidden", className)}>
      <motion.span
        className="block"
        variants={variants}
        initial="hidden"
        {...(immediate ? { animate: "visible" } : { whileInView: "visible", viewport: viewportOnce })}
      >
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
  delay?: number;
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Words rendered in the serif italic accent, matched case-insensitively. */
  accent?: string[];
}

/** Splits text into words and reveals each with a staggered mask. */
export function RevealWords({
  text,
  className,
  wordClassName,
  immediate = false,
  delay = 0,
  staggerDelay = 0.045,
  as = "p",
  accent = [],
}: RevealWordsProps) {
  const Tag = motion[as];
  const words = text.split(" ");
  const accents = new Set(accent.map((w) => w.toLowerCase()));

  return (
    <Tag
      className={cn("flex flex-wrap", className)}
      variants={stagger(staggerDelay, delay)}
      initial="hidden"
      {...(immediate ? { animate: "visible" } : { whileInView: "visible", viewport: viewportOnce })}
    >
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
              variants={lineReveal}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
