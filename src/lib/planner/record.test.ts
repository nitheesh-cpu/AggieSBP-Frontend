// Run: npm test  (node --test with native TypeScript type stripping)
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  currentTermKey,
  defaultStatusForTerm,
  emptyRecord,
  mergeRecords,
  nextTermKey,
  normalizeCode,
  parsePastedCourses,
  recordKey,
  removeCourse,
  setClassification,
  termKeyFromCode,
  termLabel,
  updateCourse,
  upsertCourses,
} from "./record.ts";

const T1 = new Date("2026-11-01T10:00:00Z");
const T2 = new Date("2026-11-02T10:00:00Z");
const T3 = new Date("2026-11-03T10:00:00Z");

test("normalizeCode", () => {
  assert.equal(normalizeCode("csce121"), "CSCE 121");
  assert.equal(normalizeCode(" CSCE-121 "), "CSCE 121");
  assert.equal(normalizeCode("math 151h"), "MATH 151H");
  assert.equal(normalizeCode("CSCE"), null);
  assert.equal(normalizeCode("CSCE 1210"), null);
});

test("term keys", () => {
  assert.equal(termKeyFromCode("202631"), "20263");
  assert.equal(termKeyFromCode("202641"), null); // full-year professional term
  assert.equal(termLabel("20271"), "Spring 2027");
  assert.equal(termLabel(null), "No term");
  assert.equal(currentTermKey(new Date(2026, 10, 6)), "20263");
  assert.equal(currentTermKey(new Date(2027, 1, 1)), "20271");
  assert.equal(currentTermKey(new Date(2027, 5, 15)), "20272");
  const now = new Date(2026, 10, 6);
  assert.equal(defaultStatusForTerm("20261", now), "completed");
  assert.equal(defaultStatusForTerm("20263", now), "in_progress");
  assert.equal(defaultStatusForTerm("20271", now), "planned");
  assert.equal(defaultStatusForTerm(null, now), "completed");
  assert.equal(nextTermKey("20263"), "20271");
  assert.equal(nextTermKey("20271"), "20273");
  assert.equal(nextTermKey("20272"), "20273");
});

test("upsert, update, remove", () => {
  let r = upsertCourses(emptyRecord(), [
    { code: "math151", status: "completed", source: "manual", grade: "A" },
    { code: "CSCE 121", status: "completed", source: "manual" },
    { code: "junk", status: "completed", source: "manual" },
  ], T1);
  assert.deepEqual(r.courses.map((c) => c.code), ["CSCE 121", "MATH 151"]);
  r = updateCourse(r, "CSCE 121", { grade: "B", term: "20253" }, T2);
  const csce = r.courses.find((c) => c.code === "CSCE 121")!;
  assert.equal(csce.grade, "B");
  assert.equal(csce.term, "20253");
  assert.equal(csce.updatedAt, T2.toISOString());
  r = removeCourse(r, "MATH 151", T3);
  assert.equal(r.courses.find((c) => c.code === "MATH 151")!.deleted, true);
  // Re-adding a removed course clears the tombstone.
  r = upsertCourses(r, [{ code: "MATH 151", status: "completed", source: "paste" }], T3);
  assert.equal(r.courses.find((c) => c.code === "MATH 151")!.deleted, undefined);
});

test("merge keeps the newer edit per course and respects removals", () => {
  const base = upsertCourses(emptyRecord(), [
    { code: "CSCE 121", status: "completed", source: "manual" },
    { code: "MATH 151", status: "completed", source: "manual" },
  ], T1);
  // Device A: grades CSCE 121. Device B: removes MATH 151, adds STAT 211.
  const a = updateCourse(base, "CSCE 121", { grade: "A" }, T2);
  let b = removeCourse(base, "MATH 151", T2);
  b = upsertCourses(b, [{ code: "STAT 211", status: "planned", term: "20271", source: "manual" }], T3);
  const m1 = mergeRecords(a, b, T3);
  const m2 = mergeRecords(b, a, T3);
  assert.equal(recordKey(m1), recordKey(m2));
  const live = m1.courses.filter((c) => !c.deleted).map((c) => [c.code, c.grade ?? null]);
  assert.deepEqual(live, [["CSCE 121", "A"], ["STAT 211", null]]);
  assert.equal(m1.courses.find((c) => c.code === "MATH 151")!.deleted, true);
});

test("merge takes the newer classification and prunes old tombstones", () => {
  const a = setClassification(emptyRecord(), "sophomore", T1);
  const b = setClassification(emptyRecord(), "junior", T2);
  assert.equal(mergeRecords(a, b).classification, "junior");
  assert.equal(mergeRecords(b, a).classification, "junior");
  assert.equal(mergeRecords(a, null).classification, "sophomore");

  const old = removeCourse(
    upsertCourses(emptyRecord(), [{ code: "CSCE 121", status: "completed", source: "manual" }], T1),
    "CSCE 121",
    T1,
  );
  assert.equal(mergeRecords(old, null, new Date("2027-12-01")).courses.length, 0);
  assert.equal(mergeRecords(old, null, T2).courses.length, 1);
});

test("paste: comma list and one-per-line", () => {
  assert.deepEqual(
    parsePastedCourses("CSCE 121, csce221; MATH-151\nSTAT 211").map((c) => c.code),
    ["CSCE 121", "CSCE 221", "MATH 151", "STAT 211"],
  );
});

test("paste: transcript-style lines with terms and grades", () => {
  const text = [
    "Fall 2025 - College Station",
    "CSCE 121  INTRO PGM DESIGN CONCEPT   4.000  A   16.000",
    "PHYS 206  NEWTONIAN MECHANICS FOR ENGINEERS I  3.000  B  9.000",
    "ENGR 102  ENGR LAB I COMPUTATION",
    "Spring 2026",
    "CSCE 222 B",
    "MATH 251 3.000",
    "Term totals 13.000",
  ].join("\n");
  assert.deepEqual(parsePastedCourses(text), [
    { code: "CSCE 121", grade: "A", term: "20253" },
    { code: "PHYS 206", grade: "B", term: "20253" },
    { code: "ENGR 102", grade: null, term: "20253" }, // trailing "I" is the title
    { code: "CSCE 222", grade: "B", term: "20261" },
    { code: "MATH 251", grade: null, term: "20261" },
  ]);
});

test("paste: ignores years and non-course words", () => {
  assert.deepEqual(parsePastedCourses("Fall 2026\nPage 2 of 3\nTERM 101 totals"), []);
  assert.deepEqual(parsePastedCourses("CSCE 121 Sec 501 4.000 A"), [
    { code: "CSCE 121", grade: "A", term: null },
  ]);
  assert.deepEqual(
    parsePastedCourses("MATH 151 with 120 credits\nCSCE 222 and 101 stuff").map((c) => c.code),
    ["MATH 151", "CSCE 222"],
  );
  assert.deepEqual(
    parsePastedCourses("csce 121, math 151").map((c) => c.code),
    ["CSCE 121", "MATH 151"],
  );
});

test("merge tolerates a malformed copy", () => {
  const bad = {} as unknown as Parameters<typeof mergeRecords>[0];
  assert.deepEqual(mergeRecords(bad, null).courses, []);
});
