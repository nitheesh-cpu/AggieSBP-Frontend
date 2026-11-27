/**
 * Calls to the backend's /admin endpoints through the site's own server
 * (`/api/admin/*`, src/app/api/admin/[...path]/route.ts). Cloudflare Access
 * signs the admin in; the server checks that and adds the admin key, so the
 * key never reaches the browser (D-052). Uses plain fetch, not trackedFetch,
 * so nothing about admin requests reaches analytics.
 */

import type { AutodeployStatus } from "./autodeploy-status";

export type { AutodeploySide, AutodeployStatus } from "./autodeploy-status";

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

/** The Cloudflare Access sign-in is missing or expired (HTTP 401/403 from the proxy). */
export class AdminAuthError extends Error {}

/** A non-401 failure, with the HTTP status so callers can tell 404 from 409. */
export class AdminRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** `path` is the backend path ("/admin/..."); the browser calls it under /api on this site. */
async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (response.status === 401 || response.status === 403) {
    throw new AdminAuthError(
      "Your admin sign-in has expired. Reload the page to sign in again.",
    );
  }
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

export const getPendingSummaries = () =>
  adminFetch<{ professors: PendingSummary[] }>("/admin/summary-rebuilds");
export const getSummaryJobs = () =>
  adminFetch<{ jobs: SummaryJob[] }>("/admin/summary-jobs");
export const getSummaryJob = (id: string) =>
  adminFetch<{ job: SummaryJob }>(
    `/admin/summary-jobs/${encodeURIComponent(id)}`,
  );
export const createSummaryJob = (professorIds: string[]) =>
  adminFetch<{ job: SummaryJob; deduplicated: boolean }>(
    "/admin/summary-jobs",
    {
      method: "POST",
      body: JSON.stringify({ professor_ids: professorIds }),
    },
  );
export const retrySummaryJob = (id: string) =>
  adminFetch<{ job: SummaryJob; deduplicated: boolean }>(
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
export const getCronMonitors = () =>
  adminFetch<MonitorResponse>("/admin/operations/monitors");
export const getOperationsHealth = () =>
  adminFetch<OperationsHealth>("/admin/operations/health");

export interface DataFreshness {
  coursesUpdatedAt: string | null;
  sectionsUpdatedAt: string | null;
  newestReviewAt: string | null;
}

export const getDataFreshness = () =>
  adminFetch<DataFreshness>("/admin/operations/freshness");

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

/** What runs on the VM: site release, systemd services and autodeploy (src/app/api/admin/site-status). */
export interface SiteStatus {
  release: { commit: string; deployedAt: string } | null;
  services:
    | { unit: string; label: string; state: string; since: string | null }[]
    | null;
  /** Missing from a site built before autodeploy reporting. */
  autodeploy?: AutodeployStatus | null;
}
export const getSiteStatus = () => adminFetch<SiteStatus>("/admin/site-status");

export const getGpaRun = () =>
  adminFetch<GpaRun | null>("/admin/operations/gpa");

export type SeatAlertPeriod = "day" | "week" | "month";

export interface SeatAlertHistory {
  timeZone: string;
  buckets: { startAt: string; sent: number }[];
}

export const getSeatAlertHistory = (
  period: SeatAlertPeriod,
  signal: AbortSignal,
) =>
  adminFetch<SeatAlertHistory>(
    `/admin/operations/seat-alerts?period=${period}`,
    { signal },
  );

/** Resolves when the Cloudflare Access sign-in is valid and the backend accepts the proxy. */
export function checkAdminAccess(): Promise<{ ok: boolean }> {
  return adminFetch("/admin/check");
}

export async function getProfessorMerges(): Promise<ProfessorMerge[]> {
  const data = await adminFetch<{ merges: ProfessorMerge[] }>(
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
  target: { professorIds?: string[]; courseCodes?: string[]; all?: boolean },
) =>
  adminFetch<CacheClearResult>("/admin/cache/clear", {
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
  aliasIds: string[],
  action: "confirm" | "reject",
): Promise<MergeChangeResult> {
  return adminFetch(`/admin/professor-merges/${action}`, {
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
    `/admin/instructor-links?${query}`,
    { signal },
  );
}

const postLinks = (action: string, body: object) =>
  adminFetch<InstructorLinkResult>(`/admin/instructor-links/${action}`, {
    method: "POST",
    body: JSON.stringify(body),
  });

/** Adds the selected links and rejects the remaining pending candidates. */
export const linkInstructor = (k: string, professorIds: string[]) =>
  postLinks("link", { key: k, professorIds });
export const markNoProfile = (k: string) =>
  postLinks("no-profile", { key: k });
export const rejectCandidates = (
  k: string,
  professorIds: string[],
) => postLinks("reject", { key: k, professorIds });
export const rejectAllCandidates = (k: string) =>
  postLinks("reject-all", { key: k });

export interface AiRejectionPreview {
  token: string;
  candidates: number;
  instructors: number;
}

export const previewAiRejection = () =>
  adminFetch<AiRejectionPreview>("/admin/instructor-links/ai-reject");

export const applyAiRejection = (token: string) =>
  adminFetch<{ rejected: number }>("/admin/instructor-links/ai-reject", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
/** A confirmed decision goes back to proposed. */
export const undoInstructorLink = (k: string) =>
  postLinks("undo", { key: k });

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
