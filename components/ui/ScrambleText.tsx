"use client";

import { useEffect, useRef, useState } from "react";
import { useDevice } from "@/lib/hooks/use-device";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>";

interface ScrambleTextProps {
  text: string;
  /** Start decoding when true (defaults to immediately). */
  play?: boolean;
  delay?: number;
  /** Total decode duration in ms. */
  duration?: number;
  className?: string;
  /** Re-run on hover. */
  hover?: boolean;
}

/** Decodes text from random glyphs, left to right. */
export function ScrambleText({ text, play = true, delay = 0, duration = 900, className, hover = false }: ScrambleTextProps) {
  const { reducedMotion } = useDevice();
  const [output, setOutput] = useState(text);
  const frame = useRef(0);

  const run = () => {
    if (reducedMotion) return;
    cancelAnimationFrame(frame.current);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const settled = Math.floor(t * text.length);
      let next = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " " || i < settled) next += ch;
        else next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOutput(next);
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else setOutput(text);
    };
    frame.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!play) return;
    const id = window.setTimeout(run, delay);
    return () => {
      window.clearTimeout(id);
      cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, text]);

  return (
    <span className={className} onPointerEnter={hover ? run : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{output}</span>
    </span>
  );
}
