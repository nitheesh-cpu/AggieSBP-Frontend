// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import { howdyToInputs, parseHowdyFragment, parseHowdyPayload } from "./howdy.ts";

const course = (over: Record<string, unknown> = {}) => ({
  code: "CSCE 221",
  title: "DATA STRUC & ALGORITHMS",
  credits: 4,
  term: "20253",
  status: "completed",
  grade: "A",
  transfer: false,
  ...over,
});

const payload = (courses: unknown[], over: Record<string, unknown> = {}) =>
  JSON.stringify({ v: 1, source: "howdy-degree-planner", exportedAt: "2026-11-07T00:00:00Z", courses, ...over });

const fragment = (json: string) =>
  "#howdy=" +
  Buffer.from(json, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

test("round-trips a fragment from the extension", () => {
  const parsed = parseHowdyFragment(fragment(payload([course(), course({ code: "ENGL 104", title: "COMPOSITION & RHÉTORIC", term: null, grade: null, transfer: true })])));
  assert.ok(parsed);
  assert.equal(parsed.courses.length, 2);
  assert.equal(parsed.courses[1].title, "COMPOSITION & RHÉTORIC");
  assert.equal(parsed.courses[1].transfer, true);
});

test("rejects anything that isn't a Howdy export", () => {
  assert.equal(parseHowdyFragment(""), null);
  assert.equal(parseHowdyFragment("#howdy="), null);
  assert.equal(parseHowdyFragment("#howdy=!!!"), null);
  assert.equal(parseHowdyFragment("#other=abc"), null);
  assert.equal(parseHowdyPayload("not json"), null);
  assert.equal(parseHowdyPayload(payload([course()], { source: "elsewhere" })), null);
  assert.equal(parseHowdyPayload(payload([course()], { v: 2 })), null);
  assert.equal(parseHowdyPayload(payload([])), null); // nothing to import
  assert.equal(parseHowdyPayload(payload(Array.from({ length: 201 }, () => course()))), null);
});

test("drops bad entries and cleans fields", () => {
  const parsed = parseHowdyPayload(
    payload([
      course(),
      course(), // duplicate
      course({ code: "<script>" }),
      course({ code: "MATH 151", status: "graduated" }),
      course({ code: "stat 211", term: "2025", grade: "Z", credits: 999 }),
    ]),
  );
  assert.ok(parsed);
  assert.deepEqual(
    parsed.courses.map((c) => [c.code, c.term, c.grade, c.credits]),
    [
      ["CSCE 221", "20253", "A", 4],
      ["STAT 211", null, null, null],
    ],
  );
});

test("maps to record entries, marking transfer credit", () => {
  const inputs = howdyToInputs([
    { code: "CSCE 221", title: "", credits: 4, term: "20253", status: "completed", grade: "A", transfer: false },
    { code: "ENGL 104", title: "", credits: 3, term: null, status: "completed", grade: null, transfer: true },
  ]);
  assert.deepEqual(inputs, [
    { code: "CSCE 221", status: "completed", term: "20253", grade: "A", source: "paste", credit: null },
    { code: "ENGL 104", status: "completed", term: null, grade: null, source: "credit", credit: "transfer" },
  ]);
});

test("accepts requirement groups, with or without courses", () => {
  const parsed = parseHowdyPayload(
    payload([], {
      requirements: [
        { name: "Communication · ENGL 103 or ENGL 104", area: "Communication", kind: "choice", pick: 1, options: [["ENGL 103"], ["engl 104"]], hours: 3, met: true },
        { name: "Supporting Coursework · Emphasis Area (12 hrs)", area: "Supporting Coursework", kind: "elective", pick: 4, options: [], hours: 12, met: false },
        { name: "bad kind", area: "", kind: "magic", pick: 1, options: [], hours: null, met: false },
        { name: "bad codes", area: "", kind: "choice", pick: 99, options: [["<b>"], ["MATH 151"]], hours: null, met: false },
      ],
    }),
  );
  assert.ok(parsed);
  assert.equal(parsed.courses.length, 0);
  assert.deepEqual(
    parsed.requirements.map((r) => [r.name.split(" · ")[1] ?? r.name, r.kind, r.pick, r.options]),
    [
      ["ENGL 103 or ENGL 104", "choice", 1, [["ENGL 103"], ["ENGL 104"]]],
      ["Emphasis Area (12 hrs)", "elective", 4, []],
      ["bad codes", "choice", 20, [["MATH 151"]]],
    ],
  );
});

test("keeps Howdy's allowed list separate from the options", () => {
  const parsed = parseHowdyPayload(
    payload([], {
      requirements: [
        { name: "Elective (9 hrs)", area: "Statistics Minor", kind: "choice", pick: 3, options: [["STAT 404"]], allowed: ["STAT 315", "stat 404", "<x>"], hours: 9, met: false },
      ],
    }),
  );
  assert.ok(parsed);
  assert.deepEqual(parsed.requirements[0].options, [["STAT 404"]]);
  assert.deepEqual(parsed.requirements[0].allowed, ["STAT 315", "STAT 404"]);
});
