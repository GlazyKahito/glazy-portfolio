"use client";

import { motion } from "motion/react";
import { CanvasGate } from "@/components/3d/CanvasGate";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Spotlight } from "@/components/ui/Spotlight";
import { inProgress } from "@/data/in-progress";
import type { InProgressItem } from "@/lib/types";
import { ease, fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { cn, hsl } from "@/lib/utils";

const STATUS: Record<InProgressItem["status"], string> = {
  building: "Building",
  exploring: "Exploring",
  planning: "Planning",
  shipping: "Shipping",
};

function ProgressFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="h-[70%] w-[70%] rounded-full border border-glaze/30"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 45 26 / 0.08) 1px, transparent 1px), linear-gradient(90deg, rgb(255 45 26 / 0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}

function ProgressCard({ item, index }: { item: InProgressItem; index: number }) {
  return (
    <motion.li variants={fadeUp} className="group relative rounded-2xl border border-dashed border-line-strong bg-ink-2/40">
      <Spotlight className="overflow-hidden rounded-2xl p-6 md:p-7" color={hsl(item.hue, 60, 68, 0.12)}>
      {/* Corner brackets: this is a work site, not a finished plate. */}
      {["top-3 left-3 border-t border-l", "top-3 right-3 border-t border-r", "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"].map((c) => (
        <span key={c} aria-hidden className={cn("absolute h-3 w-3 border-bone-3/70", c)} />
      ))}
      {/* Scan line */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-glaze/[0.07] to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 [animation:scan_3.5s_linear_infinite]"
      />

      <div className="flex items-center justify-between">
        <span className="label-mono flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              item.status === "shipping" ? "bg-glaze [animation:pulse-dot_2.4s_ease-out_infinite]" : "bg-bone-2 [animation:pulse-dot_3s_ease-out_infinite]",
            )}
          />
          {STATUS[item.status]}
        </span>
        <span className="font-mono text-xs tabular-nums text-bone-3">
          {String(index + 1).padStart(2, "0")}
          {item.startedAt && <span className="ml-3 hidden sm:inline">since {item.startedAt}</span>}
        </span>
      </div>

      <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-bone md:text-3xl">{item.title}</h3>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-bone-2">{item.description}</p>

      <div className="mt-6">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-bone-3">
          <span>Progress</span>
          <span className="tabular-nums text-bone">{item.progress}%</span>
        </div>
        <div className="mt-2 h-px w-full bg-line">
          <motion.div
            className="h-full origin-left"
            style={{ background: hsl(item.hue, 60, 68) }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: item.progress / 100 }}
            viewport={viewportOnce}
            transition={{ duration: 1.6, ease: ease.outExpo, delay: 0.3 }}
          />
        </div>
      </div>

      {item.focus && (
        <ul className="mt-6 grid gap-1.5 sm:grid-cols-2" aria-label="Current focus">
          {item.focus.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-bone-2">
              <span aria-hidden className="h-px w-3 bg-bone-3" />
              {f}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
          {item.technologies.map((t) => (
            <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-3">
              {t}
            </li>
          ))}
        </ul>
        <div className="flex gap-4 font-mono text-[11px] uppercase tracking-[0.18em]">
          {item.live && (
            <a href={item.live} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-bone-2 hover:text-bone">
              Live <ArrowUpRight />
            </a>
          )}
          {item.github && (
            <a href={item.github} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-bone-2 hover:text-bone">
              Code <ArrowUpRight />
            </a>
          )}
        </div>
      </div>
      </Spotlight>
    </motion.li>
  );
}

export function InProgress() {
  const average = inProgress.length
    ? inProgress.reduce((sum, i) => sum + i.progress, 0) / inProgress.length / 100
    : 0.5;

  return (
    <section id="in-progress" className="container-x relative scroll-mt-24 py-24 md:py-32" aria-labelledby="in-progress-title">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          index="02"
          label="In progress"
          title="Currently building."
          accent={["building."]}
          description="Things on the bench right now. Unfinished by design; each one moves to Projects when it ships."
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="relative lg:col-span-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-ink-2/40 lg:sticky lg:top-28">
              <CanvasGate scene="progress" value={average} fallback={<ProgressFallback />} className="absolute inset-0" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-3">
                <span>Structure — {Math.round(average * 100)}% complete</span>
                <span>{inProgress.length} active</span>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgb(245 245 247 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(245 245 247 / 0.04) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                  maskImage: "radial-gradient(60% 60% at 50% 50%, black, transparent)",
                }}
              />
            </div>
          </div>

          <motion.ul
            className="flex flex-col gap-5 lg:col-span-7"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {inProgress.map((item, i) => (
              <ProgressCard key={item.id} item={item} index={i} />
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
