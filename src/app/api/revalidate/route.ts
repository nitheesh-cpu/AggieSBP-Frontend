import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { parseRevalidateBody } from "./validate";
import { purgeCloudflare, purgePrefixes, type PurgeResult } from "@/lib/cdn-purge";
import { SITE_URL } from "@/lib/site-url";

// Called by the backend after data changes (merges, instructor links, admin
// cache clears). Pages render per request (D-044), so the copy that matters is
// Cloudflare's: this purges it, or the fix stays hidden for up to 7 days (D-051).
export const dynamic = "force-dynamic";

async function purgeCdn(target: { all: true } | { paths: string[] }): Promise<PurgeResult> {
  const env = { zoneId: process.env.CLOUDFLARE_ZONE_ID, token: process.env.CLOUDFLARE_API_TOKEN };
  const result = "all" in target
    ? await purgeCloudflare({ all: true }, env)
    : await purgeCloudflare({ prefixes: purgePrefixes(target.paths, new URL(SITE_URL).host) }, env);
  if (result === "failed") console.error("[revalidate] Cloudflare purge failed");
  return result;
}

function secretMatches(given: string | null, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "Revalidation is not configured" }, { status: 503 });
  }
  if (!secretMatches(request.headers.get("x-revalidate-secret"), expected)) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = parseRevalidateBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (parsed.request.kind === "all") {
    const patterns = [
      "/course/[id]",
      "/professor/[id]",
      "/professor/[id]/reviews",
    ];
    for (const pattern of patterns) revalidatePath(pattern, "page");
    // A failed purge still answers 200: the backend reads any other status as "site unreachable".
    const cdn = await purgeCdn({ all: true });
    return NextResponse.json({ revalidated: patterns.length, all: true, cdn });
  }

  for (const path of parsed.request.paths) revalidatePath(path);
  const cdn = await purgeCdn({ paths: parsed.request.paths });
  return NextResponse.json({ revalidated: parsed.request.paths.length, cdn });
}
