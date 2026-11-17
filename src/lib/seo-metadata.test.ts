// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import type { CourseDetail, ProfessorDetail } from "./api.ts";
import {
  courseCanonicalPath,
  courseDescription,
  courseTitle,
  formatCourseCode,
  mainCourses,
  professorCanonicalPath,
  professorDescription,
  professorReviewsTitle,
  professorTitle,
} from "./seo-metadata.ts";

const course = {
  code: "MATH 152",
  name: "Engineering Mathematics II",
  avgGPA: 2.7,
  gpaScope: "recent",
  professors: [
    { id: "a", name: "A", courseReviewCount: 100 },
    { id: "b", name: "B", courseReviewCount: 20 },
  ],
} as unknown as CourseDetail;

const professor = {
  id: "VGVhY2hlci0yODQ3MjM=",
  name: "Doug Klein",
  overall_rating: 1.8000000000000003,
  total_reviews: 31,
  would_take_again_percent: 33.3,
  departments: [],
  courses: [
    { course_id: "PHYS218", course_name: null, reviews_count: 11, avg_rating: 2 },
    { course_id: "PHYS206", course_name: null, reviews_count: 15, avg_rating: 2 },
    { course_id: "PHYS 218", course_name: null, reviews_count: 1, avg_rating: 2 },
    { course_id: "CHEM107", course_name: null, reviews_count: 0, avg_rating: null, gpa_students: 40 },
    { course_id: "202", course_name: null, reviews_count: 30, avg_rating: 3 },
  ],
} as unknown as ProfessorDetail;

test("formatCourseCode spaces and uppercases", () => {
  assert.equal(formatCourseCode("msen325"), "MSEN 325");
  assert.equal(formatCourseCode("MATH 152"), "MATH 152");
});

test("courseTitle matches the search shape and falls back", () => {
  assert.equal(
    courseTitle(course),
    "MATH 152: Engineering Mathematics II – Grades, Professors & Reviews | Texas A&M",
  );
  assert.equal(
    courseTitle({ code: "MATH 152", name: "" }),
    "MATH 152 – Grades, Professors & Reviews | Texas A&M",
  );
  const long = courseTitle({
    code: "ECEN 489",
    name: "Special Topics in Advanced Machine Learning Systems for Embedded Hardware",
  });
  assert.ok(long.length <= 80, long);
  assert.ok(long.startsWith("ECEN 489: Special Topics"), long);
  assert.ok(long.endsWith("– Grades & Professors | Texas A&M"), long);
});

test("courseDescription mentions GPA, professors and reviews", () => {
  const d = courseDescription(course);
  assert.match(d, /average GPA 2\.70/);
  assert.match(d, /2 professors/);
  assert.match(d, /120 student reviews/);
  assert.ok(d.length <= 160, d);
  assert.doesNotMatch(courseDescription({ ...course, avgGPA: -1 }), /GPA -1/);
});

test("canonical paths use the API's ids", () => {
  assert.equal(courseCanonicalPath({ code: "PBSI 107" }), "/course/PBSI107");
  assert.equal(professorCanonicalPath(professor), "/professor/VGVhY2hlci0yODQ3MjM=");
});

test("professor title and description", () => {
  assert.equal(
    professorTitle(professor),
    "Doug Klein – Texas A&M Professor Ratings, Reviews & Grades",
  );
  assert.deepEqual(mainCourses(professor), ["PHYS 206", "PHYS 218", "CHEM 107"]);
  const d = professorDescription(professor);
  assert.match(d, /rated 1\.8\/5 from 31 student reviews/);
  assert.match(d, /33% would take again/);
  assert.match(d, /Teaches PHYS 206, PHYS 218 and CHEM 107/);
  assert.ok(d.length <= 160, d);
  assert.equal(
    professorReviewsTitle(professor),
    "Doug Klein Reviews – 31 Student Reviews | Texas A&M",
  );
});

test("professor without reviews gets no rating claims", () => {
  const none = { ...professor, overall_rating: null, total_reviews: 0, would_take_again_percent: null };
  const d = professorDescription(none);
  assert.doesNotMatch(d, /rated|would take again/);
});
