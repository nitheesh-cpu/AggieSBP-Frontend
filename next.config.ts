import type { NextConfig } from "next";

// First-party Umami proxy, off unless NEXT_PUBLIC_UMAMI_PROXY=1 at build time.
// Keep in step with UMAMI_ORIGIN / UMAMI_PROXY_PATH in src/lib/analytics.ts.
// Only the paths the tracker (n.js) and recorder (recorder.js) use are
// forwarded, so the Umami dashboard isn't reachable through this site.
const UMAMI_PROXY = process.env.NEXT_PUBLIC_UMAMI_PROXY === "1";
const UMAMI_ORIGIN = "https://stats.nitheeshk.com";
const UMAMI_PROXY_PATHS = [
  "/n.js",
  "/recorder.js",
  "/api/n",
  "/api/record",
  "/api/websites/:websiteId/recorder",
];

const CDN_CACHE = "max-age=604800, stale-while-revalidate=2592000";

const nextConfig: NextConfig = {
  // Self-hosted on the backend VM: the deploy script copies the standalone
  // server into a release folder (D-050). Vercel builds still work with it.
  output: "standalone",
  async rewrites() {
    if (!UMAMI_PROXY) return [];
    return UMAMI_PROXY_PATHS.map((path) => ({
      source: `/a${path}`,
      destination: `${UMAMI_ORIGIN}${path}`,
    }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Block framing except by our own pages and Umami, whose heatmaps
          // draw the live page in an iframe. X-Frame-Options can't allowlist
          // an origin, so frame-ancestors replaces it.
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://stats.nitheeshk.com",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: "script-src 'self' https://stats.nitheeshk.com; object-src 'none'; base-uri 'self'",
          },
        ],
      },
      // Pages are force-dynamic (no ISR writes); the CDN caches the HTML.
      // Each CDN reads only its own header, and neither is overwritten by
      // Next's private Cache-Control for dynamic routes, so browsers still
      // revalidate. 7 days, because crawlers walk every page (D-048).
      // Cloudflare also needs a Cache Rule that makes these paths eligible
      // and bypasses requests with an `rsc` header (D-050).
      // After a data fix, purge the CDN cache in Vercel or Cloudflare.
      ...["/:section(course|professor|departments)/:path+", "/browse"].map((source) => ({
        source,
        headers: [
          { key: "Vercel-CDN-Cache-Control", value: CDN_CACHE },
          { key: "Cloudflare-CDN-Cache-Control", value: CDN_CACHE },
        ],
      })),
    ];
  },
  async redirects() {
    return [
      { source: "/courses/compare", destination: "/compare", permanent: true },
      // The registrar renamed PSYC to PBSI; old links still point at PSYC.
      { source: "/course/PSYC:num(\\d+)", destination: "/course/PBSI:num", permanent: true },
      { source: "/course/psyc:num(\\d+)", destination: "/course/PBSI:num", permanent: true },
    ];
  },
};

export default nextConfig;
