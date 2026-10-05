"use client";

import { motion, type Variants } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { ease, fadeUp, lineReveal, viewportOnce } from "@/lib/motion";
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

/** For the uncontrolled modes: true once on screen (or, with `immediate`, one painted frame after mounting). */
function useAutoReveal(ref: RefObject<HTMLElement | null>, enabled: boolean, immediate: boolean) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    if (immediate) {
      // Two frames: the hidden state is painted first, so the transition has somewhere to start from.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setOn(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setOn(true);
        io.disconnect();
      },
      { threshold: viewportOnce.amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, enabled, immediate]);
  return on;
}

/*
 * A title-sequence reveal: each letter (or word) rises, rotated back in depth,
 * and settles, one after another. Plain spans and CSS transitions on transform
 * and opacity (`.reveal-unit` in globals.css), so the compositor plays it: a
 * heading's letters cost no script per frame and nothing to hydrate.
 */
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
  const Tag = as;
  const ref = useRef<HTMLElement>(null);
  const controlled = play !== undefined;
  const auto = useAutoReveal(ref, !controlled, immediate);
  const on = controlled ? play : auto;
  const accents = new Set(accent.map((w) => w.toLowerCase()));
  const highlights = new Set(highlight.map((w) => w.toLowerCase()));
  const step = staggerDelay ?? (by === "char" ? 0.018 : 0.04);

  // Each unit's place in the sequence, counted across the whole line.
  const words: { word: string; start: number; cls: string }[] = [];
  let count = 0;
  for (const word of text.split(" ")) {
    const clean = word.replace(/[^\w']/g, "").toLowerCase();
    const isAccent = accents.has(clean) || accents.has(word.toLowerCase());
    const isHighlight = highlights.has(clean);
    words.push({
      word,
      start: count,
      cls: cn("reveal-unit [transform-style:preserve-3d]", isAccent && "font-serif italic text-bone-2", isHighlight && "text-glaze", wordClassName),
    });
    count += by === "word" ? 1 : Array.from(word).length;
  }
  const at = (n: number) => ({ "--d": `${(delay + n * step).toFixed(3)}s` }) as CSSProperties;

  return (
    <Tag
      ref={ref as RefObject<HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>}
      id={id}
      data-reveal={on ? "" : undefined}
      className={cn("flex flex-wrap [perspective:900px]", className)}
    >
      <span className="sr-only">{text}</span>
      {words.map(({ word, start, cls }, i) => (
        <span key={i} className="mr-[0.26em] inline-block whitespace-nowrap pb-[0.08em]" aria-hidden>
          {by === "word" ? (
            <span className={cls} style={at(start)}>
              {word}
            </span>
          ) : (
            Array.from(word).map((ch, j) => (
              <span key={j} className={cls} style={at(start + j)}>
                {ch}
              </span>
            ))
          )}
        </span>
      ))}
    </Tag>
  );
}
