"use client";

import { useEffect, useMemo, useState } from "react";

import { getCoursePrereqs, type CoursePrereqs } from "@/lib/api";

// Shared across components for the page's lifetime; null = not in the catalog.
const cache = new Map<string, CoursePrereqs | null>();

/**
 * Names and prereq trees for a set of course codes, fetched once each.
 * `unknown` lists codes the catalog doesn't have. If the endpoint can't be
 * reached, `error` is set and callers should degrade to showing codes only.
 */
export function useCoursePrereqs(codes: string[]) {
  const key = useMemo(() => [...new Set(codes)].sort().join(","), [codes]);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const wanted = key ? key.split(",") : [];
    const toFetch = wanted.filter((c) => !cache.has(c));
    if (toFetch.length === 0) {
      setLoading(false); // an earlier, cancelled fetch may have left it on
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCoursePrereqs(toFetch)
      .then((graph) => {
        for (const code of toFetch) cache.set(code, graph.courses[code] ?? null);
        if (!cancelled) {
          setError(false);
          setVersion((v) => v + 1);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return useMemo(() => {
    const info: Record<string, CoursePrereqs> = {};
    const unknown: string[] = [];
    for (const code of key ? key.split(",") : []) {
      const hit = cache.get(code);
      if (hit) info[code] = hit;
      else if (hit === null) unknown.push(code);
    }
    return { info, unknown, loading, error };
    // `version` bumps when the cache fills.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version, loading, error]);
}

/** Fetch (or read from cache) one course's prereqs, for one-off lookups. */
export async function fetchCoursePrereqs(code: string): Promise<CoursePrereqs | null> {
  if (cache.has(code)) return cache.get(code) ?? null;
  const graph = await getCoursePrereqs([code]);
  const hit = graph.courses[code] ?? null;
  cache.set(code, hit);
  return hit;
}
