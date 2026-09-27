"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { useIntro } from "@/components/ui/Intro";
import { TransitionLink } from "@/components/ui/PageTransition";
import { ResumeViewer } from "@/components/ui/ResumeViewer";
import { Wordmark } from "@/components/ui/Wordmark";
import { site } from "@/data/site";
import { useActiveSection } from "@/lib/hooks/use-active-section";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SECTION_IDS = site.nav.map((n) => n.href.replace("/#", ""));

/**
 * Navigation that transforms on scroll: a wide, transparent bar at the top
 * becomes a compact floating pill once the hero is left behind.
 */
export function Nav() {
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { done } = useIntro();
  const pathname = usePathname();
  const active = useActiveSection(SECTION_IDS);
  const onHome = pathname === "/";

  useMotionValueEvent(scrollY, "change", (y) => setCompact(y > 96));

  return (
    <>
      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-[90] flex justify-center"
        initial={{ opacity: 0, y: -12 }}
        animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
        transition={{ duration: 0.9, ease: ease.outExpo, delay: done ? 0.2 : 0 }}
      >
        <motion.nav
          aria-label="Primary"
          className={cn(
            "pointer-events-auto flex items-center justify-between gap-6 border border-transparent",
            "transition-[background-color,border-color,backdrop-filter] duration-500",
            compact && "glass",
          )}
          initial={false}
          animate={compact ? "compact" : "top"}
          variants={{
            top: {
              width: "100%",
              marginTop: 0,
              paddingLeft: "var(--gutter)",
              paddingRight: "var(--gutter)",
              paddingTop: 22,
              paddingBottom: 22,
              borderRadius: 0,
            },
            compact: {
              width: "min(720px, calc(100% - 1.5rem))",
              marginTop: 12,
              paddingLeft: 18,
              paddingRight: 8,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 999,
            },
          }}
          transition={{ duration: 0.7, ease: ease.outExpo }}
        >
          <TransitionLink
            href="/"
            aria-label="GLAZY — home"
            className="flex items-center gap-3 text-bone"
            data-cursor="link"
          >
            <motion.span
              className="block"
              animate={{ width: compact ? 68 : 96 }}
              transition={{ duration: 0.7, ease: ease.outExpo }}
            >
              <Wordmark strokeWidth={10} />
            </motion.span>
          </TransitionLink>

          <ul className="hidden items-center gap-1 md:flex">
            {site.nav.map((item) => {
              const id = item.href.replace("/#", "");
              const isActive = onHome && active === id;
              return (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    className={cn(
                      "relative block px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-300",
                      isActive ? "text-bone" : "text-bone-2 hover:text-bone",
                    )}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "absolute bottom-0.5 left-1/2 h-px w-3 -translate-x-1/2 bg-glaze transition-transform duration-500 ease-out-expo",
                        isActive ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </TransitionLink>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <ResumeViewer>
              <button
                type="button"
                className={cn(
                  "hidden items-center gap-2 rounded-full border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-bone hover:bg-bone hover:text-ink sm:flex",
                )}
              >
                Resume
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-glaze" />
              </button>
            </ResumeViewer>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-bone md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              Menu
            </button>
          </div>
        </motion.nav>
      </motion.header>
      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
