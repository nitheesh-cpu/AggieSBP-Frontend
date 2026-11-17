"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/components/admin/admin-shell";
import { AdminError, panelClass } from "@/components/admin/admin-ui";
import {
  AdminKeyError,
  clearCache,
  type CacheClearResult,
} from "@/lib/admin-api";

function describe(result: CacheClearResult) {
  const keys = `Cleared ${result.keysDeleted} cached ${result.keysDeleted === 1 ? "response" : "responses"}`;
  const detail = result.message ? `: ${result.message}` : ".";
  if (result.revalidation === "ok")
    return `${keys}; ${result.pagesRevalidated} ${result.pagesRevalidated === 1 ? "page" : "pages"} refreshed.`;
  if (result.revalidation === "skipped")
    return `${keys}. Site page refresh skipped${detail}`;
  return `${keys}. Site page refresh failed${detail} Pages may show old data until they refresh on their own.`;
}

/** Ids split on commas or whitespace; course codes may contain a space. */
const splitIds = (value: string) => [
  ...new Set(value.split(/[\s,]+/).filter(Boolean)),
];
const splitCodes = (value: string) => [
  ...new Set(
    value
      .split(",")
      .map((c) => c.trim().replace(/\s+/g, " ").toUpperCase())
      .filter(Boolean),
  ),
];

export default function AdminCachePage() {
  const { adminKey, signOut } = useAdmin();
  const [professors, setProfessors] = useState("");
  const [courses, setCourses] = useState("");
  const [confirmAll, setConfirmAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CacheClearResult | null>(null);

  const run = async (target: Parameters<typeof clearCache>[1]) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await clearCache(adminKey, target));
      setConfirmAll(false);
    } catch (e) {
      if (e instanceof AdminKeyError) signOut();
      else
        setError(e instanceof Error ? e.message : "Could not clear the cache.");
    } finally {
      setBusy(false);
    }
  };

  const professorIds = splitIds(professors);
  const courseCodes = splitCodes(courses);
  const hasTarget = professorIds.length + courseCodes.length > 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-text-heading">Cache</h1>
        <p className="mt-1 text-sm text-text-muted">
          Clear cached API responses so visitors see fresh data, for example
          after a merge or a summary rebuild. Pages on the site are refreshed
          too when that is configured.
        </p>
      </header>

      <AdminError message={error} />
      {result && (
        <p
          role="status"
          className={`${panelClass} text-sm ${result.revalidation === "failed" ? "border-red-500/30 text-red-700 dark:text-red-300" : result.revalidation === "skipped" ? "border-amber-500/40 text-text-body" : "text-text-body"}`}
        >
          {describe(result)}
        </p>
      )}

      <form
        className={`${panelClass} space-y-4`}
        onSubmit={(event) => {
          event.preventDefault();
          if (hasTarget && !busy) void run({ professorIds, courseCodes });
        }}
      >
        <h2 className="text-lg font-medium text-text-heading">
          Specific professors or courses
        </h2>
        <label className="block space-y-2 text-sm text-text-body">
          <span>Professor ids</span>
          <Input
            value={professors}
            onChange={(e) => setProfessors(e.target.value)}
            placeholder="VGVhY2hlci0yNDQxNTY3"
            autoComplete="off"
          />
          <span className="block text-xs text-text-muted">
            Separate several with commas or spaces.
          </span>
        </label>
        <label className="block space-y-2 text-sm text-text-body">
          <span>Course codes</span>
          <Input
            value={courses}
            onChange={(e) => setCourses(e.target.value)}
            placeholder="CSCE 121, MATH 151"
            autoComplete="off"
          />
          <span className="block text-xs text-text-muted">
            Separate several with commas.
          </span>
        </label>
        <Button disabled={busy || !hasTarget}>
          <Trash2 />
          {busy ? "Clearing…" : "Clear these"}
        </Button>
      </form>

      <section className={`${panelClass} space-y-3`}>
        <h2 className="text-lg font-medium text-text-heading">Everything</h2>
        <p className="text-sm text-text-muted">
          Removes every cached response. Pages may load slower for a while as
          the cache fills again.
        </p>
        {confirmAll ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-text-body">
              Clear the whole cache?
            </span>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => void run({ all: true })}
            >
              {busy ? "Clearing…" : "Yes, clear everything"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setConfirmAll(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setConfirmAll(true)}
          >
            Clear entire cache…
          </Button>
        )}
      </section>
    </div>
  );
}
