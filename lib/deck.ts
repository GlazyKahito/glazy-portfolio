"use client";

import { useSyncExternalStore } from "react";
import type { ChapterId } from "@/data/scenes";

/**
 * Shared state for the scene deck (the home page), read by the header menu,
 * the loading screen and anything else outside the deck.
 */
export interface DeckState {
  /** Chapter on screen. */
  chapter: ChapterId;
  /** Chapters the visitor has reached; the menu and progress rail only ever show these. */
  visited: ChapterId[];
  /** Footage loading, for the opening screen. */
  assets: { loaded: number; total: number; label: string };
  /** A transition is playing. */
  moving: boolean;
}

let state: DeckState = {
  chapter: "intro",
  visited: ["intro"],
  assets: { loaded: 0, total: 1, label: "" },
  moving: false,
};

const listeners = new Set<() => void>();

export function setDeck(patch: Partial<DeckState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function getDeck() {
  return state;
}

export function useDeck(): DeckState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

/** Ask the deck to travel to a chapter (from the menu, links, the progress rail). */
export const GOTO_EVENT = "glazy:goto";
export type GotoDetail = { chapter: ChapterId };

export function gotoChapter(chapter: ChapterId) {
  window.dispatchEvent(new CustomEvent<GotoDetail>(GOTO_EVENT, { detail: { chapter } }));
}
