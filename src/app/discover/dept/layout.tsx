import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Easiest Courses in Any Texas A&M Department | AggieSB+",
  description:
    "Pick a Texas A&M department and see its courses ranked by easiness, with professor ratings and GPA data for each.",
};

export default function DiscoverDeptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
