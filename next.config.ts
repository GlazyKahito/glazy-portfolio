import type { NextConfig } from "next";

const WEEK = 60 * 60 * 24 * 7;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Automatic memoisation: a keypress in the scene deck no longer re-renders every scene.
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 82, 85],
    // Optimised screenshots are cached for a week (there is no way to purge them early, so not longer).
    minimumCacheTTL: WEEK,
  },
  async headers() {
    return [
      {
        // Footage is immutable: new cuts get new names.
        source: "/video/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // The opening's depth-poster plates are immutable too: new plates get new names.
        source: "/scenes/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Project screenshots keep their names when recaptured: a week, then revalidate in the background.
        source: "/projects/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${WEEK}, stale-while-revalidate=${WEEK * 4}` }],
      },
      {
        source: "/nimbus/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${WEEK}, stale-while-revalidate=${WEEK * 4}` }],
      },
      {
        source: "/resume/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
