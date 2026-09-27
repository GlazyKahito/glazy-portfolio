import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know our custom font-size utilities, otherwise it treats
 * `text-display-lg` as a text colour and drops it when `text-bone` follows.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display-xl", "display-lg", "display-md", "display-sm"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => outMin + ((v - inMin) * (outMax - outMin)) / (inMax - inMin);

/** "https://github.com/GlazyKahito/scamshield" → "github.com/GlazyKahito/scamshield" */
export function prettyUrl(href: string) {
  return href.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function hsl(hue: number, s = 70, l = 60, a = 1) {
  return `hsl(${hue} ${s}% ${l}% / ${a})`;
}
