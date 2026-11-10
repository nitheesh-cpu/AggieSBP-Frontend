import React from "react";
import { Lightbulb } from "lucide-react";
import type { ReviewStats } from "@/lib/api";

interface StatChip {
  key: string;
  value: string;
  label: string;
  n: number;
  /** How the count reads, e.g. "11 answered" or "5 reviews". */
  countLabel: string;
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function reviewsLabel(n: number) {
  return `${n} review${n === 1 ? "" : "s"}`;
}

// Not every review answers every question, so these say how many did.
function answeredLabel(n: number) {
  return `${n} answered`;
}

// The three most reported grades, as shares of all reported grades.
function topGrades(distribution: Record<string, number>, total: number) {
  return Object.entries(distribution)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([grade, count]) => `${grade} ${pct((100 * count) / total)}`)
    .join(" · ");
}

function buildChips(stats: ReviewStats): StatChip[] {
  const chips: StatChip[] = [];
  const takeAgainN = stats.would_take_again_n ?? 0;
  if (takeAgainN > 0 && stats.would_take_again_pct != null) {
    chips.push({
      key: "take-again",
      value: pct(stats.would_take_again_pct),
      label: "would take again",
      n: takeAgainN,
      countLabel: answeredLabel(takeAgainN),
    });
  }

  const gradesN = stats.grades_reported_n ?? 0;
  if (gradesN > 0 && stats.grade_distribution) {
    const grades = topGrades(stats.grade_distribution, gradesN);
    if (grades) {
      chips.push({
        key: "grades",
        value: grades,
        label: "grades students reported on RMP",
        n: gradesN,
        countLabel: `${gradesN} reported`,
      });
    }
  }

  const attendanceN = stats.attendance_n ?? 0;
  if (attendanceN > 0 && stats.attendance_mandatory_pct != null) {
    chips.push({
      key: "attendance",
      value: pct(stats.attendance_mandatory_pct),
      label: "say attendance is mandatory",
      n: attendanceN,
      countLabel: answeredLabel(attendanceN),
    });
  }

  const textbookN = stats.textbook_n ?? 0;
  if (textbookN > 0 && stats.textbook_used_pct != null) {
    chips.push({
      key: "textbook",
      value: pct(stats.textbook_used_pct),
      label: "used the textbook",
      n: textbookN,
      countLabel: answeredLabel(textbookN),
    });
  }

  const years = stats.recent_window_years ?? 2;
  const recentN = stats.recent_n ?? 0;
  const olderN = stats.older_n ?? 0;
  if (recentN > 0 && stats.avg_rating_recent != null) {
    chips.push({
      key: "recent",
      value: stats.avg_rating_recent.toFixed(1),
      label: `avg rating, last ${years} years`,
      n: recentN,
      countLabel: reviewsLabel(recentN),
    });
  }
  if (olderN > 0 && stats.avg_rating_older != null) {
    chips.push({
      key: "older",
      value: stats.avg_rating_older.toFixed(1),
      label: "avg rating, earlier",
      n: olderN,
      countLabel: reviewsLabel(olderN),
    });
  }
  return chips;
}

