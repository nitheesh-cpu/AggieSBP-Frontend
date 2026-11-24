"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ExternalLink,
  RotateCcw,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "@/components/app-link";
import { useAdmin } from "@/components/admin/admin-shell";
import {
  CompareLegend,
  ConfirmStepButton,
  CourseChip,
  EvidenceText,
  MarkedName,
  RatingCount,
  subjectOf,
} from "@/components/admin/compare-ui";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AdminKeyError,
  type MergeChangeResult,
  type MergeProfessor,
  type MergeStatus,
  type ProfessorMerge,
  getProfessorMerges,
  setProfessorMergeStatus,
} from "@/lib/admin-api";

const TABS: { status: MergeStatus; label: string }[] = [
  { status: "proposed", label: "To review" },
  { status: "confirmed", label: "Merged" },
  { status: "rejected", label: "Rejected" },
];

/** Columns of one merge on wide screens: select, alias, arrow, canonical, evidence, actions. */
const rowColumns =
  "xl:grid-cols-[1.25rem_minmax(0,1fr)_1.25rem_minmax(0,1fr)_minmax(0,1.4fr)_8.5rem]";

export default function AdminMergesPage() {
  const { adminKey, signOut } = useAdmin();
  return <MergeReview adminKey={adminKey} onSignOut={signOut} />;
}

