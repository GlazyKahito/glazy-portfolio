"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useIntro } from "@/components/ui/Intro";
import { onIdle } from "@/lib/hooks/use-device";

const Nimbus = dynamic(() => import("@/components/ui/Nimbus").then((m) => m.Nimbus), { ssr: false });

/**
 * Mr. Nimbus arrives after the opening, once the browser is idle: his code
 * (the guided answers, the chat) is not part of the first load.
 */
export function LazyNimbus() {
  const { done } = useIntro();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!done || ready) return;
    return onIdle(() => setReady(true), 2500);
  }, [done, ready]);
  return ready ? <Nimbus /> : null;
}
