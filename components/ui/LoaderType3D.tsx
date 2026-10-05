"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useDevice } from "@/lib/hooks/use-device";

/**
 * Slices of the extrusion, back to front. Each slice is its own 3D layer for the GPU, so there are
 * few of them; a hairline stroke in the slice's own colour closes the steps between them.
 */
const DEPTH = 12;
/** Depth of each slice, in em of the type size (the same total depth as before: 0.2 em). */
const STEP = 0.0168;

/** Extrusion colour: lit ember near the face, falling to near-black at the back. */
const shade = (i: number) => {
  const t = i / DEPTH; // 0 at the face, 1 at the back
  const r = Math.round(160 - 135 * t);
  const g = Math.round(70 - 58 * t);
  const b = Math.round(42 - 34 * t);
  return `rgb(${r} ${g} ${b})`;
};

/**
 * The loading screen's centrepiece: GLAZY as solid, extruded lettering,
 * turning slowly in warm light. The face fills with glaze from the bottom
 * at the real loading progress; a sheen crosses it. On `settle` it turns to
 * face the camera, ready for the letterbox to open on the scene.
 */
export function LoaderType3D({ progress, settle, flat = false }: { progress: number; settle: boolean; flat?: boolean }) {
  const rig = useRef<HTMLDivElement>(null);
  const sway = useRef<gsap.core.Tween | null>(null);
  const settled = useRef(false);
  const { touch } = useDevice();

  useEffect(() => {
    const el = rig.current;
    if (!el || flat) return;
    gsap.set(el, { rotationY: -26, rotationX: 10 });
    sway.current = gsap.to(el, { rotationY: 26, duration: 4.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    const tilt = gsap.quickTo(el, "rotationX", { duration: 1.2, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      if (settled.current) return;
      tilt(10 - ((e.clientY / window.innerHeight) * 2 - 1) * 12);
    };
    if (!touch) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      sway.current?.kill();
      window.removeEventListener("pointermove", onMove);
    };
  }, [touch, flat]);

  useEffect(() => {
    if (!settle || settled.current || !rig.current) return;
    settled.current = true;
    sway.current?.kill();
    const tl = gsap.timeline();
    tl.to(rig.current, { rotationY: 0, rotationX: 0, scale: 1.06, duration: 1.4, ease: "expo.inOut" });
    return () => {
      tl.kill();
    };
  }, [settle]);

  const p = Math.min(1, Math.max(0, progress));
  const level = `${(p * 100).toFixed(1)}%`;
  const type = "font-display leading-[0.8] tracking-[-0.02em] whitespace-nowrap";

  return (
    <div aria-hidden className="flex items-center justify-center [perspective:1300px]">
      <div ref={rig} className="relative [transform-style:preserve-3d]" style={{ fontSize: "min(23vw, 33vh)" }}>
        {/* The extrusion: slices stepping back into the dark (left out on weak machines). */}
        {Array.from({ length: flat ? 0 : DEPTH }, (_, k) => {
          const i = DEPTH - k;
          return (
            <p
              key={i}
              className={`absolute inset-0 ${type}`}
              style={{ color: shade(i), WebkitTextStroke: `0.007em ${shade(i)}`, transform: `translateZ(${(-i * STEP).toFixed(4)}em)` }}
            >
              GLAZY
            </p>
          );
        })}
        {/* The face, filling with glaze. */}
        <p
          className={`relative ${type} bg-clip-text text-transparent [-webkit-text-stroke:1px_rgb(236_230_211/0.45)]`}
          style={{
            backgroundImage: `linear-gradient(to top, var(--color-ember) 0%, var(--color-peach) calc(${level} * 0.55), var(--color-cream) ${level}, rgb(70 34 24) ${level}, rgb(46 22 16) 100%)`,
          }}
        >
          GLAZY
        </p>
        {/* Light moving across the face. */}
        <p
          className={`absolute inset-0 ${type} bg-clip-text text-transparent mix-blend-screen [animation:sheen_3.2s_ease-in-out_infinite]`}
          style={{
            backgroundImage: "linear-gradient(105deg, transparent 38%, rgb(255 240 225 / 0.55) 48%, transparent 58%)",
            backgroundSize: "250% 100%",
          }}
        >
          GLAZY
        </p>
        {/* A faint reflection on the floor. */}
        <p
          className={`absolute inset-x-0 top-full ${type} bg-clip-text text-transparent opacity-20 [mask-image:linear-gradient(to_top,black,transparent_70%)]`}
          style={{
            transform: "scaleY(-1)",
            backgroundImage: `linear-gradient(to bottom, var(--color-ember) 0%, var(--color-peach) calc(${level} * 0.55), var(--color-cream) ${level}, rgb(70 34 24) ${level})`,
          }}
        >
          GLAZY
        </p>
      </div>
    </div>
  );
}
