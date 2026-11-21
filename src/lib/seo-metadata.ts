/**
 * Titles, descriptions and canonical paths for course and professor pages,
 * worded to match what people search ("msen 325", "<name> rate my professor").
 * Pure functions so they can be unit tested (seo-metadata.test.ts).
 */
import type { CourseDetail, ProfessorDetail } from "./api";

/** Titles past this get a shorter suffix / truncated course name. */
const MAX_TITLE = 80;
/** Google shows roughly this much of a description. */
const MAX_DESCRIPTION = 160;

function clean(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:–-]+$/, "")}…`;
}

/** Drops trailing sentences until the text fits, so descriptions don't end mid-word. */
function fitSentences(sentences: string[], max: number): string {
  const parts = sentences.filter(Boolean);
  while (parts.length > 1 && parts.join(" ").length > max) parts.pop();
  return truncate(parts.join(" "), max);
}

/** "MATH 152", "msen325" -> "MATH 152" / "MSEN 325". */
export function formatCourseCode(code: string): string {
  const compact = clean(code).replace(/\s+/g, "").toUpperCase();
  const match = compact.match(/^([A-Z]+)(\d+[A-Z]?)$/);
  return match ? `${match[1]} ${match[2]}` : clean(code).toUpperCase();
}

/** URL form of a course code: "MATH 152" -> "MATH152". */
export function courseSlug(code: string): string {
  return clean(code).replace(/\s+/g, "").toUpperCase();
}

export function courseCanonicalPath(course: Pick<CourseDetail, "code">): string {
  return `/course/${encodeURIComponent(courseSlug(course.code))}`;
}

/**
 * A real number in the title ("Avg GPA 2.92") gives searchers a reason to click
 * that a bare "Grades & Professors" does not. Tails go from richest to
 * shortest; the first one that fits next to the full course name wins, and
 * only the last resort truncates the name.
 */
export function courseTitle(
  course: Pick<CourseDetail, "code" | "name"> & { avgGPA?: number | null },
): string {
  const code = formatCourseCode(course.code);
  const name = clean(course.name);
  const suffix = " | Texas A&M";
  const gpa =
    typeof course.avgGPA === "number" && course.avgGPA >= 0
      ? course.avgGPA.toFixed(2)
      : null;

  const tails = gpa
    ? [
        ` – Avg GPA ${gpa}, Professors & Reviews${suffix}`,
        ` – Avg GPA ${gpa} & Professors${suffix}`,
        ` – Avg GPA ${gpa}${suffix}`,
      ]
    : [` – Grades, Professors & Reviews${suffix}`, ` – Grades & Professors${suffix}`];

  if (!name) return `${code}${tails[0]}`;
  for (const tail of tails) {
    const full = `${code}: ${name}${tail}`;
    if (full.length <= MAX_TITLE) return full;
  }

  const shortTail = tails[tails.length - 1];
  const room = MAX_TITLE - `${code}: `.length - shortTail.length;
  return `${code}: ${truncate(name, Math.max(room, 20))}${shortTail}`;
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
}

export function courseDescription(
  course: Pick<CourseDetail, "code" | "name" | "avgGPA" | "gpaScope" | "professors">,
): string {
  const code = formatCourseCode(course.code);
  const name = clean(course.name);
  const professors = course.professors ?? [];
  const reviewCount = professors.reduce(
    (sum, p) => sum + (p.courseReviewCount ?? 0),
    0,
  );

  // Lead with the number people came for, then say what they can do on the page.
  const label = `${code}${name ? ` (${name})` : ""} at Texas A&M`;
  const lead =
    typeof course.avgGPA === "number" && course.avgGPA >= 0
      ? `${label}: average GPA ${course.avgGPA.toFixed(2)}${
          course.gpaScope === "recent" ? " (last 4 semesters)" : ""
        }.`
      : `${label}.`;

  const compare =
    professors.length > 0 && reviewCount > 0
      ? `Compare grades across ${plural(professors.length, "professor")} and read ${plural(reviewCount, "student review")}.`
      : professors.length > 0
        ? `Compare grades across ${plural(professors.length, "professor")}.`
        : reviewCount > 0
          ? `Compare grades by professor and read ${plural(reviewCount, "student review")}.`
          : "Compare grades by professor and read student reviews.";

  return fitSentences(
    [lead, compare, "Pick the right section before you register."],
    MAX_DESCRIPTION,
  );
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Professor ids are base64 ("VGVhY2hlci0yODQ3MjM="); keep "=" literal like the sitemap does. */
export function professorCanonicalPath(professor: Pick<ProfessorDetail, "id">): string {
  return `/professor/${encodeURIComponent(professor.id).replace(/%3D/gi, "=")}`;
}

/**
 * With reviews the title carries the rating and review count, which is what a
 * student scanning "<name> tamu" results is looking for. Without them it keeps
 * the plain keyword form (never a made-up number).
 */
export function professorTitle(
  professor: Pick<ProfessorDetail, "name"> &
    Partial<Pick<ProfessorDetail, "overall_rating" | "total_reviews">>,
): string {
  const name = clean(professor.name);
  const reviews = professor.total_reviews ?? 0;
  if (typeof professor.overall_rating === "number" && reviews > 0) {
    return `${name} – Texas A&M Professor: ${professor.overall_rating.toFixed(1)}/5, ${plural(reviews, "Review")} & Grades`;
  }
  return `${name} – Texas A&M Professor Ratings, Reviews & Grades`;
}

/** The courses with the most reviews (then most graded students), formatted. */
export function mainCourses(
  professor: Pick<ProfessorDetail, "courses">,
  limit = 3,
): string[] {
  const seen = new Set<string>();
  return [...(professor.courses ?? [])]
    // RateMyProfessor labels are free text ("202", "BBQCLASS"); keep real codes.
    .filter((c) => c.course_id && /^[A-Z]{3,4}\s*\d{3}[A-Z]?$/i.test(c.course_id.trim()))
    .sort(
      (a, b) =>
        (b.reviews_count ?? 0) - (a.reviews_count ?? 0) ||
        (b.gpa_students ?? 0) - (a.gpa_students ?? 0),
    )
    .map((c) => formatCourseCode(c.course_id))
    .filter((code) => (seen.has(code) ? false : (seen.add(code), true)))
    .slice(0, limit);
}

function ratingSentence(
  professor: Pick<ProfessorDetail, "name" | "overall_rating" | "total_reviews" | "would_take_again_percent">,
): string {
  const name = clean(professor.name);
  const reviews = professor.total_reviews ?? 0;
  const parts: string[] = [];
  if (typeof professor.overall_rating === "number" && reviews > 0) {
    parts.push(`rated ${professor.overall_rating.toFixed(1)}/5 from ${plural(reviews, "student review")}`);
  } else if (reviews > 0) {
    parts.push(plural(reviews, "student review"));
  }
  if (typeof professor.would_take_again_percent === "number" && reviews > 0) {
    parts.push(`${Math.round(professor.would_take_again_percent)}% would take again`);
  }
  return parts.length > 0
    ? `${name} at Texas A&M: ${parts.join(", ")}.`
    : `${name} at Texas A&M.`;
}

export function professorDescription(professor: ProfessorDetail): string {
  const courses = mainCourses(professor);
  return fitSentences(
    [
      ratingSentence(professor),
      courses.length > 0 ? `Teaches ${joinList(courses)}.` : "",
      "See grades and what students say.",
    ],
    MAX_DESCRIPTION,
  );
}

export function professorReviewsTitle(
  professor: Pick<ProfessorDetail, "name" | "total_reviews">,
): string {
  const reviews = professor.total_reviews ?? 0;
  const count = reviews > 0 ? ` – ${plural(reviews, "Student Review")}` : " – Student Reviews";
  return `${clean(professor.name)} Reviews${count} | Texas A&M`;
}

export function professorReviewsDescription(professor: ProfessorDetail): string {
  const name = clean(professor.name);
  const reviews = professor.total_reviews ?? 0;
  const courses = mainCourses(professor);
  return fitSentences(
    [
      reviews > 0
        ? `Read all ${plural(reviews, "student review")} of ${name} at Texas A&M.`
        : `Student reviews of ${name} at Texas A&M.`,
      `Ratings, difficulty, grades received and comments${courses.length > 0 ? ` for ${joinList(courses)}` : ""}.`,
      "Filter by course or rating.",
    ],
    MAX_DESCRIPTION,
  );
}
