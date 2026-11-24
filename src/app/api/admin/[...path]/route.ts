import { NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/admin-gate";
import { API_BASE_URL } from "@/lib/api-base";

/**
 * Admin proxy (D-052): /api/admin/<path> → the API's /admin/<path>, called
 * over localhost with the admin key added here. Cloudflare Access signs the
 * admin in; authorizeAdmin checks that before anything is forwarded. The key
 * never reaches the browser, and the public API refuses /admin (nginx).
 */
export const dynamic = "force-dynamic";

const FORWARD_TIMEOUT_MS = 60_000;

function json(status: number, detail: string) {
  return NextResponse.json({ detail }, { status, headers: { "Cache-Control": "no-store" } });
}

async function forward(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const gate = await authorizeAdmin(request);
  if (!gate.ok) return json(gate.status, gate.message);

  const key = process.env.ADMIN_API_KEY?.trim();
  if (!key) return json(503, "ADMIN_API_KEY is not set on the site's server.");
  // In production this must be localhost: the public API no longer serves /admin.
  if (process.env.NODE_ENV === "production" && !process.env.API_INTERNAL_URL?.trim()) {
    return json(503, "API_INTERNAL_URL is not set on the site's server.");
  }

  const { path } = await params;
  if (!path?.length || path.some((segment) => !segment || segment === "." || segment === "..")) {
    return json(400, "Bad admin path.");
  }
  const target = new URL(`${API_BASE_URL}/admin/${path.map(encodeURIComponent).join("/")}`);
  target.search = new URL(request.url).search;

  const hasBody = !["GET", "HEAD"].includes(request.method);
  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      cache: "no-store",
      headers: {
        "X-Admin-Key": key,
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": request.headers.get("content-type") ?? "application/json" } : {}),
      },
      body: hasBody ? await request.text() : undefined,
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("[admin] API unreachable:", error);
    return json(502, "The API did not answer.");
  }
  // A 401 here means the server's key is wrong, not that the admin's sign-in expired.
  if (response.status === 401) return json(502, "The API rejected the site's admin key.");
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
