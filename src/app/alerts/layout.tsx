import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seat Alerts | AggieSB+",
  description:
    "Get notified when a closed Texas A&M course section opens. Learn how AggieSB+ Seat Alerts work and set up your first alert.",
};

export default function AlertsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
