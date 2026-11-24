"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "@/components/app-link";
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
  getSummaryJob,
  getSummaryJobs,
  retrySummaryJob,
  type SummaryJob,
} from "@/lib/admin-api";

export default function AdminJobs() {
  const { adminKey, signOut } = useAdmin();
  const [jobs, setJobs] = useState<SummaryJob[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SummaryJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const retryingRef = useRef(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  useEffect(() => {
    setSelectedId(new URLSearchParams(window.location.search).get("job"));
  }, []);
  const load = useCallback(async () => {
    setBusy(true);
    try {
      const data = await getSummaryJobs(adminKey);
      setJobs(data.jobs);
      setUpdatedAt(new Date().toISOString());
      setError(null);
    } catch (e) {
      if (e instanceof AdminKeyError) signOut();
      else
        setError(
          e instanceof Error ? e.message : "Could not load run history.",
        );
    } finally {
      setBusy(false);
    }
  }, [adminKey, signOut]);
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 10000);
    return () => window.clearInterval(timer);
  }, [load]);
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let active = true;
    setDetail(null);
    setDetailError(null);
    const fetchDetail = async () => {
      try {
        const data = await getSummaryJob(adminKey, selectedId);
        if (active) {
          setDetail(data.job);
          setDetailError(null);
        }
      } catch (e) {
        if (active) {
          if (e instanceof AdminKeyError) signOut();
          else
            setDetailError(
              e instanceof Error ? e.message : "Could not load this run.",
            );
        }
      }
    };
    void fetchDetail();
    const timer = window.setInterval(() => {
      if (!document.hidden) void fetchDetail();
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [adminKey, selectedId, signOut]);
  const select = (id: string) => {
    setSelectedId(id);
    window.history.replaceState(
      null,
      "",
      `/admin/jobs?job=${encodeURIComponent(id)}`,
    );
  };
  const retry = async () => {
    if (!detail || retryingRef.current) return;
    retryingRef.current = true;
    setRetrying(true);
    setDetailError(null);
    try {
      const data = await retrySummaryJob(adminKey, detail.id);
      select(data.job.id);
      setDetail(data.job);
      await load();
    } catch (e) {
      if (e instanceof AdminKeyError) signOut();
      else
        setDetailError(
          e instanceof Error ? e.message : "Could not retry this run.",
        );
    } finally {
      retryingRef.current = false;
      setRetrying(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">
            Run history
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Summary rebuilds, progress, and results. Refreshes while this page
            is visible.
          </p>
        </div>
        <Button variant="outline" disabled={busy} onClick={() => void load()}>
          {busy ? "Refreshing…" : "Refresh history"}
        </Button>
      </header>
      <AdminError message={error} />
      {updatedAt && (
        <p className="text-xs text-text-muted">
          Last updated {timestamp(updatedAt)}
          {error ? " · Showing the last successful snapshot" : ""}
        </p>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <section
          className={`${panelClass} min-w-0 space-y-4`}
          aria-labelledby="runs-heading"
        >
          <h2
            id="runs-heading"
            className="text-lg font-medium text-text-heading"
          >
            Recent rebuilds
          </h2>
          {jobs === null ? (
            <p className="text-sm text-text-muted">
              {error ? "Run history could not be loaded." : "Loading history…"}
            </p>
          ) : !jobs.length ? (
            <p className="text-sm text-text-muted">
              No summary rebuilds have been queued yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => select(job.id)}
                    aria-pressed={selectedId === job.id}
                    className={`w-full space-y-2 rounded-lg border p-3 text-left transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:outline-ring ${selectedId === job.id ? "border-primary bg-raised" : "border-border"}`}
                  >
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-text-heading">
                        {job.total}{" "}
                        {job.total === 1 ? "professor" : "professors"}
                      </span>
                      <StatusBadge status={job.status} />
                    </span>
                    <span className="block text-xs text-text-muted">
                      Queued {timestamp(job.createdAt)}
                    </span>
                    <span className="block text-sm text-text-body">
                      {job.completed} / {job.total} completed
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section
          className={`${panelClass} min-w-0 space-y-4`}
          aria-labelledby="detail-heading"
        >
          <h2
            id="detail-heading"
            className="text-lg font-medium text-text-heading"
          >
            Run details
          </h2>
          <AdminError message={detailError} />
          {!selectedId ? (
            <p className="text-sm text-text-muted">
              Select a run to inspect progress and logs.
            </p>
          ) : !detail ? (
            <p className="text-sm text-text-muted">
              {detailError
                ? "Run details are unavailable."
                : "Loading run details…"}
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge status={detail.status} />
                <span className="text-sm text-text-body">
                  {detail.completed} / {detail.total} completed
                </span>
              </div>
              <progress
                aria-label="Professors completed"
                value={detail.completed}
                max={Math.max(1, detail.total)}
                className="h-2 w-full accent-primary"
              />
              <dl className="space-y-2 text-sm">
                {[
                  ["Queued", timestamp(detail.createdAt)],
                  ["Started", timestamp(detail.startedAt)],
                  ["Finished", timestamp(detail.finishedAt)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-wrap justify-between gap-2"
                  >
                    <dt className="text-text-muted">{label}</dt>
                    <dd className="text-text-body">{value}</dd>
                  </div>
                ))}
              </dl>
              {detail.status === "queued" && (
                <p className="text-sm text-text-muted">
                  Waiting for the summary worker. Check its heartbeat on
                  Overview if this run does not start.
                </p>
              )}
              {detail.status === "quota_exhausted" && (
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  The AI service quota was exhausted. Retry after the quota is
                  available again.
                </p>
              )}
              {detail.error && (
                <p className="break-words text-sm text-red-700 dark:text-red-300">
                  {detail.error}
                </p>
              )}
              {["failed", "quota_exhausted"].includes(detail.status) && (
                <Button disabled={retrying} onClick={() => void retry()}>
                  {retrying ? "Queueing retry…" : "Retry unfinished professors"}
                </Button>
              )}
              <details>
                <summary className="cursor-pointer text-sm text-text-heading">
                  Professors in this run ({detail.professorIds.length})
                </summary>
                <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs text-text-muted">
                  {detail.professorIds.map((id) => (
                    <li key={id} className="break-all">
                      {id} ·{" "}
                      {detail.completedIds.includes(id)
                        ? "completed"
                        : detail.failedIds.includes(id)
                          ? "failed"
                          : "unfinished"}
                    </li>
                  ))}
                </ul>
              </details>
              <div>
                <h3 className="mb-2 text-sm font-medium text-text-heading">
                  Execution log
                </h3>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-raised p-3 text-xs text-text-body">
                  {detail.logs.length
                    ? detail.logs.join("\n")
                    : "No log entries yet."}
                </pre>
              </div>
              <p className="break-all text-xs text-text-muted">
                Run {detail.id}
              </p>
              <p className="text-sm text-text-muted">
                If merges changed during this run, another rebuild may be
                pending.{" "}
                <Link
                  href="/admin/summaries"
                  className="text-text-heading underline underline-offset-4"
                >
                  Review pending summaries
                </Link>
                .
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
