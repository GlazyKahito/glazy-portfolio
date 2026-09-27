"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { BrowserFrame, PhoneFrame } from "@/components/projects/Frames";
import { ArrowIcon, ArrowUpRight, MagneticButton } from "@/components/ui/MagneticButton";
import { TransitionLink } from "@/components/ui/PageTransition";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { projectNumber } from "@/data/projects";
import type { ImageAsset, Project } from "@/lib/types";
import { ease, fadeUp, stagger, viewportOnce, wipeUp } from "@/lib/motion";
import { cn, hsl, prettyUrl } from "@/lib/utils";

interface ProjectDetailProps {
  project: Project;
  gallery: ImageAsset[];
  prev?: Project;
  next?: Project;
}

const STATUS_LABEL: Record<Project["status"], string> = {
  live: "Live",
  shipped: "Shipped",
  "in-progress": "In progress",
  archived: "Archived",
};

function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-title`}
      className="grid gap-5 border-t border-line py-10 md:grid-cols-[8rem_1fr] md:py-12"
      variants={stagger(0.06)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      <motion.h2 id={`${id}-title`} className="label-mono" variants={fadeUp}>
        {index} <span className="mx-1 text-bone-3">/</span> {title}
      </motion.h2>
      <div className="min-w-0">{children}</div>
    </motion.section>
  );
}

function Paragraphs({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {items.map((p, i) => (
        <motion.p key={i} variants={fadeUp} className="max-w-[62ch] text-base leading-relaxed text-bone-2 md:text-[1.0625rem]">
          {p}
        </motion.p>
      ))}
    </div>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, i) => (
        <motion.li
          key={i}
          variants={fadeUp}
          className="flex gap-5 border-t border-line/70 py-4 first:border-t-0 first:pt-0"
        >
          <span className="font-mono text-xs tabular-nums text-glaze">{String(i + 1).padStart(2, "0")}</span>
          <span className="max-w-[60ch] text-[0.95rem] leading-relaxed text-bone">{item}</span>
        </motion.li>
      ))}
    </ol>
  );
}

export function ProjectDetail({ project, gallery, prev, next }: ProjectDetailProps) {
  const number = projectNumber(project);
  const tint = hsl(project.hue, 70, 60, 0.28);

  return (
    <article className="relative overflow-x-clip">
      {/* Ambient tint so each project feels like its own room. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80vh]"
        style={{ background: `radial-gradient(60% 50% at 50% 0%, ${tint}, transparent 70%)` }}
      />

      <header className="container-x pt-[calc(var(--nav-height)+3rem)] md:pt-[calc(var(--nav-height)+5rem)]">
        <div className="mx-auto max-w-[1500px]">
          <Reveal immediate variant="fade">
            <TransitionLink
              href="/#projects"
              className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-2 transition-colors hover:text-bone"
            >
              <ArrowIcon className="rotate-180 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" />
              All projects
            </TransitionLink>
          </Reveal>

          <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <Reveal immediate delay={0.1} variant="fade">
                <span className="font-display text-display-md font-light leading-none tracking-[-0.04em] text-bone-3">
                  {number}
                </span>
              </Reveal>
              <RevealWords
                as="h1"
                immediate
                delay={0.2}
                text={project.title}
                className="mt-2 font-display text-display-lg font-semibold leading-[0.9] tracking-[-0.04em] text-bone"
              />
              <Reveal immediate delay={0.55} variant="fade">
                <p className="mt-6 max-w-2xl font-serif text-2xl italic leading-snug text-bone-2 md:text-3xl">
                  {project.tagline}
                </p>
              </Reveal>
            </div>
            <div className="md:col-span-4 md:justify-self-end">
              <Reveal immediate delay={0.6} variant="fade">
                <dl className="grid grid-cols-3 gap-6 md:grid-cols-1 md:gap-3 md:text-right">
                  <div>
                    <dt className="label-mono">Year</dt>
                    <dd className="mt-1 font-display text-lg font-medium">{project.year}</dd>
                  </div>
                  <div>
                    <dt className="label-mono">Status</dt>
                    <dd className="mt-1 flex items-center gap-2 font-display text-lg font-medium md:justify-end">
                      <span className={cn("h-1.5 w-1.5 rounded-full", project.status === "live" ? "bg-glaze [animation:pulse-dot_2.4s_ease-out_infinite]" : "bg-bone-3")} />
                      {STATUS_LABEL[project.status]}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-mono">Category</dt>
                    <dd className="mt-1 font-display text-lg font-medium">{project.category}</dd>
                  </div>
                </dl>
              </Reveal>
            </div>
          </div>

          <motion.figure
            className="relative mt-12 md:mt-16"
            variants={wipeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <div
              aria-hidden
              className="absolute inset-x-0 -bottom-10 top-16 -z-10 rounded-[100%] blur-3xl"
              style={{ background: hsl(project.hue, 70, 55, 0.3) }}
            />
            <BrowserFrame
              image={project.image}
              url={project.live ?? project.github}
              priority
              sizes="(min-width: 1500px) 1500px, 100vw"
              tint={`linear-gradient(160deg, ${hsl(project.hue, 70, 60, 0.3)}, transparent 55%)`}
            />
            {project.mobileImage && (
              <motion.div
                className="absolute -bottom-8 right-2 w-[22%] max-w-[240px] sm:-right-4 md:-right-8"
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: -6 }}
                transition={{ duration: 1, ease: ease.outExpo, delay: 1.1 }}
              >
                <PhoneFrame image={project.mobileImage} sizes="22vw" />
              </motion.div>
            )}
            <figcaption className="sr-only">{project.image.alt}</figcaption>
          </motion.figure>
        </div>
      </header>

      <div className="container-x mt-16 md:mt-24">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="flex flex-col gap-8 lg:sticky lg:top-28">
              <div className="flex flex-wrap gap-3">
                {project.live && (
                  <MagneticButton href={project.live} icon={<ArrowUpRight />} aria-label={`Open ${project.title} live site`}>
                    Live site
                  </MagneticButton>
                )}
                {project.github && (
                  <MagneticButton href={project.github} variant="ghost" icon={<ArrowUpRight />} aria-label={`Open ${project.title} on GitHub`}>
                    GitHub
                  </MagneticButton>
                )}
              </div>

              <div>
                <h2 className="label-mono">Stack</h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {project.technologies.map((t) => (
                    <li key={t} className="rounded-full border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {project.context && (
                <div>
                  <h2 className="label-mono">Context</h2>
                  <p className="mt-3 text-sm leading-relaxed text-bone-2">{project.context}</p>
                </div>
              )}

              <div>
                <h2 className="label-mono">Links</h2>
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {project.live && (
                    <li>
                      <a href={project.live} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 text-bone-2 transition-colors hover:text-bone">
                        {prettyUrl(project.live)} <ArrowUpRight />
                      </a>
                    </li>
                  )}
                  {project.github && (
                    <li>
                      <a href={project.github} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 break-all text-bone-2 transition-colors hover:text-bone">
                        {prettyUrl(project.github)} <ArrowUpRight />
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-8">
            <Section id="overview" index="01" title="Overview">
              <Paragraphs items={project.longDescription} />
            </Section>

            {project.problem && (
              <Section id="problem" index="02" title="Problem">
                <Paragraphs items={project.problem} />
              </Section>
            )}

            {project.solution && (
              <Section id="solution" index="03" title="Solution">
                <NumberedList items={project.solution} />
              </Section>
            )}

            {project.features && (
              <Section id="features" index="04" title="Features">
                <NumberedList items={project.features} />
              </Section>
            )}

            {project.architecture && (
              <Section id="architecture" index="05" title="Architecture">
                <ul className="flex flex-col gap-2">
                  {project.architecture.map((line, i) => (
                    <motion.li
                      key={i}
                      variants={fadeUp}
                      className="rounded-lg border border-line bg-ink-2/60 px-4 py-3 font-mono text-[12px] leading-relaxed text-bone-2"
                    >
                      <span className="mr-3 text-glaze">{String(i + 1).padStart(2, "0")}</span>
                      {line}
                    </motion.li>
                  ))}
                </ul>
              </Section>
            )}

            {gallery.length > 0 && (
              <Section id="screens" index="06" title="Screens">
                <div className="grid gap-4 sm:grid-cols-2">
                  {gallery.map((img) => (
                    <motion.figure
                      key={img.src}
                      variants={wipeUp}
                      className="overflow-hidden rounded-xl border border-line bg-ink-2"
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        quality={80}
                        className="h-auto w-full"
                      />
                      <figcaption className="border-t border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-3">
                        {img.alt}
                      </figcaption>
                    </motion.figure>
                  ))}
                </div>
              </Section>
            )}

            {project.results && (
              <Section id="results" index="07" title="Documented outcomes">
                <NumberedList items={project.results} />
              </Section>
            )}
          </div>
        </div>
      </div>

      {/* Prev / next */}
      <nav className="container-x mt-24 border-t border-line md:mt-32" aria-label="More projects">
        <div className="mx-auto grid max-w-[1500px] md:grid-cols-2">
          {prev && (
            <TransitionLink
              href={`/projects/${prev.slug}`}
              className="group flex flex-col gap-3 border-b border-line py-10 md:border-b-0 md:border-r md:py-16 md:pr-10"
              data-cursor="view"
            >
              <span className="label-mono flex items-center gap-2">
                <ArrowIcon className="rotate-180 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" /> Previous
              </span>
              <span className="font-display text-display-sm font-semibold leading-none tracking-[-0.03em] text-bone-2 transition-colors group-hover:text-bone">
                {prev.title}
              </span>
            </TransitionLink>
          )}
          {next && (
            <TransitionLink
              href={`/projects/${next.slug}`}
              className="group flex flex-col gap-3 py-10 md:items-end md:py-16 md:pl-10 md:text-right"
              data-cursor="view"
            >
              <span className="label-mono flex items-center gap-2">
                Next <ArrowIcon className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
              </span>
              <span className="font-display text-display-sm font-semibold leading-none tracking-[-0.03em] text-bone-2 transition-colors group-hover:text-bone">
                {next.title}
              </span>
            </TransitionLink>
          )}
        </div>
      </nav>
    </article>
  );
}

/** Small motion helper for the page-level entrance. */
export const detailEntrance = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: ease.outQuart } },
};
