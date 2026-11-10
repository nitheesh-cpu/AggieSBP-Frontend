import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SupertokensProvider } from "@/components/providers/SupertokensProvider";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { ProfessorComparisonProvider } from "@/contexts/ProfessorComparisonContext";
import { ThemeProvider } from "@/components/theme-provider";
import { IBM_Plex_Mono, IBM_Plex_Sans, Press_Start_2P } from "next/font/google";
import { SWRegister } from "@/components/sw-register";
import { UmamiRecorder } from "@/components/umami-recorder";
import { AnalyticsSessionTags } from "@/components/analytics-session-tags";
import { SITE_URL } from "@/lib/site-url";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
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
  title: "Aggie Schedule Builder Plus - A&M Course Planner",
  description:
    "The fastest way to choose the right Texas A&M courses. Compare course difficulty, workload, and professor quality side by side.",
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
        {/* Umami (self-hosted). Only counts the production host, so local
            and preview deploys stay out of the stats. */}
        <script
          defer
          src="https://stats.nitheeshk.com/n.js"
          data-website-id="7efa90af-63b9-4c90-9287-510bd8e41d2e"
          data-domains={new URL(SITE_URL).hostname}
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
