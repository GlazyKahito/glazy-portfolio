# GLAZY

**A digital space showcasing what I build.**

GLAZY is the personal portfolio and client-facing project showcase of [Krutik Mhatre](https://github.com/GlazyKahito): a cinematic, data-driven site built with Next.js, React Three Fiber and Motion. Every project on it is live or open source, and every claim on it comes from the resume or a project README.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 with design tokens in `app/globals.css` |
| 3D | three.js, React Three Fiber, drei (custom GLSL "glaze" surface, iridescent shards, wireframe construction scene) |
| Motion | Motion (`motion/react`) for reveals, scroll-linked transforms and route transitions; Lenis for smooth scrolling |
| UI primitives | Radix Dialog (resume viewer, mobile menu); spotlight pattern after 21st.dev |
| Fonts | Archivo (display, expanded), Manrope (body), Fraunces (accent italics), Geist Mono via `next/font` |
| Hosting | Vercel |

## Features

- **Opening sequence**: the wordmark traces itself while a counter runs, then the curtain lifts into the hero.
- **Hero**: WebGL black-glass surface lit by a pointer-following key light, floating iridescent shards, scroll parallax, a decoding roles line and magnetic CTAs. Graceful CSS fallback on low-end devices or without WebGL.
- **Project exhibition**: a scroll-driven 3D wheel of project panels on desktop (arrow keys and buttons work too), a snap carousel on phones. Screenshots sit inside a browser frame with the mobile capture as an overlapping phone.
- **Project pages**: overview, problem, solution, features, architecture and documented outcomes, with prev/next navigation and curtain route transitions.
- **In progress**: a data-driven work bench with an "unfinished structure" 3D scene whose completion tracks the average progress.
- **About / Stack / Contact**: editorial typography, tilt cards with spotlight hover, an orbital technology system with usage notes, and a final "Let's build something" scene.
- **Resume**: full-screen viewer (embedded PDF on desktop, rendered preview on phones) with open and download actions.
- **Custom cursor**, reduced-motion support, keyboard navigation, semantic HTML, sitemap, robots, Open Graph image, JSON-LD.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

Copy `.env.example` to `.env.local` if you add integrations. Nothing is required to run the site today. Never commit `.env` or `.env.local`.

## Content lives in `data/`

The site is data-driven. Components never hard-code facts.

| File | What it holds |
| --- | --- |
| `data/profile.ts` | Name, roles, contact, socials, experience, education, about paragraphs, resume path |
| `data/projects.ts` | The project showcase and detail pages |
| `data/in-progress.ts` | The "In progress" bench |
| `data/skills.ts` | The tech stack, each entry with how it is used |
| `data/site.ts` | Navigation, metadata, site URL |

### Add a project

1. Add an object to the array in `data/projects.ts` (order = display order). The `Project` type in `lib/types.ts` documents every field.
2. Add a cover to `public/projects/<slug>/cover.jpg` (1440×900 or any 16:10) and, optionally, `mobile.jpg` (390×844) referenced as `mobileImage`.
3. Done. The wheel, carousel, detail page, sitemap and metadata update automatically.

Only include the sections you can back up (`problem`, `solution`, `features`, `architecture`, `results`). Omit `results` unless it is a measured or documented outcome.

### Add an in-progress item

1. Add an object to `data/in-progress.ts` with an honest `progress` (0–100) and a `status`.
2. Done. Remove it, or move it to `data/projects.ts`, when it ships.

### Update the resume

Replace `public/resume/Krutik_Mhatre_Resume.pdf` and regenerate `public/resume/preview.jpg` (first page rendered at ~1224×1584) for the mobile viewer.

## Project structure

```
app/                     routes, layout, metadata, icon + OG image
  projects/[slug]/       project detail pages (static params from data)
components/
  3d/                    R3F scenes, shaders, device-tier gate
  navigation/            transforming nav, mobile menu
  projects/              wheel/carousel showcase, frames, detail page
  sections/              Hero, Projects, InProgress, About, TechStack, Contact
  ui/                    intro, transitions, cursor, buttons, reveals, viewer…
data/                    all content (see above)
lib/                     types, motion vocabulary, hooks, utils
public/                  projects/<slug>/…, resume/
```

## Future expansion

The architecture leaves room for case-study MDX, a blog or writing section, experiments, client work, a GitHub activity feed, certifications and testimonials: add a data file and a section, and reuse `SectionHeading`, `Reveal`, `Spotlight` and the motion vocabulary in `lib/motion.ts`.
