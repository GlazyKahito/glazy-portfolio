"use client";

import { useLenis } from "lenis/react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import { ease } from "@/lib/motion";

type Phase = "idle" | "cover" | "reveal";

interface TransitionContextValue {
  /** Navigate with the curtain. Handles "/#hash" links by smooth-scrolling. */
  navigate: (href: string) => void;
  phase: Phase;
}

const TransitionContext = createContext<TransitionContextValue>({
  navigate: () => {},
  phase: "idle",
});

export function useTransition() {
  return useContext(TransitionContext);
}

const COVER_MS = 720;
const REVEAL_MS = 820;

/**
 * Route transitions: a curtain rises to cover the page, the route changes
 * underneath, then the curtain lifts away. Hash links scroll instead.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const pendingRef = useRef<string | null>(null);
  const lastPathRef = useRef(pathname);

  const scrollToHash = useCallback(
    (hash: string, immediate = false) => {
      const el = document.querySelector(hash);
      if (!el) return;
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -8, immediate, duration: 1.4 });
      else el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
    },
    [lenis],
  );

  const navigate = useCallback(
    (href: string) => {
      const [path, hash] = href.split("#");
      const targetPath = path || "/";
      const samePage = targetPath === pathname;

      if (samePage && hash) {
        scrollToHash(`#${hash}`);
        return;
      }
      if (reduce) {
        router.push(href);
        return;
      }
      if (phase !== "idle") return;
      pendingRef.current = href;
      setPhase("cover");
      window.setTimeout(() => router.push(href), COVER_MS);
    },
    [pathname, phase, reduce, router, scrollToHash],
  );

  // When the route actually changes, jump to top (or the hash) and reveal.
  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    const href = pendingRef.current;
    pendingRef.current = null;
    const hash = href?.split("#")[1];
    if (hash) {
      // Give the new page a frame to lay out before measuring.
      requestAnimationFrame(() => scrollToHash(`#${hash}`, true));
    } else {
      lenis?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    }
    if (reduce) return;
    // Phase changes happen in callbacks, never synchronously inside the effect.
    const raf = requestAnimationFrame(() => setPhase("reveal"));
    const t = window.setTimeout(() => setPhase("idle"), REVEAL_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [pathname, lenis, reduce, scrollToHash]);

  const value = useMemo(() => ({ navigate, phase }), [navigate, phase]);

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-ink-2"
        initial={false}
        animate={
          phase === "cover"
            ? { clipPath: "inset(0% 0 0% 0)" }
            : phase === "reveal"
              ? { clipPath: "inset(0% 0 100% 0)" }
              : { clipPath: "inset(100% 0 0% 0)" }
        }
        transition={{
          duration: phase === "cover" ? COVER_MS / 1000 : REVEAL_MS / 1000,
          ease: ease.inOutQuart,
        }}
        style={{ clipPath: "inset(100% 0 0% 0)" }}
      >
        <motion.div
          className="w-[min(40vw,220px)] text-bone/80"
          animate={{ opacity: phase === "idle" ? 0 : 1, scale: phase === "cover" ? 1 : 0.96 }}
          transition={{ duration: 0.4 }}
        >
          <Wordmark strokeWidth={8} />
        </motion.div>
      </motion.div>
    </TransitionContext.Provider>
  );
}

/** Link that uses the curtain for internal routes and smooth scroll for hashes. */
export function TransitionLink({
  href,
  children,
  className,
  onClick,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { navigate } = useTransition();
  const external = /^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        if (external || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
