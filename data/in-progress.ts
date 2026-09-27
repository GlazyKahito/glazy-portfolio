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
 */
export const inProgress: InProgressItem[] = [
  {
    id: "glazy",
    title: "GLAZY",
    description:
      "This portfolio. A cinematic, data-driven showcase built with Next.js, React Three Fiber and Motion. Version one is shipping now; case studies, experiments and a writing section come next.",
    status: "shipping",
    progress: 80,
    technologies: ["Next.js", "TypeScript", "React Three Fiber", "Motion", "Tailwind CSS"],
    startedAt: "2026-09",
    github: "https://github.com/GlazyKahito/glazy-portfolio",
    focus: [
      "Project case-study pages",
      "Experiments and writing sections",
      "GitHub activity feed",
    ],
    hue: 190,
  },
  {
    id: "scamshield-phase-2",
    title: "ScamShield — next phase",
    description:
      "The analysis engine, Gemini layer and API routes are complete and tested. The next phase is the product surface: landing, report view, attack simulator, dashboard and a scam library.",
    status: "building",
    progress: 55,
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Google Gemini API"],
    startedAt: "2026-09",
    github: "https://github.com/GlazyKahito/scamshield",
    live: "https://scamshield-olive.vercel.app",
    focus: ["Attack simulator", "Analysis dashboard", "Scam library"],
    hue: 160,
  },
];
