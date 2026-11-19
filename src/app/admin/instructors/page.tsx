"use client";

import { Suspense, useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AiBulkRejection } from "./ai-bulk-rejection";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/components/admin/admin-shell";
import { timestamp } from "@/components/admin/admin-ui";
import {
  CompareLegend,
  CourseChip,
  EvidenceText,
  MarkedName,
  RatingCount,
  namesSwapped,
  subjectOf,
} from "@/components/admin/compare-ui";
import {
  AdminKeyError,
  AdminRequestError,
  type InstructorLinkResult,
  type InstructorLinks,
  type InstructorLinksPage,
  type InstructorTab,
  type LinkCandidate,
  getInstructorLinks,
  linkInstructor,
  markNoProfile,
  parseRmpProfile,
  professorIdFromRmpId,
  rejectAllCandidates,
  rejectCandidates,
  undoInstructorLink,
} from "@/lib/admin-api";

const PAGE_SIZE = 200;

const TABS: { tab: InstructorTab; label: string }[] = [
  { tab: "proposed", label: "To review" },
  { tab: "confirmed", label: "Linked" },
  { tab: "rejected", label: "Rejected" },
  { tab: "conflict", label: "Conflicts" },
];
const TAB_LABEL = Object.fromEntries(TABS.map((t) => [t.tab, t.label])) as
  Record<InstructorTab, string>;

const MISSING_TABLE =
  "The instructor links table does not exist yet. Run migration 005 on the database, then reload this page.";

/** Columns of one candidate on wide screens: profile, evidence, actions. */
const candidateColumns =
  "lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_7.5rem]";

type Action =
  | { type: "link"; professorIds: string[] }
  | { type: "reject"; professorId: string }
  | { type: "reject-all" }
  | { type: "no-profile" }
  | { type: "undo" };

interface Notice {
  instructor: InstructorLinks;
  from: InstructorTab;
  invalidatedCourses: string[];
}

export default function AdminInstructorLinksPage() {
  const { adminKey, signOut } = useAdmin();
  return (
    <Suspense fallback={<p className="text-sm text-text-muted">Loading.</p>}>
      <InstructorLinkReview adminKey={adminKey} onSignOut={signOut} />
    </Suspense>
  );
}

