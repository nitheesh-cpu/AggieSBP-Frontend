import type { Metadata } from "next";
import Link from "@/components/app-link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PageBanner } from "@/components/page-banner";
import { getDepartmentsServer } from "@/lib/server-api";
import { departmentName, publishedDepartments } from "@/lib/department-pages";
import { departmentCanonicalPath } from "@/lib/seo-metadata";

// Plain, server-rendered links to every department page. The interactive
// /departments and /courses pages load their lists in the browser, so Google
// finds nothing to follow there; this page is the crawlable way in.
export const dynamic = "force-dynamic";

const TITLE = "Browse Texas A&M Courses by Department | AggieSB+";
const DESCRIPTION =
  "Every Texas A&M department with grade data. Pick one to see its courses, average GPA and most reviewed professors.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/browse" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/browse", type: "website" },
};

export default async function BrowsePage() {
  const departments = publishedDepartments(await getDepartmentsServer());

  return (
    <div className="min-h-dvh bg-canvas">
      <Navigation />
      <PageBanner
        title="Browse by department"
        subtitle={`${departments.length} Texas A&M departments with grade data.`}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <li key={dept.code}>
              <Link
                href={departmentCanonicalPath(dept.code)}
                className="flex items-baseline gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-raised"
              >
                <span className="w-14 shrink-0 font-mono text-sm text-text-heading">
                  {dept.code}
                </span>
                <span className="min-w-0 flex-1 truncate text-text-body">
                  {departmentName(dept)}
                </span>
                <span className="shrink-0 font-mono text-sm tabular-nums text-text-muted">
                  {dept.courses}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-text-muted">
          The number is how many courses have grade data. Prefer to search?{" "}
          <Link href="/courses" className="text-accent underline underline-offset-2">
            Search all courses
          </Link>{" "}
          or{" "}
          <Link href="/professors" className="text-accent underline underline-offset-2">
            find a professor
          </Link>
          .
        </p>
      </main>
      <Footer />
    </div>
  );
}
