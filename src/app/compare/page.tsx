"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCourses,
  getProfessors,
  compareProfessors,
  getCourseDetail,
  type Course,
  type Professor,
  type ProfessorDetail,
  type CourseDetail,
} from "@/lib/api";
import {
  Search,
  Plus,
  X,
  Star,
  BookOpen,
  GraduationCap,
  Loader2,
  ChevronRight,
  ExternalLink,
  Check,
} from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import { useProfessorComparison } from "@/contexts/ProfessorComparisonContext";

const MAX_ITEMS = 4;
const GRADES = ["A", "B", "C", "D", "F"] as const;
type GradeDistribution = Record<(typeof GRADES)[number], number>;

const GRADE_COLORS: Record<(typeof GRADES)[number], string> = {
  A: "bg-emerald-500",
  B: "bg-sky-500",
  C: "bg-amber-400",
  D: "bg-orange-500",
  F: "bg-red-500",
};

const DIFFICULTY_ORDER: Record<string, number> = {
  Light: 1,
  Moderate: 2,
  Challenging: 3,
  Intensive: 4,
  Rigorous: 5,
};

const cardClass =
  "bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/**
 * Indices of the best value in a row. Nothing is highlighted when fewer than
 * two columns have a value or when every value is the same.
 */
function bestIndices(
  values: Array<number | null | undefined>,
  direction: "max" | "min"
): Set<number> {
  const present = values.filter(
    (v): v is number => typeof v === "number" && !Number.isNaN(v)
  );
  if (present.length < 2) return new Set();
  const best = direction === "max" ? Math.max(...present) : Math.min(...present);
  if (present.every((v) => v === best)) return new Set();
  return new Set(
    values.flatMap((v, i) => (typeof v === "number" && v === best ? [i] : []))
  );
}

function gpaFromDistribution(d: GradeDistribution): number | null {
  const total = GRADES.reduce((sum, g) => sum + (d[g] || 0), 0);
  if (total <= 0) return null;
  return (4 * d.A + 3 * d.B + 2 * d.C + 1 * d.D) / total;
}

type CourseProfessor = NonNullable<CourseDetail["professors"]>[number];

interface MergedProfessor {
  id?: string;
  name: string;
  rating: number | null;
  reviews: number;
  distribution: GradeDistribution | null;
}

/**
 * The API can list the same person more than once (separate RMP profiles).
 * Merge them by name so a professor shows up once per course.
 */
function mergeProfessors(professors: CourseProfessor[] = []): MergedProfessor[] {
  const byName = new Map<
    string,
    MergedProfessor & {
      ratingSum: number;
      ratedReviews: number;
      linkReviews: number;
    }
  >();
  for (const p of professors) {
    const name = p.name.replace(/\s+/g, " ").trim();
    const key = name.toLowerCase();
    const rating = p.courseRating ?? p.rating ?? null;
    const reviews = p.courseReviewCount ?? p.totalReviews ?? p.reviews ?? 0;
    const distribution =
      (p.gradeDistribution as GradeDistribution | undefined) ??
      (p.grades?.distribution as GradeDistribution | undefined) ??
      null;
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, {
        id: p.id,
        name,
        rating,
        reviews,
        distribution,
        ratingSum: rating !== null ? rating * Math.max(reviews, 1) : 0,
        ratedReviews: rating !== null ? Math.max(reviews, 1) : 0,
        linkReviews: reviews,
      });
      continue;
    }
    if (rating !== null) {
      existing.ratingSum += rating * Math.max(reviews, 1);
      existing.ratedReviews += Math.max(reviews, 1);
      existing.rating = existing.ratingSum / existing.ratedReviews;
    }
    existing.reviews += reviews;
    existing.distribution = existing.distribution ?? distribution;
    // Link to the profile with the most reviews.
    if (p.id && reviews > existing.linkReviews) {
      existing.id = p.id;
      existing.linkReviews = reviews;
    }
  }
  return Array.from(byName.values())
    .map(({ id, name, rating, reviews, distribution }) => ({
      id,
      name,
      rating,
      reviews,
      distribution,
    }))
    .sort((a, b) => b.reviews - a.reviews || (b.rating ?? 0) - (a.rating ?? 0));
}

interface CourseSummary {
  rating: number | null;
  ratingReviews: number;
  distribution: GradeDistribution | null;
  distributionProfessors: number;
  professors: MergedProfessor[];
}

