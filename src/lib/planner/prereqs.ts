/**
 * Evaluate prerequisite trees (from GET /courses/prereqs) against a student's
 * academic record, as of a target term.
 *
 * Tree shapes match backend pipelines/courses/prereq_parser.py. Results are
 * four-valued so the UI can be honest about what it can't check:
 *   met       - satisfied by the record
 *   approval  - needs someone's approval (instructor, department...)
 *   unknown   - depends on something not in the record (major, placement,
 *               "or equivalent", classification when none is set)
 *   unmet     - missing required courses (listed in `missing`)
 *
 * Only type imports, so `node --test` can run the tests directly.
 */

import type { AcademicRecord } from "./record";

export type PrereqNode =
  | { type: "and" | "or"; children: PrereqNode[] }
  | { type: "course"; code: string; min_grade: string | null; concurrent: boolean }
  | { type: "classification"; levels: string[] }
  | { type: "approval"; by: string }
  | { type: "condition"; kind: string; text: string };

export type ReqStatus = "met" | "approval" | "unknown" | "unmet";

export interface EvalResult {
  status: ReqStatus;
  /** Courses still needed, along the cheapest way to satisfy the tree. */
  missing: string[];
  /** Courses that must be taken in the target term alongside this one. */
  takeTogether: string[];
}

export interface EvalContext {
  /** Courses finished before the target term, with grade when known. */
  done: Map<string, string | null>;
  /** Courses taken in the target term (can satisfy concurrent requirements). */
  sameTerm: Set<string>;
  classification: string | null;
}

const RANK: Record<ReqStatus, number> = { unmet: 0, approval: 1, unknown: 2, met: 3 };
const GRADE_POINTS: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
const NOT_PASSED = new Set(["F", "U", "Q", "W", "I"]);

/**
 * What the record says will be finished by `targetTerm` (a term key like
 * "20271"). Completed courses count regardless of term. In-progress and
 * planned courses count if their term is earlier; same-term ones go to
 * `sameTerm`. In-progress courses without a term are assumed to finish
 * before any later term.
 */
export function buildContext(
  record: AcademicRecord,
  targetTerm: string,
  opts: { currentTerm?: string; alsoThisTerm?: string[] } = {},
): EvalContext {
  const done = new Map<string, string | null>();
  const sameTerm = new Set<string>(opts.alsoThisTerm ?? []);
  for (const c of record.courses) {
    if (c.deleted) continue;
    if (c.status === "completed") {
      if (!c.grade || !NOT_PASSED.has(c.grade)) done.set(c.code, c.grade ?? null);
      continue;
    }
    const term = c.term ?? (c.status === "in_progress" ? opts.currentTerm ?? null : null);
    if (!term) continue;
    if (term < targetTerm) done.set(c.code, null);
    else if (term === targetTerm) sameTerm.add(c.code);
  }
  return { done, sameTerm, classification: record.classification ?? null };
}

function meetsGrade(grade: string | null, min: string | null): boolean {
  if (!min || !grade || !(grade in GRADE_POINTS)) return true; // S/P or unknown grade
  return GRADE_POINTS[grade] >= (GRADE_POINTS[min] ?? 0);
}

const MET: EvalResult = { status: "met", missing: [], takeTogether: [] };

export function evaluateTree(tree: PrereqNode | null | undefined, ctx: EvalContext): EvalResult {
  if (!tree) return MET;
  switch (tree.type) {
    case "course": {
      if (ctx.done.has(tree.code) && meetsGrade(ctx.done.get(tree.code) ?? null, tree.min_grade)) {
        return MET;
      }
      if (tree.concurrent && ctx.sameTerm.has(tree.code)) {
        return { status: "met", missing: [], takeTogether: [tree.code] };
      }
      return { status: "unmet", missing: [tree.code], takeTogether: [] };
    }
    case "classification":
      if (!ctx.classification) return { status: "unknown", missing: [], takeTogether: [] };
      return tree.levels.includes(ctx.classification)
        ? MET
        : { status: "unmet", missing: [], takeTogether: [] };
    case "approval":
      return { status: "approval", missing: [], takeTogether: [] };
    case "condition":
      return { status: "unknown", missing: [], takeTogether: [] };
    case "and": {
      const kids = tree.children.map((c) => evaluateTree(c, ctx));
      const status = kids.reduce<ReqStatus>(
        (worst, k) => (RANK[k.status] < RANK[worst] ? k.status : worst),
        "met",
      );
      return {
        status,
        missing: unique(kids.flatMap((k) => k.missing)),
        takeTogether: unique(kids.flatMap((k) => k.takeTogether)),
      };
    }
    case "or": {
      const kids = tree.children.map((c) => evaluateTree(c, ctx));
      if (kids.length === 0) return MET;
      // Best status wins; among equals, the branch needing the fewest courses,
      // then the one with the fewest same-term conditions attached.
      const best = kids.reduce((a, b) => {
        if (RANK[b.status] !== RANK[a.status]) return RANK[b.status] > RANK[a.status] ? b : a;
        if (b.missing.length !== a.missing.length) return b.missing.length < a.missing.length ? b : a;
        return b.takeTogether.length < a.takeTogether.length ? b : a;
      });
      if (best.status !== "unmet") return best;
      // Nothing satisfiable: suggest the shortest path that has courses to take.
      const withCourses = kids.filter((k) => k.missing.length > 0);
      return withCourses.length
        ? withCourses.reduce((a, b) => (b.missing.length < a.missing.length ? b : a))
        : best;
    }
  }
}

export interface CoursePrereqInfo {
  prereqTree?: PrereqNode | null;
  coreqTree?: PrereqNode | null;
}

export type Eligibility =
  | { status: "taken" }
  | ({ status: ReqStatus } & Omit<EvalResult, "status">);

/**
 * Can the student take `code` in the target term? "taken" if the record
 * already has it completed (passed) or scheduled before that term.
 * Corequisites count when done earlier or taken in the same term.
 */
export function evaluateCourse(
  code: string,
  info: CoursePrereqInfo | null | undefined,
  ctx: EvalContext,
): Eligibility {
  if (ctx.done.has(code)) return { status: "taken" };
  const pre = evaluateTree(info?.prereqTree, ctx);
  const co = evaluateTree(info?.coreqTree ? asConcurrent(info.coreqTree) : null, ctx);
  const status = RANK[co.status] < RANK[pre.status] ? co.status : pre.status;
  return {
    status,
    missing: unique([...pre.missing, ...co.missing]),
    takeTogether: unique([...pre.takeTogether, ...co.takeTogether]),
  };
}

function asConcurrent(tree: PrereqNode): PrereqNode {
  if (tree.type === "course") return { ...tree, concurrent: true };
  if (tree.type === "and" || tree.type === "or") {
    return { ...tree, children: tree.children.map(asConcurrent) };
  }
  return tree;
}

/** Every course code referenced by a tree. */
export function treeCodes(tree: PrereqNode | null | undefined): string[] {
  if (!tree) return [];
  if (tree.type === "course") return [tree.code];
  if (tree.type === "and" || tree.type === "or") return unique(tree.children.flatMap(treeCodes));
  return [];
}

function unique(xs: string[]): string[] {
  return [...new Set(xs)];
}
