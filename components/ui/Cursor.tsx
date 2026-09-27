"use client";

import { useEffect, useRef } from "react";
import { useDevice } from "@/lib/hooks/use-device";
import { lerp } from "@/lib/utils";

export type CursorState = "default" | "link" | "view" | "drag" | "hidden";

/**
 * Custom cursor. Elements opt into a state with `data-cursor="view|link|drag"`
 * and can set `data-cursor-label="Open"`. Disabled on touch and reduced motion.
 */
export function Cursor() {
  const { touch, reducedMotion, pending } = useDevice();
  const enabled = !pending && !touch && !reducedMotion;
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.dataset.cursor = "custom";

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let state: CursorState = "default";
    let visible = false;
    let raf = 0;
    let pressed = false;

    const apply = (next: CursorState, text = "") => {
      if (next === state && label.textContent === text) return;
      state = next;
      ring.dataset.state = next;
      dot.dataset.state = next;
      label.textContent = text;
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        rx = tx;
        ry = ty;
        ring.style.opacity = "1";
        dot.style.opacity = "1";
      }
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button, [role='button'], iframe, input, textarea, select",
      );
      if (!target) return apply("default");
      const explicit = target.dataset.cursor as CursorState | undefined;
      if (explicit) return apply(explicit, target.dataset.cursorLabel ?? (explicit === "view" ? "View" : explicit === "drag" ? "Drag" : ""));
      if (target.tagName === "IFRAME" || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return apply("hidden");
      apply("link");
    };

    const onLeave = () => {
      visible = false;
      ring.style.opacity = "0";
      dot.style.opacity = "0";
    };
    const onDown = () => {
      pressed = true;
      ring.dataset.pressed = "true";
    };
    const onUp = () => {
      pressed = false;
      delete ring.dataset.pressed;
    };

    const tick = () => {
      rx = lerp(rx, tx, 0.18);
      ry = lerp(ry, ty, 0.18);
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${pressed ? 0.85 : 1})`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      delete root.dataset.cursor;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[120]">
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-bone opacity-0 transition-[opacity,width,height] duration-300 data-[state=hidden]:opacity-0 data-[state=view]:h-0 data-[state=view]:w-0 data-[state=drag]:h-0 data-[state=drag]:w-0"
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-bone/60 opacity-0 transition-[width,height,background-color,border-color,opacity] duration-400 ease-out-expo data-[state=link]:h-5 data-[state=link]:w-5 data-[state=link]:border-glaze data-[state=view]:h-22 data-[state=view]:w-22 data-[state=view]:border-transparent data-[state=view]:bg-glaze data-[state=view]:text-bone data-[state=drag]:h-22 data-[state=drag]:w-22 data-[state=drag]:border-transparent data-[state=drag]:bg-bone data-[state=drag]:text-ink data-[state=hidden]:opacity-0"
      >
        <span
          ref={labelRef}
          className="font-mono text-[10px] font-medium uppercase tracking-[0.2em]"
        />
      </div>
    </div>
  );
}
