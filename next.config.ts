import type { NextConfig } from "next";

/**
 * Deploy targets
 * - Node host (Render web service, Railway, Fly, Heroku, Vercel, Netlify): `npm run build` then `npm start`.
 * - Docker: the Dockerfile sets BUILD_STANDALONE=1 for a small self-contained server.
 * - Static host (Render static site, Cloudflare Pages, GitHub Pages, S3): `npm run build:static`,
 *   then publish the `out/` folder. Every page is prerendered, so nothing is lost.
 */
const staticExport = process.env.STATIC_EXPORT === "1";
const standalone = process.env.BUILD_STANDALONE === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(staticExport ? { output: "export" as const, trailingSlash: true } : standalone ? { output: "standalone" as const } : {}),
  experimental: {
    // Keep visited and prefetched pages in the client router cache, so going
    // back or re-opening a page is instant instead of a new round trip.
    staleTimes: { dynamic: 60, static: 600 },
  },
  // Static hosts set their own cache headers; next.config headers only apply to a Node server.
  ...(staticExport
    ? {}
    : {
        async headers() {
          return [
            {
              // Every page is statically generated: let browsers and CDNs reuse it.
              source: "/:path((?!_next/).*)",
              headers: [{ key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" }],
            },
          ];
        },
      }),
};

export default nextConfig;
