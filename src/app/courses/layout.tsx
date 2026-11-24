import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Texas A&M Courses: GPA, Professors & Reviews | AggieSB+",
    description:
        "Search every Texas A&M course by code or name. See average GPA, grade distributions by professor and student reviews before you register.",
    alternates: { canonical: "/courses" },
};

export default function CoursesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
