import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProfessorPageClient from "./professor-page-client";
import {
  getOfficialSubjectCodesServer,
  getProfessorServer,
  getTermsServer,
  isApiNotFound,
} from "@/lib/server-api";
import {
  professorCanonicalPath,
  professorDescription,
  professorTitle,
} from "@/lib/seo-metadata";

// Rendered per request, never written to the ISR cache (Vercel bills ISR
// writes and the free tier ran out). Vercel's CDN caches the HTML instead,
// via Vercel-CDN-Cache-Control in next.config.ts.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

/** 404 when the API doesn't know the id; other failures throw to error.tsx (non-200). */
async function loadProfessor(id: string) {
  try {
    return await getProfessorServer(id);
  } catch (err) {
    if (isApiNotFound(err)) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const professor = await loadProfessor(id);
  const title = professorTitle(professor);
  const description = professorDescription(professor);
  // Merged duplicate profiles come back under the surviving id; point the
  // alias URL's canonical at it.
  const canonical = professorCanonicalPath(professor);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "profile" },
  };
}

export default async function ProfessorPage({ params }: Props) {
  const { id } = await params;
  const [professor, terms, officialCodes] = await Promise.all([
    loadProfessor(id),
    getTermsServer(),
    getOfficialSubjectCodesServer(),
  ]);

  return (
    <ProfessorPageClient
      initialProfessor={professor}
      initialTerms={terms}
      officialDepartments={
        officialCodes
          ? (professor.departments ?? []).filter((d) => d && officialCodes.has(d))
          : null
      }
    />
  );
}
