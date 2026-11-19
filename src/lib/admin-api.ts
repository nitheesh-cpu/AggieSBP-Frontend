/**
 * Calls to the backend's /admin endpoints, authenticated with the admin key
 * (X-Admin-Key). Uses plain fetch, not trackedFetch, so nothing about admin
 * requests reaches analytics.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

/** Kept for this browser tab only, never in localStorage. */
export const ADMIN_KEY_STORAGE = "aggiesbp:admin-key";

export type MergeStatus = "proposed" | "confirmed" | "rejected";

export interface MergeProfessor {
  name: string;
  department: string | null;
  ratings: number;
  /** The number in ratemyprofessors.com/professor/<rmpId>. */
  rmpId: number | null;
}

export interface ProfessorMerge {
  aliasId: string;
  canonicalId: string;
  evidence: string;
  status: MergeStatus;
  needsCheck: boolean;
  createdAt: string | null;
  reviewedAt: string | null;
  alias: MergeProfessor;
  canonical: MergeProfessor;
}

export interface MergeChange {
  aliasId: string;
  canonicalId: string | null;
  status: MergeStatus | "skipped";
  problem: string | null;
}

export interface MergeChangeResult {
  changes: MergeChange[];
  rebuildCommand: string | null;
  affectedProfessorIds: string[];
}

export class AdminKeyError extends Error {}

/** A non-401 failure, with the HTTP status so callers can tell 404 from 409. */
export class AdminRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function adminFetch<T>(
  key: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": key,
      ...init?.headers,
    },
  });
  if (response.status === 401) throw new AdminKeyError("Wrong admin key.");
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new AdminRequestError(
      typeof body.detail === "string"
        ? body.detail
        : `Request failed (HTTP ${response.status})`,
      response.status,
    );
  }
  return response.json();
}

export interface PendingSummary {
  professorId: string;
  name: string;
  reason: string;
  changedAt: string;
  revision: number;
}

export interface SummaryJob {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed" | "quota_exhausted";
  professorIds: string[];
  completedIds: string[];
  failedIds: string[];
  total: number;
  completed: number;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  logs: string[];
}

export const getPendingSummaries = (key: string) =>
  adminFetch<{ professors: PendingSummary[] }>(key, "/admin/summary-rebuilds");
export const getSummaryJobs = (key: string) =>
  adminFetch<{ jobs: SummaryJob[] }>(key, "/admin/summary-jobs");
export const getSummaryJob = (key: string, id: string) =>
  adminFetch<{ job: SummaryJob }>(
    key,
    `/admin/summary-jobs/${encodeURIComponent(id)}`,
  );
export const createSummaryJob = (key: string, professorIds: string[]) =>
  adminFetch<{ job: SummaryJob; deduplicated: boolean }>(
    key,
    "/admin/summary-jobs",
    {
      method: "POST",
      body: JSON.stringify({ professor_ids: professorIds }),
    },
  );
export const retrySummaryJob = (key: string, id: string) =>
  adminFetch<{ job: SummaryJob; deduplicated: boolean }>(
    key,
    `/admin/summary-jobs/${encodeURIComponent(id)}/retry`,
    { method: "POST" },
  );

export interface CronMonitor {
  key: string;
  name: string;
  status:
    | "healthy"
    | "failing"
    | "running"
    | "paused"
    | "unknown"
    | "unavailable";
  schedule: string | null;
  lastActivityAt: string | null;
  lastDurationSeconds: number | null;
  nextExpectedAt: string | null;
  url: string;
  recentRuns: {
    startedAt: string | null;
    endedAt: string | null;
    durationSeconds: number | null;
  }[];
}
export interface MonitorResponse {
  status: "ok" | "stale" | "unavailable" | "not_configured";
  fetchedAt: string | null;
  message: string | null;
  monitors: CronMonitor[];
}
export interface OperationsHealth {
  checkedAt: string;
  api: { status: "healthy"; version: string };
  database: { status: "healthy" | "unavailable" };
  redis: { status: "healthy" | "unavailable" };
  worker: {
    status:
      | "healthy"
      | "stale"
      | "not_started"
      | "not_configured"
      | "unavailable";
    lastHeartbeatAt: string | null;
  };
}
export const getCronMonitors = (key: string) =>
  adminFetch<MonitorResponse>(key, "/admin/operations/monitors");
