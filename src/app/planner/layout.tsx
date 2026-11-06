import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Degree Planner - Aggie Schedule Builder Plus",
  description:
    "Track the classes you've taken and check which Texas A&M courses you meet the prerequisites for.",
};

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
