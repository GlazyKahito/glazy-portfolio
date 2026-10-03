"use client";

import { Kicker, PillLink, Rise, panel } from "@/components/scenes/ChapterScenes";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { RevealWords } from "@/components/ui/Reveal";
import { ResumeViewer } from "@/components/ui/ResumeViewer";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { process, services } from "@/data/services";
import { gotoChapter } from "@/lib/deck";
import { cn } from "@/lib/utils";

const whatsapp = `https://wa.me/${profile.phone.replace(/\D/g, "")}`;
const mail = (subject: string, body: string) =>
  `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

const BRIEF = `Hi GLAZY,

What we need (a website, a web app, an AI feature, a redesign):

About the business:

Current site, if any:

Timeline:
`;

/** 06 · Start a project: how it runs, and the brief. */
export function StartScene({ play }: { play: boolean }) {
  return (
    <div className="container-x relative flex min-h-full items-center pb-28 pt-[calc(var(--nav-height)+1.5rem)]">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Kicker number="06" label="Start a project" play={play} />
          <RevealWords as="h2" play={play} delay={0.1} text="Tell us what you need." accent={["need."]} className="mt-5 font-display text-[clamp(2.8rem,min(6.4vw,11vh),6.5rem)] leading-[0.9] tracking-[-0.03em] text-bone" />
          <Rise play={play} delay={0.45} as="p" className="mt-6 max-w-[42ch] text-base leading-relaxed text-bone/85">
            Send a short brief and we reply with a plan and a quote. GLAZY works fully online, over email, WhatsApp and video calls, so it does not matter where you are.
          </Rise>
          <Rise play={play} delay={0.6} className="mt-8 flex flex-wrap items-center gap-3">
            <PillLink href={mail("New project for GLAZY", BRIEF)}>Email a brief</PillLink>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 text-sm text-bone backdrop-blur-md transition-colors hover:bg-white/[0.12]"
            >
              WhatsApp <ArrowUpRight />
            </a>
          </Rise>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-7">
          <Rise play={play} delay={0.4} className={cn(panel, "p-6")}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">How a project runs</p>
            <ol className="mt-4 grid gap-4 sm:grid-cols-4">
              {process.map((s, i) => (
                <li key={s} className="flex gap-3 text-[14px] leading-snug text-bone/85 sm:flex-col sm:gap-2">
                  <span className="font-mono text-xs text-glaze">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Rise>
          <Rise play={play} delay={0.55} className={cn(panel, "p-6")}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">What we take on</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {services.map((s) => (
                <li key={s.id} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[13px] text-bone/90">
                  {s.title}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] leading-relaxed text-bone-2">No fixed prices: every quote follows the brief. Not sure what you need? Ask Mr. Nimbus, bottom right.</p>
          </Rise>
        </div>
      </div>
    </div>
  );
}

/** 04 · For people who are hiring the founder. */
export function RecruiterScene({ play }: { play: boolean }) {
  const live = projects.filter((p) => p.status === "live").length;
  const internship = profile.experience.find((e) => /intern/i.test(e.role));
  const facts: [string, string][] = [
    ["Looking for", "Paid remote internships"],
    ["Studying", "B.Tech IT / CS, KJ Somaiya, 2025–2029"],
    ["Experience", internship ? `${internship.role}, ${internship.company} (completed)` : profile.roles[0]],
    ["Shipped", `${live} live projects, all open to inspect`],
  ];
  return (
    <div className="container-x relative flex min-h-full items-center pb-28 pt-[calc(var(--nav-height)+1.5rem)]">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Kicker number="04" label="For recruiters" play={play} />
          <RevealWords as="h2" play={play} delay={0.1} text="Hiring? Let's talk." accent={["talk."]} className="mt-5 font-display text-[clamp(2.8rem,min(6.4vw,11vh),6.5rem)] leading-[0.9] tracking-[-0.03em] text-bone" />
          <Rise play={play} delay={0.45} as="p" className="mt-6 max-w-[46ch] text-base leading-relaxed text-bone/85">
            Alongside the studio, {profile.name.split(" ")[0]} is open to paid remote internships, building full-stack products end to end: interfaces, APIs, data and the AI layer, with the security and testing that make them trustworthy. The work is live or open source, so you can check it, not just read about it.
          </Rise>
          <Rise play={play} delay={0.6} className="mt-8 flex flex-wrap gap-3">
            <ResumeViewer>
              <button type="button" className="inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03]">
                View resume
              </button>
            </ResumeViewer>
            <a
              href={mail("Internship opportunity", `Hi ${profile.name.split(" ")[0]},\n\nRole:\nCompany:\nStipend and duration:\n`)}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 text-sm text-bone backdrop-blur-md transition-colors hover:bg-white/[0.12]"
            >
              Email {profile.name.split(" ")[0]} <ArrowUpRight />
            </a>
            <button type="button" onClick={() => gotoChapter("work")} className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm text-bone/85 hover:text-bone">
              Review the work again
            </button>
          </Rise>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-6">
          {facts.map(([k, v], i) => (
            <Rise key={k} play={play} delay={0.4 + i * 0.08} className={cn(panel, "p-5")}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">{k}</p>
              <p className="mt-2 text-lg leading-snug text-bone">{v}</p>
            </Rise>
          ))}
          <Rise play={play} delay={0.75} className={cn(panel, "flex flex-wrap gap-2 p-5 sm:col-span-2")}>
            {profile.socials
              .filter((s) => s.href.startsWith("http"))
              .map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-bone hover:bg-white/[0.08]">
                  {s.label} <ArrowUpRight />
                </a>
              ))}
          </Rise>
        </div>
      </div>
    </div>
  );
}
