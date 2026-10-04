/**
 * Site-wide configuration: navigation, metadata, URLs.
 */
export const site = {
  name: "GLAZY",
  title: "GLAZY — a freelance web and SaaS agency by Krutik Mhatre",
  description:
    "GLAZY is a freelance web and SaaS agency founded by Krutik Mhatre in Mumbai. We design and build fast, cinematic websites, web apps, SaaS products and AI features. See NIYAM, ScamShield, CLIMATIQ and more.",
  // Explicit override → Vercel's production domain (set at build time) → local dev.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  tagline: "websites that feel like places.",
  founded: "2026",
  nav: [
    { label: "What we make", href: "/#services" },
    { label: "Work", href: "/#projects" },
    { label: "In the works", href: "/#building" },
    { label: "Founder", href: "/#about" },
    { label: "Start a project", href: "/#contact" },
  ],
} as const;
