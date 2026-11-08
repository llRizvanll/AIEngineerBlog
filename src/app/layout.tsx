import type { Metadata, Viewport } from "next";
import Script from "next/script";
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Figtree,
  Fira_Code,
  Fraunces,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Literata,
  Lora,
  Manrope,
  Plus_Jakarta_Sans,
  Source_Serif_4,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import "./portal.css";
import "./theme.css";
import "./insideout.css";
import { Chrome } from "@/components/AppShell";
import { SearchPalette } from "@/components/SearchPalette";
import { TabBar } from "@/components/TabBar";
import { HashRedirect } from "@/components/HashRedirect";
import { NavProgress } from "@/components/NavProgress";
import { siteMap } from "@/lib/sections";
import { prefsBootScript } from "@/components/Settings";
import { SITE } from "@/lib/content";
import { Analytics } from "@/components/Analytics";
import { SITE_URL } from "@/lib/site";

// Defaults preload; alternates download only when a reader picks them in settings.
const geist = Geist({ subsets: ["latin"], variable: "--ff-geist", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--f-serif", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"], variable: "--ff-sourceserif", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--ff-geistmono", display: "swap" });
const inter = Inter({ subsets: ["latin"], display: "swap", preload: false, variable: "--ff-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--ff-jakarta" });
const grotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", preload: false, variable: "--ff-grotesk" });
const manrope = Manrope({ subsets: ["latin"], display: "swap", preload: false, variable: "--ff-manrope" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "500", "600", "700"], variable: "--ff-plex" });
const lora = Lora({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--ff-lora" });
const literata = Literata({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--ff-literata" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], display: "swap", preload: false, variable: "--ff-jetbrains" });
const fira = Fira_Code({ subsets: ["latin"], display: "swap", preload: false, variable: "--ff-fira" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "500", "600"], variable: "--ff-plexmono" });
const figtree = Figtree({ subsets: ["latin"], display: "swap", variable: "--ff-figtree" });
const fraunces = Fraunces({ subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"], display: "swap", variable: "--ff-fraunces" });
const fontVars = [figtree, fraunces, geist, serif, sourceSerif, geistMono, inter, jakarta, grotesk, manrope, plex, lora, literata, jetbrains, fira, plexMono]
  .map((f) => f.variable)
  .join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.seoTitle, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author }],
  keywords: ["AI engineering", "AI blog", "AI interview preparation", "AI engineer interview questions", "AI-enabled coding interview", "LLM", "RAG", "AI agents", "LLM evals", "system design", "mobile system design", "machine coding"],
  // "./" resolves to each page's own address, which gives every page one canonical URL.
  alternates: { canonical: "./", types: { "text/plain": "/llms.txt" } },
  openGraph: { title: SITE.seoTitle, description: SITE.description, type: "website", siteName: SITE.name, url: "./", locale: "en", images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.seoTitle }] },
  twitter: { card: "summary_large_image", title: SITE.seoTitle, description: SITE.description, images: ["/og.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } } : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1efea" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body>
        <Script id="prefs-boot" strategy="beforeInteractive">
          {prefsBootScript}
        </Script>
        <NavProgress />
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Chrome groups={siteMap()} />
        <div id="main">{children}</div>
        <TabBar />
        <SearchPalette />
        <HashRedirect />
        <Analytics />
      </body>
    </html>
  );
}
