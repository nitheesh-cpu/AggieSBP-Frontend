import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Seat Alerts for Texas A&M – AggieSB+",
  description:
    "Get notified the moment a seat opens in a full Texas A&M class. Watch the exact section you need and AggieSB+ sends a phone or browser notification when it opens.",
};

export default function AlertsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
