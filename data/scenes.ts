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
 * seamless loops: /public/video/<name>-2160.mp4 (4K), -1080.mp4, -poster.jpg.
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
  city: { name: "city", description: "A city at night seen from the air", source: "https://mixkit.co/free-stock-video/movement-in-a-city-at-night-in-an-aerial-shot-42343/" },
  stars: { name: "stars", description: "Stars wheeling over a still lake at night", source: "https://mixkit.co/free-stock-video/night-sky-with-stars-at-a-calm-lake-time-lapse-1704/" },
  dawn: { name: "dawn", description: "First light over a misty valley", source: "https://mixkit.co/free-stock-video/beautiful-sunrise-landscape-1944/" },
  canyon: { name: "canyon", description: "Flying over a green canyon and its river", source: "https://mixkit.co/free-stock-video/fly-over-a-huge-canyon-covered-in-vegetation-41401/" },
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
}

export const chapters: Chapter[] = [
  { id: "intro", number: "00", label: "GLAZY", footage: "dusk", depth: true, transition: "zoom", mood: "dusk" },
  { id: "services", number: "01", label: "What we make", footage: "sea", transition: "glitch", mood: "sea" },
  { id: "work", number: "02", label: "The work", footage: "city", transition: "iris", mood: "city" },
  { id: "building", number: "03", label: "In the studio", footage: "stars", transition: "shutter", mood: "stars" },
  { id: "about", number: "04", label: "The founder", footage: "dawn", transition: "burn", mood: "dawn" },
  { id: "stack", number: "05", label: "The toolkit", footage: "canyon", transition: "doors", mood: "wind" },
  { id: "contact", number: "06", label: "Start a project", footage: "flight", transition: "mosaic", mood: "dusk" },
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