function MergeReview({
  adminKey,
  onSignOut,
}: {
  adminKey: string;
  onSignOut: () => void;
}) {
  const [merges, setMerges] = useState<ProfessorMerge[] | null>(null);
  const [tab, setTab] = useState<MergeStatus>("proposed");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MergeChangeResult | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setMerges(await getProfessorMerges(adminKey));
    } catch (e) {
      if (e instanceof AdminKeyError) onSignOut();
      else setError(e instanceof Error ? e.message : "Couldn't load merges.");
    }
  }, [adminKey, onSignOut]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<MergeStatus, number> = {
      proposed: 0,
      confirmed: 0,
      rejected: 0,
    };
    for (const m of merges ?? []) c[m.status] += 1;
    return c;
  }, [merges]);

  const visible = useMemo(
    () => (merges ?? []).filter((m) => m.status === tab),
    [merges, tab],
  );

  const changeTab = (next: string) => {
    setTab(next as MergeStatus);
    setSelected(new Set());
  };

  const toggle = (aliasId: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(aliasId);
      else next.delete(aliasId);
      return next;
    });
  };

  const allSelected =
    visible.length > 0 && visible.every((m) => selected.has(m.aliasId));

  const act = async (aliasIds: string[], action: "confirm" | "reject") => {
    if (!aliasIds.length) return;
    setBusy(true);
    setError(null);
    try {
      const res = await setProfessorMergeStatus(adminKey, aliasIds, action);
      setResult(res);
      setSelected(new Set());
      await load();
    } catch (e) {
      if (e instanceof AdminKeyError) onSignOut();
      else setError(e instanceof Error ? e.message : "The change failed.");
    } finally {
      setBusy(false);
    }
  };

  const n = selected.size;

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <h1 className="text-xl font-medium text-text-heading">
            Duplicate professors
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-text-muted">
            RateMyProfessors entries that look like one person. Merging shows
            the left entry under the right one; nothing is deleted, and any
            merge can be undone.
          </p>
        </div>
        <CompareLegend />
      </header>

      {result && (
        <ResultPanel result={result} onDismiss={() => setResult(null)} />
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-card p-4 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <Tabs value={tab} onValueChange={changeTab}>
        <TabsList className="h-auto w-full flex-wrap justify-start sm:w-fit">
          {TABS.map(({ status, label }) => (
            <TabsTrigger key={status} value={status}>
              {label} ({counts[status]})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {merges === null ? (
        <p className="text-sm text-text-muted">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-text-muted">
          {tab === "proposed"
            ? "Nothing to review. New candidates appear after the next merge_duplicates --propose run."
            : "None yet."}
        </p>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border px-4 py-3">
            <label className="flex items-center gap-2 text-sm text-text-body">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(on) =>
                  setSelected(
                    on ? new Set(visible.map((m) => m.aliasId)) : new Set(),
                  )
                }
              />
              Select all ({visible.length})
            </label>
            {/* Bulk actions ask twice; the opposite actions sit apart. */}
            <div className="flex flex-1 basis-full flex-wrap items-center justify-between gap-x-10 gap-y-3 sm:basis-auto">
              {tab === "proposed" ? (
                <>
                  <ConfirmStepButton
                    variant="outline"
                    icon={<X className="h-3.5 w-3.5" />}
                    label={`Reject selected (${n})`}
                    confirmLabel={`Reject ${n}?`}
                    disabled={busy || n === 0}
                    onConfirm={() => act([...selected], "reject")}
                  />
                  <ConfirmStepButton
                    icon={<Check className="h-3.5 w-3.5" />}
                    label={`Merge selected (${n})`}
                    confirmLabel={`Merge ${n}?`}
                    disabled={busy || n === 0}
                    onConfirm={() => act([...selected], "confirm")}
                  />
                </>
              ) : tab === "confirmed" ? (
                <span className="ml-auto">
                  <ConfirmStepButton
                    variant="outline"
                    icon={<RotateCcw className="h-3.5 w-3.5" />}
                    label={`Undo selected merges (${n})`}
                    confirmLabel={`Undo ${n} merges?`}
                    disabled={busy || n === 0}
                    onConfirm={() => act([...selected], "reject")}
                  />
                </span>
              ) : (
                <span className="ml-auto">
                  <ConfirmStepButton
                    icon={<Check className="h-3.5 w-3.5" />}
                    label={`Merge selected (${n})`}
                    confirmLabel={`Merge ${n}?`}
                    disabled={busy || n === 0}
                    onConfirm={() => act([...selected], "confirm")}
                  />
                </span>
              )}
            </div>
          </div>

          <div
            aria-hidden="true"
            className={`hidden gap-4 border-b border-border bg-raised px-4 py-2 text-xs font-medium text-text-muted xl:grid ${rowColumns}`}
          >
            <span />
            <span>Duplicate entry (hidden after merging)</span>
            <span />
            <span>Shown as</span>
            <span>Evidence</span>
            <span className="text-right">Action</span>
          </div>

          <ul className="divide-y divide-border">
            {visible.map((merge) => (
              <MergeRow
                key={merge.aliasId}
                merge={merge}
                checked={selected.has(merge.aliasId)}
                onCheck={(on) => toggle(merge.aliasId, on)}
                busy={busy}
                onAct={(action) => act([merge.aliasId], action)}
              />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

/** Splits "CHECK: ...; nickname name (A / B); both reviewed for X, Y; ..." */
function parseEvidence(evidence: string) {
  const check = /^CHECK: ([^;]*); /.exec(evidence);
  const rest = check ? evidence.slice(check[0].length) : evidence;
  const parts = rest.split("; ");
  const kind = /^(\w+) name \(/.exec(parts[0] ?? "");
  const shared = parts.find((p) => p.startsWith("both reviewed for "));
  const sharedCourses = shared
    ? shared
        .slice("both reviewed for ".length)
        .split(/,\s*/)
        .filter(Boolean)
    : [];
  return {
    check: check?.[1] ?? null,
    kind: kind?.[1] ?? null,
    sharedCourses,
    notes: parts.filter((p, i) => p !== shared && !(i === 0 && kind)),
  };
}

const KIND_LABELS: Record<string, string> = {
  same: "Same name",
  vowel: "First names differ by a vowel",
};

function MergeRow({
  merge,
  checked,
  onCheck,
  busy,
  onAct,
}: {
  merge: ProfessorMerge;
  checked: boolean;
  onCheck: (on: boolean) => void;
  busy: boolean;
  onAct: (action: "confirm" | "reject") => void;
}) {
  const evidence = parseEvidence(merge.evidence);
  const sharedSubjects = new Set(evidence.sharedCourses.map(subjectOf));
  const aliasLabel = merge.alias.name || merge.aliasId;
  const canonicalLabel = merge.canonical.name || merge.canonicalId;

  return (
    <li
      className={`grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 gap-y-3 px-4 py-4 xl:items-start xl:gap-x-4 ${rowColumns}`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(on) => onCheck(on === true)}
        aria-label={`Select ${aliasLabel} → ${canonicalLabel}`}
        className="mt-1"
      />
      <ProfileSide
        heading="Duplicate entry"
        professor={merge.alias}
        id={merge.aliasId}
        other={merge.canonical}
      />
      <div className="col-start-2 flex items-center gap-2 text-xs text-text-muted xl:col-start-auto xl:mt-7 xl:block">
        <ArrowDown className="h-4 w-4 xl:hidden" aria-hidden="true" />
        <ArrowRight
          className="hidden h-5 w-5 xl:block"
          aria-label="shown as"
        />
        <span className="xl:sr-only">shown as</span>
      </div>
      <ProfileSide
        heading="Shown as"
        professor={merge.canonical}
        id={merge.canonicalId}
        other={merge.alias}
        className="col-start-2 xl:col-start-auto"
      />

      <div className="col-start-2 min-w-0 space-y-2 rounded-lg bg-raised/50 p-3 text-xs text-text-body xl:col-start-auto">
        <div className="flex flex-wrap items-center gap-1.5">
          {evidence.kind && (
            <Badge variant="outline">
              {KIND_LABELS[evidence.kind] ?? `${evidence.kind} name`}
            </Badge>
          )}
          {merge.needsCheck && (
            <Badge
              variant="outline"
              className="border-amber-500 text-amber-700 dark:text-amber-300"
              title={evidence.check ?? undefined}
            >
              Check spelling
            </Badge>
          )}
        </div>
        {evidence.check && (
          <p className="text-amber-800 dark:text-amber-300">
            {evidence.check}
          </p>
        )}
        {evidence.sharedCourses.length > 0 && (
          <div>
            <p className="mb-1 font-medium text-text-heading">
              Both reviewed for
            </p>
            <div className="flex flex-wrap gap-1">
              {evidence.sharedCourses.map((code) => (
                <CourseChip
                  key={code}
                  code={code}
                  shared
                  href={`/course/${code.replace(/\s+/g, "")}`}
                />
              ))}
            </div>
          </div>
        )}
        {evidence.notes.map((note, i) => (
          <p key={i} className="leading-relaxed break-words">
            <EvidenceText text={note} sharedSubjects={sharedSubjects} />
          </p>
        ))}
      </div>

      {/* Opposite actions sit at opposite ends, never side by side. */}
      <div className="col-start-2 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 xl:col-start-auto xl:h-full xl:flex-col xl:flex-nowrap xl:items-stretch xl:justify-between xl:border-t-0 xl:border-l xl:pt-0 xl:pl-4">
        {merge.status === "proposed" && (
          <>
            <Button
              size="sm"
              disabled={busy}
              onClick={() => onAct("confirm")}
              className="order-2 gap-1 xl:order-1"
              aria-label={`Merge ${aliasLabel} into ${canonicalLabel}`}
            >
              <Check className="h-3.5 w-3.5" />
              Merge
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onAct("reject")}
              className="order-1 gap-1 xl:order-2"
              aria-label={`Reject merging ${aliasLabel} into ${canonicalLabel}`}
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </Button>
          </>
        )}
        {merge.status === "rejected" && (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => onAct("confirm")}
            className="ml-auto gap-1 xl:ml-0"
            aria-label={`Merge ${aliasLabel} into ${canonicalLabel}`}
          >
            <Check className="h-3.5 w-3.5" />
            Merge
          </Button>
        )}
        {merge.status === "confirmed" && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onAct("reject")}
            className="ml-auto gap-1 xl:ml-0"
            aria-label={`Undo merging ${aliasLabel} into ${canonicalLabel}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Undo merge
          </Button>
        )}
      </div>
    </li>
  );
}

function ProfileSide({
  heading,
  professor,
  id,
  other,
  className = "",
}: {
  heading: string;
  professor: MergeProfessor;
  id: string;
  other: MergeProfessor;
  className?: string;
}) {
  const label = professor.name || id;
  const sameDepartment =
    !!professor.department &&
    professor.department.toLowerCase() === other.department?.toLowerCase();
  return (
    <div className={`min-w-0 space-y-1.5 ${className}`}>
      <p className="text-xs text-text-muted xl:sr-only">{heading}</p>
      <p className="text-base font-medium break-words text-text-heading">
        <MarkedName name={label} other={other.name || ""} />
      </p>
      <p className="text-sm text-text-body">
        {professor.department ? (
          sameDepartment ? (
            professor.department
          ) : (
            <mark
              title="Different department from the other entry"
              className="rounded bg-amber-200/70 px-0.5 text-inherit dark:bg-amber-500/25"
            >
              {professor.department}
              <span className="sr-only"> (different department)</span>
            </mark>
          )
        ) : (
          <span className="text-text-muted">No department</span>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        <RatingCount count={professor.ratings} />
        {professor.rmpId ? (
          // The RateMyProfessors page, to compare the two entries at the source.
          <a
            href={`https://www.ratemyprofessors.com/professor/${professor.rmpId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-text-heading underline-offset-4 hover:underline"
          >
            RMP #{professor.rmpId}
            <ExternalLink className="h-3 w-3 text-text-muted" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <span className="text-text-muted">No RMP number</span>
        )}
        <Link
          href={`/professor/${encodeURIComponent(id)}`}
          className="font-medium text-text-heading underline-offset-4 hover:underline"
        >
          Our page
        </Link>
      </div>
    </div>
  );
}

function ResultPanel({
  result,
  onDismiss,
}: {
  result: MergeChangeResult;
  onDismiss: () => void;
}) {
  const changed = result.changes.filter((c) => c.status !== "skipped");
  const skipped = result.changes.filter((c) => c.status === "skipped");

  return (
    <section
      role="status"
      className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-text-heading">
          {changed.length} updated
          {skipped.length ? `, ${skipped.length} skipped` : ""}.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {skipped.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-text-body">
          {skipped.map((c) => (
            <li key={c.aliasId}>
              {c.aliasId}: {c.problem}
            </li>
          ))}
        </ul>
      )}
      {result.affectedProfessorIds?.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-text-body">
            {result.affectedProfessorIds.length === 1
              ? "1 professor needs an updated summary."
              : `${result.affectedProfessorIds.length} professors need updated summaries.`}{" "}
            Review the affected professors and rebuild from stored reviews.
          </p>
          <Button asChild size="sm">
            <Link
              href={`/admin/summaries?professors=${encodeURIComponent(JSON.stringify(result.affectedProfessorIds))}`}
            >
              Rebuild affected summaries
            </Link>
          </Button>
        </div>
      )}
      {result.rebuildCommand && (
        <details className="text-xs text-text-muted">
          <summary className="cursor-pointer">Command line</summary>
          <code className="mt-2 block overflow-x-auto rounded-md bg-raised p-2 font-mono text-text-body">
            {result.rebuildCommand}
          </code>
        </details>
      )}
    </section>
  );
}
