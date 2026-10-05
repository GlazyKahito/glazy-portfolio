import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";
import { site } from "@/data/site";
import { palette } from "@/lib/palette";

export const alt = "GLAZY — a freelance web and SaaS agency by Krutik Mhatre";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LETTERS = [
  { d: "M50 23 A26 26 0 1 0 50 57 L50 41 L36 41", x: 0 },
  { d: "M6 8 L6 72 L50 72", x: 76 },
  { d: "M4 72 L30 8 L56 72 M15 48 L45 48", x: 152 },
  { d: "M6 8 L54 8 L6 72 L54 72", x: 228 },
  { d: "M6 8 L30 40 L54 8 M30 40 L30 72", x: 304 },
];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: `linear-gradient(160deg, ${palette.ink} 0%, ${palette.duskMid} 55%, ${palette.dusk} 100%)`,
          color: palette.bone,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4, color: palette.bone2 }}>
          <span>FREELANCE WEB &amp; SAAS AGENCY · EST. {site.founded}</span>
          <span>{profile.location.toUpperCase()}</span>
        </div>
        <svg width="760" height="167" viewBox="-6 -6 376 92" fill="none">
          {LETTERS.map((l, i) => (
            <path
              key={i}
              d={l.d}
              transform={`translate(${l.x} 0)`}
              stroke={palette.bone}
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 34, color: palette.bone }}>{site.tagline.charAt(0).toUpperCase() + site.tagline.slice(1)}</span>
          <span style={{ fontSize: 22, letterSpacing: 4, color: palette.ember }}>FOUNDED BY {profile.name.toUpperCase()}</span>
        </div>
      </div>
    ),
    size,
  );
}
