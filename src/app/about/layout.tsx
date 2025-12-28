import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About - Aggie Schedule Builder Plus",
    description: "Learn about Aggie Schedule Builder Plus, the ultimate course planning and professor discovery tool for Texas A&M University students.",
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
