"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Spotlight } from "@/components/ui/Spotlight";
import { profile } from "@/data/profile";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 20 });
  const sry = useSpring(ry, { stiffness: 120, damping: 20 });

  return (
    <div className="[perspective:1400px]">
      <motion.div
        ref={ref}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          const r = ref.current?.getBoundingClientRect();
          if (!r) return;
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 6);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
        }}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
        className="glass rounded-2xl"
      >
        <Spotlight className="rounded-2xl p-6 md:p-8">{children}</Spotlight>
      </motion.div>
    </div>
  );
}

export function About() {
  const [lead, ...rest] = profile.about;

  return (
    <section id="about" className="container-x relative scroll-mt-24 py-24 md:py-32" aria-labelledby="about-title">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading index="03" label="About" title="Who is behind GLAZY." accent={["behind"]} />

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <RevealWords
              as="p"
              text={lead}
              accent={["GLAZY."]}
              wordClassName="transition-colors duration-300 hover:text-glaze"
              className="font-display text-[clamp(1.5rem,3vw,2.6rem)] font-medium leading-[1.15] tracking-[-0.025em] text-bone"
            />
            <motion.div
              className="mt-10 flex max-w-[60ch] flex-col gap-5 text-base leading-relaxed text-bone-2 md:text-[1.0625rem]"
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {rest.map((p, i) => (
                <motion.p key={i} variants={fadeUp}>
                  {p}
                </motion.p>
              ))}
            </motion.div>

            <motion.dl
              className="mt-12 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-3"
              variants={stagger(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {[
                ["Based in", profile.location],
                ["Studying", "B.Tech IT / CS, 2025–2029"],
                ["Open to", "Paid remote internships & web projects"],
              ].map(([k, v]) => (
                <motion.div key={k} variants={fadeUp}>
                  <dt className="label-mono">{k}</dt>
                  <dd className="mt-2 font-display text-lg font-medium leading-snug text-bone">{v}</dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <Reveal variant="fade">
              <TiltCard>
                <h3 className="label-mono">Experience</h3>
                {profile.experience.map((exp) => (
                  <div key={exp.role} className="mt-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-xl font-semibold tracking-tight text-bone">{exp.role}</p>
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone-3">{exp.period}</span>
                    </div>
                    <p className="mt-1 text-sm text-bone-2">{exp.company}</p>
                    <ul className="mt-4 flex flex-col gap-3">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed text-bone-2">
                          <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-glaze" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    {exp.links && (
                      <div className="mt-4 flex flex-wrap gap-4">
                        {exp.links.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-2 transition-colors hover:text-bone"
                          >
                            {l.label} <ArrowUpRight />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </TiltCard>
            </Reveal>

            <Reveal variant="fade" delay={0.15}>
              <TiltCard>
                <h3 className="label-mono">Education</h3>
                {profile.education.map((ed) => (
                  <div key={ed.institution} className="mt-5">
                    <p className="font-display text-xl font-semibold tracking-tight text-bone">{ed.institution}</p>
                    <p className="mt-1 text-sm text-bone-2">{ed.degree}</p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-3">
                      {ed.period} · {ed.location}
                    </p>
                  </div>
                ))}
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
