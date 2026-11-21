// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  appPlatform,
  classifyQuery,
  endpointTemplate,
  isReportableApiError,
  normalizeQuery,
  pageFrom,
} from "./analytics.ts";

test("appPlatform tells iOS (including iPadOS), Android and desktop apart", () => {
  const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15";
  const ipadOs = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15";
  const android = "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140 Mobile";
  assert.equal(appPlatform(iphone, "iPhone", 5), "ios");
  assert.equal(appPlatform(ipadOs, "MacIntel", 5), "ios");
  assert.equal(appPlatform(ipadOs, "MacIntel", 0), "desktop");
  assert.equal(appPlatform(android, "Linux armv81", 5), "android");
  assert.equal(appPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Win32", 0), "desktop");
});

test("endpointTemplate replaces IDs and drops host and query", () => {
  assert.equal(endpointTemplate("https://api.example.com/courses?limit=5"), "/courses");
  assert.equal(endpointTemplate("https://api.example.com/course/CSCE221"), "/course/:id");
  assert.equal(
    endpointTemplate("https://api.example.com/professor/VGVhY2hlci02MDkxMDE=/reviews"),
    "/professor/:id/reviews",
  );
  assert.equal(endpointTemplate("/courses/compare"), "/courses/compare");
});

test("normalizeQuery lowercases, trims and collapses spaces", () => {
  assert.equal(normalizeQuery("  CSCE   221 "), "csce 221");
});

test("normalizeQuery drops queries that are too short", () => {
  assert.equal(normalizeQuery(""), null);
  assert.equal(normalizeQuery(" a "), null);
  assert.equal(normalizeQuery("ab"), "ab");
});

test("normalizeQuery cuts long queries to 40 characters", () => {
  const out = normalizeQuery("x".repeat(100));
  assert.equal(out?.length, 40);
});

test("pageFrom returns the first path segment without IDs", () => {
  assert.equal(pageFrom("/"), "home");
  assert.equal(pageFrom("/course/CSCE221"), "course");
  assert.equal(pageFrom("/professor/abc/reviews"), "professor");
  assert.equal(pageFrom("/compare?tab=professors"), "compare");
});

test("classifyQuery: 5 digits is a CRN", () => {
  assert.equal(classifyQuery("12345"), "crn");
  assert.equal(classifyQuery(" 54321 "), "crn");
  assert.equal(classifyQuery("1234"), "text");
});

test("classifyQuery: course codes in any common form", () => {
  for (const q of ["acct 327", "acct327", "327 acct", "acct-327", "csce 3", "cs 121", "CSCE 221", "accounting 327"]) {
    assert.equal(classifyQuery(q), "code", q);
  }
});

test("classifyQuery: people's names", () => {
  for (const q of ["hanik, bruce walter", "bryan kim", "nana yobo", "sviercoski, rosangela", "j. smith"]) {
    assert.equal(classifyQuery(q), "name", q);
  }
});

test("classifyQuery: topics and everything else are text", () => {
  for (const q of ["computer science", "creative arts", "calculus 2", "intro to psychology", "smith", "easy ucc classes", "csce 221 222"]) {
    assert.equal(classifyQuery(q), "text", q);
  }
});

test("isReportableApiError skips expected 404s only", () => {
  const sections = endpointTemplate("https://api.example.com/sections/202611/course/CSCE221");
  const profs = endpointTemplate("https://api.example.com/sections/202611/course/CSCE221/professors");
  const details = endpointTemplate("https://api.example.com/sections/202611/course/CSCE221/professors/details");
  const course = endpointTemplate("https://api.example.com/course/CSCE221");
  for (const endpoint of [sections, profs, details, course]) {
    assert.equal(isReportableApiError(endpoint, 404), false, endpoint);
    assert.equal(isReportableApiError(endpoint, 500), true, endpoint);
    assert.equal(isReportableApiError(endpoint, 0), true, endpoint);
  }
  const reviews = endpointTemplate("https://api.example.com/course/CSCE221/reviews/abc123");
  assert.equal(isReportableApiError(reviews, 404), true);
  assert.equal(isReportableApiError(endpointTemplate("https://api.example.com/professor/X1"), 404), true);
  assert.equal(isReportableApiError(course, 400), true);

  const tracking = endpointTemplate("https://api.example.com/users/tracking");
  assert.equal(isReportableApiError(tracking, 422), false);
  assert.equal(isReportableApiError(tracking, 500), true);
  assert.equal(isReportableApiError(endpointTemplate("https://api.example.com/users/tracking/abc"), 422), true);
});
