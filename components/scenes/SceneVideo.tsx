"use client";

import { useEffect, useRef, useState } from "react";
import { footage, type FootageName } from "@/data/scenes";
import { useLite } from "@/lib/capability";
import { useDevice } from "@/lib/hooks/use-device";

interface SceneVideoProps {
  name: FootageName;
  /**
   * What to load: `true` the poster and the 4K clip, `"poster"` the poster
   * only (the clip comes later), `false` nothing.
   */
  load: boolean | "poster";
  /** Play it (the scene is on screen). */
  play: boolean;
  /** Show the poster before the footage is wanted (a page header, rather than a deck chapter). */
  poster?: boolean;
  /** Someone is waiting for this one: fetch its poster at normal priority, not low. */
  urgent?: boolean;
  /** Called once the footage can play through (or the poster is shown instead). */
  onReady?: () => void;
  /** Called with 0..1 while buffering. */
  onProgress?: (p: number) => void;
}

/**
 * Always the 4K master: no silent downgrades. Visitors on weak hardware are
 * warned on the loading screen and can choose the lite version themselves.
 */
function pickResolution(): "2160" {
  return "2160";
}

/** The 4K clip's address. */
export const clipUrl = (name: FootageName) => `/video/${name}-${pickResolution()}.mp4`;

const fetched = new Map<string, Promise<void>>();

/**
 * Download a clip into the HTTP cache without creating a player (no decoder,
 * no GPU work). The deck fetches the next chapter's clip this way first, so
 * that when it later creates the player, the first frame decodes at once,
 * at a moment it chooses, instead of whenever the network delivers it.
 * Resolves when the file is cached (or on any error: the player will fetch it itself).
 */
export function prefetchClip(name: FootageName): Promise<void> {
  const url = clipUrl(name);
  let p = fetched.get(url);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(url, { priority: "low" } as RequestInit);
        const reader = res.body?.getReader();
        if (!reader) return;
        // Read to the end and drop the bytes: the cache keeps the file, the page keeps nothing.
        for (;;) if ((await reader.read()).done) break;
      } catch {
        /* the player fetches it itself */
      }
    })();
    fetched.set(url, p);
  }
  return p;
}

/**
 * Full-bleed looping footage for a scene. The poster (a real frame of the
 * clip) is always there first, so nothing is ever blank; the 4K video fades
 * in over it once it plays. Only the visitor's own choices (lite mode, or
 * their system's reduce-motion setting) keep the still.
 *
 * Nothing is fetched until it is wanted: a chapter that is not near renders
 * no poster and no video (so the server never asks the browser to preload them).
 * Mounting the video creates its decoder and decodes the first frame (a
 * moment of GPU work), so the deck mounts it only while the screen is settled.
 */
export function SceneVideo({ name, load, play, poster = false, urgent = false, onReady, onProgress }: SceneVideoProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [res, setRes] = useState<"2160" | null>(null);
  const [playing, setPlaying] = useState(false);
  const lite = useLite();
  const { reducedMotion, pending } = useDevice();
  const stills = lite || reducedMotion;
  const readyFired = useRef(false);
  const f = footage[name];
  const clip = load === true && !stills;

  const ready = () => {
    if (readyFired.current) return;
    readyFired.current = true;
    onReady?.();
  };

  // Decide the resolution once, on the client, when the footage is first needed.
  useEffect(() => {
    if (!clip || pending || res) return;
    const id = requestAnimationFrame(() => setRes(pickResolution()));
    return () => cancelAnimationFrame(id);
  }, [clip, pending, res]);

  // Stills only: the poster is the scene; report ready once it has loaded.
  useEffect(() => {
    if (!load || pending || !stills) return;
    const img = new Image();
    img.onload = () => ready();
    img.onerror = () => ready();
    img.src = `/video/${name}-poster.jpg`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, pending, stills, name]);

  const mounted = clip && !!res;
  // A clip taken out (the deck keeps only the chapters near the visitor) fades in again when it returns.
  if (!mounted && playing) setPlaying(false);

  // Play only while wanted. A clip mounted while its scene is already on screen starts at once.
  useEffect(() => {
    const v = video.current;
    if (!v || !mounted) return;
    if (play) v.play().catch(() => {});
    else v.pause();
  }, [play, mounted]);

  // Buffering progress for the scene loader.
  useEffect(() => {
    const v = video.current;
    if (!v || !mounted) return;
    const onProg = () => {
      if (!v.duration || !v.buffered.length) return;
      onProgress?.(Math.min(1, v.buffered.end(v.buffered.length - 1) / Math.min(v.duration, 4)));
    };
    v.addEventListener("progress", onProg);
    return () => v.removeEventListener("progress", onProg);
  }, [mounted, onProgress]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {(load || poster) && (
        // eslint-disable-next-line @next/next/no-img-element -- a full-bleed poster that must paint instantly, not an optimised thumbnail
        <img
          src={`/video/${name}-poster.jpg`}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
          fetchPriority={urgent || poster ? "auto" : "low"}
        />
      )}
      {mounted && (
        <video
          ref={video}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: playing ? 1 : 0 }}
          src={clipUrl(name)}
          poster={`/video/${name}-poster.jpg`}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          title={f.description}
          onCanPlayThrough={ready}
          onLoadedData={() => {
            // Some browsers never fire canplaythrough for large files; enough data to start is enough.
            window.setTimeout(ready, 1200);
          }}
          onPlaying={() => setPlaying(true)}
          onError={ready}
        />
      )}
    </div>
  );
}
