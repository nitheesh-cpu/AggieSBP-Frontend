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
    throw new Error(
      typeof body.detail === "string"
        ? body.detail
        : `Request failed (HTTP ${response.status})`,
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
