# GLAZY — guide for coding agents

This file is for any AI assistant or automated tool working in this repository (Claude Code reads it via `CLAUDE.md`, others read it directly). Read it before changing anything.

## What this is

GLAZY is a freelance web and SaaS agency founded by Krutik Mhatre, and this is its site: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, GSAP, Motion. It is deployed on Vercel from the `main` branch. The voice is the agency's ("we"); never call GLAZY a studio. The founder chapter speaks about Krutik by name. Never invent team members, clients or testimonials.

The home page is a **scene deck**: one full-screen scene at a time, grouped into chapters (`data/scenes.ts`): the opening, What we make, The work, In the works, The founder, The toolkit, Start a project. The opening is a **depth poster** (a 4K still split into a sky plate and a cut-out ridge with the wordmark between them); every other chapter has its own 4K footage (`public/video/`), all in one palette: dusk or the edge of night, warm horizon, dark silhouettes. New footage must match it (grade it warm in the encode if needed), and so must colours: use the warm `ink`, `bone`, `glaze` (ember), `cream`, `peach` and `ember` tokens. Each chapter arrives with its own transition (zoom, glitch, iris, shutter, film burn, doors, mosaic); projects move sideways. Moves are locked until they finish, so nothing can be skipped. Case-study pages are ordinary scrolling pages.

## Ground rules

