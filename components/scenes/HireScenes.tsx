"use client";

import { Kicker, Rise, panel } from "@/components/scenes/ChapterScenes";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { RevealWords } from "@/components/ui/Reveal";
import { ResumeViewer } from "@/components/ui/ResumeViewer";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { gotoChapter } from "@/lib/deck";
import { cn } from "@/lib/utils";

const whatsapp = `https://wa.me/${profile.phone.replace(/\D/g, "")}`;
const mail = (subject: string, body: string) =>
  `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

const SERVICES = [
  { title: "Websites for businesses", body: "A fast, mobile-first site with your services, prices, hours, map and an enquiry or booking form." },
  { title: "Web apps", body: "Dashboards, CRMs and tools with accounts and data, like CRM360, built on the MERN stack or Next.js." },
  { title: "AI features", body: "Gemini-powered features that work safely: structured output, validation and server-side keys, as in ScamShield." },
  { title: "Fixes and redesigns", body: "An existing site that is slow, broken on phones or out of date, rebuilt without losing what works." },
];

const STEPS = ["You send a short brief", "I reply with a plan and a mock-up", "I build, you review as it grows", "Launch on Vercel, handed over to you"];

/** 05 · For people who want something built. */
export function ClientScene({ play }: { play: boolean }) {
  return (
    <div className="container-x relative flex min-h-full items-center pb-28 pt-[calc(var(--nav-height)+1.5rem)]">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Kicker number="05" label="Work with me · Build" play={play} />
          <RevealWords as="h2" play={play} delay={0.1} text="Need a website?" accent={["website?"]} className="mt-5 font-display text-[clamp(2.8rem,min(6.4vw,11vh),6.5rem)] leading-[0.9] tracking-[-0.03em] text-bone" />
          <Rise play={play} delay={0.45} as="p" className="mt-6 max-w-[42ch] text-base leading-relaxed text-bone/85">
            I take on paid projects for businesses and individuals. I work fully online, so everything happens over email, WhatsApp and video calls, wherever you are.
          </Rise>
          <Rise play={play} delay={0.6} className="mt-8 flex flex-wrap gap-3">
            <a
              href={mail("Website project", "Hi Krutik,\n\nWhat I need:\n\nMy current site (if any):\n\nTimeline:\n")}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03]"
            >
              Start a project <ArrowUpRight />
            </a>
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
          <div className="grid gap-3 sm:grid-cols-2">
            {SERVICES.map((s, i) => (
              <Rise key={s.title} play={play} delay={0.4 + i * 0.08} className={cn(panel, "p-5")}>
                <p className="font-display text-2xl leading-tight text-bone">{s.title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-bone/75">{s.body}</p>
              </Rise>
            ))}
          </div>
          <Rise play={play} delay={0.75} className={cn(panel, "p-5")}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">How it works</p>
            <ol className="mt-3 grid gap-3 sm:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s} className="flex gap-3 text-[14px] leading-snug text-bone/85 sm:flex-col sm:gap-1.5">
                  <span className="font-mono text-xs text-glaze">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Rise>
        </div>
      </div>
    </div>
  );
}

/** 05 · For people who are hiring. */
export function RecruiterScene({ play }: { play: boolean }) {
  const live = projects.filter((p) => p.status === "live").length;
  const facts: [string, string][] = [
    ["Looking for", "Paid remote internships"],
    ["Studying", "B.Tech IT / CS, KJ Somaiya, 2025–2029"],
    ["Experience", `${profile.experience[0].role}, ${profile.experience[0].company} (completed)`],
    ["Shipped", `${live} live projects, all open to inspect`],
  ];
  return (
    <div className="container-x relative flex min-h-full items-center pb-28 pt-[calc(var(--nav-height)+1.5rem)]">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Kicker number="05" label="Work with me · Hire" play={play} />
          <RevealWords as="h2" play={play} delay={0.1} text="Hiring? Let's talk." accent={["talk."]} className="mt-5 font-display text-[clamp(2.8rem,min(6.4vw,11vh),6.5rem)] leading-[0.9] tracking-[-0.03em] text-bone" />
          <Rise play={play} delay={0.45} as="p" className="mt-6 max-w-[46ch] text-base leading-relaxed text-bone/85">
            I build full-stack products end to end: interfaces, APIs, data and the AI layer, with the security and testing that make them trustworthy. Every project here is live or open source, so you can check the work, not just read about it.
          </Rise>
          <Rise play={play} delay={0.6} className="mt-8 flex flex-wrap gap-3">
            <ResumeViewer>
              <button type="button" className="inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03]">
                View resume
              </button>
            </ResumeViewer>
            <a
              href={mail("Internship opportunity", "Hi Krutik,\n\nRole:\nCompany:\nStipend and duration:\n")}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 text-sm text-bone backdrop-blur-md transition-colors hover:bg-white/[0.12]"
            >
              Email me <ArrowUpRight />
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
