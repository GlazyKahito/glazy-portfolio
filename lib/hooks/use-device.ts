"use client";

import { useSyncExternalStore } from "react";

export interface DeviceProfile {
  reducedMotion: boolean;
  touch: boolean;
  /** True on the server and during hydration. Treat as "unknown, be conservative". */
  pending: boolean;
}

const SERVER_PROFILE: DeviceProfile = {
  reducedMotion: false,
  touch: false,
  pending: true,
};

/** Two media queries: cheap enough to run during hydration (no WebGL probing here; see lib/capability.ts). */
function detect(): DeviceProfile {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  return { reducedMotion, touch, pending: false };
}

let cached: DeviceProfile | null = null;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => {
    cached = detect();
    listeners.forEach((l) => l());
  };
  mq.addEventListener("change", onChange);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", onChange);
  };
}

function getSnapshot() {
  if (!cached) cached = detect();
  return cached;
}

function getServerSnapshot() {
  return SERVER_PROFILE;
}

/** Device capability profile, stable across renders, safe for SSR. */
export function useDevice(): DeviceProfile {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useMediaQuery(query: string, initial = false) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => initial,
  );
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true after mount. */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Run once the browser is idle (or after `timeout` ms at the latest). Returns a cancel function. */
export function onIdle(cb: () => void, timeout = 1200): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, Math.min(timeout, 200));
  return () => window.clearTimeout(id);
}
