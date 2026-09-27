import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: the "G" of the wordmark on obsidian. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050506",
          borderRadius: 14,
        }}
      >
        <svg width="44" height="44" viewBox="-2 -2 64 84" fill="none">
          <path
            d="M50 23 A26 26 0 1 0 50 57 L50 41 L36 41"
            stroke="#f5f5f7"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
