"use client";

import { useEffect } from "react";

export interface PointerState {
  /** Normalised -1..1 from the viewport centre. */
  nx: number;
  ny: number;
  /** Pixels. */
  x: number;
  y: number;
  /** Whether the pointer has moved at least once. */
  active: boolean;
}

const state: PointerState = { nx: 0, ny: 0, x: 0, y: 0, active: false };
let bound = 0;

function onMove(e: PointerEvent) {
  state.x = e.clientX;
  state.y = e.clientY;
  state.nx = (e.clientX / window.innerWidth) * 2 - 1;
  state.ny = (e.clientY / window.innerHeight) * 2 - 1;
  state.active = true;
}

/**
 * Shared, allocation-free pointer state for canvases and parallax layers.
 * Returns a stable mutable object; read it inside rAF loops, never in render.
 */
export function usePointer(): PointerState {
  useEffect(() => {
    if (bound++ === 0) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (--bound === 0) window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return state;
}
