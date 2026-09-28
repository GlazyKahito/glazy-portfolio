# GLAZY

**A digital space showcasing what I build.**

GLAZY is the personal portfolio of [Krutik Mhatre](https://github.com/GlazyKahito), built as a short film: one full-screen scene at a time, real 4K footage behind every chapter, and a transition of its own between each. Every project on it is live or open source, and every claim on it comes from the resume or a project README.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 with design tokens in `app/globals.css` |
| Motion | GSAP timelines for scene transitions; Motion (`motion/react`) for entrances and UI |
| Footage | Seven 4K stock clips from [Mixkit](https://mixkit.co/license/#videoFree), re-encoded into seamless loops |
| UI primitives | Radix Dialog (menu, resume viewer) |
| Fonts | Instrument Serif (display), Geist (body), Geist Mono (labels) via `next/font` |
| Hosting | Vercel |

## Features

- **Loading screen**: the GLAZY wordmark fills with molten glaze as the site really loads, while the opening scene develops behind it. A device check warns weak hardware and offers the lite version, then a title card opens between letterbox bars.
- **Scene deck**: chapters arrive with an iris, a rise, a zoom-through, opening doors, a sideways slide or a diagonal wipe, each with its own title card; projects swing in sideways in 3D behind a sweep of their own colour. Scroll, swipe, keys, the Continue prompt or the progress rail move one scene, and a move can never be skipped or rushed.
- **No spoilers**: the next scene is never visible early; the progress rail and the menu only show chapters you have reached.
- **Project stage**: each project in a browser window that tilts toward the pointer, with its mobile capture scrolling on a phone.
- **Work with me**: a scene for people who want a site built and one for people hiring.
- **Nimbus**: Krutik's cat and the site's guide. Guided answers and actions today; AI is being linked to it.
- **Lite mode**: stills instead of video, offered on the loading screen and again if frames drop; the L key toggles it.
- **Case-study pages** with footage headers, a resume viewer, a viewfinder cursor, reduced-motion support, keyboard paths, sitemap, Open Graph image and JSON-LD.

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
| `data/scenes.ts` | Chapters, their footage, transitions and credits |
| `data/site.ts` | Navigation, metadata, site URL |

### Add a project

1. Add an object to the array in `data/projects.ts` (order = display order). The `Project` type in `lib/types.ts` documents every field.
2. Add a cover to `public/projects/<slug>/cover.jpg` (1440×900 or any 16:10) and, optionally, `mobile.jpg` (390×844) referenced as `mobileImage`.
3. Done. The project scene, detail page, sitemap and metadata update automatically.

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
  scenes/                the scene deck, chapter scenes, project stage, footage player
  navigation/            header and menu
  projects/              case-study page, frames
  ui/                    loader, transitions, cursor, Nimbus, lag watch, reveals, viewer…
data/                    all content (see above)
lib/                     types, motion, deck state, device capability, hooks, utils
public/                  video/, projects/<slug>/…, resume/
docs/                    EXPERIENCE.md: design notes, credits, footage prompts
```

## Future expansion

The architecture leaves room for case-study MDX, a blog or writing section, experiments, client work, a GitHub activity feed, certifications and testimonials: add a data file and a scene (an entry in the `STEPS` list of the deck), and reuse `RevealWords`, `Rise`, `Kicker` and the motion vocabulary in `lib/motion.ts`.