1. **Facts come from `data/`.** Never invent projects, metrics, technologies, clients, testimonials or achievements. If a fact is not in `data/*.ts`, the resume (`public/resume/`) or a linked repository README, it does not go on the site.
2. **Content is data, presentation is components.** Adding a project means editing `data/projects.ts` and dropping images in `public/projects/<slug>/`. Do not hard-code project details in components.
3. **No secrets in the repo.** `.env` and `.env.local` are git-ignored; document new variables in `.env.example` with empty values.
4. **Respect the motion system.** Use the eases, durations and variants in `lib/motion.ts`; deck transitions are GSAP timelines in `components/scenes/SceneDeck.tsx`. Everything must degrade under `prefers-reduced-motion` and on touch devices (see `lib/hooks/use-device.ts`).
5. **Full quality by default, lite by choice.** Everyone gets the 4K footage; there is no silent downgrade. The loader offers every visitor 4K or Lite and stops weak devices (software rendering, data saver, slow network, ≤2 GB memory or ≤2 cores) to offer Lite first; `LagWatch` offers it again if frames drop; the header switch and the L key toggle it (`lib/capability.ts`). Lite runs on the weakest machines: stills instead of video, and `html[data-lite]` (set before first paint) strips backdrop blur, filters and loops, with crossfades between chapters. Only one clip plays at a time. Footage loads a chapter ahead, once the opening has played: once the scene on screen has settled, the next chapter's clip is fetched, then warmed (mounted paused, so its decoder is set up and its first frame decoded while nothing moves); chapters two or more away are let go.
6. **Smooth means compositor-only.** Animate transforms and opacity; never animate `filter: blur()` on full-screen layers, and pause decorative loops that are off screen.
7. **Accessibility is not optional.** Semantic headings in order, focus-visible styles, `aria-*` on custom controls, alt text from data, keyboard paths for every interaction.
8. **No AI attribution.** Commit messages, PR descriptions and files carry no AI co-author trailers or "generated with" lines.

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
| Loading screen (3D extruded GLAZY lettering filling with glaze; 4K / Lite choice; device check; letterbox opening) | `components/ui/Intro.tsx`, `components/ui/LoaderType3D.tsx` |
| Project screens assembling like a jigsaw | `components/scenes/PuzzleImage.tsx` |
| Scene deck (steps, transitions, input lock, progress rail, Continue prompt) | `components/scenes/SceneDeck.tsx` |
| The dock: one bar at the foot of the screen (a notice, the Continue prompt, Mr. Nimbus) | `components/ui/Dock.tsx`, `lib/dock.ts` |
| Chapters, footage, transition styles, hash aliases | `data/scenes.ts` |
| Services and how a project runs | `data/services.ts` |
| The opening's depth poster (sky, wordmark, ridge, parallax) | `components/scenes/DepthPoster.tsx`, `public/scenes/` |
| The services poster | `components/scenes/ServicesScene.tsx` |
| Scene content | `components/scenes/ChapterScenes.tsx`, `ProjectScene.tsx`, `HireScenes.tsx` (start a project, recruiters), `Stack.tsx`, `Contact.tsx` |
| Footage player (4K, poster first, lite stills) | `components/scenes/SceneVideo.tsx` |
| Deck state shared with the header and loader | `lib/deck.ts` |
| Header and menu (only reached chapters are listed) | `components/navigation/Header.tsx` |
| Mr. Nimbus, the office cat and guide (guided answers; AI via the gateway; loaded after the opening) | `components/ui/Nimbus.tsx`, `components/ui/LazyNimbus.tsx`, `lib/server/nimbus-brain.ts`, `app/api/nimbus/route.ts` |
| Route transitions + `TransitionLink` | `components/ui/PageTransition.tsx` |
| Providers | `components/ui/Providers.tsx` |
| Viewfinder cursor (`data-cursor-label="…"`) | `components/ui/Cursor.tsx` |
| Project detail page | `components/projects/ProjectDetail.tsx`, `app/projects/[slug]/page.tsx` |
| Content types | `lib/types.ts` |
| Colour tokens as plain values (favicon, Open Graph card, logo, theme colour) | `lib/palette.ts` |
| 404 (the opening's poster after sunset; static) | `app/not-found.tsx` |

## Conventions

- Client components start with `"use client"`; sections that only compose are server components.
- Fonts: Instrument Serif (display and italics; one weight, bold is never synthesised), Geist (body), Geist Mono (labels).
- Scene headings cap their size by viewport height too (`min(vw, vh)`), so short laptop screens never overflow.
- The deck mounts only the scene on screen, its neighbours and the scenes already visited; the rest render a plain stub (heading and links) until a move or a jump mounts them. Scene components must work when mounted late.
- A move never makes the GPU start anything new: no decoder is set up and nothing is rasterised mid-move. The layers a move shows (footage layers, arrival cards, overlays) are rasterised ahead of time at 0.2% opacity (`prime` in `SceneDeck.tsx`) and, while near the visitor, hidden with opacity, never `visibility` or `display` (which drop their tiles). New full-screen layers in a move need the same. Never give a scene section a composited opacity (`will-change: opacity`): it becomes a backdrop root and its frosted panels stop blurring the footage.
- Scene entrances (`Rise`, `RevealWords`) are CSS transitions on transform and opacity (`.rise`, `.reveal-unit` in `globals.css`). Keep new loops and entrances on transform and opacity, and let frame loops sleep when idle.
- Custom font-size utilities are `text-display-xl|lg|md|sm`; `lib/utils.ts` teaches tailwind-merge about them. Add new ones in both places.
- Colour tokens: `ink*` backgrounds, `bone*` text, `line*` borders, `glaze` accent. Do not introduce new hex colours in components; add a token (and mirror it in `lib/palette.ts` if an image generator needs it).
- One warm palette. A project's `hue` never reaches the screen as is: tints go through `tint()` / `warmHue()` in `lib/utils.ts`, which fold any hue into the ember-to-amber band. Accents that are not per project use `glaze`, `ember`, `peach` and `cream`.
- Anything that floats at the foot of the screen lives in the dock: render it with `<DockPortal slot="notice" | "center" | "guide">`. Notices (the lite offer, Mr. Nimbus's invitation) take turns through `useNoticeTurn`, so two never show at once; on narrow screens a notice takes the Continue prompt's place. Every scene ends with `pb-[var(--dock-clear)]`, so the dock never covers the end of a scene, and scenes that scroll fade out under the header and above the dock (`section[data-scene]` mask in `globals.css`).
- Legibility over footage: each chapter sets a `scrim` (the side its text sits on, and a strength) in `data/scenes.ts`. Text over footage uses `bone`/`cream` at 75% or more (never `bone-2`/`bone-3`, which are for solid dark pages) and the `legible` text shadow; frosted panels are `bg-black/45` or darker. Accent words in headings are peach italics. Body copy keeps WCAG AA over the brightest frame.
- Images use `next/image`; configured qualities are `[75, 80, 82, 85]` in `next.config.ts`.
- `/video` and `/scenes` are cached as immutable: a new cut or plate gets a new file name.
- New footage: encode a seamless loop (last second cross-faded into the first), H.264 4K, no audio, `+faststart`, plus a poster frame, named `<name>-2160.mp4` / `<name>-poster.jpg`; add it to `footage` in `data/scenes.ts` with its source and licence.
- Screenshots of live projects were captured with Playwright at 1440×900 (`cover.jpg`) and 390×844 (`mobile.jpg`).

## Checks before you finish

1. `npm run typecheck && npm run lint && npm run build` all pass.
2. Open the site at 375, 768 and 1440 px (and a short 1920×843 window): the loader fills and opens, every scene fits or scrolls inside itself, a burst of scroll moves exactly one scene, going back plays the reverse transition, project pages open with the curtain.
3. Console has no errors.

Use headless browsers for these checks; never open visible browser windows on the owner's machine.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
