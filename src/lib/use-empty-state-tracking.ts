"use client";

import { useEffect, useRef } from "react";

import { track } from "@/lib/analytics";

/** How long the empty state must stay up before it counts, so one-render flashes between state updates don't report. */
const SETTLE_MS = 300;

/**
 * Reports `empty-state` when a page's "nothing here" state appears. Pass
 * `shown` as true only after a real load with no results (not while loading
 * or on an error). Reports once per hidden → shown change, so it fires again
 * only if results come back and then go empty again.
 */
export function useEmptyStateTracking(page: string, shown: boolean) {
  const reported = useRef(false);
  useEffect(() => {
    if (!shown) {
      reported.current = false;
      return;
    }
    if (reported.current) return;
    const id = window.setTimeout(() => {
      reported.current = true;
      track("empty-state", { page });
    }, SETTLE_MS);
    return () => window.clearTimeout(id);
  }, [page, shown]);
}