function summarizeCourse(course: CourseDetail): CourseSummary {
  const professors = mergeProfessors(course.professors);

  let weighted = 0;
  let ratingReviews = 0;
  for (const p of professors) {
    if (p.rating !== null && p.reviews > 0) {
      weighted += p.rating * p.reviews;
      ratingReviews += p.reviews;
    }
  }

  const withGrades = professors.filter((p) => p.distribution);
  let distribution: GradeDistribution | null = null;
  if (withGrades.length > 0) {
    distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const p of withGrades) {
      const d = p.distribution!;
      const total = GRADES.reduce((s, g) => s + (d[g] || 0), 0) || 1;
      for (const g of GRADES) distribution[g] += ((d[g] || 0) / total) * 100;
    }
    for (const g of GRADES) distribution[g] /= withGrades.length;
  }

  return {
    rating: ratingReviews > 0 ? weighted / ratingReviews : course.rating ?? null,
    ratingReviews,
    distribution,
    distributionProfessors: withGrades.length,
    professors,
  };
}

function prerequisiteGroups(course: CourseDetail): string[][] | string | null {
  const prereqs = course.prerequisites;
  if (!prereqs) return null;
  if (Array.isArray(prereqs)) return prereqs.length ? prereqs.map((p) => [p]) : null;
  if (prereqs.groups && prereqs.groups.length) return prereqs.groups;
  if (prereqs.courses && prereqs.courses.length) return prereqs.courses.map((c) => [c]);
  // Scraped text sometimes carries a mis-decoded non-breaking space ("Â ").
  const text = prereqs.text?.replace(/Â? /g, " ").trim();
  return text || null;
}

function formatTermCode(code?: string | null): string | null {
  if (!code || code.length < 5) return null;
  const year = code.slice(0, 4);
  const season = { "1": "Spring", "2": "Summer", "3": "Fall" }[code[4]];
  return season ? `${season} ${year}` : null;
}

// ---------------------------------------------------------------------------
// Shared UI
// ---------------------------------------------------------------------------

interface SearchPickerProps<T> {
  placeholder: string;
  search: (term: string) => Promise<T[]>;
  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  selectedCount: number;
  isSelected: (key: string) => boolean;
  onPick: (item: T) => void;
}

