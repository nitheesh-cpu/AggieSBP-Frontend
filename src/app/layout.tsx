import type { Metadata } from "next";
import "./globals.css";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { ProfessorComparisonProvider } from "@/contexts/ProfessorComparisonContext";
import { ThemeProvider } from "@/components/theme-provider";
import { IBM_Plex_Mono, Press_Start_2P } from "next/font/google";

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

export const metadata: Metadata = {
  title: "Aggie Schedule Builder Plus - A&M Course Planner",
  description:
    "The fastest way to choose the right Texas A&M courses. Compare course difficulty, workload, and professor quality in one elegant dashboard.",
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
      <body className={`${ibmPlexMono.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ComparisonProvider>
            <ProfessorComparisonProvider>
              {children}
            </ProfessorComparisonProvider>
          </ComparisonProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
