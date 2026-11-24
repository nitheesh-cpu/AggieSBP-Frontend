/**
 * Purges Cloudflare's cached copies of pages after the backend changes data
 * (merges, instructor links, admin cache clears all call /api/revalidate).
 * The site runs behind Cloudflare, which keeps course, professor and
 * department pages for 7 days (D-050), so without this a fix could stay
 * invisible for a week (D-051).
 *
 * Purges by prefix, not exact URL: Cloudflare caches every query string
 * separately (`?utm_source=extension`, `?tab=`), and a prefix covers them
 * all. A prefix may also hit a neighbour (`/professor/12` matches
 * `/professor/123`); an extra cache miss is harmless.
 *
 * Kept free of Next and `@/` imports so `node --test` can load it.
 */

/** Cloudflare accepts at most 30 prefixes per purge call. */
export const PREFIXES_PER_CALL = 30;

const PROFESSOR = /^\/professor\/(.+?)(?:\/reviews)?\/?$/;
const COURSE = /^\/course\/([^/]+)\/?$/;

/**
 * Cloudflare prefixes (`host/path`, no scheme) for the paths the backend
 * sends: `/professor/<id>`, `/professor/<id>/reviews`, `/course/<code>`.
 * A course also purges its department page, which lists the course's GPA.
 */
export function purgePrefixes(paths: readonly string[], host: string): string[] {
  const out = new Set<string>();
  const add = (path: string) => out.add(`${host}${path}`);
  for (const path of paths) {
    const professor = PROFESSOR.exec(path);
    if (professor) {
      const id = professor[1];
      add(`/professor/${id}`);
      // Pages are linked with the id percent-encoded; the backend sends it raw.
      const encoded = encodeURIComponent(safeDecode(id));
      if (encoded !== id) add(`/professor/${encoded}`);
      continue;
    }
    const course = COURSE.exec(path);
    if (course) {
      const code = course[1];
      add(`/course/${code}`);
      if (code !== code.toLowerCase()) add(`/course/${code.toLowerCase()}`);
      const subject = /^[A-Za-z]+/.exec(code)?.[0];
      if (subject) {
        add(`/departments/${subject.toUpperCase()}`);
        add(`/departments/${subject.toLowerCase()}`);
      }
    }
  }
  return [...out];
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export type PurgeResult = "purged" | "skipped" | "failed";

/**
 * Sends the purge to Cloudflare. "skipped" when the zone id or token is not
 * configured (local development, or the old Vercel deployment). Never throws.
 */
export async function purgeCloudflare(
  target: { all: true } | { prefixes: readonly string[] },
  env: { zoneId?: string; token?: string },
  fetchImpl: typeof fetch = fetch,
): Promise<PurgeResult> {
  const zoneId = env.zoneId?.trim();
  const token = env.token?.trim();
  if (!zoneId || !token) return "skipped";
  const bodies =
    "all" in target
      ? [{ purge_everything: true }]
      : chunk(target.prefixes, PREFIXES_PER_CALL).map((prefixes) => ({ prefixes }));
  if (bodies.length === 0) return "skipped";
  try {
    for (const body of bodies) {
      const response = await fetchImpl(
        `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(zoneId)}/purge_cache`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(10_000),
        },
      );
      const result = (await response.json().catch(() => null)) as { success?: boolean } | null;
      if (!response.ok || result?.success !== true) return "failed";
    }
    return "purged";
  } catch {
    return "failed";
  }
}
