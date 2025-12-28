import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Core Curriculum - Aggie Schedule Builder Plus",
    description: "Discover the easiest core curriculum courses at Texas A&M University. Find high-rated professors and maximize your GPA with data-driven recommendations.",
};

export default function DiscoverUCCLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
