"use client";

import { useSyncExternalStore } from "react";
import { onIdle } from "@/lib/hooks/use-device";

/**
 * What the loading screen tells people about their device, and the
 * visitor's own choice of the lite version (still frames instead of 4K video).
 */

export interface GpuReport {
  /** Unmasked renderer string when the browser exposes it. */
  renderer: string;
  /** Graphics without hardware acceleration (SwiftShader, llvmpipe, Microsoft Basic Render…). */
  software: boolean;
  /** Reasons this device may not show the site as intended. Empty = all good. */
  concerns: string[];
  /** Worth stopping for: offer the lite version before starting. */
  serious: boolean;
}

let cachedReport: GpuReport | null = null;
let pendingReport: Promise<GpuReport> | null = null;

/** Probes the GPU in a worker, so the first WebGL context (a few hundred ms) never blocks the page. */
const PROBE = `self.onmessage=function(){var r={ok:false,renderer:""};try{var c=new OffscreenCanvas(1,1);var gl=c.getContext("webgl2")||c.getContext("webgl");if(gl){var e=gl.getExtension("WEBGL_debug_renderer_info");r={ok:true,renderer:String(e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER))||""};var l=gl.getExtension("WEBGL_lose_context");if(l)l.loseContext()}}catch(x){}self.postMessage(r)}`;

/**
 * The device check, off the main thread where the browser allows it (a worker
 * with an OffscreenCanvas), otherwise on the main thread once it is idle.
 * Resolves once; later calls share the answer.
 */
export function inspectGpuAsync(): Promise<GpuReport> {
  if (cachedReport) return Promise.resolve(cachedReport);
  if (pendingReport) return pendingReport;
  pendingReport = new Promise<GpuReport>((resolve) => {
    const onMainThread = () => onIdle(() => resolve(inspectGpu()), 1500);
    if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return onMainThread();
    let url = "";
    let worker: Worker | null = null;
    let timer = 0;
    const end = () => {
      window.clearTimeout(timer);
      worker?.terminate();
      if (url) URL.revokeObjectURL(url);
    };
    try {
      url = URL.createObjectURL(new Blob([PROBE], { type: "text/javascript" }));
      worker = new Worker(url);
      timer = window.setTimeout(() => {
        end();
        onMainThread();
      }, 3000);
      worker.onmessage = (e: MessageEvent<{ ok: boolean; renderer: string }>) => {
        end();
        // No context in a worker is not proof of software rendering: ask the main thread instead.
        if (e.data?.ok) resolve((cachedReport ??= buildReport(true, e.data.renderer)));
        else onMainThread();
      };
      worker.onerror = () => {
        end();
        onMainThread();
      };
      worker.postMessage(0);
    } catch {
      end();
      onMainThread();
    }
  });
  return pendingReport;
}

/** The device check on the main thread (the first WebGL context is slow: prefer `inspectGpuAsync`). */
export function inspectGpu(): GpuReport {
  if (cachedReport) return cachedReport;
  let renderer = "";
  let webgl = false;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (gl) {
      webgl = true;
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) || "";
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webgl = false;
  }
  cachedReport = buildReport(webgl, renderer);
  return cachedReport;
}

function buildReport(webgl: boolean, renderer: string): GpuReport {
  const concerns: string[] = [];
  const software = !webgl || /swiftshader|llvmpipe|softpipe|microsoft basic render|software/i.test(renderer);
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
  const saveData = !!nav.connection?.saveData;
  const slow = ["slow-2g", "2g", "3g"].includes(nav.connection?.effectiveType ?? "");
  if (software) concerns.push("Your browser is drawing without hardware acceleration, so 4K video and transitions may stutter. Turning on hardware acceleration in your browser settings fixes this.");
  if (saveData) concerns.push("Data saver is on. Each scene streams around 10 MB of 4K footage.");
  if (slow) concerns.push("Your connection looks slow, so scenes may wait for their footage.");
  if ((nav.deviceMemory ?? 8) <= 4) concerns.push("This device reports 4 GB of memory or less.");
  if ((nav.hardwareConcurrency ?? 8) <= 4) concerns.push("This device has 4 CPU cores or fewer.");
  // A very weak machine (2 GB or less, 2 cores or fewer) is worth stopping for, like software rendering.
  const potato = (nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2;
  return { renderer, software, concerns, serious: software || saveData || slow || potato };
}

/* ------------------------------------------------------------------ */
/* Lite mode: the visitor can turn the 3D world off (and back on)       */
/* ------------------------------------------------------------------ */

const KEY = "glazy:lite";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setLite(on: boolean) {
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the choice lasts for this page view only */
  }
  liteOverride = on;
  // Lite also strips GPU-heavy styling site-wide (see html[data-lite] in globals.css).
  if (on) document.documentElement.dataset.lite = "true";
  else delete document.documentElement.dataset.lite;
  listeners.forEach((l) => l());
}

let liteOverride: boolean | null = null;

export function useLite(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => liteOverride ?? read(),
    () => false,
  );
}
