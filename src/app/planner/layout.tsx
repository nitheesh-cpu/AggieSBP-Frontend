import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule Builder - Aggie Schedule Builder Plus",
  description:
    "Find Texas A&M electives you can actually take and build schedules that fit, easiest first.",
};

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
