import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PageBanner } from "@/components/page-banner";
import {
  decodeRouteId,
  getDepartmentCoursesServer,
  getDepartmentProfessorsServer,
  getDepartmentsServer,
  isApiNotFound,
} from "@/lib/server-api";
import {
  compareCourseCodes,
  departmentName,
  publishedDepartments,
  topProfessors,
} from "@/lib/department-pages";
import {
  courseCanonicalPath,
  departmentCanonicalPath,
  departmentDescription,
  departmentTitle,
  formatCourseCode,
  professorCanonicalPath,
} from "@/lib/seo-metadata";

// Rendered per request and cached by the CDN, like course and professor pages (D-044).
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

/** 404 for unknown subjects and for ones with no course data; other failures go to error.tsx. */
async function loadDepartment(rawCode: string) {
  const code = decodeRouteId(rawCode).trim().toUpperCase();
  const departments = await getDepartmentsServer();
  const dept = publishedDepartments(departments).find((d) => d.code === code);
  if (!dept) notFound();
  return dept;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const dept = await loadDepartment(code);
  const title = departmentTitle(dept);
  const description = departmentDescription(dept);
  const canonical = departmentCanonicalPath(dept.code);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

export default async function DepartmentPage({ params }: Props) {
  const { code: rawCode } = await params;
  const dept = await loadDepartment(rawCode);

  // The course list is the point of the page; professors are a bonus, so a
  // failure there shows the courses alone instead of an error page.
  const [courses, professors] = await Promise.all([
    getDepartmentCoursesServer(dept.code).catch((err) => {
      if (isApiNotFound(err)) return [];
      throw err;
    }),
    getDepartmentProfessorsServer(dept.code)
      .then((rows) => topProfessors(rows))
      .catch(() => []),
  ]);
  const sortedCourses = [...courses].sort((a, b) => compareCourseCodes(a.code, b.code));
  const name = departmentName(dept);

  return (
    <div className="min-h-dvh bg-canvas">
      <Navigation />
      <PageBanner
        title={`${dept.code} courses at Texas A&M`}
        subtitle={`${name}: average GPA and professors for each course.`}
      />

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
        <section aria-labelledby="dept-courses">
          <h2 id="dept-courses" className="text-xl font-medium text-text-heading">
            {sortedCourses.length.toLocaleString("en-US")}{" "}
            {sortedCourses.length === 1 ? "course" : "courses"}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Average GPA is shown where official grade data exists.
          </p>
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {sortedCourses.map((course) => (
              <li key={course.id}>
                <Link
                  href={courseCanonicalPath(course)}
                  className="flex items-baseline gap-3 px-4 py-3 transition-colors hover:bg-raised"
                >
                  <span className="w-24 shrink-0 font-mono text-sm text-text-heading">
                    {formatCourseCode(course.code)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-text-body">{course.name}</span>
                  <span
                    className="shrink-0 font-mono text-sm tabular-nums text-text-heading"
                    title={course.avgGPA >= 0 ? "Average GPA" : "No grade data yet"}
                  >
                    {course.avgGPA >= 0 ? course.avgGPA.toFixed(2) : "–"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {professors.length > 0 && (
          <section aria-labelledby="dept-professors">
            <h2 id="dept-professors" className="text-xl font-medium text-text-heading">
              Most reviewed professors
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {professors.map((professor) => (
                <li key={professor.id}>
                  <Link
                    href={professorCanonicalPath(professor)}
                    className="flex items-baseline justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-raised"
                  >
                    <span className="min-w-0 truncate text-text-heading">{professor.name}</span>
                    <span className="shrink-0 font-mono text-sm tabular-nums text-text-body">
                      {typeof professor.overall_rating === "number"
                        ? `${professor.overall_rating.toFixed(1)}/5`
                        : "–"}{" "}
                      · {professor.total_reviews.toLocaleString("en-US")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="More from this department" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href={`/discover/dept?dept=${encodeURIComponent(dept.code)}`}
            className="text-accent underline underline-offset-2"
          >
            Easiest {dept.code} courses
          </Link>
          <Link href="/browse" className="text-accent underline underline-offset-2">
            All departments
          </Link>
          <Link href="/compare" className="text-accent underline underline-offset-2">
            Compare courses
          </Link>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
