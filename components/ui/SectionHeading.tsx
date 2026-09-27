"use client";

import { motion } from "motion/react";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { ease, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  index: string;
  label: string;
  title: string;
  accent?: string[];
  description?: string;
  className?: string;
  align?: "left" | "center";
  size?: "md" | "lg";
}

/** Numbered section header: "01 / Projects" rule, then a large display title. */
export function SectionHeading({
  index,
  label,
  title,
  accent,
  description,
  className,
  align = "left",
  size = "lg",
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-6", align === "center" && "items-center text-center", className)}>
      <div className={cn("flex w-full items-center gap-4", align === "center" && "justify-center")}>
        <span className="label-mono">
          {index} <span className="mx-1 text-bone-3/60">/</span> {label}
        </span>
        <motion.span
          aria-hidden
          className="h-px flex-1 origin-left bg-line"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 1.4, ease: ease.outExpo }}
        />
      </div>
      <RevealWords
        as="h2"
        text={title}
        accent={accent}
        className={cn(
          "font-display font-semibold leading-[0.95] tracking-[-0.03em] text-bone",
          size === "lg" ? "text-display-md" : "text-display-sm",
          align === "center" && "justify-center",
        )}
      />
      {description && (
        <Reveal variant="fade" delay={0.2} className="max-w-xl">
          <p className="text-base leading-relaxed text-bone-2 md:text-lg">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
