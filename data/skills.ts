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
    usage: "Default language for every recent project, from ScamShield's analysis engine to the DCN lab.",
    projects: ["scamshield", "dcn-virtual-lab"],
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
    usage: "App Router for LexTemporal, ScamShield and this portfolio, with server-only AI calls.",
    projects: ["lextemporal", "scamshield"],
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
    usage: "Timeline-driven scene transitions and the film-leader opening of this portfolio.",
  },
  {
    name: "Recharts",
    category: "Frontend",
    usage: "Charts on ScamShield's dashboard of past analyses.",
    projects: ["scamshield"],
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
    usage: "Semantic analysis layer in ScamShield with structured JSON output, called only server-side.",
    projects: ["scamshield"],
  },
  {
    name: "Prompt design",
    category: "AI",
    usage: "Injection-resistant prompts for production features: fixed schemas, random delimiters, content treated as data.",
    projects: ["scamshield", "lextemporal"],
  },
  {
    name: "Agent workflows",
    category: "AI",
    usage: "Search, draft, simulate and hearing-prep agents inside LexTemporal's workspace.",
    projects: ["lextemporal"],
  },

  // 3D & Graphics (READMEs)
  {
    name: "Three.js",
    category: "3D & Graphics",
    usage: "Warp-tunnel opening sequence and 3D scenes in the DCN lab, and the landing scene in Grove.",
    projects: ["dcn-virtual-lab", "grove"],
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
