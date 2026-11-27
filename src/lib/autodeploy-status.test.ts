import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_STATUS_BYTES, parseAutodeployStatus } from "./autodeploy-status.ts";

const NOW = Date.parse("2026-11-26T20:00:00Z");
const FILE = {
  checkedAt: "2026-11-26T19:55:00Z",
  paused: false,
  frontend: {
    state: "deployed",
    live: "c7d5bed",
    commit: "c7d5bed",
    message: null,
    since: "2026-11-26T18:59:41Z",
    lastDeploy: { commit: "c7d5bed", at: "2026-11-26T18:59:41Z" },
  },
  backend: {
    state: "needs_attention",
    live: "c9ce343",
    commit: "abcdef1",
    message: "Tracked files in the VM checkout have local edits (requirements.txt).",
    since: "2026-11-26T19:50:00Z",
    lastDeploy: null,
  },
};

test("reads both sides of a fresh status file", () => {
  const status = parseAutodeployStatus(JSON.stringify(FILE), NOW);
  assert.ok(status);
  assert.equal(status.stale, false);
  assert.equal(status.paused, false);
  assert.equal(status.frontend?.state, "deployed");
  assert.deepEqual(status.frontend?.lastDeploy, { commit: "c7d5bed", at: "2026-11-26T18:59:41.000Z" });
  assert.equal(status.backend?.state, "needs_attention");
  assert.match(status.backend?.message ?? "", /requirements\.txt/);
});

test("marks a status older than 15 minutes as stale", () => {
  const status = parseAutodeployStatus(JSON.stringify({ ...FILE, checkedAt: "2026-11-26T19:40:00Z" }), NOW);
  assert.equal(status?.stale, true);
});

test("a side that never ran is null", () => {
  const status = parseAutodeployStatus(JSON.stringify({ ...FILE, backend: null }), NOW);
  assert.equal(status?.backend, null);
});

test("unexpected values are dropped, not shown", () => {
  const status = parseAutodeployStatus(
    JSON.stringify({
      ...FILE,
      frontend: { state: "rm -rf", live: "<script>", commit: 7, since: "never", lastDeploy: { commit: "zzz", at: "x" } },
    }),
    NOW,
  );
  assert.deepEqual(status?.frontend, {
    state: "unknown",
    live: null,
    commit: null,
    message: null,
    since: null,
    lastDeploy: null,
  });
});

test("rejects broken, oversized or shapeless files", () => {
  assert.equal(parseAutodeployStatus("{", NOW), null);
  assert.equal(parseAutodeployStatus("[]", NOW), null);
  assert.equal(parseAutodeployStatus(JSON.stringify({ paused: true }), NOW), null);
  assert.equal(parseAutodeployStatus(" ".repeat(MAX_STATUS_BYTES + 1), NOW), null);
});
