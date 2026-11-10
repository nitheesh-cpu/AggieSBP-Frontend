/**
 * Load what the schedule generator needs for a term: each course's sections
 * (with meeting times) and how easy each section's instructor is for it.
 */

import {
  getCourseSectionsForTerm,
  getDiscoverDeptCourses,
  type CourseSection,
} from "@/lib/api";
import type { DiscoverRow } from "@/lib/planner/find";
import { courseId } from "@/lib/planner/record";
import { parseTime, type Day, type GenCourse, type GenSection, type Meeting } from "@/lib/planner/schedule";
import { parseTopicKey, sectionInTopic, sameTopic, topicOf } from "@/lib/planner/topics";

const DAYS = new Set<Day>(["M", "T", "W", "R", "F", "S", "U"]);
const CAMPUS = "College Station";

export function lastName(name: string | null | undefined): string | null {
  const parts = (name ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

/** Honors sections (2xx) are restricted, so they're left out unless asked for. */
export function isHonorsSection(section: { sectionNumber: string }): boolean {
  return /^2\d\d$/.test(section.sectionNumber);
}

export function toGenSection(
  s: CourseSection,
  code: string,
  easinessByLastName: Map<string, number>,
): GenSection {
  const meetings: Meeting[] = [];
  for (const m of s.meetings ?? []) {
    if (/exam/i.test(m.meetingType ?? "")) continue; // final exam slots aren't weekly classes
    const start = parseTime(m.beginTime);
    const end = parseTime(m.endTime);
    const days = (m.daysOfWeek ?? []).filter((d): d is Day => DAYS.has(d as Day));
    if (start == null || end == null || days.length === 0) continue; // online / TBA
    meetings.push({ days, start, end });
  }
  const instructor =
    s.instructors?.find((i) => i.isPrimary)?.name ?? s.instructors?.[0]?.name ?? null;
  const last = lastName(instructor);
  return {
    crn: s.crn,
    course: code,
    section: s.sectionNumber,
    type: s.scheduleType || "LEC",
    meetings,
    open: s.isOpen,
    instructor,
    easiness: last ? (easinessByLastName.get(last) ?? null) : null,
  };
}

/**
 * Sections and per-instructor easiness for each course in a term.
 *
 * `keys` are course identities: a plain code ("CSCE 121", all its sections)
 * or a topic key ("CSCE 489|COMPUTER VISION", only that topic's sections, so
 * two topics of one special topics course never mix). The key is also the
 * `GenCourse.code` of the result and what `notOffered` lists; show it with
 * `keyLabel`.
 */
export async function loadGenCourses(
  termCode: string,
  keys: string[],
  opts: { includeHonors?: boolean } = {},
): Promise<{ courses: GenCourse[]; notOffered: string[] }> {
  const unique = [...new Set(keys)];
  const depts = [...new Set(unique.map((k) => parseTopicKey(k).code.split(" ")[0]))];

  // Easiness per course + instructor, from the discover data (grades, ratings).
  const deptRows = new Map<string, DiscoverRow[]>();
  await Promise.all(
    depts.map(async (dept) => {
      const rows = await getDiscoverDeptCourses(termCode, dept, {
        campus: CAMPUS,
        includeGraduate: true,
      }).catch(() => [] as DiscoverRow[]);
      deptRows.set(dept, rows);
    }),
  );

  // Topics of one course share a single sections request.
  const sectionsByCode = new Map<string, Promise<CourseSection[]>>();
  const sectionsFor = (code: string) => {
    let p = sectionsByCode.get(code);
    if (!p) {
      p = getCourseSectionsForTerm(termCode, courseId(code)).catch(() => [] as CourseSection[]);
      sectionsByCode.set(code, p);
    }
    return p;
  };

  const courses: GenCourse[] = [];
  const notOffered: string[] = [];
  await Promise.all(
    unique.map(async (key) => {
      const { code, topic } = parseTopicKey(key);
      const sections = await sectionsFor(code);
      const [dept, number] = code.split(" ");
      const rows = (deptRows.get(dept) ?? []).filter(
        (r) =>
          r.dept.toUpperCase() === dept &&
          String(r.courseNumber).toUpperCase() === number &&
          (!topic || sameTopic(topicOf(r.courseTitle), topic)),
      );
      const byLast = new Map<string, number>();
      const scores: number[] = [];
      for (const r of rows) {
        if (typeof r.easinessScore !== "number") continue;
        scores.push(r.easinessScore);
        const last = lastName(r.professor?.lastName);
        // Low-confidence scores (barely any data) don't count as a known easy professor.
        if (last && (r.confidenceScore ?? 100) >= 20) byLast.set(last, r.easinessScore);
      }
      const usable = sections.filter(
        (s) =>
          s.campus === CAMPUS &&
          (opts.includeHonors || !isHonorsSection(s)) &&
          sectionInTopic(s.courseTitle, topic),
      );
      if (usable.length === 0) {
        notOffered.push(key);
        return;
      }
      courses.push({
        code: key,
        sections: usable.map((s) => toGenSection(s, key, byLast)),
        courseEasiness: scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null,
      });
    }),
  );
  courses.sort((a, b) => unique.indexOf(a.code) - unique.indexOf(b.code));
  return { courses, notOffered };
}
