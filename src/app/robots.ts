import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/site";

/* Named so the intent is plain: search engines and AI crawlers are all welcome here. */
const AI_CRAWLERS = [
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
