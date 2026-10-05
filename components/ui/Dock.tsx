"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { setDockSlot, useActiveNotice, useDockSlot, type DockSlot } from "@/lib/dock";

/**
 * One bar at the foot of the screen for everything that floats: a notice on
 * the left, the deck's Continue prompt in the centre, Mr. Nimbus on the
 * right. A three-column grid, so the three can never overlap at any width;
 * on narrow screens a notice takes the prompt's place until it is answered
 * (see `.dock` in globals.css). Safe-area insets keep it clear of the home
 * indicator. The bar itself lets clicks through; only its controls catch them.
 */
export function Dock() {
  const notice = useActiveNotice();
  return (
    <div data-dock data-notice={notice ?? undefined} className="dock pointer-events-none fixed inset-x-0 bottom-0 z-[92] px-[var(--gutter)] pb-[var(--dock-inset)]">
      <div className="grid h-[var(--dock-row)] grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div ref={noticeRef} className="dock-notice col-start-1 row-start-1 flex justify-start" />
        <div ref={centerRef} className="dock-center col-start-2 row-start-1 flex justify-center" />
        <div ref={guideRef} className="dock-guide col-start-3 row-start-1 flex justify-end" />
      </div>
    </div>
  );
}

// Stable ref callbacks: the slots must never detach on a re-render, or everything portalled into them would remount.
const noticeRef = (el: HTMLDivElement | null) => setDockSlot("notice", el);
const centerRef = (el: HTMLDivElement | null) => setDockSlot("center", el);
const guideRef = (el: HTMLDivElement | null) => setDockSlot("guide", el);

/** Render children into one of the dock's slots (nothing until the dock has mounted). */
export function DockPortal({ slot, children }: { slot: DockSlot; children: ReactNode }) {
  const el = useDockSlot(slot);
  return el ? createPortal(children, el) : null;
}
