"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AboutScene, BuildingScene, ExperienceScene, IntroScene, StackScene } from "@/components/scenes/ChapterScenes";
import { ContactScene } from "@/components/scenes/Contact";
import { DepthPoster } from "@/components/scenes/DepthPoster";
import { RecruiterScene, StartScene } from "@/components/scenes/HireScenes";
import { ProjectScene } from "@/components/scenes/ProjectScene";
import { SceneVideo } from "@/components/scenes/SceneVideo";
import { ServicesScene } from "@/components/scenes/ServicesScene";
import { useIntro } from "@/components/ui/Intro";
import { conceptProjects, featuredProjects as work } from "@/data/projects";
import { ConceptsScene } from "@/components/scenes/ConceptsScene";
import { chapterById, chapterHash, chapterHashes, chapters, type ChapterId, type TransitionStyle } from "@/data/scenes";
import { GOTO_EVENT, getDeck, setDeck, type GotoDetail } from "@/lib/deck";
import { gsap } from "@/lib/gsap";
import { useLite } from "@/lib/capability";
import { useDevice } from "@/lib/hooks/use-device";
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
}

const STEPS: Step[] = [
  { key: "intro", chapter: "intro", axis: "y", label: "GLAZY", render: (p) => <IntroScene play={p} /> },
  { key: "services", chapter: "services", axis: "y", label: "What we make", render: (p) => <ServicesScene play={p} /> },
  ...work.map<Step>((project, i) => ({
    key: `work-${project.slug}`,
    chapter: "work",
    axis: i === 0 ? "y" : "x",
    label: project.title,
    render: (p) => <ProjectScene project={project} index={i} play={p} />,
  })),
  ...(conceptProjects.length
    ? [{ key: "work-concepts", chapter: "work", axis: "x", label: "Concepts", render: (p) => <ConceptsScene play={p} /> } satisfies Step]
    : []),
  { key: "building", chapter: "building", axis: "y", label: "In the works", render: (p) => <BuildingScene play={p} /> },
  { key: "about", chapter: "about", axis: "y", label: "The founder", render: (p) => <AboutScene play={p} /> },
  { key: "experience", chapter: "about", axis: "x", label: "Experience", render: (p) => <ExperienceScene play={p} /> },
  { key: "recruit", chapter: "about", axis: "x", label: "For recruiters", render: (p) => <RecruiterScene play={p} /> },
  { key: "stack", chapter: "stack", axis: "y", label: "The toolkit", render: (p) => <StackScene play={p} /> },
  { key: "start", chapter: "contact", axis: "y", label: "Start a project", render: (p) => <StartScene play={p} /> },
  { key: "contact", chapter: "contact", axis: "x", label: "Say hello", render: (p) => <ContactScene play={p} /> },
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

/** Put the transition overlays away once a move has finished. */
function resetFx(glitch: HTMLElement | null, burn: HTMLElement | null, flash: HTMLElement | null, mosaic: HTMLElement | null) {
  if (glitch) {
    gsap.set(glitch, { autoAlpha: 0 });
    glitch.querySelectorAll<HTMLElement>("[data-tear]").forEach((t) => (t.style.opacity = "0"));
  }
  if (burn) gsap.set(burn, { autoAlpha: 0 });
  if (flash) gsap.set(flash, { autoAlpha: 0 });
  if (mosaic) gsap.set([...mosaic.children], { autoAlpha: 0 });
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
          <span className="block h-full w-[200%] bg-[repeating-linear-gradient(90deg,transparent_0_14px,rgb(245_245_247/0.6)_14px_30px,transparent_30px_52px)] bg-[length:52px_1px] bg-[position:0_50%] bg-repeat-x [animation:wind-drift_1.2s_linear_infinite]" />
        </span>
      );
    case "dusk":
      return (
        <svg viewBox="0 0 60 30" className="h-7 w-14" aria-hidden>
          <path d="M4 26 H56" stroke="rgb(245 245 247 / 0.6)" strokeWidth="1" />
          <circle cx="30" cy="26" r="12" fill="var(--color-ember)" className="[animation:sun-rise_2.4s_ease-out_infinite]" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 120 20" className="h-5 w-28" aria-hidden>
          <path d="M0 10 Q 15 2 30 10 T 60 10 T 90 10 T 120 10" fill="none" stroke="rgb(245 245 247 / 0.7)" strokeWidth="1.5" className="[animation:wave-slide_2s_linear_infinite]" />
        </svg>
      );
  }
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
 * - Footage loads a chapter ahead. If a chapter's 4K footage is not ready
 *   when you get there, its loader holds the door until it is.
 */
