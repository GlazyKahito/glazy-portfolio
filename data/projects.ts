import type { Project } from "@/lib/types";

/**
 * PROJECT SHOWCASE DATA
 * ---------------------
 * To add a project:
 *   1. Add an object to the array below (order = display order).
 *   2. Drop a cover image in /public/projects/<slug>/cover.jpg (1440×900 works well).
 *   3. Done. The showcase, detail page, sitemap and OG image update automatically.
 *
 * Keep every claim factual. Only include sections you can back up from the
 * project itself (README, live site, resume). Omit `results` unless measured.
 */
export const projects: Project[] = [
  {
    id: "niyam",
    slug: "niyam",
    title: "NIYAM",
    tagline: "Legal AI that checks every authority against time.",
    description:
      "An AI legal research workspace for Indian lawyers. Every drafted sentence is tied to the judgment paragraph it cites, and every authority is checked against the amendments that came after it.",
    longDescription: [
      "NIYAM is an AI legal research workspace built around a gap the team found in existing tools: an authority is rarely verified against India's amendment history (22,914 amendment events across 883 acts) before a lawyer relies on it, and the reasoning is rarely tied to the paragraphs it comes from.",
      "A lawyer drops in the case papers. NIYAM extracts the matter's timeline (agreement, cause of action, suit dates), searches the judgment corpus with hybrid retrieval, and runs every authority through a deterministic temporal validity engine that marks it checked-clear, recast, superseded or unverified. Drafting uses only retrieved judgments, one citation per sentence, and a hearing simulation lets the defence attack the weakest citation first.",
      "It runs locally on one laptop from a 4 GB SQLite corpus, cache-first, so it keeps working with the network down. NIYAM is the final build of LexTemporal, the team's earlier prototype, and is deployed at the prototype's original address.",
    ],
    category: "AI Product",
    technologies: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "SQLite", "DuckDB", "NVIDIA NIM", "Google Gemini", "tesseract.js", "Zod"],
    year: "2026",
    status: "live",
    featured: true,
    image: {
      src: "/projects/niyam/cover.jpg",
      alt: "NIYAM drafting a plaintiff's arguments, every sentence tagged with the paragraph it rests on",
      width: 1440,
      height: 900,
    },
    gallery: [
      {
        src: "/projects/niyam/research.jpg",
        alt: "A research answer: timeline found, 133,947 passages searched, two amendments flagged",
        width: 1280,
        height: 716,
      },
      {
        src: "/projects/niyam/architecture.jpg",
        alt: "Architecture from the team's pitch: workspace, local validity core, LLM layer, governed output",
        width: 1280,
        height: 659,
      },
    ],
    // Deployed under the prototype's original project name.
    live: "https://lextemporal.vercel.app",
    demo: "https://www.youtube.com/watch?v=5LjIsasLR3I",
    caseStudy: true,
    hue: 42,
    problem: [
      "General-purpose LLMs hallucinate on legal questions, and even grounded legal research tools still do. None of the tools the team surveyed support their reasoning with the paragraphs it comes from.",
      "Indian law changes in waves. An authority can be overtaken by an amendment that is not visible on the face of the judgment, so it has to be checked against the matter's own timeline before a lawyer can rely on it.",
    ],
    solution: [
      "Timeline extraction reads the agreement, cause-of-action and suit dates from the papers; those dates govern every check.",
      "Hybrid retrieval: a binary-vector scan (1 bit per dimension, Hamming distance), cross-encoder reranking, and provision and citation graph expansion.",
      "A deterministic temporal validity engine, with no LLM in it, compares the provisions an authority relies on with the statute amendment graph and the matter's timeline, and flags it checked-clear, recast, superseded or unverified.",
      "Governed output: a citation rail checks every drafted sentence against the paragraph it cites, the autonomy policy is enforced server-side, and nothing is exported until a named person signs off.",
    ],
    features: [
      "Drop in case papers: born-digital PDFs through unpdf, scans through tesseract.js, all on the device",
      "One agent conversation per matter, with an intent router for research, drafting, simulation and chat",
      "Drafted arguments where every sentence carries the document and paragraph it stands on; click a tag to read that paragraph",
      "Hearing simulation in a fixed order: openings, the bench's question, debate, verdict",
      "Every model call cached in SQLite by prompt hash",
      "Append-only audit of every search, flag, draft, override, hearing and sign-off",
    ],
    architecture: [
      "Next.js 16.3, React 19.2, TypeScript 5; Tailwind CSS v4, shadcn/ui and Zustand; react-markdown for work product",
      "Next.js Route Handlers on the Node runtime: 16 API routes",
      "NVIDIA NIM for embeddings, reranking and the agent (Nemotron); Gemini drives drafting and simulation",
      "Binary vector index, brute force: 1.19 s across 3.4M vectors",
      "SQLite data layer: 4 GB, 23 tables, 13.2M rows, 5.7K full texts, 134K chunks; cache-first",
      "Offline ingest: DuckDB streams remote Parquet (AWS, Hugging Face), pypdf plus a statute-relevance gate (about 1.7% kept), orchestrated with uv",
      "Statute graph mined from 883 acts and 22,914 amendment events, core rows hand-verified against India Code",
    ],
    context: "Team project, presented as ImpactX 2026 · SIH26_12 at Somaiya Vidyavihar University. LexTemporal was the earlier prototype.",
  },
  {
    id: "scamshield",
    slug: "scamshield",
    title: "ScamShield",
    tagline: "An AI security analyst for normal people.",
    description:
      "Analyses suspicious messages and links, then explains why something looks risky, how the attack would work and what to do next, instead of returning a bare verdict.",
    longDescription: [
      "ScamShield analyses suspicious SMS, WhatsApp messages, emails, DMs and links. Most scam-detection tools answer the wrong question: they say \"this is a scam\" and stop. ScamShield explains why something looks risky, how the attack would work, and what to do next, so people recognise the next one without help.",
      "It runs two independent analyses and shows its working. A deterministic rule engine and URL analyzer run first and always, producing a complete report on their own. Google Gemini adds the reading of intent that pattern matching cannot do. Pull the API key out and ScamShield still works; that is a deliberate, tested architectural property.",
      "The full product is live: a landing page, an analyzer that takes text, links or a screenshot, shareable threat reports, an attack simulator that walks through how a scam unfolds, a dashboard of past analyses and a library of common scams.",
    ],
    category: "Security",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "Zod",
      "Recharts",
      "Google Gemini API",
    ],
    year: "2026",
    status: "live",
    featured: true,
    image: {
      src: "/projects/scamshield/cover.jpg",
      alt: "ScamShield — AI security analyst interface",
      width: 1440,
      height: 900,
    },
    mobileImage: { src: "/projects/scamshield/mobile.jpg", alt: "ScamShield on mobile", width: 390, height: 844 },
    github: "https://github.com/GlazyKahito/scamshield",
    live: "https://scamshield-olive.vercel.app",
    caseStudy: true,
    hue: 160,
    problem: [
      "Verdict-only scam detectors help once and teach nothing. When they are wrong, the user has no way to tell.",
      "The people most often targeted, such as parents, students and first-time earners, need to understand what they are looking at, not just be told yes or no.",
    ],
    solution: [
      "A deterministic rule engine and URL structural analyzer produce named signals with quoted excerpts from the user's own message.",
      "Gemini runs as a semantic layer on top, returning a fixed JSON schema that is re-validated server-side with Zod.",
      "A documented fusion formula (rules 55%, AI 45%) produces a transparent score; when the AI layer is unavailable the rule score stands alone rather than being scaled down.",
    ],
    features: [
      "Analyzer for text, links and screenshots, with a full threat report for each",
      "Shareable report pages, an attack simulator, a dashboard of past analyses and a scam library",
      "Deterministic message rule engine with weighted, de-duplicated signals",
      "URL structural analysis (IP hosts, punycode, shorteners, sensitive paths)",
      "Brand-impersonation heuristic",
      "Gemini semantic layer with structured output",
      "Model fallbacks, retries, request timeouts, rate limiting and input validation",
      "Works fully without an API key",
    ],
    architecture: [
      "Input validation (Zod, server-side) → text and URL extraction",
      "Rule engine + URL analyzer run in parallel → security signals",
      "Gemini structured JSON → Zod validation and semantic repair",
      "Risk engine fuses both scores → threat report with severity bands",
      "Prompt-injection defences: structured output, per-request random delimiters, explicit system instructions, server-side re-validation",
      "GEMINI_API_KEY is read in a single server-only module and never exposed to the client",
    ],
    results: [
      "Measured scores from the deterministic test suite: banking phishing 66, fake internship 54, UPI PIN scam 55, ordinary message 0.",
      "Submitted messages are never written to application logs; nothing is persisted unless the user explicitly saves an analysis.",
    ],
    context: "Personal project.",
  },
  {
    id: "climatiq",
    slug: "climatiq",
    title: "CLIMATIQ",
    tagline: "Understand the heat. Anticipate the risk.",
    description:
      "An AI-assisted heatwave decision-support platform for India: a command centre with district-level heat risk, 7-day forecasts, human-approved AI advisories, a response CRM and a public portal.",
    longDescription: [
      "CLIMATIQ is a climate-intelligence and heatwave-response platform for India: nationwide monitoring, a transparent heat-risk forecasting model, human-approved AI advisories, automated alerts, response coordination and a public climate portal, in one role-aware web app.",
      "Real data, honestly labelled. History and normals come from ERA5 reanalysis and live guidance from Open-Meteo's forecast API, and the demo replays the late-May 2024 North-India heatwave. It is a decision-support prototype, not an official warning service: its forecasts and advisories are always labelled as its own and never replace warnings from the India Meteorological Department.",
    ],
    category: "Full-Stack",
    technologies: ["Next.js", "React 19", "TypeScript", "PostgreSQL", "Drizzle ORM", "MapLibre GL", "Three.js", "GSAP", "Recharts", "Google Gemini", "Claude API", "Playwright"],
    year: "2026",
    status: "live",
    featured: true,
    image: {
      src: "/projects/climatiq/cover.jpg",
      alt: "CLIMATIQ command centre: India heat situation, the 3D heat-risk map and the regional overview",
      width: 1440,
      height: 900,
    },
    mobileImage: { src: "/projects/climatiq/mobile.jpg", alt: "CLIMATIQ on mobile", width: 390, height: 844 },
    gallery: [
      {
        src: "/projects/climatiq/home.jpg",
        alt: "The homepage: a 3D globe tinted with real ERA5 heat data",
        width: 1280,
        height: 800,
      },
    ],
    github: "https://github.com/GlazyKahito/climatiq",
    live: "https://climatiq.vercel.app",
    caseStudy: true,
    hue: 350,
    features: [
      "Command centre: India map in 2D or 3D (height is the predicted maximum temperature) with a state and district heat-risk choropleth, a 1° heat layer, stations, drill-down and comparison mode",
      "Heatwave prediction: 7-day forecasts for all 36 states and UTs and 230 pilot districts, with uncertainty bands, IMD-criteria severity, confidence and contributing factors",
      "AI advisories and alerts: Gemini, Claude or deterministic templates, validated output for four audiences, draft → approve → publish, deduplicated alerts",
      "Response CRM: incidents, assignments, tasks, an activity timeline and team workload",
      "Climate analytics: five-year history, heatwave frequency, forecast-vs-observed accuracy, CSV export",
      "A public portal with a plain-language heat outlook and safety guidance, no account needed",
      "Administration: source and ingestion health, region-scoped roles, audit log and thresholds",
    ],
    architecture: [
      "Next.js 16 App Router, React 19, TypeScript",
      "PostgreSQL with Drizzle ORM; sessions with jose and bcrypt",
      "MapLibre GL and react-map-gl for the maps; Three.js / React Three Fiber, d3-geo and topojson for the globe",
      "AI providers: Google Gemini and Anthropic Claude, with a deterministic template fallback",
      "Tests: Vitest, Playwright and axe-core accessibility checks",
    ],
    context: "Hackathon prototype: decision support, not an official IMD warning service.",
  },
  {
    id: "dcn-virtual-lab",
    slug: "dcn-virtual-lab",
    title: "DCN Virtual Lab",
    tagline: "Network design, packet simulation and fault diagnosis.",
    description:
      "A full Data Communication & Networking virtual lab: a drag-and-drop topology designer, a real packet-animation simulator with a Wireshark-style inspector, and a rule-based fault-diagnosis engine.",
    longDescription: [
      "An academic-grade virtual laboratory that covers all eight DCN course experiments in one interactive system. Students design a network by dragging PCs, switches, routers and servers onto a canvas, configure IP, mask, gateway and DNS, and validate the topology against rules.",
      "The simulator animates real packets (ICMP, TCP handshake, UDP) along the topology with a Wireshark-style dissector down to Ethernet, IPv4, TCP/UDP and payload. A rule-based fault-diagnosis engine models ten realistic multi-layer faults and walks students through symptom → hypothesis → test → evidence → root cause → corrective action → verification.",
      "It also ships interactive tools for subnetting, (7,4) Hamming-code error correction and TCP header analysis, assessments, a completion report, and \"Rogue Packet\", a 2D mini-game where every clue comes from a real simulated network model.",
    ],
    category: "Simulation",
    technologies: [
      "React 19",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "Three.js",
      "React Three Fiber",
      "WebGL",
      "Motion",
    ],
    year: "2026",
    status: "live",
    featured: false,
    image: {
      src: "/projects/dcn-virtual-lab/cover.jpg",
      alt: "DCN Virtual Lab — network topology designer and simulator",
      width: 1440,
      height: 900,
    },
    mobileImage: { src: "/projects/dcn-virtual-lab/mobile.jpg", alt: "DCN Virtual Lab on mobile", width: 390, height: 844 },
    github:
      "https://github.com/GlazyKahito/INTELLIGENT-NETWORK-DESIGN-SIMULATION-FAULT-DIAGNOSIS-SYSTEM",
    live: "https://dcn-proj.vercel.app",
    caseStudy: true,
    hue: 200,
    problem: [
      "Networking labs are usually taught as separate, disconnected experiments with fake or hand-written command output.",
      "Students rarely get to break a network on purpose and reason their way back to the root cause.",
    ],
    solution: [
      "One system that synthesises Experiments 1–7 into a capstone: design, simulate, inject faults, diagnose, verify.",
      "No fake output: every ping, ARP lookup and traceroute hop is computed from the simulated network graph.",
      "A deductive troubleshooting loop with ten realistic faults across the OSI and TCP/IP stack.",
    ],
    features: [
      "Drag-and-drop topology designer with IP/mask/gateway/DNS configuration and validation",
      "Discrete-event packet simulation with SVG path animation and a layer-by-layer packet inspector",
      "Ten multi-layer fault scenarios with a rule-based root-cause engine",
      "Interactive subnetting, Hamming (7,4) and RFC 793 TCP header tools",
      "Networking command runner: ping, ipconfig, tracert, arp, nslookup, netstat",
      "Assessments, completion report with JSON export, and the \"Rogue Packet\" mini-game",
    ],
    architecture: [
      "React 19 + TypeScript + Vite, Tailwind CSS with shadcn/ui theme tokens",
      "Three.js / React Three Fiber warp-tunnel opening sequence, lazy-loaded and played once per session",
      "WebGL2 shader background capped at 30 fps, half resolution, paused when hidden",
      "Motion-based packet/node animation language that honours prefers-reduced-motion",
      "Procedural Web Audio synthesizer with no external audio files",
    ],
    context: "Coursework capstone, Somaiya Virtual Labs — DCN laboratory.",
  },
  {
    id: "crm360",
    slug: "crm360",
    title: "CRM360",
    tagline: "A full-stack CRM for small sales teams.",
    description:
      "A MERN customer-relationship platform with a drag-and-drop sales pipeline, contact and deal tracking, role-based access and a notifications system, deployed to Vercel.",
    longDescription: [
      "CRM360 brings customers, leads, the sales pipeline, tasks and team notifications into one workspace for small and mid-sized sales teams, with role-based access for admins, sales managers and sales executives.",
      "Permissions are enforced by the API and only mirrored by the interface. The pipeline is a Kanban board across New, Contacted, Qualified, Proposal Sent, Won and Lost, with drag and drop that works with mouse, touch and keyboard.",
    ],
    category: "Full-Stack",
    technologies: [
      "MongoDB",
      "Express 5",
      "React 19",
      "Node.js",
      "React Router 7",
      "Zod",
      "JWT",
      "Vercel Serverless",
    ],
    year: "2026",
    status: "live",
    featured: true,
    image: {
      src: "/projects/crm360/cover.jpg",
      alt: "CRM360 dashboard in the demo workspace: customers, leads, sales overview and pipeline value",
      width: 1440,
      height: 900,
    },
    mobileImage: { src: "/projects/crm360/mobile.jpg", alt: "CRM360 on mobile", width: 390, height: 844 },
    gallery: [
      {
        src: "/projects/crm360/pipeline.jpg",
        alt: "The sales pipeline: deals across stages with owners and follow-up dates (demo workspace)",
        width: 1280,
        height: 800,
      },
    ],
    github: "https://github.com/GlazyKahito/majorprojectwebdev",
    live: "https://majorprojectwebdev.vercel.app",
    caseStudy: true,
    hue: 265,
    features: [
      "JWT authentication with password reset, profile management and session invalidation",
      "Role-based permissions for admin, sales manager and sales executive",
      "Customers and leads with search, filters, CSV export and one-click lead conversion",
      "Kanban pipeline with weighted forecast and stage totals",
      "Tasks, dashboard analytics aggregated from MongoDB, and per-user notification preferences",
      "Global search and command palette, light/dark/system themes, responsive layouts",
    ],
    architecture: [
      "React 19 + React Router 7 + Vite client with Recharts and dnd-kit",
      "Express 5 API with Zod validation, Helmet and rate limiting",
      "MongoDB with Mongoose; JSON Web Tokens and bcrypt",
      "Vercel: static client plus serverless API entry",
    ],
    context: "Minor project during the Ediglobe web development internship.",
  },
  {
    id: "greyatom-dashboard",
    slug: "greyatom-dashboard",
    title: "Delivery Exceptions Dashboard",
    tagline: "An internal ops tool for a logistics brief.",
    description:
      "An internal delivery-exceptions dashboard for a GreyAtom Logistics brief, with dynamic filtering, ticket detail views and a workflow to log, filter and resolve exceptions by priority and status.",
    longDescription: [
      "Built for a GreyAtom Logistics brief during the Ediglobe internship, this dashboard gives an operations team a single view of delivery exceptions. Exceptions can be logged through a submission workflow, filtered dynamically, opened in a detail view and resolved by priority and status.",
      "It is written in plain HTML, CSS and JavaScript with no framework, which keeps it fast and easy to hand over.",
    ],
    category: "Frontend",
    technologies: ["HTML5", "CSS3", "JavaScript"],
    year: "2026",
    status: "live",
    featured: false,
    image: {
      src: "/projects/greyatom-dashboard/cover.jpg",
      alt: "GreyAtom Logistics delivery exceptions dashboard",
      width: 1440,
      height: 900,
    },
    mobileImage: { src: "/projects/greyatom-dashboard/mobile.jpg", alt: "Delivery exceptions dashboard on mobile", width: 390, height: 844 },
    github: "https://github.com/GlazyKahito/miniprojectwebdev",
    live: "https://miniprojectwebdev.vercel.app",
    caseStudy: true,
    hue: 20,
    features: [
      "Dynamic filtering of exceptions",
      "Ticket detail views",
      "Submission workflow to log new exceptions",
      "Resolve by priority and status",
    ],
    context: "Mini project during the Ediglobe web development internship.",
  },
  {
    id: "grove",
    slug: "grove",
    title: "Grove",
    tagline: "You are made of what you repeat.",
    description:
      "A free, local-first habit tracker: one tap to log a day, a year of habits in one view, and streaks that carry weight.",
    longDescription: [
      "Grove is a habit tracker designed around motion: the interface is animation-driven so that checking in on a habit feels rewarding rather than administrative.",
      "It is built with plain HTML, CSS and JavaScript plus three.js for the landing scene, and keeps every habit in the browser, so there is no account and no server.",
    ],
    category: "Frontend",
    technologies: ["HTML5", "CSS3", "JavaScript", "three.js"],
    year: "2026",
    status: "live",
    featured: false,
    image: {
      src: "/projects/grove/cover.jpg",
      alt: "Grove — habit tracker",
      width: 1440,
      height: 900,
    },
    mobileImage: { src: "/projects/grove/mobile.jpg", alt: "Grove on mobile", width: 390, height: 844 },
    github: "https://github.com/GlazyKahito/grove",
    live: "https://grove-habit-tracker-vert.vercel.app",
    caseStudy: true,
    hue: 120,
    features: [
      "Animation-driven habit check-ins",
      "Local-first: habits stay in the browser, with JSON export and import",
      "Keyboard shortcuts and one-tap logging",
    ],
    context: "Personal project.",
  },
  {
    id: "prism",
    slug: "prism",
    title: "Prism",
    tagline: "Messy docs in. Clear answers out.",
    description:
      "A concept launch site for a made-up AI knowledge-search product, opening with a cinematic light sequence that hands off to a real-time refractive glass prism.",
    longDescription: [
      "Prism is a concept site GLAZY designed and built to show what a SaaS launch page can feel like: a fictional product that turns a company's scattered docs into cited, permission-aware answers.",
      "A short opening sequence splits a beam of light into a spectrum while the page genuinely loads, then hands off to the hero's glass prism, rendered in real time with refraction and chromatic aberration. Below it, the product is explained through live HTML mock-ups rather than screenshots: a search box that types, an answer whose citations light up their sources, a working permissions switch.",
    ],
    category: "Concept",
    technologies: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Three.js", "React Three Fiber", "drei", "Motion"],
    year: "2026",
    status: "live",
    featured: false,
    image: {
      src: "/projects/prism/cover.jpg",
      alt: "Prism concept site: the headline beside a glass prism splitting a beam of light into a spectrum",
      width: 1440,
      height: 900,
    },
    mobileImage: { src: "/projects/prism/mobile.jpg", alt: "Prism on mobile", width: 390, height: 844 },
    github: "https://github.com/GlazyKahito/prism-glazy",
    live: "https://prism-glazy.vercel.app",
    caseStudy: true,
    hue: 265,
    features: [
      "Opening sequence: a beam splits into a spectrum while a real loading percentage tracks fonts, the 3D code and the first frames; skippable, once per session",
      "Real-time glass prism (drei MeshTransmissionMaterial) lit only by Lightformers, with custom beam and spectrum shaders; turns toward the pointer",
      "Adaptive quality: pixel density drops if frames do, rendering pauses off screen, and weak devices get a matching CSS and SVG hero",
      "Six-card bento of live HTML mock-ups: typing search, cited answer, permissions switch, connectors, index counter",
      "Scroll-driven how-it-works, accessible pricing toggle and FAQ, full metadata and social card",
    ],
    context: "Concept site for a fictional product, designed and built by GLAZY. The brand, customers and prices are made up.",
  },
  {
    id: "maison",
    slug: "maison",
    title: "Maison",
    tagline: "Velvet, wood & patience, configured live.",
    description:
      "A concept store for a made-up furniture atelier: the hero is a live 3D configurator where you turn a chair or sofa, change its velvet and wood, and add that exact build to a working cart.",
    longDescription: [
      "Maison is a concept e-commerce site GLAZY designed and built for a fictional furniture atelier between Copenhagen and Mumbai: cream and ink, a terracotta accent, editorial serif type.",
      "The product is the hero. A real 3D lounge chair (and a sofa) turns slowly and responds to dragging, swiping and the arrow keys; five velvets and three finishes recolour it live with a smooth tween, and the configured piece goes into a working cart drawer. The opening is a showroom reveal: a line drawing of the chair traces itself as the model really loads, then curtains part onto the live 3D chair.",
    ],
    category: "Concept",
    technologies: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Three.js", "React Three Fiber", "drei", "Motion", "glTF"],
    year: "2026",
    status: "live",
    featured: false,
    image: {
      src: "/projects/maison/cover.jpg",
      alt: "Maison concept store: a 3D velvet lounge chair beside fabric swatches, wood finishes and an add-to-cart panel",
      width: 1440,
      height: 900,
    },
    mobileImage: { src: "/projects/maison/mobile.jpg", alt: "Maison on mobile", width: 390, height: 844 },
    github: "https://github.com/GlazyKahito/maison-glazy",
    live: "https://maison-glazy.vercel.app",
    caseStudy: true,
    hue: 18,
    features: [
      "Live 3D configurator (React Three Fiber, glTF): five velvets and three finishes recolour the model with a smooth tween; drag, swipe or arrow keys to turn it",
      "Two products, a chair and a sofa, with models compressed from 4.1 MB and 3.1 MB to 705 KB and 394 KB",
      "Showroom intro: the chair's line drawing traces itself with real loading progress, then curtains part onto the live model; skippable, once per session",
      "Working cart drawer with quantities and a focus trap, saved locally; clearly labelled a concept store",
      "Collection, craft and materials sections with staggered reveals; baked ground shadows; a still image where WebGL is unavailable",
    ],
    context: "Concept store for a fictional brand, designed and built by GLAZY; nothing is sold. 3D models from the Khronos glTF Sample Assets: Sheen Chair (© 2020 Wayfair, CC0 1.0) and Glam Velvet Sofa (© 2021 Wayfair, CC BY 4.0), both by Eric Chadwick, modified.",
  },
  {
    id: "ember",
    slug: "ember",
    title: "Ember",
    tagline: "A kitchen built around one wood fire.",
    description:
      "A concept site for a made-up wood-fire restaurant in Bandra West, with a real-time WebGL fire: a shader flame field, rising embers that react to the pointer, and a wordmark shimmering in the heat.",
    longDescription: [
      "Ember is a concept restaurant site GLAZY designed and built to show what a small business's website can feel like: a fictional kitchen and bar in Bandra West, Mumbai.",
      "The fire is real-time and written by hand in GLSL: a flame field of warped noise that bends in a breeze, up to 3,000 embers drifting on curl noise and pushed by the pointer, and the EMBER wordmark rendered in the heat haze. The opening starts in darkness with a single spark whose counter follows real loading, then the letters catch one by one. Below it sits everything a restaurant actually needs: a menu with accessible tabs and prices in rupees, a reservation form with real validation, hours with today highlighted and a live open/closed badge, and a hand-drawn map.",
    ],
    category: "Concept",
    technologies: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Three.js", "React Three Fiber", "GLSL", "Zod", "Motion"],
    year: "2026",
    status: "live",
    featured: false,
    image: {
      src: "/projects/ember/cover.jpg",
      alt: "Ember concept site: a real-time wood fire with rising embers below a giant EMBER wordmark",
      width: 1440,
      height: 900,
    },
    mobileImage: { src: "/projects/ember/mobile.jpg", alt: "Ember on mobile", width: 390, height: 844 },
    github: "https://github.com/GlazyKahito/ember-glazy",
    live: "https://ember-glazy.vercel.app",
    caseStudy: true,
    hue: 22,
    features: [
      "Hand-written GLSL fire: a warped-noise flame field, up to 3,000 additive embers on curl noise that react to the pointer, and a heat-hazed wordmark",
      "Opening sequence: a spark and a counter that follow real loading (fonts, shaders, the wordmark texture), then the letters catch one by one; skippable, once per session",
      "Menu with accessible tabs (arrow keys, Home and End), prices in rupees and veg/non-veg marks",
      "Reservation form validated with Zod: a 14-day picker in Mumbai time, slots per day, an error summary and focus on the first problem",
      "Adaptive particle count, off-screen pause, a CSS/SVG fallback without WebGL 2 and a still frame under reduced motion",
    ],
    context: "Concept site for a fictional restaurant, designed and built by GLAZY; reservations are not real. Noise functions follow webgl-noise by Ian McEwan and Stefan Gustavson (MIT).",
  },
];

/** Projects with `featured: true`, in display order. */
export const featuredProjects = projects.filter((p) => p.featured);

/** Concept sites for made-up brands, shown together in one scene at the end of "The work". */
export const conceptProjects = projects.filter((p) => p.category === "Concept");

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Zero-padded ordinal for a project based on its position in the list. */
export function projectNumber(project: Project): string {
  if (project.number) return project.number;
  const index = projects.findIndex((p) => p.id === project.id);
  return String(index + 1).padStart(2, "0");
}

/** Previous/next neighbours for the detail page footer. */
export function getAdjacentProjects(slug: string) {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: undefined, next: undefined };
  return {
    prev: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}
