/* The portal's navigation, as data. The shell renders whatever is listed here, so adding a section
   means adding one entry, not editing a component.
   A rail entry is a hub. `match` lists every path prefix that belongs to it, so the rail knows where you are:
   the longest matching prefix wins (/paths/ai-interviews/basics belongs to Practice, not Interview). */

export interface RailEntry {
  id: string;
  label: string;
  /** the hub the entry opens */
  href: string;
  /** an icon name from components/Icons */
  icon: string;
  match: readonly string[];
}

export const RAIL: readonly RailEntry[] = [
  { id: "learn", label: "Learn", href: "/learn", icon: "book", match: ["/learn", "/aiengine", "/modules", "/deep", "/protocols", "/series", "/mobile", "/explore"] },
  { id: "tracks", label: "Tracks", href: "/tracks", icon: "route", match: ["/tracks", "/paths/react-native", "/paths/mobile-principal"] },
  { id: "projects", label: "Projects", href: "/mobile-coding", icon: "code", match: ["/mobile-coding", "/coding"] },
  { id: "practice", label: "Practice", href: "/practice", icon: "target", match: ["/practice", "/revise", "/reels", "/paths/ai-interviews/basics"] },
  { id: "interview", label: "Interview", href: "/interviews", icon: "chat", match: ["/interviews", "/interview", "/paths/ai-interviews", "/problem-solving"] },
  { id: "progress", label: "Progress", href: "/library", icon: "user", match: ["/library"] },
];

/** The links in the landing page's top pill. `anchor` entries jump within the page. */
export const LANDING_LINKS: readonly { label: string; href: string }[] = [
  { label: "Learn", href: "/learn" },
  { label: "Practice", href: "/practice" },
  { label: "Interview", href: "/interviews" },
  { label: "FAQ", href: "#faq" },
];

/** Where the landing page's main button goes. */
export const DASHBOARD_HREF = "/learn";

const matches = (path: string, prefix: string) => path === prefix || path.startsWith(prefix + "/");

/** The rail entry a path belongs to: the one with the longest matching prefix. */
export function railFor(path: string, rail: readonly RailEntry[] = RAIL): RailEntry | undefined {
  let best: { entry: RailEntry; length: number } | undefined;
  for (const entry of rail) {
    for (const prefix of entry.match) {
      if (matches(path, prefix) && (!best || prefix.length > best.length)) best = { entry, length: prefix.length };
    }
  }
  return best?.entry;
}
