import { Metadata } from "next";

// Helper function to format course ID into readable format (e.g., "AALO285" -> "AALO 285")
function formatCourseCode(id: string): string {
    // Match letters followed by numbers
    const match = id.match(/^([A-Z]+)(\d+)$/i);
    if (match) {
        return `${match[1].toUpperCase()} ${match[2]}`;
    }
    return id.toUpperCase();
}

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const courseCode = formatCourseCode(resolvedParams.id);

    return {
        title: `${courseCode} - Aggie Schedule Builder Plus`,
        description: `View details, professors, GPA statistics, and reviews for ${courseCode} at Texas A&M University.`,
    };
}

export default function CourseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
