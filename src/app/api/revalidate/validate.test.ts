import assert from "node:assert/strict";
import test from "node:test";
import { MAX_PATHS, parseRevalidateBody } from "./validate.ts";

test("accepts course and professor paths and dedupes", () => {
  const r = parseRevalidateBody({ paths: ["/course/CSCE121", "/professor/a", "/professor/a"] });
  assert.deepEqual(r, { ok: true, request: { kind: "paths", paths: ["/course/CSCE121", "/professor/a"] } });
});

test("accepts all", () => {
  assert.deepEqual(parseRevalidateBody({ all: true }), { ok: true, request: { kind: "all" } });
});

test("rejects other prefixes, traversal, empty, too many, bad bodies", () => {
  for (const body of [
    { paths: ["/admin"] },
    { paths: ["/course/../admin"] },
    { paths: ["/course/A?x=1"] },
    { paths: [] },
    { paths: [1] },
    { paths: Array.from({ length: MAX_PATHS + 1 }, (_, i) => `/course/C${i}`) },
    {},
    null,
    [],
  ]) {
    assert.equal(parseRevalidateBody(body).ok, false);
  }
});
