/**
 * Reads the status file the VM's autodeploy script writes after every run
 * (parent repo tools/deploy/aggiesbp-autodeploy.sh, D-024) for the admin
 * Server panel. The file is untrusted input: every field is checked and
 * trimmed, and anything unexpected becomes null.
 *
 * Kept free of Next and `@/` imports so `node --test` can load it.
 */

export const AUTODEPLOY_STATES = [
  "up_to_date",
  "deployed",
  "waiting_ci",
  "ci_failed",
  "held",
  "needs_attention",
  "failed",
  "unreachable",
] as const;
export type AutodeployState = (typeof AUTODEPLOY_STATES)[number] | "unknown";

export interface AutodeploySide {
  state: AutodeployState;
  /** Commit running now (short sha). */
  live: string | null;
  /** Commit the state is about, e.g. the one waiting on CI. */
  commit: string | null;
  message: string | null;
  /** When the side entered this state. */
  since: string | null;
  lastDeploy: { commit: string; at: string } | null;
}

export interface AutodeployStatus {
  checkedAt: string;
  /** No run for STALE_AFTER_MS: the cron job or the VM may be down. */
  stale: boolean;
  paused: boolean;
  frontend: AutodeploySide | null;
  backend: AutodeploySide | null;
}

/** Cron runs every 5 minutes and a frontend build holds the lock for ~2. */
export const STALE_AFTER_MS = 15 * 60 * 1000;
export const MAX_STATUS_BYTES = 16 * 1024;

const SHA = /^[0-9a-f]{7,40}$/;

function isoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 40) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function shaOrNull(value: unknown): string | null {
  return typeof value === "string" && SHA.test(value) ? value.slice(0, 7) : null;
}

function side(value: unknown): AutodeploySide | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const state = AUTODEPLOY_STATES.find((s) => s === raw.state) ?? "unknown";
  const deploy = raw.lastDeploy as Record<string, unknown> | null | undefined;
  const deployCommit = shaOrNull(deploy?.commit);
  const deployAt = isoOrNull(deploy?.at);
  return {
    state,
    live: shaOrNull(raw.live),
    commit: shaOrNull(raw.commit),
    message:
      typeof raw.message === "string" && raw.message.trim()
        ? raw.message.trim().slice(0, 500)
        : null,
    since: isoOrNull(raw.since),
    lastDeploy: deployCommit && deployAt ? { commit: deployCommit, at: deployAt } : null,
  };
}

/** Parses the file's text; null when it is missing, too big or not a status. */
export function parseAutodeployStatus(text: string, now = Date.now()): AutodeployStatus | null {
  if (text.length > MAX_STATUS_BYTES) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const data = raw as Record<string, unknown>;
  const checkedAt = isoOrNull(data.checkedAt);
  if (!checkedAt) return null;
  return {
    checkedAt,
    stale: now - Date.parse(checkedAt) > STALE_AFTER_MS,
    paused: data.paused === true,
    frontend: side(data.frontend),
    backend: side(data.backend),
  };
}
