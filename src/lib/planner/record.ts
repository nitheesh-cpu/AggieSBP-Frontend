/**
 * The student's academic record: courses completed, in progress, or planned.
 *
 * Local-first: the record lives in localStorage and, when signed in, syncs to
 * /users/me/planner/record. Every course entry carries its own updatedAt, and
 * removals are kept as tombstones, so two copies merge per course (newest
 * edit wins) without resurrecting deleted courses.
 *
 * This file has no imports so `node --test` can run its tests directly.
 */

export type CourseStatus = "completed" | "in_progress" | "planned";
export type Grade = "A" | "B" | "C" | "D" | "F" | "S" | "U" | "P" | "Q" | "W" | "I";
export type Classification = "freshman" | "sophomore" | "junior" | "senior" | "graduate";
export type CreditType = "ap" | "ib" | "dual" | "transfer" | "exam" | "other";
export type CourseSource = "manual" | "paste" | "credit";

export interface RecordCourse {
  code: string;
  status: CourseStatus;
  /** Term key: year + season digit (1 spring, 2 summer, 3 fall), e.g. "20263". */
  term?: string | null;
  grade?: Grade | null;
  source: CourseSource;
  credit?: CreditType | null;
  updatedAt: string;
  /** Tombstone, so merges don't bring back a course removed on another device. */
  deleted?: boolean;
}

export interface AcademicRecord {
  version: 1;
  courses: RecordCourse[];
  classification?: Classification | null;
  classificationUpdatedAt?: string | null;
}

export const GRADES: Grade[] = ["A", "B", "C", "D", "F", "S", "U", "P", "Q", "W", "I"];
/** Grades that don't count as having passed the course. */
export const NOT_PASSED: ReadonlySet<string> = new Set(["F", "U", "Q", "W", "I"]);
export const CLASSIFICATIONS: Classification[] = [
  "freshman",
  "sophomore",
  "junior",
  "senior",
  "graduate",
];

const TOMBSTONE_TTL_MS = 180 * 24 * 60 * 60 * 1000;

export function emptyRecord(): AcademicRecord {
  return { version: 1, courses: [] };
}

// ---------------------------------------------------------------------------
// Course codes and terms
// ---------------------------------------------------------------------------

const CODE_RE = /^\s*([A-Za-z]{3,4})[\s\-_]*(\d{3}[A-Za-z]?)\s*$/;

/** "csce121", "CSCE-121", "CSCE 121" -> "CSCE 121"; anything else -> null. */
export function normalizeCode(raw: string): string | null {
  const m = CODE_RE.exec(raw);
  return m ? `${m[1].toUpperCase()} ${m[2].toUpperCase()}` : null;
}

/** "CSCE 121" -> "CSCE121" (the id used in /course/{id} URLs). */
export function courseId(code: string): string {
  return code.replace(/\s+/g, "");
}

const SEASONS: Record<string, string> = { "1": "Spring", "2": "Summer", "3": "Fall" };
const SEASON_DIGITS: Record<string, string> = { spring: "1", summer: "2", fall: "3" };

/** Registrar term code ("202631" = Fall 2026, College Station) -> "20263". */
export function termKeyFromCode(termCode: string): string | null {
  return /^\d{4}[1-3]/.test(termCode) ? termCode.slice(0, 5) : null;
}

export function termKey(year: number, season: "spring" | "summer" | "fall"): string {
  return `${year}${SEASON_DIGITS[season]}`;
}

export function termLabel(key: string | null | undefined): string {
  if (!key || !/^\d{4}[1-3]$/.test(key)) return "No term";
  return `${SEASONS[key[4]]} ${key.slice(0, 4)}`;
}

/** The term in session on `now` (Jan-May spring, Jun-Jul summer, Aug-Dec fall). */
export function currentTermKey(now: Date = new Date()): string {
  const month = now.getMonth() + 1;
  const season = month <= 5 ? "1" : month <= 7 ? "2" : "3";
  return `${now.getFullYear()}${season}`;
}

/**
 * The next spring or fall after `key` (students rarely plan around summer):
 * Fall 2026 -> Spring 2027, Spring/Summer 2027 -> Fall 2027.
 */
export function nextTermKey(key: string): string {
  const year = Number(key.slice(0, 4));
  return key[4] === "3" ? `${year + 1}1` : `${year}3`;
}

