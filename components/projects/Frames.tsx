"use client";

import Image from "next/image";
import type { ImageAsset } from "@/lib/types";
import { cn, prettyUrl } from "@/lib/utils";

interface BrowserFrameProps {
  image: ImageAsset;
  url?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** Tint gradient laid over the screenshot so dark UIs don't merge with the page. */
  tint?: string;
}

/** A minimal browser chrome around a screenshot: three dots, an address pill, the page. */
export function BrowserFrame({ image, url, className, priority, sizes = "60vw", tint }: BrowserFrameProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-line-strong bg-ink-3 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)]", className)}>
      <div className="flex h-8 items-center gap-3 border-b border-line bg-ink-2 px-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-bone-3/60" />
          <span className="h-2 w-2 rounded-full bg-bone-3/40" />
          <span className="h-2 w-2 rounded-full bg-bone-3/25" />
        </span>
        <span className="mx-auto flex h-5 max-w-[60%] items-center truncate rounded-full border border-line bg-ink px-3 font-mono text-[9px] tracking-[0.12em] text-bone-3">
          {url ? prettyUrl(url) : "localhost"}
        </span>
      </div>
      <div className="relative aspect-[16/10] bg-ink-2">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          quality={82}
          priority={priority}
          className="object-cover object-top"
        />
        {tint && <div className="absolute inset-0 mix-blend-soft-light" style={{ background: tint }} />}
      </div>
    </div>
  );
}

interface PhoneFrameProps {
  image: ImageAsset;
  className?: string;
  sizes?: string;
}

/** A phone bezel around a mobile capture. */
export function PhoneFrame({ image, className, sizes = "20vw" }: PhoneFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[2rem] border-[6px] border-ink-3 bg-ink-3 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.85)] ring-1 ring-line-strong",
        className,
      )}
    >
      <div className="relative aspect-[390/844] overflow-hidden rounded-[1.6rem] bg-ink-2">
        <Image src={image.src} alt={image.alt} fill sizes={sizes} quality={78} className="object-cover object-top" />
        <div aria-hidden className="absolute left-1/2 top-2 h-1.5 w-14 -translate-x-1/2 rounded-full bg-ink-3/90" />
      </div>
    </div>
  );
}
