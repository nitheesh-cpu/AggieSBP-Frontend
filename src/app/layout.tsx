import type { Metadata } from "next";
import "./globals.css";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { ProfessorComparisonProvider } from "@/contexts/ProfessorComparisonContext";

export const metadata: Metadata = {
  title: "AggieSB+ - Compare Texas A&M Professors",
  description:
    "The fastest way to choose the right Texas A&M professor. Compare teaching quality, research impact, and course workload in one elegant dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ComparisonProvider>
          <ProfessorComparisonProvider>{children}</ProfessorComparisonProvider>
        </ComparisonProvider>
      </body>
    </html>
  );
}
