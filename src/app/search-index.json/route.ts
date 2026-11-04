import { buildSearchIndex } from "@/lib/search";

/* Built once at build time and served as a static, cacheable file. */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