export const getOperationsHealth = (key: string) =>
  adminFetch<OperationsHealth>(key, "/admin/operations/health");

export interface DataFreshness {
  coursesUpdatedAt: string | null;
  sectionsUpdatedAt: string | null;
  newestReviewAt: string | null;
}

export const getDataFreshness = (key: string) =>
  adminFetch<DataFreshness>(key, "/admin/operations/freshness");

export interface GpaRun {
  status:
    | "selecting"
    | "fetching"
    | "cooldown"
    | "finalizing"
    | "succeeded"
    | "completed_with_errors"
    | "failed"
    | "interrupted"
    | "stale";
  startedAt: string;
  updatedAt: string;
  totalCourses: number | null;
  attemptedCourses: number;
  failedCourses: number;
  recordsWritten: number;
  retryAt: string | null;
}

export const getGpaRun = (key: string) =>
  adminFetch<GpaRun | null>(key, "/admin/operations/gpa");

export type SeatAlertPeriod = "day" | "week" | "month";

export interface SeatAlertHistory {
  timeZone: string;
  buckets: { startAt: string; sent: number }[];
}

export const getSeatAlertHistory = (
  key: string,
  period: SeatAlertPeriod,
  signal: AbortSignal,
) =>
  adminFetch<SeatAlertHistory>(
    key,
    `/admin/operations/seat-alerts?period=${period}`,
    { signal },
  );

export function checkAdminKey(key: string): Promise<{ ok: boolean }> {
  return adminFetch(key, "/admin/check");
}

export async function getProfessorMerges(
  key: string,
): Promise<ProfessorMerge[]> {
  const data = await adminFetch<{ merges: ProfessorMerge[] }>(
    key,
    "/admin/professor-merges",
  );
  // An older backend omits rmpId; recover it from the professor id.
  return data.merges.map((m) => ({
    ...m,
    alias: {
      ...m.alias,
      rmpId: m.alias.rmpId ?? rmpIdFromProfessorId(m.aliasId),
    },
    canonical: {
      ...m.canonical,
      rmpId: m.canonical.rmpId ?? rmpIdFromProfessorId(m.canonicalId),
    },
  }));
}

