import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Compare - Aggie Schedule Builder Plus",
    description: "Compare courses and professors side-by-side at Texas A&M University. Make informed decisions about your schedule with detailed statistics.",
};

export default function CompareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
