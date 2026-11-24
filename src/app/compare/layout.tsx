import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Compare Texas A&M Courses & Professors | AggieSB+",
    description:
        "Put up to 4 Texas A&M courses or professors side by side: average GPA, ratings, reviews and grade distributions.",
    alternates: { canonical: "/compare" },
};

export default function CompareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
