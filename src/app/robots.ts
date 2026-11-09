import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { AI_CRAWLERS, SITE_URL } from "@/config/constants";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml").replace(/\/$/, ""),
    host: SITE_URL,
  };
}