export function SceneDeck() {
  const { done } = useIntro();
  const { reducedMotion } = useDevice();
  const lite = useLite();
  const [index, setIndex] = useState(0);
  const [arrived, setArrived] = useState(true);
  const [prompt, setPrompt] = useState(false);
  const [loader, setLoader] = useState<{ chapter: ChapterId; progress: number } | null>(null);
  const [card, setCard] = useState<ChapterId | null>(null);
  const [ready, setReady] = useState<Partial<Record<ChapterId, boolean>>>({});
  const [extraLoad, setExtraLoad] = useState<Set<ChapterId>>(() => new Set(["intro", "services"]));
  const [visitedSteps, setVisitedSteps] = useState<number[]>([0]);

  const lock = useRef(false);
  const quietUntil = useRef(0);
  const indexRef = useRef(0);
  const readyRef = useRef(ready);
  const bgRefs = useRef<Partial<Record<ChapterId, HTMLDivElement | null>>>({});
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);
  const progressFill = useRef<HTMLDivElement>(null);
  const sweep = useRef<HTMLDivElement>(null);
  const glitchFx = useRef<HTMLDivElement>(null);
  const burnFx = useRef<HTMLDivElement>(null);
  const flashFx = useRef<HTMLDivElement>(null);
  const mosaicFx = useRef<HTMLDivElement>(null);
  const [railHold, setRailHold] = useState(true);
  const [railHover, setRailHover] = useState(false);
  const [projectCard, setProjectCard] = useState<{ n: number; title: string; hue: number } | null>(null);
  const loaderProgress = useRef<Partial<Record<ChapterId, number>>>({});

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  const step = STEPS[index];
  const chapter = chapterById(step.chapter);
  const play = done && arrived;

  /* Footage bookkeeping ------------------------------------------------ */

  const markReady = useCallback((c: ChapterId) => {
    setReady((r) => (r[c] ? r : { ...r, [c]: true }));
    if (c === "intro") setDeck({ assets: { loaded: 1, total: 1, label: "The ridge at dusk" } });
  }, []);

  // Footage loads for the current chapter and its neighbours (and stays loaded once fetched).
  const near = useMemo(() => {
    const ci = chapters.findIndex((c) => c.id === STEPS[index].chapter);
    return new Set([chapters[ci - 1]?.id, chapters[ci].id, chapters[ci + 1]?.id].filter(Boolean) as ChapterId[]);
  }, [index]);
  const loadable = useMemo(() => new Set([...near, ...extraLoad]), [near, extraLoad]);

  /* Transitions ---------------------------------------------------------- */

  const waitForFootage = useCallback(
    (c: ChapterId) =>
      new Promise<void>((resolve) => {
        if (readyRef.current[c]) return resolve();
        setExtraLoad((s) => new Set(s).add(c));
        setLoader({ chapter: c, progress: loaderProgress.current[c] ?? 0 });
        const start = performance.now();
        const poll = () => {
          if (readyRef.current[c] || performance.now() - start > 15000) {
            setLoader(null);
            resolve();
            return;
          }
          setLoader({ chapter: c, progress: loaderProgress.current[c] ?? 0 });
          window.setTimeout(poll, 120);
        };
        poll();
      }),
    [],
  );

  const go = useCallback(
    async (to: number) => {
      const from = indexRef.current;
      if (lock.current || to === from || to < 0 || to >= N) return;
      lock.current = true;
      setDeck({ moving: true });
      setPrompt(false);

      const fs = STEPS[from];
      const ts = STEPS[to];
      const dir = to > from ? 1 : -1;
      const same = fs.chapter === ts.chapter;
      await waitForFootage(ts.chapter);

      const bgOut = bgRefs.current[fs.chapter]!;
      const bgIn = bgRefs.current[ts.chapter]!;
      const scOut = sceneRefs.current[from]!;
      const scIn = sceneRefs.current[to]!;
      const axis = dir > 0 ? ts.axis : fs.axis;
      // Chapter changes use the arriving chapter's style (or, going back, the departing one's, reversed).
      // Reduced motion: a plain crossfade, with no glitches, flashes or blinds.
      // Lite (weak machines) gets the same short crossfade: nothing full-screen to clip, filter or blend.
      const style: TransitionStyle | "fade" = same ? "slide" : reducedMotion || lite ? "fade" : chapterById(dir > 0 ? ts.chapter : fs.chapter).transition;
      const d = reducedMotion ? 0.5 : lite ? 0.8 : DURATION;

      setArrived(false);
      if (!same) {
        setCard(ts.chapter);
        window.setTimeout(() => setCard(null), d * 1000 * 0.72);
      }

      // Layering: the moving layer on top.
      Object.values(bgRefs.current).forEach((el) => el && gsap.set(el, { zIndex: 0, autoAlpha: el === bgOut || el === bgIn ? 1 : 0 }));
      gsap.set(scIn, { autoAlpha: 0, x: 0, y: 0, zIndex: 3 });
      gsap.set(scOut, { zIndex: 2 });

      const tl = gsap.timeline({
        defaults: { ease: "expo.inOut", duration: d },
        onComplete: () => {
          Object.values(bgRefs.current).forEach((el) => {
            if (!el) return;
            gsap.set(el, { clearProps: "transform,clipPath,filter,zIndex,opacity" });
            gsap.set(el, { autoAlpha: el === bgIn ? 1 : 0 });
          });
          gsap.set(scOut, { autoAlpha: 0, clearProps: "transform,filter" });
          resetFx(glitchFx.current, burnFx.current, flashFx.current, mosaicFx.current);
          setRailHold(true);
          indexRef.current = to;
          setIndex(to);
          setArrived(true);
          setVisitedSteps((v) => (v.includes(to) ? v : [...v, to]));
          setExtraLoad((s) => (s.has(fs.chapter) ? s : new Set(s).add(fs.chapter)));
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
      tl.to(scOut, { autoAlpha: 0, [axis]: `${-dir * (axis === "x" ? 8 : 6)}${axis === "x" ? "vw" : "vh"}`, scale: 0.985, duration: d * 0.45, ease: "power3.in" }, 0);
      // Incoming content fades up at the end; its own entrance plays once it has arrived.
      tl.fromTo(scIn, { autoAlpha: 0 }, { autoAlpha: 1, duration: d * 0.25, ease: "power2.out" }, d * 0.75);
      if (axis === "x" && same) tl.fromTo(scIn, { x: `${dir * 8}vw` }, { x: 0, duration: d * 0.5, ease: "expo.out" }, d * 0.5);

      // Project to project only: the concepts scene arrives with the ordinary sideways slide.
      if (same && ts.chapter === "work" && !reducedMotion && !lite && work[to - firstStepOf("work")] && work[from - firstStepOf("work")]) {
        // Between projects: the window swings away in depth, a light sweep in the next
        // project's colour crosses the frame, its number flashes up, and it swings in.
        const next = work[to - firstStepOf("work")];
        const stageOut = scOut.querySelector<HTMLElement>("[data-stage-wrap]");
        const copyOut = scOut.querySelector<HTMLElement>("[data-copy-wrap]");
        const stageIn = scIn.querySelector<HTMLElement>("[data-stage-wrap]");
        tl.clear();
        gsap.set(scIn, { autoAlpha: 0, x: 0 });
        if (stageOut) tl.to(stageOut, { rotateY: -dir * 38, xPercent: -dir * 45, z: -200, autoAlpha: 0, duration: d * 0.5, ease: "power3.in" }, 0);
        if (copyOut) tl.to(copyOut, { x: `${-dir * 6}vw`, autoAlpha: 0, duration: d * 0.4, ease: "power3.in" }, 0);
        tl.to(scOut, { autoAlpha: 0, duration: 0.2 }, d * 0.5);
        tl.fromTo(bgIn, { xPercent: 0, scale: 1 }, { xPercent: -dir * 4, scale: 1.08, duration: d * 0.5, ease: "power2.inOut", yoyo: true, repeat: 1 }, 0);
        if (sweep.current) {
          gsap.set(sweep.current, { autoAlpha: 1, background: `linear-gradient(90deg, transparent, ${`hsl(${next.hue} 90% 60% / 0.55)`}, rgb(255 255 255 / 0.5), ${`hsl(${next.hue} 90% 60% / 0.55)`}, transparent)` });
          tl.fromTo(sweep.current, { xPercent: dir > 0 ? 260 : -160 }, { xPercent: dir > 0 ? -160 : 260, duration: d * 0.75, ease: "power2.inOut" }, d * 0.12);
          tl.set(sweep.current, { autoAlpha: 0 });
        }
        tl.call(() => setProjectCard({ n: to - firstStepOf("work") + 1, title: next.title, hue: next.hue }), [], d * 0.22);
        tl.call(() => setProjectCard(null), [], d * 0.62);
        tl.set(scIn, { autoAlpha: 1 }, d * 0.6);
        if (stageIn) tl.fromTo(stageIn, { rotateY: dir * 38, xPercent: dir * 45, z: -200, autoAlpha: 0 }, { rotateY: 0, xPercent: 0, z: 0, autoAlpha: 1, duration: d * 0.55, ease: "expo.out" }, d * 0.6);
        tl.add(() => {
          [stageOut, copyOut, stageIn].forEach((el) => el && gsap.set(el, { clearProps: "transform,filter,opacity,visibility" }));
        }, d * 1.2);
      } else if (same) {
        // Same footage, not a project: a slow push that reads as the camera re-framing.
        tl.fromTo(bgIn, { scale: 1 }, { scale: 1.06, duration: d * 0.5, ease: "power2.inOut", yoyo: true, repeat: 1 }, 0);
      } else if (style === "fade") {
        gsap.set(bgIn, { zIndex: 2 });
        gsap.set(bgOut, { zIndex: 1 });
        tl.fromTo(bgIn, { autoAlpha: 0 }, { autoAlpha: 1, ease: "power2.inOut" }, 0);
      } else if (style === "glitch") {
        // A bad signal: the next place tears in through random bands that only ever add up (no strobing),
        // both frames jitter sideways, RGB tear bars and scanlines run over the cut. Same both ways.
        gsap.set(bgIn, { zIndex: 2, clipPath: bandsClip([]) });
        gsap.set(bgOut, { zIndex: 1 });
        const plan = glitchPlan();
        const fx = glitchFx.current;
        const tears = fx ? [...fx.querySelectorAll<HTMLElement>("[data-tear]")] : [];
        const frames = 16;
        const start = d * 0.12;
        const span = d * 0.62;
        if (fx) tl.set(fx, { autoAlpha: 1 }, start);
        for (let f = 0; f <= frames; f++) {
          const p = f / frames;
          const shown = Math.round(plan.bands.length * (p * p * (3 - 2 * p)));
          const last = f === frames;
          tl.call(
            () => {
              bgIn.style.clipPath = last ? "inset(0% 0% 0% 0%)" : bandsClip(plan.order.slice(0, shown).map((i) => plan.bands[i]));
              bgIn.style.transform = last ? "" : `translate3d(${rand(-2.5, 2.5)}%, 0, 0) scale(1.02)`;
              bgOut.style.transform = last ? "" : `translate3d(${rand(-1.5, 1.5)}%, 0, 0)`;
              // Colour breaks on two frames only.
              bgIn.style.filter = f === 5 || f === 11 ? `hue-rotate(${rand(-70, 70)}deg) saturate(2) contrast(1.25)` : "";
              tears.forEach((t) => {
                const on = !last && Math.random() < 0.7;
                t.style.opacity = on ? "1" : "0";
                t.style.top = `${rand(0, 98)}%`;
                t.style.height = `${rand(0.3, 5)}%`;
                t.style.transform = `translate3d(${rand(-18, 18)}%, 0, 0)`;
              });
            },
            [],
            start + span * p,
          );
        }
        if (fx) tl.to(fx, { autoAlpha: 0, duration: 0.25 }, start + span);
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
        gsap.set(bgIn, { zIndex: 2, autoAlpha: 0 });
        gsap.set(bgOut, { zIndex: 1 });
        const burn = burnFx.current;
        const flash = flashFx.current;
        if (flash) {
          tl.fromTo(flash, { autoAlpha: 0 }, { autoAlpha: 0.82, duration: d * 0.5, ease: "power2.in" }, 0);
          tl.to(flash, { autoAlpha: 0, duration: d * 0.58, ease: "power2.out" }, d * 0.46);
        }
        if (burn) {
          tl.fromTo(burn, { autoAlpha: 0, scale: 0.35, xPercent: 18 }, { autoAlpha: 1, scale: 2.4, xPercent: -6, duration: d * 0.5, ease: "power2.in" }, 0);
          tl.to(burn, { autoAlpha: 0, scale: 3.4, xPercent: -14, duration: d * 0.5, ease: "power2.out" }, d * 0.5);
        }
        tl.fromTo(bgIn, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: d * 0.55, ease: "power2.out" }, d * 0.42);
      } else if (style === "mosaic") {
        // Mosaic: the frame breaks into blocks that go dark in a random order, then the next place
        // comes back block by block.
        const cells = mosaicFx.current ? [...mosaicFx.current.children] : [];
        gsap.set(bgIn, { zIndex: 2, autoAlpha: 0 });
        gsap.set(bgOut, { zIndex: 1 });
        if (cells.length) {
          tl.fromTo(cells, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1.02, duration: d * 0.16, ease: "power2.out", stagger: { amount: d * 0.32, from: "random" } }, 0);
          tl.set(bgIn, { autoAlpha: 1 }, d * 0.5);
          tl.to(cells, { autoAlpha: 0, scale: 0.4, duration: d * 0.16, ease: "power2.in", stagger: { amount: d * 0.32, from: "random" } }, d * 0.52);
        } else {
          tl.to(bgIn, { autoAlpha: 1 }, d * 0.5);
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
            tl.fromTo(bgIn, { autoAlpha: 0, scale: 1.35 }, { autoAlpha: 1, scale: 1 }, 0);
            tl.to(bgOut, { scale: 1.6, autoAlpha: 0 }, 0);
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
            tl.to(bgOut, { autoAlpha: 0, scale: 1.35 }, 0);
            tl.fromTo(bgIn, { scale: 1.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 }, 0);
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
      if (progressFill.current) tl.to(progressFill.current, { scaleY: to / (N - 1), ease: "expo.inOut" }, 0);
    },
    [reducedMotion, lite, waitForFootage],
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
      if (!lock.current && Math.abs(e.deltaY) >= Math.abs(e.deltaX) && canScrollInside(e.target, e.deltaY)) return;
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

  // The Continue prompt appears once the scene has arrived and played in.
  useEffect(() => {
    if (!play) return;
    const t = window.setTimeout(() => setPrompt(true), 1500);
    return () => window.clearTimeout(t);
  }, [play, index]);

  // Page scroll belongs to the deck while it is mounted.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("deck-mode");
    return () => html.classList.remove("deck-mode");
  }, []);

  // The rail's label shows while moving and for a moment after arriving, then steps aside (hover brings it back).
  useEffect(() => {
    if (!railHold || !arrived) return;
    const t = window.setTimeout(() => setRailHold(false), 2600);
    return () => window.clearTimeout(t);
  }, [railHold, arrived, index]);
  const showRailLabel = !arrived || railHold || railHover;

  const last = index === N - 1;
  const nextAxis = last ? "y" : STEPS[index + 1].axis;
  const railLabel = step.chapter === "work" ? `${chapter.number} ${chapter.label} · ${step.label}` : `${chapter.number} ${step.label}`;
  const loaderChapter = loader ? chapterById(loader.chapter) : null;
  const cardChapter = card ? chapterById(card) : null;

  const visitedChapterStarts = useMemo(
    () => chapters.map((c) => ({ c, i: firstStepOf(c.id) })).filter(({ i }) => visitedSteps.includes(i)),
    [visitedSteps],
  );

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Footage, one layer per chapter. */}
      {chapters.map((c) => (
        <div
          key={c.id}
          ref={(el) => {
            bgRefs.current[c.id] = el;
          }}
          aria-hidden
          className="absolute inset-0 will-change-transform"
          style={{ visibility: c.id === "intro" ? "visible" : "hidden" }}
        >
          {c.depth ? (
            <DepthPoster active={step.chapter === c.id} reveal={done} onReady={() => markReady(c.id)} />
          ) : (
            <>
              <SceneVideo
                name={c.footage}
                load={loadable.has(c.id)}
                play={card !== null ? card === c.id : step.chapter === c.id}
                onReady={() => markReady(c.id)}
                onProgress={(p) => {
                  loaderProgress.current[c.id] = p;
                }}
              />
              {/* Legibility: a cinematic grade, darker where text sits. */}
              <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_60%,rgb(0_0_0/0.62),transparent_60%),linear-gradient(to_top,rgb(0_0_0/0.55),transparent_45%),linear-gradient(to_bottom,rgb(0_0_0/0.35),transparent_25%)]" />
            </>
          )}
        </div>
      ))}

      {/* Scenes. Only the current one is visible, focusable and announced. */}
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
          style={{ visibility: i === 0 ? "visible" : "hidden" }}
        >
          {s.render(i === index && play)}
        </section>
      ))}

      {/* Transition overlays: a bad signal (glitch), a film burn, and a mosaic grid. Hidden between moves. */}
      <div ref={glitchFx} aria-hidden className="pointer-events-none invisible absolute inset-0 z-[19] overflow-hidden opacity-0">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(255_255_255/0.07)_0_1px,transparent_1px_3px)] mix-blend-overlay" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            data-tear
            className="absolute inset-x-[-20%] opacity-0 mix-blend-screen"
            style={{
              background:
                i % 3 === 0
                  ? "linear-gradient(90deg, transparent, rgb(255 40 90 / 0.55) 20%, rgb(255 255 255 / 0.35) 50%, rgb(0 230 255 / 0.55) 80%, transparent)"
                  : i % 3 === 1
                    ? "linear-gradient(90deg, rgb(0 230 255 / 0.4), transparent 40%, rgb(255 40 90 / 0.45))"
                    : "rgb(245 245 247 / 0.18)",
            }}
          />
        ))}
        <div className="film-grain absolute -inset-[10%] opacity-40 mix-blend-overlay" />
      </div>
      <div ref={flashFx} aria-hidden className="pointer-events-none invisible absolute inset-0 z-[18] bg-cream opacity-0" />
      <div
        ref={burnFx}
        aria-hidden
        className="pointer-events-none invisible absolute inset-0 z-[19] origin-[78%_30%] opacity-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(55% 50% at 78% 30%, rgb(255 250 240) 0%, rgb(255 205 150 / 0.95) 20%, rgb(255 120 50 / 0.8) 40%, rgb(170 40 15 / 0.4) 58%, transparent 74%)",
        }}
      />
      <div
        ref={mosaicFx}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[19] grid"
        style={{ gridTemplateColumns: `repeat(${MOSAIC.cols}, 1fr)`, gridTemplateRows: `repeat(${MOSAIC.rows}, 1fr)` }}
      >
        {Array.from({ length: MOSAIC.cols * MOSAIC.rows }).map((_, i) => (
          <span key={i} className="invisible bg-ink opacity-0 [margin:-0.5px]" />
        ))}
      </div>

      {/* The chapter's own arrival card. */}
      <AnimatePresence>
        {cardChapter && (
          <motion.div
            key={cardChapter.id}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: ease.outQuart }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-bone/80">Chapter {cardChapter.number}</p>
            <motion.p
              data-text={cardChapter.label}
              className={cn(
                "mt-4 font-display text-[clamp(3.5rem,10vw,9rem)] leading-[0.9] text-bone [text-shadow:0_4px_60px_rgb(0_0_0/0.5)]",
                cardChapter.transition === "glitch" && !reducedMotion && !lite && "glitch-text",
              )}
              initial={{ opacity: 0, scale: 1.08, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: ease.outExpo }}
            >
              {cardChapter.label}
            </motion.p>
            <div className="mt-8">
              <Emblem mood={cardChapter.mood} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Between projects: a light sweep and the next project's number. */}
      <div ref={sweep} aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[45vw] opacity-0 mix-blend-screen" />
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
            <span
              className="font-display text-[clamp(8rem,26vw,22rem)] leading-none text-transparent"
              style={{ WebkitTextStroke: `1.5px hsl(${projectCard.hue} 90% 70%)`, textShadow: `0 0 80px hsl(${projectCard.hue} 90% 55% / 0.45)` }}
            >
              {String(projectCard.n).padStart(2, "0")}
            </span>
            <span className="-mt-4 font-mono text-xs uppercase tracking-[0.3em] text-bone">{projectCard.title}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The chapter's loader, only if its footage is not ready yet. */}
      <AnimatePresence>
        {loaderChapter && loader && (
          <motion.div
            key="loader"
            role="status"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-black/70 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative h-20 w-20">
              <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" aria-hidden>
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgb(245 245 247 / 0.12)" strokeWidth="2" />
                <circle cx="40" cy="40" r="36" fill="none" stroke="#f5f5f7" strokeWidth="2" strokeLinecap="round" strokeDasharray={`${Math.max(0.04, loader.progress) * 226} 226`} className="transition-[stroke-dasharray] duration-300" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-xs tabular-nums text-bone">{Math.round(loader.progress * 100)}%</span>
            </div>
            <div className="text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-bone-2">Loading chapter {loaderChapter.number}</p>
              <p className="mt-2 font-display text-3xl text-bone">{loaderChapter.depth ? "4K poster" : "4K footage"}</p>
            </div>
            <Emblem mood={loaderChapter.mood} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress rail: how far you are, and where. Never what comes next. */}
      <nav
        aria-label="Progress"
        onPointerEnter={() => setRailHover(true)}
        onPointerLeave={() => setRailHover(false)}
        className="pointer-events-none absolute right-[max(1rem,calc(var(--gutter)-1.5rem))] top-1/2 z-10 hidden h-[46vh] -translate-y-1/2 md:block"
      >
        <div aria-hidden className="pointer-events-auto absolute -inset-x-3 inset-y-0" />
        <div className="relative h-full w-px bg-white/15">
          <div ref={progressFill} className="absolute inset-x-0 top-0 h-full origin-top bg-bone" style={{ transform: `scaleY(0)` }} />
          {visitedChapterStarts.map(({ c, i }) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Back to ${c.label}`}
              onClick={() => go(i)}
              className="pointer-events-auto absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bone/70 bg-black/60 transition-transform hover:scale-125"
              style={{ top: `${(i / (N - 1)) * 100}%` }}
            />
          ))}
          <motion.div
            className="absolute right-4 whitespace-nowrap rounded-full border border-white/10 bg-black/45 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone backdrop-blur-xl"
            animate={{ top: `${(index / (N - 1)) * 100}%`, opacity: showRailLabel ? 1 : 0, x: showRailLabel ? 0 : 6 }}
            transition={{ top: { duration: DURATION, ease: ease.inOutQuart }, opacity: { duration: 0.5 }, x: { duration: 0.5 } }}
            style={{ translateY: "-50%" }}
          >
            {railLabel}
          </motion.div>
        </div>
      </nav>
      {/* Mobile: a thin bar along the top. */}
      <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-[2px] bg-white/10 md:hidden">
        <motion.div className="h-full origin-left bg-bone" animate={{ scaleX: index / (N - 1) }} transition={{ duration: DURATION, ease: ease.inOutQuart }} />
      </div>

      {/* Continue: appears once the scene has loaded and played in. */}
      <AnimatePresence>
        {prompt && !loader && (
          <motion.button
            key={`prompt-${index}`}
            type="button"
            onClick={() => go(last ? 0 : index + 1)}
            className="deck-prompt absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/20 bg-white/[0.08] py-2.5 pl-5 pr-2.5 text-sm text-bone shadow-[0_10px_40px_-10px_rgb(0_0_0/0.6)] backdrop-blur-md transition-colors hover:bg-white/[0.16] md:bottom-8"
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

      <p className="sr-only" aria-live="polite">
        {arrived ? `${chapter.label}${step.chapter === "work" ? `: ${step.label}` : ""}` : ""}
      </p>
    </div>
  );
}
