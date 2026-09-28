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
    title: "GLAZY, rebuilt",
    description:
      "This portfolio, rebuilt as a sequence of full-screen cinematic scenes: real 4K footage, one transition per chapter, a film-leader opening and a lite mode for low-power devices. It is being rebuilt in the open; you are looking at the work in progress.",
    status: "building",
    progress: 85,
    technologies: ["Next.js", "TypeScript", "GSAP", "Motion", "Tailwind CSS"],
    startedAt: "2026-09",
    github: "https://github.com/GlazyKahito/glazy-portfolio",
    focus: ["Scene transitions and loaders", "Case-study pages", "Performance on older phones"],
    hue: 190,
  },
];
