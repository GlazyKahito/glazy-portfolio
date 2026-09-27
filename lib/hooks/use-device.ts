"use client";

import { useSyncExternalStore } from "react";

export type DeviceTier = "high" | "mid" | "low";

export interface DeviceProfile {
  tier: DeviceTier;
  reducedMotion: boolean;
  touch: boolean;
  webgl: boolean;
  /** True on the server and during hydration. Treat as "unknown, be conservative". */
  pending: boolean;
}

const SERVER_PROFILE: DeviceProfile = {
  tier: "mid",
  reducedMotion: false,
  touch: false,
  webgl: false,
  pending: true,
};

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function detect(): DeviceProfile {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const webgl = detectWebGL();
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const saveData = nav.connection?.saveData ?? false;

  let tier: DeviceTier = "high";
  if (!webgl || saveData || cores <= 2 || memory <= 2) tier = "low";
  else if (cores <= 4 || memory <= 4 || (touch && window.innerWidth < 900)) tier = "mid";

  return { tier, reducedMotion, touch, webgl, pending: false };
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
