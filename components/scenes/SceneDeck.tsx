"use client";

import { AnimatePresence, motion } from "motion/react";
import { memo, startTransition, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { AboutScene, BuildingScene, ExperienceScene, IntroScene, StackScene } from "@/components/scenes/ChapterScenes";
import { ContactScene } from "@/components/scenes/Contact";
import { DepthPoster } from "@/components/scenes/DepthPoster";
import { RecruiterScene, StartScene } from "@/components/scenes/HireScenes";
import { ProjectScene } from "@/components/scenes/ProjectScene";
import { PUZZLE_DONE } from "@/components/scenes/PuzzleImage";
import { prefetchClip, SceneVideo } from "@/components/scenes/SceneVideo";
import { ServicesScene } from "@/components/scenes/ServicesScene";
import { useIntro } from "@/components/ui/Intro";
import { conceptProjects, featuredProjects as work } from "@/data/projects";
import { ConceptsScene } from "@/components/scenes/ConceptsScene";
import { DockPortal } from "@/components/ui/Dock";
import { chapterById, chapterHash, chapterHashes, chapters, type Chapter, type ChapterId, type TransitionStyle } from "@/data/scenes";
import { GOTO_EVENT, getDeck, setDeck, type GotoDetail } from "@/lib/deck";
import { gsap } from "@/lib/gsap";
import { useLite } from "@/lib/capability";
import { onIdle, useDevice } from "@/lib/hooks/use-device";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Steps                                                                */
/* ------------------------------------------------------------------ */

interface Step {
  key: string;
  chapter: ChapterId;
  /** Direction of travel INTO this step from the previous one. */
  axis: "x" | "y";
  /** Short label for the progress rail. */
  label: string;
  render: (play: boolean) => ReactNode;
  /** Plain markup for the scene before it is mounted: its heading and links, for crawlers and no-JS. */
  stub: () => ReactNode;
}

const heading = (text: string) =>
  function Heading() {
    return <h2>{text}</h2>;
  };

const STEPS: Step[] = [
  { key: "intro", chapter: "intro", axis: "y", label: "GLAZY", render: (p) => <IntroScene play={p} />, stub: heading("GLAZY") },
  { key: "services", chapter: "services", axis: "y", label: "What we make", render: (p) => <ServicesScene play={p} />, stub: heading("What we make") },
  ...work.map<Step>((project, i) => ({
    key: `work-${project.slug}`,
    chapter: "work",
    axis: i === 0 ? "y" : "x",
    label: project.title,
    render: (p) => <ProjectScene project={project} index={i} play={p} />,
    stub: () => (
      <>
        <h2>{project.title}</h2>
        <p>{project.tagline}</p>
        {project.caseStudy !== false && <a href={`/projects/${project.slug}`}>Open case study</a>}
      </>
    ),
  })),
  ...(conceptProjects.length
    ? [
        {
          key: "work-concepts",
          chapter: "work",
          axis: "x",
          label: "Concepts",
          render: (p) => <ConceptsScene play={p} />,
          stub: () => (
            <>
              <h2>Concepts</h2>
              <ul>
                {conceptProjects.map((p) => (
                  <li key={p.slug}>
                    <a href={`/projects/${p.slug}`}>{p.title}</a>
                  </li>
                ))}
              </ul>
            </>
          ),
        } satisfies Step,
      ]
    : []),
  { key: "building", chapter: "building", axis: "y", label: "In the works", render: (p) => <BuildingScene play={p} />, stub: heading("In the works") },
  { key: "about", chapter: "about", axis: "y", label: "The founder", render: (p) => <AboutScene play={p} />, stub: heading("The founder") },
  { key: "experience", chapter: "about", axis: "x", label: "Experience", render: (p) => <ExperienceScene play={p} />, stub: heading("Experience and education") },
  { key: "recruit", chapter: "about", axis: "x", label: "For recruiters", render: (p) => <RecruiterScene play={p} />, stub: heading("For recruiters") },
  { key: "stack", chapter: "stack", axis: "y", label: "The toolkit", render: (p) => <StackScene play={p} />, stub: heading("The toolkit") },
  { key: "start", chapter: "contact", axis: "y", label: "Start a project", render: (p) => <StartScene play={p} />, stub: heading("Start a project") },
  { key: "contact", chapter: "contact", axis: "x", label: "Say hello", render: (p) => <ContactScene play={p} />, stub: heading("Say hello") },
];

const N = STEPS.length;
const firstStepOf = (c: ChapterId) => STEPS.findIndex((s) => s.chapter === c);
const DURATION = 1.7;

/* Transition helpers. Module level, so randomness never runs during render. */
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Random horizontal bands covering the frame, and a random order to reveal them in. */
function glitchPlan(k = 18) {
  const cuts = Array.from({ length: k - 1 }, () => rand(0, 100)).sort((a, b) => a - b);
  const edges = [0, ...cuts, 100];
  const bands = edges.slice(0, -1).map((e, i) => [e, edges[i + 1]] as [number, number]);
  const order = bands.map((_, i) => i).sort(() => Math.random() - 0.5);
  return { bands, order };
}

/** A clip-path showing only some horizontal bands: one comb-shaped polygon, joined along the left edge. */
function bandsClip(bands: [number, number][]) {
  if (!bands.length) return "polygon(0% 0%, 0% 0%, 0% 0%)";
  const pts = [...bands].sort((a, b) => a[0] - b[0]).flatMap(([a, b]) => [`0% ${a}%`, `100% ${a}%`, `100% ${b}%`, `0% ${b}%`]);
  return `polygon(${pts.join(", ")})`;
}

/** Vertical blinds opening in a wave from one side: one comb polygon joined along the bottom edge. */
function blindsClip(n: number, p: number, fromRight = false) {
  const w = 100 / n;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const order = fromRight ? n - 1 - i : i;
    const pi = clamp01(p * 1.6 - (order / (n - 1)) * 0.6);
    const x0 = i * w;
    const x1 = x0 + w * pi;
    pts.push(`${x0}% 100%`, `${x0}% 0%`, `${x1}% 0%`, `${x1}% 100%`);
  }
  return `polygon(${pts.join(", ")})`;
}

const MOSAIC = { cols: 16, rows: 9 };

/** State update that mounts scene i (a no-op when it already is). */
const mountUpdate = (i: number) => (m: ReadonlySet<number>) => (m.has(i) ? m : new Set(m).add(i));

/** Put the transition overlays away once a move has finished (opacity only: they keep their rasterised tiles). */
function resetFx(glitch: HTMLElement | null, burn: HTMLElement | null, flash: HTMLElement | null, mosaic: HTMLElement | null) {
  if (glitch) {
    gsap.set(glitch, { opacity: 0 });
    glitch.querySelectorAll<HTMLElement>("[data-tear],[data-tint]").forEach((t) => (t.style.opacity = "0"));
  }
  if (burn) gsap.set(burn, { opacity: 0, clearProps: "transform" });
  if (flash) gsap.set(flash, { autoAlpha: 0 });
  if (mosaic) gsap.set([...mosaic.children], { autoAlpha: 0 });
}

/* ------------------------------------------------------------------ */
/* Getting a move ready while the screen is still                       */
/* ------------------------------------------------------------------ */

/**
 * How much of a chapter's footage is in the page: nothing (the layer is not
 * displayed), its poster, or its poster and its 4K clip.
 */
type Stage = 0 | 1 | 2;

const chapterIndex = (c: ChapterId) => chapters.findIndex((x) => x.id === c);

/**
 * How long a scene's entrance plays after it arrives (ms). Work done for the
 * next move (warming a clip, rasterising layers) waits for it, so it never
 * stalls a frame of the entrance.
 */
const settleMs = (i: number) => (STEPS[i].chapter === "work" ? (PUZZLE_DONE + 1.2) * 1000 : 1800);

