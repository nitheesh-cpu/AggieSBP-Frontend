import type { Metadata, Viewport } from "next";
import { Partytown } from "@qwik.dev/partytown/react";
import "./globals.css";
import { SupertokensProvider } from "@/components/providers/SupertokensProvider";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { ProfessorComparisonProvider } from "@/contexts/ProfessorComparisonContext";
import { ThemeProvider } from "@/components/theme-provider";
import { IBM_Plex_Mono, Press_Start_2P } from "next/font/google";
import { SWRegister } from "@/components/sw-register";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-press-start-2p",
});

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Aggie Schedule Builder Plus - A&M Course Planner",
  description:
    "The fastest way to choose the right Texas A&M courses. Compare course difficulty, workload, and professor quality in one elegant dashboard.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={pressStart2P.variable}>
      <head>
        <Partytown debug={true} forward={["dataLayer.push"]} />
        <meta
          name="apple-mobile-web-app-title"
          content="AggieSB+"
        />
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
        <script
          async
          type="text/partytown"
          src="https://www.googletagmanager.com/gtag/js?id=G-Q61ZEHN416"
        />
        <script
          type="text/partytown"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-Q61ZEHN416');
            `,
          }}
        />
      </head>
      <body className={`${ibmPlexMono.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ComparisonProvider>
            <ProfessorComparisonProvider>
              <SupertokensProvider>{children}</SupertokensProvider>
            </ProfessorComparisonProvider>
          </ComparisonProvider>
        </ThemeProvider>
        <SWRegister />
      </body>
    </html>
  );
}
