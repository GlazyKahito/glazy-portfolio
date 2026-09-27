import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  className?: string;
  /** Seconds per loop. */
  duration?: number;
  reverse?: boolean;
}

/** Full-bleed scrolling strip. Pure CSS; pauses on hover and stops under reduced motion. */
export function Marquee({ items, className, duration = 40, reverse = false }: MarqueeProps) {
  const row = (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex shrink-0 items-center gap-8 pr-8">
          <span className="font-display text-[clamp(1.5rem,3.2vw,3rem)] font-medium tracking-[-0.02em] text-bone-2">
            {item}
          </span>
          <span aria-hidden className="h-2 w-2 rotate-45 border border-glaze" />
        </span>
      ))}
    </>
  );

  return (
    <div
      className={cn("mask-fade-x flex w-full overflow-hidden border-y border-line py-5", className)}
      aria-label={items.join(", ")}
    >
      <div
        className="flex w-max shrink-0 [animation:marquee_var(--marquee-duration)_linear_infinite] hover:[animation-play-state:paused]"
        style={{ "--marquee-duration": `${duration}s`, animationDirection: reverse ? "reverse" : "normal" } as React.CSSProperties}
      >
        <div className="flex" aria-hidden={false}>
          {row}
        </div>
        <div className="flex" aria-hidden>
          {row}
        </div>
      </div>
    </div>
  );
}
