import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Texas A&M Departments: Course GPAs & Professors | AggieSB+",
    description:
        "Browse every Texas A&M department. See each course's average GPA and the professors who teach it.",
};

export default function DepartmentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
