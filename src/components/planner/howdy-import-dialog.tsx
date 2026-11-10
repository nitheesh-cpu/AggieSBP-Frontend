"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, School } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCoursePrereqs } from "@/hooks/use-course-prereqs";
import { track } from "@/lib/analytics";
import {
  howdyToInputs,
  requirementKey,
  type HowdyCourse,
  type HowdyImport,
  type HowdyRequirement,
} from "@/lib/planner/howdy";
import {
  termLabel,
  type CourseInput,
  type RecordCourse,
} from "@/lib/planner/record";

import { STATUS_LABELS } from "./record-fields";

export const HOWDY_PLANNER_URL =
  "https://howdy.tamu.edu/main/home/degree-planner-ui/curriculum";
export const HOWDY_EVALUATE_URL =
  "https://howdy.tamu.edu/main/home/degree-planner-ui/evaluate";
const EXTENSION_URL =
  "https://chromewebstore.google.com/detail/aggiesb+-registration-ass/glckdcnecomhlmlegmjdceblibmaljpm";
const NO_TERM = "";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Courses sent by the extension, waiting for review. */
  pending: HowdyImport | null;
  signedIn: boolean;
  /** False while the session is still being checked. */
  authReady: boolean;
  existing: ReadonlyMap<string, RecordCourse>;
  /** requirementKey()s of groups already in the plan (an import replaces them). */
  existingRequirements: ReadonlySet<string>;
  onImport: (inputs: CourseInput[], requirements: HowdyRequirement[]) => void;
  onDiscard: () => void;
}

/**
 * Import from the Howdy degree planner. Without a pending import it explains
 * the extension steps; with one, it lists the courses for review. Saving
 * needs an account, so signed-out students are sent to sign in first (the
 * pending import survives the redirect).
 */
export function HowdyImportDialog(props: Props) {
  const { open, onOpenChange, pending } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-2xl dark:bg-card">
        {pending ? <Review {...props} pending={pending} /> : <Instructions />}
      </DialogContent>
    </Dialog>
  );
}

function Instructions() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Import from your Howdy degree planner</DialogTitle>
        <DialogDescription>
          The AggieSB+ extension reads your Howdy degree planner and sends your
          courses here, with terms and grades, so you don&apos;t have to type
          them in.
        </DialogDescription>
      </DialogHeader>
      <ol className="space-y-3 text-sm text-text-body">
        <Step n={1}>
          Install the{" "}
          <a
            href={EXTENSION_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("extension-click", { from: "planner-howdy", browser: "chrome" })}
            className="font-medium underline"
          >
            AggieSB+ extension
          </a>{" "}
          if you haven&apos;t already.
        </Step>
        <Step n={2}>
          Open your{" "}
          <a
            href={HOWDY_PLANNER_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline"
          >
            Howdy degree planner
          </a>
          .
        </Step>
        <Step n={3}>
          Click <strong>Evaluate &amp; Go Plan View</strong>. On the plan view,
          click <strong>Expand All</strong>, then <strong>Table View</strong>.
          The AggieSB+ box in the corner checks each step off and can click the
          buttons for you.
        </Step>
        <Step n={4}>
          Click <strong>Send to AggieSB+</strong>. This page opens with your
          courses so you can review them before anything is saved.
        </Step>
      </ol>
      <p className="text-xs text-text-muted">
        You&apos;ll need to be signed in to save the import.
      </p>
      <DialogFooter>
        <Button asChild className="gap-2">
          <a href={HOWDY_PLANNER_URL} target="_blank" rel="noreferrer">
            Open Howdy degree planner <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </DialogFooter>
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-raised text-xs font-semibold text-text-heading">
        {n}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}

function describe(c: Pick<RecordCourse, "status" | "grade" | "term">): string {
  return [STATUS_LABELS[c.status], c.grade, c.term ? termLabel(c.term) : null]
    .filter(Boolean)
    .join(" · ");
}

