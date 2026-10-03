"use client";

import { useEffect, useRef } from "react";
import { useLite } from "@/lib/capability";
import { gsap } from "@/lib/gsap";
import { useDevice } from "@/lib/hooks/use-device";
import { cn } from "@/lib/utils";

const WORD = ["G", "L", "A", "Z", "Y"];

/** Where the ridge crosses the middle of the frame, as a fraction of its height (measured from the still). */
const RIDGE = 0.456;

const src = (layer: "sky" | "ridge") => ({
  src: `/scenes/glazy-${layer}-1920.webp`,
  srcSet: `/scenes/glazy-${layer}-1920.webp 1920w, /scenes/glazy-${layer}-3840.webp 3840w`,
});

interface DepthPosterProps {
  /** The opening is the chapter on screen. */
  active: boolean;
  /** The loading screen has opened: raise the wordmark. */
  reveal: boolean;
  /** Both planes have loaded. */
  onReady?: () => void;
}

/**
 * The opening, built like a stage set rather than a flat clip.
 *
 * A 4K still of the dusk footage is split into planes: the sky (with the
 * mountains painted out), the GLAZY wordmark, haze, and the ridge and lake
 * cut out in front. The wordmark stands behind the mountains, so the ridge
 * eats into its letters; on arrival it rises from behind the ridge like a
 * sun. The planes drift past each other in a slow dolly and follow the
 * pointer at different depths, so the frame reads as a real place with
 * distance in it. Lite mode and reduced motion keep it still.
 */
