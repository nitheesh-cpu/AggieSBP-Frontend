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

// Server-rendered so crawlers get the real course in the HTML; regenerated at
// most weekly. No paths are built ahead of time: each is rendered on its first
// visit and cached.
export const revalidate = 604800;

// generateStaticParams() returning [] with dynamicParams makes every id an
// on-demand ISR page: rendered on its first visit, then cached. dynamicParams
// is set explicitly: without it, Next 16.2 (next dev) 404ed every id here.
export const dynamicParams = true;

export function generateStaticParams(): Array<{ id: string }> {
  return [];
}

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
