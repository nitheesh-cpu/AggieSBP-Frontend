import React from "react";
import { Lightbulb } from "lucide-react";
import type { ReviewStats } from "@/lib/api";

interface StatChip {
  key: string;
  value: string;
  label: string;
  n: number;
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function reviewsLabel(n: number) {
  return `${n} review${n === 1 ? "" : "s"}`;
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
    });
  }

  const gradesN = stats.grades_reported_n ?? 0;
  if (gradesN > 0 && stats.grade_distribution) {
    const grades = topGrades(stats.grade_distribution, gradesN);
    if (grades) {
      chips.push({
        key: "grades",
        value: grades,
        label: "reported grades",
        n: gradesN,
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
    });
  }

  const textbookN = stats.textbook_n ?? 0;
  if (textbookN > 0 && stats.textbook_used_pct != null) {
    chips.push({
      key: "textbook",
      value: pct(stats.textbook_used_pct),
      label: "used the textbook",
      n: textbookN,
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
    });
  }
  if (olderN > 0 && stats.avg_rating_older != null) {
    chips.push({
      key: "older",
      value: stats.avg_rating_older.toFixed(1),
      label: "avg rating, earlier",
      n: olderN,
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
          className="flex items-baseline gap-1.5 rounded-xl border border-border bg-canvas/70 px-3 py-1.5 text-xs dark:border-white/10 dark:bg-black/30"
        >
          <span className="font-semibold tabular-nums text-text-heading dark:text-white">
            {chip.value}
          </span>
          <span className="text-text-body dark:text-white/70">
            {chip.label}
          </span>
          <span className="tabular-nums text-text-body/60 dark:text-white/45">
            ({reviewsLabel(chip.n)})
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
        <Lightbulb className="h-3.5 w-3.5 text-accent" />
        <span className="text-xs font-semibold text-text-heading dark:text-white/90">
          Tips from students
        </span>
      </div>
      <ul className="list-disc space-y-1 pl-9 text-sm leading-relaxed text-text-body marker:text-accent dark:text-white/80">
        {items.map((tip, index) => (
          <li key={`${tip}-${index}`}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}

/** One-paragraph takeaway shown above the rest of an overall summary. */
export function SummaryTldr({
  tldr,
  className = "",
}: {
  tldr?: string | null;
  className?: string;
}) {
  if (!tldr || !tldr.trim()) return null;
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
