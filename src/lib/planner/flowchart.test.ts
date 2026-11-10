// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildChart, chainOf, treeLinks, CREDIT_COLUMN, UNSCHEDULED_COLUMN } from "./flowchart.ts";
import type { PrereqNode } from "./prereqs.ts";
import { emptyRecord, upsertCourses } from "./record.ts";

const course = (code: string, concurrent = false): PrereqNode => ({
  type: "course",
  code,
  min_grade: null,
  concurrent,
});
const and = (...children: PrereqNode[]): PrereqNode => ({ type: "and", children });
const or = (...children: PrereqNode[]): PrereqNode => ({ type: "or", children });

test("treeLinks tells required, one-of and corequisite links apart", () => {
  const tree = and(course("CSCE 221"), or(course("CSCE 312"), course("ECEN 350")), course("MATH 251", true));
  assert.deepEqual(treeLinks(tree), [
    { code: "CSCE 221", kind: "required" },
    { code: "CSCE 312", kind: "one_of" },
    { code: "ECEN 350", kind: "one_of" },
    { code: "MATH 251", kind: "coreq" },
  ]);
  // A one-child "or" is just that course.
  assert.deepEqual(treeLinks(or(course("CSCE 120"))), [{ code: "CSCE 120", kind: "required" }]);
  assert.deepEqual(treeLinks(course("CSCE 120"), true), [{ code: "CSCE 120", kind: "coreq" }]);
});

test("buildChart places courses by term and flags out-of-order prerequisites", () => {
  const now = new Date("2026-11-01T00:00:00Z");
  const record = upsertCourses(
    emptyRecord(),
    [
      { code: "CSCE 120", status: "completed", term: null, source: "credit", credit: "transfer" },
      { code: "CSCE 221", status: "completed", term: "20253", grade: "A", source: "manual" },
      { code: "CSCE 313", status: "planned", term: "20271", source: "manual" },
      { code: "CSCE 312", status: "planned", term: "20273", source: "manual" },
      { code: "MATH 151", status: "completed", term: "20243", grade: "F", source: "manual" },
      { code: "CSCE 481", status: "in_progress", term: null, source: "manual" },
    ],
    now,
  );
  const chart = buildChart(
    record,
    {
      "CSCE 221": { prereqTree: course("CSCE 120"), coreqTree: null },
      "CSCE 313": { prereqTree: and(course("CSCE 221"), course("CSCE 312")), coreqTree: null },
      "CSCE 412": { prereqTree: course("CSCE 313"), coreqTree: null },
      "CSCE 312": { prereqTree: course("CSCE 221", true), coreqTree: null },
      "CSCE 481": { prereqTree: course("CSCE 312", true), coreqTree: null },
    },
    { currentTerm: "20263", extra: ["CSCE 412", "CSCE 221"] },
  );
  assert.deepEqual(
    chart.columns.map((c) => [c.key, c.courses]),
    [
      [CREDIT_COLUMN, ["CSCE 120"]],
      ["20253", ["CSCE 221"]],
      ["20263", ["CSCE 481"]], // in progress, no term: this term
      ["20271", ["CSCE 313"]],
      ["20273", ["CSCE 312"]],
      [UNSCHEDULED_COLUMN, ["CSCE 412"]],
    ],
  );
  const edge = (from: string, to: string) => chart.edges.find((e) => e.from === from && e.to === to);
  assert.equal(edge("CSCE 120", "CSCE 221")?.outOfOrder, false);
  assert.equal(edge("CSCE 221", "CSCE 313")?.outOfOrder, false);
  assert.equal(edge("CSCE 312", "CSCE 313")?.outOfOrder, true); // planned after the course needing it
  assert.equal(edge("CSCE 313", "CSCE 412")?.outOfOrder, false); // unscheduled: no judgment
  assert.equal(edge("CSCE 221", "CSCE 312")?.outOfOrder, false); // corequisite taken earlier: fine
  assert.equal(edge("CSCE 312", "CSCE 481")?.outOfOrder, true); // corequisite in a later term
  assert.equal(chart.columnOf.has("MATH 151"), false); // failed attempt left off
});

test("columns are ordered to follow their prerequisites", () => {
  const record = upsertCourses(emptyRecord(), [
    { code: "AAAA 101", status: "completed", term: "20243", source: "manual" },
    { code: "ZZZZ 101", status: "completed", term: "20243", source: "manual" },
    { code: "BBBB 201", status: "completed", term: "20251", source: "manual" },
    { code: "YYYY 201", status: "completed", term: "20251", source: "manual" },
  ]);
  const chart = buildChart(
    record,
    {
      "BBBB 201": { prereqTree: course("ZZZZ 101"), coreqTree: null },
      "YYYY 201": { prereqTree: course("AAAA 101"), coreqTree: null },
    },
    { currentTerm: "20263" },
  );
  assert.deepEqual(chart.columns[1].courses, ["YYYY 201", "BBBB 201"]);
});

test("chainOf follows prerequisites up and unlocks down", () => {
  const edges = [
    { from: "A", to: "B", kind: "required" as const, outOfOrder: false },
    { from: "B", to: "C", kind: "required" as const, outOfOrder: false },
    { from: "X", to: "C", kind: "required" as const, outOfOrder: false },
    { from: "C", to: "D", kind: "required" as const, outOfOrder: false },
  ];
  assert.deepEqual([...chainOf(edges, "B")].sort(), ["A", "B", "C", "D"]);
  assert.deepEqual([...chainOf(edges, "X")].sort(), ["C", "D", "X"]);
});
