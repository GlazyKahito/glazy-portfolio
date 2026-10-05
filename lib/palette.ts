/**
 * The colour tokens as plain values, for the places CSS variables cannot
 * reach: generated images (favicon, Open Graph card, logo) and the browser's
 * theme colour. Mirrors `@theme` in app/globals.css; change both together.
 */
export const palette = {
  ink: "#060505",
  ink2: "#0d0b0a",
  ink3: "#171413",
  bone: "#f4f1ea",
  bone2: "#aaa49b",
  glaze: "#ff6a33",
  cream: "#ece6d3",
  peach: "#ffc9a3",
  ember: "#ff8a4c",
  /** The deep end of the dusk gradient on the Open Graph card. */
  dusk: "#3a1a10",
  duskMid: "#120c0a",
} as const;
