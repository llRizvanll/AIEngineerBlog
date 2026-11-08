import { assetByHref } from "@/lib/catalog";
import { REELS } from "@/lib/content";

/** Display title for any page the programme links to. Server-only. */
export function titleFor(href: string): string {
  if (href === "/paths/mobile-principal") return "Mobile principal in two weeks";
  if (href === "/revise") return "Revise cards";
  if (href === "/problem-solving") return "Problem-solving questions";
  if (href.startsWith("/reels/")) {
    const c = REELS.find((r) => r.id === href.slice(7));
    return c ? `${c.title} reels` : "Reels";
  }
  return assetByHref(href)?.title ?? href;
}
