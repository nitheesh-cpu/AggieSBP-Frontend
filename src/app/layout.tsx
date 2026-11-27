import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SupertokensProvider } from "@/components/providers/SupertokensProvider";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { ProfessorComparisonProvider } from "@/contexts/ProfessorComparisonContext";
import { ThemeProvider } from "@/components/theme-provider";
import localFont from "next/font/local";
import { SWRegister } from "@/components/sw-register";
import { UmamiRecorder } from "@/components/umami-recorder";
import { AnalyticsSessionTags } from "@/components/analytics-session-tags";
import { SITE_URL } from "@/lib/site-url";
import { UMAMI_BASE } from "@/lib/analytics";
import { UMAMI_BEFORE_SEND_SCRIPT } from "@/lib/umami-before-send";

// Fonts are committed (latin subset, OFL, from Fontsource) instead of
// next/font/google, which downloads them during every build and kept failing
// VM builds (G-046).
const ibmPlexSans = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-plex-sans",
});

const ibmPlexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
  variable: "--font-plex-mono",
});

const pressStart2P = localFont({
  src: "./fonts/press-start-2p-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-press-start-2p",
});

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#500000" },
    { media: "(prefers-color-scheme: dark)", color: "#5c0f1e" },
  ],
};

export const metadata: Metadata = {
  // Resolves relative canonical/OpenGraph URLs against the production origin
  metadataBase: new URL(SITE_URL),
  title: "Aggie Schedule Builder Plus: TAMU Professor Grades & Ratings",
  description:
    "Unofficial companion to Texas A&M's Aggie Schedule Builder. Grade distributions, professor ratings and reviews, and seat alerts for full classes.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    title: "AggieSB+",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${pressStart2P.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        <link
          rel="apple-touch-icon"
          href="/icon-192x192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icon-180x180.png"
        />
        {/* The extension's Howdy import arrives as #howdy=<courses and
            grades>. Move it to sessionStorage and drop it from the URL before
            any tracker or session replay can record the address. The planner
            reads it back from HOWDY_HASH_KEY. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var h=location.hash;if(h.indexOf("#howdy=")===0){sessionStorage.setItem("aggiesbp:planner:howdy-hash",h);history.replaceState(history.state,"",location.pathname+location.search)}}catch(e){}`,
          }}
        />
        {/* Sign-in callbacks (/auth/callback/google?code=...) carry one-time
            OAuth codes in the query; drop it from the URL and referrer
            before Umami sends anything. The hook also cancels /admin
            events and plain pageviews on the callback (see the lib file). */}
        <script
          dangerouslySetInnerHTML={{
            __html: UMAMI_BEFORE_SEND_SCRIPT,
          }}
        />
        {/* Umami (self-hosted). Only counts the production host, so local
            and preview deploys stay out of the stats. Loads through the
            same-origin proxy when NEXT_PUBLIC_UMAMI_PROXY=1 (see
            UMAMI_BASE); it then also sends events through it. */}
        <script
          defer
          src={`${UMAMI_BASE}/n.js`}
          data-website-id="7efa90af-63b9-4c90-9287-510bd8e41d2e"
          data-domains={new URL(SITE_URL).hostname}
          data-exclude-hash="true"
          data-before-send="umamiBeforeSend"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ComparisonProvider>
            <ProfessorComparisonProvider>
              <SupertokensProvider>
                {children}
                <AnalyticsSessionTags />
              </SupertokensProvider>
            </ProfessorComparisonProvider>
          </ComparisonProvider>
        </ThemeProvider>
        <SWRegister />
        <UmamiRecorder host={new URL(SITE_URL).hostname} />
      </body>
    </html>
  );
}
