import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProfessorReviewsPageClient from "./reviews-page-client";
import {
  getProfessorReviewsFirstPageServer,
  getProfessorServer,
  isApiNotFound,
} from "@/lib/server-api";
import {
  professorCanonicalPath,
  professorReviewsDescription,
  professorReviewsTitle,
} from "@/lib/seo-metadata";

// Rendered per request, never written to the ISR cache (Vercel bills ISR
// writes and the free tier ran out). Vercel's CDN caches the HTML instead,
// via Vercel-CDN-Cache-Control in next.config.ts.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type Props = {
  params: Promise<{ id: string }>;
};

/** 404 when the API doesn't know the id; other failures throw to error.tsx (non-200). */
async function load<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    if (isApiNotFound(err)) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const professor = await load(getProfessorServer(id));
  const title = professorReviewsTitle(professor);
  const description = professorReviewsDescription(professor);
  // The reviews page is its own URL in the sitemap, so it is canonical to
  // itself (not to the profile), under the id the API returns so a merged
  // duplicate's alias URL points at the surviving profile's reviews.
  const canonical = `${professorCanonicalPath(professor)}/reviews`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

export default async function ProfessorReviewsPage({ params }: Props) {
  const { id } = await params;
  const [professor, reviews] = await Promise.all([
    load(getProfessorServer(id)),
    load(getProfessorReviewsFirstPageServer(id, PAGE_SIZE)),
  ]);

  return (
    <ProfessorReviewsPageClient
      initialProfessor={professor}
      initialReviews={reviews}
      pageSize={PAGE_SIZE}
    />
  );
}