const frames = (n: number) =>
  new Promise<void>((resolve) => {
    const tick = () => (n-- <= 0 ? resolve() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  });

/** Wait for an event, or give up after `ms`. */
const eventOrTimeout = (el: EventTarget, type: string, ms: number) =>
  new Promise<void>((resolve) => {
    const done = () => {
      el.removeEventListener(type, done);
      window.clearTimeout(t);
      resolve();
    };
    const t = window.setTimeout(done, ms);
    el.addEventListener(type, done);
  });

/** A clip that has been mounted but has not decoded its first frame yet (its decoder is being set up). */
const warming = (v: HTMLVideoElement | null | undefined) => !!v && v.readyState < 2 && !v.error;

/**
 * Pre-rasterisation. When a layer first becomes visible the GPU has to
 * rasterise it (text, images, gradients) in that very frame; on integrated
 * graphics that can take a few hundred milliseconds, a frozen frame in the
 * middle of a move. So the layers a move will show are drawn ahead of time,
 * while the screen is still, at 0.2% opacity (less than one 8-bit step:
 * nothing shows) for a few frames, then put back to 0. Composited layers keep
 * their tiles (as long as their opacity is composited: `will-change: opacity`),
 * so the move shows them without rasterising anything. A layer hidden with
 * `visibility` or `display` drops its tiles, which is why the deck hides the
 * layers near the visitor with opacity alone.
 *
 * `inner` elements are shown at full opacity inside the faint layer while it
 * is drawn (a card's title, the glitch's tear bars), so they are rasterised too.
 * Returns a function that puts everything back at once (a move starting mid-way).
 */
function prime(targets: { el: HTMLElement; inner?: HTMLElement[] }[]): { done: Promise<void>; restore: () => void } {
  const saved = targets.flatMap(({ el, inner = [] }) => [el, ...inner]).map((n) => ({ n, opacity: n.style.opacity, transition: n.style.transition }));
  for (const { el, inner = [] } of targets) {
    for (const n of [el, ...inner]) n.style.transition = "none";
    el.style.opacity = "0.002";
    for (const n of inner) n.style.opacity = "1";
  }
  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    // Back at once (no transition), so whatever plays next starts from where it should.
    for (const { n, opacity } of saved) n.style.opacity = opacity;
    for (const { n } of saved) void getComputedStyle(n).opacity;
    for (const { n, transition } of saved) n.style.transition = transition;
  };
  // Four frames: the frame that draws the layers cannot be shown before their tiles are rasterised.
  return { done: frames(4).then(restore), restore };
}

/* ------------------------------------------------------------------ */
/* Arrival card: each chapter's own transition screen                   */
/* ------------------------------------------------------------------ */

