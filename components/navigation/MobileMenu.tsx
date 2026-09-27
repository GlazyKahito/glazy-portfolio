"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useTransition } from "@/components/ui/PageTransition";
import { ResumeViewer } from "@/components/ui/ResumeViewer";
import { Wordmark } from "@/components/ui/Wordmark";
import { profile } from "@/data/profile";
import { site } from "@/data/site";
import { ease } from "@/lib/motion";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const lenis = useLenis();
  const { navigate } = useTransition();

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  const go = (href: string) => {
    onOpenChange(false);
    // Let the menu start closing before the page moves.
    window.setTimeout(() => navigate(href), 120);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[94] bg-ink/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount id="mobile-menu">
              <motion.div
                className="fixed inset-0 z-[95] flex flex-col bg-ink text-bone"
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                exit={{ clipPath: "inset(0 0 100% 0)" }}
                transition={{ duration: 0.7, ease: ease.inOutQuart }}
                data-lenis-prevent
              >
                <Dialog.Title className="sr-only">Menu</Dialog.Title>
                <Dialog.Description className="sr-only">Site navigation</Dialog.Description>

                <div className="container-x flex items-center justify-between py-6">
                  <span className="block w-24">
                    <Wordmark strokeWidth={10} />
                  </span>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-full border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em]"
                    >
                      Close
                    </button>
                  </Dialog.Close>
                </div>

                <nav aria-label="Mobile" className="container-x flex flex-1 flex-col justify-center">
                  <ul className="flex flex-col">
                    {site.nav.map((item, i) => (
                      <li key={item.href} className="overflow-hidden border-b border-line">
                        <motion.button
                          type="button"
                          onClick={() => go(item.href)}
                          className="flex w-full items-baseline justify-between py-4 text-left font-display text-display-sm font-medium tracking-tight"
                          initial={{ y: "110%" }}
                          animate={{ y: "0%" }}
                          exit={{ y: "110%" }}
                          transition={{ duration: 0.8, ease: ease.outExpo, delay: 0.25 + i * 0.06 }}
                        >
                          <span>{item.label}</span>
                          <span className="font-mono text-xs text-bone-3">0{i + 1}</span>
                        </motion.button>
                      </li>
                    ))}
                  </ul>
                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <ResumeViewer onOpen={() => onOpenChange(false)}>
                      <button
                        type="button"
                        className="w-full rounded-full bg-bone py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink"
                      >
                        View resume
                      </button>
                    </ResumeViewer>
                  </motion.div>
                </nav>

                <motion.div
                  className="container-x flex items-center justify-between pb-8 pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex gap-4">
                    {profile.socials
                      .filter((s) => s.href.startsWith("http"))
                      .map((s) => (
                        <a key={s.label} href={s.href} target="_blank" rel="noreferrer noopener" className="hover:text-bone">
                          {s.label}
                        </a>
                      ))}
                  </div>
                  <a href={`mailto:${profile.email}`} className="hover:text-bone">
                    Email
                  </a>
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
