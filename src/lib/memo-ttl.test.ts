// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import { memoTtl } from "./memo-ttl.ts";

test("memoTtl reuses the value until it expires", async () => {
  let t = 0;
  let calls = 0;
  const get = memoTtl(async () => ++calls, 100, () => t);
  assert.equal(await get(), 1);
  t = 99;
  assert.equal(await get(), 1);
  t = 100;
  assert.equal(await get(), 2);
});

test("memoTtl shares one in-flight load", async () => {
  let calls = 0;
  const get = memoTtl(async () => {
    calls++;
    return "x";
  }, 1000);
  const [a, b] = await Promise.all([get(), get()]);
  assert.equal(a, "x");
  assert.equal(b, "x");
  assert.equal(calls, 1);
});

test("memoTtl does not keep failures", async () => {
  let calls = 0;
  const get = memoTtl(async () => {
    calls++;
    if (calls === 1) throw new Error("down");
    return "ok";
  }, 1000);
  await assert.rejects(get(), /down/);
  assert.equal(await get(), "ok");
  assert.equal(calls, 2);
});
