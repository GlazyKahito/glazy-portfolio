"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const WORD = ["G", "L", "A", "Z", "Y"];
/** Must match components/scenes/DepthPoster.tsx. */
const RIDGE = 0.456;

const PLANES = [
  { key: "sky", label: "01 — Sky · 4K", z: -320 },
  { key: "type", label: "02 — Wordmark", z: 0 },
  { key: "ridge", label: "03 — Ridge · 4K", z: 300 },
] as const;

/**
 * The loading screen's centrepiece: the opening scene as an exploded stage
 * set. Its planes (sky, wordmark, ridge) float apart in 3D and slowly orbit;
 * the wordmark fills with glaze as the site really loads. On `assemble` the
 * rig swings square to the camera, the planes slide together and grow to
 * cover the screen, and the wordmark flies past the camera and dissolves,
 * leaving exactly the frame the opening scene starts on.
 */
export function LoaderDiorama({ progress, assemble }: { progress: number; assemble: boolean }) {
  const rig = useRef<HTMLDivElement>(null);
  const orbit = useRef<HTMLDivElement>(null);
  const planes = useRef<(HTMLDivElement | null)[]>([]);
  const frames = useRef<(HTMLDivElement | null)[]>([]);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const orbitTween = useRef<gsap.core.Tween | null>(null);
  const assembled = useRef(false);

  // Exploded scale: the 16:9 stage shrunk to sit comfortably in the middle of the screen.
  useEffect(() => {
    const size = () => {
      if (!rig.current || assembled.current) return;
      const w = Math.max(window.innerWidth, (window.innerHeight * 16) / 9);
      const h = Math.max((window.innerWidth * 9) / 16, window.innerHeight);
      const s = Math.min(0.64, (window.innerWidth * (window.innerWidth < 640 ? 0.92 : 0.7)) / w, (window.innerHeight * 0.5) / h);
      gsap.set(rig.current, { scale: s });
    };
    size();
    window.addEventListener("resize", size);
    if (orbit.current) {
      gsap.set(orbit.current, { rotationY: -8 });
      orbitTween.current = gsap.to(orbit.current, { rotationY: 8, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
    return () => {
      window.removeEventListener("resize", size);
      orbitTween.current?.kill();
    };
  }, []);

  // While loading: the closer to ready, the more it turns toward you and draws together.
  useEffect(() => {
    if (assembled.current || !rig.current) return;
    const p = Math.min(1, Math.max(0, progress));
    gsap.set(rig.current, { rotationY: -30 + 12 * p, rotationX: 16 - 5 * p });
    planes.current.forEach((el, i) => el && gsap.set(el, { z: PLANES[i].z * (1 - 0.35 * p) }));
  }, [progress]);

  // Lock together into the opening frame.
  useEffect(() => {
    if (!assemble || assembled.current || !rig.current) return;
    assembled.current = true;
    orbitTween.current?.kill();
    const [sky, type, ridge] = planes.current;
    const tl = gsap.timeline({ defaults: { duration: 1.8, ease: "expo.inOut" } });
    if (orbit.current) tl.to(orbit.current, { rotationY: 0 }, 0);
    tl.to(rig.current, { rotationY: 0, rotationX: 0, scale: 1 }, 0);
    if (sky) tl.to(sky, { z: 0, scale: 1.04 }, 0);
    if (ridge) tl.to(ridge, { z: 0, scale: 1.05 }, 0);
    if (type) tl.to(type, { z: 700, autoAlpha: 0, filter: "blur(14px)", duration: 1.5, ease: "power3.in" }, 0.1);
    tl.to(frames.current.filter(Boolean), { borderRadius: 0, borderColor: "rgb(255 255 255 / 0)", boxShadow: "0 0 0 0 rgb(0 0 0 / 0)" }, 0);
    tl.to(labels.current.filter(Boolean), { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, 0);
    return () => {
      tl.kill();
    };
  }, [assemble]);

  const p = Math.min(1, Math.max(0, progress));
  const level = `${(p * 100).toFixed(1)}%`;

  return (
    <div aria-hidden className="absolute inset-0 [perspective:2200px] [perspective-origin:50%_45%]">
      <div
        ref={rig}
        className="absolute left-1/2 top-1/2 [container-type:size] [transform-style:preserve-3d]"
        style={{ width: "max(100vw, 177.78vh)", height: "max(56.25vw, 100vh)", marginLeft: "calc(max(100vw, 177.78vh) / -2)", marginTop: "calc(max(56.25vw, 100vh) / -2)" }}
      >
        <div ref={orbit} className="absolute inset-0 [transform-style:preserve-3d]">
          {PLANES.map((plane, i) => (
            <div
              key={plane.key}
              ref={(el) => {
                planes.current[i] = el;
              }}
              className="absolute inset-0 [transform-style:preserve-3d]"
            >
              <div
                ref={(el) => {
                  frames.current[i] = el;
                }}
                className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/15"
                style={{ boxShadow: plane.key === "type" ? "none" : "0 40px 120px -30px rgb(0 0 0 / 0.8)" }}
              >
                {plane.key === "type" ? (
                  <div className="absolute inset-x-0 flex justify-center" style={{ top: `${RIDGE * 100}%` }}>
                    <p className="flex -translate-y-[86%] font-display leading-[0.78] tracking-[-0.03em]" style={{ fontSize: "40cqh" }}>
                      {WORD.map((ch) => (
                        <span
                          key={ch}
                          className="inline-block bg-clip-text pb-[0.06em] text-transparent [-webkit-text-stroke:2px_rgb(236_230_211/0.4)]"
                          style={{
                            backgroundImage: `linear-gradient(to top, var(--color-ember) 0%, var(--color-peach) calc(${level} * 0.6), var(--color-cream) ${level}, transparent ${level})`,
                          }}
                        >
                          {ch}
                        </span>
                      ))}
                    </p>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- the same planes as the opening scene, already in cache
                  <img src={`/scenes/glazy-${plane.key}-1920.webp`} alt="" className="h-full w-full object-cover" decoding="async" />
                )}
              </div>
              <span
                ref={(el) => {
                  labels.current[i] = el;
                }}
                className="absolute -top-[5.5cqh] left-0 font-mono text-[2.6cqh] uppercase tracking-[0.3em] text-bone/60"
              >
                {plane.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
