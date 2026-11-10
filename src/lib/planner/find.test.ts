// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import { collapseRows, courseState, isCovered, isDone, tierOf } from "./find.ts";
import { emptyRecord, upsertCourses } from "./record.ts";

const row = (dept: string, num: string, easiness: number, last?: string) => ({
  dept,
  courseNumber: num,
  courseTitle: `${dept} ${num} title`,
  credits: "3",
  easinessScore: easiness,
  professor: last ? { firstName: "A", lastName: last } : undefined,
});

test("collapseRows keeps one row per course with the best professor", () => {
  const out = collapseRows([
    {
      rows: [
        row("CSCE", "310", 60, "Smith"),
        row("CSCE", "310", 82, "Jones"),
        row("CSCE", "411", 70, "Lee"),
        row("csce", "310", 50, "Smith"),
      ],
    },
  ]);
  assert.deepEqual(
    out.map((c) => [c.code, c.easiness, c.bestProfessor, c.professorCount]),
    [
      ["CSCE 310", 82, "A Jones", 2],
      ["CSCE 411", 70, "A Lee", 1],
    ],
  );
});

test("collapseRows flags a best professor without grade data", () => {
  const noGrades = (easiness: number, last: string, hasGradeData?: boolean) => ({
    ...row("CSCE", "489", easiness, last),
    professor: { firstName: "A", lastName: last, hasGradeData },
  });
  const [flagged] = collapseRows([{ rows: [noGrades(60, "Smith", true), noGrades(64, "Ioerger", false)] }]);
  assert.equal(flagged.bestProfessor, "A Ioerger");
  assert.equal(flagged.bestHasGradeData, false);
  const [withGrades] = collapseRows([{ rows: [noGrades(70, "Smith", true), noGrades(64, "Ioerger", false)] }]);
  assert.equal(withGrades.bestHasGradeData, true);
  // Field absent (older responses) counts as having grade data.
  const [absent] = collapseRows([{ rows: [row("CSCE", "310", 60, "Lee")] }]);
  assert.equal(absent.bestHasGradeData, true);
});

test("collapseRows merges UCC categories and ignores TBA professors", () => {
  const out = collapseRows([
    { category: "Creative Arts", rows: [row("ARTS", "149", 90, "TBA")] },
    { category: "Cultural Discourse", rows: [row("ARTS", "149", 90)] },
  ]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].categories, ["Creative Arts", "Cultural Discourse"]);
  assert.equal(out[0].bestProfessor, null);
  assert.equal(out[0].professorCount, 0);
});

test("tierOf maps eligibility to tiers", () => {
  assert.equal(tierOf(null), "pending");
  assert.equal(tierOf({ status: "taken" }), "taken");
  assert.equal(tierOf({ status: "met", missing: [], takeTogether: [] }), "ready");
  assert.equal(tierOf({ status: "approval", missing: [], takeTogether: [] }), "ready");
  assert.equal(tierOf({ status: "unknown", missing: [], takeTogether: [] }), "maybe");
  assert.equal(tierOf({ status: "unmet", missing: ["CSCE 221"], takeTogether: [] }), "one_away");
  assert.equal(
    tierOf({ status: "unmet", missing: ["CSCE 221", "CSCE 222"], takeTogether: [] }),
    "locked",
  );
});

test("courseState prefers the record over eligibility", () => {
  const now = new Date("2026-11-01T00:00:00Z");
  const record = upsertCourses(
    emptyRecord(),
    [
      { code: "CSCE 121", status: "completed", grade: "A", source: "manual" },
      { code: "CSCE 221", status: "in_progress", term: "20263", source: "manual" },
      { code: "CSCE 222", status: "planned", term: "20271", source: "manual" },
      { code: "MATH 151", status: "completed", grade: "F", source: "manual" },
    ],
    now,
  );
  const met = { status: "met" as const, missing: [], takeTogether: [] };
  assert.equal(courseState(record, "CSCE 121", met), "done");
  assert.equal(courseState(record, "CSCE 221", met), "in_progress");
  assert.equal(courseState(record, "CSCE 222", met), "planned");
  assert.equal(courseState(record, "MATH 151", met), "ready"); // failed: retake
  assert.equal(courseState(record, "CSCE 313", { status: "taken" }), "planned");
  assert.equal(isDone(record, "CSCE 121"), true);
  assert.equal(isDone(record, "CSCE 221"), false);
  assert.equal(isCovered(record, "CSCE 222"), true);
  assert.equal(isCovered(record, "MATH 151"), false);
});

test("collapseRows splits special topics into one candidate per topic", () => {
  const topicRow = (num: string, title: string, easiness: number, last: string) => ({
    ...row("CSCE", num, easiness, last),
    courseTitle: title,
  });
  const out = collapseRows([
    {
      rows: [
        topicRow("489", "SPTP: COMPUTER VISION", 60, "Kalantari"),
        topicRow("489", "SPTP: AI TOOLS FOR INFERENCE", 80, "Ioerger"),
        topicRow("489", "SPTP: AGENTIC AI", 70, "Zhou"),
        topicRow("489", "SPTP: AGENTIC AI", 50, "Other"),
        topicRow("310", "DATA STRUCTURES", 65, "Lee"),
      ],
    },
  ]);
  assert.deepEqual(
    out.map((c) => [c.key, c.code, c.topic, c.title, c.bestProfessor, c.professorCount]),
    [
      ["CSCE 489|AI TOOLS FOR INFERENCE", "CSCE 489", "AI TOOLS FOR INFERENCE", "AI Tools for Inference", "A Ioerger", 1],
      ["CSCE 489|AGENTIC AI", "CSCE 489", "AGENTIC AI", "Agentic AI", "A Zhou", 2],
      ["CSCE 310", "CSCE 310", null, "DATA STRUCTURES", "A Lee", 1],
      ["CSCE 489|COMPUTER VISION", "CSCE 489", "COMPUTER VISION", "Computer Vision", "A Kalantari", 1],
    ],
  );
});

test("collapseRows merges differently truncated titles of one topic", () => {
  const t = (title: string, last: string) => ({ ...row("MEEN", "489", 60, last), courseTitle: title });
  const out = collapseRows([
    { rows: [t("SPTP: MICROELECTROMECH DEV SY", "A"), t("SPTP: MICROELECTROMECH DEV SYS", "B")] },
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].topic, "MICROELECTROMECH DEV SYS");
  assert.equal(out[0].professorCount, 2);
});

test("collapseRows leaves regular courses with a null topic and the code as key", () => {
  const [c] = collapseRows([{ rows: [row("CSCE", "310", 60, "Lee")] }]);
  assert.equal(c.topic, null);
  assert.equal(c.key, "CSCE 310");
});
