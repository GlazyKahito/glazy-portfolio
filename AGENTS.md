# GLAZY — guide for coding agents

This file is for any AI assistant or automated tool working in this repository (Claude Code reads it via `CLAUDE.md`, others read it directly). Read it before changing anything.

## What this is

GLAZY is Krutik Mhatre's personal portfolio: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, React Three Fiber, Motion, Lenis. It is deployed on Vercel from the `main` branch.

## Ground rules

1. **Facts come from `data/`.** Never invent projects, metrics, technologies, clients, testimonials or achievements. If a fact is not in `data/*.ts`, the resume (`public/resume/`) or a linked repository README, it does not go on the site.
2. **Content is data, presentation is components.** Adding a project means editing `data/projects.ts` and dropping images in `public/projects/<slug>/`. Do not hard-code project details in components.
3. **No secrets in the repo.** `.env` and `.env.local` are git-ignored; document new variables in `.env.example` with empty values.
4. **Respect the motion system.** Use the eases, durations and variants in `lib/motion.ts`. Everything must degrade under `prefers-reduced-motion` and on touch devices (see `lib/hooks/use-device.ts`).
5. **Performance before effects.** 3D goes through `components/3d/CanvasGate.tsx`, which decides whether a scene renders at all and pauses it off-screen. Keep new scenes cheap (no post-processing, capped DPR, lazy-loaded).
6. **Accessibility is not optional.** Semantic headings in order, focus-visible styles, `aria-*` on custom controls, alt text from data, keyboard paths for every interaction.

## Commands

```bash
npm run dev         # dev server on :3000
npm run build       # must pass before pushing
npm run lint        # eslint (React Compiler rules are on; no setState directly in effects, no ref reads in render)
npm run typecheck   # tsc --noEmit
```

## Where things are

| Area | Path |
| --- | --- |
| Design tokens (colours, fonts, eases, type scale) | `app/globals.css` (`@theme inline`) |
| Motion vocabulary | `lib/motion.ts` |
| Device capability / reduced motion | `lib/hooks/use-device.ts` |
| Opening sequence | `components/ui/Intro.tsx` |
| Route transitions + `TransitionLink` | `components/ui/PageTransition.tsx` |
| Smooth scroll + providers | `components/ui/Providers.tsx` |
| Custom cursor (`data-cursor="view|link|drag"`) | `components/ui/Cursor.tsx` |
| Hero 3D scene + shader | `components/3d/HeroScene.tsx`, `components/3d/glaze-shader.ts` |
| Project wheel / carousel | `components/projects/ProjectShowcase.tsx` |
| Project detail page | `components/projects/ProjectDetail.tsx`, `app/projects/[slug]/page.tsx` |
| Content types | `lib/types.ts` |

## Conventions

- Client components start with `"use client"`; sections that only compose are server components.
- Custom font-size utilities are `text-display-xl|lg|md|sm`; `lib/utils.ts` teaches tailwind-merge about them. Add new ones in both places.
- Colour tokens: `ink*` backgrounds, `bone*` text, `line*` borders, `glaze` accent. Do not introduce new hex colours in components; add a token.
- Images use `next/image`; configured qualities are `[75, 80, 82, 85]` in `next.config.ts`.
- Screenshots of live projects were captured with Playwright at 1440×900 (`cover.jpg`) and 390×844 (`mobile.jpg`).

## Checks before you finish

1. `npm run typecheck && npm run lint && npm run build` all pass.
2. Open the site at 375, 768 and 1440 px: no horizontal overflow, headings sized correctly, intro plays, wheel turns, project pages open with the curtain.
3. Console has no errors (three.js `THREE.Clock` deprecation and ANGLE shader info logs are known and harmless).