/** Spring/summer/fall keys from `fromYear` through `toYear`, newest first. */
export function termKeyRange(fromYear: number, toYear: number): string[] {
  const keys: string[] = [];
  for (let y = toYear; y >= fromYear; y--) {
    for (const s of ["3", "2", "1"]) keys.push(`${y}${s}`);
  }
  return keys;
}

/** Status a course in `term` most likely has today. */
export function defaultStatusForTerm(
  term: string | null | undefined,
  now: Date = new Date(),
): CourseStatus {
  if (!term) return "completed";
  const current = currentTermKey(now);
  if (term < current) return "completed";
  return term === current ? "in_progress" : "planned";
}

// ---------------------------------------------------------------------------
// Edits (all return a new record)
// ---------------------------------------------------------------------------

export type CourseInput = Omit<RecordCourse, "updatedAt" | "deleted">;

export function activeCourses(record: AcademicRecord): RecordCourse[] {
  return record.courses.filter((c) => !c.deleted);
}

export function findCourse(record: AcademicRecord, code: string): RecordCourse | undefined {
  return record.courses.find((c) => c.code === code && !c.deleted);
}

/** Add or replace courses (by code). */
export function upsertCourses(
  record: AcademicRecord,
  inputs: CourseInput[],
  now: Date = new Date(),
): AcademicRecord {
  const stamp = now.toISOString();
  const byCode = new Map(record.courses.map((c) => [c.code, c]));
  for (const input of inputs) {
    const code = normalizeCode(input.code);
    if (!code) continue;
    byCode.set(code, {
      code,
      status: input.status,
      term: input.term ?? null,
      grade: input.grade ?? null,
      source: input.source,
      credit: input.credit ?? null,
      updatedAt: stamp,
    });
  }
  return { ...record, courses: sortCourses([...byCode.values()]) };
}

export function updateCourse(
  record: AcademicRecord,
  code: string,
  patch: Partial<CourseInput>,
  now: Date = new Date(),
): AcademicRecord {
  const existing = findCourse(record, code);
  if (!existing) return record;
  const { updatedAt: _u, deleted: _d, ...rest } = existing;
  return upsertCourses(record, [{ ...rest, ...patch, code }], now);
}

export function removeCourse(
  record: AcademicRecord,
  code: string,
  now: Date = new Date(),
): AcademicRecord {
  return {
    ...record,
    courses: record.courses.map((c) =>
      c.code === code ? { ...c, deleted: true, updatedAt: now.toISOString() } : c,
    ),
  };
}

export function setClassification(
  record: AcademicRecord,
  classification: Classification | null,
  now: Date = new Date(),
): AcademicRecord {
  return { ...record, classification, classificationUpdatedAt: now.toISOString() };
}

