import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
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
