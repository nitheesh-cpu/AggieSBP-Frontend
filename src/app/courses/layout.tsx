import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Courses - Aggie Schedule Builder Plus",
    description: "Search and explore all courses at Texas A&M University. View professor ratings, GPA statistics, and find the best sections for your schedule.",
};

export default function CoursesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
