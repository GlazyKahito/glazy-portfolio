"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Kicker, Rise } from "@/components/scenes/ChapterScenes";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { TransitionLink } from "@/components/ui/PageTransition";
import { RevealWords } from "@/components/ui/Reveal";
import { conceptProjects } from "@/data/projects";
import { ease } from "@/lib/motion";
import { hsl, prettyUrl } from "@/lib/utils";

/**
 * The work · Concepts. Sites GLAZY designed and built for made-up brands, to
 * show what a client could have: each one live, open source and labelled as
 * a concept (never passed off as client work).
 */
export function ConceptsScene({ play }: { play: boolean }) {
  return (
    <div className="container-x relative flex min-h-full items-center pb-28 pt-[calc(var(--nav-height)+1rem)] md:pr-[max(var(--gutter),4.5rem)]">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Kicker number="02" label="The work · Concepts" play={play} />
            <RevealWords
              as="h2"
              play={play}
              delay={0.1}
              text="Concepts, built for real."
              accent={["real."]}
              className="mt-5 font-display text-[clamp(2.6rem,min(5.6vw,10vh),5.8rem)] leading-[0.92] tracking-[-0.03em] text-bone"
            />
          </div>
          <Rise play={play} delay={0.4} as="p" className="max-w-[44ch] text-[15px] leading-relaxed text-bone/80 lg:col-span-5 lg:justify-self-end">
            Made-up brands, real code: the kind of site we build for clients, each one live and open source. Every one is
            a concept, not a client.
          </Rise>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {conceptProjects.map((p, i) => (
            <motion.li
              key={p.slug}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md"
              initial={false}
              animate={play ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 8 }}
              transition={{ duration: 1.1, ease: ease.outExpo, delay: play ? 0.35 + i * 0.12 : 0 }}
              style={{ transformPerspective: 1200 }}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  fill
                  sizes="(min-width: 768px) 30vw, 92vw"
                  quality={80}
                  className="object-cover object-top transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.05]"
                />
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.55),transparent_45%)]" />
                <span
                  className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cream backdrop-blur-md"
                  style={{ boxShadow: `inset 0 0 0 1px ${hsl(p.hue, 80, 60, 0.35)}` }}
                >
                  Concept
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-3xl leading-none text-bone">{p.title}</h3>
                <p className="mt-2 font-display text-lg italic leading-snug text-bone/80">{p.tagline}</p>
                <p className="mt-3 truncate text-[12px] text-bone-2">{p.technologies.slice(0, 4).join(" · ")}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                  {p.live && (
                    <a
                      href={p.live}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-bone px-4 text-[13px] font-medium text-ink transition-transform duration-300 hover:scale-[1.03]"
                    >
                      {prettyUrl(p.live)} <ArrowUpRight />
                    </a>
                  )}
                  <TransitionLink
                    href={`/projects/${p.slug}`}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-4 text-[13px] text-bone transition-colors hover:bg-white/[0.12]"
                  >
                    Case study
                  </TransitionLink>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
