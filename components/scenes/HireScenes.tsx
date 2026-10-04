"use client";

import { useState } from "react";
import { Kicker, Rise, panel } from "@/components/scenes/ChapterScenes";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { RevealWords } from "@/components/ui/Reveal";
import { ResumeViewer } from "@/components/ui/ResumeViewer";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { process, services } from "@/data/services";
import { gotoChapter } from "@/lib/deck";
import { cn } from "@/lib/utils";

const phone = profile.phone.replace(/\D/g, "");
const mail = (subject: string, body: string) =>
  `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

const SUBJECT = "New project for GLAZY";

/**
 * The brief, written on the page and sent the way the visitor prefers.
 * WhatsApp and Gmail open in the browser, so it works on machines with no
 * email app set up (where a bare mailto: link silently does nothing).
 */
function BriefForm() {
  const [name, setName] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [copied, setCopied] = useState(false);

  const brief = [
    "Hi GLAZY,",
    "",
    name.trim() ? `I'm ${name.trim()}.` : "",
    `Looking for: ${needs.length ? needs.join(", ") : "not sure yet"}`,
    "",
    details.trim() || "(What the business does, any site you have now, and your timeline.)",
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

  const via = {
    whatsapp: `https://wa.me/${phone}?text=${encodeURIComponent(brief)}`,
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}&su=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(brief)}`,
    app: mail(SUBJECT, brief),
  };
  const field =
    "w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-[14px] text-bone placeholder:text-bone-3 transition-colors focus:border-peach/70 focus:outline-none";
  const send =
    "inline-flex h-11 items-center gap-2 rounded-full px-5 text-[13px] transition-colors";

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()} aria-label="Write a brief">
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} placeholder="Name or business" />
        </label>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">What do you need?</legend>
          <div className="flex flex-wrap gap-1.5">
            {services.map((s) => {
              const on = needs.includes(s.title);
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setNeeds((n) => (on ? n.filter((x) => x !== s.title) : [...n, s.title]))}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[12.5px] transition-colors",
                    on ? "border-peach/70 bg-peach/15 text-cream" : "border-white/12 bg-white/[0.04] text-bone/85 hover:bg-white/[0.09]",
                  )}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">Tell us about it</span>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          className={cn(field, "resize-none")}
          placeholder="What the business does, any site you have now, and your timeline"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">Send it by</span>
        <a href={via.whatsapp} target="_blank" rel="noreferrer noopener" className={cn(send, "bg-cream font-medium text-ink hover:bg-white")}>
          WhatsApp <ArrowUpRight />
        </a>
        <a href={via.gmail} target="_blank" rel="noreferrer noopener" className={cn(send, "border border-white/20 bg-white/[0.06] text-bone hover:bg-white/[0.12]")}>
          Gmail <ArrowUpRight />
        </a>
        <a href={via.app} className={cn(send, "border border-white/20 bg-white/[0.06] text-bone hover:bg-white/[0.12]")}>
          Email app
        </a>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(`${brief}\n\n(to ${profile.email})`);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            } catch {}
          }}
          className={cn(send, "text-bone-2 hover:text-bone")}
          aria-live="polite"
        >
          {copied ? "Copied" : "Copy brief"}
        </button>
      </div>
    </form>
  );
}

/** 06 · Start a project: how it runs, and the brief. */
export function StartScene({ play }: { play: boolean }) {
  return (
    <div className="container-x relative flex min-h-full items-center pb-28 pt-[calc(var(--nav-height)+1.5rem)]">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Kicker number="06" label="Start a project" play={play} />
          <RevealWords as="h2" play={play} delay={0.1} text="Tell us what you need." accent={["need."]} className="mt-5 font-display text-[clamp(2.8rem,min(6.4vw,11vh),6.5rem)] leading-[0.9] tracking-[-0.03em] text-bone" />
          <Rise play={play} delay={0.45} as="p" className="mt-6 max-w-[42ch] text-base leading-relaxed text-bone/85">
            Write a short brief and we reply with a plan and a quote. GLAZY works fully online, over email, WhatsApp and video calls, so it does not matter where you are. No fixed prices: every quote follows the brief.
          </Rise>
          <Rise play={play} delay={0.6} className="mt-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">How a project runs</p>
            <ol className="mt-3 grid gap-3 sm:grid-cols-2">
              {process.map((s, i) => (
                <li key={s} className="flex gap-3 text-[14px] leading-snug text-bone/85">
                  <span className="font-mono text-xs text-glaze">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Rise>
        </div>
        <Rise play={play} delay={0.45} className={cn(panel, "p-6 md:p-7 lg:col-span-7")}>
          <BriefForm />
        </Rise>
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
            Alongside running GLAZY, {profile.name.split(" ")[0]} is open to paid remote internships, building full-stack products end to end: interfaces, APIs, data and the AI layer, with the security and testing that make them trustworthy. The work is live or open source, so you can check it, not just read about it.
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
