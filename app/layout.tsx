import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Cursor } from "@/components/ui/Cursor";
import { LagWatch } from "@/components/ui/LagWatch";
import { LazyNimbus } from "@/components/ui/LazyNimbus";
import { Providers } from "@/components/ui/Providers";
import { Header } from "@/components/navigation/Header";
import { site } from "@/data/site";
import "./globals.css";

/*
 * Display: Instrument Serif — a condensed, high-contrast serif with a true
 * italic; it reads like a film title at poster sizes. One weight only, so
 * headings never get a synthesised bold (see globals.css).
 * Body: Geist. Labels and data: Geist Mono. All SIL Open Font License.
 */
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Geist({
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
    "web agency",
    "freelance web developer",
    "SaaS development",
    "web design agency",
    "website development",
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
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  alternates: { canonical: "/" },
  // Search engine ownership tokens (public by design; they appear in the page head).
  verification: {
    ...(site.verification.google ? { google: site.verification.google } : {}),
    ...(site.verification.bing ? { other: { "msvalidate.01": site.verification.bing } } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#060505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Lite mode is applied before the first paint, so a weak machine never starts on the heavy version.
            So is deck mode on the home page (no scrollbar gutter that vanishes on hydration). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('glazy:lite')==='1')document.documentElement.dataset.lite='true'}catch(e){}if(location.pathname==='/')document.documentElement.classList.add('deck-mode')",
          }}
        />
        <Providers>
          <a
            href="#main"
            className="sr-only z-[130] rounded bg-bone px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" className="relative z-[1]">
            {children}
          </main>
          <Cursor />
          <LagWatch />
          <LazyNimbus />
        </Providers>
      </body>
    </html>
  );
}
