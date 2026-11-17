"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/components/admin/admin-shell";
import {
  AdminError,
  panelClass,
  StatusBadge,
  timestamp,
} from "@/components/admin/admin-ui";
import {
  AdminKeyError,
  getCronMonitors,
  getOperationsHealth,
  type MonitorResponse,
  type OperationsHealth,
} from "@/lib/admin-api";

export default function AdminOverview() {
  const { adminKey, signOut } = useAdmin();
  const [monitors, setMonitors] = useState<MonitorResponse | null>(null);
  const [health, setHealth] = useState<OperationsHealth | null>(null);
  const [monitorError, setMonitorError] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setBusy(true);
    const results = await Promise.allSettled([
      getCronMonitors(adminKey),
      getOperationsHealth(adminKey),
    ]);
    const [m, h] = results;
    if (
      results.some(
        (r) => r.status === "rejected" && r.reason instanceof AdminKeyError,
      )
    ) {
      signOut();
      return;
    }
    if (m.status === "fulfilled") {
      setMonitors(m.value);
      setMonitorError(null);
    } else {
      setMonitorError(
        m.reason instanceof Error
          ? m.reason.message
          : "Could not load Cronitor.",
      );
      setMonitors(null);
    }
    if (h.status === "fulfilled") {
      setHealth(h.value);
      setHealthError(null);
    } else {
      setHealthError(
        h.reason instanceof Error
          ? h.reason.message
          : "Could not check service health.",
      );
      setHealth(null);
    }
    setBusy(false);
  }, [adminKey, signOut]);
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">
            Operations
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Check scheduled jobs and service health before starting maintenance.
          </p>
        </div>
        <Button variant="outline" disabled={busy} onClick={() => void load()}>
          <RefreshCw
            className={busy ? "animate-spin motion-reduce:animate-none" : ""}
          />
          {busy ? "Refreshing…" : "Refresh status"}
        </Button>
      </header>
      <section className={panelClass} aria-labelledby="health-heading">
        <h2
          id="health-heading"
          className="text-lg font-medium text-text-heading"
        >
          Service health
        </h2>
        <AdminError message={healthError} />
        {health ? (
          <>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["API", health.api.status],
                  ["Database", health.database.status],
                  ["Redis", health.redis.status],
                  ["Summary worker", health.worker.status],
                ] as const
              ).map(([name, status]) => (
                <div key={name} className="space-y-2">
                  <dt className="text-sm text-text-muted">{name}</dt>
                  <dd>
                    <StatusBadge status={status} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-text-muted">
              Checked {timestamp(health.checkedAt)} · Worker heartbeat:{" "}
              {timestamp(health.worker.lastHeartbeatAt)}
            </p>
            {health.worker.status !== "healthy" && (
              <p className="mt-3 text-sm text-amber-800 dark:text-amber-300">
                The summary worker is not reporting healthy. Queued rebuilds may
                wait until it is available.
              </p>
            )}
          </>
        ) : (
          !healthError && (
            <p className="mt-4 text-sm text-text-muted">Checking services…</p>
          )
        )}
      </section>
      <section className="space-y-4" aria-labelledby="cron-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="cron-heading"
            className="text-lg font-medium text-text-heading"
          >
            Scheduled jobs
          </h2>
          <span className="text-xs text-text-muted">
            {monitors?.fetchedAt
              ? `Cronitor snapshot: ${timestamp(monitors.fetchedAt)}`
              : "Cronitor"}
          </span>
        </div>
        <AdminError message={monitorError} />
        {monitors && monitors.status !== "ok" && (
          <div
            role="status"
            className="rounded-lg border border-amber-500/40 bg-card p-4 text-sm text-text-body"
          >
            <StatusBadge status={monitors.status} />
            <p className="mt-2">
              {monitors.message ||
                "Live monitoring is unavailable. This does not indicate healthy jobs."}
            </p>
          </div>
        )}
        {!monitors && !monitorError && (
          <p className="text-sm text-text-muted">Loading scheduled jobs…</p>
        )}
        {monitors?.status === "ok" && monitors.monitors.length === 0 && (
          <p className={panelClass}>
            No Cronitor monitors are configured for this dashboard.
          </p>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          {monitors?.monitors.map((monitor) => (
            <article
              key={monitor.key}
              className={`${panelClass} min-w-0 space-y-4`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-medium text-text-heading break-words">
                  {monitor.name}
                </h3>
                <StatusBadge
                  status={monitors.status === "ok" ? monitor.status : "stale"}
                />
              </div>
              {monitors.status !== "ok" && (
                <p className="text-xs text-text-muted">
                  Previous snapshot · Last reported state: {monitor.status}
                </p>
              )}
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Last activity", timestamp(monitor.lastActivityAt)],
                  ["Next expected", timestamp(monitor.nextExpectedAt)],
                  [
                    "Last duration",
                    monitor.lastDurationSeconds === null
                      ? "Not available"
                      : `${monitor.lastDurationSeconds.toFixed(1)} seconds`,
                  ],
                  ["Schedule", monitor.schedule || "Not available"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-text-muted">{label}</dt>
                    <dd className="mt-1 break-words text-text-body">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <details className="w-full">
                  <summary className="cursor-pointer text-sm text-text-heading">
                    Recent executions ({monitor.recentRuns.length})
                  </summary>
                  <ul className="mt-3 space-y-2 text-xs text-text-muted">
                    {monitor.recentRuns.map((run, index) => (
                      <li
                        key={`${run.startedAt}-${index}`}
                        className="border-t border-border pt-2"
                      >
                        {timestamp(run.startedAt)} ·{" "}
                        {run.endedAt
                          ? `Ended ${timestamp(run.endedAt)}`
                          : "No completion reported"}
                        {run.durationSeconds !== null &&
                          ` · ${run.durationSeconds.toFixed(1)}s`}
                      </li>
                    ))}
                    {monitor.recentRuns.length === 0 && (
                      <li>No recent executions reported.</li>
                    )}
                  </ul>
                </details>
                {monitor.url.startsWith("https://cronitor.io/") && (
                  <a
                    href={monitor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-text-heading hover:underline"
                  >
                    Open in Cronitor <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/summaries">Review pending summaries</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/jobs">View run history</Link>
        </Button>
      </div>
    </div>
  );
}
