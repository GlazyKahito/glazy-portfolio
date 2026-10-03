import type { Profile } from "@/lib/types";

/**
 * Source of truth: Krutik_Mhatre_Resume (September 2026), plus Krutik's own
 * word that he founded GLAZY as a web studio (October 2026).
 * Every fact here appears on the resume, in a linked repository README, or
 * in a project's own demo.
 */
export const profile: Profile = {
  name: "Krutik Mhatre",
  alias: "GLAZY",
  roles: ["Founder, GLAZY", "Full-stack developer", "AI integration"],
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
      role: "Founder",
      company: "GLAZY (web studio)",
      period: "2026 — present",
      bullets: [
        "Founded GLAZY, a web studio that designs and builds websites, web apps and AI features for businesses, from the first brief to launch on Vercel.",
        "Designed and built the studio's own site: a cinematic scene deck on 4K footage with per-chapter transitions, and Mr. Nimbus, a guide grounded in the site's own data.",
      ],
    },
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
    "I'm Krutik, the founder of GLAZY, a web studio that designs and builds websites and web apps. I'm also a B.Tech student at KJ Somaiya College of Engineering, and I recently completed a web development internship at Ediglobe.",
    "My work sits where the web meets AI and security: NIYAM, a legal research workspace (built with my team) that checks every authority against the amendments that came after it; ScamShield, an AI security analyst that explains why a message looks like a scam; CLIMATIQ, a heatwave decision-support platform for India; and a networking virtual lab with packet simulation and fault diagnosis.",
    "I build with Next.js and the MERN stack, integrate Google Gemini into production features, and ship to Vercel. I care about products that show their working instead of returning a bare verdict.",
  ],
};
