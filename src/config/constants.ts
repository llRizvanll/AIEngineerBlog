/* Every fixed value the code relies on: limits, orders, option lists, colours, hosts and patterns.
   No prose and no page content lives here (that is in src/content), and nothing here imports from other layers. */

export const CATALOG_PAGE_SIZE = 48;

export const CATALOG_FILTER_KEYS = ["domain", "mode", "format", "complexityTier", "cognitiveLevel", "durationCategory"] as const;

export const FORMAT_ORDER = ["long-read", "deep-dive", "protocol", "coding-pattern", "machine-coding", "system-design", "behavioral", "flashcard", "reel"];

export const TIER_ORDER = ["tier1-epitome", "tier2-intermediate", "tier3-edge-cases"];

export const THEMES = ["system", "light", "sepia", "dark"] as const;

/** A link that's too long gets cut off or refused, so long pages travel by clipboard and the link carries a short prompt. */
export const STUDY_MAX_LINK = 6000;

export const ANALYTICS_GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const ANALYTICS_PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/** Hosts that send readers from an AI answer. Counting them shows whether LLMs are citing the site. */
export const AI_REFERRERS: [RegExp, string][] = [
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, "chatgpt"],
  [/(^|\.)claude\.ai$/, "claude"],
  [/(^|\.)perplexity\.ai$/, "perplexity"],
  [/(^|\.)gemini\.google\.com$/, "gemini"],
  [/(^|\.)copilot\.microsoft\.com$/, "copilot"],
  [/(^|\.)deepseek\.com$/, "deepseek"],
  [/(^|\.)you\.com$/, "you"],
  [/(^|\.)phind\.com$/, "phind"],
];

export const CODE_EXT_LANG: Record<string, string> = { kt: "kotlin", ts: "ts", py: "python", sbatch: "bash" };

export const SEARCH_KIND_ORDER = ["Page", "Post", "Round", "Pattern", "Problem", "Mobile", "Behavioral", "Deep dive", "Protocol", "Reels", "Term"];

export const CURRICULUM_ICONS = ["layers", "book", "network", "bolt", "spark", "chat", "code", "board", "cards", "target", "compass", "play", "grid"];

export const LEGACY_HASH = /^(background-sync|post-|case-|deep-|proto-|reels|interview$|revise$|aiengine$|protocols$|library$|home$)/;

export const PROMPT_LEVELS = ["Junior", "Mid-level", "Senior", "Staff or principal"];

export const PROMPT_MINUTES = [15, 30, 45, 60];

export const SRS_DAYS = [0, 1, 3, 7, 14, 30, 60];

export const DAY_MS = 86_400_000;

export const REEL_CODE_WINDOW = 24;

export const MARKDOWN_SKIP_SELECTORS = "script,style,noscript,svg,canvas,button,input,select,textarea,nav,aside,footer,form,.ed-bar,.ed-status,.sa,.pg-cont,.dp-done,.bs-modes,.pb,.asset-meta,.round-l,.round-bar,.round-r,.pm,[data-md-skip],[aria-hidden='true']";

export const SQL_KW = new Set(
  (
    "select from where and or not insert into values update set delete create table index unique primary key references on conflict do " +
    "nothing returning join left right inner outer group by order having limit offset as is null default integer text blob real boolean " +
    "begin commit rollback transaction pragma if exists alter add column drop view trigger for each row without rowid using virtual " +
    "fts5 match desc asc distinct case when then else end union all count max min sum coalesce check foreign constraint serial bigint " +
    "timestamptz timestamp varchar jsonb uuid partition range with recursive lateral returning now interval cascade"
  ).split(" ")
);

export const LANG_EXTENSION: Record<string, string> = {
  kotlin: "kt", java: "java", swift: "swift", ts: "ts", tsx: "tsx", js: "js", sql: "sql", python: "py", json: "json", yaml: "yaml",
  http: "http", bash: "sh", markdown: "md", text: "txt",
};

export const LANG_NAME: Record<string, string> = {
  kotlin: "Kotlin", java: "Java", swift: "Swift", ts: "TypeScript", tsx: "TypeScript JSX", js: "JavaScript", sql: "SQL", python: "Python",
  json: "JSON", yaml: "YAML", http: "HTTP", bash: "Shell", markdown: "Markdown", text: "Plain text",
};

export const CODE_DIRS: Record<"programme" | "modules" | "protocols" | "interview", string> = {
  programme: "src/content/programme/code",
  modules: "src/content/modules/code",
  protocols: "src/content/protocol-code",
  interview: "src/content/ai-interviews/code",
};

/**
 * The public address of the site. Set NEXT_PUBLIC_SITE_URL once you have a custom domain.
 * Until then, Render provides RENDER_EXTERNAL_URL during the build.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000").replace(/\/+$/, "");

/* Named so the intent is plain: search engines and AI crawlers are all welcome here. */
export const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Meta-ExternalAgent",
  "CCBot",
  "cohere-ai",
  "DuckAssistBot",
  "MistralAI-User",
];

export const ART_INK = "#1d1c1a";

export const ART_OR = "#ff5a1f";

export const ART_CREAM = "#fcfbf8";

export const ART_SAND = "#efeadd";

export const ART_SHADOW = { filter: "drop-shadow(0 12px 12px rgba(60, 48, 30, 0.22))" } as const;

export const PROGRAMME_HREF = "/paths/mobile-principal";

export const AI_PATHS_HREF = "/paths/ai-interviews";

export const AI_BASICS_HREF = `${AI_PATHS_HREF}/basics`;

/** Every mobile page across modules, rounds and exercises, as a filtered catalog view. */
export const MOBILE_HREF = "/explore?domain=mobile-systems";

export const RN_PATH_HREF = "/paths/react-native";

/** Each post gets its own palette, so the series never feels like one flat colour. */
export const POST_PALETTE: Record<string, [string, string, string]> = {
  "background-sync": ["#f4d6c6", "#efc1a8", "#fff0e6"],
  sqlite: ["#cfe0ec", "#b9d0e4", "#eef5fa"],
  conflicts: ["#efd9a6", "#e8c987", "#fbf1d4"],
  uploads: ["#cfe5d5", "#b6d7c1", "#eef7f0"],
  rn: ["#dcd3ec", "#c8bce3", "#f1edf8"],
  backend: ["#ecc9cf", "#e0b0b9", "#f8e9ec"],
  interview: ["#c9e3df", "#b1d6d0", "#e9f5f3"],
};

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

export interface Tool {
  id: string;
  name: string;
  open: string;
  /** builds a link that prefills the prompt. Tools without one get the prompt on the clipboard instead. */
  prefill?: (q: string) => string;
}

/* Prefill links are undocumented conventions that tools may change, so the full prompt is always copied too. */
export const STUDY_TOOLS_MAIN: Tool[] = [
  { id: "claude", name: "Claude", open: "https://claude.ai/new", prefill: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
  { id: "chatgpt", name: "ChatGPT", open: "https://chatgpt.com/", prefill: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
  { id: "gemini", name: "Gemini", open: "https://gemini.google.com/app" },
  { id: "perplexity", name: "Perplexity", open: "https://www.perplexity.ai/", prefill: (q) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}` },
];

export const STUDY_TOOLS_OTHER: Tool[] = [
  { id: "copilot", name: "Copilot", open: "https://copilot.microsoft.com/" },
  { id: "grok", name: "Grok", open: "https://grok.com/" },
  { id: "deepseek", name: "DeepSeek", open: "https://chat.deepseek.com/" },
  { id: "mistral", name: "Le Chat", open: "https://chat.mistral.ai/chat" },
];
