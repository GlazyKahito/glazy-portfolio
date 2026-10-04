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
    id: "heatsync",
    title: "HEATSYNC",
    description:
      "A heatwave response engine for Maharashtra, built for use case KJS-CES-01 with IMD Mumbai–Pune: a live hotspot ranking, contiguous heat zones, alert rings across district borders and audience-specific advisories, each step powered by one of eight classic data structures, on real ERA5 data with a 3D map of the state.",
    status: "building",
    progress: 75,
    technologies: ["Next.js", "TypeScript", "React Three Fiber", "GSAP", "Vitest", "C"],
    startedAt: "2026-10",
    github: "https://github.com/GlazyKahito/heatsync",
    live: "https://heatsync-mh.vercel.app",
    focus: ["Response console: replay the May 2024 heat spell day by day", "DSA lab: every structure, step by step, with the C source", "Live 7-day guidance from Open-Meteo"],
    hue: 18,
  },
  {
    id: "glazy",
    title: "The GLAZY site",
    description:
      "Our own site, built in the open as a sequence of full-screen cinematic scenes: a layered depth-poster opening, real 4K footage, one transition per chapter, and a lite mode for low-power devices. You are looking at the work in progress.",
    status: "building",
    progress: 90,
    technologies: ["Next.js", "TypeScript", "GSAP", "Motion", "Tailwind CSS"],
    startedAt: "2026-09",
    github: "https://github.com/GlazyKahito/glazy-portfolio",
    focus: ["Depth-poster opening and services poster", "Case studies for client work", "Mr. Nimbus's AI answers"],
    hue: 190,
  },
];
