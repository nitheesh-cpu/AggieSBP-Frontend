// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  combinations,
  formatTime,
  generateSchedules,
  parseTime,
  sectionAllowed,
  type Day,
  type GenCourse,
  type GenSection,
} from "./schedule.ts";

const t = (s: string) => parseTime(s)!;
const sec = (
  course: string,
  crn: string,
  days: Day[],
  start: string,
  end: string,
  easiness: number | null,
  extra: Partial<GenSection> = {},
): GenSection => ({
  crn,
  course,
  section: crn,
  type: "LEC",
  meetings: [{ days, start: t(start), end: t(end) }],
  open: true,
  instructor: easiness == null ? null : `Prof ${crn}`,
  easiness,
  ...extra,
});
const course = (code: string, sections: GenSection[], courseEasiness: number | null = null): GenCourse => ({
  code,
  sections,
  courseEasiness,
});

test("parses and formats times", () => {
  assert.equal(parseTime("09:10 AM"), 550);
  assert.equal(parseTime("12:00 PM"), 720);
  assert.equal(parseTime("12:30 AM"), 30);
  assert.equal(parseTime("1:50 PM"), 830);
  assert.equal(parseTime("13:50"), 830);
  assert.equal(parseTime(""), null);
  assert.equal(parseTime("TBA"), null);
  assert.equal(formatTime(830), "1:50p");
  assert.equal(formatTime(550), "9:10a");
});

test("combinations", () => {
  assert.deepEqual(combinations([1, 2, 3], 2), [[1, 2], [1, 3], [2, 3]]);
  assert.deepEqual(combinations([1, 2], 0), [[]]);
  assert.deepEqual(combinations([1], 2), []);
});

test("preferences filter sections", () => {
  const early = sec("A 101", "1", ["M", "W", "F"], "08:00 AM", "08:50 AM", 80);
  assert.equal(sectionAllowed(early, { earliest: t("09:00 AM") }), false);
  assert.equal(sectionAllowed(early, { daysOff: ["F"] }), false);
  assert.equal(sectionAllowed({ ...early, open: false }, { openOnly: true }), false);
  assert.equal(sectionAllowed(early, { earliest: t("08:00 AM"), daysOff: ["T"] }), true);
});

test("picks electives that fit around fixed classes, easiest first", () => {
  // Fixed: CSCE 482 MWF 10:20. Pool: pick 2 of three electives.
  const fixed = [course("CSCE 482", [sec("CSCE 482", "482", ["M", "W", "F"], "10:20 AM", "11:10 AM", 70)])];
  const electives = [
    // Easiest, but its only section clashes with CSCE 482.
    course("CSCE 413", [sec("CSCE 413", "413", ["M", "W", "F"], "10:20 AM", "11:10 AM", 95)]),
    course("CSCE 421", [
      sec("CSCE 421", "421a", ["T", "R"], "09:35 AM", "10:50 AM", 60),
      sec("CSCE 421", "421b", ["M", "W", "F"], "01:50 PM", "02:40 PM", 85),
    ]),
    course("CSCE 436", [sec("CSCE 436", "436", ["T", "R"], "11:10 AM", "12:25 PM", 75)]),
  ];
  const result = generateSchedules(fixed, [{ name: "CS electives", pick: 2, courses: electives }], {});
  assert.equal(result.tried, 3);
  assert.equal(result.found, 1); // only 421 + 436 can fit next to 482
  const best = result.options[0];
  assert.deepEqual(best.courses, ["CSCE 482", "CSCE 421", "CSCE 436"]);
  assert.deepEqual(best.schedules[0].sections.map((s) => s.crn).sort(), ["421b", "436", "482"]);
  // The other 421 section is kept as an alternative arrangement.
  assert.ok(best.schedules.some((s) => s.sections.some((x) => x.crn === "421a")));
});

test("unknown instructors are guesses and rank below known easy ones", () => {
  const known = course("STAT 211", [sec("STAT 211", "k", ["T", "R"], "09:35 AM", "10:50 AM", 80)], 80);
  const unknown = course("STAT 212", [sec("STAT 212", "u", ["T", "R"], "11:10 AM", "12:25 PM", null)], 82);
  const result = generateSchedules([], [{ name: "Stats", pick: 1, courses: [unknown, known] }], {});
  assert.deepEqual(result.options.map((o) => o.courses[0]), ["STAT 211", "STAT 212"]);
  const guessed = result.options[1].schedules[0];
  assert.deepEqual(guessed.uncertain, ["u"]);
  assert.equal(guessed.easiness, 82 - 8);
});

test("courses that can't fit the preferences are reported", () => {
  const result = generateSchedules(
    [course("GEOL 101", [sec("GEOL 101", "g", ["M", "W", "F"], "08:00 AM", "08:50 AM", 70)])],
    [],
    { earliest: t("09:00 AM") },
  );
  assert.deepEqual(result.impossible, ["GEOL 101"]);
  assert.equal(result.found, 0);
});

test("a course with a lecture and a lab needs one of each", () => {
  const chem = course("CHEM 107", [
    sec("CHEM 107", "lec", ["M", "W", "F"], "09:10 AM", "10:00 AM", 70),
    sec("CHEM 107", "lab1", ["M"], "09:10 AM", "11:00 AM", 70, { type: "LAB" }), // clashes with lecture
    sec("CHEM 107", "lab2", ["T"], "01:00 PM", "03:00 PM", 70, { type: "LAB" }),
  ]);
  const result = generateSchedules([chem], [], {});
  assert.deepEqual(result.options[0].schedules[0].sections.map((s) => s.crn).sort(), ["lab2", "lec"]);
});
