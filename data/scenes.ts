/**
 * SCENES
 * ------
 * The home page is a sequence of full-screen scenes grouped into chapters.
 * Each chapter has its own 4K footage and its own transition. The work
 * chapter expands into one scene per project (moving sideways).
 *
 * The opening is a depth poster rather than a clip: a 4K still of the dusk
 * footage split into a sky plate and a cut-out ridge (public/scenes/), with
 * the wordmark between them (components/scenes/DepthPoster.tsx).
 *
 * Footage: Mixkit stock video, free under the Mixkit Stock Video Free
 * License (https://mixkit.co/license/#videoFree) — commercial use allowed,
 * no attribution required (credited anyway). Re-encoded for the web into
 * seamless loops: /public/video/<name>-2160.mp4 (4K), -poster.jpg.
 *
 * One look throughout: every chapter is dusk or the edge of night (warm
 * horizon, dark silhouettes), matching the opening's ridge. New footage
 * must fit that palette; grade it warm in the encode if it does not.
 */

export type TransitionStyle = "iris" | "slide" | "rise" | "zoom" | "doors" | "wipe" | "glitch" | "shutter" | "burn" | "mosaic";

export interface Footage {
  name: string;
  /** What is in the shot, used as the poster's alt text and in the credits. */
  description: string;
  source: string;
}

export const footage = {
  sea: { name: "sea", description: "The sun setting over a calm sea", source: "https://mixkit.co/free-stock-video/stunning-sunset-seen-from-the-sea-4119/" },
  citydusk: { name: "citydusk", description: "A city at dusk from high above, a red horizon over its lights", source: "https://mixkit.co/free-stock-video/tour-high-above-a-city-at-dusk-41375/" },
  nightridge: { name: "nightridge", description: "The Milky Way over a dark mountain ridge, a warm glow on the horizon", source: "https://mixkit.co/free-stock-video/milky-way-seen-at-night-4148/" },
  bay: { name: "bay", description: "Sunset over a bay of islands, peaks in silhouette", source: "https://mixkit.co/free-stock-video/beautiful-sunset-on-a-bay-from-above-4999/" },
  goldroad: { name: "goldroad", description: "A road through the scrub at golden hour, seen from above", source: "https://mixkit.co/free-stock-video/natural-landscape-with-a-road-at-sunset-50267/" },
  flight: { name: "flight", description: "An aircraft wing against a dusk sky", source: "https://mixkit.co/free-stock-video/panorama-from-the-window-of-an-airplane-at-dusk-40102/" },
  dusk: { name: "dusk", description: "A lake between mountains at dusk", source: "https://mixkit.co/free-stock-video/landscape-of-a-lake-during-a-red-sunset-5002/" },
} satisfies Record<string, Footage>;

export type FootageName = keyof typeof footage;

export type ChapterId = "intro" | "services" | "work" | "building" | "about" | "stack" | "contact";

export interface Chapter {
  id: ChapterId;
  number: string;
  label: string;
  footage: FootageName;
  /** Rendered as the layered depth poster built from this footage, instead of the clip. */
  depth?: boolean;
  /** How this chapter arrives. */
  transition: TransitionStyle;
  /** The arrival card's emblem and tint. */
  mood: "sea" | "city" | "stars" | "dawn" | "wind" | "dusk";
  /**
   * Legibility: a darkening gradient behind the side the text sits on (wide
   * screens; below lg it deepens toward the foot, where the copy runs), and
   * its strength (0–1). Brighter footage needs more. Tuned so body copy keeps
   * WCAG AA contrast over the brightest frame of the clip. `reach` is how far
   * across the frame it runs (0–1, default 0.7): a heading that crosses the
   * sun needs it further.
   */
  scrim?: { side: "left" | "right"; strength: number; reach?: number };
}

export const chapters: Chapter[] = [
  { id: "intro", number: "00", label: "GLAZY", footage: "dusk", depth: true, transition: "zoom", mood: "dusk" },
  // A bright sunset over the sea: the services copy sits on the right, over the sky.
  { id: "services", number: "01", label: "What we make", footage: "sea", transition: "glitch", mood: "sea", scrim: { side: "right", strength: 0.72 } },
  { id: "work", number: "02", label: "The work", footage: "citydusk", transition: "iris", mood: "city", scrim: { side: "left", strength: 0.6 } },
  { id: "building", number: "03", label: "In the works", footage: "nightridge", transition: "shutter", mood: "stars", scrim: { side: "left", strength: 0.45 } },
  // The sun sits mid-frame over the bay: the founder's copy runs across it.
  { id: "about", number: "04", label: "The founder", footage: "bay", transition: "burn", mood: "dawn", scrim: { side: "left", strength: 0.8, reach: 1 } },
  // Golden hour, the brightest sky of all.
  { id: "stack", number: "05", label: "The toolkit", footage: "goldroad", transition: "doors", mood: "wind", scrim: { side: "left", strength: 0.78 } },
  // The horizon glows behind the closing line: the scrim runs nearly across.
  { id: "contact", number: "06", label: "Start a project", footage: "flight", transition: "mosaic", mood: "dusk", scrim: { side: "left", strength: 0.75, reach: 1.2 } },
];

/** Old and friendly hashes, mapped to chapters (deep links, the menu, Mr. Nimbus). */
export const chapterHashes: Record<string, ChapterId> = {
  services: "services",
  "what-we-make": "services",
  projects: "work",
  work: "work",
  "in-progress": "building",
  building: "building",
  studio: "building",
  works: "building",
  about: "about",
  founder: "about",
  stack: "stack",
  toolkit: "stack",
  hire: "contact",
  "work-with-me": "contact",
  start: "contact",
  contact: "contact",
};

/** The hash a chapter writes to the address bar. */
export const chapterHash = (id: ChapterId) => (id === "work" ? "projects" : id);

export const chapterById = (id: ChapterId) => chapters.find((c) => c.id === id)!;
