import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 82, 85],
  },
  // three.js ships ESM that Next should transpile alongside the app.
  transpilePackages: ["three"],
  async headers() {
    return [
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
