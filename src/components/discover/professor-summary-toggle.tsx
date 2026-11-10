"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, Loader2 } from "lucide-react";
import type { CourseDetail } from "@/lib/api";
import { lastName } from "@/lib/planner/schedule-data";
import {
  ReviewStatsRow,
  SummaryTips,
  confidenceLabel,
  isLegacySummary,
  looksLikeQuotedReview,
} from "@/components/summary-insights";

type Professors = NonNullable<CourseDetail["professors"]>;

export type ProfessorSummaryState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; professors: Professors };

export function ProfessorSummaryToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="inline-flex items-center gap-1 text-xs font-medium text-text-heading underline-offset-2 hover:underline"
    >
      What students say
      <ChevronDown
        strokeWidth={1.5}
        className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

const FIELDS = [
  ["teaching", "Teaching"],
  ["exams", "Exams"],
  ["grading", "Grading"],
  ["workload", "Workload"],
] as const;

export function ProfessorSummaryPanel({
  state,
  instructor,
  courseId,
}: {
  state: ProfessorSummaryState | undefined;
  instructor: string | null | undefined;
  courseId: string;
}) {
  let body: React.ReactNode;
  if (!state || state.status === "loading") {
    body = (
      <p className="flex items-center gap-2 text-text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading reviews…
      </p>
    );
  } else if (state.status === "error") {
    body = <p className="text-text-muted">Couldn&apos;t load reviews.</p>;
  } else {
    const last = lastName(instructor);
    const prof = last
      ? state.professors.find((p) => lastName(p.name) === last)
      : undefined;
    const cs = prof?.courseSummary;
    const legacy = !!cs && isLegacySummary(cs);
    const fields = cs
      ? FIELDS.flatMap(([k, label]) => {
          const text = cs[k];
          return text && text.trim() ? [{ label: label as string, text }] : [];
        })
      : [];
    const hasTips = !!cs?.tips?.some((t) => t && t.trim());
    const hasStats = !!cs?.reviewStats;
    const legacyDesc =
      prof?.description &&
      prof.description !== "Course instruction" &&
      prof.description.trim().length > 0
        ? prof.description
        : null;
    const conf = confidenceLabel(cs?.confidence ?? prof?.confidence);
    const count = cs?.reviewCount;

    if (fields.length === 0 && !hasTips && !hasStats && !legacyDesc) {
      body = (
        <p className="text-text-muted">
          No review summary for this professor in this course yet.
        </p>
      );
    } else {
      body = (
        <div className="space-y-2">
          {legacy && (
            <p className="text-text-muted">
              Older summary, not yet updated. It may quote individual reviews.
            </p>
          )}
          <ReviewStatsRow stats={cs?.reviewStats} />
          {fields.map((f) => (
            <p key={f.label} className="leading-relaxed text-text-body">
              <span className="font-medium text-text-heading">{f.label}: </span>
              {legacy && looksLikeQuotedReview(f.text) ? (
                <>One student wrote: &ldquo;{f.text}&rdquo;</>
              ) : (
                f.text
              )}
            </p>
          ))}
          {fields.length === 0 && !hasTips && legacyDesc && (
            <p className="leading-relaxed text-text-body">{legacyDesc}</p>
          )}
          <SummaryTips tips={cs?.tips?.slice(0, 3)} />
          {(count || conf) && (
            <p className="text-text-muted">
              {[count ? `${count} review${count === 1 ? "" : "s"}` : null, conf]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      );
    }
  }

  return (
    <div className="basis-full rounded-md bg-muted/50 px-3 py-2 text-xs dark:bg-white/5">
      {body}
      <Link
        href={`/course/${courseId}`}
        className="mt-2 inline-block font-medium text-text-heading underline underline-offset-2"
      >
        Full reviews on the course page
      </Link>
    </div>
  );
}
