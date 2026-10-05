"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * The dock: one bar at the foot of the screen that everything floating
 * shares (components/ui/Dock.tsx). Three slots:
 *
 * - `notice`: one short notice at a time (the lite offer, Mr. Nimbus's
 *   invitation). Notices queue: the first to ask shows, the next waits.
 *   Wide screens keep it on the left; narrow ones let it take the Continue
 *   prompt's place until it is answered.
 * - `center`: the deck's Continue / Next project prompt.
 * - `guide`: Mr. Nimbus's launcher.
 *
 * Scenes keep `--dock-clear` free at their foot (app/globals.css), so the
 * dock never covers the end of a scene.
 */
export type DockSlot = "notice" | "center" | "guide";
export type NoticeId = "lag" | "nimbus";

const slots: Partial<Record<DockSlot, HTMLElement | null>> = {};
let queue: NoticeId[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

/** Called by the dock as its slots mount and unmount. */
export function setDockSlot(slot: DockSlot, el: HTMLElement | null) {
  if (slots[slot] === el) return;
  slots[slot] = el;
  emit();
}

/** The element to portal into, once the dock has mounted. */
export function useDockSlot(slot: DockSlot): HTMLElement | null {
  return useSyncExternalStore(
    subscribe,
    () => slots[slot] ?? null,
    () => null,
  );
}

function want(id: NoticeId, on: boolean) {
  const has = queue.includes(id);
  if (on === has) return;
  queue = on ? [...queue, id] : queue.filter((q) => q !== id);
  emit();
}

/** The notice on show, if any (the dock lays itself out around it). */
export function useActiveNotice(): NoticeId | null {
  return useSyncExternalStore(
    subscribe,
    () => queue[0] ?? null,
    () => null,
  );
}

/**
 * Ask for the notice slot. Returns true while it is this notice's turn:
 * never two notices at once, and the later one waits for the first to go.
 */
export function useNoticeTurn(id: NoticeId, wanted: boolean): boolean {
  useEffect(() => {
    want(id, wanted);
    return () => want(id, false);
  }, [id, wanted]);
  const head = useActiveNotice();
  return wanted && head === id;
}
