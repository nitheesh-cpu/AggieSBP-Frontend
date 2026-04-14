import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Schedule Fit - Aggie Schedule Builder Plus",
  description:
    "Find classes that fit your current schedule by core curriculum category or department.",
};

export default function DiscoverFitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
