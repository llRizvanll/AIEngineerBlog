import type { Metadata, Viewport } from "next";
import Script from "next/script";
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Fira_Code,
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
import { Masthead } from "@/components/Masthead";
import { SearchPalette } from "@/components/SearchPalette";
import { TabBar } from "@/components/TabBar";
import { HashRedirect } from "@/components/HashRedirect";
import { NavProgress } from "@/components/NavProgress";
import { prefsBootScript } from "@/components/Settings";
import { SITE } from "@/lib/content";

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
const fontVars = [geist, serif, sourceSerif, geistMono, inter, jakarta, grotesk, manrope, plex, lora, literata, jetbrains, fira, plexMono]
  .map((f) => f.variable)
  .join(" ");

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
  authors: [{ name: SITE.author }],
  openGraph: { title: SITE.name, description: SITE.description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#07070f" },
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
        <Masthead />
        <div id="main">{children}</div>
        <TabBar />
        <SearchPalette />
        <HashRedirect />
      </body>
    </html>
  );
}
