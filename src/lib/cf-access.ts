/**
 * Verifies the Cloudflare Access token that Cloudflare adds to every request
 * it lets through to /admin and /api/admin (header `Cf-Access-Jwt-Assertion`,
 * cookie `CF_Authorization`). The admin proxy trusts a request only if this
 * token is signed by our Access team and issued for our admin application
 * (its AUD tag), so a request that reaches the site any other way gets nothing
 * (D-052).
 *
 * Kept free of Next and `@/` imports so `node --test` can load it.
 */
import { createPublicKey, verify, type JsonWebKey } from "node:crypto";

export interface AccessJwk extends JsonWebKey {
  kid?: string;
}

export interface AccessClaims {
  email?: string;
  aud: string | string[];
  iss: string;
  exp: number;
  nbf?: number;
  iat?: number;
}

export type VerifyResult =
  | { ok: true; claims: AccessClaims }
  | { ok: false; reason: string };

const CLOCK_SKEW_SECONDS = 60;

function b64urlJson<T>(part: string): T {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as T;
}

/** Checks signature (RS256), issuer, audience and time. Never throws. */
export function verifyAccessJwt(
  token: string,
  options: { keys: AccessJwk[]; audience: string; issuer: string; now?: number },
): VerifyResult {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed token" };
  let header: { alg?: string; kid?: string };
  let claims: AccessClaims;
  try {
    header = b64urlJson(parts[0]);
    claims = b64urlJson(parts[1]);
  } catch {
    return { ok: false, reason: "malformed token" };
  }
  if (header.alg !== "RS256") return { ok: false, reason: "unexpected algorithm" };
  const jwk = options.keys.find((key) => key.kid === header.kid);
  if (!jwk) return { ok: false, reason: "unknown signing key" };
  let valid = false;
  try {
    valid = verify(
      "RSA-SHA256",
      Buffer.from(`${parts[0]}.${parts[1]}`),
      createPublicKey({ key: jwk, format: "jwk" }),
      Buffer.from(parts[2], "base64url"),
    );
  } catch {
    return { ok: false, reason: "bad signing key" };
  }
  if (!valid) return { ok: false, reason: "bad signature" };

  const now = options.now ?? Math.floor(Date.now() / 1000);
  if (claims.iss !== options.issuer) return { ok: false, reason: "wrong issuer" };
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(options.audience)) return { ok: false, reason: "wrong audience" };
  if (typeof claims.exp !== "number" || claims.exp + CLOCK_SKEW_SECONDS < now) {
    return { ok: false, reason: "expired" };
  }
  if (typeof claims.nbf === "number" && claims.nbf - CLOCK_SKEW_SECONDS > now) {
    return { ok: false, reason: "not valid yet" };
  }
  return { ok: true, claims };
}

/** The token from the request: Cloudflare's header first, then its cookie. */
export function accessTokenFrom(headers: Headers): string | null {
  const header = headers.get("cf-access-jwt-assertion");
  if (header) return header;
  const cookie = headers.get("cookie") ?? "";
  const match = /(?:^|;\s*)CF_Authorization=([^;]+)/.exec(cookie);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Comma-separated, case-insensitive. Empty means "whoever Access lets in". */
export function emailAllowed(email: string | undefined, allowList: string | undefined): boolean {
  const allowed = (allowList ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) return true;
  return !!email && allowed.includes(email.toLowerCase());
}