/** Professor ids are base64("Teacher-<number>"), the number being the RMP id. */
export function rmpIdFromProfessorId(id: string): number | null {
  try {
    const match = /^Teacher-(\d+)$/.exec(atob(id));
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

export interface CacheClearResult {
  keysDeleted: number;
  pagesRevalidated: number;
  revalidation: "ok" | "skipped" | "failed";
  message: string | null;
}

export const clearCache = (
  key: string,
  target: { professorIds?: string[]; courseCodes?: string[]; all?: boolean },
) =>
  adminFetch<CacheClearResult>(key, "/admin/cache/clear", {
    method: "POST",
    body: JSON.stringify({
      ...(target.professorIds?.length && {
        professor_ids: target.professorIds,
      }),
      ...(target.courseCodes?.length && { course_codes: target.courseCodes }),
      ...(target.all && { all: true }),
    }),
  });

export function setProfessorMergeStatus(
  key: string,
  aliasIds: string[],
  action: "confirm" | "reject",
): Promise<MergeChangeResult> {
  return adminFetch(key, `/admin/professor-merges/${action}`, {
    method: "POST",
    body: JSON.stringify({ alias_ids: aliasIds }),
  });
}

/* Instructor <-> RateMyProfessors profile links (/admin/instructor-links). */

export type LinkStatus = "proposed" | "confirmed" | "rejected";
export type InstructorTab = "proposed" | "confirmed" | "rejected" | "conflict";

export interface LinkCandidate {
  /** professors.id = base64("Teacher-<rmpLegacyId>"). */
  professorId: string;
  rmpLegacyId: number | null;
  /** RMP "First Last". */
  name: string;
  department: string | null;
  numRatings: number | null;
  avgRating: number | null;
  /** RMP hit type, a candidate the matcher turned down, or added by hand. */
  kind: "plausible" | "near" | "rejected" | "middle_initial" | "swapped" | "manual";
  /** Name score 0..1. */
  score: number | null;
  /** Why the matcher did not pick it, or a note. */
  reason: string | null;
  /** False: on RMP but not imported yet (the nightly import adds it). */
  inDatabase: boolean;
  status: LinkStatus;
  /** The instructor's courses this profile's reviews mention ("ECEN214"). */
  courseOverlap?: string[];
  /** Every course the profile's reviews mention. */
  reviewedCourses?: string[];
  aiReview?: {
    confidence: "high" | "possible" | "unclear" | "unlikely" | "very unlikely";
    reason: string;
    sources: { url: string; title: string; snippet: string }[];
  };
}

export interface InstructorLinks {
  /** "pidm:<pidm>", or "name:<registrar name>" without a PIDM. */
  key: string;
  name: string;
  pidm: number | null;
  campus: string | null;
  courses: string[];
  sections: number | null;
  tab: InstructorTab;
  linkedProfessorId: string | null;
  linkedProfessorIds: string[];
  noProfile: boolean;
  conflict: string | null;
  rmpSearchUrl: string;
  updatedAt: string;
  candidates: LinkCandidate[];
}

export type InstructorLinkCounts = Record<InstructorTab, number>;

export interface InstructorLinksPage {
  instructors: InstructorLinks[];
  counts: InstructorLinkCounts;
  total: number;
}

export interface InstructorLinkResult {
  instructor: InstructorLinks;
  invalidatedCourses: string[];
}

export function getInstructorLinks(
  key: string,
  params: { tab: InstructorTab; q?: string; limit?: number; offset?: number },
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({
    tab: params.tab,
    limit: String(params.limit ?? 200),
    offset: String(params.offset ?? 0),
  });
  if (params.q?.trim()) query.set("q", params.q.trim());
  return adminFetch<InstructorLinksPage>(
    key,
    `/admin/instructor-links?${query}`,
    { signal },
  );
}

const postLinks = (key: string, action: string, body: object) =>
  adminFetch<InstructorLinkResult>(key, `/admin/instructor-links/${action}`, {
    method: "POST",
    body: JSON.stringify(body),
  });

/** Adds the selected links and rejects the remaining pending candidates. */
export const linkInstructor = (key: string, k: string, professorIds: string[]) =>
  postLinks(key, "link", { key: k, professorIds });
export const markNoProfile = (key: string, k: string) =>
  postLinks(key, "no-profile", { key: k });
export const rejectCandidates = (
  key: string,
  k: string,
  professorIds: string[],
) => postLinks(key, "reject", { key: k, professorIds });
export const rejectAllCandidates = (key: string, k: string) =>
  postLinks(key, "reject-all", { key: k });

export interface AiRejectionPreview {
  token: string;
  candidates: number;
  instructors: number;
  hasVeryUnlikelyRatings: boolean;
}

export const previewAiRejection = (key: string) =>
  adminFetch<AiRejectionPreview>(key, "/admin/instructor-links/ai-reject");

export const applyAiRejection = (key: string, token: string) =>
  adminFetch<{ rejected: number }>(key, "/admin/instructor-links/ai-reject", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
/** A confirmed decision goes back to proposed. */
export const undoInstructorLink = (key: string, k: string) =>
  postLinks(key, "undo", { key: k });

export const professorIdFromRmpId = (rmpId: number) =>
  btoa(`Teacher-${rmpId}`);

/**
 * The RMP number from a pasted profile URL
 * (ratemyprofessors.com/professor/2348685), a bare number, or one of our
 * professor ids. Null when it is none of those.
 */
export function parseRmpProfile(input: string): number | null {
  const text = input.trim();
  if (!text) return null;
  if (/^\d+$/.test(text)) return Number(text);
  const url =
    /ratemyprofessors\.com\/professor\/(\d+)/i.exec(text) ??
    /ratemyprofessors\.com\/.*[?&]tid=(\d+)/i.exec(text);
  if (url) return Number(url[1]);
  return rmpIdFromProfessorId(text);
}