function SearchPicker<T>({
  placeholder,
  search,
  getKey,
  renderItem,
  selectedCount,
  isSelected,
  onPick,
}: SearchPickerProps<T>) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebounced(term.trim(), 250);
  const containerRef = useRef<HTMLDivElement>(null);
  const full = selectedCount >= MAX_ITEMS;

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    search(debounced)
      .then((items) => {
        if (cancelled) return;
        setResults(items);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setResults([]);
        setError(err instanceof Error ? err.message : "Search failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (item: T) => {
    if (full || isSelected(getKey(item))) return;
    onPick(item);
    setTerm("");
    setResults([]);
  };

  const firstPickable = results.find((r) => !isSelected(getKey(r)));
  const showDropdown = open && term.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body dark:text-white/60" />
      <Input
        value={term}
        disabled={full}
        placeholder={
          full ? `You can compare up to ${MAX_ITEMS} at once` : placeholder
        }
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && firstPickable) {
            e.preventDefault();
            pick(firstPickable);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="h-12 pl-10 bg-canvas border-border text-text-body placeholder:text-text-body/75 dark:bg-black/30 dark:border-white/15 dark:text-white dark:placeholder:text-white/65"
      />
      {loading && (
        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#FFCF3F]" />
      )}

      {showDropdown && (
        <div className="absolute z-30 mt-2 w-full max-h-80 overflow-y-auto rounded-xl border border-border bg-card shadow-lg dark:bg-neutral-950 dark:border-white/15">
          {error ? (
            <p className="p-4 text-sm text-red-600 dark:text-red-300">{error}</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-text-body dark:text-white/70">
              {loading || term.trim() !== debounced
                ? "Searching..."
                : `No matches for "${term.trim()}"`}
            </p>
          ) : (
            <ul>
              {results.map((item) => {
                const picked = isSelected(getKey(item));
                return (
                  <li key={getKey(item)}>
                    <button
                      type="button"
                      disabled={picked}
                      onClick={() => pick(item)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-canvas disabled:cursor-default disabled:opacity-60 dark:hover:bg-white/5"
                    >
                      <div className="min-w-0">{renderItem(item)}</div>
                      {picked ? (
                        <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Plus className="w-4 h-4 shrink-0 text-text-body dark:text-white/70" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SelectionHeader({
  noun,
  count,
  onClear,
}: {
  noun: string;
  count: number;
  onClear: () => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-text-body dark:text-white/70">
      <span>
        {count === 0
          ? `Add 2–${MAX_ITEMS} ${noun}s to compare them side by side.`
          : count === 1
            ? `Add at least one more ${noun} to compare.`
            : `Comparing ${count} ${noun}s${count < MAX_ITEMS ? ` · ${MAX_ITEMS - count} more can be added` : ""}`}
      </span>
      {count > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-text-body underline-offset-4 hover:underline dark:text-white/70"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <Card className={`p-12 ${cardClass}`}>
      <div className="text-center">
        <Icon className="w-14 h-14 text-text-body/75 mx-auto mb-4 dark:text-white/65" />
        <h3 className="text-xl font-semibold text-text-heading dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-text-body dark:text-white/70 max-w-md mx-auto">
          {body}
        </p>
      </div>
    </Card>
  );
}

/** One row of the comparison table: a label cell plus one cell per column. */
function Row({
  label,
  hint,
  cells,
  best,
}: {
  label: string;
  hint?: string;
  cells: React.ReactNode[];
  best?: Set<number>;
}) {
  const labelContent = (
    <>
      {label}
      {hint && (
        <span className="mt-0.5 block text-xs font-normal text-text-body dark:text-white/60">
          {hint}
        </span>
      )}
    </>
  );
  return (
    <>
      {/* Phones: the label sits on its own line so the values get the full width. */}
      <tr className="border-t border-border dark:border-white/10 sm:hidden">
        <th
          scope="colgroup"
          colSpan={cells.length + 1}
          aria-hidden
          className="px-3 pt-3 pb-0 text-left text-sm font-medium text-text-heading dark:text-white"
        >
          <div className="sticky left-3 inline-block">{labelContent}</div>
        </th>
      </tr>
      <tr className="align-top sm:border-t sm:border-border sm:dark:border-white/10">
      {/* Stays in the grid on phones (zero width) so the value cells don't shift columns. */}
      <th
        scope="row"
        className="sticky left-0 z-10 bg-card p-0 text-left text-sm font-medium text-text-heading dark:bg-neutral-950 dark:text-white sm:p-4"
      >
        <div className="sr-only sm:not-sr-only">{labelContent}</div>
      </th>
      {cells.map((cell, i) => {
        const isBest = best?.has(i);
        return (
          <td
            key={i}
            className={`p-3 text-sm text-text-body dark:text-white/80 sm:p-4 ${
              isBest ? "bg-emerald-500/10" : ""
            }`}
          >
            <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
              <div className="min-w-0 grow">{cell}</div>
              {isBest && (
                <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white dark:bg-emerald-500 dark:text-black">
                  Best
                </span>
              )}
            </div>
          </td>
        );
      })}
      </tr>
    </>
  );
}

function SectionRow({ label, span }: { label: string; span: number }) {
  return (
    <tr className="border-t border-border dark:border-white/10">
      <th
        colSpan={span}
        scope="colgroup"
        className="bg-canvas px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-text-body dark:bg-white/5 dark:text-white/60 sm:px-4"
      >
        <div className="sticky left-3 inline-block sm:left-4">{label}</div>
      </th>
    </tr>
  );
}

function ComparisonTable({
  columns,
  children,
}: {
  columns: React.ReactNode[];
  children: React.ReactNode;
}) {
  return (
    <Card className={`overflow-hidden p-0 ${cardClass}`}>
      <div className="overflow-x-auto">
        {/* Fixed layout keeps the compared columns equal width; the min width
            makes extra columns scroll instead of squeezing on phones. */}
        <table
          className="w-full table-fixed border-collapse min-w-[calc(var(--cols)*150px)] sm:min-w-[calc(var(--cols)*200px_+_11rem)]"
          style={{ "--cols": columns.length } as React.CSSProperties}
        >
          <colgroup>
            <col className="w-0 sm:w-44" />
            {columns.map((_, i) => (
              <col key={i} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-card p-0 dark:bg-neutral-950 sm:p-4">
                <span className="sr-only">Measure</span>
              </th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className="p-3 text-left align-top font-normal sm:p-4"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Card>
  );
}

function ColumnHeader({
  title,
  subtitle,
  href,
  onRemove,
}: {
  title: string;
  subtitle?: string | null;
  href: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-[15px] font-semibold text-text-heading hover:underline underline-offset-4 dark:text-white sm:text-base"
        >
          {title}
          <ExternalLink className="hidden w-3.5 h-3.5 opacity-50 group-hover:opacity-100 sm:block" />
        </Link>
        {subtitle && (
          <p className="text-xs text-text-body line-clamp-2 break-words dark:text-white/70 sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
      <Button
        size="icon"
        variant="outline"
        onClick={onRemove}
        aria-label={`Remove ${title}`}
        className="h-7 w-7 shrink-0 sm:h-8 sm:w-8 border-border hover:bg-button-hover dark:border-white/15 dark:bg-black/20 dark:text-white/80 dark:hover:bg-black/35"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

function GradeBar({ distribution }: { distribution: GradeDistribution }) {
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-canvas dark:bg-white/10">
        {GRADES.map((g) =>
          distribution[g] > 0 ? (
            <div
              key={g}
              className={GRADE_COLORS[g]}
              style={{ width: `${distribution[g]}%` }}
              title={`${g}: ${distribution[g].toFixed(0)}%`}
            />
          ) : null
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {GRADES.map((g) => (
          <div key={g} className="flex items-center gap-1 whitespace-nowrap">
            <span className={`h-2 w-2 rounded-full ${GRADE_COLORS[g]}`} />
            <span className="text-text-body dark:text-white/70">
              {g} {distribution[g].toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RatingValue({
  rating,
  reviews,
}: {
  rating: number | null | undefined;
  reviews?: number;
}) {
  if (rating === null || rating === undefined) return <Muted>No reviews</Muted>;
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="w-4 h-4 text-[#FFCF3F] fill-current" />
      <span className="font-semibold text-text-heading dark:text-white">
        {rating.toFixed(1)}
      </span>
      {reviews !== undefined && (
        <span className="text-xs text-text-body dark:text-white/60">
          ({reviews} review{reviews === 1 ? "" : "s"})
        </span>
      )}
    </span>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span className="text-text-body/70 dark:text-white/45">{children}</span>;
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-base font-semibold text-text-heading dark:text-white">
      {children}
    </span>
  );
}

function SkeletonColumns({ count }: { count: number }) {
  return (
    <Card className={`p-8 ${cardClass}`}>
      <div className="flex items-center justify-center gap-3 text-text-body dark:text-white/70">
        <Loader2 className="w-5 h-5 animate-spin text-[#FFCF3F]" />
        Loading {count} item{count === 1 ? "" : "s"}...
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

const searchCourses = (term: string) => getCourses({ search: term, limit: 20 });

function CourseComparison() {
  const {
    selectedCourses,
    addCourse,
    removeCourse,
    clearAll,
    isSelected,
  } = useComparison();

  // Details are cached by id so adding a course only fetches that course.
  const [details, setDetails] = useState<Record<string, CourseDetail>>({});
  const [failed, setFailed] = useState<Record<string, string>>({});

  useEffect(() => {
    const missing = selectedCourses.filter((id) => !details[id] && !failed[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.allSettled(missing.map((id) => getCourseDetail(id))).then(
      (results) => {
        if (cancelled) return;
        const loaded: Record<string, CourseDetail> = {};
        const errors: Record<string, string> = {};
        results.forEach((r, i) => {
          if (r.status === "fulfilled") loaded[missing[i]] = r.value;
          else
            errors[missing[i]] =
              r.reason instanceof Error ? r.reason.message : "Failed to load";
        });
        setDetails((prev) => ({ ...prev, ...loaded }));
        setFailed((prev) => ({ ...prev, ...errors }));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [selectedCourses, details, failed]);

  const loadedIds = useMemo(
    () => selectedCourses.filter((id) => details[id]),
    [selectedCourses, details]
  );
  const courses = useMemo(
    () => loadedIds.map((id) => details[id]),
    [loadedIds, details]
  );
  const summaries = useMemo(() => courses.map(summarizeCourse), [courses]);
  const pending = selectedCourses.filter((id) => !details[id] && !failed[id]);
  const failedIds = selectedCourses.filter((id) => failed[id]);

  const span = courses.length + 1;

  return (
    <div className="space-y-6">
      <div>
        <SearchPicker<Course>
          placeholder="Search courses by code or name, e.g. CSCE 310 or Database"
          search={searchCourses}
          getKey={(c) => c.id}
          selectedCount={selectedCourses.length}
          isSelected={isSelected}
          onPick={(c) => addCourse(c.id)}
          renderItem={(c) => (
            <>
              <div className="font-medium text-text-heading dark:text-white">
                {c.code}
                <span className="ml-2 text-xs font-normal text-text-body dark:text-white/60">
                  {c.avgGPA > 0 ? `GPA ${c.avgGPA.toFixed(2)}` : ""}
                </span>
              </div>
              <div className="text-sm text-text-body truncate dark:text-white/70">
                {c.name}
              </div>
            </>
          )}
        />
        <SelectionHeader
          noun="course"
          count={selectedCourses.length}
          onClear={() => {
            clearAll();
            setFailed({});
          }}
        />
      </div>

      {failedIds.length > 0 && (
        <Card className={`p-4 ${cardClass}`}>
          <div className="flex flex-wrap items-center gap-2 text-sm text-red-700 dark:text-red-300">
            Couldn&apos;t load {failedIds.join(", ")}.
            {failedIds.map((id) => (
              <Button
                key={id}
                size="sm"
                variant="outline"
                onClick={() => removeCourse(id)}
                className="h-7 border-border dark:border-white/15 dark:bg-black/20"
              >
                Remove {id}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {selectedCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Pick the courses you're deciding between"
          body="You'll see GPA, grade breakdown, difficulty, student ratings, prerequisites and who teaches each one, side by side."
        />
      ) : courses.length === 0 && pending.length > 0 ? (
        <SkeletonColumns count={pending.length} />
      ) : courses.length > 0 ? (
        <>
          {pending.length > 0 && (
            <p className="flex items-center gap-2 text-sm text-text-body dark:text-white/70">
              <Loader2 className="w-4 h-4 animate-spin text-[#FFCF3F]" />
              Loading {pending.join(", ")}...
            </p>
          )}
          <ComparisonTable
            columns={courses.map((c, i) => (
              <ColumnHeader
                key={loadedIds[i]}
                title={c.code}
                subtitle={c.name}
                href={`/course/${loadedIds[i]}`}
                onRemove={() => removeCourse(loadedIds[i])}
              />
            ))}
          >
            <SectionRow label="Grades" span={span} />
            <Row
              label="Average GPA"
              hint={
                courses.some((c) => c.gpaScope === "recent")
                  ? "Last 4 semesters"
                  : undefined
              }
              best={bestIndices(
                courses.map((c) => (c.avgGPA > 0 ? c.avgGPA : null)),
                "max"
              )}
              cells={courses.map((c) =>
                c.avgGPA > 0 ? (
                  <Strong>{c.avgGPA.toFixed(2)}</Strong>
                ) : (
                  <Muted>No grade data</Muted>
                )
              )}
            />
            <Row
              label="Grade breakdown"
              hint="Averaged across professors"
              best={bestIndices(
                summaries.map((s) => s.distribution?.A ?? null),
                "max"
              )}
              cells={summaries.map((s) =>
                s.distribution ? (
                  <GradeBar distribution={s.distribution} />
                ) : (
                  <Muted>No grade data</Muted>
                )
              )}
            />
            <Row
              label="Difficulty"
              best={bestIndices(
                courses.map((c) => DIFFICULTY_ORDER[c.difficulty] ?? null),
                "min"
              )}
              cells={courses.map((c) =>
                DIFFICULTY_ORDER[c.difficulty] ? (
                  <Strong>{c.difficulty}</Strong>
                ) : (
                  <Muted>Unknown</Muted>
                )
              )}
            />

            <SectionRow label="Student opinion" span={span} />
            <Row
              label="Student rating"
              hint="Professor reviews for this course"
              best={bestIndices(
                summaries.map((s) => s.rating),
                "max"
              )}
              cells={summaries.map((s) => (
                <RatingValue rating={s.rating} reviews={s.ratingReviews} />
              ))}
            />
            <Row
              label="Professors"
              hint="Rating in this course · GPA"
              cells={summaries.map((s, i) =>
                s.professors.length === 0 ? (
                  <Muted>No professor data</Muted>
                ) : (
                  <ul className="space-y-2">
                    {s.professors.slice(0, 5).map((p) => {
                      const gpa = p.distribution
                        ? gpaFromDistribution(p.distribution)
                        : null;
                      return (
                        <li key={p.name} className="leading-tight">
                          {p.id ? (
                            <Link
                              href={`/professor/${p.id}`}
                              className="font-medium text-text-heading hover:underline underline-offset-4 dark:text-white"
                            >
                              {p.name}
                            </Link>
                          ) : (
                            <span className="font-medium text-text-heading dark:text-white">
                              {p.name}
                            </span>
                          )}
                          <div className="flex flex-wrap items-center gap-x-3 text-xs text-text-body dark:text-white/65">
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-3 h-3 text-[#FFCF3F] fill-current" />
                              {p.rating !== null
                                ? `${p.rating.toFixed(1)} (${p.reviews})`
                                : "No reviews"}
                            </span>
                            {gpa !== null && <span>GPA {gpa.toFixed(2)}</span>}
                          </div>
                        </li>
                      );
                    })}
                    {s.professors.length > 5 && (
                      <li>
                        <Link
                          href={`/course/${loadedIds[i]}`}
                          className="text-xs text-text-body underline underline-offset-4 dark:text-white/65"
                        >
                          +{s.professors.length - 5} more
                        </Link>
                      </li>
                    )}
                  </ul>
                )
              )}
            />

            <SectionRow label="Logistics" span={span} />
            <Row
              label="Credits"
              cells={courses.map((c) => (
                <>
                  <Strong>{c.credits}</Strong>
                  {Boolean(c.lectureHours || c.labHours) && (
                    <span className="ml-2 text-xs text-text-body dark:text-white/60">
                      {[
                        c.lectureHours ? `${c.lectureHours} lecture` : null,
                        c.labHours ? `${c.labHours} lab` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}{" "}
                      hrs/wk
                    </span>
                  )}
                </>
              ))}
            />
            <Row
              label="Sections"
              hint={
                formatTermCode(courses.find((c) => c.sectionsTermCode)?.sectionsTermCode) ??
                undefined
              }
              best={bestIndices(
                courses.map((c) => c.sections ?? null),
                "max"
              )}
              cells={courses.map((c) =>
                c.sections ? (
                  <Strong>{c.sections}</Strong>
                ) : (
                  <Muted>None listed</Muted>
                )
              )}
            />
            <Row
              label="Enrollment"
              hint="Students per year"
              cells={courses.map((c) =>
                c.enrollment ? (
                  <>
                    <Strong>{c.enrollment.toLocaleString()}</Strong>
                    {c.enrollmentYear && (
                      <span className="ml-2 text-xs text-text-body dark:text-white/60">
                        {c.enrollmentYear}
                      </span>
                    )}
                  </>
                ) : (
                  <Muted>Unknown</Muted>
                )
              )}
            />
            <Row
              label="Prerequisites"
              cells={courses.map((c) => {
                const prereqs = prerequisiteGroups(c);
                if (!prereqs)
                  return (
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">
                      None
                    </span>
                  );
                if (typeof prereqs === "string") return <span>{prereqs}</span>;
                return (
                  <div className="flex flex-wrap items-center gap-1">
                    {prereqs.map((group, gi) => (
                      <React.Fragment key={gi}>
                        {gi > 0 && <span className="text-xs">and</span>}
                        {group.map((code, ci) => (
                          <React.Fragment key={code}>
                            {ci > 0 && <span className="text-xs">or</span>}
                            <Link href={`/course/${code.replace(/\s+/g, "")}`}>
                              <Badge
                                variant="outline"
                                className="border-border bg-canvas text-text-body hover:border-text-body dark:border-white/15 dark:bg-black/20 dark:text-white/80"
                              >
                                {code}
                              </Badge>
                            </Link>
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })}
            />
            <Row
              label="Description"
              cells={courses.map((c) =>
                c.description ? (
                  <p className="line-clamp-5">{c.description}</p>
                ) : (
                  <Muted>No description</Muted>
                )
              )}
            />
          </ComparisonTable>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Professors
// ---------------------------------------------------------------------------

const searchProfessors = (term: string) =>
  getProfessors({ search: term, limit: 20 });

function ProfessorComparison() {
  const {
    selectedProfessors,
    addProfessor,
    removeProfessor,
    clearAll,
    isSelected,
  } = useProfessorComparison();

  const [professors, setProfessors] = useState<ProfessorDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProfessors.length === 0) {
      setProfessors([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    compareProfessors(selectedProfessors)
      .then((data) => {
        if (cancelled) return;
        // Keep the order the professors were picked in.
        const byId = new Map(data.map((p) => [p.id, p]));
        setProfessors(
          selectedProfessors
            .map((id) => byId.get(id))
            .filter((p): p is ProfessorDetail => Boolean(p))
        );
        setError(null);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load professors"
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedProfessors]);

  // Courses at least two of the selected professors teach: the fairest
  // head-to-head, since it's the same class.
  const sharedCourses = useMemo(() => {
    const counts = new Map<string, { name: string | null; count: number }>();
    for (const p of professors) {
      for (const c of p.courses) {
        if (!c.course_id) continue;
        const entry = counts.get(c.course_id) ?? {
          name: c.course_name,
          count: 0,
        };
        entry.count += 1;
        counts.set(c.course_id, entry);
      }
    }
    return Array.from(counts.entries())
      .filter(([, v]) => v.count >= 2)
      .map(([id, v]) => ({ id, name: v.name }));
  }, [professors]);

  const span = professors.length + 1;
  const courseFor = (p: ProfessorDetail, id: string) =>
    p.courses.find((c) => c.course_id === id);

  return (
    <div className="space-y-6">
      <div>
        <SearchPicker<Professor>
          placeholder="Search professors by name"
          search={searchProfessors}
          getKey={(p) => p.id}
          selectedCount={selectedProfessors.length}
          isSelected={isSelected}
          onPick={(p) => addProfessor(p.id)}
          renderItem={(p) => (
            <>
              <div className="font-medium text-text-heading truncate dark:text-white">
                {p.name.replace(/\s+/g, " ")}
              </div>
              <div className="flex items-center gap-1 text-xs text-text-body dark:text-white/70">
                <Star className="w-3 h-3 text-[#FFCF3F] fill-current" />
                {p.overall_rating ? p.overall_rating.toFixed(1) : "No rating"} ·{" "}
                {p.total_reviews || 0} reviews
                {p.departments?.filter(Boolean).length
                  ? ` · ${p.departments.filter(Boolean).join(", ")}`
                  : ""}
              </div>
            </>
          )}
        />
        <SelectionHeader
          noun="professor"
          count={selectedProfessors.length}
          onClear={clearAll}
        />
      </div>

      {error ? (
        <Card className={`p-6 ${cardClass}`}>
          <p className="text-sm text-red-700 dark:text-red-300">
            Couldn&apos;t load professors: {error}
          </p>
        </Card>
      ) : selectedProfessors.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Pick the professors you're deciding between"
          body="You'll see ratings, would-take-again, GPA and ratings in the courses they share, what students say, and recent reviews."
        />
      ) : loading && professors.length === 0 ? (
        <SkeletonColumns count={selectedProfessors.length} />
      ) : (
        <ComparisonTable
          columns={professors.map((p) => (
            <ColumnHeader
              key={p.id}
              title={p.name.replace(/\s+/g, " ")}
              subtitle={p.departments?.filter(Boolean).join(", ")}
              href={`/professor/${p.id}`}
              onRemove={() => removeProfessor(p.id)}
            />
          ))}
        >
          <SectionRow label="Overall" span={span} />
          <Row
            label="Overall rating"
            best={bestIndices(
              professors.map((p) => p.overall_rating),
              "max"
            )}
            cells={professors.map((p) => (
              <RatingValue rating={p.overall_rating} reviews={p.total_reviews} />
            ))}
          />
          <Row
            label="Would take again"
            best={bestIndices(
              professors.map((p) => p.would_take_again_percent),
              "max"
            )}
            cells={professors.map((p) =>
              p.would_take_again_percent !== null &&
              p.would_take_again_percent !== undefined ? (
                <Strong>{p.would_take_again_percent.toFixed(0)}%</Strong>
              ) : (
                <Muted>Not enough data</Muted>
              )
            )}
          />
          {professors.some((p) => p.overallSummary?.tldr || p.overall_summary) && (
            <Row
              label="In short"
              hint="Summarized from reviews"
              cells={professors.map((p) =>
                p.overallSummary?.tldr || p.overall_summary ? (
                  <p className="line-clamp-5">
                    {p.overallSummary?.tldr || p.overall_summary}
                  </p>
                ) : (
                  <Muted>No summary yet</Muted>
                )
              )}
            />
          )}
          <Row
            label="Students like"
            cells={professors.map((p) =>
              p.overallSummary?.strengths?.length ? (
                <ul className="list-disc space-y-1 pl-4">
                  {p.overallSummary.strengths.slice(0, 3).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <Muted>—</Muted>
              )
            )}
          />
          <Row
            label="Complaints"
            cells={professors.map((p) =>
              p.overallSummary?.complaints?.length ? (
                <ul className="list-disc space-y-1 pl-4">
                  {p.overallSummary.complaints.slice(0, 3).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <Muted>—</Muted>
              )
            )}
          />

          {sharedCourses.length > 0 && (
            <>
              <SectionRow label="Courses they share" span={span} />
              {sharedCourses.map((course) => (
                <Row
                  key={course.id}
                  label={course.id.replace(/^([A-Z]+)(\d)/, "$1 $2")}
                  hint={course.name ?? undefined}
                  best={bestIndices(
                    professors.map((p) => courseFor(p, course.id)?.avg_rating),
                    "max"
                  )}
                  cells={professors.map((p) => {
                    const c = courseFor(p, course.id);
                    if (!c) return <Muted>Doesn&apos;t teach this</Muted>;
                    return (
                      <div className="space-y-0.5">
                        <RatingValue
                          rating={c.avg_rating}
                          reviews={c.reviews_count}
                        />
                        {typeof c.avg_gpa === "number" && (
                          <div className="text-xs">
                            GPA {c.avg_gpa.toFixed(2)}
                            {c.gpa_students ? ` · ${c.gpa_students} students` : ""}
                          </div>
                        )}
                      </div>
                    );
                  })}
                />
              ))}
            </>
          )}

          <SectionRow label="Teaching" span={span} />
          <Row
            label="Courses taught"
            cells={professors.map((p) =>
              p.courses.length === 0 ? (
                <Muted>None on record</Muted>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {p.courses
                    .filter((c) => c.course_id)
                    .sort((a, b) => b.reviews_count - a.reviews_count)
                    .slice(0, 8)
                    .map((c) => (
                      <Link key={c.course_id} href={`/course/${c.course_id}`}>
                        <Badge
                          variant="outline"
                          className="border-border bg-canvas text-text-body hover:border-text-body dark:border-white/15 dark:bg-black/20 dark:text-white/80"
                        >
                          {c.course_id.replace(/^([A-Z]+)(\d)/, "$1 $2")}
                          {c.avg_rating ? ` · ${c.avg_rating.toFixed(1)}` : ""}
                        </Badge>
                      </Link>
                    ))}
                  {p.courses.length > 8 && (
                    <span className="text-xs">+{p.courses.length - 8} more</span>
                  )}
                </div>
              )
            )}
          />
          {professors.some((p) => Object.keys(p.tag_frequencies ?? {}).length) && (
          <Row
            label="Top tags"
            cells={professors.map((p) => {
              const tags = Object.entries(p.tag_frequencies ?? {})
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);
              if (tags.length === 0) return <Muted>No tags</Muted>;
              return (
                <div className="flex flex-wrap gap-1">
                  {tags.map(([tag, n]) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-border bg-canvas text-text-body dark:border-white/15 dark:bg-black/20 dark:text-white/80"
                    >
                      {tag} ({n})
                    </Badge>
                  ))}
                </div>
              );
            })}
          />
          )}
          <Row
            label="Recent reviews"
            cells={professors.map((p) =>
              p.recent_reviews?.length ? (
                <div className="space-y-3">
                  {p.recent_reviews.slice(0, 2).map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border border-border bg-canvas p-3 dark:border-white/10 dark:bg-black/30"
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-x-2 text-xs">
                        <span className="inline-flex items-center gap-1 font-medium text-text-heading dark:text-white">
                          <Star className="w-3 h-3 text-[#FFCF3F] fill-current" />
                          {r.overall_rating !== null
                            ? r.overall_rating.toFixed(1)
                            : "—"}
                        </span>
                        {r.course_code && <span>{r.course_code}</span>}
                        {r.grade && r.grade !== "Not sure yet" && (
                          <span>Grade {r.grade}</span>
                        )}
                        {r.review_date && (
                          <span>
                            {new Date(r.review_date).toLocaleDateString(
                              undefined,
                              { month: "short", year: "numeric" }
                            )}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-4 text-sm">{r.review_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <Muted>No reviews</Muted>
              )
            )}
          />
        </ComparisonTable>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function ComparePageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "professors" ? "professors" : "courses";

  const tabs = [
    { value: "courses", label: "Courses", icon: BookOpen },
    { value: "professors", label: "Professors", icon: GraduationCap },
  ] as const;

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "var(--app-bg-gradient)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--app-bg-ambient)" }}
      />

      <Navigation variant="glass" />

      <main className="pt-20 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 text-xs text-text-body mb-6 dark:text-white/70">
            <Link href="/" className="hover:underline underline-offset-4">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-text-body/75 dark:text-white/65" />
            <span className="text-text-heading dark:text-white/90">Compare</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-text-heading dark:text-white text-[28px] sm:text-[34px] md:text-[40px] leading-tight font-semibold tracking-tight mb-3">
              Compare side by side
            </h1>
            <p className="text-text-body dark:text-white/80 text-[13px] sm:text-[14px] md:text-[15px] max-w-2xl mx-auto leading-relaxed">
              Pick up to {MAX_ITEMS} courses or professors. The best value in
              each row is highlighted.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="What to compare"
            className="mx-auto mb-6 grid max-w-md grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1 dark:bg-black/45 dark:border-white/15 dark:backdrop-blur-sm"
          >
            {tabs.map(({ value, label, icon: Icon }) => {
              const active = tab === value;
              return (
                <Link
                  key={value}
                  href={`/compare?tab=${value}`}
                  replace
                  scroll={false}
                  role="tab"
                  aria-selected={active}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#FFCF3F] text-[#0f0f0f] shadow-sm"
                      : "text-text-body hover:bg-canvas dark:text-white/75 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {tab === "courses" ? <CourseComparison /> : <ProfessorComparison />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen relative"
          style={{ background: "var(--app-bg-gradient)" }}
        >
          <Navigation variant="glass" />
          <main className="pt-32 pb-20 relative z-10 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFCF3F]" />
          </main>
          <Footer />
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
