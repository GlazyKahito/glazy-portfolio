import type { InProgressItem } from "@/lib/types";

/**
 * IN PROGRESS
 * -----------
 * Things currently being built or explored. To add one:
 *   1. Add an object below.
 *   2. Set an honest `progress` (0–100) and `status`.
 *   3. Done. The section renders from this list.
 *
 * Remove an item (or move it to `data/projects.ts`) once it ships.
 * ScamShield shipped in September 2026 and now lives in projects.
 */
export const inProgress: InProgressItem[] = [
  {
    id: "glazy",
    title: "The GLAZY studio site",
    description:
      "The studio's own site, built in the open as a sequence of full-screen cinematic scenes: a layered depth-poster opening, real 4K footage, one transition per chapter, and a lite mode for low-power devices. You are looking at the work in progress.",
    status: "building",
    progress: 90,
    technologies: ["Next.js", "TypeScript", "GSAP", "Motion", "Tailwind CSS"],
    startedAt: "2026-09",
    github: "https://github.com/GlazyKahito/glazy-portfolio",
    focus: ["Depth-poster opening and services poster", "Case studies for client work", "Mr. Nimbus's AI answers"],
    hue: 190,
  },
];
