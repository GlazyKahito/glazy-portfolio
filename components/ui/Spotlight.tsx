"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  children: ReactNode;
  className?: string;
  /** Radial highlight colour. */
  color?: string;
  /** Diameter of the highlight in px. */
  size?: number;
  /** Also light the border with the same spotlight. */
  border?: boolean;
}

/**
 * Pointer-following radial highlight (after the 21st.dev "Spotlight Card"
 * pattern), written with CSS variables so it costs nothing when idle.
 */
export function Spotlight({
  children,
  className,
  color = "rgb(255 106 51 / 0.14)",
  size = 420,
  border = true,
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  };

  return (
    <div ref={ref} onPointerMove={onMove} className={cn("group/spot relative isolate", className)}>
      {border && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-700 group-hover/spot:opacity-100"
          style={{
            padding: 1,
            background: `radial-gradient(${size * 0.6}px circle at var(--sx, 50%) var(--sy, 50%), rgb(245 245 247 / 0.5), transparent 60%)`,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-700 group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(${size}px circle at var(--sx, 50%) var(--sy, 50%), ${color}, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}
