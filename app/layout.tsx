import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, Geist_Mono, Manrope } from "next/font/google";
import { Cursor } from "@/components/ui/Cursor";
import { Grain } from "@/components/ui/Grain";
import { Providers } from "@/components/ui/Providers";
import { Nav } from "@/components/navigation/Nav";
import { site } from "@/data/site";
import "./globals.css";

/* Display: a variable grotesk with a width axis, set slightly expanded for headlines. */
const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["wdth"],
  display: "swap",
});

/* Accent italics with optical sizing, used for the editorial words. */
const serif = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

/* Body: neutral, geometric, very legible at small sizes. */
const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: "%s — GLAZY",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Krutik Mhatre",
    "GLAZY",
    "portfolio",
    "full-stack developer",
    "Next.js",
    "React",
    "AI integration",
    "Mumbai",
  ],
  authors: [{ name: "Krutik Mhatre", url: "https://github.com/GlazyKahito" }],
  creator: "Krutik Mhatre",
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only z-[130] rounded bg-bone px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main">{children}</main>
          <Cursor />
          <Grain />
        </Providers>
      </body>
    </html>
  );
}
