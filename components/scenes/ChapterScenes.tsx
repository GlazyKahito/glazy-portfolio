"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { RevealWords } from "@/components/ui/Reveal";
import { ResumeViewer } from "@/components/ui/ResumeViewer";
import { CompactStack, OrbitSystem, SkillDetail } from "@/components/scenes/Stack";
import { inProgress } from "@/data/in-progress";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { gotoChapter } from "@/lib/deck";
import { useMediaQuery } from "@/lib/hooks/use-device";
import { ease } from "@/lib/motion";
import type { Skill } from "@/lib/types";
import { cn, hsl } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared pieces                                                        */
/* ------------------------------------------------------------------ */

/** Fade-and-rise that plays when the scene has arrived. */
export function Rise({ play, delay = 0, className, children, as = "div" }: { play: boolean; delay?: number; className?: string; children: ReactNode; as?: "div" | "p" | "ul" | "li" }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={false}
      animate={play ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 22, filter: "blur(6px)" }}
      transition={{ duration: 1, ease: ease.outExpo, delay: play ? delay : 0 }}
    >
      {children}
    </Tag>
  );
}

/** The chapter line above every heading: "02 — On the bench". */
export function Kicker({ number, label, play }: { number: string; label: string; play: boolean }) {
  return (
    <Rise play={play} as="p" className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-bone-2">
      <span className="text-bone">{number}</span>
      <span className="h-px w-8 bg-bone/40" />
      {label}
    </Rise>
  );
}

/** Apple-style frosted panel. */
export const panel = "rounded-3xl border border-white/10 bg-black/35 backdrop-blur-md";

function LocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {time || "--:--"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 00 Opening                                                           */
/* ------------------------------------------------------------------ */

export function IntroScene({ play }: { play: boolean }) {
  return (
    <div className="container-x relative flex min-h-full flex-col justify-end pb-28 pt-[calc(var(--nav-height)+1.5rem)]">
      <div className="mx-auto w-full max-w-[1400px]">
        <Rise play={play} as="p" className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone-2">
          <span className="text-bone">{profile.name}</span> <span className="mx-2 text-bone/40">—</span> Portfolio 2026
        </Rise>
        <h1 className="mt-6 max-w-[15ch] font-display text-[clamp(3.2rem,min(9.5vw,16vh),11.5rem)] leading-[0.84] tracking-[-0.035em] text-bone [text-shadow:0_4px_60px_rgb(0_0_0/0.35)]">
          <RevealWords as="span" play={play} delay={0.15} text="I build products" className="block" />
          <RevealWords as="span" play={play} delay={0.45} text="that show" className="block" />
          <RevealWords as="span" play={play} delay={0.7} text="their working." accent={["their", "working."]} highlight={["working"]} className="block" />
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <Rise play={play} delay={1.1} className="md:col-span-6">
            <p className="max-w-[36rem] text-base leading-relaxed text-bone/85 md:text-lg">
              Full-stack developer in Mumbai building AI tools that cite their sources, security analysts that explain their
              verdicts, and simulations that compute every packet.
            </p>
          </Rise>
          <Rise play={play} delay={1.25} className="flex flex-wrap gap-3 md:col-span-6 md:justify-end">
            <button
              type="button"
              onClick={() => gotoChapter("work")}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03]"
            >
              See the work
            </button>
            <ResumeViewer>
              <button
                type="button"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-6 text-sm text-bone backdrop-blur-xl transition-colors hover:bg-white/[0.12]"
              >
                Resume
              </button>
            </ResumeViewer>
          </Rise>
        </div>
        <Rise play={play} delay={1.4} className="mt-8 hidden items-center sm:flex justify-between border-t border-white/15 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2 sm:text-[11px]">
          <span>{profile.roles.join(" · ")}</span>
          <span>
            Mumbai <LocalTime />
          </span>
        </Rise>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 02 On the bench                                                      */
/* ------------------------------------------------------------------ */

const STATUS: Record<string, string> = { building: "Building", exploring: "Exploring", planning: "Planning", shipping: "Shipping" };

export function BuildingScene({ play }: { play: boolean }) {
  return (
    <div className="container-x relative flex min-h-full items-center pb-28 pt-[calc(var(--nav-height)+1.5rem)]">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Kicker number="02" label="On the bench" play={play} />
          <RevealWords as="h2" play={play} delay={0.1} text="Currently building." accent={["building."]} className="mt-5 font-display text-[clamp(2.8rem,min(6.4vw,11vh),6.5rem)] leading-[0.9] tracking-[-0.03em] text-bone" />
          <Rise play={play} delay={0.5} as="p" className="mt-6 max-w-[40ch] text-base leading-relaxed text-bone/80">
            Work that is still moving. Unfinished by design; each one moves to the work when it ships.
          </Rise>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-7">
          {inProgress.map((item, i) => (
            <Rise key={item.id} play={play} delay={0.45 + i * 0.12} className={cn(panel, "p-6 md:p-8")}>
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-bone-2">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-glaze [animation:pulse-dot_2.4s_ease-out_infinite]" />
                  {STATUS[item.status]}
                </span>
                {item.startedAt && <span>Since {item.startedAt}</span>}
              </div>
              <h3 className="mt-4 font-display text-4xl leading-none text-bone md:text-5xl">{item.title}</h3>
              <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-bone/80">{item.description}</p>
              <div className="mt-6">
                <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">
                  <span>Progress</span>
                  <span className="tabular-nums text-bone">{item.progress}%</span>
                </div>
                <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full origin-left rounded-full"
                    style={{ background: `linear-gradient(90deg, ${hsl(item.hue, 80, 55)}, ${hsl(item.hue + 40, 90, 70)})` }}
                    initial={false}
                    animate={{ scaleX: play ? item.progress / 100 : 0 }}
                    transition={{ duration: 1.8, ease: ease.outExpo, delay: play ? 0.8 : 0 }}
                  />
                </div>
              </div>
              {item.focus && (
                <ul className="mt-6 grid gap-2 sm:grid-cols-3" aria-label="Current focus">
                  {item.focus.map((f) => (
                    <li key={f} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[13px] leading-snug text-bone/85">
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] text-bone-2">{item.technologies.join(" · ")}</p>
                {item.github && (
                  <a href={item.github} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-sm text-bone hover:underline">
                    Follow the build <ArrowUpRight />
                  </a>
                )}
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 03 The person                                                        */
/* ------------------------------------------------------------------ */

export function AboutScene({ play }: { play: boolean }) {
  const [lead, ...rest] = profile.about;
  return (
    <div className="container-x relative flex min-h-full items-center pb-28 pt-[calc(var(--nav-height)+1.5rem)]">
      <div className="mx-auto w-full max-w-[1400px]">
        <Kicker number="03" label="The person" play={play} />
        <RevealWords as="h2" play={play} delay={0.1} text="Who is behind GLAZY." accent={["behind"]} className="mt-5 font-display text-[clamp(2.8rem,min(6.4vw,11vh),6.5rem)] leading-[0.9] tracking-[-0.03em] text-bone" />
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <Rise play={play} delay={0.45} className="lg:col-span-7">
            <p className="font-display text-[clamp(1.5rem,2.4vw,2.2rem)] leading-[1.25] text-bone">{lead}</p>
          </Rise>
          <div className="flex flex-col gap-5 lg:col-span-5">
            {rest.map((p, i) => (
              <Rise key={i} play={play} delay={0.6 + i * 0.1} as="p" className="text-[15px] leading-relaxed text-bone/80">
                {p}
              </Rise>
            ))}
          </div>
        </div>
        <Rise play={play} delay={0.85} className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ["Based in", profile.location],
            ["Studying", "B.Tech IT / CS, 2025–2029"],
            ["Open to", "Paid remote internships & web projects"],
          ].map(([k, v]) => (
            <div key={k} className={cn(panel, "px-5 py-4")}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">{k}</p>
              <p className="mt-1.5 text-base text-bone">{v}</p>
            </div>
          ))}
        </Rise>
      </div>
    </div>
  );
}

export function ExperienceScene({ play }: { play: boolean }) {
  return (
    <div className="container-x relative flex min-h-full items-center pb-28 pt-[calc(var(--nav-height)+1.5rem)]">
      <div className="mx-auto grid w-full max-w-[1400px] gap-5 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <Kicker number="03" label="Experience and education" play={play} />
        </div>
        {profile.experience.map((exp) => (
          <Rise key={exp.role} play={play} delay={0.15} className={cn(panel, "p-6 md:p-9 lg:col-span-7")}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">Experience</p>
            <h3 className="mt-4 font-display text-4xl leading-none text-bone md:text-5xl">{exp.role}</h3>
            <p className="mt-3 text-bone/80">
              {exp.company} <span className="mx-2 text-bone/30">·</span> {exp.period}
            </p>
            <ul className="mt-6 flex flex-col gap-4">
              {exp.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-bone/85">
                  <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-glaze" />
                  {b}
                </li>
              ))}
            </ul>
            {exp.links && (
              <div className="mt-6 flex flex-wrap gap-2">
                {exp.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-[13px] text-bone transition-colors hover:bg-white/[0.12]"
                  >
                    {l.label} <ArrowUpRight />
                  </a>
                ))}
              </div>
            )}
          </Rise>
        ))}
        {profile.education.map((ed) => (
          <Rise key={ed.institution} play={play} delay={0.3} className={cn(panel, "flex flex-col p-6 md:p-9 lg:col-span-5")}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">Education</p>
            <h3 className="mt-4 font-display text-4xl leading-[1.02] text-bone">{ed.institution}</h3>
            <p className="mt-3 text-bone/80">{ed.degree}</p>
            <p className="mt-auto pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-2">
              {ed.period} · {ed.location}
            </p>
          </Rise>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 04 The ecosystem                                                     */
/* ------------------------------------------------------------------ */

export function StackScene({ play }: { play: boolean }) {
  const [selected, setSelected] = useState<Skill | null>(null);
  const wide = useMediaQuery("(min-width: 1024px)", true);
  return (
    <div className="container-x relative flex min-h-full items-center pb-28 pt-[calc(var(--nav-height)+1rem)]">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Kicker number="04" label="The ecosystem" play={play} />
          <RevealWords as="h2" play={play} delay={0.1} text="What I build with." accent={["with."]} className="mt-5 font-display text-[clamp(2.6rem,min(5.4vw,10vh),5.6rem)] leading-[0.92] tracking-[-0.03em] text-bone" />
          <Rise play={play} delay={0.45} as="p" className="mt-5 max-w-[36ch] text-[15px] leading-relaxed text-bone/80">
            {skills.length} technologies, every one taken from a shipped project or the resume. Hover or tap one to see where it is used.
          </Rise>
          <Rise play={play} delay={0.55} className="mt-6">
            <SkillDetail skill={selected} />
          </Rise>
        </div>
        <Rise play={play} delay={0.3} className="lg:col-span-8">
          {wide ? <OrbitSystem selected={selected} onSelect={setSelected} /> : <CompactStack selected={selected} onSelect={setSelected} />}
        </Rise>
      </div>
    </div>
  );
}
