import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Texas A&M Professor Ratings, Reviews & Grades | AggieSB+",
    description:
        "Look up any Texas A&M professor: student ratings, would-take-again percent, grade distributions and AI summaries of what students say.",
};

export default function ProfessorsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
