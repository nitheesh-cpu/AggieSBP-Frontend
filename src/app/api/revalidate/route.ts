import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { parseRevalidateBody } from "./validate";

// Called by the backend after data changes so cached course/professor pages
// refresh immediately instead of waiting for the daily ISR window.
export const dynamic = "force-dynamic";

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
    return NextResponse.json({ revalidated: patterns.length, all: true });
  }

  for (const path of parsed.request.paths) revalidatePath(path);
  return NextResponse.json({ revalidated: parsed.request.paths.length });
}
