// Request validation for POST /api/revalidate, kept free of Next imports so
// it can be unit tested with plain node.

export const MAX_PATHS = 200;
const ALLOWED_PREFIXES = ["/course/", "/professor/"];

export type RevalidateRequest =
  | { kind: "all" }
  | { kind: "paths"; paths: string[] };

export type ParseResult =
  | { ok: true; request: RevalidateRequest }
  | { ok: false; error: string };

export function parseRevalidateBody(body: unknown): ParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const { paths, all } = body as { paths?: unknown; all?: unknown };
  if (all === true) return { ok: true, request: { kind: "all" } };
  if (!Array.isArray(paths) || paths.length === 0) {
    return { ok: false, error: 'Provide "paths" (non-empty array) or "all": true' };
  }
  if (paths.length > MAX_PATHS) {
    return { ok: false, error: `At most ${MAX_PATHS} paths per request` };
  }
  for (const p of paths) {
    if (
      typeof p !== "string" ||
      p.length > 200 ||
      !ALLOWED_PREFIXES.some((prefix) => p.startsWith(prefix)) ||
      p.includes("..") ||
      p.includes("?") ||
      p.includes("#")
    ) {
      return { ok: false, error: "Paths must start with /course/ or /professor/" };
    }
  }
  return { ok: true, request: { kind: "paths", paths: Array.from(new Set(paths as string[])) } };
}
