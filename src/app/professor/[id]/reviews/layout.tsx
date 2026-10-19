import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
};

// The reviews page is its own URL in the sitemap; without this it would inherit
// the parent layout's canonical (/professor/[id]) and be treated as a duplicate.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    return {
        alternates: { canonical: `/professor/${resolvedParams.id}/reviews` },
    };
}

export default function ProfessorReviewsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