function Emblem({ mood }: { mood: string }) {
  switch (mood) {
    case "city":
      return (
        <svg viewBox="0 0 120 24" className="h-5 w-28 text-ember" aria-hidden>
          <path d="M2 20h12V8h12v8h14V4h12v16h14V10h14v8h14V6h14v14h10" fill="none" stroke="currentColor" strokeWidth="1.5" className="[animation:draw-line_1.4s_ease-out_both]" pathLength={1} strokeDasharray="1" />
        </svg>
      );
    case "stars":
      return (
        <span className="relative block h-5 w-28" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="absolute h-[3px] w-[3px] rounded-full bg-cream [animation:twinkle_1.6s_ease-in-out_infinite]" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 90}%`, animationDelay: `${(i % 7) * 0.2}s` }} />
          ))}
        </span>
      );
    case "dawn":
      return (
        <span className="relative block h-8 w-8" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="absolute inset-0 rounded-full border border-peach/70 [animation:ripple-out_2.4s_ease-out_infinite]" style={{ animationDelay: `${i * 0.8}s` }} />
          ))}
        </span>
      );
    case "wind":
      return (
        <span className="block h-5 w-28 overflow-hidden" aria-hidden>
          <span className="block h-full w-[200%] bg-[repeating-linear-gradient(90deg,transparent_0_14px,color-mix(in_srgb,var(--color-bone)_60%,transparent)_14px_30px,transparent_30px_52px)] bg-[length:52px_1px] bg-[position:0_50%] bg-repeat-x [animation:wind-drift_1.2s_linear_infinite]" />
        </span>
      );
    case "dusk":
      return (
        <svg viewBox="0 0 60 30" className="h-7 w-14 text-bone/60" aria-hidden>
          <path d="M4 26 H56" stroke="currentColor" strokeWidth="1" />
          <circle cx="30" cy="26" r="12" fill="var(--color-ember)" className="[animation:sun-rise_2.4s_ease-out_infinite]" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 120 20" className="h-5 w-28 text-bone/70" aria-hidden>
          <path d="M0 10 Q 15 2 30 10 T 60 10 T 90 10 T 120 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="[animation:wave-slide_2s_linear_infinite]" />
        </svg>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Pieces that change on their own, so the deck does not re-render     */
/* ------------------------------------------------------------------ */

/**
 * A scene's content. Only the current scene, its neighbours and the scenes
 * already visited are mounted; the rest are plain markup (their heading and
 * links) until the visitor is about to reach them. Memoised: a move only
 * re-renders the scenes whose `play` or `mounted` changed.
 */
const SceneBody = memo(function SceneBody({ i, mounted, play }: { i: number; mounted: boolean; play: boolean }) {
  const s = STEPS[i];
  if (mounted) return s.render(play);
  return (
    <div data-stub className="sr-only">
      {s.stub()}
    </div>
  );
});

/**
 * One chapter's footage layer (or the opening's depth poster). Memoised for the same reason.
 * Layers near the visitor stay displayed and are hidden with opacity (they keep their tiles);
 * the others are not displayed at all, so they hold no GPU memory.
 */
const FootageLayer = memo(function FootageLayer({
  chapter: c,
  stage,
  play,
  urgent,
  active,
  reveal,
  register,
  onReady,
  onProgress,
}: {
  chapter: Chapter;
  stage: Stage;
  play: boolean;
  urgent: boolean;
  active: boolean;
  reveal: boolean;
  register: (c: ChapterId, el: HTMLDivElement | null) => void;
  onReady: (c: ChapterId) => void;
  onProgress: (c: ChapterId, p: number) => void;
}) {
  const load = stage === 2 ? true : stage === 1 ? "poster" : false;
  return (
    <div
      ref={(el) => register(c.id, el)}
      aria-hidden
      className="absolute inset-0 [will-change:transform,opacity]"
      style={{ opacity: c.id === "intro" ? 1 : 0, display: stage ? undefined : "none" }}
    >
      {c.depth ? (
        <DepthPoster active={active} reveal={reveal} onReady={() => onReady(c.id)} />
      ) : (
        <>
          <SceneVideo name={c.footage} load={load} play={play} urgent={urgent} onReady={() => onReady(c.id)} onProgress={(p) => onProgress(c.id, p)} />
          {/* Legibility: a cinematic grade (the header band, the dock's foot), and the chapter's own
              scrim behind the side its text sits on (data/scenes.ts). Gradients, never a flat veil. */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.55),transparent_40%),linear-gradient(to_bottom,rgb(0_0_0/0.38),transparent_22%)]" />
          {c.scrim && <div className="scrim" data-side={c.scrim.side} style={{ ["--s" as string]: c.scrim.strength, ["--reach" as string]: c.scrim.reach ?? 0.7 }} />}
        </>
      )}
    </div>
  );
});

/** The chapter's loader, shown only while its footage is not ready yet. It polls its own progress. */
function ChapterLoader({ chapter: id, progressOf }: { chapter: ChapterId | null; progressOf: (c: ChapterId) => number }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!id) return;
    const tick = () => setProgress(progressOf(id));
    const first = window.setTimeout(tick, 0);
    const t = window.setInterval(tick, 150);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, [id, progressOf]);
  const c = id ? chapterById(id) : null;
  return (
    <AnimatePresence>
      {c && (
        <motion.div
          key="loader"
          role="status"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-black/70 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative h-20 w-20">
            <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90 text-bone" aria-hidden>
              <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
              <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray={`${Math.max(0.04, progress) * 226} 226`} className="transition-[stroke-dasharray] duration-300" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-xs tabular-nums text-bone">{Math.round(progress * 100)}%</span>
          </div>
          <div className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-bone-2">Loading chapter {c.number}</p>
            <p className="mt-2 font-display text-3xl text-bone">{c.depth ? "4K poster" : "4K footage"}</p>
          </div>
          <Emblem mood={c.mood} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * A chapter's arrival card. The cards of the chapters either side of the
 * visitor stay mounted, invisible and rasterised ahead of time, so a move
 * shows one without drawing it from scratch. CSS transitions on opacity and
 * transform (`.deck-card` in globals.css): in, the card fades up and its
 * title settles from slightly larger; out, the card fades as it grows.
 */
const ChapterCard = memo(function ChapterCard({
  chapter: c,
  on,
  glitch,
  register,
}: {
  chapter: Chapter;
  on: boolean;
  glitch: boolean;
  register: (c: ChapterId, el: HTMLDivElement | null) => void;
}) {
  // The emblem starts from the top each time the card shows.
  const [shows, setShows] = useState(0);
  const [wasOn, setWasOn] = useState(on);
  if (on !== wasOn) {
    setWasOn(on);
    if (on) setShows((n) => n + 1);
  }
  return (
    <div
      ref={(el) => register(c.id, el)}
      aria-hidden
      data-on={on ? "" : undefined}
      className="deck-card pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-bone/80">Chapter {c.number}</p>
      <p
        data-text={c.label}
        data-card-title
        className={cn("deck-card-title mt-4 font-display text-[clamp(3.5rem,10vw,9rem)] leading-[0.9] text-bone [text-shadow:0_4px_60px_rgb(0_0_0/0.5)]", glitch && "glitch-text")}
      >
        {c.label}
      </p>
      <div className="mt-8">
        <Emblem key={shows} mood={c.mood} />
      </div>
    </div>
  );
});

/** Progress rail: how far you are, and where. Never what comes next. */
function Rail({ index, arrived, onGo, visited }: { index: number; arrived: boolean; onGo: (i: number) => void; visited: { c: Chapter; i: number }[] }) {
  const [hover, setHover] = useState(false);
  // The label shows while moving and for a moment after arriving, then steps aside (hover brings it back).
  const [hold, setHold] = useState({ index, on: true });
  if (hold.index !== index) setHold({ index, on: true });
  useEffect(() => {
    if (!hold.on || !arrived) return;
    const t = window.setTimeout(() => setHold((h) => ({ ...h, on: false })), 2600);
    return () => window.clearTimeout(t);
  }, [hold.on, arrived, index]);
  const show = !arrived || hold.on || hover;

  const step = STEPS[index];
  const chapter = chapterById(step.chapter);
  const label = step.chapter === "work" ? `${chapter.number} ${chapter.label} · ${step.label}` : `${chapter.number} ${step.label}`;

  return (
    <nav
      aria-label="Progress"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="pointer-events-none absolute right-[max(1rem,calc(var(--gutter)-1.5rem))] top-1/2 z-10 hidden h-[46vh] -translate-y-1/2 md:block"
    >
      <div aria-hidden className="pointer-events-auto absolute -inset-x-3 inset-y-0" />
      <div className="relative h-full w-px bg-white/15">
        <div data-progress-fill className="absolute inset-x-0 top-0 h-full origin-top bg-bone" style={{ transform: `scaleY(0)` }} />
        {visited.map(({ c, i }) => (
          <button
            key={c.id}
            type="button"
            aria-label={`Back to ${c.label}`}
            onClick={() => onGo(i)}
            className="pointer-events-auto absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bone/70 bg-black/60 transition-transform hover:scale-125"
            style={{ top: `${(i / (N - 1)) * 100}%` }}
          />
        ))}
        {/* The label travels with a transform: a full-height track moved by a share of its own height. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={false}
          animate={{ y: `${(index / (N - 1)) * 100}%` }}
          transition={{ duration: DURATION, ease: ease.inOutQuart }}
        >
          <motion.div
            className="absolute right-4 top-0 whitespace-nowrap rounded-full border border-white/10 bg-black/45 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone backdrop-blur-xl"
            initial={false}
            animate={{ opacity: show ? 1 : 0, x: show ? 0 : 6 }}
            transition={{ duration: 0.5 }}
            style={{ translateY: "-50%" }}
          >
            {label}
          </motion.div>
        </motion.div>
      </div>
    </nav>
  );
}

/** Continue: appears once the scene has loaded and played in. */
function ContinuePrompt({ index, play, hidden, onGo }: { index: number; play: boolean; hidden: boolean; onGo: (i: number) => void }) {
  const [shownAt, setShownAt] = useState(-1);
  useEffect(() => {
    if (!play) return;
    const t = window.setTimeout(() => setShownAt(index), 1500);
    return () => window.clearTimeout(t);
  }, [play, index]);
  const show = play && shownAt === index && !hidden;
  const step = STEPS[index];
  const last = index === N - 1;
  const nextAxis = last ? "y" : STEPS[index + 1].axis;

  return (
    // In the dock's centre slot (components/ui/Dock.tsx), so it never collides with a notice or Mr. Nimbus.
    <DockPortal slot="center">
      <AnimatePresence>
        {show && (
          <motion.button
            key={`prompt-${index}`}
            type="button"
            onClick={() => onGo(last ? 0 : index + 1)}
            className="deck-prompt pointer-events-auto flex h-[var(--dock-row)] items-center gap-3 whitespace-nowrap rounded-full border border-white/20 bg-black/35 pl-5 pr-2 text-sm text-bone shadow-[0_10px_40px_-10px_rgb(0_0_0/0.6)] backdrop-blur-md transition-colors hover:bg-black/55"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.6, ease: ease.outExpo }}
          >
            <span>{last ? "Back to the start" : step.chapter === "work" && nextAxis === "x" ? "Next project" : "Continue"}</span>
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-bone text-ink", !last && "[animation:nudge_1.8s_ease-in-out_infinite]")}>
              <svg viewBox="0 0 16 16" className={cn("h-3.5 w-3.5", last ? "-rotate-90" : nextAxis === "x" ? "" : "rotate-90")} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </DockPortal>
  );
}

/* ------------------------------------------------------------------ */
/* Deck                                                                 */
/* ------------------------------------------------------------------ */

/**
 * The home page as a film: one full-screen scene at a time.
 *
 * - Scroll, swipe, the arrow keys, the Continue prompt or the progress rail
 *   move one scene. A move always plays to the end; input during it (and the
 *   momentum of a trackpad flick after it) is ignored, so nothing can be
 *   skipped and the next scene is never glimpsed early.
 * - Chapters arrive with their own transition (iris, rise, zoom, doors,
 *   wipe) and their own title card; projects slide in sideways.
 * - Only what is needed is mounted and loaded: the scene on screen, the next
 *   one (once the opening has played and the browser is idle), and the ones
 *   already visited. A jump (rail, menu, link) mounts its target first.
 * - A move never makes the GPU start anything new. While a scene is settled
 *   (its entrance has played), the deck fetches the next chapter's 4K clip,
 *   warms it (mounted and paused: its decoder exists and its first frame is
 *   decoded), and rasterises every layer the next move either way will show.
 *   Only one clip plays at a time. A move made before that shows the poster
 *   and the clip fades in once the scene has settled; a jump to a chapter
 *   that is not loaded waits behind its loader until the 4K clip is ready.
 * - Layers near the visitor are hidden with opacity, never `visibility`, so
 *   they keep their rasterised tiles; chapters further away are let go.
 */
export function SceneDeck() {
  const { done } = useIntro();
  const { reducedMotion } = useDevice();
  const lite = useLite();
  const [index, setIndex] = useState(0);
  const [arrived, setArrived] = useState(true);
  const [waiting, setWaiting] = useState<ChapterId | null>(null);
  const [card, setCard] = useState<ChapterId | null>(null);
  /** How much of each chapter's footage is in the page (see `Stage`). The opening's poster is there from the start. */
  const [stage, setStage] = useState<Readonly<Partial<Record<ChapterId, Stage>>>>({ intro: 2 });
  /** The chapter whose clip plays: the one on screen, or in a move the arriving one once its clip is warm. */
  const [playing, setPlaying] = useState<ChapterId>("intro");
  /** Where a move is going: a jump's destination is near the visitor while it travels. */
  const [target, setTarget] = useState<number | null>(null);
  /** Bumped each time a piece of the idle preparation finishes, so the next one is scheduled. */
  const [prepared, setPrepared] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([0]);
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));
  /** The opening has played and the browser has been idle: now the next chapter may load. */
  const [warm, setWarm] = useState(false);
  const [projectCard, setProjectCard] = useState<{ n: number; title: string } | null>(null);

  const lock = useRef(false);
  const quietUntil = useRef(0);
  const indexRef = useRef(0);
  const readyRef = useRef<Partial<Record<ChapterId, boolean>>>({});
  const bgRefs = useRef<Partial<Record<ChapterId, HTMLDivElement | null>>>({});
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const sweep = useRef<HTMLDivElement>(null);
  const glitchFx = useRef<HTMLDivElement>(null);
  const burnFx = useRef<HTMLDivElement>(null);
  const flashFx = useRef<HTMLDivElement>(null);
  const mosaicFx = useRef<HTMLDivElement>(null);
  const loaderProgress = useRef<Partial<Record<ChapterId, number>>>({});
  const cardRefs = useRef<Partial<Record<ChapterId, HTMLDivElement | null>>>({});
  /** The same as `stage`, for callbacks and idle work. */
  const stageRef = useRef<Partial<Record<ChapterId, Stage>>>({ intro: 2 });
  /** Layers rasterised ahead of time whose content has not changed since. */
  const primed = useRef(new WeakSet<HTMLElement>());
  /** Puts back an idle pre-rasterisation still in progress (a move is starting). */
  const priming = useRef<(() => void) | null>(null);
  /** When the scene on screen arrived (its entrance plays from then). */
  const arrivedAt = useRef(0);

  const step = STEPS[index];
  const chapter = chapterById(step.chapter);
  const play = done && arrived;
  const stills = lite || reducedMotion;
  const here = chapterIndex(step.chapter);
  const there = target === null ? -1 : chapterIndex(STEPS[target].chapter);
  /** Scenes kept paintable (hidden with opacity, so their tiles survive): on screen, either side, and a move's destination. */
  const nearStep = (i: number) => Math.abs(i - index) <= 1 || i === target;
  /** Chapters whose arrival card is ready: either side of the one on screen, that one (its card may still be fading), and a move's destination. */
  const nearCard = (k: number) => Math.abs(k - here) <= 1 || k === there;

  /* Footage bookkeeping ------------------------------------------------ */

  const markReady = useCallback((c: ChapterId) => {
    readyRef.current[c] = true;
    if (c === "intro") setDeck({ assets: { loaded: 1, total: 1, label: "The ridge at dusk" } });
  }, []);
  const onProgress = useCallback((c: ChapterId, p: number) => {
    loaderProgress.current[c] = p;
  }, []);
  const progressOf = useCallback((c: ChapterId) => loaderProgress.current[c] ?? 0, []);
  const registerBg = useCallback((c: ChapterId, el: HTMLDivElement | null) => {
    bgRefs.current[c] = el;
  }, []);
  const registerCard = useCallback((c: ChapterId, el: HTMLDivElement | null) => {
    cardRefs.current[c] = el;
  }, []);

  /** Set how much of a chapter's footage is in the page. Its layer's tiles are redrawn when that changes. */
  const setStageOf = useCallback((c: ChapterId, s: Stage) => {
    if ((stageRef.current[c] ?? 0) === s) return;
    stageRef.current = { ...stageRef.current, [c]: s };
    setStage(stageRef.current);
    const bg = bgRefs.current[c];
    if (bg) primed.current.delete(bg);
  }, []);

  /** The clip mounted in a chapter's layer, if any. */
  const clipOf = useCallback((c: ChapterId) => bgRefs.current[c]?.querySelector("video") ?? null, []);

  // Warm up once the opening has played in and the main thread is idle.
  useEffect(() => {
    if (!done || warm) return;
    let cancel = () => {};
    const t = window.setTimeout(() => {
      cancel = onIdle(() => setWarm(true), 2500);
    }, 2600);
    return () => {
      window.clearTimeout(t);
      cancel();
    };
  }, [done, warm]);

  /* Mounting ------------------------------------------------------------- */

  const isStub = useCallback((i: number) => !!sceneRefs.current[i]?.querySelector(":scope > [data-stub]"), []);

  /** Mount a scene now (before a move to it), if it is still a stub. */
  const ensureMounted = useCallback(
    (i: number) => {
      if (isStub(i)) flushSync(() => setMounted(mountUpdate(i)));
    },
    [isStub],
  );

  /* Getting the next move ready ------------------------------------------ */

  /** The transition a move from step `from` to step `to` plays. */
  const styleOf = useCallback(
    (from: number, to: number): TransitionStyle | "fade" => {
      const fs = STEPS[from];
      const ts = STEPS[to];
      // Chapter changes use the arriving chapter's style (or, going back, the departing one's, reversed).
      // Reduced motion: a plain crossfade, with no glitches, flashes or blinds.
      // Lite (weak machines) gets the same short crossfade: nothing full-screen to clip, filter or blend.
      if (fs.chapter === ts.chapter) return "slide";
      if (reducedMotion || lite) return "fade";
      return chapterById(to > from ? ts.chapter : fs.chapter).transition;
    },
    [reducedMotion, lite],
  );

  /**
   * The layers a move from `from` to `to` will show that are costly to draw: for a new chapter, its
   * footage, its card and the transition's overlay. (The arriving scene itself shows next to nothing
   * in a move: its content waits, invisible, for its entrance.)
   */
  const layersFor = useCallback(
    (from: number, to: number) => {
      const out: { el: HTMLElement; inner?: HTMLElement[] }[] = [];
      const ts = STEPS[to];
      if (STEPS[from].chapter !== ts.chapter) {
        const bg = bgRefs.current[ts.chapter];
        if (bg && (stageRef.current[ts.chapter] ?? 0) > 0) out.push({ el: bg });
        const cardEl = cardRefs.current[ts.chapter];
        if (cardEl) out.push({ el: cardEl, inner: [...cardEl.querySelectorAll<HTMLElement>("[data-card-title]")] });
        const style = styleOf(from, to);
        const glitch = glitchFx.current;
        if (style === "glitch" && glitch) out.push({ el: glitch, inner: [...glitch.querySelectorAll<HTMLElement>("[data-tear],[data-tint]")] });
        if (style === "burn" && burnFx.current) out.push({ el: burnFx.current });
      }
      return out.filter(({ el }) => !primed.current.has(el));
    },
    [styleOf],
  );

  /** Rasterise layers ahead of time (see `prime`), once their images have decoded. */
  const primeLayers = useCallback(async (layers: { el: HTMLElement; inner?: HTMLElement[] }[], alive: () => boolean, waitMs: number) => {
    const imgs = layers.flatMap(({ el }) => [...el.querySelectorAll("img")]);
    await Promise.race([Promise.all(imgs.map((img) => img.decode().catch(() => {}))), new Promise((r) => window.setTimeout(r, waitMs))]);
    if (!alive()) return;
    const p = prime(layers);
    priming.current = p.restore;
    await p.done;
    if (priming.current === p.restore) priming.current = null;
    if (alive()) layers.forEach(({ el }) => primed.current.add(el));
  }, []);

  /**
   * Fetch a chapter's clip, then mount it paused: the browser sets up its
   * decoder and decodes the first frame now, while nothing moves, so the move
   * to it only has to start it. (The fetch first, so the decoding happens at
   * once rather than whenever the network delivers.)
   */
  const warmClip = useCallback(
    async (c: ChapterId, alive: () => boolean) => {
      if (!stills) await prefetchClip(chapterById(c).footage);
      if (!alive()) return;
      setStageOf(c, 2);
      if (stills) return;
      for (let n = 0; n < 30 && !clipOf(c); n++) await frames(1);
      const v = clipOf(c);
      if (warming(v)) await eventOrTimeout(v!, "loadeddata", 6000);
    },
    [stills, setStageOf, clipOf],
  );

  // While a scene is settled, get the next move ready, one piece per idle period: the clip on
  // screen (if the visitor arrived before it was warm), the next chapter's clip, the scenes either
  // side mounted, chapters two or more away let go, then every layer a move either way will show
  // rasterised. A move cancels whatever is still to do; it all resumes once the next scene settles.
  useEffect(() => {
    if (!warm || !arrived || waiting) return;
    let alive = true;
    const isAlive = () => alive;
    const i = index;
    const k = chapterIndex(STEPS[i].chapter);
    const at = (n: number) => stageRef.current[chapters[n]?.id] ?? 0;
    const job = (): (() => Promise<void>) | null => {
      if (!chapters[k].depth && at(k) < 2) return () => warmClip(chapters[k].id, isAlive);
      if (chapters[k + 1] && at(k + 1) < 2) return () => warmClip(chapters[k + 1].id, isAlive);
      for (const j of [i + 1, i - 1]) {
        if (j >= 0 && j < N && isStub(j))
          return async () => {
            startTransition(() => setMounted(mountUpdate(j)));
            await frames(2);
          };
      }
      const far = chapters.filter((c, n) => Math.abs(n - k) > 1 && (stageRef.current[c.id] ?? 0) > 0);
      if (far.length) return async () => far.forEach((c) => setStageOf(c.id, 0));
      for (const j of [i + 1, i - 1]) {
        if (j < 0 || j >= N) continue;
        const layers = layersFor(i, j);
        if (layers.length) return () => primeLayers(layers, isAlive, 3000);
      }
      return null;
    };
    const next = job();
    if (!next) return;
    let cancelIdle = () => {};
    const t = window.setTimeout(
      () => {
        cancelIdle = onIdle(() => {
          void next().then(() => {
            if (alive) setPrepared((n) => n + 1);
          });
        }, 1500);
      },
      Math.max(0, arrivedAt.current + settleMs(i) - performance.now()),
    );
    return () => {
      alive = false;
      window.clearTimeout(t);
      cancelIdle();
      priming.current?.();
    };
  }, [warm, arrived, waiting, index, prepared, isStub, layersFor, primeLayers, warmClip, setStageOf]);

  /* Transitions ---------------------------------------------------------- */

  /** Show the loader while a promise takes longer than a moment. */
  const holdDoor = useCallback(async (c: ChapterId, p: Promise<unknown>, after: number) => {
    const t = window.setTimeout(() => setWaiting(c), after);
    await p;
    window.clearTimeout(t);
    setWaiting(null);
  }, []);

  /**
   * Before a move: the arriving chapter's footage. Next door, its poster at least (the clip is warm
   * already, or waits until the scene settles). Further away (a jump), the loader holds the door until
   * its 4K clip is ready.
   */
  const footageFor = useCallback(
    async (from: ChapterId, c: ChapterId) => {
      const ch = chapterById(c);
      if (ch.depth || stills || Math.abs(chapterIndex(c) - chapterIndex(from)) <= 1) {
        // Stills (and the opening's depth poster) are all there is: stage 2 is the poster.
        if ((stageRef.current[c] ?? 0) < 1) flushSync(() => setStageOf(c, ch.depth || stills ? 2 : 1));
        if (ch.depth && !readyRef.current[c])
          await holdDoor(
            c,
            new Promise<void>((resolve) => {
              const start = performance.now();
              const poll = () => (readyRef.current[c] || performance.now() - start > 15000 ? resolve() : window.setTimeout(poll, 120));
              poll();
            }),
            0,
          );
        const imgs = [...(bgRefs.current[c]?.querySelectorAll("img") ?? [])];
        if (imgs.length) await holdDoor(c, Promise.race([Promise.all(imgs.map((img) => img.decode().catch(() => {}))), new Promise((r) => window.setTimeout(r, 10000))]), 400);
      } else {
        if ((stageRef.current[c] ?? 0) < 2) flushSync(() => setStageOf(c, 2));
        let v = clipOf(c);
        for (let n = 0; n < 30 && !v; n++) {
          await frames(1);
          v = clipOf(c);
        }
        const clip = v;
        if (clip && clip.readyState < 4 && !clip.error)
          await holdDoor(
            c,
            new Promise<void>((resolve) => {
              // Ready as before: it can play through, or it has a first frame and a moment's more data.
              const end = window.setTimeout(resolve, 15000);
              const done = () => {
                window.clearTimeout(end);
                resolve();
              };
              clip.addEventListener("canplaythrough", done, { once: true });
              clip.addEventListener("error", done, { once: true });
              if (clip.readyState >= 2) window.setTimeout(done, 1200);
              else clip.addEventListener("loadeddata", () => window.setTimeout(done, 1200), { once: true });
            }),
            0,
          );
      }
    },
    [stills, setStageOf, clipOf, holdDoor],
  );

  const go = useCallback(
    async (to: number) => {
      const from = indexRef.current;
      if (lock.current || to === from || to < 0 || to >= N) return;
      lock.current = true;
      setDeck({ moving: true });
      // Idle preparation stops here; nothing it started may finish mid-move.
      priming.current?.();

      const fs = STEPS[from];
      const ts = STEPS[to];
      const dir = to > from ? 1 : -1;
      const same = fs.chapter === ts.chapter;
      // The arriving scene exists before anything moves (a jump may land on a scene not mounted yet),
      // and so do its layers (a jump's destination, its footage layer and its card are near from now on).
      ensureMounted(to);
      flushSync(() => setTarget(to));
      if (!same) await footageFor(fs.chapter, ts.chapter);
      // A clip still setting up its decoder (warmed just now) finishes before anything moves.
      for (const el of Object.values(bgRefs.current)) {
        const v = el?.querySelector("video");
        if (warming(v)) await eventOrTimeout(v!, "loadeddata", 1500);
      }

      const bgOut = bgRefs.current[fs.chapter]!;
      const bgIn = bgRefs.current[ts.chapter]!;
      const scOut = sceneRefs.current[from]!;
      const scIn = sceneRefs.current[to]!;
      const axis = dir > 0 ? ts.axis : fs.axis;
      const style = styleOf(from, to);
      const d = reducedMotion ? 0.5 : lite ? 0.8 : DURATION;

      // Anything this move shows that was not rasterised while the screen was still is rasterised now,
      // before the first frame moves: a beat of stillness rather than a stall mid-move.
      const late = layersFor(from, to);
      if (late.length) await primeLayers(late, () => true, 600);

      setArrived(false);
      if (!same) {
        setCard(ts.chapter);
        window.setTimeout(() => setCard(null), d * 1000 * 0.72);
        // The arriving clip starts now if it is warm (the departing one pauses: one clip plays at a time);
        // if it is not, the departing clip plays on and the poster arrives.
        if ((clipOf(ts.chapter)?.readyState ?? 0) >= 2) setPlaying(ts.chapter);
      }
      document.documentElement.dataset.moving = "";

      // Layering: the moving layer on top. Opacity, never visibility: near layers keep their tiles.
      Object.values(bgRefs.current).forEach((el) => el && gsap.set(el, { zIndex: 0, opacity: el === bgOut || el === bgIn ? 1 : 0 }));
      gsap.set(scIn, { opacity: 0, x: 0, y: 0, zIndex: 3 });
      gsap.set(scOut, { zIndex: 2 });

      const tl = gsap.timeline({
        defaults: { ease: "expo.inOut", duration: d },
        onComplete: () => {
          Object.values(bgRefs.current).forEach((el) => {
            if (!el) return;
            gsap.set(el, { clearProps: "transform,clipPath,filter,zIndex,opacity" });
            gsap.set(el, { opacity: el === bgIn ? 1 : 0 });
          });
          gsap.set(scOut, { opacity: 0, clearProps: "transform,filter" });
          resetFx(glitchFx.current, burnFx.current, flashFx.current, mosaicFx.current);
          delete document.documentElement.dataset.moving;
          indexRef.current = to;
          arrivedAt.current = performance.now();
          setIndex(to);
          setTarget(null);
          setPlaying(ts.chapter);
          setArrived(true);
          setVisitedSteps((v) => (v.includes(to) ? v : [...v, to]));
          // The chapters either side get their posters (a fetch, nothing for the GPU yet); clips wait for the scene to settle.
          const k = chapterIndex(ts.chapter);
          for (const n of [k - 1, k + 1]) if (chapters[n] && (stageRef.current[chapters[n].id] ?? 0) < 1) setStageOf(chapters[n].id, 1);
          const d2 = getDeck();
          setDeck({
            chapter: ts.chapter,
            moving: false,
            visited: d2.visited.includes(ts.chapter) ? d2.visited : [...d2.visited, ts.chapter],
          });
          // Swallow the tail of a trackpad flick: the next move needs a fresh gesture.
          quietUntil.current = performance.now() + 450;
          lock.current = false;
          window.history.replaceState(null, "", ts.chapter === "intro" ? "/" : `/#${chapterHash(ts.chapter)}`);
          scIn.focus({ preventScroll: true });
        },
      });

      // Outgoing content always leaves quickly, in the direction of travel.
      // Transform and opacity only: the GPU moves these without repainting (no full-screen blur).
      tl.to(scOut, { opacity: 0, [axis]: `${-dir * (axis === "x" ? 8 : 6)}${axis === "x" ? "vw" : "vh"}`, scale: 0.985, duration: d * 0.45, ease: "power3.in" }, 0);
      // Incoming content fades up at the end; its own entrance plays once it has arrived.
      tl.fromTo(scIn, { opacity: 0 }, { opacity: 1, duration: d * 0.25, ease: "power2.out" }, d * 0.75);
      if (axis === "x" && same) tl.fromTo(scIn, { x: `${dir * 8}vw` }, { x: 0, duration: d * 0.5, ease: "expo.out" }, d * 0.5);

      // Project to project only: the concepts scene arrives with the ordinary sideways slide.
      if (same && ts.chapter === "work" && !reducedMotion && !lite && work[to - firstStepOf("work")] && work[from - firstStepOf("work")]) {
        // Between projects: the window swings away in depth, a warm light sweep crosses
        // the frame, the next project's number flashes up, and it swings in.
        const next = work[to - firstStepOf("work")];
        const stageOut = scOut.querySelector<HTMLElement>("[data-stage-wrap]");
        const copyOut = scOut.querySelector<HTMLElement>("[data-copy-wrap]");
        const stageIn = scIn.querySelector<HTMLElement>("[data-stage-wrap]");
        tl.clear();
        gsap.set(scIn, { opacity: 0, x: 0 });
        if (stageOut) tl.to(stageOut, { rotateY: -dir * 38, xPercent: -dir * 45, z: -200, opacity: 0, duration: d * 0.5, ease: "power3.in" }, 0);
        if (copyOut) tl.to(copyOut, { x: `${-dir * 6}vw`, opacity: 0, duration: d * 0.4, ease: "power3.in" }, 0);
        tl.to(scOut, { opacity: 0, duration: 0.2 }, d * 0.5);
        tl.fromTo(bgIn, { xPercent: 0, scale: 1 }, { xPercent: -dir * 4, scale: 1.08, duration: d * 0.5, ease: "power2.inOut", yoyo: true, repeat: 1 }, 0);
        if (sweep.current) {
          gsap.set(sweep.current, { autoAlpha: 1 });
          tl.fromTo(sweep.current, { xPercent: dir > 0 ? 260 : -160 }, { xPercent: dir > 0 ? -160 : 260, duration: d * 0.75, ease: "power2.inOut" }, d * 0.12);
          tl.set(sweep.current, { autoAlpha: 0 });
        }
        tl.call(() => setProjectCard({ n: to - firstStepOf("work") + 1, title: next.title }), [], d * 0.22);
        tl.call(() => setProjectCard(null), [], d * 0.62);
        tl.set(scIn, { opacity: 1 }, d * 0.6);
        if (stageIn) tl.fromTo(stageIn, { rotateY: dir * 38, xPercent: dir * 45, z: -200, opacity: 0 }, { rotateY: 0, xPercent: 0, z: 0, opacity: 1, duration: d * 0.55, ease: "expo.out" }, d * 0.6);
        tl.add(() => {
          [stageOut, copyOut, stageIn].forEach((el) => el && gsap.set(el, { clearProps: "transform,filter,opacity,visibility" }));
        }, d * 1.2);
      } else if (same) {
        // Same footage, not a project: a slow push that reads as the camera re-framing.
        tl.fromTo(bgIn, { scale: 1 }, { scale: 1.06, duration: d * 0.5, ease: "power2.inOut", yoyo: true, repeat: 1 }, 0);
      } else if (style === "fade") {
        gsap.set(bgIn, { zIndex: 2 });
        gsap.set(bgOut, { zIndex: 1 });
        tl.fromTo(bgIn, { opacity: 0 }, { opacity: 1, ease: "power2.inOut" }, 0);
      } else if (style === "glitch") {
        // A bad signal: the next place tears in through random bands that only ever add up (no strobing),
        // both frames jitter sideways, RGB tear bars and scanlines run over the cut. Same both ways.
        gsap.set(bgIn, { zIndex: 2, clipPath: bandsClip([]) });
        gsap.set(bgOut, { zIndex: 1 });
        const plan = glitchPlan();
        const fx = glitchFx.current;
        const tears = fx ? [...fx.querySelectorAll<HTMLElement>("[data-tear]")] : [];
        const tint = fx?.querySelector<HTMLElement>("[data-tint]") ?? null;
        // Tear bars move and stretch by transform alone (CSS gives them a fixed 5% height), so a cut repaints nothing.
        const fxHeight = fx?.clientHeight || window.innerHeight;
        const cuts = 16;
        const start = d * 0.12;
        const span = d * 0.62;
        if (fx) tl.set(fx, { opacity: 1 }, start);
        for (let f = 0; f <= cuts; f++) {
          const p = f / cuts;
          const shown = Math.round(plan.bands.length * (p * p * (3 - 2 * p)));
          const last = f === cuts;
          tl.call(
            () => {
              bgIn.style.clipPath = last ? "inset(0% 0% 0% 0%)" : bandsClip(plan.order.slice(0, shown).map((i) => plan.bands[i]));
              bgIn.style.transform = last ? "" : `translate3d(${rand(-2.5, 2.5)}%, 0, 0) scale(1.02)`;
              bgOut.style.transform = last ? "" : `translate3d(${rand(-1.5, 1.5)}%, 0, 0)`;
              // Colour breaks on two frames only: a tinted layer over the cut, never a filter on the footage.
              if (tint) {
                tint.style.opacity = f === 5 || f === 11 ? "0.85" : "0";
                if (f === 5 || f === 11) tint.style.transform = `translate3d(${rand(-6, 6)}%, 0, 0)`;
              }
              tears.forEach((t) => {
                const on = !last && Math.random() < 0.7;
                t.style.opacity = on ? "1" : "0";
                // Anywhere down the frame, 0.3–5% of it tall.
                t.style.transform = `translate3d(${rand(-18, 18)}%, ${((rand(0, 98) / 100) * fxHeight).toFixed(1)}px, 0) scaleY(${(rand(0.3, 5) / 5).toFixed(3)})`;
              });
            },
            [],
            start + span * p,
          );
        }
        if (fx) tl.to(fx, { opacity: 0, duration: 0.25 }, start + span);
      } else if (style === "shutter") {
        // Vertical blinds: forward they open on the next place left to right; back, they close right to left.
        const blinds = { p: 0 };
        const top = dir > 0 ? bgIn : bgOut;
        gsap.set(top, { zIndex: 2 });
        gsap.set(dir > 0 ? bgOut : bgIn, { zIndex: 1 });
        tl.fromTo(
          blinds,
          { p: dir > 0 ? 0 : 1 },
          { p: dir > 0 ? 1 : 0, onUpdate: () => (top.style.clipPath = blindsClip(9, blinds.p, dir < 0)) },
          0,
        );
        tl.fromTo(top, { scale: dir > 0 ? 1.12 : 1 }, { scale: dir > 0 ? 1 : 1.12 }, 0);
        tl.fromTo(dir > 0 ? bgOut : bgIn, { scale: dir > 0 ? 1 : 1.06 }, { scale: dir > 0 ? 1.06 : 1 }, 0);
      } else if (style === "burn") {
        // Film burn: a light leak blooms over the frame, burns it out to warm white, and the next place
        // develops through it. Opacity and transforms only: a flat warm layer does the burning, so the
        // 4K footage underneath is never filtered.
        gsap.set(bgIn, { zIndex: 2, opacity: 0 });
        gsap.set(bgOut, { zIndex: 1 });
        const burn = burnFx.current;
        const flash = flashFx.current;
        if (flash) {
          tl.fromTo(flash, { autoAlpha: 0 }, { autoAlpha: 0.82, duration: d * 0.5, ease: "power2.in" }, 0);
          tl.to(flash, { autoAlpha: 0, duration: d * 0.58, ease: "power2.out" }, d * 0.46);
        }
        if (burn) {
          tl.fromTo(burn, { opacity: 0, scale: 0.35, xPercent: 18 }, { opacity: 1, scale: 2.4, xPercent: -6, duration: d * 0.5, ease: "power2.in" }, 0);
          tl.to(burn, { opacity: 0, scale: 3.4, xPercent: -14, duration: d * 0.5, ease: "power2.out" }, d * 0.5);
        }
        tl.fromTo(bgIn, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: d * 0.55, ease: "power2.out" }, d * 0.42);
      } else if (style === "mosaic") {
        // Mosaic: the frame breaks into blocks that go dark in a random order, then the next place
        // comes back block by block.
        const cells = mosaicFx.current ? [...mosaicFx.current.children] : [];
        gsap.set(bgIn, { zIndex: 2, opacity: 0 });
        gsap.set(bgOut, { zIndex: 1 });
        if (cells.length) {
          tl.fromTo(cells, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1.02, duration: d * 0.16, ease: "power2.out", stagger: { amount: d * 0.32, from: "random" } }, 0);
          tl.set(bgIn, { opacity: 1 }, d * 0.5);
          tl.to(cells, { autoAlpha: 0, scale: 0.4, duration: d * 0.16, ease: "power2.in", stagger: { amount: d * 0.32, from: "random" } }, d * 0.52);
        } else {
          tl.to(bgIn, { opacity: 1 }, d * 0.5);
        }
      } else if (dir > 0) {
        gsap.set(bgIn, { zIndex: 2 });
        gsap.set(bgOut, { zIndex: 1 });
        switch (style) {
          case "iris":
            tl.fromTo(bgIn, { clipPath: "circle(0% at 50% 88%)" }, { clipPath: "circle(150% at 50% 88%)" }, 0);
            tl.to(bgOut, { scale: 1.12 }, 0);
            break;
          case "rise":
            tl.fromTo(bgIn, { yPercent: 100, scale: 1.15 }, { yPercent: 0, scale: 1 }, 0);
            tl.to(bgOut, { yPercent: -30, scale: 0.95 }, 0);
            break;
          case "zoom":
            tl.fromTo(bgIn, { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1 }, 0);
            tl.to(bgOut, { scale: 1.6, opacity: 0 }, 0);
            break;
          case "doors":
            tl.fromTo(bgIn, { clipPath: "inset(50% 0% 50% 0%)", scale: 1.15 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1 }, 0);
            tl.to(bgOut, { scale: 1.1 }, 0);
            break;
          case "wipe":
            tl.fromTo(
              bgIn,
              { clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" },
              { clipPath: "polygon(-40% 0%, 100% 0%, 100% 100%, 0% 100%)" },
              0,
            );
            tl.to(bgOut, { xPercent: -12 }, 0);
            break;
          default:
            tl.fromTo(bgIn, { xPercent: 100 }, { xPercent: 0 }, 0);
            tl.to(bgOut, { xPercent: -30 }, 0);
        }
      } else {
        // Going back: the departing chapter's own transition, played in reverse, on top.
        gsap.set(bgOut, { zIndex: 2 });
        gsap.set(bgIn, { zIndex: 1 });
        switch (style) {
          case "iris":
            tl.fromTo(bgOut, { clipPath: "circle(150% at 50% 88%)" }, { clipPath: "circle(0% at 50% 88%)" }, 0);
            tl.fromTo(bgIn, { scale: 1.12 }, { scale: 1 }, 0);
            break;
          case "rise":
            tl.to(bgOut, { yPercent: 100, scale: 1.15 }, 0);
            tl.fromTo(bgIn, { yPercent: -30, scale: 0.95 }, { yPercent: 0, scale: 1 }, 0);
            break;
          case "zoom":
            tl.to(bgOut, { opacity: 0, scale: 1.35 }, 0);
            tl.fromTo(bgIn, { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1 }, 0);
            break;
          case "doors":
            tl.to(bgOut, { clipPath: "inset(50% 0% 50% 0%)", scale: 1.15 }, 0);
            tl.fromTo(bgIn, { scale: 1.1 }, { scale: 1 }, 0);
            break;
          case "wipe":
            tl.fromTo(bgOut, { clipPath: "polygon(-40% 0%, 100% 0%, 100% 100%, 0% 100%)" }, { clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" }, 0);
            tl.fromTo(bgIn, { xPercent: -12 }, { xPercent: 0 }, 0);
            break;
          default:
            tl.to(bgOut, { xPercent: 100 }, 0);
            tl.fromTo(bgIn, { xPercent: -30 }, { xPercent: 0 }, 0);
        }
      }

      // Progress rail.
      const fill = rootRef.current?.querySelector<HTMLElement>("[data-progress-fill]");
      if (fill) tl.to(fill, { scaleY: to / (N - 1), ease: "expo.inOut" }, 0);
    },
    [reducedMotion, lite, ensureMounted, footageFor, styleOf, layersFor, primeLayers, clipOf, setStageOf],
  );

  /* Input ------------------------------------------------------------- */

  useEffect(() => {
    if (!done) return;
    let acc = 0;
    let accTimer = 0;
    const canScrollInside = (target: EventTarget | null, delta: number) => {
      const el = (target as HTMLElement | null)?.closest<HTMLElement>("[data-scene]");
      if (!el) return false;
      if (el.scrollHeight <= el.clientHeight + 2) return false;
      return delta > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2;
    };
    // The menu and the resume viewer are modal: nothing moves behind them.
    const modalOpen = () => !!document.querySelector("[role='dialog'][data-state='open']");
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement | null)?.closest("[data-lenis-prevent],[role='dialog']")) return;
      if (modalOpen()) return;
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (!lock.current && Math.abs(e.deltaY) >= Math.abs(e.deltaX) && canScrollInside(e.target, e.deltaY)) {
        // The scene scrolls natively. Reaching its end does not move on: the next move needs a fresh gesture.
        quietUntil.current = performance.now() + 180;
        acc = 0;
        return;
      }
      e.preventDefault();
      const now = performance.now();
      if (lock.current || now < quietUntil.current) {
        // Still moving, or the tail of the last flick: keep extending the quiet window.
        if (!lock.current) quietUntil.current = now + 180;
        acc = 0;
        return;
      }
      acc += delta;
      window.clearTimeout(accTimer);
      accTimer = window.setTimeout(() => (acc = 0), 200);
      if (Math.abs(acc) > 45) {
        const dir = acc > 0 ? 1 : -1;
        acc = 0;
        go(indexRef.current + dir);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input,textarea,select,[contenteditable],[role='dialog']") || modalOpen()) return;
      if (["ArrowDown", "PageDown", "ArrowRight"].includes(e.key) || (e.key === " " && !t?.closest("button,a"))) {
        e.preventDefault();
        go(indexRef.current + 1);
      } else if (["ArrowUp", "PageUp", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        go(indexRef.current - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      }
    };
    let tx = 0;
    let ty = 0;
    const onTouchStart = (e: TouchEvent) => {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      const d = horizontal ? dx : dy;
      if (Math.abs(d) < 60 || modalOpen()) return;
      if ((e.target as HTMLElement | null)?.closest("[role='dialog']")) return;
      if (!horizontal && canScrollInside(e.target, -dy)) return;
      go(indexRef.current + (d < 0 ? 1 : -1));
    };
    const onGoto = (e: Event) => {
      const { chapter: c } = (e as CustomEvent<GotoDetail>).detail;
      go(firstStepOf(c));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener(GOTO_EVENT, onGoto);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener(GOTO_EVENT, onGoto);
    };
  }, [done, go]);

  // Arriving with a hash (e.g. "All projects" from a case study): travel there after the opening.
  useEffect(() => {
    if (!done) return;
    const hash = window.location.hash.replace("#", "");
    const c = chapterHashes[hash];
    if (c) {
      const t = window.setTimeout(() => go(firstStepOf(c)), 300);
      return () => window.clearTimeout(t);
    }
  }, [done, go]);

  // Page scroll belongs to the deck while it is mounted (app/page.tsx also sets this before first paint).
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("deck-mode");
    return () => html.classList.remove("deck-mode");
  }, []);

  const visitedChapterStarts = useMemo(
    () => chapters.map((c) => ({ c, i: firstStepOf(c.id) })).filter(({ i }) => visitedSteps.includes(i)),
    [visitedSteps],
  );

  return (
    // The deck owns the wheel: Lenis must not cancel it, or scenes taller than the window cannot scroll.
    <div ref={rootRef} data-lenis-prevent-wheel className="fixed inset-0 overflow-hidden bg-black">
      {/* Footage, one layer per chapter. */}
      {chapters.map((c) => (
        <FootageLayer
          key={c.id}
          chapter={c}
          stage={stage[c.id] ?? 0}
          play={playing === c.id}
          urgent={waiting === c.id || step.chapter === c.id}
          active={step.chapter === c.id}
          reveal={done}
          register={registerBg}
          onReady={markReady}
          onProgress={onProgress}
        />
      ))}

      {/* Scenes. Only the current one is visible, focusable and announced. The one leaving keeps
          playing until it has gone (its content holds still while it fades, so nothing redraws). */}
      {STEPS.map((s, i) => (
        <section
          key={s.key}
          ref={(el) => {
            sceneRefs.current[i] = el;
          }}
          data-scene
          tabIndex={-1}
          id={i === firstStepOf(s.chapter) ? chapterHash(s.chapter) : undefined}
          aria-label={s.chapter === "work" ? `The work: ${s.label}` : s.label}
          aria-hidden={i !== index}
          inert={i !== index}
          className="no-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden outline-none [perspective:1800px]"
          style={{ opacity: i === 0 ? 1 : 0, visibility: nearStep(i) ? undefined : "hidden" }}
        >
          <SceneBody i={i} mounted={mounted.has(i)} play={i === index && done} />
        </section>
      ))}

      {/* Transition overlays: a bad signal (glitch), a film burn, and a mosaic grid. Transparent between moves
          (rasterised ahead of time; see `.deck-fx` in globals.css). */}
      <div ref={glitchFx} aria-hidden data-fx="glitch" className="deck-fx pointer-events-none absolute inset-0 z-[19] overflow-hidden opacity-0">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(255_255_255/0.07)_0_1px,transparent_1px_3px)] mix-blend-overlay" />
        {/* The colour break: shown on two frames of the cut. */}
        <div
          data-tint
          className="absolute -inset-x-[8%] inset-y-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-glaze)_85%,transparent),color-mix(in_srgb,var(--color-peach)_70%,transparent)_55%,color-mix(in_srgb,var(--color-glaze)_85%,transparent))] opacity-0 mix-blend-hue"
        />
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            data-tear
            className={cn(
              "absolute inset-x-[-20%] opacity-0 mix-blend-screen",
              // Tear bars in the warm palette: glaze, cream and peach.
              i % 3 === 0
                ? "bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-glaze)_55%,transparent)_20%,color-mix(in_srgb,var(--color-cream)_35%,transparent)_50%,color-mix(in_srgb,var(--color-peach)_55%,transparent)_80%,transparent)]"
                : i % 3 === 1
                  ? "bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-peach)_40%,transparent),transparent_40%,color-mix(in_srgb,var(--color-glaze)_45%,transparent))]"
                  : "bg-bone/[0.18]",
            )}
          />
        ))}
        <div className="film-grain absolute -inset-[10%] opacity-40 mix-blend-overlay" />
      </div>
      <div ref={flashFx} aria-hidden className="pointer-events-none invisible absolute inset-0 z-[18] bg-cream opacity-0" />
      <div
        ref={burnFx}
        aria-hidden
        data-fx="burn"
        className="deck-fx pointer-events-none absolute inset-0 z-[19] origin-[78%_30%] opacity-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(55% 50% at 78% 30%, rgb(255 250 240) 0%, rgb(255 205 150 / 0.95) 20%, rgb(255 120 50 / 0.8) 40%, rgb(170 40 15 / 0.4) 58%, transparent 74%)",
        }}
      />
      <div
        ref={mosaicFx}
        aria-hidden
        data-fx="mosaic"
        className="pointer-events-none absolute inset-0 z-[19] grid"
        style={{ gridTemplateColumns: `repeat(${MOSAIC.cols}, 1fr)`, gridTemplateRows: `repeat(${MOSAIC.rows}, 1fr)` }}
      >
        {Array.from({ length: MOSAIC.cols * MOSAIC.rows }).map((_, i) => (
          <span key={i} className="invisible bg-ink opacity-0 [margin:-0.5px]" />
        ))}
      </div>

      {/* The chapters' own arrival cards: the ones a move either way would show are ready. */}
      {chapters.map(
        (c, k) =>
          (nearCard(k) || card === c.id) && (
            <ChapterCard key={c.id} chapter={c} on={card === c.id} glitch={c.transition === "glitch" && !reducedMotion && !lite} register={registerCard} />
          ),
      )}

      {/* Between projects: a warm light sweep and the next project's number. */}
      <div
        ref={sweep}
        aria-hidden
        className="pointer-events-none invisible absolute inset-y-0 left-0 z-20 w-[45vw] bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-ember)_55%,transparent),color-mix(in_srgb,var(--color-cream)_50%,transparent),color-mix(in_srgb,var(--color-ember)_55%,transparent),transparent)] opacity-0 mix-blend-screen"
      />
      <AnimatePresence>
        {projectCard && (
          <motion.div
            key={projectCard.n}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.4, ease: ease.outExpo }}
          >
            <span className="font-display text-[clamp(8rem,26vw,22rem)] leading-none text-transparent [-webkit-text-stroke:1.5px_var(--color-peach)] [text-shadow:0_0_80px_color-mix(in_srgb,var(--color-glaze)_45%,transparent)]">
              {String(projectCard.n).padStart(2, "0")}
            </span>
            <span className="-mt-4 font-mono text-xs uppercase tracking-[0.3em] text-bone">{projectCard.title}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The chapter's loader, only if its footage is not ready yet. */}
      <ChapterLoader chapter={waiting} progressOf={progressOf} />

      <Rail index={index} arrived={arrived} onGo={go} visited={visitedChapterStarts} />
      {/* Mobile: a thin bar along the top. */}
      <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-[2px] bg-white/10 md:hidden">
        <motion.div className="h-full origin-left bg-bone" animate={{ scaleX: index / (N - 1) }} transition={{ duration: DURATION, ease: ease.inOutQuart }} />
      </div>

      <ContinuePrompt index={index} play={play} hidden={waiting !== null} onGo={go} />

      <p className="sr-only" aria-live="polite">
        {arrived ? `${chapter.label}${step.chapter === "work" ? `: ${step.label}` : ""}` : ""}
      </p>
    </div>
  );
}
