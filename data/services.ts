/**
 * SERVICES
 * --------
 * What GLAZY builds for clients, shown in "What we make" and used by
 * Mr. Nimbus. Keep every line to things GLAZY has actually shipped;
 * `proof` points at a project in data/projects.ts that shows it.
 * No prices: every quote follows a brief.
 */
export interface Service {
  id: string;
  /** The giant word on the poster. Short. */
  word: string;
  title: string;
  body: string;
  /** What a client gets, in plain words. */
  includes: string[];
  /** Slug of a project that shows this kind of work. */
  proof?: string;
}

export const services: Service[] = [
  {
    id: "websites",
    word: "Websites",
    title: "Websites for businesses",
    body: "A fast, mobile-first site that tells people what you do and makes it easy to get in touch.",
    includes: ["Services, prices, hours and map", "An enquiry or booking form", "Launched on Vercel, on your domain"],
  },
  {
    id: "cinematic",
    word: "Cinematic",
    title: "Cinematic sites",
    body: "Real footage, scene-by-scene storytelling and transitions that make a brand feel like a place, like the site you are on.",
    includes: ["4K footage, graded and looped", "Scene transitions and loaders", "A lite mode for slower phones"],
  },
  {
    id: "apps",
    word: "SaaS",
    title: "Web apps and SaaS",
    body: "SaaS products, dashboards, CRMs and tools with accounts, roles and data, built on Next.js or the MERN stack.",
    includes: ["Sign-in and roles", "Dashboards and data views", "APIs with validation and rate limits"],
    proof: "crm360",
  },
  {
    id: "ai",
    word: "AI",
    title: "AI features",
    body: "Gemini-powered features that behave: structured output, validation, server-side keys, and a working fallback when the model is down.",
    includes: ["Structured, validated responses", "Keys that never reach the browser", "Prompt-injection defences"],
    proof: "scamshield",
  },
  {
    id: "redesigns",
    word: "Redesigns",
    title: "Fixes and redesigns",
    body: "An existing site that is slow, broken on phones or out of date, rebuilt without losing what works.",
    includes: ["Mobile layouts that hold up", "Faster loading", "Content carried over"],
  },
];

/** How a project runs, from brief to launch. */
export const process = [
  "You send a short brief",
  "We reply with a plan and a mock-up",
  "We build; you review as it grows",
  "Launch on Vercel, handed over to you",
];
