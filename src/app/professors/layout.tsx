import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Professors - Aggie Schedule Builder Plus",
    description: "Find and compare professors at Texas A&M University. Read AI-powered review insights, view ratings, and discover the best instructors.",
};

export default function ProfessorsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
