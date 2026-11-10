// Run: npm test  (node --test with native TypeScript type stripping)
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildContext, evaluateCourse, evaluateTree, treeCodes } from "./prereqs.ts";
import type { PrereqNode } from "./prereqs.ts";
import { emptyRecord, setClassification, upsertCourses } from "./record.ts";
import type { CourseInput } from "./record.ts";

const c = (code: string, min_grade: string | null = null, concurrent = false): PrereqNode => ({
  type: "course",
  code,
  min_grade,
  concurrent,
});
const and = (...children: PrereqNode[]): PrereqNode => ({ type: "and", children });
const or = (...children: PrereqNode[]): PrereqNode => ({ type: "or", children });
const juniorSenior: PrereqNode = { type: "classification", levels: ["junior", "senior"] };
const instructor: PrereqNode = { type: "approval", by: "instructor" };

function ctxFor(courses: Omit<CourseInput, "source">[], target = "20271", classification?: "junior") {
  let r = upsertCourses(emptyRecord(), courses.map((x) => ({ ...x, source: "manual" as const })));
  if (classification) r = setClassification(r, classification);
  return buildContext(r, target, { currentTerm: "20263" });
}

// CSCE 411: C or better in CSCE 221 and CSCE 222; junior/senior or approval.
const CSCE411 = and(c("CSCE 221", "C"), c("CSCE 222", "C"), or(juniorSenior, instructor));

test("AND needs every course; reports what's missing", () => {
  const r = evaluateTree(CSCE411, ctxFor([{ code: "CSCE 221", status: "completed" }], "20271", "junior"));
  assert.equal(r.status, "unmet");
  assert.deepEqual(r.missing, ["CSCE 222"]);
});

test("met when everything is done; classification unknown without one", () => {
  const done = [
    { code: "CSCE 221", status: "completed" as const, grade: "B" as const },
    { code: "CSCE 222", status: "completed" as const },
  ];
  assert.equal(evaluateTree(CSCE411, ctxFor(done, "20271", "junior")).status, "met");
  // No classification set: the junior/senior branch is unknown, which beats
  // the approval branch, so the result is unknown rather than approval.
  assert.equal(evaluateTree(CSCE411, ctxFor(done)).status, "unknown");
});

test("minimum grades", () => {
  const tree = c("CSCE 221", "C");
  assert.equal(evaluateTree(tree, ctxFor([{ code: "CSCE 221", status: "completed", grade: "D" }])).status, "unmet");
  assert.equal(evaluateTree(tree, ctxFor([{ code: "CSCE 221", status: "completed", grade: "C" }])).status, "met");
  assert.equal(evaluateTree(tree, ctxFor([{ code: "CSCE 221", status: "completed", grade: "S" }])).status, "met");
  // A failed course doesn't count as done at all.
  assert.equal(evaluateTree(c("CSCE 221"), ctxFor([{ code: "CSCE 221", status: "completed", grade: "F" }])).status, "unmet");
});

test("in-progress and planned courses count by term", () => {
  const record = [
    { code: "CSCE 221", status: "in_progress" as const, term: "20263" },
    { code: "CSCE 222", status: "planned" as const, term: "20271" },
  ];
  // Spring 2027: 221 finishes in fall; 222 is the same term (not concurrent-ok).
  let r = evaluateTree(CSCE411, ctxFor(record, "20271", "junior"));
  assert.deepEqual([r.status, r.missing], ["unmet", ["CSCE 222"]]);
  // Fall 2027: both done.
  r = evaluateTree(CSCE411, ctxFor(record, "20273", "junior"));
  assert.equal(r.status, "met");
  // Fall 2026 (current): nothing is finished yet.
  r = evaluateTree(CSCE411, ctxFor(record, "20263", "junior"));
  assert.deepEqual(r.missing, ["CSCE 221", "CSCE 222"]);
});

test("concurrent courses can be taken the same term", () => {
  const tree = c("CSCE 221", "C", true); // CSCE 314: 221 or concurrent enrollment
  const r = evaluateTree(tree, ctxFor([{ code: "CSCE 221", status: "planned", term: "20271" }]));
  assert.deepEqual([r.status, r.takeTogether], ["met", ["CSCE 221"]]);
});

test("OR picks the satisfiable branch, else the shortest path", () => {
  const tree = or(and(c("CSCE 312"), c("CSCE 314")), c("CSCE 350"));
  assert.deepEqual(evaluateTree(tree, ctxFor([])).missing, ["CSCE 350"]);
  assert.equal(evaluateTree(tree, ctxFor([
    { code: "CSCE 312", status: "completed" },
    { code: "CSCE 314", status: "completed" },
  ])).status, "met");
  // An approval branch is better than missing courses.
  assert.equal(evaluateTree(or(c("BIOL 351"), instructor), ctxFor([])).status, "approval");
});

test("OR prefers a branch with no same-term condition attached", () => {
  const tree = or(c("MATH 151", null, true), c("MATH 171"));
  const r = evaluateTree(tree, ctxFor([
    { code: "MATH 171", status: "completed" },
    { code: "MATH 151", status: "planned", term: "20271" },
  ]));
  assert.deepEqual([r.status, r.takeTogether], ["met", []]);
  assert.equal(evaluateTree({ type: "or", children: [] }, ctxFor([])).status, "met");
});

test("conditions are unknown, never silently met", () => {
  const tree = and(c("MATH 151"), { type: "condition", kind: "major", text: "Mathematics major" });
  assert.equal(evaluateTree(tree, ctxFor([{ code: "MATH 151", status: "completed" }])).status, "unknown");
});

test("evaluateCourse: taken, coreqs, no prereqs", () => {
  const ctx = ctxFor([
    { code: "CSCE 121", status: "completed" },
    { code: "PHYS 206", status: "planned", term: "20271" },
  ]);
  assert.equal(evaluateCourse("CSCE 121", null, ctx).status, "taken");
  assert.equal(evaluateCourse("ENGL 104", { prereqTree: null }, ctx).status, "met");
  // PHYS 226 needs PHYS 206 before or alongside.
  const phys226 = { prereqTree: null, coreqTree: c("PHYS 206") };
  assert.deepEqual(
    evaluateCourse("PHYS 226", phys226, ctx),
    { status: "met", missing: [], takeTogether: ["PHYS 206"] },
  );
  assert.equal(evaluateCourse("PHYS 226", phys226, ctxFor([])).status, "unmet");
});

test("treeCodes", () => {
  assert.deepEqual(treeCodes(CSCE411), ["CSCE 221", "CSCE 222"]);
  assert.deepEqual(treeCodes(null), []);
});
