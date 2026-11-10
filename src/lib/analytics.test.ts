// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeQuery, pageFrom } from "./analytics.ts";

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
