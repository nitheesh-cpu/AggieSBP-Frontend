"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAdmin } from "@/components/admin/admin-shell";
import {
  AdminError,
  StatusBadge,
  timestamp,
} from "@/components/admin/admin-ui";
import {
  AdminKeyError,
  AdminRequestError,
  getCronMonitors,
  getInstructorLinks,
  getDataFreshness,
  getGpaRun,
  getOperationsHealth,
  getPendingSummaries,
  type CronMonitor,
  type DataFreshness,
  type GpaRun,
  type MonitorResponse,
} from "@/lib/admin-api";

const panel = "min-w-0 rounded-xl border border-border bg-card";
const jobColumns =
  "lg:grid-cols-[minmax(0,1.5fr)_6.5rem_repeat(2,minmax(0,1fr))]";
const shortDate = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const updateDate = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const reviewDate = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeZone: "UTC",
});

function DashboardTime({
  value,
  format = shortDate,
}: {
  value: string | null;
  format?: Intl.DateTimeFormat;
}) {
  if (!value || Number.isNaN(Date.parse(value))) return "—";
  return (
    <time
      dateTime={value}
      title={format !== reviewDate ? timestamp(value) : undefined}
    >
      {format.format(new Date(value))}
    </time>
  );
}

function needsAttention(monitor: CronMonitor) {
  return (
    monitor.status === "failing" ||
    monitor.status === "unavailable" ||
    monitor.status === "unknown"
  );
}

