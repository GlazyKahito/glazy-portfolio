"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useLenis } from "lenis/react";
import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";

/** The sheet itself is loaded on first intent (hover, focus or a tap), not with the page. */
const ResumeDialog = dynamic(() => import("@/components/ui/ResumeDialog").then((m) => m.ResumeDialog), { ssr: false });

interface ResumeViewerProps {
  children: ReactNode;
  onOpen?: () => void;
}

/**
 * Full-screen resume viewer, opened by its child (the trigger). Desktop
 * embeds the real PDF; phones get a rendered preview plus open/download
 * actions (inline PDFs are poor on mobile).
 */
export function ResumeViewer({ children, onOpen }: ResumeViewerProps) {
  const [open, setOpen] = useState(false);
  const [wanted, setWanted] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    if (open) {
      lenis?.stop();
      onOpen?.();
    } else {
      lenis?.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lenis]);

  const want = () => setWanted(true);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild onPointerEnter={want} onFocus={want} onTouchStart={want}>
        {children}
      </Dialog.Trigger>
      {(wanted || open) && <ResumeDialog open={open} />}
    </Dialog.Root>
  );
}
