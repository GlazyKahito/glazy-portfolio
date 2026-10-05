import type { Metadata } from "next";
import { TransitionLink } from "@/components/ui/PageTransition";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist. The rest of GLAZY, a freelance web and SaaS agency, is right where we left it.",
  // Next marks a 404 noindex itself. Not the home page: no inherited canonical.
  alternates: { canonical: null },
};

/** The opening's two plates (public/scenes): the sky, and the ridge and lake cut out in front of it. */
const plate = (layer: "sky" | "ridge") => ({
  src: `/scenes/glazy-${layer}-1920.webp`,
  srcSet: `/scenes/glazy-${layer}-1920.webp 1920w, /scenes/glazy-${layer}-3840.webp 3840w`,
  sizes: "100vw",
});

/** Where the ridge crosses the middle of the frame (as in components/scenes/DepthPoster.tsx). */
const RIDGE = 45.6;

/**
 * 404: the opening's depth poster, later in the evening. The same sky and
 * ridge as the first scene, but the GLAZY wordmark has set behind the
 * mountains like the sun: nothing glazed here. A still (two small images and
 * one CSS move that settles the letters once, on transform), so it is light
 * and needs no script; reduced motion and lite mode show it already set.
 */
export default function NotFound() {
  return (
    <section aria-labelledby="not-found-title" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 overflow-hidden bg-ink">
        {/* The stage keeps the still's 16:9 shape and covers the screen, so the letters stay locked to the ridge. */}
        <div
          className="absolute left-1/2 top-1/2 [container-type:size]"
          style={{ width: "max(100vw, 177.78vh)", height: "max(56.25vw, 100vh)", transform: "translate(-50%, -50%)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- layered poster planes must align pixel for pixel */}
          <img {...plate("sky")} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" decoding="async" />
          {/* The last of the light, low behind the ridge. */}
          <div
            className="absolute left-1/2 h-[60%] w-[56%] -translate-x-1/2 rounded-full mix-blend-screen"
            style={{
              top: `${RIDGE - 30}%`,
              background:
                "radial-gradient(closest-side, color-mix(in srgb, var(--color-ember) 34%, transparent), color-mix(in srgb, var(--color-ember) 8%, transparent) 55%, transparent)",
            }}
          />
          <div className="absolute inset-x-0 flex justify-center" style={{ top: `${RIDGE}%` }}>
            <p
              className="flex -translate-y-[34%] font-display leading-[0.78] tracking-[-0.03em] [animation:wordmark-set_3.2s_var(--ease-out-expo)_0.3s_both]"
              style={{ fontSize: "min(40cqh, 31vw, 42vh)" }}
            >
              {"GLAZY".split("").map((ch) => (
                <span
                  key={ch}
                  className="inline-block bg-[linear-gradient(180deg,var(--color-cream)_0%,var(--color-peach)_42%,var(--color-ember)_78%,var(--color-glaze-2)_100%)] bg-clip-text pb-[0.06em] text-transparent opacity-85"
                >
                  {ch}
                </span>
              ))}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- layered poster planes must align pixel for pixel */}
          <img {...plate("ridge")} alt="" className="absolute inset-0 h-full w-full scale-[1.05] object-cover" fetchPriority="high" decoding="async" />
        </div>
        {/* Grade: room for the header above and the copy below, deeper than the opening (it is later now). */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.45),transparent_22%),linear-gradient(to_top,rgb(0_0_0/0.82),rgb(0_0_0/0.35)_42%,transparent_62%)]" />
      </div>

      <div className="container-x relative mt-auto pb-[var(--dock-clear)] pt-[calc(var(--nav-height)+2rem)]">
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 md:grid-cols-12 md:items-end">
          <div className="legible md:col-span-7">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/85">
              <span className="text-bone">404</span>
              <span aria-hidden className="h-px w-8 bg-bone/50" />
              Page not found
            </p>
            <h1 id="not-found-title" className="mt-5 font-display text-[clamp(2.8rem,min(7vw,12vh),6.5rem)] leading-[0.9] tracking-[-0.03em] text-bone">
              Nothing glazed <span className="italic text-peach">here.</span>
            </h1>
            <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-bone/90">
              The sun has set on this page: it has moved, or it never existed. The rest of the site is right where we left it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:col-span-5 md:justify-end">
            <TransitionLink
              href="/"
              className="group inline-flex h-12 items-center gap-3 rounded-full border border-white/10 bg-black/55 pl-5 pr-1.5 text-sm text-cream shadow-[0_14px_40px_-12px_rgb(0_0_0/0.7)] backdrop-blur-md transition-colors duration-300 hover:bg-black/75"
            >
              Back to the opening
              <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </TransitionLink>
            <TransitionLink
              href="/#projects"
              className="inline-flex h-12 items-center rounded-full border border-white/20 bg-white/[0.06] px-6 text-sm text-cream backdrop-blur-md transition-colors hover:bg-white/[0.12]"
            >
              See the work
            </TransitionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
