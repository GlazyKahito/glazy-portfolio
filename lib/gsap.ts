import { gsap } from "gsap";

/**
 * GSAP, configured once for the whole site.
 * Lag smoothing is off: the intro and the page-transition curtain must finish
 * in real time even when a slow device drops frames, instead of stretching
 * into slow motion.
 */
gsap.ticker.lagSmoothing(0);

export { gsap };
