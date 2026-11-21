import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Compare Texas A&M Courses & Professors | AggieSB+",
    description:
        "Put up to 4 Texas A&M courses or professors side by side: average GPA, ratings, reviews and grade distributions.",
};

export default function CompareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
