/**
 * API reads for server components and generateMetadata (course and professor
 * pages). Never import this from a "use client" module.
 *
 * - Responses are not stored in Next's data cache (that counts as ISR writes); React's cache()
 *   shares one call between generateMetadata and the page in a render.
 * - Requests carry X-Internal-Key from INTERNAL_API_KEY (a server-only env
 *   var) so SSR traffic, which all comes from a few Vercel IPs, isn't caught
 *   by the API's per-IP rate limits. Without the env var the header is left
 *   off and everything still works, just rate-limited.
 * - A 404 (or 400/422: the id isn't even valid) throws ApiNotFoundError, which
 *   pages turn into notFound(). Anything else (5xx, 429, timeout, network)
 *   throws ApiUnavailableError, so the render fails instead of serving an
 *   empty-looking 200 page.
 */
import { cache } from "react";
import { memoTtl } from "@/lib/memo-ttl";
import {
  normalizeProfessorReviews,
  type CourseDetail,
  type Course,
  type Department,
  type Professor,
  type ProfessorDetail,
  type ProfessorReviews,
  type Term,
} from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

const REQUEST_TIMEOUT_MS = 10_000;
const NOT_FOUND_STATUSES = new Set([400, 404, 410, 422]);

export class ApiNotFoundError extends Error {
  constructor(public readonly path: string) {
    super(`Not found: ${path}`);
    this.name = "ApiNotFoundError";
  }
}

export class ApiUnavailableError extends Error {
  constructor(
    public readonly path: string,
    public readonly status: number,
  ) {
    super(`API unavailable (${status || "network"}): ${path}`);
    this.name = "ApiUnavailableError";
  }
}

export function isApiNotFound(err: unknown): err is ApiNotFoundError {
  return err instanceof ApiNotFoundError;
}

function serverHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const key = process.env.INTERNAL_API_KEY?.trim();
  if (key) headers["X-Internal-Key"] = key;
  return headers;
}

async function apiGet<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: serverHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    console.error(`[server-api] ${path} failed:`, err);
    throw new ApiUnavailableError(path, 0);
  }
  if (NOT_FOUND_STATUSES.has(res.status)) throw new ApiNotFoundError(path);
  if (!res.ok) {
    console.error(`[server-api] ${path} returned ${res.status}`);
    throw new ApiUnavailableError(path, res.status);
  }
  return (await res.json()) as T;
}

/** Route params can arrive percent-encoded ("...MjM%3D"); decode once, then encode for the API path. */
export function decodeRouteId(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

export const getCourseDetailServer = cache(
  (courseId: string): Promise<CourseDetail> =>
    apiGet<CourseDetail>(`/course/${encodeURIComponent(decodeRouteId(courseId))}`),
);

export const getProfessorServer = cache(
  async (professorId: string): Promise<ProfessorDetail> => {
    const data = await apiGet<ProfessorDetail>(
      `/professor/${encodeURIComponent(decodeRouteId(professorId))}`,
    );
    if (!data || !data.id || !data.name) {
      throw new ApiUnavailableError(`/professor/${professorId}`, 502);
    }
    return data;
  },
);

/** First page of reviews with the reviews page's default filters (newest first). */
export const getProfessorReviewsFirstPageServer = cache(
  async (professorId: string, limit: number): Promise<ProfessorReviews> => {
    const id = decodeRouteId(professorId);
    const data = await apiGet<unknown>(
      `/professor/${encodeURIComponent(id)}/reviews?limit=${limit}&sort_by=date`,
    );
    return normalizeProfessorReviews(data, id, { limit, skip: 0 });
  },
);

/**
 * Terms and the department list change a few times a semester, so a warm
 * instance keeps them for 6 hours instead of fetching them on every render
 * (D-048). Saves API round trips and function CPU on every CDN miss.
 */
const SHARED_LIST_TTL_MS = 6 * 60 * 60 * 1000;
const loadTerms = memoTtl(() => apiGet<Term[]>("/terms"), SHARED_LIST_TTL_MS);
const loadDepartments = memoTtl(
  () => apiGet<Department[]>("/departments?limit=1000"),
  SHARED_LIST_TTL_MS,
);

/** Terms only fill the term picker; on failure the client loads them itself. */
export const getTermsServer = cache(async (): Promise<Term[] | null> => {
  try {
    return await loadTerms();
  } catch {
    return null;
  }
});

/** All departments, including ones without data; callers filter with publishedDepartments(). */
export const getDepartmentsServer = cache((): Promise<Department[]> => loadDepartments());

/** Every course in a subject, for the department page's link list. */
export const getDepartmentCoursesServer = cache(
  (code: string): Promise<Course[]> =>
    apiGet<Course[]>(`/courses?department=${encodeURIComponent(code)}&limit=1000`),
);

/** Professors who teach in a subject; the page sorts and trims them. */
export const getDepartmentProfessorsServer = cache(
  (code: string): Promise<Professor[]> =>
    apiGet<Professor[]>(`/professors?department=${encodeURIComponent(code)}&limit=1000`),
);

/** Official subject codes (CSCE, MATH, ...); null when unavailable. */
export const getOfficialSubjectCodesServer = cache(
  async (): Promise<Set<string> | null> => {
    try {
      const rows = await loadDepartments();
      return new Set(rows.map((d) => d.code).filter(Boolean));
    } catch {
      return null;
    }
  },
);
