import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CoursePageClient from "./course-page-client";
import {
  decodeRouteId,
  getCourseDetailServer,
  getTermsServer,
  isApiNotFound,
} from "@/lib/server-api";
import {
  courseCanonicalPath,
  courseDescription,
  courseTitle,
} from "@/lib/seo-metadata";
import { pickDefaultTerm } from "@/lib/terms";

// Rendered per request, never written to the ISR cache (Vercel bills ISR
// writes and the free tier ran out). Vercel's CDN caches the HTML instead,
// via Vercel-CDN-Cache-Control in next.config.ts.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

/** 404 when the API doesn't know the course; other failures throw to error.tsx (non-200). */
async function loadCourse(id: string) {
  try {
    return await getCourseDetailServer(id);
  } catch (err) {
    if (isApiNotFound(err)) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = await loadCourse(id);
  const title = courseTitle(course);
  const description = courseDescription(course);
  const canonical = courseCanonicalPath(course);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const [course, terms] = await Promise.all([loadCourse(id), getTermsServer()]);

  return (
    <CoursePageClient
      id={decodeRouteId(id)}
      initialCourse={course}
      initialTerms={terms}
      initialSelectedTerm={terms ? pickDefaultTerm(terms) : ""}
    />
  );
}
