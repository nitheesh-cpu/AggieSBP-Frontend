import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse by Department - Aggie Schedule Builder Plus",
  description:
    "Find the easiest courses in any Texas A&M department. Compare professors by easiness score, GPA data, and student ratings.",
};

export default function DiscoverDeptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
