"use client";

import { useCallback, useMemo } from "react";

import { useCoursePrereqs } from "@/hooks/use-course-prereqs";
import { courseState, type CourseState } from "@/lib/planner/find";
import { buildContext, evaluateCourse, type Eligibility } from "@/lib/planner/prereqs";
import { currentTermKey, type AcademicRecord } from "@/lib/planner/record";

export interface CourseStanding {
  state: CourseState;
  /** Null while prereq data is loading or unavailable. */
  eligibility: Eligibility | null;
}

/**
 * Where each of `codes` stands for the student in `termKey` (e.g. "20271"):
 * done / in progress / planned from the record, otherwise whether the
 * prerequisites will be met by then. Also returns catalog names.
 */
export function useEligibility(record: AcademicRecord, codes: string[], termKey: string) {
  const { info, unknown, loading, error } = useCoursePrereqs(codes);

  const ctx = useMemo(
    () => buildContext(record, termKey, { currentTerm: currentTermKey() }),
    [record, termKey],
  );

  const standing = useCallback(
    (code: string): CourseStanding => {
      const loaded = code in info || unknown.includes(code);
      // Without prereq data only the record itself is trustworthy.
      const eligibility = loaded && !error ? evaluateCourse(code, info[code], ctx) : null;
      return { state: courseState(record, code, eligibility), eligibility };
    },
    [info, unknown, error, ctx, record],
  );

  return { info, unknown, loading, error, standing };
}
