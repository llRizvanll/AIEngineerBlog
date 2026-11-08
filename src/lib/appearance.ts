/* Appearance options shared by the settings panel and the no-flash boot script. */

export const PALETTES = [
  { id: "aurora", name: "Inside-out", a: "#ff5a1f", b: "#c2410c" },
  { id: "ocean", name: "Ocean", a: "#2563eb", b: "#06b6d4" },
  { id: "sunset", name: "Sunset", a: "#ea580c", b: "#e11d48" },
  { id: "forest", name: "Forest", a: "#047857", b: "#65a30d" },
  { id: "berry", name: "Berry", a: "#9333ea", b: "#db2777" },
  { id: "citrus", name: "Citrus", a: "#ca8a04", b: "#f97316" },
  { id: "graphite", name: "Graphite", a: "#334155", b: "#64748b" },
] as const;

export const UI_FONTS = [
  { id: "figtree", name: "Figtree", v: "--ff-figtree" },
  { id: "geist", name: "Geist", v: "--ff-geist" },
  { id: "inter", name: "Inter", v: "--ff-inter" },
  { id: "jakarta", name: "Plus Jakarta", v: "--ff-jakarta" },
  { id: "grotesk", name: "Space Grotesk", v: "--ff-grotesk" },
  { id: "manrope", name: "Manrope", v: "--ff-manrope" },
  { id: "plex", name: "IBM Plex Sans", v: "--ff-plex" },
] as const;

export const READ_FONTS = [
  { id: "sourceserif", name: "Source Serif", v: "--ff-sourceserif" },
  { id: "lora", name: "Lora", v: "--ff-lora" },
  { id: "literata", name: "Literata", v: "--ff-literata" },
  { id: "sans", name: "Same as UI", v: "--f-sans" },
] as const;

export const CODE_FONTS = [
  { id: "jetbrains", name: "JetBrains Mono", v: "--ff-jetbrains" },
  { id: "geistmono", name: "Geist Mono", v: "--ff-geistmono" },
  { id: "fira", name: "Fira Code", v: "--ff-fira" },
  { id: "plexmono", name: "IBM Plex Mono", v: "--ff-plexmono" },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];
export type UiFontId = (typeof UI_FONTS)[number]["id"];
export type ReadFontId = (typeof READ_FONTS)[number]["id"];
export type CodeFontId = (typeof CODE_FONTS)[number]["id"];