function sortCourses(courses: RecordCourse[]): RecordCourse[] {
  return courses.sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

/**
 * Merge two copies of a record: per course the newer edit wins (tombstones
 * included); the newer classification wins. Tombstones older than 180 days
 * are dropped. Order-independent for distinct timestamps.
 */
export function mergeRecords(
  a: AcademicRecord | null | undefined,
  b: AcademicRecord | null | undefined,
  now: Date = new Date(),
): AcademicRecord {
  // Tolerate a missing or malformed copy (e.g. {} from a 409 on a new row).
  const left = a && Array.isArray(a.courses) ? a : emptyRecord();
  const right = b && Array.isArray(b.courses) ? b : emptyRecord();
  const byCode = new Map<string, RecordCourse>();
  for (const c of [...left.courses, ...right.courses]) {
    const prev = byCode.get(c.code);
    if (!prev || newer(c, prev)) byCode.set(c.code, c);
  }
  const cutoff = now.getTime() - TOMBSTONE_TTL_MS;
  const courses = [...byCode.values()].filter(
    (c) => !c.deleted || Date.parse(c.updatedAt) >= cutoff,
  );

  const la = left.classificationUpdatedAt ?? "";
  const ra = right.classificationUpdatedAt ?? "";
  const cls = ra > la ? right : left;
  const merged: AcademicRecord = { version: 1, courses: sortCourses(courses) };
  if (cls.classificationUpdatedAt) {
    merged.classification = cls.classification ?? null;
    merged.classificationUpdatedAt = cls.classificationUpdatedAt;
  }
  return merged;
}

function newer(x: RecordCourse, y: RecordCourse): boolean {
  if (x.updatedAt !== y.updatedAt) return x.updatedAt > y.updatedAt;
  // Same timestamp from two devices: keep a stable winner either way round.
  return JSON.stringify(x) > JSON.stringify(y);
}

/** Canonical JSON for "did anything change" checks. */
export function recordKey(record: AcademicRecord | null | undefined): string {
  const r = record ?? emptyRecord();
  return JSON.stringify({
    courses: sortCourses([...r.courses]).map((c) => [
      c.code,
      c.status,
      c.term ?? null,
      c.grade ?? null,
      c.source,
      c.credit ?? null,
      c.updatedAt,
      !!c.deleted,
    ]),
    classification: r.classification ?? null,
    classificationUpdatedAt: r.classificationUpdatedAt ?? null,
  });
}

// ---------------------------------------------------------------------------
// Pasted text
// ---------------------------------------------------------------------------

export interface PastedCourse {
  code: string;
  grade: Grade | null;
  term: string | null;
}

const PASTE_CODE_RE = /\b([A-Za-z]{3,4})[ \t]*-?[ \t]*(\d{3}[A-Za-z]?)\b/g;
const PASTE_TERM_RE = /\b(spring|summer|fall)\b[^\d\n]{0,12}(\d{4})\b|\b(\d{4})\s+(spring|summer|fall)\b/i;
const GRADE_TOKEN_RE = /^(A|B|C|D|F|S|U|P|Q|W|I)[+-]?$/;
// Words that look like "ABCD 123" in transcripts but aren't courses.
const NOT_SUBJECTS = new Set([
  "TERM", "YEAR", "PAGE", "ROOM", "UNIT", "TOTAL", "HOURS", "GPA", "SEC", "SECT",
  "CRN", "AND", "THE", "WITH", "FOR", "FROM", "INTO", "OVER", "ONLY", "TOOK", "TAKE",
  "HAVE", "NOT", "BUT", "ALSO", "PLUS", "THAN", "THEN", "WEEK", "DAYS",
]);

/**
 * Pull course codes out of whatever the student pastes: a comma list
 * ("CSCE 121, MATH 151"), one per line, or transcript-style lines with a
 * grade ("CSCE 121  INTRO PGM DESIGN  4.000  A"). A line naming a term
 * ("Fall 2025") sets the term for the lines after it. Later duplicates win.
 */
export function parsePastedCourses(text: string): PastedCourse[] {
  const out = new Map<string, PastedCourse>();
  let term: string | null = null;
  for (const line of text.split(/\r?\n/)) {
    const t = PASTE_TERM_RE.exec(line);
    if (t) {
      const season = (t[1] ?? t[4]).toLowerCase() as "spring" | "summer" | "fall";
      term = termKey(Number(t[2] ?? t[3]), season);
    }
    const codes: { code: string; end: number }[] = [];
    // In a line with capitalized subjects ("CSCE 121 Sec 501"), only all-caps
    // words count as subjects; an all-lowercase line ("csce 121, math 151")
    // is taken as typed codes.
    const hasCaps = /[A-Z]{3}/.test(line);
    for (const m of line.matchAll(PASTE_CODE_RE)) {
      if (NOT_SUBJECTS.has(m[1].toUpperCase())) continue;
      // ...except a typed code with no space ("csce221"), which no word looks like.
      if (hasCaps && m[1] !== m[1].toUpperCase() && /\s/.test(m[0])) continue;
      const code = normalizeCode(`${m[1]} ${m[2]}`);
      if (code) codes.push({ code, end: (m.index ?? 0) + m[0].length });
    }
    // A grade is only unambiguous when the line names a single course, and
    // only trusted as the sole token after the code ("CSCE 121 A") or right
    // after a number ("4.000 A"), so titles like "ENGINEERS I" don't count.
    let grade: Grade | null = null;
    if (codes.length === 1) {
      const tokens = line.slice(codes[0].end).trim().split(/\s+/).filter(Boolean);
      for (let i = tokens.length - 1; i >= 0; i--) {
        const g = GRADE_TOKEN_RE.exec(tokens[i]);
        if (g && (tokens.length === 1 || (i > 0 && /^\d+(\.\d+)?$/.test(tokens[i - 1])))) {
          grade = g[1] as Grade;
          break;
        }
      }
    }
    for (const { code } of codes) out.set(code, { code, grade, term });
  }
  return [...out.values()];
}
