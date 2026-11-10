/**
 * Schedule generator: given the classes you must take and "pick N of these"
 * elective pools, find conflict-free section combinations and rank them by
 * how easy this term's actual sections are and how good the times are.
 *
 * Pure data, so `node --test` can run it.
 */

export type Day = "M" | "T" | "W" | "R" | "F" | "S" | "U";
export const WEEKDAYS: Day[] = ["M", "T", "W", "R", "F"];

export interface Meeting {
  days: Day[];
  /** Minutes after midnight. */
  start: number;
  end: number;
}

export interface GenSection {
  crn: string;
  course: string;
  section: string;
  /** "LEC", "LAB", ... A course with several types needs one of each. */
  type: string;
  meetings: Meeting[];
  open: boolean;
  instructor: string | null;
  /** 0-100 for this course with this instructor; null when there's no history. */
  easiness: number | null;
}

export interface GenCourse {
  code: string;
  sections: GenSection[];
  /** The course's typical easiness across instructors, used when a section's is unknown. */
  courseEasiness: number | null;
}

export interface Pool {
  name: string;
  pick: number;
  courses: GenCourse[];
}

export interface Preferences {
  /** Minutes after midnight; no class may start before it. */
  earliest?: number | null;
  /** No class may end after it. */
  latest?: number | null;
  daysOff?: Day[];
  openOnly?: boolean;
}

export interface Schedule {
  courses: string[];
  sections: GenSection[];
  score: number;
  /** Average section easiness used in the score (estimates included). */
  easiness: number;
  /** Sections whose easiness is a guess: no instructor yet, or no history. */
  uncertain: string[];
  days: number;
}

export interface Option {
  /** The courses picked, fixed ones first. */
  courses: string[];
  /** Best section arrangements for these courses, best first. */
  schedules: Schedule[];
}

export interface GenerateResult {
  options: Option[];
  /** Course sets tried / with at least one schedule. */
  tried: number;
  found: number;
  /** Courses with no section that fits the preferences at all. */
  impossible: string[];
  /** Stopped early because the search got too large. */
  truncated: boolean;
}

const UNKNOWN_PENALTY = 8;
const DEFAULT_EASINESS = 50;
const MAX_COURSE_SETS = 400;
const MAX_NODES = 200_000;

// ---------------------------------------------------------------------------
// Times
// ---------------------------------------------------------------------------

/** "09:10 AM" / "1:50 PM" / "13:50" -> minutes; null if unreadable. */
export function parseTime(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = /^\s*(\d{1,2}):(\d{2})\s*([AaPp][Mm])?\s*$/.exec(text);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ampm = m[3]?.toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")}${h < 12 ? "a" : "p"}`;
}

function overlaps(a: Meeting, b: Meeting): boolean {
  return a.start < b.end && b.start < a.end && a.days.some((d) => b.days.includes(d));
}

function sectionsConflict(a: GenSection, b: GenSection): boolean {
  return a.meetings.some((ma) => b.meetings.some((mb) => overlaps(ma, mb)));
}

