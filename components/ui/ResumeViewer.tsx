"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight } from "@/components/ui/MagneticButton";
import { profile } from "@/data/profile";
import { useDevice, useMediaQuery } from "@/lib/hooks/use-device";
import { ease } from "@/lib/motion";

interface ResumeViewerProps {
  children: ReactNode;
  onOpen?: () => void;
}

/**
 * Full-screen resume viewer. Desktop embeds the real PDF; phones get a
 * rendered preview plus open/download actions (inline PDFs are poor on mobile).
 */
export function ResumeViewer({ children, onOpen }: ResumeViewerProps) {
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const { touch } = useDevice();
  const narrow = useMediaQuery("(max-width: 767px)");
  const embed = !touch && !narrow;

  useEffect(() => {
    if (open) {
      lenis?.stop();
      onOpen?.();
    } else {
      lenis?.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lenis]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[96] bg-ink/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed inset-x-0 bottom-0 top-0 z-[97] mx-auto flex w-full max-w-[1100px] flex-col p-3 outline-none sm:p-6"
                initial={{ y: 40, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 40, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: ease.outExpo }}
                data-lenis-prevent
              >
                <div className="glass flex h-full flex-col overflow-hidden rounded-2xl">
                  <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-6">
                    <div className="min-w-0">
                      <Dialog.Title className="truncate font-display text-base font-semibold tracking-tight">
                        Resume — {profile.name}
                      </Dialog.Title>
                      <Dialog.Description className="label-mono mt-0.5 truncate">
                        PDF · September 2026
                      </Dialog.Description>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={profile.resume}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hidden items-center gap-2 rounded-full border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone sm:flex"
                      >
                        Open <ArrowUpRight />
                      </a>
                      <a
                        href={profile.resume}
                        download="Krutik_Mhatre_Resume.pdf"
                        className="flex items-center gap-2 rounded-full bg-bone px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-glaze"
                      >
                        Download
                      </a>
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          aria-label="Close resume"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-bone transition-colors hover:border-bone"
                        >
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                            <path d="M4 4l8 8M12 4l-8 8" />
                          </svg>
                        </button>
                      </Dialog.Close>
                    </div>
                  </header>

                  <div className="relative flex-1 overflow-auto bg-ink-2">
                    {embed ? (
                      <iframe
                        src={`${profile.resume}#toolbar=0&navpanes=0&view=FitH`}
                        title="Resume PDF"
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-5 p-4">
                        <Image
                          src="/resume/preview.jpg"
                          alt="First page of Krutik Mhatre's resume"
                          width={1224}
                          height={1584}
                          className="w-full rounded-md border border-line"
                          priority
                        />
                        <a
                          href={profile.resume}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-line-strong py-3 font-mono text-[11px] uppercase tracking-[0.18em]"
                        >
                          Open full PDF <ArrowUpRight />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
