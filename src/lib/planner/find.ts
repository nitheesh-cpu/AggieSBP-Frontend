/**
 * Helpers for the planner's Find Courses and Requirements views: collapse the
 * discover endpoints' per-professor rows into one row per course, and sort
 * courses into eligibility tiers for a target term.
 *
 * No runtime imports, so `node --test` can run the tests directly.
 */

import type { Eligibility } from "./prereqs";
import type { AcademicRecord } from "./record";
import { canonicalTopics, titleCase, topicKey, topicOf } from "./topics.ts";

/** One row from /discover/{term}/{dept} or a UCC category (one per course + professor). */
export interface DiscoverRow {
  dept: string;
  courseNumber: string;
  courseTitle: string;
  credits?: string | number | null;
  easinessScore?: number | null;
  confidenceScore?: number | null;
  professor?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    avgGpa?: number | null;
    /** False when there's no grade history: the score comes from ratings alone. */
    hasGradeData?: boolean;
  } | null;
}

export interface Candidate {
  code: string;
  /** Special topics: the topic's name (canonical, upper case); null for a regular course. */
  topic: string | null;
  /** Identity: the code, or "code|TOPIC" for one topic of a special topics course. */
  key: string;
  title: string;
  credits: string | null;
  /** Best easiness across the course's professors this term (0-100). */
  easiness: number;
  /** Professor behind `easiness`, when known. */
  bestProfessor: string | null;
  /** False when that professor has no grade history, so `easiness` is from ratings only. */
  bestHasGradeData: boolean;
  professorCount: number;
  /** UCC categories the course counts for, when it came from the UCC list. */
  categories: string[];
}

function professorName(p: DiscoverRow["professor"]): string | null {
  if (!p) return null;
  if ([p.firstName, p.lastName, p.id].some((x) => x?.trim().toUpperCase() === "TBA")) return null;
  const name = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
  return name || null;
}

/**
 * One candidate per course code (or per topic, for special topics courses
 * like CSCE 489), keeping the easiest professor's score.
 * `groups` lets UCC categories be passed together; a course listed under
 * several categories collects all of them.
 */
export function collapseRows(groups: { category?: string; rows: DiscoverRow[] }[]): Candidate[] {
  const codeOf = (row: DiscoverRow) =>
    `${row.dept.trim().toUpperCase()} ${String(row.courseNumber).trim().toUpperCase()}`;
  // Truncated titles name one topic two ways; settle on the longest per course.
  const topicsByCode = new Map<string, string[]>();
  for (const { rows } of groups) {
    for (const row of rows) {
      if (!row.dept || !row.courseNumber) continue;
      const topic = topicOf(row.courseTitle);
      if (!topic) continue;
      const code = codeOf(row);
      topicsByCode.set(code, [...(topicsByCode.get(code) ?? []), topic]);
    }
  }
  const canon = new Map([...topicsByCode].map(([code, topics]) => [code, canonicalTopics(topics)]));

  const byCode = new Map<string, Candidate & { profs: Set<string> }>();
  for (const { category, rows } of groups) {
    for (const row of rows) {
      if (!row.dept || !row.courseNumber) continue;
      const code = codeOf(row);
      const raw = topicOf(row.courseTitle);
      const topic = raw ? (canon.get(code)?.get(raw) ?? raw) : null;
      const key = topicKey(code, topic);
      const easiness = typeof row.easinessScore === "number" ? row.easinessScore : 0;
      const prof = professorName(row.professor);
      const hasGradeData = row.professor?.hasGradeData !== false;
      let entry = byCode.get(key);
      if (!entry) {
        entry = {
          code,
          topic,
          key,
          title: topic ? titleCase(topic) : (row.courseTitle ?? ""),
          credits: row.credits == null || row.credits === "" ? null : String(row.credits),
          easiness,
          bestProfessor: prof,
          bestHasGradeData: hasGradeData,
          professorCount: 0,
          categories: [],
          profs: new Set(),
        };
        byCode.set(key, entry);
      } else if (easiness > entry.easiness) {
        entry.easiness = easiness;
        entry.bestProfessor = prof;
        entry.bestHasGradeData = hasGradeData;
      }
      if (prof) entry.profs.add(prof);
      if (category && !entry.categories.includes(category)) entry.categories.push(category);
    }
  }
  return [...byCode.values()]
    .map(({ profs, ...c }) => ({ ...c, professorCount: profs.size }))
    .sort((a, b) => b.easiness - a.easiness || a.code.localeCompare(b.code) || a.key.localeCompare(b.key));
}

/**
 * - ready: prerequisites met (possibly with approval)
 * - maybe: something we can't check (classification not set, a free-text condition)
 * - one_away: exactly one course short
 * - locked: further away than that
 * - taken: already done (or scheduled before the target term)
 * - pending: prereq data not loaded yet
 */
export type Tier = "ready" | "maybe" | "one_away" | "locked" | "taken" | "pending";

export function tierOf(ev: Eligibility | null | undefined): Tier {
  if (!ev) return "pending";
  switch (ev.status) {
    case "taken":
      return "taken";
    case "met":
    case "approval":
      return "ready";
    case "unknown":
      return "maybe";
    case "unmet":
      return "missing" in ev && ev.missing.length === 1 ? "one_away" : "locked";
  }
}

/**
 * Where a course stands for the student, most settled first:
 * done / in progress / planned come from the record; otherwise the tier for
 * the target term.
 */
export type CourseState = "done" | "in_progress" | "planned" | Exclude<Tier, "taken">;

export function courseState(
  record: AcademicRecord,
  code: string,
  ev: Eligibility | null | undefined,
): CourseState {
  const c = record.courses.find((x) => x.code === code && !x.deleted);
  if (c?.status === "completed" && !(c.grade && ["F", "U", "Q", "W", "I"].includes(c.grade))) {
    return "done";
  }
  if (c?.status === "in_progress") return "in_progress";
  if (c?.status === "planned") return "planned";
  const tier = tierOf(ev);
  // "taken" without a completed record entry means it's scheduled earlier.
  return tier === "taken" ? "planned" : tier;
}

/** Courses that count as finished for requirement progress. */
export function isDone(record: AcademicRecord, code: string): boolean {
  return courseState(record, code, null) === "done";
}

/** Finished, in progress, or planned: counts toward "covered by your plan". */
export function isCovered(record: AcademicRecord, code: string): boolean {
  const s = courseState(record, code, null);
  return s === "done" || s === "in_progress" || s === "planned";
}