/** Whether a section is allowed at all under the preferences. */
export function sectionAllowed(s: GenSection, prefs: Preferences): boolean {
  if (prefs.openOnly && !s.open) return false;
  for (const m of s.meetings) {
    if (prefs.earliest != null && m.start < prefs.earliest) return false;
    if (prefs.latest != null && m.end > prefs.latest) return false;
    if (prefs.daysOff?.some((d) => m.days.includes(d))) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function sectionScore(s: GenSection, course: GenCourse): { value: number; uncertain: boolean } {
  if (s.easiness != null) return { value: s.easiness, uncertain: false };
  // No instructor yet, or one with no history for this course: a guess.
  return { value: (course.courseEasiness ?? DEFAULT_EASINESS) - UNKNOWN_PENALTY, uncertain: true };
}

function daysUsed(sections: GenSection[]): number {
  const days = new Set<Day>();
  for (const s of sections) for (const m of s.meetings) for (const d of m.days) days.add(d);
  return days.size;
}

/** Minutes of idle time between classes, summed over the week. */
function gapMinutes(sections: GenSection[]): number {
  let total = 0;
  for (const day of WEEKDAYS) {
    const slots = sections
      .flatMap((s) => s.meetings)
      .filter((m) => m.days.includes(day))
      .sort((a, b) => a.start - b.start);
    for (let i = 1; i < slots.length; i++) total += Math.max(0, slots[i].start - slots[i - 1].end);
  }
  return total;
}

/** Easiness dominates; fewer days on campus and fewer long gaps break ties. */
function scoreSchedule(picks: { s: GenSection; c: GenCourse }[]): Schedule {
  const parts = picks.map(({ s, c }) => ({ s, ...sectionScore(s, c) }));
  const easiness = parts.reduce((sum, p) => sum + p.value, 0) / Math.max(parts.length, 1);
  const sections = picks.map((p) => p.s);
  const days = daysUsed(sections);
  const score = easiness - days * 0.75 - gapMinutes(sections) / 120;
  return {
    courses: [...new Set(sections.map((s) => s.course))],
    sections,
    score: Math.round(score * 10) / 10,
    easiness: Math.round(easiness),
    uncertain: parts.filter((p) => p.uncertain).map((p) => p.s.crn),
    days,
  };
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/** All ways to pick k items, keeping input order. */
export function combinations<T>(items: T[], k: number): T[][] {
  if (k <= 0) return [[]];
  if (k > items.length) return [];
  const out: T[][] = [];
  const walk = (start: number, acc: T[]) => {
    if (acc.length === k) {
      out.push(acc);
      return;
    }
    for (let i = start; i <= items.length - (k - acc.length); i++) walk(i + 1, [...acc, items[i]]);
  };
  walk(0, []);
  return out;
}

/** A course becomes one "slot" per section type (lecture, lab, ...). */
function slotsFor(course: GenCourse, prefs: Preferences): { course: GenCourse; options: GenSection[] }[] {
  const byType = new Map<string, GenSection[]>();
  for (const s of course.sections) {
    if (!sectionAllowed(s, prefs)) continue;
    byType.set(s.type, [...(byType.get(s.type) ?? []), s]);
  }
  // Every type the course offers must be covered, so a type with nothing allowed sinks it.
  const types = new Set(course.sections.map((s) => s.type));
  if (types.size === 0 || [...types].some((t) => !byType.has(t))) return [];
  return [...byType.values()].map((options) => ({
    course,
    options: [...options].sort((a, b) => sectionScore(b, course).value - sectionScore(a, course).value),
  }));
}

/**
 * Best `keep` section arrangements for one set of courses (branch and bound:
 * slots with the fewest sections first, best sections first, and a branch is
 * dropped once it can't beat the current results).
 */
function bestArrangements(
  courses: GenCourse[],
  prefs: Preferences,
  keep: number,
  budget: { nodes: number },
): Schedule[] {
  const slots = courses.flatMap((c) => slotsFor(c, prefs));
  const expectedSlots = courses.reduce(
    (n, c) => n + new Set(c.sections.map((s) => s.type)).size,
    0,
  );
  if (slots.length < expectedSlots || slots.length === 0) return [];
  slots.sort((a, b) => a.options.length - b.options.length);

  // Best possible easiness still available from slot i onward (for the bound).
  const bestRest: number[] = new Array(slots.length + 1).fill(0);
  for (let i = slots.length - 1; i >= 0; i--) {
    const top = slots[i].options[0];
    bestRest[i] = bestRest[i + 1] + sectionScore(top, slots[i].course).value;
  }

  const results: Schedule[] = [];
  const chosen: { s: GenSection; c: GenCourse }[] = [];
  let sum = 0;
  const walk = (i: number) => {
    if (budget.nodes-- <= 0) return;
    if (i === slots.length) {
      const schedule = scoreSchedule(chosen);
      results.push(schedule);
      results.sort((a, b) => b.score - a.score);
      if (results.length > keep) results.pop();
      return;
    }
    // Upper bound on the average easiness reachable from here.
    if (results.length === keep && (sum + bestRest[i]) / slots.length <= results[keep - 1].score) {
      return;
    }
    for (const s of slots[i].options) {
      if (chosen.some((p) => sectionsConflict(p.s, s))) continue;
      const v = sectionScore(s, slots[i].course).value;
      chosen.push({ s, c: slots[i].course });
      sum += v;
      walk(i + 1);
      chosen.pop();
      sum -= v;
      if (budget.nodes <= 0) return;
    }
  };
  walk(0);
  return results;
}

/**
 * Every way to fill the pools, each with its best schedules, ranked by the
 * best schedule. `perOption` is how many section arrangements to keep for
 * each course set (for "show another time").
 */
export function generateSchedules(
  fixed: GenCourse[],
  pools: Pool[],
  prefs: Preferences,
  opts: { limit?: number; perOption?: number } = {},
): GenerateResult {
  const limit = opts.limit ?? 15;
  const perOption = opts.perOption ?? 3;

  const impossible = [...fixed, ...pools.flatMap((p) => p.courses)]
    .filter((c) => slotsFor(c, prefs).length === 0)
    .map((c) => c.code);
  const usable = (c: GenCourse) => !impossible.includes(c.code);

  // Course choices per pool, most promising first so a capped search keeps the good ones.
  const promise = (c: GenCourse) =>
    Math.max(...c.sections.map((s) => sectionScore(s, c).value), -Infinity);
  const poolChoices = pools.map((p) =>
    combinations(
      [...p.courses].filter(usable).sort((a, b) => promise(b) - promise(a)),
      Math.max(0, p.pick),
    ),
  );

  let sets: GenCourse[][] = [fixed.filter(usable)];
  let truncated = false;
  for (const choices of poolChoices) {
    const next: GenCourse[][] = [];
    for (const base of sets) {
      for (const choice of choices) {
        // A course in two pools can't fill both.
        if (choice.some((c) => base.some((b) => b.code === c.code))) continue;
        next.push([...base, ...choice]);
        if (next.length >= MAX_COURSE_SETS) {
          truncated = true;
          break;
        }
      }
      if (next.length >= MAX_COURSE_SETS) break;
    }
    sets = next;
  }
  if (fixed.some((c) => !usable(c))) sets = []; // a required class can't fit at all

  const budget = { nodes: MAX_NODES };
  const options: Option[] = [];
  for (const set of sets) {
    const schedules = bestArrangements(set, prefs, perOption, budget);
    if (schedules.length) options.push({ courses: set.map((c) => c.code), schedules });
    if (budget.nodes <= 0) {
      truncated = true;
      break;
    }
  }
  options.sort((a, b) => b.schedules[0].score - a.schedules[0].score);
  return {
    options: options.slice(0, limit),
    tried: sets.length,
    found: options.length,
    impossible,
    truncated,
  };
}
