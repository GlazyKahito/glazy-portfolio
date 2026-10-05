"use client";

import { useState } from "react";
import { Kicker, Rise, panel } from "@/components/scenes/ChapterScenes";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { RevealWords } from "@/components/ui/Reveal";
import { Wordmark } from "@/components/ui/Wordmark";
import { footage } from "@/data/scenes";
import { profile } from "@/data/profile";
import { site } from "@/data/site";
import { setLite, useLite } from "@/lib/capability";
import { cn } from "@/lib/utils";

export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(profile.email);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {}
      }}
      className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 text-sm text-bone backdrop-blur-xl transition-colors hover:bg-white/[0.12]"
      aria-live="polite"
    >
      <span className={cn("h-1.5 w-1.5 rounded-full transition-colors", copied ? "bg-glaze" : "bg-bone/50")} />
      {copied ? "Copied" : "Copy email"}
    </button>
  );
}

function Socials() {
  return (
    <ul className="grid gap-3 sm:grid-cols-3" aria-label="Elsewhere">
      {profile.socials.map((s) => {
        const external = s.href.startsWith("http");
        return (
          <li key={s.label}>
            <a
              href={s.href}
              {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
              className={cn(panel, "group flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.08]")}
            >
              <span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-bone/75">{s.label}</span>
                <span className="mt-1 block text-base text-bone">{s.handle}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-bone/75 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-bone" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function LiteToggle() {
  const lite = useLite();
  return (
    <button type="button" onClick={() => setLite(!lite)} className="underline-offset-4 hover:text-bone hover:underline">
      {lite ? "Switch to full 4K (L)" : "Switch to lite version (L)"}
    </button>
  );
}

/**
 * The colophon. Its phrases wrap as whole phrases (never a name split over two
 * lines). In the deck, the dock's prompt already offers the way back to the start.
 */
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="flex flex-col gap-4 border-t border-white/15 pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/75 sm:text-[11px] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4 lg:items-center">
        <span className="mt-0.5 block w-14 shrink-0 text-bone lg:mt-0">
          <Wordmark strokeWidth={10} />
        </span>
        <p className="flex flex-wrap gap-x-[1ch]">
          <span className="whitespace-nowrap">© {year} {site.name},</span>
          <span className="whitespace-nowrap">a freelance web &amp; SaaS agency</span>
          <span className="whitespace-nowrap">· Founded by {profile.name}</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="whitespace-nowrap">Footage: Mixkit ({Object.keys(footage).length} clips)</span>
        <LiteToggle />
      </div>
    </footer>
  );
}

/** 06 Say hello — the last scene of the home deck. */
export function ContactScene({ play }: { play: boolean }) {
  return (
    <div className="container-x relative flex min-h-full flex-col justify-end pb-[var(--dock-clear)] pt-[calc(var(--nav-height)+1.5rem)]">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10">
        <div>
          <Kicker number="06" label="Say hello" play={play} />
          <RevealWords
            as="h2"
            play={play}
            delay={0.1}
            text="Let's build something."
            accent={["something."]}
            className="legible mt-5 font-display text-[clamp(3rem,min(9vw,14vh),9.5rem)] leading-[0.86] tracking-[-0.035em] text-bone"
          />
          <Rise play={play} delay={0.5} as="p" className="legible mt-6 max-w-xl text-lg leading-relaxed text-bone/90">
            Send a brief, an idea, or a hello. Every message is read, and every brief gets a reply.
          </Rise>
          <Rise play={play} delay={0.65} className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03]"
            >
              {profile.email} <ArrowUpRight />
            </a>
            <CopyEmail />
          </Rise>
        </div>
        <Rise play={play} delay={0.8}>
          <Socials />
        </Rise>
        <Rise play={play} delay={0.9} className="legible">
          <Footer />
        </Rise>
      </div>
    </div>
  );
}

/** The same ending for project pages, in normal page flow. */
export function ContactFooter() {
  return (
    <section aria-labelledby="contact-title" className="container-x relative pb-[var(--dock-clear)] pt-24 md:pt-32">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10">
        <div>
          <h2 id="contact-title" className="font-display text-[clamp(3rem,7vw,7rem)] leading-[0.9] tracking-[-0.03em] text-bone">
            Let&apos;s build <span className="italic text-peach">something.</span>
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03]"
            >
              {profile.email} <ArrowUpRight />
            </a>
            <CopyEmail />
          </div>
        </div>
        <Socials />
        <Footer />
      </div>
    </section>
  );
}
