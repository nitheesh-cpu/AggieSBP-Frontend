/**
 * Server-only gate for /api/admin/* (D-052). A request passes only with a
 * valid Cloudflare Access token for the admin application, and, when
 * ADMIN_EMAILS is set, an email on that list.
 *
 * Env (server-only, /etc/aggiesbp-web.env): CF_ACCESS_TEAM_DOMAIN
 * ("<team>.cloudflareaccess.com"), CF_ACCESS_AUD (the application's AUD tag),
 * optional ADMIN_EMAILS. In `next dev` without CF_ACCESS_AUD the gate lets
 * requests through so the admin pages can be developed locally; a production
 * build never does.
 */
import { accessTokenFrom, emailAllowed, verifyAccessJwt, type AccessJwk } from "@/lib/cf-access";

const KEYS_TTL_MS = 60 * 60 * 1000;
const KEYS_RETRY_MS = 60 * 1000;
let cachedKeys: { team: string; keys: AccessJwk[]; fetchedAt: number } | null = null;

async function accessKeys(team: string, forceRefresh: boolean): Promise<AccessJwk[]> {
  const fresh = cachedKeys && cachedKeys.team === team &&
    Date.now() - cachedKeys.fetchedAt < (forceRefresh ? KEYS_RETRY_MS : KEYS_TTL_MS);
  if (fresh) return cachedKeys!.keys;
  const response = await fetch(`https://${team}/cdn-cgi/access/certs`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Access certs returned HTTP ${response.status}`);
  const body = (await response.json()) as { keys?: AccessJwk[] };
  cachedKeys = { team, keys: body.keys ?? [], fetchedAt: Date.now() };
  return cachedKeys.keys;
}

export type GateResult =
  | { ok: true; email: string | null }
  | { ok: false; status: 401 | 403 | 503; message: string };

export async function authorizeAdmin(request: Request): Promise<GateResult> {
  const team = process.env.CF_ACCESS_TEAM_DOMAIN?.trim();
  const audience = process.env.CF_ACCESS_AUD?.trim();
  if (!team || !audience) {
    if (process.env.NODE_ENV === "development") return { ok: true, email: null };
    return { ok: false, status: 503, message: "Admin sign-in is not configured on this server." };
  }
  const token = accessTokenFrom(request.headers);
  if (!token) return { ok: false, status: 401, message: "Not signed in." };

  const issuer = `https://${team}`;
  let result;
  try {
    result = verifyAccessJwt(token, { keys: await accessKeys(team, false), audience, issuer });
    // Cloudflare rotates its signing keys: refetch once if the key id is new.
    if (!result.ok && result.reason === "unknown signing key") {
      result = verifyAccessJwt(token, { keys: await accessKeys(team, true), audience, issuer });
    }
  } catch (error) {
    console.error("[admin] could not load Cloudflare Access keys:", error);
    return { ok: false, status: 503, message: "Could not check the admin sign-in. Try again." };
  }
  if (!result.ok) return { ok: false, status: 401, message: "Sign-in expired or invalid." };
  if (!emailAllowed(result.claims.email, process.env.ADMIN_EMAILS)) {
    return { ok: false, status: 403, message: "This account is not an admin." };
  }
  return { ok: true, email: result.claims.email ?? null };
}
