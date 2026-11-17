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
}

export class AdminKeyError extends Error {}

async function adminFetch<T>(
  key: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": key,
      ...init?.headers,
    },
  });
  if (response.status === 401) throw new AdminKeyError("Wrong admin key.");
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (HTTP ${response.status})`);
  }
  return response.json();
}

export function checkAdminKey(key: string): Promise<{ ok: boolean }> {
  return adminFetch(key, "/admin/check");
}

export async function getProfessorMerges(key: string): Promise<ProfessorMerge[]> {
  const data = await adminFetch<{ merges: ProfessorMerge[] }>(
    key,
    "/admin/professor-merges",
  );
  return data.merges;
}

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