function InstructorLinkReview({
  adminKey,
  onSignOut,
}: {
  adminKey: string;
  onSignOut: () => void;
}) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim().slice(0, 200) ?? "";
  const [tab, setTab] = useState<InstructorTab>(
    () => TABS.find((item) => item.tab === searchParams.get("tab"))?.tab ?? "proposed",
  );
  const [filter, setFilter] = useState(initialQuery);
  const [q, setQ] = useState(initialQuery);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState<InstructorLinksPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [missingTable, setMissingTable] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const filterId = useId();

  // The name filter waits for typing to pause.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQ(filter.trim());
      setOffset(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filter]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    getInstructorLinks(
      adminKey,
      { tab, q, limit: PAGE_SIZE, offset },
      controller.signal,
    )
      .then((data) => {
        if (offset > 0 && offset >= data.total) {
          setOffset(Math.floor(Math.max(0, data.total - 1) / PAGE_SIZE) * PAGE_SIZE);
          return;
        }
        setPage(data);
        setMissingTable(null);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        if (e instanceof AdminKeyError) onSignOut();
        else if (e instanceof AdminRequestError && e.status === 409) {
          setMissingTable(e.message);
          setPage(null);
        } else
          setLoadError(
            e instanceof Error ? e.message : "Couldn't load instructors.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [adminKey, onSignOut, tab, q, offset, reloadToken]);

  // The cleared-pages note goes away on its own.
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 12000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  /** Puts the changed instructor where its new tab says and fixes the counts. */
  const apply = useCallback(
    (res: InstructorLinkResult, from: InstructorTab) => {
      const next = res.instructor;
      setPage((p) => {
        if (!p) return p;
        const counts = { ...p.counts };
        if (from !== next.tab) {
          counts[from] = Math.max(0, counts[from] - 1);
          counts[next.tab] += 1;
        }
        let { instructors, total } = p;
        const index = instructors.findIndex((i) => i.key === next.key);
        if (next.tab === tab && index >= 0) {
          instructors = instructors.map((i, k) => (k === index ? next : i));
        } else if (next.tab !== tab && index >= 0) {
          instructors = instructors.filter((_, k) => k !== index);
          total = Math.max(0, total - 1);
        }
        return { instructors, counts, total };
      });
      // A decision can change a card's AI priority even if it stays in this tab.
      if (from !== next.tab || next.tab === "proposed" || next.tab === "conflict") {
        setReloadToken((token) => token + 1);
      }
      if (from !== next.tab || res.invalidatedCourses.length)
        setNotice({
          instructor: next,
          from,
          invalidatedCourses: res.invalidatedCourses,
        });
    },
    [tab],
  );

  const act = useCallback(
    async (instructor: InstructorLinks, action: Action) => {
      const key = instructor.key;
      setPending((s) => new Set(s).add(key));
      setCardErrors(({ [key]: _, ...rest }) => rest);
      try {
        let request: Promise<InstructorLinkResult>;
        switch (action.type) {
          case "link":
            request = linkInstructor(adminKey, key, action.professorIds);
            break;
          case "reject":
            request = rejectCandidates(adminKey, key, [action.professorId]);
            break;
          case "reject-all":
            request = rejectAllCandidates(adminKey, key);
            break;
          case "no-profile":
            request = markNoProfile(adminKey, key);
            break;
          case "undo":
            request = undoInstructorLink(adminKey, key);
            break;
        }
        const res = await request;
        apply(res, instructor.tab);
        return true;
      } catch (e) {
        if (e instanceof AdminKeyError) onSignOut();
        else if (e instanceof AdminRequestError && e.status === 409)
          setMissingTable(e.message);
        else
          setCardErrors((errors) => ({
            ...errors,
            [key]: e instanceof Error ? e.message : "The change failed.",
          }));
        return false;
      } finally {
        setPending((s) => {
          const next = new Set(s);
          next.delete(key);
          return next;
        });
      }
    },
    [adminKey, apply, onSignOut],
  );

  const changeTab = (next: string) => {
    setTab(next as InstructorTab);
    setOffset(0);
    setCardErrors({});
  };

  const counts = page?.counts;
  const conflicts = counts?.conflict ?? 0;
  const instructors = page?.instructors ?? [];
  const shownTo = offset + instructors.length;

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <h1 className="text-xl font-medium text-text-heading">
            Instructor ↔ RateMyProfessors links
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-text-muted">
            Registrar instructors matched to RMP profiles on an assumption (a
            middle initial used as the first name, swapped names, a near-miss
            spelling). Check the subjects and courses before linking: couples
            often teach the same subject. Linking selected profiles rejects the
            other pending candidates and refreshes the instructor&apos;s course pages.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CompareLegend />
          <AiBulkRejection
            adminKey={adminKey}
            onSignOut={onSignOut}
            onApplied={() => {
              setOffset(0);
              setReloadToken((token) => token + 1);
            }}
          />
        </div>
      </header>

      {missingTable && (
        <div
          role="alert"
          className="space-y-1 rounded-xl border border-red-500/40 bg-card p-4 text-sm"
        >
          <p className="font-medium text-red-700 dark:text-red-300">
            {MISSING_TABLE}
          </p>
          <p className="text-xs text-text-muted">Server said: {missingTable}</p>
        </div>
      )}
      {loadError && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-card p-4 text-sm text-red-700 dark:text-red-300"
        >
          {loadError}{" "}
          <button
            type="button"
            onClick={() => setReloadToken((t) => t + 1)}
            className="font-medium underline underline-offset-4"
          >
            Try again
          </button>
        </p>
      )}

      {conflicts > 0 && tab !== "conflict" && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/50 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {conflicts === 1
              ? "1 instructor needs another look"
              : `${conflicts.toLocaleString()} instructors need another look`}
            : a link whose profile is gone, one profile linked twice, or new
            matches after a decision.
          </p>
          <Button size="sm" variant="outline" onClick={() => changeTab("conflict")}>
            Open Conflicts
          </Button>
        </div>
      )}

      {notice && (
        <NoticePanel
          notice={notice}
          busy={pending.has(notice.instructor.key)}
          onUndo={async () => {
            const done = await act(notice.instructor, { type: "undo" });
            if (!done) setNotice(null);
          }}
          onDismiss={() => setNotice(null)}
        />
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Tabs value={tab} onValueChange={changeTab}>
          <TabsList className="h-auto w-full flex-wrap justify-start sm:w-fit">
            {TABS.map(({ tab: value, label }) => (
              <TabsTrigger key={value} value={value} className="gap-1.5">
                {label}
                {value === "conflict" && conflicts > 0 ? (
                  <span className="rounded-full bg-amber-500 px-1.5 text-xs font-semibold text-white dark:bg-amber-400 dark:text-black">
                    {conflicts.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-text-muted">
                    ({counts ? counts[value].toLocaleString() : "…"})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="w-full space-y-1 sm:w-72">
          <label
            htmlFor={filterId}
            className="block text-xs font-medium text-text-body"
          >
            Filter by name
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-text-muted"
            />
            <Input
              id={filterId}
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Registrar name"
              className="pl-8"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {missingTable ? null : page === null ? (
        <p className="text-sm text-text-muted">
          {loading ? "Loading…" : "Nothing loaded."}
        </p>
      ) : instructors.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-text-muted">
          {q
            ? `No instructors in ${TAB_LABEL[tab]} match “${q}”.`
            : tab === "proposed"
              ? "Nothing to review. The monthly matching job adds instructors here."
              : tab === "conflict"
                ? "No conflicts."
                : "None yet."}
        </p>
      ) : (
        <>
          <ul
            className="space-y-4"
            aria-busy={loading}
            aria-label={`${TAB_LABEL[tab]} instructors`}
          >
            {instructors.map((instructor) => (
              <InstructorCard
                key={instructor.key}
                instructor={instructor}
                busy={pending.has(instructor.key)}
                error={cardErrors[instructor.key] ?? null}
                onAct={(action) => act(instructor, action)}
                onError={(message) =>
                  setCardErrors((errors) => ({
                    ...errors,
                    [instructor.key]: message,
                  }))
                }
              />
            ))}
          </ul>
          <nav
            aria-label="Pages"
            className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-body"
          >
            <p>
              Showing {(offset + 1).toLocaleString()}–
              {shownTo.toLocaleString()} of{" "}
              {page.total.toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={loading || offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={loading || shownTo >= page.total}
                onClick={() => setOffset(shownTo)}
              >
                Next
              </Button>
            </div>
          </nav>
        </>
      )}
    </>
  );
}

function NoticePanel({
  notice,
  busy,
  onUndo,
  onDismiss,
}: {
  notice: Notice;
  busy: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  const { instructor, from, invalidatedCourses } = notice;
  const moved = from !== instructor.tab;
  const linked = instructor.candidates.filter((c) => c.status === "confirmed");
  const decision = instructor.noProfile
    ? "marked as having no RMP profile"
    : linked.length > 1
      ? `linked to ${linked.length} RMP profiles`
      : linked.length === 1
        ? `linked to ${linked[0].name || "the profile"}`
        : null;
  const canUndo =
    instructor.tab === "confirmed" || (moved && instructor.tab === "rejected");
  return (
    <section
      role="status"
      className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm"
    >
      <div className="min-w-0 space-y-1">
        <p className="text-text-heading">
          <span className="font-medium">{instructor.name}</span>
          {decision ? ` ${decision}` : " updated"}
          {moved ? ` · moved to ${TAB_LABEL[instructor.tab]}` : ""}.
        </p>
        {invalidatedCourses.length > 0 && (
          <p className="text-xs text-text-muted">
            Cleared {invalidatedCourses.length} course{" "}
            {invalidatedCourses.length === 1 ? "page" : "pages"}:{" "}
            {invalidatedCourses.join(", ")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {canUndo && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={onUndo}
            className="gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {instructor.tab === "rejected" ? "Reopen candidates" : "Undo"}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}

const STATUS_ORDER = { confirmed: 0, proposed: 1, rejected: 2 } as const;
const AI_REVIEW_ORDER = { high: 0, possible: 1, unclear: 2, unlikely: 2, "very unlikely": 2 } as const;
const AI_REVIEW_LABEL = {
  high: "AI recommended",
  possible: "AI possible match",
  unclear: "AI unsure",
  unlikely: "AI unlikely match",
  "very unlikely": "AI very unlikely match",
} as const;

function candidateAiPriority(candidate: LinkCandidate) {
  return candidate.aiReview ? AI_REVIEW_ORDER[candidate.aiReview.confidence] : 2;
}

function InstructorCard({
  instructor,
  busy,
  error,
  onAct,
  onError,
}: {
  instructor: InstructorLinks;
  busy: boolean;
  error: string | null;
  onAct: (action: Action) => Promise<boolean>;
  onError: (message: string) => void;
}) {
  const headingId = useId();
  const [selected, setSelected] = useState<string[]>([]);
  const subjects = useMemo(
    () => new Set(instructor.courses.map(subjectOf)),
    [instructor.courses],
  );
  const candidates = useMemo(
    () =>
      [...instructor.candidates].sort(
        (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          candidateAiPriority(a) - candidateAiPriority(b),
      ),
    [instructor.candidates],
  );
  // Subjects any candidate's reviews are in, to mark the registrar courses.
  const reviewedSubjects = useMemo(() => {
    const s = new Set<string>();
    for (const c of instructor.candidates)
      for (const subject of c.reviewedCourses?.map(subjectOf) ??
        reviewSubjects(c.reason) ??
        [])
        s.add(subject);
    return s;
  }, [instructor.candidates]);
  const linked = candidates.filter(
    (candidate) => candidate.status === "confirmed",
  );
  const hasPending = candidates.some(
    (candidate) => candidate.status === "proposed",
  );
  const hasDecision = instructor.noProfile || linked.length > 0;
  const canUndo =
    instructor.tab === "rejected" ||
    (hasDecision &&
      (instructor.tab === "confirmed" || instructor.tab === "conflict"));

  async function linkSelected(professorIds: string[]) {
    const done = await onAct({ type: "link", professorIds });
    if (done) setSelected([]);
    return done;
  }

  return (
    <li
      aria-labelledby={headingId}
      className="grid overflow-hidden rounded-xl border border-border bg-card xl:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)]"
    >
      {/* Registrar side */}
      <div className="min-w-0 space-y-3 border-b border-border p-4 xl:border-r xl:border-b-0">
        <div>
          <p className="text-xs text-text-muted">Registrar instructor</p>
          <h2
            id={headingId}
            className="text-lg font-medium break-words text-text-heading"
          >
            {instructor.name}
          </h2>
          <p className="text-xs text-text-muted">
            {[
              instructor.campus,
              instructor.sections != null &&
                `${instructor.sections.toLocaleString()} ${instructor.sections === 1 ? "section" : "sections"}`,
              instructor.pidm != null && `PIDM ${instructor.pidm}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {instructor.conflict && (
          <p className="flex gap-2 rounded-lg border border-amber-500/50 bg-amber-50 p-2.5 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            <AlertTriangle
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            <span>
              <span className="font-medium">Conflict: </span>
              {instructor.conflict}
            </span>
          </p>
        )}

        {hasDecision && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-800 dark:text-emerald-300">
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            {instructor.noProfile
              ? "Decided: no RMP profile"
              : linked.length === 1
                ? `Linked to ${linked[0].name || linked[0].professorId}`
                : `Linked to ${linked.length} RMP profiles`}
          </p>
        )}

        <div>
          <p className="mb-1 text-xs font-medium text-text-heading">
            Taught ({instructor.courses.length})
          </p>
          {instructor.courses.length ? (
            <div className="flex flex-wrap gap-1">
              {instructor.courses.map((code) => (
                <CourseChip
                  key={code}
                  code={code}
                  shared={reviewedSubjects.has(subjectOf(code))}
                  href={`/course/${code.replace(/\s+/g, "")}`}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">No courses listed.</p>
          )}
        </div>

        <a
          href={instructor.rmpSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-heading underline-offset-4 hover:underline"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          Search RMP
          <ExternalLink className="h-3 w-3 text-text-muted" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>

        <ManualLink
          instructor={instructor}
          busy={busy}
          onLink={(professorId) => linkSelected([...selected, professorId])}
          onError={onError}
        />

        {(canUndo || !instructor.noProfile) && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            {!instructor.noProfile && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  if (await onAct({ type: "no-profile" })) setSelected([]);
                }}
                aria-label={`Mark ${instructor.name} as having no RMP profile`}
              >
                No RMP profile
              </Button>
            )}
            {canUndo && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  if (await onAct({ type: "undo" })) setSelected([]);
                }}
                className="gap-1"
                aria-label={
                  instructor.tab === "rejected"
                    ? `Reopen candidates for ${instructor.name}`
                    : `Undo the decision for ${instructor.name}`
                }
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {instructor.tab === "rejected" ? "Reopen candidates" : "Undo decision"}
              </Button>
            )}
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 p-2.5 text-xs text-red-700 dark:text-red-300"
          >
            {error}
          </p>
        )}
        {busy && (
          <p className="text-xs text-text-muted" aria-live="polite">
            Saving…
          </p>
        )}
        <p className="text-xs text-text-muted">
          Updated {timestamp(instructor.updatedAt)}
        </p>
      </div>

      {/* RMP side */}
      <div className="min-w-0">
        {linked.length < candidates.length && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border px-4 py-2">
            {hasPending && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  if (await onAct({ type: "reject-all" })) setSelected([]);
                }}
                aria-label={`Reject all pending candidates for ${instructor.name}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Reject all
              </Button>
            )}
            <Button
              size="sm"
              disabled={busy || selected.length === 0}
              onClick={() => void linkSelected(selected)}
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Link selected{selected.length > 0 && ` (${selected.length})`}
            </Button>
          </div>
        )}
        <div
          aria-hidden="true"
          className={`hidden gap-4 border-b border-border bg-raised px-4 py-2 text-xs font-medium text-text-muted lg:grid ${candidateColumns}`}
        >
          <span>RMP profile ({candidates.length})</span>
          <span>Evidence</span>
          <span className="text-right">Action</span>
        </div>
        {candidates.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">
            No candidates. Search RMP and paste a profile to link one by hand.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {candidates.map((candidate) => (
              <CandidateRow
                key={candidate.professorId}
                instructor={instructor}
                candidate={candidate}
                subjects={subjects}
                busy={busy}
                selected={selected.includes(candidate.professorId)}
                onSelect={(checked) => {
                  setSelected((ids) =>
                    checked
                      ? [...ids, candidate.professorId]
                      : ids.filter((id) => id !== candidate.professorId),
                  );
                }}
                onReject={async () => {
                  const done = await onAct({
                    type: "reject",
                    professorId: candidate.professorId,
                  });
                  if (done) {
                    setSelected((ids) => ids.filter((id) => id !== candidate.professorId));
                  }
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

/** "its reviews are for CSCE, MATH; ..." → ["CSCE", "MATH"]; null when absent. */
function reviewSubjects(reason: string | null): string[] | null {
  const match = reason && /its reviews are for ([^;|]+)/.exec(reason);
  if (!match) return null;
  return match[1]
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter((s) => s && s !== "none")
    .map(subjectOf);
}

const KIND_BADGES: Record<string, { label: string; className: string }> = {
  plausible: {
    label: "Plausible",
    className: "border-emerald-600/40 text-emerald-800 dark:text-emerald-300",
  },
  near: {
    label: "Near miss",
    className: "border-amber-600/40 text-amber-800 dark:text-amber-300",
  },
  rejected: {
    label: "Matcher rejected",
    className: "border-red-600/40 text-red-700 dark:text-red-300",
  },
  middle_initial: {
    label: "Middle initial",
    className: "border-amber-600/40 text-amber-800 dark:text-amber-300",
  },
  swapped: {
    label: "Swapped name",
    className: "border-amber-600/40 text-amber-800 dark:text-amber-300",
  },
  manual: {
    label: "Manual",
    className: "border-sky-600/40 text-sky-800 dark:text-sky-300",
  },
};

/** Badges for the assumption behind the match, read from the names and reason. */
function assumptionBadges(registrar: string, candidate: LinkCandidate) {
  const badges: string[] = [];
  const reason = candidate.reason ?? "";
  const words = registrar.split(/\s+/).filter(Boolean);
  const plain = words.filter((w) => w.replace(/[^A-Za-z]/g, "").length > 1);
  const candidateFirst = (candidate.name.split(/\s+/)[0] ?? "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const initials = words
    .slice(1, -1)
    .map((w) => w.toLowerCase().replace(/[^a-z]/g, ""))
    .filter((w) => w.length === 1);
  const registrarFirst = (words[0] ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (
    /middle (initial|name)/i.test(reason) ||
    (candidateFirst &&
      registrarFirst !== candidateFirst &&
      initials.some((i) => candidateFirst.startsWith(i)))
  )
    badges.push("Middle initial");
  if (/swap/i.test(reason) || namesSwapped(plain.join(" "), candidate.name))
    badges.push("Swapped");
  return badges;
}

function CandidateRow({
  instructor,
  candidate,
  subjects,
  busy,
  selected,
  onSelect,
  onReject,
}: {
  instructor: InstructorLinks;
  candidate: LinkCandidate;
  subjects: Set<string>;
  busy: boolean;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onReject: () => void;
}) {
  const selectId = useId();
  const kind = KIND_BADGES[candidate.kind] ?? {
    label: candidate.kind,
    className: "",
  };
  // The kind badge already names a middle-initial or swapped candidate.
  const assumptions = assumptionBadges(instructor.name, candidate).filter(
    (label) =>
      !(
        (label === "Middle initial" && candidate.kind === "middle_initial") ||
        (label === "Swapped" && candidate.kind === "swapped")
      ),
  );
  // Structured course evidence from the backend; older rows fall back to
  // the subjects named in the reason text.
  const byCourse = candidate.reviewedCourses != null;
  const reviewed = candidate.reviewedCourses ?? reviewSubjects(candidate.reason);
  const overlap = byCourse
    ? (candidate.courseOverlap ?? [])
    : (reviewed?.filter((s) => subjects.has(s)) ?? []);
  const isLinked = candidate.status === "confirmed";
  const isRejected = candidate.status === "rejected";
  const aiReview = candidate.status === "proposed" ? candidate.aiReview : undefined;
  const isAiRecommended = aiReview?.confidence === "high";
  const reasons = (candidate.reason ?? "")
    .split(/\s*[;|]\s*/)
    .filter((part) => part && !/^its reviews are for /.test(part));

  return (
    <li
      className={`grid gap-x-4 gap-y-3 p-4 ${candidateColumns} ${
        isLinked
          ? "border-l-4 border-l-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/5"
          : isAiRecommended
            ? "border-l-4 border-l-violet-600 bg-violet-50/70 dark:bg-violet-500/10"
            : ""
      }`}
    >
      {/* Who */}
      <div className={`min-w-0 space-y-1.5 ${isRejected ? "opacity-75" : ""}`}>
        <div className="flex flex-wrap items-center gap-1.5">
          {aiReview && (
            <Badge
              variant={isAiRecommended ? "default" : "outline"}
              className={isAiRecommended ? "bg-violet-700 text-white" : "text-text-muted"}
            >
              {AI_REVIEW_LABEL[aiReview.confidence]}
            </Badge>
          )}
          {isLinked && (
            <Badge className="bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black">
              Linked
            </Badge>
          )}
          {isRejected && (
            <Badge variant="outline" className="text-text-muted">
              Rejected
            </Badge>
          )}
          <Badge variant="outline" className={kind.className}>
            {kind.label}
          </Badge>
          {assumptions.map((label) => (
            <Badge
              key={label}
              variant="outline"
              className="border-violet-600/40 text-violet-800 dark:text-violet-300"
            >
              {label}
            </Badge>
          ))}
        </div>
        <p className="text-base font-medium break-words text-text-heading">
          {candidate.rmpLegacyId ? (
            <a
              href={`https://www.ratemyprofessors.com/professor/${candidate.rmpLegacyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-1 underline-offset-4 hover:underline"
            >
              <MarkedName name={candidate.name} other={instructor.name} />
              <ExternalLink
                className="h-3 w-3 shrink-0 self-center text-text-muted"
                aria-hidden="true"
              />
              <span className="sr-only">on RateMyProfessors (opens in a new tab)</span>
            </a>
          ) : (
            <MarkedName name={candidate.name} other={instructor.name} />
          )}
        </p>
        <p className="text-sm text-text-body">
          {candidate.department || (
            <span className="text-text-muted">No department</span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <RatingCount
            count={candidate.numRatings}
            average={candidate.avgRating}
          />
          {candidate.rmpLegacyId && (
            <span className="font-mono text-text-muted">
              #{candidate.rmpLegacyId}
            </span>
          )}
          {candidate.inDatabase ? (
            <Link
              href={`/professor/${encodeURIComponent(candidate.professorId)}`}
              className="font-medium text-text-heading underline-offset-4 hover:underline"
            >
              Our page
            </Link>
          ) : (
            <span className="text-text-muted" title="The nightly import adds it">
              Not imported yet
            </span>
          )}
        </div>
      </div>

      {/* Evidence */}
      <div className="min-w-0 space-y-2 rounded-lg bg-raised/50 p-3 text-xs text-text-body">
        {aiReview && (
          <div className="space-y-1 border-b border-border pb-2">
            <p>{aiReview.reason}</p>
            {aiReview.sources.length > 0 && (
              <details>
                <summary className="cursor-pointer font-medium text-text-heading">AI sources</summary>
                <ul className="mt-1 space-y-1">
                  {aiReview.sources.map((source, index) => (
                    <li key={`${source.url}:${index}`}>
                      <a href={source.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                        {source.title}
                      </a>
                      {source.snippet && <p className="text-text-muted">{source.snippet}</p>}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {candidate.score != null && (
            <span>
              Name score{" "}
              <span className="font-mono font-medium text-text-heading">
                {candidate.score.toFixed(2)}
              </span>
            </span>
          )}
          {reviewed && (
            <span
              className={`font-medium ${
                overlap.length
                  ? "text-emerald-800 dark:text-emerald-300"
                  : "text-amber-800 dark:text-amber-300"
              }`}
            >
              {byCourse
                ? overlap.length
                  ? `Reviewed for courses they teach: ${overlap.join(", ")}`
                  : "No course in common"
                : overlap.length
                  ? `Shared subject: ${overlap.join(", ")}`
                  : "No shared subject"}
            </span>
          )}
        </div>
        {reviewed && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-text-muted">Reviews for</span>
            {reviewed.length ? (
              reviewed.map((s) => (
                <CourseChip
                  key={s}
                  code={s}
                  shared={byCourse ? overlap.includes(s) : subjects.has(s)}
                />
              ))
            ) : (
              <span className="text-text-muted">no course listed</span>
            )}
          </div>
        )}
        {reasons.length > 0 ? (
          <ul className="space-y-1">
            {reasons.map((part, i) => (
              <li key={i} className="leading-relaxed break-words">
                <EvidenceText
                  text={part}
                  sharedSubjects={reviewed ? new Set(overlap) : subjects}
                />
              </li>
            ))}
          </ul>
        ) : (
          !reviewed && <p className="text-text-muted">No note.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 lg:flex-col lg:flex-nowrap lg:items-stretch">
        {!isLinked && (
          <label
            htmlFor={selectId}
            className="flex items-center gap-2 text-sm text-text-body"
          >
            <Checkbox
              id={selectId}
              checked={selected}
              disabled={busy}
              onCheckedChange={(checked) => onSelect(checked === true)}
              aria-label={`Select ${candidate.name || candidate.professorId} for ${instructor.name}`}
            />
            Select
          </label>
        )}
        {candidate.status === "proposed" && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={onReject}
            className="gap-1"
            aria-label={`Reject ${candidate.name} for ${instructor.name}`}
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </Button>
        )}
      </div>
    </li>
  );
}

function ManualLink({
  instructor,
  busy,
  onLink,
  onError,
}: {
  instructor: InstructorLinks;
  busy: boolean;
  onLink: (professorId: string) => Promise<boolean>;
  onError: (message: string) => void;
}) {
  const [value, setValue] = useState("");
  const inputId = useId();
  return (
    <form
      className="space-y-1"
      onSubmit={async (event) => {
        event.preventDefault();
        const rmpId = parseRmpProfile(value);
        if (rmpId === null) {
          onError(
            "Paste a RateMyProfessors profile URL (ratemyprofessors.com/professor/1234567) or its number.",
          );
          return;
        }
        if (await onLink(professorIdFromRmpId(rmpId))) setValue("");
      }}
    >
      <label
        htmlFor={inputId}
        className="block text-xs font-medium text-text-heading"
      >
        Link a profile by hand
      </label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="RMP profile URL or number"
          autoComplete="off"
          inputMode="url"
          className="h-8"
          aria-describedby={`${inputId}-hint`}
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={busy || !value.trim()}
          aria-label={`Link ${instructor.name} to the pasted profile`}
        >
          Link
        </Button>
      </div>
      <p id={`${inputId}-hint`} className="sr-only">
        For example https://www.ratemyprofessors.com/professor/2348685
      </p>
    </form>
  );
}
