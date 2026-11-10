"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  normalizeQuery,
  track,
  type AnalyticsEvent,
  type AnalyticsEvents,
  type SearchFrom,
} from "@/lib/analytics";

/** How long a query has to sit unchanged before it counts as a search. */
const SEARCH_SETTLE_MS = 1200;

/**
 * Reports a search once the user stops typing and results have loaded:
 * `search` every time, plus `search-miss` (with the normalized query) when
 * nothing came back. Each distinct query is reported once per page view.
 *
 * Pass `loading: true` while results are being fetched so a stale count
 * isn't reported.
 */
export function useSearchTracking(
  from: SearchFrom,
  query: string,
  results: number,
  loading = false,
): void {
  const reported = useRef(new Set<string>());

  useEffect(() => {
    if (loading) return;
    const q = normalizeQuery(query);
    if (!q || reported.current.has(q)) return;

    const timer = window.setTimeout(() => {
      reported.current.add(q);
      const zero = results === 0;
      track("search", { from, results, zero });
      if (zero) track("search-miss", { from, q });
    }, SEARCH_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [from, query, results, loading]);
}

/**
 * Fires an event the first time the element is at least a third visible.
 * Used for "which parts of the page get read".
 */
export function useTrackInView<E extends AnalyticsEvent>(
  ref: RefObject<Element | null>,
  event: E,
  data: AnalyticsEvents[E],
  enabled = true,
): void {
  const fired = useRef(false);
  // Keep the latest data without re-observing on every render.
  const latest = useRef(data);
  latest.current = data;

  useEffect(() => {
    const el = ref.current;
    if (!enabled || fired.current || !el || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (fired.current || !entries.some((e) => e.isIntersecting)) return;
        fired.current = true;
        observer.disconnect();
        (track as (e: string, d?: unknown) => void)(event, latest.current);
      },
      { threshold: 0.33 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, event, enabled]);
}
