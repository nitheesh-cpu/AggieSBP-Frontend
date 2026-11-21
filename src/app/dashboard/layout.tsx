import type { Metadata } from "next";

// /dashboard is a client page, so its metadata lives here. Without it the page
// inherited the root default and Google showed a stale, image-derived title.
export const metadata: Metadata = {
  title: "AggieSB+ Tools: Course Search, Compare, Seat Alerts & More",
  description:
    "Everything in AggieSB+ in one place: course and professor search, compare, seat alerts, Fit My Schedule and the Schedule Builder for Texas A&M.",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
