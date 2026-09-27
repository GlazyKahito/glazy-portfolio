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
    id: "lextemporal",
    slug: "lextemporal",
    title: "LexTemporal",
    tagline: "AI legal research that shows its sources.",
    description:
      "An AI-powered legal research tool that traces every generated argument back to the specific judgment paragraph it rests on, and checks authority against a matter's timeline.",
    longDescription: [
      "LexTemporal is an AI-powered legal research tool built around one rule: every generated argument must point back to the exact judgment paragraph it rests on. Instead of producing free-floating text, the system keeps a line from claim to citation.",
      "Authority is checked against a matter's timeline, so an argument cannot silently rely on a judgment that post-dates the facts. Research happens inside a project-based workspace where agent-driven workflows handle search, drafting, simulation and hearing preparation.",
    ],
    category: "AI Product",
    technologies: ["Next.js", "AI agent workflows", "Vercel"],
    year: "2026",
    status: "live",
    featured: true,
    image: {
      src: "/projects/lextemporal/cover.jpg",
      alt: "LexTemporal — AI legal research workspace",
      width: 1120,
      height: 700,
    },
    mobileImage: { src: "/projects/lextemporal/mobile.jpg", alt: "LexTemporal on mobile", width: 390, height: 844 },
    live: "https://lextemporal.vercel.app",
    caseStudy: true,
    hue: 42,
    problem: [
      "Generative legal tools tend to produce confident arguments with no verifiable link to the authority they rely on, which makes them unusable for real matters.",
      "Legal authority is also time-sensitive: a judgment that came after the facts of a matter cannot be relied on as if it were settled law at the time.",
    ],
    solution: [
      "Every generated argument is traced back to the specific judgment paragraph it rests on, so a reader can verify it in one click.",
      "Authority is checked against the matter's timeline before it is used.",
      "Agent-driven workflows (search, draft, simulate, hearing prep) live inside a project-based workspace, so research stays attached to the matter it belongs to.",
    ],
    features: [
      "Paragraph-level citation tracing for generated arguments",
      "Timeline-aware authority checking",
      "Agent workflows: search, draft, simulate, hearing prep",
      "Project-based workspace per matter",
    ],
    context: "Personal project.",
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
    ],
    category: "Security",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "Zod",
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
    featured: true,
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
    featured: false,
    image: {
      src: "/projects/crm360/cover.jpg",
      alt: "CRM360 — sales dashboard",
      width: 1440,
      height: 900,
    },
    mobileImage: { src: "/projects/crm360/mobile.jpg", alt: "CRM360 on mobile", width: 390, height: 844 },
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
      "A polished, animation-driven habit-tracking web app built with JavaScript, Node.js and TypeScript across the front end and back end.",
    longDescription: [
      "Grove is a habit tracker designed around motion: the interface is animation-driven so that checking in on a habit feels rewarding rather than administrative.",
      "It is built with JavaScript, Node.js and TypeScript across both the front end and the back end.",
    ],
    category: "Frontend",
    technologies: ["TypeScript", "JavaScript", "Node.js"],
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
    live: "https://grove-habit-tracker-vert.vercel.app",
    caseStudy: true,
    hue: 120,
    features: [
      "Animation-driven habit check-ins",
      "TypeScript front end and back end",
    ],
    context: "Personal project.",
  },
];

/** Projects with `featured: true`, in display order. */
export const featuredProjects = projects.filter((p) => p.featured);

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
