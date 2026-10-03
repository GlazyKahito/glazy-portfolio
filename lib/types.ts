/**
 * Content types for GLAZY.
 *
 * Everything the site renders comes from `data/*.ts` files typed here.
 * Components never hard-code project or profile facts; they map over these.
 */

export type ProjectStatus = "live" | "shipped" | "in-progress" | "archived";

export type ProjectCategory =
  | "AI Product"
  | "Security"
  | "Simulation"
  | "Full-Stack"
  | "Frontend"
  | "Experiment";

export interface ImageAsset {
  /** Path under /public, e.g. "/projects/scamshield/cover.jpg" */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  id: string;
  /** Display ordinal, zero-padded: "01", "02"… derived automatically if omitted. */
  number?: string;
  slug: string;
  title: string;
  /** One line under the title. Keep it factual and short. */
  tagline: string;
  /** Two-sentence summary used in the showcase. */
  description: string;
  /** Paragraphs for the detail page overview. */
  longDescription: string[];
  category: ProjectCategory;
  technologies: string[];
  year: string;
  status: ProjectStatus;
  featured: boolean;
  /** Cover image shown on the showcase stage and the detail hero. */
  image: ImageAsset;
  /** Optional phone-sized capture, shown as an overlapping device in the showcase. */
  mobileImage?: ImageAsset;
  /** Optional extra screenshots for the detail page. */
  gallery?: ImageAsset[];
  /** Optional mp4/webm under /public. */
  video?: string;
  github?: string;
  live?: string;
  /** A recorded demo (e.g. a YouTube link) when there is no public deployment to visit. */
  demo?: string;
  /** When false the project only appears in the showcase without a detail page. */
  caseStudy?: boolean;
  /** Per-project hue (0-360) used to tint the stage lighting and accents. */
  hue: number;
  /** Detail page sections. Omit any that are not factual for the project. */
  problem?: string[];
  solution?: string[];
  features?: string[];
  architecture?: string[];
  /** Measured or documented outcomes only. Never marketing numbers. */
  results?: string[];
  /** Where the project came from (internship brief, coursework, personal). */
  context?: string;
}

export type InProgressStatus = "building" | "exploring" | "planning" | "shipping";

export interface InProgressItem {
  id: string;
  title: string;
  description: string;
  status: InProgressStatus;
  /** 0–100, honest estimate. Drives the construction visual. */
  progress: number;
  technologies: string[];
  /** ISO month, e.g. "2026-09" */
  startedAt?: string;
  github?: string;
  live?: string;
  /** Short bullet list of what is being worked on right now. */
  focus?: string[];
  hue: number;
}

export type SkillCategory =
  | "Languages"
  | "Frontend"
  | "Backend"
  | "AI"
  | "3D & Graphics"
  | "Tooling";

export interface Skill {
  name: string;
  category: SkillCategory;
  /** One sentence: how it is actually used, backed by the resume or a project. */
  usage: string;
  /** Slugs of projects that use it, for cross-linking. */
  projects?: string[];
}

export interface SocialLink {
  label: string;
  href: string;
  /** Short handle shown in the footer, e.g. "@GlazyKahito" */
  handle: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  bullets: string[];
  links?: { label: string; href: string }[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  period: string;
  location: string;
}

export interface Profile {
  name: string;
  alias: string;
  roles: string[];
  location: string;
  email: string;
  phone: string;
  /** Path under /public to the actual resume PDF. */
  resume: string;
  socials: SocialLink[];
  experience: ExperienceItem[];
  education: EducationItem[];
  /** Short first-person paragraphs for the About section. */
  about: string[];
}
