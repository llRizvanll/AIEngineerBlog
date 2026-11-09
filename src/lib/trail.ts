import { siteMap } from "./sections";
import { RN_HUB } from "@/content/rn-hub";
import { assetByHref } from "./catalog";
import { titleFor } from "./programme";
import { MOBILE_HREF } from "@/config/constants";

/* Where a page sits: the menu group it belongs to, the hub that lists it, and its place in a reading order.
   Server only. It reads the same site map as the menu, so the trail and the menu can't disagree. */
export interface Trail {
  skill: string;
  hub: { title: string; href: string };
  /** position in a reading order, when the page belongs to one */
  order?: { n: number; total: number; next?: { title: string; href: string } };
}

const RN_ORDER = RN_HUB.flatMap((g) => g.items.map(([href]) => href));

export function trailFor(href: string): Trail | null {
  const groups = siteMap();
  const find = (match: (h: string) => boolean) => {
    for (const g of groups) {
      const it = g.items.filter((i) => match(i.href)).sort((a, b) => b.href.length - a.href.length)[0];
      if (it) return { skill: g.label, hub: { title: it.title, href: it.href } };
    }
    return null;
  };

  const at = RN_ORDER.indexOf(href);
  if (at !== -1) {
    const rn = find((h) => h === "/paths/react-native")!;
    const next = RN_ORDER[at + 1];
    return { ...rn, order: { n: at + 1, total: RN_ORDER.length, next: next ? { title: titleFor(next), href: next } : undefined } };
  }
  // Mobile pages that live in shared sections (modules, rounds) are traced to the mobile skill.
  if (assetByHref(href)?.domain === "mobile-systems") {
    const m = find((h) => h === MOBILE_HREF);
    if (m) return m;
  }
  const hub = find((h) => href === h || href.startsWith(h + "/"));
  // AI topics that live in shared sections (deep dives, rounds) are traced to the AI skill, with the section as the hub.
  const domain = assetByHref(href)?.domain;
  if (hub && domain && domain !== "core-engineering" && /^\/(deep|interview|modules)\//.test(href)) return { ...hub, skill: "AI engineering" };
  return hub;
}
