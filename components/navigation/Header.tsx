"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useIntro } from "@/components/ui/Intro";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { TransitionLink, useTransition } from "@/components/ui/PageTransition";
import { ResumeViewer } from "@/components/ui/ResumeViewer";
import { Wordmark } from "@/components/ui/Wordmark";
import { profile } from "@/data/profile";
import { chapters } from "@/data/scenes";
import { setLite, useLite } from "@/lib/capability";
import { gotoChapter, useDeck } from "@/lib/deck";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * A quiet header: the wordmark, Resume, and a Menu. No bar, no pill; it
 * floats over the footage. The menu is a frosted full-screen sheet that
 * lists only the chapters you have already reached (no spoilers), plus the
 * ways to get in touch, which are never a spoiler.
 */
export function Header() {
  const { done } = useIntro();
  const pathname = usePathname();
  const onHome = pathname === "/";
  const deck = useDeck();
  const [open, setOpen] = useState(false);
  const { navigate } = useTransition();
  const lite = useLite();

  const reached = chapters.filter((c) => deck.visited.includes(c.id));

  return (
    <>
      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-[90] flex items-center justify-between px-[var(--gutter)] pt-5"
        initial={{ opacity: 0, y: -10 }}
        animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.9, ease: ease.outExpo, delay: done ? 0.3 : 0 }}
      >
        <TransitionLink href="/" aria-label="GLAZY — home" className="pointer-events-auto block w-[88px] text-bone drop-shadow-[0_2px_12px_rgb(0_0_0/0.5)]">
          <Wordmark strokeWidth={10} />
        </TransitionLink>
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Quality, always in reach: 4K footage or the lite version (stills). L toggles it anywhere. */}
          <button
            type="button"
            role="switch"
            aria-checked={lite}
            aria-label="Lite version (press L to switch)"
            title={lite ? "Lite version is on: still frames instead of 4K video (L)" : "Full 4K video. Switch to the lite version for slower devices (L)"}
            onClick={() => setLite(!lite)}
            className="relative flex h-10 items-center rounded-full border border-white/15 bg-black/30 p-1 font-mono text-[10px] uppercase tracking-[0.16em] text-bone backdrop-blur-md transition-colors hover:bg-black/45"
          >
            <span aria-hidden className={cn("absolute left-1 top-1 h-8 w-[calc(50%-4px)] rounded-full bg-bone transition-transform duration-500 ease-out-expo", lite ? "translate-x-full" : "translate-x-0")} />
            <span aria-hidden className={cn("relative z-[1] w-11 text-center transition-colors duration-300", lite ? "text-bone/70" : "text-ink")}>
              4K
            </span>
            <span aria-hidden className={cn("relative z-[1] w-11 text-center transition-colors duration-300", lite ? "text-ink" : "text-bone/70")}>
              Lite
            </span>
          </button>
          <ResumeViewer>
            <button type="button" className="hidden h-10 items-center rounded-full px-4 text-sm text-bone/90 transition-colors hover:text-bone sm:flex">
              Resume
            </button>
          </ResumeViewer>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            className="flex h-10 items-center gap-3 rounded-full border border-white/15 bg-white/[0.07] pl-4 pr-3 text-sm text-bone backdrop-blur-md transition-colors hover:bg-white/[0.14]"
          >
            Menu
            <span aria-hidden className="flex w-4 flex-col gap-[5px]">
              <span className="h-px w-full bg-bone" />
              <span className="h-px w-2/3 self-end bg-bone" />
            </span>
          </button>
        </div>
      </motion.header>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-[94] bg-black/40 backdrop-blur-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-[95] flex flex-col px-[var(--gutter)] pb-8 pt-5 text-bone outline-none"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5, ease: ease.outExpo }}
                  data-lenis-prevent
                >
                  <Dialog.Title className="sr-only">Menu</Dialog.Title>
                  <Dialog.Description className="sr-only">Chapters you have visited, and ways to get in touch</Dialog.Description>
                  <div className="flex items-center justify-between">
                    <span className="block w-[88px]">
                      <Wordmark strokeWidth={10} />
                    </span>
                    <Dialog.Close asChild>
                      <button type="button" className="flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 text-sm backdrop-blur-md hover:bg-white/[0.14]">
                        Close
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="mx-auto grid w-full max-w-[1400px] flex-1 content-center gap-12 md:grid-cols-12">
                    <nav aria-label="Chapters" className="md:col-span-7">
                      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone-2">{onHome ? "Chapters you have reached" : "GLAZY"}</p>
                      <ul className="mt-6 flex flex-col">
                        {(onHome ? reached : chapters.filter((c) => c.id === "intro" || c.id === "work")).map((c, i) => (
                          <li key={c.id} className="overflow-hidden border-b border-white/10">
                            <motion.button
                              type="button"
                              onClick={() => {
                                setOpen(false);
                                window.setTimeout(() => {
                                  if (onHome) gotoChapter(c.id);
                                  else navigate(c.id === "intro" ? "/" : "/#projects");
                                }, 250);
                              }}
                              className={cn(
                                "group flex w-full items-baseline justify-between py-4 text-left font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-none transition-colors",
                                onHome && deck.chapter === c.id ? "text-bone" : "text-bone/60 hover:text-bone",
                              )}
                              initial={{ y: "100%" }}
                              animate={{ y: "0%" }}
                              transition={{ duration: 0.8, ease: ease.outExpo, delay: 0.1 + i * 0.05 }}
                            >
                              <span>{onHome ? c.label : c.id === "intro" ? "Home" : "The work"}</span>
                              <span className="font-mono text-xs text-bone-2">{c.number}</span>
                            </motion.button>
                          </li>
                        ))}
                      </ul>
                      {onHome && reached.length < chapters.length && (
                        <p className="mt-5 text-sm text-bone-2">The rest reveals itself as you go.</p>
                      )}
                    </nav>

                    <div className="flex flex-col gap-8 md:col-span-4 md:col-start-9">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone-2">Get in touch</p>
                        <a href={`mailto:${profile.email}`} className="mt-3 block font-display text-3xl hover:underline">
                          {profile.email}
                        </a>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {profile.socials
                          .filter((s) => s.href.startsWith("http"))
                          .map((s) => (
                            <li key={s.label}>
                              <a href={s.href} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 text-bone/80 hover:text-bone">
                                {s.label} <ArrowUpRight />
                              </a>
                            </li>
                          ))}
                      </ul>
                      <div className="flex flex-wrap gap-3">
                        <ResumeViewer onOpen={() => setOpen(false)}>
                          <button type="button" className="h-11 rounded-full bg-bone px-5 text-sm font-medium text-ink">
                            View resume
                          </button>
                        </ResumeViewer>
                        <button
                          type="button"
                          onClick={() => setLite(!lite)}
                          className="h-11 rounded-full border border-white/15 px-5 text-sm text-bone/85 hover:bg-white/[0.08]"
                        >
                          {lite ? "Full 4K version" : "Lite version"} <kbd className="ml-1 rounded border border-white/20 px-1 font-mono text-[10px]">L</kbd>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}