function ScheduledJobs({ data }: { data: MonitorResponse | undefined }) {
  if (!data)
    return <p className="px-4 py-3 text-sm text-text-muted">Loading jobs…</p>;

  const live = data.status === "ok";
  const jobs = live
    ? [...data.monitors].sort(
        (a, b) => Number(needsAttention(b)) - Number(needsAttention(a)),
      )
    : data.monitors;
  const issues = live ? jobs.filter(needsAttention).length : 0;

  return (
    <>
      {!live && (
        <div
          role="status"
          className="mx-4 mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-amber-500/40 px-3 py-2 text-sm text-text-body"
        >
          <StatusBadge status={data.status} />
          <p>{data.message || "Live job monitoring is unavailable."}</p>
        </div>
      )}
      {live && jobs.length === 0 && (
        <p className="px-4 pb-4 text-sm text-text-muted">
          No Cronitor monitors are configured.
        </p>
      )}
      {issues > 0 && (
        <p className="px-4 pb-3 text-sm font-medium text-amber-800 dark:text-amber-300">
          {issues} {issues === 1 ? "job needs" : "jobs need"} attention
        </p>
      )}
      {jobs.length > 0 && (
        <>
          <div
            aria-hidden="true"
            className={`hidden gap-3 border-y border-border bg-raised px-4 py-2 text-xs font-medium text-text-muted lg:grid ${jobColumns}`}
          >
            <span>Job</span>
            <span>Status</span>
            <span>Last activity</span>
            <span>Next expected</span>
          </div>
          <ul className="divide-y divide-border border-t border-border lg:border-t-0">
            {jobs.map((job) => (
              <li key={job.key}>
                <details className="group">
                  <summary
                    className={`grid cursor-pointer list-none grid-cols-2 items-center gap-x-3 gap-y-2 px-4 py-3 text-sm transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden ${jobColumns}`}
                  >
                    <span className="col-span-2 flex min-w-0 items-center gap-2 font-medium text-text-heading lg:col-span-1">
                      <ChevronDown
                        aria-hidden="true"
                        className="size-3.5 shrink-0 -rotate-90 text-text-muted transition-transform group-open:rotate-0 motion-reduce:transition-none"
                      />
                      <span className="min-w-0 break-words">{job.name}</span>
                      <span className="ml-auto shrink-0 lg:hidden">
                        <StatusBadge status={live ? job.status : "stale"} />
                      </span>
                    </span>
                    <span className="hidden lg:block">
                      <StatusBadge status={live ? job.status : "stale"} />
                    </span>
                    <span className="min-w-0 text-text-body">
                      <span className="block text-xs text-text-muted lg:sr-only">
                        Last activity
                      </span>
                      <DashboardTime value={job.lastActivityAt} />
                    </span>
                    <span className="min-w-0 text-text-body">
                      <span className="block text-xs text-text-muted lg:sr-only">
                        Next expected
                      </span>
                      <DashboardTime value={job.nextExpectedAt} />
                    </span>
                  </summary>
                  <div className="space-y-2 border-t border-border bg-raised/40 px-4 py-3 sm:pl-10">
                    {!live && (
                      <p className="text-xs text-text-muted">
                        Last reported status {job.status}
                      </p>
                    )}
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-text-muted">
                      <span>
                        Last duration{" "}
                        {job.lastDurationSeconds === null
                          ? "—"
                          : `${job.lastDurationSeconds.toFixed(1)}s`}
                      </span>
                      {job.url.startsWith("https://cronitor.io/") && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-text-heading underline-offset-4 hover:underline"
                        >
                          Open in Cronitor{" "}
                          <ExternalLink aria-hidden="true" className="size-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs font-medium text-text-heading">
                      Recent executions
                    </p>
                    {job.recentRuns.length ? (
                      <ul className="space-y-1 text-xs text-text-muted">
                        {job.recentRuns.map((run, index) => (
                          <li key={`${run.startedAt}-${index}`}>
                            <DashboardTime value={run.startedAt} /> ·{" "}
                            {run.endedAt ? (
                              <>
                                Ended <DashboardTime value={run.endedAt} />
                              </>
                            ) : (
                              "No completion reported"
                            )}
                            {run.durationSeconds !== null &&
                              ` · ${run.durationSeconds.toFixed(1)}s`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-text-muted">
                        No recent executions reported.
                      </p>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

async function fetchOverview(key: string) {
  return Promise.allSettled([
    getCronMonitors(key),
    getOperationsHealth(key),
    getPendingSummaries(key),
    getDataFreshness(key),
    getGpaRun(key),
    getInstructorLinks(key, { tab: "proposed", limit: 1 }),
  ]);
}

function GpaPanel({
  result,
}: {
  result?: PromiseSettledResult<GpaRun | null>;
}) {
  const run = result?.status === "fulfilled" ? result.value : null;
  return (
    <section className={panel} aria-labelledby="gpa-heading">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <h2
          id="gpa-heading"
          className="text-base font-semibold text-text-heading"
        >
          GPA upsert
        </h2>
        {run && <StatusBadge status={run.status} />}
      </div>
      <div className="space-y-2 border-t border-border px-4 py-3 text-sm text-text-body">
        {run ? (
          <>
            {run.totalCourses !== null && run.totalCourses > 0 && (
              <>
                <p>
                  {run.attemptedCourses.toLocaleString()} of{" "}
                  {run.totalCourses.toLocaleString()} courses attempted
                </p>
                <Progress
                  aria-label="GPA courses attempted"
                  value={Math.min(
                    100,
                    (run.attemptedCourses / run.totalCourses) * 100,
                  )}
                />
              </>
            )}
            {run.totalCourses === 0 && <p>No courses to fetch.</p>}
            {run.status === "selecting" && <p>Finding courses to refresh…</p>}
            {run.status === "cooldown" && run.retryAt && (
              <p>
                Rate limited by anex.us. Retry scheduled for{" "}
                <DashboardTime value={run.retryAt} />.
              </p>
            )}
            {run.status === "stale" && (
              <p>No progress update in the last five minutes.</p>
            )}
            <p>
              {run.recordsWritten.toLocaleString()} records upserted
              {run.failedCourses > 0 &&
                ` · ${run.failedCourses.toLocaleString()} courses failed`}
            </p>
            <div className="text-xs text-text-muted">
              <p>
                Started <DashboardTime value={run.startedAt} />
              </p>
              <p>
                Updated <DashboardTime value={run.updatedAt} />
              </p>
            </div>
          </>
        ) : result?.status === "rejected" ? (
          <AdminError
            message={errorMessage(result, "Could not load GPA progress.")}
          />
        ) : (
          <p className="text-text-muted">
            {result
              ? "No GPA run has reported progress yet."
              : "Checking GPA progress…"}
          </p>
        )}
      </div>
    </section>
  );
}

function FreshnessPanel({
  result,
}: {
  result?: PromiseSettledResult<DataFreshness>;
}) {
  const dates = result?.status === "fulfilled" ? result.value : undefined;
  return (
    <section className={panel} aria-labelledby="freshness-heading">
      <h2
        id="freshness-heading"
        className="px-4 py-3 text-base font-semibold text-text-heading"
      >
        Data freshness
      </h2>
      {dates ? (
        <dl className="divide-y divide-border border-t border-border">
          {(
            [
              ["Courses updated", dates.coursesUpdatedAt, updateDate],
              ["Sections updated", dates.sectionsUpdatedAt, updateDate],
              ["Newest review", dates.newestReviewAt, reviewDate],
            ] as const
          ).map(([label, value, format]) => (
            <div
              key={label}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-4 py-2.5 text-sm"
            >
              <dt className="font-medium text-text-heading">{label}</dt>
              <dd className="text-xs text-text-muted">
                {value ? (
                  <DashboardTime value={value} format={format} />
                ) : (
                  "No date recorded"
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="border-t border-border px-4 py-3 text-sm text-text-muted">
          {result
            ? "Dataset timestamps unavailable."
            : "Checking dataset timestamps…"}
        </p>
      )}
    </section>
  );
}

function errorMessage(result: PromiseRejectedResult, fallback: string) {
  return result.reason instanceof Error ? result.reason.message : fallback;
}

export default function AdminOverview() {
  const { adminKey, signOut } = useAdmin();
  const [snapshot, setSnapshot] =
    useState<Awaited<ReturnType<typeof fetchOverview>>>();
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      const results = await fetchOverview(adminKey);
      if (
        results.some(
          (result) =>
            result.status === "rejected" &&
            result.reason instanceof AdminKeyError,
        )
      ) {
        signOut();
        return;
      }
      setSnapshot(results);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }, [adminKey, signOut]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [load]);

  const [
    monitorResult,
    healthResult,
    pendingResult,
    freshnessResult,
    gpaResult,
    linksResult,
  ] = snapshot ?? [];
  const monitors =
    monitorResult?.status === "fulfilled" ? monitorResult.value : undefined;
  const health =
    healthResult?.status === "fulfilled" ? healthResult.value : undefined;
  const pendingCount =
    pendingResult?.status === "fulfilled"
      ? pendingResult.value.professors.length
      : undefined;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-text-heading">Operations</h1>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void load()}
        >
          <RefreshCw
            aria-hidden="true"
            className={busy ? "animate-spin motion-reduce:animate-none" : ""}
          />
          {busy ? "Refreshing…" : "Refresh status"}
        </Button>
      </header>

      <section
        className={`${panel} px-4 py-3`}
        aria-labelledby="health-heading"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2
            id="health-heading"
            className="text-base font-semibold text-text-heading"
          >
            Service health
          </h2>
          {health && (
            <span className="text-xs text-text-muted">
              Checked <DashboardTime value={health.checkedAt} />
            </span>
          )}
        </div>
        {health ? (
          <>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 lg:grid-cols-4">
              {(
                [
                  ["API", health.api.status],
                  ["Database", health.database.status],
                  ["Redis", health.redis.status],
                  ["Summary worker", health.worker.status],
                ] as const
              ).map(([name, status]) => (
                <div
                  key={name}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
                >
                  <dt className="text-text-body">{name}</dt>
                  <dd>
                    <StatusBadge status={status} />
                  </dd>
                </div>
              ))}
            </dl>
            {health.worker.status !== "healthy" && (
              <p className="mt-2 border-t border-border pt-2 text-xs text-amber-800 dark:text-amber-300">
                Queued rebuilds may wait for the summary worker.{" "}
                {health.worker.lastHeartbeatAt && (
                  <>
                    Last heartbeat{" "}
                    <DashboardTime value={health.worker.lastHeartbeatAt} />.
                  </>
                )}
              </p>
            )}
          </>
        ) : healthResult?.status === "rejected" ? (
          <div className="mt-2">
            <AdminError
              message={errorMessage(
                healthResult,
                "Could not check service health.",
              )}
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-text-muted">Checking services…</p>
        )}
      </section>

      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,3fr)_minmax(15rem,1fr)] xl:grid-cols-[minmax(0,3fr)_minmax(18rem,1fr)]">
        <section className={panel} aria-labelledby="cron-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
            <h2
              id="cron-heading"
              className="text-base font-semibold text-text-heading"
            >
              Scheduled jobs
            </h2>
            <span className="text-xs text-text-muted">
              Cronitor
              {monitors?.fetchedAt && (
                <>
                  {" "}
                  · <DashboardTime value={monitors.fetchedAt} />
                </>
              )}
            </span>
          </div>
          {monitorResult?.status === "rejected" ? (
            <div className="px-4 pb-3">
              <AdminError
                message={errorMessage(
                  monitorResult,
                  "Could not load Cronitor.",
                )}
              />
            </div>
          ) : (
            <ScheduledJobs data={monitors} />
          )}
        </section>

        <div className="min-w-0 space-y-4">
          <GpaPanel result={gpaResult} />
          <FreshnessPanel result={freshnessResult} />
          <section className={panel} aria-labelledby="maintenance-heading">
            <h2
              id="maintenance-heading"
              className="px-4 py-3 text-base font-semibold text-text-heading"
            >
              Summary maintenance
            </h2>
            <div className="divide-y divide-border border-t border-border">
              <Link
                href="/admin/summaries"
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <span>
                  <span className="block font-medium text-text-heading">
                    Review pending summaries
                  </span>
                  <span className="mt-0.5 block text-xs text-text-muted">
                    {pendingCount === undefined
                      ? pendingResult
                        ? "Pending count unavailable"
                        : "Checking pending summaries…"
                      : pendingCount === 0
                        ? "No rebuilds pending"
                        : `${pendingCount.toLocaleString()} ${pendingCount === 1 ? "professor needs" : "professors need"} a rebuild`}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-text-muted"
                />
              </Link>
              <Link
                href="/admin/jobs"
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-text-heading transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                View rebuild run history
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-text-muted"
                />
              </Link>
            </div>
          </section>
          <section className={panel} aria-labelledby="professor-data-heading">
            <h2
              id="professor-data-heading"
              className="px-4 py-3 text-base font-semibold text-text-heading"
            >
              Professor matching
            </h2>
            <div className="divide-y divide-border border-t border-border">
              <Link
                href="/admin/instructors"
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <span>
                  <span className="block font-medium text-text-heading">
                    Review instructor links
                  </span>
                  <span className="mt-0.5 block text-xs text-text-muted">
                    {linksSummary(linksResult)}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-text-muted"
                />
              </Link>
              <Link
                href="/admin/merges"
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-text-heading transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                Review duplicate professors
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-text-muted"
                />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function linksSummary(
  result?: PromiseSettledResult<{
    counts: { proposed: number; conflict: number };
  }>,
) {
  if (!result) return "Checking instructor links…";
  if (result.status === "rejected")
    return result.reason instanceof AdminRequestError &&
      result.reason.status === 409
      ? "Run migration 005 to enable"
      : "Count unavailable";
  const { proposed, conflict } = result.value.counts;
  const parts = [
    proposed === 0
      ? "Nothing to review"
      : `${proposed.toLocaleString()} to review`,
  ];
  if (conflict > 0)
    parts.push(
      `${conflict.toLocaleString()} ${conflict === 1 ? "conflict" : "conflicts"}`,
    );
  return parts.join(" · ");
}
