# GLAZY

**Websites that feel like places.**

GLAZY is a freelance web and SaaS agency founded by [Krutik Mhatre](https://github.com/GlazyKahito). This is its site, built like a short film: one full-screen scene at a time, a depth-poster opening, 4K footage behind every chapter and a transition of its own between each. Every project on it is live or open source, and every fact comes from `data/`.

Live: [glazy-portfolio.vercel.app](https://glazy-portfolio.vercel.app)

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, tokens in `app/globals.css` |
| Motion | GSAP timelines for scene transitions, Motion for entrances and UI |
| Footage | Seven 4K clips from [Mixkit](https://mixkit.co/license/#videoFree), re-encoded as seamless loops |
| Fonts | Instrument Serif, Geist, Geist Mono via `next/font` |
| Hosting | Vercel |

## What's in it

- **Loader:** GLAZY in extruded 3D lettering that fills with glaze as the site loads. Every visitor picks 4K or Lite first, and weak machines are offered Lite up front.
- **Depth-poster opening:** a 4K still split into sky and ridge, with the wordmark rising between them and the planes following the pointer.
- **Scene deck:** chapters arrive with a zoom, glitch, iris, shutter, film burn, doors or mosaic; projects swing in sideways and their screenshots assemble like a jigsaw. Scroll, swipe, keys or the progress rail move exactly one scene, and nothing of the next scene shows early.
- **Start a project:** a brief form that sends by WhatsApp, Gmail or email, plus a scene for recruiters.
- **Mr. Nimbus:** the office cat and guide. Guided answers always work; AI answers come from the Vercel AI Gateway (or Gemini with `GEMINI_API_KEY`), grounded only in `data/`.
- **Lite mode:** stills instead of video and no blur, filters or loops, for the weakest machines. Toggle it from the header or with the L key.
- **Case studies** at `/projects/<slug>`, plus a resume viewer, reduced-motion support, keyboard paths, sitemap, Open Graph image and JSON-LD.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run typecheck
```

Nothing is required to run it. Optional integrations are listed in `.env.example`; copy it to `.env.local` and never commit either.

## Content lives in `data/`

Components never hard-code facts.

| File | Holds |
| --- | --- |
| `data/profile.ts` | Name, roles, contact, experience, education, about |
| `data/projects.ts` | Projects, case studies and concept sites |
| `data/in-progress.ts` | What is being built right now |
| `data/skills.ts` | The toolkit, each entry with how it is used |
| `data/services.ts` | What GLAZY makes and how a project runs |
| `data/scenes.ts` | Chapters, footage, transitions and credits |
| `data/site.ts` | Navigation, metadata, site URL |

**Add a project:** add an object to `data/projects.ts` (the `Project` type in `lib/types.ts` documents each field), and put `cover.jpg` (1440×900) and optionally `mobile.jpg` (390×844) in `public/projects/<slug>/`. The scene, case study, sitemap and metadata follow. Only fill in sections you can back up; leave `results` out unless it was measured.

**Update the resume:** replace `public/resume/Krutik_Mhatre_Resume.pdf` and regenerate `public/resume/preview.jpg` (first page at about 1224×1584).

## Layout

```
app/                  routes, layout, metadata, icon, OG image, API (Nimbus)
components/scenes/    the scene deck, chapter scenes, project stage, footage player
components/ui/        loader, transitions, cursor, Nimbus, lag watch, viewer
components/projects/  case-study page
data/                 all content
lib/                  types, motion, deck state, device capability, utils
public/               video/, scenes/, projects/<slug>/, resume/, nimbus/
docs/EXPERIENCE.md    design notes and footage credits
```

Working on the code? Read `AGENTS.md` first.
