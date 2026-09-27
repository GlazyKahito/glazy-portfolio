/**
 * Site-wide configuration: navigation, metadata, URLs.
 */
export const site = {
  name: "GLAZY",
  title: "GLAZY — Krutik Mhatre",
  description:
    "GLAZY is the digital space of Krutik Mhatre: full-stack products, AI integration and security-minded builds. Explore LexTemporal, ScamShield, the DCN Virtual Lab and more.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  tagline: "a digital space showcasing what I build.",
  nav: [
    { label: "Projects", href: "/#projects" },
    { label: "In Progress", href: "/#in-progress" },
    { label: "About", href: "/#about" },
    { label: "Stack", href: "/#stack" },
    { label: "Contact", href: "/#contact" },
  ],
} as const;
