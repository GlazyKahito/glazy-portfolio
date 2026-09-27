"use client";

import { useLenis } from "lenis/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { ArrowUpRight, MagneticButton } from "@/components/ui/MagneticButton";
import { TransitionLink } from "@/components/ui/PageTransition";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { Wordmark } from "@/components/ui/Wordmark";
import { profile } from "@/data/profile";
import { site } from "@/data/site";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

function CopyEmail() {
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
      className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-2 transition-colors hover:text-bone"
      aria-live="polite"
    >
      <span className={cn("h-1.5 w-1.5 rounded-full transition-colors", copied ? "bg-glaze" : "bg-bone-3")} />
      {copied ? "Copied" : "Copy email"}
    </button>
  );
}

export function Contact({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const markY = useTransform(scrollYProgress, [0, 1], ["30%", "0%"]);
  const markOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.12]);
  const year = new Date().getFullYear();

  return (
    <section
      ref={ref}
      id="contact"
      aria-labelledby="contact-title"
      className={cn("container-x relative scroll-mt-24 overflow-hidden", compact ? "pt-24 md:pt-32" : "pt-24 md:pt-40")}
    >
      {/* Final scene backdrop: a rising glow and the wordmark as a watermark. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{ background: "radial-gradient(70% 60% at 50% 100%, rgb(255 45 26 / 0.14), transparent 70%)" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-4%] text-bone"
        style={{ y: markY, opacity: markOpacity }}
      >
        <div className="mx-auto w-[min(96vw,1500px)]">
          <Wordmark strokeWidth={9} />
        </div>
      </motion.div>

      <div className="relative mx-auto max-w-[1500px]">
        {!compact && (
          <div className="flex items-center gap-4">
            <span className="label-mono">05 <span className="mx-1 text-bone-3/60">/</span> Contact</span>
            <span aria-hidden className="h-px flex-1 bg-line" />
          </div>
        )}

        <div className="mt-10 md:mt-16">
          <RevealWords
            as="h2"
            text="Let's build something."
            accent={["something."]}
            className="font-display text-display-lg font-semibold leading-[0.9] tracking-[-0.04em] text-bone"
          />
          <Reveal variant="fade" delay={0.3} className="mt-6 max-w-xl">
            <p className="text-lg leading-relaxed text-bone-2">
              Send a brief, an idea, or a hello. I read everything that lands in my inbox.
            </p>
          </Reveal>
        </div>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5 md:mt-14"
          variants={stagger(0.1, 0.4)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div variants={fadeUp}>
            <MagneticButton href={`mailto:${profile.email}`} size="lg" icon={<ArrowUpRight />} variant="glaze">
              {profile.email}
            </MagneticButton>
          </motion.div>
          <motion.div variants={fadeUp}>
            <CopyEmail />
          </motion.div>
        </motion.div>

        <motion.ul
          className="mt-16 grid border-t border-line md:mt-24 md:grid-cols-3"
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          aria-label="Elsewhere"
        >
          {profile.socials.map((s) => {
            const external = s.href.startsWith("http");
            return (
              <motion.li key={s.label} variants={fadeUp} className="border-b border-line md:border-b-0 md:border-r md:last:border-r-0">
                <a
                  href={s.href}
                  {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                  className="group flex items-center justify-between py-6 pr-4 transition-colors md:py-8 md:pr-8"
                >
                  <span>
                    <span className="label-mono block">{s.label}</span>
                    <span className="mt-2 block font-display text-xl font-medium tracking-tight text-bone md:text-2xl">{s.handle}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-bone-3 transition-all duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-bone" />
                </a>
              </motion.li>
            );
          })}
        </motion.ul>

        <footer className="mt-16 flex flex-col gap-6 border-t border-line py-8 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-3 md:mt-24 md:flex-row md:items-center md:justify-between sm:text-[11px]">
          <div className="flex items-center gap-4">
            <TransitionLink href="/" aria-label="GLAZY — home" className="block w-16 text-bone">
              <Wordmark strokeWidth={10} />
            </TransitionLink>
            <span>
              © {year} {site.name} · {profile.name}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span>{profile.location}</span>
            <span className="hidden sm:inline">Built with Next.js · R3F · Motion</span>
            <button
              type="button"
              onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
              className="inline-flex items-center gap-2 text-bone-2 transition-colors hover:text-bone"
            >
              Back to top <ArrowUpRight className="-rotate-45" />
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
