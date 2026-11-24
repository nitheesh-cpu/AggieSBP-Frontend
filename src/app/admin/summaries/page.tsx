"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdmin } from "@/components/admin/admin-shell";
import { AdminError, panelClass, timestamp } from "@/components/admin/admin-ui";
import {
  AdminAuthError,
  createSummaryJob,
  getPendingSummaries,
  type PendingSummary,
} from "@/lib/admin-api";

export default function AdminSummaries() {
  const { signOut } = useAdmin();
  const router = useRouter();
  const [professors, setProfessors] = useState<PendingSummary[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const initialSelection = useRef(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingSummaries();
      setProfessors(data.professors);
      const available = new Set(data.professors.map((p) => p.professorId));
      if (initialSelection.current) {
        initialSelection.current = false;
        try {
          const requested: unknown = JSON.parse(
            new URLSearchParams(window.location.search).get("professors") ||
              "[]",
          );
          if (Array.isArray(requested))
            setSelected(
              new Set(
                requested
                  .filter(
                    (id): id is string =>
                      typeof id === "string" && available.has(id),
                  )
                  .slice(0, 500),
              ),
            );
        } catch {
          /* A malformed selection does not affect the pending list. */
        }
      } else
        setSelected(
          (previous) =>
            new Set([...previous].filter((id) => available.has(id))),
        );
    } catch (e) {
      if (e instanceof AdminAuthError) signOut();
      else
        setError(
          e instanceof Error ? e.message : "Could not load pending summaries.",
        );
    } finally {
      setLoading(false);
    }
  }, [signOut]);
  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!selected.size || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createSummaryJob([...selected]);
      router.push(`/admin/jobs?job=${encodeURIComponent(result.job.id)}`);
    } catch (e) {
      if (e instanceof AdminAuthError) signOut();
      else
        setError(
          e instanceof Error ? e.message : "Could not queue the rebuild.",
        );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">
            Summary rebuilds
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Professors whose summaries need updating after merge changes.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={loading || submitting}
          onClick={() => void load()}
        >
          {loading ? "Refreshing…" : "Refresh list"}
        </Button>
      </header>
      <AdminError message={error} />
      <section
        className={`${panelClass} space-y-4`}
        aria-labelledby="pending-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="pending-heading"
            className="text-lg font-medium text-text-heading"
          >
            Awaiting rebuild {professors && `(${professors.length})`}
          </h2>
          {!!professors?.length && (
            <Button
              variant="outline"
              size="sm"
              disabled={submitting || loading}
              onClick={() =>
                setSelected(
                  selected.size
                    ? new Set()
                    : new Set(
                        professors.slice(0, 500).map((p) => p.professorId),
                      ),
                )
              }
            >
              {selected.size
                ? "Clear selection"
                : professors.length > 500
                  ? "Select first 500"
                  : "Select all"}
            </Button>
          )}
        </div>
        {professors === null ? (
          <p className="text-sm text-text-muted">
            {error
              ? "Pending summaries could not be loaded."
              : "Loading pending summaries…"}
          </p>
        ) : professors.length === 0 ? (
          <p className="text-sm text-text-muted">
            No summaries are awaiting a rebuild from merge changes.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {professors.map((professor) => (
              <li
                key={professor.professorId}
                className="py-3 first:pt-0 last:pb-0"
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox
                    className="mt-1"
                    checked={selected.has(professor.professorId)}
                    disabled={
                      submitting ||
                      loading ||
                      (!selected.has(professor.professorId) &&
                        selected.size >= 500)
                    }
                    onCheckedChange={(checked) =>
                      setSelected((previous) => {
                        const next = new Set(previous);
                        if (checked === true) next.add(professor.professorId);
                        else next.delete(professor.professorId);
                        return next;
                      })
                    }
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-text-heading break-words">
                      {professor.name || professor.professorId}
                    </span>
                    <span className="mt-1 block text-xs text-text-muted break-words">
                      {professor.reason} · {timestamp(professor.changedAt)}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>
      {!!selected.size && (
        <section
          className={`${panelClass} space-y-3`}
          aria-labelledby="rebuild-heading"
        >
          <h2 id="rebuild-heading" className="text-lg font-medium text-text-heading">
            Rebuild {selected.size} selected{" "}
            {selected.size === 1 ? "professor" : "professors"}
          </h2>
          <p className="text-sm text-text-body">
            Summaries will be regenerated from stored reviews using the AI
            service. The job continues after you close this page. Existing
            summaries remain visible until their replacements are saved.
          </p>
          <p className="text-sm text-text-muted">
            {professors
              ?.filter((p) => selected.has(p.professorId))
              .map((p) => p.name || p.professorId)
              .join(", ")}
          </p>
          <Button
            disabled={submitting || loading || !!error}
            onClick={() => void submit()}
          >
            {submitting ? "Queueing rebuild…" : "Queue summary rebuild"}
          </Button>
        </section>
      )}
    </div>
  );
}
