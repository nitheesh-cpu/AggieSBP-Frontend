/**
 * Courses sent over from the Howdy degree planner by the AggieSB+ extension.
 *
 * The extension opens /planner#howdy=<base64url JSON>. The fragment never
 * reaches a server, and the page shows everything for review before saving.
 * Anyone can craft such a link, so the payload is validated strictly and is
 * only ever a suggestion the student confirms.
 *
 * No runtime imports, so `node --test` can run the tests directly.
 */

import type { CourseInput, CourseStatus, Grade } from "./record";

export interface HowdyCourse {
  code: string;
  title: string;
  credits: number | null;
  term: string | null;
  status: CourseStatus;
  grade: Grade | null;
  transfer: boolean;
}

/** A requirement group from Howdy's degree evaluation. */
export interface HowdyRequirement {
  name: string;
  area: string;
  /**
   * fixed: set courses, all required. choice: pick from a known list.
   * elective: Howdy doesn't list the options; the student fills them in.
   */
  kind: "fixed" | "choice" | "elective";
  pick: number;
  options: string[][];
  /** Courses Howdy says can count ("Select from ..."), when it lists them. */
  allowed: string[];
  hours: number | null;
  /** Howdy already counts it as met (taken, registered or planned). */
  met: boolean;
}

export interface HowdyImport {
  exportedAt: string;
  courses: HowdyCourse[];
  requirements: HowdyRequirement[];
}

const MAX_COURSES = 200;
const MAX_REQUIREMENTS = 100;
const KINDS = new Set(["fixed", "choice", "elective"]);
const MAX_FRAGMENT = 60_000;
const STATUSES = new Set<CourseStatus>(["completed", "in_progress", "planned"]);
const GRADES = new Set<string>(["A", "B", "C", "D", "F", "S", "U", "P", "Q", "W", "I"]);
const CODE_RE = /^([A-Z]{3,4}) (\d{3}[A-Z]?)$/;
const TERM_RE = /^\d{4}[1-3]$/;

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function decodeBase64Url(text: string): string | null {
  try {
    const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function toCourse(x: unknown): HowdyCourse | null {
  if (!isObj(x)) return null;
  const code = typeof x.code === "string" ? x.code.trim().toUpperCase() : "";
  if (!CODE_RE.test(code)) return null;
  if (typeof x.status !== "string" || !STATUSES.has(x.status as CourseStatus)) return null;
  const term = typeof x.term === "string" && TERM_RE.test(x.term) ? x.term : null;
  const grade = typeof x.grade === "string" && GRADES.has(x.grade) ? (x.grade as Grade) : null;
  const credits =
    typeof x.credits === "number" && Number.isFinite(x.credits) && x.credits >= 0 && x.credits <= 20
      ? x.credits
      : null;
  return {
    code,
    title: typeof x.title === "string" ? x.title.slice(0, 120) : "",
    credits,
    term,
    status: x.status as CourseStatus,
    grade,
    transfer: x.transfer === true,
  };
}

function toRequirement(x: unknown): HowdyRequirement | null {
  if (!isObj(x) || typeof x.name !== "string" || !x.name.trim()) return null;
  if (typeof x.kind !== "string" || !KINDS.has(x.kind)) return null;
  if (!Array.isArray(x.options) || x.options.length > 60) return null;
  const options: string[][] = [];
  for (const raw of x.options) {
    if (!Array.isArray(raw)) return null;
    const codes = raw
      .filter((c): c is string => typeof c === "string")
      .map((c) => c.trim().toUpperCase())
      .filter((c) => CODE_RE.test(c));
    if (codes.length > 0 && codes.length <= 10) options.push([...new Set(codes)]);
  }
  const pick =
    typeof x.pick === "number" && Number.isInteger(x.pick) ? Math.min(Math.max(x.pick, 1), 20) : 1;
  const allowed = Array.isArray(x.allowed)
    ? [
        ...new Set(
          x.allowed
            .slice(0, 80)
            .filter((c): c is string => typeof c === "string")
            .map((c) => c.trim().toUpperCase())
            .filter((c) => CODE_RE.test(c)),
        ),
      ]
    : [];
  return {
    name: x.name.trim().slice(0, 120),
    area: typeof x.area === "string" ? x.area.slice(0, 80) : "",
    kind: x.kind as HowdyRequirement["kind"],
    pick,
    options,
    allowed,
    hours: typeof x.hours === "number" && Number.isFinite(x.hours) ? x.hours : null,
    met: x.met === true,
  };
}

/** Rule names repeat across areas ("Required courses"), so key on both. */
export function requirementKey(r: { area?: string | null; name: string }): string {
  return `${r.area ?? ""}\u0000${r.name}`;
}

/** Parse the JSON payload; null if it isn't a Howdy export. */
export function parseHowdyPayload(json: string): HowdyImport | null {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  if (!isObj(data) || data.v !== 1 || data.source !== "howdy-degree-planner") return null;
  const rawCourses = data.courses ?? [];
  const rawRequirements = data.requirements ?? [];
  if (!Array.isArray(rawCourses) || rawCourses.length > MAX_COURSES) return null;
  if (!Array.isArray(rawRequirements) || rawRequirements.length > MAX_REQUIREMENTS) return null;
  const seen = new Set<string>();
  const courses: HowdyCourse[] = [];
  for (const raw of rawCourses) {
    const course = toCourse(raw);
    if (course && !seen.has(course.code)) {
      seen.add(course.code);
      courses.push(course);
    }
  }
  const names = new Set<string>();
  const requirements: HowdyRequirement[] = [];
  for (const raw of rawRequirements) {
    const req = toRequirement(raw);
    if (req && !names.has(requirementKey(req))) {
      names.add(requirementKey(req));
      requirements.push(req);
    }
  }
  if (courses.length === 0 && requirements.length === 0) return null;
  return {
    exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : "",
    courses,
    requirements,
  };
}

/** Read "#howdy=..." from a URL hash; null if absent or invalid. */
export function parseHowdyFragment(hash: string): HowdyImport | null {
  const match = /^#?howdy=([A-Za-z0-9_-]+)$/.exec(hash);
  if (!match || match[1].length > MAX_FRAGMENT) return null;
  const json = decodeBase64Url(match[1]);
  return json ? parseHowdyPayload(json) : null;
}

/** Record entries for the chosen courses. Howdy wins over what's already there. */
export function howdyToInputs(courses: HowdyCourse[]): CourseInput[] {
  return courses.map((c) => ({
    code: c.code,
    status: c.status,
    term: c.term,
    grade: c.grade,
    source: c.transfer ? "credit" : "paste",
    credit: c.transfer ? "transfer" : null,
  }));
}

/** Keep a pending import across the sign-in redirect (sessionStorage). */
export function serializeHowdy(data: HowdyImport): string {
  return JSON.stringify({ v: 1, source: "howdy-degree-planner", ...data });
}
