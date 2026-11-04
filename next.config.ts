import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Keep visited and prefetched pages in the client router cache, so going
    // back or re-opening a page is instant instead of a new round trip.
    staleTimes: { dynamic: 60, static: 600 },
  },
  async headers() {
    return [
      {
        // Every page is statically generated: let browsers and CDNs reuse it.
        source: "/:path((?!_next/).*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
