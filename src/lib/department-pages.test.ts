// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import type { Department, Professor } from "./api.ts";
import {
  compareCourseCodes,
  departmentName,
  publishedDepartments,
  topProfessors,
} from "./department-pages.ts";
import {
  departmentCanonicalPath,
  departmentDescription,
  departmentTitle,
} from "./seo-metadata.ts";

const dept = (code: string, courses: number, name = `${code} - ${code} Studies`) =>
  ({ code, name, courses, avgGpa: 2.79 }) as unknown as Department;

test("departmentName strips the code prefix and falls back to the code", () => {
  assert.equal(departmentName({ code: "MATH", name: "MATH - Mathematics" }), "Mathematics");
  assert.equal(departmentName({ code: "MATH", name: "Mathematics" }), "Mathematics");
  assert.equal(departmentName({ code: "AALO", name: "AALO - " }), "AALO");
  assert.equal(departmentName({ code: "ENGR", name: "" }), "ENGR");
});

test("publishedDepartments keeps only departments with course data, sorted by code", () => {
  const out = publishedDepartments([dept("MATH", 86), dept("AALO", 0), dept("ACCT", 12)]);
  assert.deepEqual(
    out.map((d) => d.code),
    ["ACCT", "MATH"],
  );
});

test("topProfessors drops unreviewed professors, sorts by reviews and trims", () => {
  const p = (name: string, total_reviews: number) => ({ name, total_reviews }) as Professor;
  const out = topProfessors([p("Zed", 5), p("None", 0), p("Amy", 5), p("Top", 40)], 3);
  assert.deepEqual(
    out.map((x) => x.name),
    ["Top", "Amy", "Zed"],
  );
});

test("compareCourseCodes orders numerically inside a subject", () => {
  const codes = ["MATH 1000", "MATH 99", "MATH 152H", "MATH 152"];
  assert.deepEqual(codes.sort(compareCourseCodes), ["MATH 99", "MATH 152", "MATH 152H", "MATH 1000"]);
});

test("department title and description lead with the GPA", () => {
  const d = dept("MATH", 86, "MATH - Mathematics");
  assert.equal(departmentCanonicalPath("math"), "/departments/MATH");
  assert.equal(
    departmentTitle(d),
    "Texas A&M MATH Courses: Avg GPA 2.79 & Top Professors | AggieSB+",
  );
  const text = departmentDescription(d);
  assert.match(text, /^Mathematics \(MATH\) at Texas A&M: average GPA 2\.79 across 86 courses/);
  assert.ok(text.length <= 160, text);

  const noGpa = { ...d, avgGpa: null } as unknown as Department;
  assert.equal(departmentTitle(noGpa), "Texas A&M MATH Courses & Professors | AggieSB+");
  assert.doesNotMatch(departmentDescription(noGpa), /GPA \d/);
});
