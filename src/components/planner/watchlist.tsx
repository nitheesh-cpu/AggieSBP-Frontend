"use client";

import { useMemo } from "react";
import Link from "next/link";

import { useEligibility } from "@/hooks/use-eligibility";
import { activeWatchlist, addToWatchlist, type DegreePlan } from "@/lib/planner/plan";
import { courseId, type AcademicRecord } from "@/lib/planner/record";

import { CourseSearch } from "./course-search";
import { CourseStateBadge } from "./course-state";
import { AddToRequirementMenu, WatchButton, type PlanUpdate } from "./plan-actions";

/** Courses the student is keeping an eye on, with where each stands. */
export function Watchlist({
  record,
  plan,
  update,
  termKey,
}: {
  record: AcademicRecord;
  plan: DegreePlan;
  update: PlanUpdate;
  termKey: string;
}) {
  const items = activeWatchlist(plan);
  const codes = useMemo(() => items.map((w) => w.code), [items]);
  const { info, error, standing } = useEligibility(record, codes, termKey);

  return (
    <div className="space-y-3">
      <CourseSearch
        placeholder="Watch a course"
        existing={new Set(codes)}
        onSelect={(code) => update((p) => addToWatchlist(p, code))}
      />
      {items.length === 0 ? (
        <p className="text-sm text-text-body">
          Star courses in Find courses, or search above, to keep them here.
        </p>
      ) : (
        <ul className="divide-y divide-border/60 rounded-md border border-border/60">
          {items.map(({ code }) => {
            const s = standing(code);
            return (
              <li key={code} className="flex items-center gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/course/${courseId(code)}`}
                    className="font-medium text-text-heading hover:underline"
                  >
                    {code}
                  </Link>
                  {info[code]?.name && (
                    <div className="truncate text-xs text-text-body">{info[code].name}</div>
                  )}
                </div>
                {(!error || s.state !== "pending") && (
                  <CourseStateBadge state={s.state} eligibility={s.eligibility} />
                )}
                <AddToRequirementMenu plan={plan} update={update} code={code} />
                <WatchButton plan={plan} update={update} code={code} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
