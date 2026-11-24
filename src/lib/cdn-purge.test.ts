import { test } from "node:test";
import assert from "node:assert/strict";
import { chunk, purgeCloudflare, purgePrefixes, PREFIXES_PER_CALL } from "./cdn-purge.ts";

const HOST = "aggiesbp.com";

test("professor page and its reviews page share one prefix", () => {
  assert.deepEqual(purgePrefixes(["/professor/abc", "/professor/abc/reviews"], HOST), [
    "aggiesbp.com/professor/abc",
  ]);
});

test("a raw professor id is also purged in its percent-encoded form", () => {
  assert.deepEqual(purgePrefixes(["/professor/VGVh/Y2hl+ci0=/reviews"], HOST), [
    "aggiesbp.com/professor/VGVh/Y2hl+ci0=",
    "aggiesbp.com/professor/VGVh%2FY2hl%2Bci0%3D",
  ]);
});

test("a course purges its page, its lowercase form and its department page", () => {
  assert.deepEqual(purgePrefixes(["/course/CSCE121"], HOST), [
    "aggiesbp.com/course/CSCE121",
    "aggiesbp.com/course/csce121",
    "aggiesbp.com/departments/CSCE",
    "aggiesbp.com/departments/csce",
  ]);
});

test("unknown paths are ignored and duplicates removed", () => {
  assert.deepEqual(purgePrefixes(["/course/MATH151", "/course/MATH151", "/browse", "/admin"], HOST).length, 4);
  assert.deepEqual(purgePrefixes(["/browse"], HOST), []);
});

test("chunk splits into Cloudflare-sized calls", () => {
  const items = Array.from({ length: 65 }, (_, i) => i);
  assert.deepEqual(chunk(items, PREFIXES_PER_CALL).map((c) => c.length), [30, 30, 5]);
});

test("no zone id or token means skipped, with no request", async () => {
  let calls = 0;
  const fetchImpl = (async () => { calls++; return new Response("{}"); }) as typeof fetch;
  assert.equal(await purgeCloudflare({ all: true }, {}, fetchImpl), "skipped");
  assert.equal(await purgeCloudflare({ all: true }, { zoneId: "z", token: " " }, fetchImpl), "skipped");
  assert.equal(calls, 0);
});

test("prefixes are sent in batches of 30 with the token", async () => {
  const bodies: unknown[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    assert.equal(url, "https://api.cloudflare.com/client/v4/zones/zone1/purge_cache");
    assert.equal((init.headers as Record<string, string>).Authorization, "Bearer tok");
    bodies.push(JSON.parse(String(init.body)));
    return new Response(JSON.stringify({ success: true }));
  }) as unknown as typeof fetch;
  const prefixes = Array.from({ length: 31 }, (_, i) => `aggiesbp.com/course/C${i}`);
  assert.equal(await purgeCloudflare({ prefixes }, { zoneId: "zone1", token: "tok" }, fetchImpl), "purged");
  assert.equal(bodies.length, 2);
});

test("everything purges the whole zone", async () => {
  let body = "";
  const fetchImpl = (async (_url: string, init: RequestInit) => {
    body = String(init.body);
    return new Response(JSON.stringify({ success: true }));
  }) as unknown as typeof fetch;
  assert.equal(await purgeCloudflare({ all: true }, { zoneId: "z", token: "t" }, fetchImpl), "purged");
  assert.deepEqual(JSON.parse(body), { purge_everything: true });
});

test("a Cloudflare error or network failure is reported, not thrown", async () => {
  const rejected = (async () => new Response(JSON.stringify({ success: false }), { status: 400 })) as typeof fetch;
  const offline = (async () => { throw new Error("offline"); }) as typeof fetch;
  assert.equal(await purgeCloudflare({ prefixes: ["a/b"] }, { zoneId: "z", token: "t" }, rejected), "failed");
  assert.equal(await purgeCloudflare({ prefixes: ["a/b"] }, { zoneId: "z", token: "t" }, offline), "failed");
});
