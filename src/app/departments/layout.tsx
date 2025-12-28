import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Departments - Aggie Schedule Builder Plus",
    description: "Browse all academic departments at Texas A&M University. Find courses, professors, and GPA statistics for each department.",
};

export default function DepartmentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
