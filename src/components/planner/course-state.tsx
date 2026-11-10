"use client";

import { EASINESS_EXPLANATION } from "@/components/easiness";
import type { Eligibility } from "@/lib/planner/prereqs";
import type { CourseState } from "@/lib/planner/find";
import { cn } from "@/lib/utils";

const STYLES: Record<CourseState, { label: string; className: string }> = {
  done: {
    label: "Done",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  in_progress: {
    label: "In progress",
    className: "bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300",
  },
  planned: {
    label: "Planned",
    className: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  },
  ready: {
    label: "Can take",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/30 dark:bg-transparent dark:text-emerald-300",
  },
  maybe: {
    label: "Check requirements",
    className: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  },
  one_away: {
    label: "1 course away",
    className: "bg-orange-100 text-orange-900 dark:bg-orange-500/15 dark:text-orange-200",
  },
  locked: {
    label: "Locked",
    className: "bg-neutral-200 text-neutral-700 dark:bg-neutral-700/50 dark:text-neutral-300",
  },
  pending: {
    label: "Checking…",
    className: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  },
};

/** Small pill for where a course stands; locked ones say what's missing. */
export function CourseStateBadge({
  state,
  eligibility,
  className,
}: {
  state: CourseState;
  eligibility?: Eligibility | null;
  className?: string;
}) {
  const style = STYLES[state];
  const missing =
    eligibility && "missing" in eligibility && eligibility.missing.length > 0
      ? eligibility.missing
      : [];
  const label =
    (state === "one_away" || state === "locked") && missing.length > 0
      ? `Needs ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? ` +${missing.length - 2}` : ""}`
      : style.label;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        style.className,
        className,
      )}
      title={missing.length > 0 ? `Still needed: ${missing.join(", ")}` : undefined}
    >
      {label}
    </span>
  );
}

function tone(score: number) {
  if (score >= 80) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300";
  if (score >= 60) return "bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200";
  if (score >= 40) return "bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200";
  return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200";
}

/** Compact easiness number for dense lists. */
export function EasinessPill({ score }: { score: number | null | undefined }) {
  if (score == null) return null;
  return (
    <span
      className={cn(
        "inline-flex h-8 w-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold tabular-nums",
        tone(score),
      )}
      title={EASINESS_EXPLANATION}
      aria-label={`Easiness ${score.toFixed(0)} of 100`}
    >
      {score.toFixed(0)}
    </span>
  );
}
