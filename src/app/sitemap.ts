import type { MetadataRoute } from "next";
import { buildSearchIndex } from "@/lib/search";
import { absoluteUrl } from "@/lib/site";

/** Every real page once. Links with # or ? point inside a page, and the library is personal to each reader. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set(["/", "/explore", "/series"]);
  for (const { href } of buildSearchIndex()) {
    if (!/[?#]/.test(href) && href !== "/library") paths.add(href);
  }
  return [...paths].sort().map((p) => ({
    url: absoluteUrl(p),
    priority: p === "/" ? 1 : p.startsWith("/paths/") ? 0.9 : 0.7,
  }));
}
