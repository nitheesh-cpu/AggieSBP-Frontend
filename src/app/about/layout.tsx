import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About AggieSB+: Unofficial Texas A&M Schedule Companion",
    description:
        "AggieSB+ is a student-built, unofficial companion to Aggie Schedule Builder with grade distributions, professor ratings and seat alerts. Not affiliated with Texas A&M.",
    alternates: { canonical: "/about" },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
