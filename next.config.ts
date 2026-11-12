import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
  async redirects() {
    return [
      { source: "/courses/compare", destination: "/compare", permanent: true },
    ];
  },
};

export default nextConfig;
