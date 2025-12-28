import { Metadata } from "next";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

type Props = {
    params: Promise<{ id: string }>;
};

async function getProfessorName(professorId: string): Promise<string | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/professor/${professorId}`, {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data?.name || null;
    } catch (error) {
        console.error("Failed to fetch professor name for metadata:", error);
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const professorName = await getProfessorName(resolvedParams.id);

    if (professorName) {
        return {
            title: `${professorName} - Aggie Schedule Builder Plus`,
            description: `View ratings, reviews, and course information for ${professorName} at Texas A&M University.`,
        };
    }

    // Fallback if we can't get the name
    return {
        title: "Professor - Aggie Schedule Builder Plus",
        description: "View professor ratings, reviews, and course information at Texas A&M University.",
    };
}

export default function ProfessorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
