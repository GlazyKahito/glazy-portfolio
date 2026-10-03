"use client";

import { useEffect, useRef } from "react";
import { useDevice } from "@/lib/hooks/use-device";

/**
 * A viewfinder accent for the native pointer (which always stays visible).
 * Over a link, button or card, four focus brackets snap out to frame it, the
 * way a lens locks focus, and fade away when the pointer leaves. Elements can
 * set `data-cursor-label="Open"`. Disabled on touch and for reduced motion.
 */
export function Cursor() {
  const { touch, reducedMotion, pending } = useDevice();
  const enabled = !pending && !touch && !reducedMotion;
  const root = useRef<HTMLDivElement>(null);
  const corners = useRef<(HTMLSpanElement | null)[]>([]);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;

    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let visible = false;
    let pressed = false;
    let target: HTMLElement | null = null;
    let text = "";
    let hidden = false;
    // Current bracket box (left, top, right, bottom), eased toward the goal.
    const box = { l: px - 14, t: py - 14, r: px + 14, b: py + 14 };
    let raf = 0;

    const selector = "[data-cursor], a, button, [role='button'], summary, label, input, textarea, select, iframe";
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      visible = true;
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(selector) ?? null;
      hidden = !!el && ["INPUT", "TEXTAREA", "SELECT", "IFRAME"].includes(el.tagName);
      target = hidden ? null : el;
      text = el?.dataset.cursorLabel ?? "";
    };
    const onLeave = () => {
      visible = false;
      if (root.current) root.current.style.opacity = "0";
    };
    const onDown = () => (pressed = true);
    const onUp = () => (pressed = false);

    const tick = () => {
      let goal: { l: number; t: number; r: number; b: number };
      const lbl = text;
      if (target && target.isConnected) {
        const r = target.getBoundingClientRect();
        const pad = 6;
        goal = { l: r.left - pad, t: r.top - pad, r: r.right + pad, b: r.bottom + pad };
      } else {
        const s = pressed ? 9 : 13;
        goal = { l: px - s, t: py - s, r: px + s, b: py + s };
      }
      if (pressed && target) {
        goal = { l: goal.l + 3, t: goal.t + 3, r: goal.r - 3, b: goal.b - 3 };
      }
      const k = target ? 0.28 : 0.35;
      box.l += (goal.l - box.l) * k;
      box.t += (goal.t - box.t) * k;
      box.r += (goal.r - box.r) * k;
      box.b += (goal.b - box.b) * k;

      const [tl, tr, bl, br] = corners.current;
      if (tl) tl.style.transform = `translate3d(${box.l}px, ${box.t}px, 0)`;
      if (tr) tr.style.transform = `translate3d(${box.r - 10}px, ${box.t}px, 0)`;
      if (bl) bl.style.transform = `translate3d(${box.l}px, ${box.b - 10}px, 0)`;
      if (br) br.style.transform = `translate3d(${box.r - 10}px, ${box.b - 10}px, 0)`;
      if (label.current) {
        if (label.current.textContent !== lbl) label.current.textContent = lbl;
        label.current.style.transform = `translate3d(${box.l}px, ${box.b + 8}px, 0)`;
        label.current.style.opacity = lbl ? "1" : "0";
      }
      // Only show the brackets while they frame something.
      const framing = visible && !hidden && !!target && target.isConnected;
      if (root.current) root.current.style.opacity = framing ? "1" : "0";
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    html.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      html.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const bracket = "absolute left-0 top-0 h-[10px] w-[10px] border-bone mix-blend-difference";
  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[120] opacity-0 transition-opacity duration-300">
      <span ref={(el) => { corners.current[0] = el; }} className={`${bracket} border-l-[1.5px] border-t-[1.5px]`} />
      <span ref={(el) => { corners.current[1] = el; }} className={`${bracket} border-r-[1.5px] border-t-[1.5px]`} />
      <span ref={(el) => { corners.current[2] = el; }} className={`${bracket} border-b-[1.5px] border-l-[1.5px]`} />
      <span ref={(el) => { corners.current[3] = el; }} className={`${bracket} border-b-[1.5px] border-r-[1.5px]`} />
      <span
        ref={label}
        className="absolute left-0 top-0 font-mono text-[10px] uppercase tracking-[0.2em] text-bone opacity-0 mix-blend-difference transition-opacity duration-200"
      />
    </div>
  );
}