function Review({
  pending,
  signedIn,
  authReady,
  existing,
  existingRequirements,
  onImport,
  onDiscard,
  onOpenChange,
}: Props & { pending: HowdyImport }) {
  const [excluded, setExcluded] = useState<ReadonlySet<string>>(new Set());
  // Requirements Howdy already counts as met start unticked: the useful part is what's left.
  const [excludedReqs, setExcludedReqs] = useState<ReadonlySet<string>>(
    () =>
      new Set(pending.requirements.filter((r) => r.met).map(requirementKey)),
  );
  const codes = useMemo(() => pending.courses.map((c) => c.code), [pending]);
  const { unknown } = useCoursePrereqs(codes);

  const groups = useMemo(() => {
    const byTerm = new Map<string, HowdyCourse[]>();
    for (const c of pending.courses) {
      const key = c.term ?? NO_TERM;
      byTerm.set(key, [...(byTerm.get(key) ?? []), c]);
    }
    return [...byTerm.entries()].sort(([a], [b]) => {
      if (a === NO_TERM) return -1; // transfer and test credit first
      if (b === NO_TERM) return 1;
      return a.localeCompare(b);
    });
  }, [pending]);

  const selected = pending.courses.filter((c) => !excluded.has(c.code));
  const selectedReqs = pending.requirements.filter(
    (r) => !excludedReqs.has(requirementKey(r)),
  );
  const areas = useMemo(() => {
    const byArea = new Map<string, HowdyRequirement[]>();
    for (const r of pending.requirements)
      byArea.set(r.area, [...(byArea.get(r.area) ?? []), r]);
    return [...byArea.entries()];
  }, [pending]);
  const toggleIn =
    (set: React.Dispatch<React.SetStateAction<ReadonlySet<string>>>) =>
    (key: string, include: boolean) =>
      set((prev) => {
        const next = new Set(prev);
        if (include) next.delete(key);
        else next.add(key);
        return next;
      });
  const toggle = toggleIn(setExcluded);
  const toggleReq = toggleIn(setExcludedReqs);

  const hasCourses = pending.courses.length > 0;
  const hasReqs = pending.requirements.length > 0;
  const summary = [
    hasCourses && `${pending.courses.length} courses`,
    hasReqs && `${pending.requirements.length} requirement groups`,
  ]
    .filter(Boolean)
    .join(" and ");
  const total = selected.length + selectedReqs.length;
  const importLabel = [
    selected.length > 0 &&
      `${selected.length} course${selected.length === 1 ? "" : "s"}`,
    selectedReqs.length > 0 &&
      `${selectedReqs.length} requirement${selectedReqs.length === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" and ");

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <School className="h-5 w-5" /> From your Howdy degree planner
        </DialogTitle>
        <DialogDescription>
          {`${summary} from Howdy. Untick anything you don't want.`}
        </DialogDescription>
      </DialogHeader>

      {!authReady ? (
        <p className="text-sm text-text-body">Checking your sign-in…</p>
      ) : !signedIn ? (
        <div className="space-y-3 rounded-md border border-border p-4">
          <p className="text-sm text-text-body">
            Sign in to import these. They&apos;ll still be here when you come
            back.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link
                href="/auth?redirectToPath=%2Fplanner"
                onClick={() => track("signin-start", { from: "howdy-import" })}
              >
                Sign in to import
              </Link>
            </Button>
            <Button variant="ghost" onClick={onDiscard}>
              Discard
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="max-h-[55vh] space-y-5 overflow-y-auto rounded-md border border-border p-3">
            {hasCourses && (
              <div className="space-y-3">
                <SectionHeader
                  title="Courses"
                  note="Courses already in your list are updated to match Howdy."
                  count={selected.length}
                  onAll={() => setExcluded(new Set())}
                  onNone={() => setExcluded(new Set(codes))}
                />
                {groups.map(([term, courses]) => (
                  <section key={term || "none"}>
                    <h4 className="mb-1 text-xs font-medium text-text-muted">
                      {term ? termLabel(term) : "Transfer and test credit"}
                    </h4>
                    <ul className="divide-y divide-border/60">
                      {courses.map((c) => {
                        const prev = existing.get(c.code);
                        const changed =
                          prev &&
                          (prev.status !== c.status ||
                            (prev.grade ?? null) !== c.grade ||
                            (prev.term ?? null) !== c.term);
                        return (
                          <li
                            key={c.code}
                            className="flex items-start gap-3 py-1.5"
                          >
                            <Checkbox
                              className="mt-0.5"
                              checked={!excluded.has(c.code)}
                              onCheckedChange={(v) =>
                                toggle(c.code, v === true)
                              }
                              aria-label={`Import ${c.code}`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-x-2">
                                <span className="font-medium text-text-heading">
                                  {c.code}
                                </span>
                                <span className="truncate text-sm text-text-body">
                                  {c.title}
                                </span>
                              </div>
                              <div className="text-xs text-text-muted">
                                {describe(c)}
                                {c.transfer && " · transfer credit"}
                                {prev &&
                                  (changed
                                    ? ` · updates "${describe(prev)}"`
                                    : " · already in your list")}
                              </div>
                              {unknown.includes(c.code) && (
                                <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                                  <AlertTriangle className="h-3 w-3" />
                                  Not in our catalog, so prerequisites
                                  can&apos;t be checked for it.
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}

            {hasReqs && (
              <div className="space-y-2">
                <SectionHeader
                  title="Requirements"
                  note="Ones Howdy already shows as met start unticked. Electives don't say which courses count, so you add those options yourself."
                  count={selectedReqs.length}
                  onAll={() => setExcludedReqs(new Set())}
                  onNone={() =>
                    setExcludedReqs(
                      new Set(pending.requirements.map(requirementKey)),
                    )
                  }
                />
                {areas.map(([area, reqs]) => (
                  <section key={area || "none"}>
                    {area && (
                      <h4 className="mt-2 text-xs font-medium text-text-muted">
                        {area}
                      </h4>
                    )}
                    <ul className="divide-y divide-border/60">
                      {reqs.map((r) => (
                        <li
                          key={requirementKey(r)}
                          className="flex items-start gap-3 py-1.5"
                        >
                          <Checkbox
                            className="mt-0.5"
                            checked={!excludedReqs.has(requirementKey(r))}
                            onCheckedChange={(v) =>
                              toggleReq(requirementKey(r), v === true)
                            }
                            aria-label={`Import ${area ? `${area}: ` : ""}${r.name}`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-text-heading">
                              {r.name}
                            </div>
                            <div className="text-xs text-text-muted">
                              {requirementSummary(r)}
                              {r.met && " · met in Howdy"}
                              {existingRequirements.has(requirementKey(r)) &&
                                " · updates the one you have"}
                            </div>
                            {r.kind === "elective" && (
                              <div className="text-xs text-amber-700 dark:text-amber-400">
                                Howdy doesn&apos;t list the courses for this
                                one. Add the ones you could take after
                                importing.
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={onDiscard}>
              Discard
            </Button>
            <Button
              disabled={total === 0}
              onClick={() => {
                onImport(howdyToInputs(selected), selectedReqs);
                onOpenChange(false);
              }}
            >
              {total === 0 ? "Nothing selected" : `Import ${importLabel}`}
            </Button>
          </DialogFooter>
        </>
      )}
    </>
  );
}

function SectionHeader({
  title,
  note,
  count,
  onAll,
  onNone,
}: {
  title: string;
  note: string;
  count: number;
  onAll: () => void;
  onNone: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-heading">
          {title}{" "}
          <span className="font-normal text-text-muted">
            · {count} selected
          </span>
        </h3>
        <span className="flex">
          <Button variant="ghost" size="sm" className="h-7" onClick={onAll}>
            All
          </Button>
          <Button variant="ghost" size="sm" className="h-7" onClick={onNone}>
            None
          </Button>
        </span>
      </div>
      <p className="text-xs text-text-muted">{note}</p>
    </div>
  );
}

function requirementSummary(r: HowdyRequirement): string {
  const list = r.options.map((o) => o.join(" + ")).join(", ");
  if (r.kind === "fixed") return `All of: ${list}`;
  if (r.allowed.length > 0) {
    // Pick N from Howdy's list; options are only what's already planned.
    return [
      `Pick ${r.pick} from ${r.allowed.length} listed courses`,
      list && `so far: ${list}`,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (r.options.length === 0) return `Elective${r.hours ? `, ${r.hours} hours` : ""}`;
  if (r.kind === "elective") return `So far: ${list}`;
  return `Pick ${r.pick} of: ${list}`;
}
