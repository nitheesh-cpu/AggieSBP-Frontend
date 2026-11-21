/**
 * Pure helpers for the server-rendered department pages (/browse and
 * /departments/[code]). No runtime imports so they can be unit tested
 * (department-pages.test.ts).
 */
import type { Department, Professor } from "./api";

/** "MATH - Mathematics" -> "Mathematics"; falls back to the code. */
export function departmentName(dept: Pick<Department, "code" | "name">): string {
  const code = dept.code.trim();
  const name = (dept.name ?? "").trim();
  const prefix = new RegExp(`^${code}\\s*[-–:]\\s*`, "i");
  const stripped = name.replace(prefix, "").trim();
  return stripped || code;
}

/**
 * Departments that get a page: official subject codes that have courses with
 * grade data. The rest would be empty pages (thin, and nothing to link to).
 */
export function publishedDepartments<T extends Pick<Department, "code" | "courses">>(
  departments: T[],
): T[] {
  return departments
    .filter((d) => d.code && d.courses > 0)
    .sort((a, b) => a.code.localeCompare(b.code));
}

/** Professors with the most reviews first; ones with none are left out. */
export function topProfessors<T extends Pick<Professor, "total_reviews" | "name">>(
  professors: T[],
  limit = 24,
): T[] {
  return professors
    .filter((p) => (p.total_reviews ?? 0) > 0)
    .sort(
      (a, b) =>
        (b.total_reviews ?? 0) - (a.total_reviews ?? 0) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit);
}

/** Numeric order inside a subject: MATH 99 before MATH 100, then by suffix. */
export function compareCourseCodes(a: string, b: string): number {
  const num = (code: string) => Number(code.match(/(\d+)/)?.[1] ?? 0);
  return num(a) - num(b) || a.localeCompare(b);
}
