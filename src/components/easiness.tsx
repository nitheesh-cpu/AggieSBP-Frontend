import React from "react";

/**
 * One explanation of the Easiness score for every page that shows it
 * (Core Curriculum, Explore Easy Courses, Fit My Schedule).
 * Backend formula: GPA 50% + low difficulty 30% + rating 20%, on 0-100.
 */
export const EASINESS_EXPLANATION =
  "Easiness (0–100, higher is easier) mixes average GPA (50%), how easy students rate it (30%), and professor rating (20%).";

export function confidenceDots(confidence?: number | null) {
  if (confidence == null) return null;
  if (confidence >= 70) return { dots: "●●●", label: "lots of data" };
  if (confidence >= 40) return { dots: "●●○", label: "some data" };
  return { dots: "●○○", label: "limited data" };
}

function scoreTone(score: number) {
  if (score >= 80)
    return "bg-emerald-100 text-emerald-800 ring-emerald-600/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/30";
  if (score >= 60)
    return "bg-yellow-100 text-yellow-900 ring-yellow-600/30 dark:bg-yellow-500/20 dark:text-yellow-200 dark:ring-yellow-500/30";
  if (score >= 40)
    return "bg-orange-100 text-orange-900 ring-orange-600/30 dark:bg-orange-500/20 dark:text-orange-200 dark:ring-orange-500/30";
  return "bg-red-100 text-red-800 ring-red-600/30 dark:bg-red-500/20 dark:text-red-200 dark:ring-red-500/30";
}

/** Round score with "easiness" under it and optional data-confidence dots. */
export function EasinessBadge({
  score,
  confidence,
}: {
  score?: number | null;
  /** 0-100 */
  confidence?: number | null;
}) {
  if (score == null) return null;
  const conf = confidenceDots(confidence);
  return (
    <div
      className="flex shrink-0 flex-col items-center"
      title={`${EASINESS_EXPLANATION}${conf ? ` Based on ${conf.label}.` : ""}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ring-2 ${scoreTone(score)}`}
      >
        {score.toFixed(0)}
      </div>
      <span className="mt-1 text-[10px] font-medium text-text-body dark:text-white/75">
        easiness
      </span>
      {conf && (
        <span className="text-[10px] text-text-body dark:text-white/70">
          <span aria-hidden>{conf.dots}</span>
          <span className="sr-only">{conf.label}</span>
        </span>
      )}
    </div>
  );
}

/** Legend for the numbers on discover pages. `compact` is a single line. */
export function EasinessLegend({
  compact = false,
  showAbRate = false,
}: {
  compact?: boolean;
  showAbRate?: boolean;
}) {
  if (compact) {
    return (
      <p className="text-xs text-text-body dark:text-white/80">
        <span className="font-semibold text-text-heading dark:text-white">Easiness</span>{" "}
        is 0–100, higher is easier: average GPA (50%), how easy students rate it (30%),
        and professor rating (20%).
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
      <div className="space-y-1">
        <h4 className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs">
            90
          </span>
          Easiness score
        </h4>
        <p className="text-xs leading-relaxed text-text-body dark:text-white/80">
          0–100, higher is easier. Mixes <strong>average GPA</strong> (50%),{" "}
          <strong>how easy students rate it</strong> (30%), and{" "}
          <strong>professor rating</strong> (20%).
        </p>
      </div>
      <div className="space-y-1">
        <h4 className="flex items-center gap-2 font-bold text-text-heading dark:text-white">
          <span className="text-xs tracking-widest text-text-body dark:text-white/75">●●●</span>
          How much data
        </h4>
        <p className="text-xs leading-relaxed text-text-body dark:text-white/80">
          Three dots: lots of grades and reviews. One dot: only a little, so treat the
          score as a rough guess.
        </p>
      </div>
      {showAbRate && (
        <div className="space-y-1">
          <h4 className="font-bold text-blue-700 dark:text-blue-400">% A/B</h4>
          <p className="text-xs leading-relaxed text-text-body dark:text-white/80">
            Share of students who earned an <strong>A</strong> or <strong>B</strong> with
            this professor (official grade data).
          </p>
        </div>
      )}
    </div>
  );
}
