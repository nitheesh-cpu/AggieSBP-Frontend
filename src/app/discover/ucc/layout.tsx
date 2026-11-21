import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Easiest Core Curriculum Classes at Texas A&M | AggieSB+",
    description:
        "Find the easiest classes for each Texas A&M core curriculum category, ranked by easiness score, with the professors who teach them.",
};

export default function DiscoverUCCLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