export function DepthPoster({ active, reveal, onReady }: DepthPosterProps) {
  const { touch, reducedMotion, pending } = useDevice();
  const lite = useLite();
  const still = lite || reducedMotion;
  const skyImg = useRef<HTMLImageElement>(null);
  const ridgeImg = useRef<HTMLImageElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const type = useRef<HTMLDivElement>(null);
  const ridge = useRef<HTMLDivElement>(null);
  const letters = useRef<(HTMLSpanElement | null)[]>([]);
  const readyFired = useRef(false);
  const risen = useRef(false);

  const checkReady = () => {
    if (readyFired.current) return;
    const done = [skyImg.current, ridgeImg.current].every((img) => img && img.complete && img.naturalWidth > 0);
    if (done) {
      readyFired.current = true;
      onReady?.();
    }
  };

  // Images that finished before hydration never fire onLoad for React.
  useEffect(() => {
    checkReady();
    // A broken image must not hold the loader forever.
    const t = window.setTimeout(() => {
      if (!readyFired.current) {
        readyFired.current = true;
        onReady?.();
      }
    }, 12000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The wordmark rises from behind the ridge whenever the opening comes into view.
  useEffect(() => {
    const els = letters.current.filter(Boolean) as HTMLSpanElement[];
    if (!els.length) return;
    if (!reveal || !active) {
      if (!active && risen.current) gsap.set(els, { y: 0, yPercent: 0 });
      return;
    }
    if (reducedMotion) {
      gsap.set(els, { y: 0, yPercent: 0 });
      risen.current = true;
      return;
    }
    const first = !risen.current;
    risen.current = true;
    const tl = gsap.timeline();
    tl.fromTo(
      els,
      { y: 0, yPercent: first ? 118 : 70, rotationX: first ? -35 : -15 },
      { y: 0, yPercent: 0, rotationX: 0, duration: first ? 2.6 : 1.8, ease: "expo.out", stagger: { each: 0.09, from: "center" } },
      first ? 0.15 : 0.35,
    );
    if (first) {
      if (sky.current) tl.fromTo(sky.current, { scale: 1.14 }, { scale: 1.04, duration: 3.4, ease: "expo.out" }, 0);
      if (ridge.current) tl.fromTo(ridge.current, { scale: 1.14, yPercent: 3 }, { scale: 1.05, yPercent: 0, duration: 3.4, ease: "expo.out" }, 0);
    }
    return () => {
      tl.kill();
    };
  }, [reveal, active, reducedMotion]);

  // The pointer moves the camera: near planes travel further than far ones.
  useEffect(() => {
    if (pending || touch || still || !active) return;
    const planes = [
      { el: sky.current, x: 0.5, y: 0.4, tilt: 0 },
      { el: type.current, x: 1.2, y: 0.9, tilt: 1 },
      { el: ridge.current, x: 2.1, y: 1.3, tilt: 0 },
    ].filter((p) => p.el);
    const movers = planes.map((p) => ({
      ...p,
      qx: gsap.quickTo(p.el!, "xPercent", { duration: 1.4, ease: "power3.out" }),
      qy: gsap.quickTo(p.el!, "yPercent", { duration: 1.4, ease: "power3.out" }),
      rx: p.tilt ? gsap.quickTo(p.el!, "rotationX", { duration: 1.6, ease: "power3.out" }) : null,
      ry: p.tilt ? gsap.quickTo(p.el!, "rotationY", { duration: 1.6, ease: "power3.out" }) : null,
    }));
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      for (const m of movers) {
        m.qx(-nx * m.x);
        m.qy(-ny * m.y);
        m.rx?.(ny * 3);
        m.ry?.(-nx * 4);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      for (const m of movers) {
        m.qx(0);
        m.qy(0);
        m.rx?.(0);
        m.ry?.(0);
      }
    };
  }, [pending, touch, still, active]);

  const drift = !still && "[animation:dolly_22s_ease-in-out_infinite_alternate]";

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink" aria-hidden>
      {/* The stage keeps the still's 16:9 shape and covers the screen, so the wordmark stays locked to the ridge at any size. */}
      <div
        className="absolute left-1/2 top-1/2 [container-type:size] [perspective:1400px]"
        style={{ width: "max(100vw, 177.78vh)", height: "max(56.25vw, 100vh)", transform: "translate(-50%, -50%)" }}
      >
        {/* Far: the sky. */}
        <div className={cn("absolute inset-0", drift)} style={{ ["--dolly" as string]: "0.35%" }}>
          <div ref={sky} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.04)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- layered poster planes must align pixel for pixel */}
            <img ref={skyImg} {...src("sky")} sizes="100vw" alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" onLoad={checkReady} onError={checkReady} />
          </div>
        </div>

        {/* The low sun behind the letters. */}
        <div
          className={cn("absolute left-1/2 h-[70%] w-[60%] -translate-x-1/2 rounded-full mix-blend-screen", !still && "[animation:glow-breathe_9s_ease-in-out_infinite]")}
          style={{ top: `${RIDGE * 100 - 42}%`, background: "radial-gradient(closest-side, rgb(255 138 76 / 0.42), rgb(255 138 76 / 0.12) 55%, transparent)" }}
        />

        {/* Middle: the wordmark, standing behind the mountains. */}
        <div className={cn("absolute inset-0", drift)} style={{ ["--dolly" as string]: "0.8%" }}>
          <div ref={type} className="absolute inset-0 will-change-transform [transform-style:preserve-3d]">
            <div className="absolute inset-x-0 flex justify-center" style={{ top: `${RIDGE * 100}%` }}>
              <p
                className="flex -translate-y-[86%] font-display [perspective:900px] leading-[0.78] tracking-[-0.03em] [filter:drop-shadow(0_24px_48px_rgb(40_8_0/0.35))]"
                style={{ fontSize: "min(40cqh, 31vw, 42vh)" }}
              >
                {WORD.map((ch, i) => (
                  <span
                    key={ch}
                    ref={(el) => {
                      letters.current[i] = el;
                    }}
                    className="inline-block bg-[linear-gradient(180deg,var(--color-cream)_0%,var(--color-cream)_42%,var(--color-peach)_78%,var(--color-ember)_100%)] bg-clip-text pb-[0.06em] text-transparent will-change-transform"
                    style={{ transform: "translateY(118%)" }}
                  >
                    {ch}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>

        {/* Haze settling on the ridge line, between the letters and the mountains. */}
        <div
          className={cn("absolute inset-x-0 h-[18%] opacity-70 mix-blend-screen blur-xl", !still && "[animation:haze-drift_48s_linear_infinite_alternate]")}
          style={{
            top: `${RIDGE * 100 - 9}%`,
            backgroundImage:
              "radial-gradient(40% 60% at 20% 60%, rgb(255 176 140 / 0.35), transparent 70%), radial-gradient(35% 50% at 60% 50%, rgb(255 150 120 / 0.28), transparent 70%), radial-gradient(30% 55% at 85% 65%, rgb(255 190 150 / 0.3), transparent 70%)",
            backgroundSize: "200% 100%",
          }}
        />

        {/* Near: the ridge and the lake. */}
        <div className={cn("absolute inset-0", drift)} style={{ ["--dolly" as string]: "1.5%" }}>
          <div ref={ridge} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.05)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- layered poster planes must align pixel for pixel */}
            <img ref={ridgeImg} {...src("ridge")} sizes="100vw" alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" onLoad={checkReady} onError={checkReady} />
            {/* Light moving on the water. */}
            <div
              className={cn("absolute inset-x-0 bottom-0 h-[46%] opacity-60 mix-blend-screen", !still && "[animation:glint_7s_linear_infinite]")}
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg, transparent 0 11px, rgb(255 178 130 / 0.07) 11px 12px, transparent 12px 23px, rgb(255 200 160 / 0.05) 23px 24px, transparent 24px 32px)",
                maskImage: "radial-gradient(60% 80% at 55% 20%, black, transparent 75%)",
                WebkitMaskImage: "radial-gradient(60% 80% at 55% 20%, black, transparent 75%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Grade: room for the header above and the copy below. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.4),transparent_20%),linear-gradient(to_top,rgb(0_0_0/0.72),rgb(0_0_0/0.25)_38%,transparent_55%)]" />
      <div className={cn("film-grain pointer-events-none absolute -inset-[10%] opacity-[0.09] mix-blend-overlay", !still && "[animation:grain_1.2s_steps(6)_infinite]")} />
    </div>
  );
}
