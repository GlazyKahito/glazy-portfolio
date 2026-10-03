import type { Skill, SkillCategory } from "@/lib/types";

/**
 * TECH STACK
 * ----------
 * Only technologies that appear on the resume or in a linked project README.
 * `usage` must describe real use, not aspiration.
 */
export const skills: Skill[] = [
  // Languages (resume)
  {
    name: "TypeScript",
    category: "Languages",
    usage: "Default language for every recent project, from NIYAM and ScamShield to CLIMATIQ and the DCN lab.",
    projects: ["niyam", "scamshield", "climatiq", "dcn-virtual-lab"],
  },
  {
    name: "JavaScript",
    category: "Languages",
    usage: "Vanilla JS for the GreyAtom dashboard and Grove; Node.js across CRM360.",
    projects: ["greyatom-dashboard", "crm360", "grove"],
  },
  {
    name: "Python",
    category: "Languages",
    usage: "Coursework and scripting alongside the B.Tech curriculum.",
  },
  {
    name: "Java",
    category: "Languages",
    usage: "Object-oriented programming coursework at KJ Somaiya.",
  },
  {
    name: "C / C++",
    category: "Languages",
    usage: "Systems and data-structures coursework.",
  },

  // Frontend (resume + READMEs)
  {
    name: "React",
    category: "Frontend",
    usage: "React 19 in CRM360 and the DCN lab; the view layer for everything with state.",
    projects: ["crm360", "dcn-virtual-lab"],
  },
  {
    name: "Next.js",
    category: "Frontend",
    usage: "App Router for NIYAM, ScamShield, CLIMATIQ and this site, with server-only AI calls.",
    projects: ["niyam", "scamshield", "climatiq"],
  },
  {
    name: "Tailwind CSS",
    category: "Frontend",
    usage: "Utility-first styling with design tokens in ScamShield, the DCN lab and GLAZY.",
    projects: ["scamshield", "dcn-virtual-lab"],
  },
  {
    name: "HTML5 / CSS3",
    category: "Frontend",
    usage: "Hand-written markup and styles for the GreyAtom delivery-exceptions dashboard.",
    projects: ["greyatom-dashboard"],
  },
  {
    name: "Motion",
    category: "Frontend",
    usage: "Scroll, layout and gesture animation; the packet/node motion language in the DCN lab.",
    projects: ["dcn-virtual-lab", "scamshield"],
  },
  {
    name: "GSAP",
    category: "Frontend",
    usage: "Timeline-driven scene transitions and the depth-poster opening of this site; motion in CLIMATIQ.",
    projects: ["climatiq"],
  },
  {
    name: "Recharts",
    category: "Frontend",
    usage: "Charts on ScamShield's dashboard and CLIMATIQ's climate analytics.",
    projects: ["scamshield", "climatiq"],
  },
  {
    name: "MapLibre GL",
    category: "Frontend",
    usage: "District heat-risk choropleths, heat layers and station maps in CLIMATIQ's command centre.",
    projects: ["climatiq"],
  },
  {
    name: "Vite",
    category: "Frontend",
    usage: "Build tool for the CRM360 client and the DCN lab.",
    projects: ["crm360", "dcn-virtual-lab"],
  },

  // Backend (resume + READMEs)
  {
    name: "Node.js",
    category: "Backend",
    usage: "API runtime for CRM360; serverless functions on Vercel.",
    projects: ["crm360"],
  },
  {
    name: "Express",
    category: "Backend",
    usage: "Express 5 API in CRM360 with Zod validation, Helmet and rate limiting.",
    projects: ["crm360"],
  },
  {
    name: "MongoDB",
    category: "Backend",
    usage: "Mongoose models and role-scoped aggregations for CRM360's dashboard.",
    projects: ["crm360"],
  },
  {
    name: "PostgreSQL",
    category: "Backend",
    usage: "Climate data, incidents, roles and the audit log in CLIMATIQ, through Drizzle ORM.",
    projects: ["climatiq"],
  },
  {
    name: "SQLite",
    category: "Backend",
    usage: "NIYAM's local corpus and model-call cache: 4 GB, 23 tables, 13.2M rows, running offline.",
    projects: ["niyam"],
  },
  {
    name: "Zod",
    category: "Backend",
    usage: "Server-side validation of inputs and of every AI response before it renders.",
    projects: ["scamshield", "crm360"],
  },
  {
    name: "Web security",
    category: "Backend",
    usage: "Helmet headers and rate limiting in CRM360; prompt-injection defences, input limits and server-only secrets in ScamShield.",
    projects: ["crm360", "scamshield"],
  },
  {
    name: "JWT / Auth",
    category: "Backend",
    usage: "Token auth with bcrypt hashing, password reset and session invalidation in CRM360.",
    projects: ["crm360"],
  },

  // AI (resume + READMEs)
  {
    name: "Google Gemini API",
    category: "AI",
    usage: "Structured analysis in ScamShield, drafting and hearing simulation in NIYAM, audience-specific advisories in CLIMATIQ; always server-side.",
    projects: ["scamshield", "niyam", "climatiq"],
  },
  {
    name: "Prompt design",
    category: "AI",
    usage: "Injection-resistant prompts for production features: fixed schemas, random delimiters, content treated as data.",
    projects: ["scamshield", "niyam"],
  },
  {
    name: "Agent workflows",
    category: "AI",
    usage: "An intent router and agents for research, drafting and hearing simulation inside NIYAM's workspace.",
    projects: ["niyam"],
  },
  {
    name: "Claude API",
    category: "AI",
    usage: "An advisory provider in CLIMATIQ alongside Gemini, behind the same validated schema.",
    projects: ["climatiq"],
  },

  // 3D & Graphics (READMEs)
  {
    name: "Three.js",
    category: "3D & Graphics",
    usage: "The 3D heat globe in CLIMATIQ, the warp-tunnel opening in the DCN lab, and Grove's landing scene.",
    projects: ["climatiq", "dcn-virtual-lab", "grove"],
  },
  {
    name: "React Three Fiber",
    category: "3D & Graphics",
    usage: "Declarative Three.js scenes with lazy loading and device-aware quality.",
    projects: ["dcn-virtual-lab"],
  },
  {
    name: "WebGL shaders",
    category: "3D & Graphics",
    usage: "GLSL background fields capped by frame rate and resolution for mobile.",
    projects: ["dcn-virtual-lab"],
  },

  // Tooling (resume)
  {
    name: "Git / GitHub",
    category: "Tooling",
    usage: "Every project is versioned on GitHub under @GlazyKahito.",
  },
  {
    name: "Vercel",
    category: "Tooling",
    usage: "Hosting for every live project, including serverless APIs.",
  },
  {
    name: "Playwright",
    category: "Tooling",
    usage: "End-to-end and axe accessibility tests in CLIMATIQ; the case-study screenshots on this site.",
    projects: ["climatiq"],
  },
  {
    name: "VS Code",
    category: "Tooling",
    usage: "Daily editor, with AI-assisted workflows.",
  },
];

export const skillCategories: SkillCategory[] = [
  "Languages",
  "Frontend",
  "Backend",
  "AI",
  "3D & Graphics",
  "Tooling",
];

export function skillsByCategory(category: SkillCategory) {
  return skills.filter((s) => s.category === category);
}
