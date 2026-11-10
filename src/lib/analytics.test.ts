// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import { appPlatform, endpointTemplate, normalizeQuery, pageFrom } from "./analytics.ts";

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
