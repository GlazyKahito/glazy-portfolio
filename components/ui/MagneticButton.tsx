"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { TransitionLink } from "@/components/ui/PageTransition";
import { useDevice } from "@/lib/hooks/use-device";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "glaze";
  size?: "md" | "lg";
  className?: string;
  /** Pull strength, px of travel at the edge. */
  strength?: number;
  icon?: ReactNode;
  type?: "button" | "submit";
  "aria-label"?: string;
}

/**
 * A button that leans toward the pointer and swaps its label on hover.
 * Falls back to a plain button on touch devices and for reduced motion.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  strength = 18,
  icon,
  type = "button",
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { touch, reducedMotion } = useDevice();
  const enabled = !touch && !reducedMotion;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring.magnetic);
  const sy = useSpring(y, spring.magnetic);

  const onMove = (e: React.PointerEvent) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    x.set(dx * strength);
    y.set(dy * strength * 0.6);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const classes = cn(
    "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full font-mono uppercase tracking-[0.18em] transition-colors duration-500",
    size === "md" ? "h-12 px-6 text-[11px]" : "h-14 px-8 text-xs",
    variant === "primary" && "bg-bone text-ink hover:bg-glaze",
    variant === "ghost" && "border border-line-strong text-bone hover:border-bone",
    variant === "glaze" && "bg-glaze text-ink hover:bg-bone",
    className,
  );

  const inner = (
    <>
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute left-0 top-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0"
        >
          {children}
        </span>
      </span>
      {icon && (
        <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </>
  );

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="inline-block"
    >
      {href ? (
        <TransitionLink href={href} className={classes} {...rest}>
          {inner}
        </TransitionLink>
      ) : (
        <button type={type} onClick={onClick} className={classes} {...rest}>
          {inner}
        </button>
      )}
    </motion.div>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("h-3.5 w-3.5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("h-3.5 w-3.5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 12L12 4M6 4h6v6" />
    </svg>
  );
}