/** Compact row of review statistics; a stat with no reporting reviews is hidden. */
export function ReviewStatsRow({
  stats,
  className = "",
}: {
  stats?: ReviewStats | null;
  className?: string;
}) {
  if (!stats) return null;
  const chips = buildChips(stats);
  if (chips.length === 0) return null;

  return (
    <ul
      aria-label="Review statistics"
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {chips.map((chip) => (
        <li
          key={chip.key}
          title={`Based on ${reviewsLabel(chip.n)}`}
          className="flex min-w-0 max-w-full flex-wrap items-baseline gap-x-1.5 rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs"
        >
          <span className="font-medium tabular-nums text-text-heading">
            {chip.value}
          </span>
          <span className="text-text-body">
            {chip.label}
          </span>
          <span className="tabular-nums text-text-muted">
            ({chip.countLabel})
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Practical advice students gave for a course. */
export function SummaryTips({
  tips,
  className = "",
}: {
  tips?: string[] | null;
  className?: string;
}) {
  const items = (tips || []).filter((tip) => tip && tip.trim());
  if (items.length === 0) return null;

  return (
    <div className={className}>
      <div className="mb-1 flex items-center gap-1.5">
        <Lightbulb strokeWidth={1.5} className="h-3.5 w-3.5 text-text-muted" />
        <span className="text-xs font-medium text-text-heading">
          Tips from students
        </span>
      </div>
      <ul className="list-disc space-y-1 pl-9 text-sm leading-relaxed text-text-body marker:text-text-muted">
        {items.map((tip, index) => (
          <li key={`${tip}-${index}`}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One-paragraph takeaway shown above the rest of an overall summary.
 * `prominent` makes it a callout, for the professor page where it's the headline.
 */
export function SummaryTldr({
  tldr,
  className = "",
  prominent = false,
}: {
  tldr?: string | null;
  className?: string;
  prominent?: boolean;
}) {
  if (!tldr || !tldr.trim()) return null;
  if (!prominent) {
    return (
      <p
        className={`text-sm leading-relaxed text-text-body dark:text-white/85 ${className}`}
      >
        <span className="mr-1.5 font-semibold text-text-heading dark:text-white">
          TL;DR
        </span>
        {tldr}
      </p>
    );
  }
  return (
    <div
      className={`rounded-r-xl border-l-4 border-accent bg-accent/[0.06] px-4 py-3 dark:bg-accent/10 ${className}`}
    >
      <span className="inline-block rounded bg-accent px-1.5 py-0.5 text-[11px] font-bold leading-none tracking-wide text-accent-foreground">
        TL;DR
      </span>
      <p className="mt-2 text-base font-medium leading-relaxed text-text-heading sm:text-lg">
        {tldr}
      </p>
    </div>
  );
}

/**
 * One sentence when recent ratings differ clearly from older ones, so a high
 * lifetime average can't hide a recent drop (or a recent improvement).
 */
export function RatingTrend({
  stats,
  className = "",
}: {
  stats?: ReviewStats | null;
  className?: string;
}) {
  if (!stats) return null;
  const recent = stats.avg_rating_recent;
  const older = stats.avg_rating_older;
  const recentN = stats.recent_n ?? 0;
  const olderN = stats.older_n ?? 0;
  if (recent == null || older == null || recentN < 3 || olderN < 3) return null;
  const diff = recent - older;
  if (Math.abs(diff) < 0.5) return null;
  const years = stats.recent_window_years ?? 2;
  const dropped = diff < 0;
  return (
    <p
      className={`rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-text-body ${className}`}
    >
      <span className={`font-medium ${dropped ? "text-caution" : "text-positive"}`}>
        {dropped ? "Ratings dropped recently: " : "Ratings improved recently: "}
      </span>
      {recent.toFixed(1)} in the last {years} years ({reviewsLabel(recentN)})
      vs {older.toFixed(1)} before ({reviewsLabel(olderN)})
    </p>
  );
}

/** Plain-words confidence used everywhere a summary is shown. */
export function confidenceLabel(confidence?: number | null): string | null {
  if (confidence == null) return null;
  if (confidence >= 0.75) return "High confidence";
  if (confidence >= 0.5) return "Medium confidence";
  return "Low confidence";
}

/**
 * Older summaries (before the TL;DR/tips/stats format) sometimes copy a single
 * review word for word. Those are labelled so students don't read them as an
 * AI digest of many reviews.
 */
export function isLegacySummary(summary?: {
  tips?: string[] | null;
  reviewStats?: ReviewStats | null;
} | null): boolean {
  if (!summary) return false;
  const hasTips = (summary.tips || []).some((t) => t && t.trim());
  return !hasTips && !summary.reviewStats;
}

/** True when text reads like a first-person review rather than a summary. */
export function looksLikeQuotedReview(text?: string | null): boolean {
  if (!text) return false;
  return /(^|[\s"'(])(I|I'm|I've|I'd|my|me)\b/.test(text);
}
