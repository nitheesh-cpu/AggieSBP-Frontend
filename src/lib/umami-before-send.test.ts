import assert from "node:assert/strict";
import { test } from "node:test";
import { UMAMI_BEFORE_SEND_SCRIPT } from "./umami-before-send.ts";

type Payload = { url?: string; referrer?: string; name?: string };
type Hook = (type: string, payload: Payload) => Payload | undefined;

function load(): Hook {
  const win: { umamiBeforeSend?: Hook } = {};
  const loc = { href: "https://aggiesbp.com/" };
  new Function("window", "location", UMAMI_BEFORE_SEND_SCRIPT)(win, loc);
  return win.umamiBeforeSend!;
}

const hook = load();
const O = "https://aggiesbp.com";

test("admin pages send nothing", () => {
  assert.equal(hook("event", { url: `${O}/admin` }), undefined);
  assert.equal(hook("event", { url: `${O}/admin/jobs?x=1`, name: "click" }), undefined);
  assert.equal(hook("performance", { url: `${O}/admin/cache` }), undefined);
});

test("/administrator-like paths are not admin", () => {
  const p = { url: `${O}/administration` };
  assert.equal(hook("event", p), p);
});

test("plain pageviews on the OAuth callback are dropped", () => {
  assert.equal(hook("event", { url: `${O}/auth/callback/google?code=abc` }), undefined);
});

test("named events on the OAuth callback still send, scrubbed", () => {
  const out = hook("event", {
    url: `${O}/auth/callback/google?code=abc&state=z`,
    referrer: `${O}/auth/callback/google?code=abc`,
    name: "signin-complete",
  });
  assert.equal(out?.url, `${O}/auth/callback/google`);
  assert.equal(out?.referrer, `${O}/auth/callback/google`);
  assert.equal(out?.name, "signin-complete");
});

test("identify on the callback is not cancelled", () => {
  assert.ok(hook("identify", { url: `${O}/auth/callback/google?code=abc` }));
});

test("normal pages pass through; referrer from the callback is scrubbed", () => {
  const out = hook("event", {
    url: `${O}/courses?q=csce`,
    referrer: `${O}/auth/callback/google?code=abc`,
  });
  assert.equal(out?.url, `${O}/courses?q=csce`);
  assert.equal(out?.referrer, `${O}/auth/callback/google`);
});

test("a bad payload never throws", () => {
  assert.ok(hook("event", { url: undefined }));
});
