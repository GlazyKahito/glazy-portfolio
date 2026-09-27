import type { Profile } from "@/lib/types";

/**
 * Source of truth: Krutik_Mhatre_Resume (September 2026).
 * Every fact here appears on the resume or in a linked repository README.
 */
export const profile: Profile = {
  name: "Krutik Mhatre",
  alias: "GLAZY",
  roles: ["Full-stack developer", "AI integration", "Security-minded builder"],
  location: "Mumbai, Maharashtra",
  email: "kahitokrutik@gmail.com",
  phone: "+91 90822 02088",
  resume: "/resume/Krutik_Mhatre_Resume.pdf",
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/GlazyKahito",
      handle: "@GlazyKahito",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/krutik-mhatre-1b313937b",
      handle: "in/krutik-mhatre",
    },
    {
      label: "Email",
      href: "mailto:kahitokrutik@gmail.com",
      handle: "kahitokrutik@gmail.com",
    },
  ],
  experience: [
    {
      role: "Web Development Intern",
      company: "Ediglobe",
      period: "July 2026 — September 2026",
      bullets: [
        "Built an internal delivery-exceptions dashboard (HTML, CSS, JavaScript) for a GreyAtom Logistics brief: dynamic filtering, ticket detail views, and a submission workflow to log, filter, and resolve exceptions by priority and status.",
        "Built CRM360, a full-stack MERN CRM (MongoDB, Express.js, React, Node.js) with a sales pipeline board, contact and deal tracking, and a notifications system, deployed to Vercel.",
      ],
      links: [
        { label: "Dashboard", href: "https://miniprojectwebdev.vercel.app" },
        { label: "CRM360 source", href: "https://github.com/GlazyKahito/majorprojectwebdev" },
        { label: "Completion certificate", href: "https://www.ediglobe.com/cert/EGCC2459" },
      ],
    },
  ],
  education: [
    {
      institution: "KJ Somaiya College of Engineering, Vidyavihar",
      degree: "B.Tech, Information Technology / Computer Science",
      period: "2025 — 2029 (expected)",
      location: "Mumbai, Maharashtra",
    },
  ],
  about: [
    "I'm Krutik, a B.Tech student at KJ Somaiya College of Engineering who recently completed a web development internship at Ediglobe, building full-stack products under the name GLAZY.",
    "My work sits where the web meets AI and security: an AI legal research tool that traces every argument back to its source paragraph, an AI security analyst that explains why a message looks like a scam, and a full networking virtual lab with packet simulation and fault diagnosis.",
    "I build with the MERN stack and Next.js, integrate Google Gemini into production features, and ship to Vercel. I care about products that show their working instead of returning a bare verdict.",
  ],
};
