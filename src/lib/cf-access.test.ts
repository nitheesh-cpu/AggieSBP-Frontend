// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { accessTokenFrom, emailAllowed, verifyAccessJwt, type AccessJwk } from "./cf-access.ts";

const ISSUER = "https://example-team.cloudflareaccess.com";
const AUD = "aud-tag-123";
const NOW = 1_800_000_000;

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...(publicKey.export({ format: "jwk" }) as AccessJwk), kid: "k1" };
const other = generateKeyPairSync("rsa", { modulusLength: 2048 });

function token(claims: object, { kid = "k1", alg = "RS256", key = privateKey } = {}) {
  const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const head = `${enc({ alg, kid })}.${enc(claims)}`;
  return `${head}.${sign("RSA-SHA256", Buffer.from(head), key).toString("base64url")}`;
}
const good = { email: "admin@example.test", aud: [AUD], iss: ISSUER, exp: NOW + 600, nbf: NOW - 10 };
const opts = { keys: [jwk], audience: AUD, issuer: ISSUER, now: NOW };

test("a token signed by the team for this application is accepted", () => {
  const result = verifyAccessJwt(token(good), opts);
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.claims.email, "admin@example.test");
});

test("wrong audience, issuer, expiry or algorithm are refused", () => {
  assert.deepEqual(verifyAccessJwt(token({ ...good, aud: ["another-app"] }), opts), { ok: false, reason: "wrong audience" });
  assert.deepEqual(verifyAccessJwt(token({ ...good, iss: "https://evil.cloudflareaccess.com" }), opts), { ok: false, reason: "wrong issuer" });
  assert.deepEqual(verifyAccessJwt(token({ ...good, exp: NOW - 3600 }), opts), { ok: false, reason: "expired" });
  assert.deepEqual(verifyAccessJwt(token(good, { alg: "none" }), opts), { ok: false, reason: "unexpected algorithm" });
});

test("a token signed by another key, or with an unknown key id, is refused", () => {
  assert.deepEqual(verifyAccessJwt(token(good, { key: other.privateKey }), opts), { ok: false, reason: "bad signature" });
  assert.deepEqual(verifyAccessJwt(token(good, { kid: "k2" }), opts), { ok: false, reason: "unknown signing key" });
});

test("a tampered payload is refused", () => {
  const [head, , sig] = token(good).split(".");
  const forged = Buffer.from(JSON.stringify({ ...good, email: "someone@else.test" })).toString("base64url");
  assert.deepEqual(verifyAccessJwt(`${head}.${forged}.${sig}`, opts), { ok: false, reason: "bad signature" });
  assert.deepEqual(verifyAccessJwt("not-a-token", opts), { ok: false, reason: "malformed token" });
});

test("the token is read from Cloudflare's header, then its cookie", () => {
  assert.equal(accessTokenFrom(new Headers({ "cf-access-jwt-assertion": "h.t.s" })), "h.t.s");
  assert.equal(accessTokenFrom(new Headers({ cookie: "a=1; CF_Authorization=c.t.s; b=2" })), "c.t.s");
  assert.equal(accessTokenFrom(new Headers()), null);
});

test("the optional email allow-list is case-insensitive; empty allows everyone Access lets in", () => {
  assert.equal(emailAllowed("Admin@Example.test", "admin@example.test, other@example.test"), true);
  assert.equal(emailAllowed("stranger@example.test", "admin@example.test"), false);
  assert.equal(emailAllowed(undefined, "admin@example.test"), false);
  assert.equal(emailAllowed("anyone@example.test", ""), true);
});
