"use client";

import React, { useState, useEffect } from "react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import { Navigation } from "@/components/navigation";
import { PageBanner } from "@/components/page-banner";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getProfessors, type Professor } from "@/lib/api";
import { useOfficialSubjects } from "@/hooks/use-official-subjects";
import { track } from "@/lib/analytics";
import { useSearchTracking } from "@/lib/analytics-hooks";
import {
  Search,
  Star,
  User,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

function formatCompactCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function ProfessorsPage() {
  const shouldReduceMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = React.useState(false);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Server-side paging: ask for one extra row to know whether a next page exists.
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const itemsPerPage = 3 * 8; // 3 columns × 8 rows

  // Professors' RateMyProfessor course labels include free-text junk
  // ("BBQCLASS", "206"), so only official subjects are shown.
  const { subjects: departments, codes: officialCodes } = useOfficialSubjects();

  // Ensure we only run "initial" enter animations once per mount.
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Debounce typing so each keystroke doesn't hit the API.
  useEffect(() => {
    const id = window.setTimeout(() => setSearchTerm(searchInput.trim()), 300);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, minRating]);

  useEffect(() => {
    let cancelled = false;
    const loadProfessors = async () => {
      try {
        setLoading(true);
        const data = await getProfessors({
          search: searchTerm || undefined,
          department: departmentFilter || undefined,
          min_rating: minRating ?? undefined,
          limit: itemsPerPage + 1,
          skip: (currentPage - 1) * itemsPerPage,
        });
        if (cancelled) return;
        setHasNextPage(data.length > itemsPerPage);
        setProfessors(data.slice(0, itemsPerPage));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load professors"
        );
        console.error("Failed to load professors:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfessors();
    return () => {
      cancelled = true;
    };
  }, [searchTerm, departmentFilter, minRating, currentPage, itemsPerPage]);

  // The API has no total, so this is a lower bound when there's a next page.
  useSearchTracking(
    "professors",
    searchInput,
    (currentPage - 1) * itemsPerPage + professors.length,
    loading || searchInput.trim() !== searchTerm || !!error,
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, page));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const trackPick = (index: number) => {
    if (!searchTerm) return;
    track("search-pick", {
      from: "professors",
      position: (currentPage - 1) * itemsPerPage + index + 1,
    });
  };

  const realDepartments = (prof: Professor) =>
    officialCodes.size === 0
      ? []
      : prof.departments.filter((d) => d && officialCodes.has(d));

  // Keep codes that look like real courses ("CSCE402") and space them out.
  const realCourses = (prof: Professor) =>
    prof.courses_taught
      .filter((c) => {
        const m = /^([A-Z]{3,4})(\d{3})$/.exec(c);
        return !!m && (officialCodes.size === 0 || officialCodes.has(m[1]));
      })
      .map((c) => c.replace(/^([A-Z]+)(\d+)$/, "$1 $2"));

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="min-h-screen relative"
        style={{
          background: "var(--app-bg-gradient)",
        }}
      >

        <Navigation variant="glass" />

        <PageBanner
          title="Professors"
          subtitle={<>Ratings, review summaries and course history for Texas A&amp;M instructors</>}
        >
          <div className="relative">
            <Search strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-[18px] h-[18px]" />
            <Input
              placeholder="Search by name"
              aria-label="Search professors by name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-12 rounded-xl border border-transparent bg-card shadow-lg pl-12 text-base text-text-heading transition-colors placeholder:text-text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
            />
          </div>
        </PageBanner>

        <main className="pt-10 pb-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="professor-department" className="sr-only">
                  Department
                </label>
                <select
                  id="professor-department"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 h-10 bg-card border border-border rounded-lg text-sm text-text-heading"
                >
                  <option value="">All departments</option>
                  {departments.map((dept) => (
                    <option key={dept.code} value={dept.code}>
                      {dept.code} – {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="professor-rating" className="sr-only">
                  Minimum rating
                </label>
                <select
                  id="professor-rating"
                  value={minRating ?? ""}
                  onChange={(e) =>
                    setMinRating(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-3 h-10 bg-card border border-border rounded-lg text-sm text-text-heading"
                >
                  <option value="">Any rating</option>
                  <option value="4">4.0 and up</option>
                  <option value="3.5">3.5 and up</option>
                  <option value="3">3.0 and up</option>
                  <option value="2.5">2.5 and up</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <p className="text-text-body text-sm">
                {loading
                  ? "Loading professors"
                  : professors.length === 0
                    ? "No matches"
                    : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${(currentPage - 1) * itemsPerPage + professors.length}, most-reviewed first`}
              </p>
              {(currentPage > 1 || hasNextPage) && (
                <p className="text-sm text-text-body">
                  Page {currentPage}
                </p>
              )}
            </div>

            {/* Error State */}
            {!loading && error && (
              <Card className="p-8 mb-12 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-500/30">
                <div className="text-center text-red-700 dark:text-red-200">
                  Couldn&apos;t load professors. Please try again in a moment.
                </div>
              </Card>
            )}

            {/* Professor Grid */}
            {!error && (
              <motion.div
                key={`${currentPage}-${searchTerm}-${departmentFilter}-${minRating ?? ""}`}
                className={`mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-3 transition-opacity ${loading ? "opacity-50" : ""}`}
                initial={
                  shouldReduceMotion ? false : hasMounted ? false : "hidden"
                }
                animate="visible"
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.04 },
                  },
                }}
              >
                {professors.map((professor, i) => {
                  const depts = realDepartments(professor);
                  const courses = realCourses(professor);
                  return (
                    <motion.div
                      key={professor.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <Card className="group relative h-full gap-0 overflow-clip border-border bg-card p-0 shadow-none transition-colors duration-150 hover:border-maroon-edge">
                        {/* Header: name, departments and the rating */}
                        <div className="flex items-start gap-3 px-5 pt-5">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-raised font-mono text-sm text-text-body">
                            {professor.name
                              .split(" ")
                              .map((n) => n[0] || "")
                              .join("")
                              .slice(0, 2)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/professor/${professor.id}`}
                              onClick={() => trackPick(i)}
                              className="group/name"
                            >
                              <h3 className="line-clamp-1 text-base font-medium leading-6 text-text-heading underline-offset-4 group-hover/name:underline">
                                {professor.name}
                              </h3>
                            </Link>
                            {depts.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {depts.slice(0, 3).map((dept) => (
                                  <button
                                    type="button"
                                    key={dept}
                                    onClick={() => setDepartmentFilter(dept)}
                                    title={`Show ${dept} professors`}
                                    className="h-5 rounded border border-border px-1.5 font-mono text-[11px] text-text-muted transition-colors duration-150 hover:border-border-strong hover:text-text-heading"
                                  >
                                    {dept}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-end">
                            <span className="font-mono text-base leading-6 text-accent">
                              {professor.overall_rating ? professor.overall_rating.toFixed(1) : "—"}
                              {professor.overall_rating ? (
                                <span className="text-xs text-text-muted">/5</span>
                              ) : null}
                            </span>
                            <span className="text-[11px] text-text-muted">rating</span>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                        {/* Rating meter on the 1-5 scale */}
                        <div className="relative h-1.5 overflow-hidden rounded-full bg-raised">
                          {professor.overall_rating ? (
                            <span
                              className="absolute inset-y-0 left-0 rounded-full bg-accent"
                              style={{ width: `${(professor.overall_rating / 5) * 100}%` }}
                            />
                          ) : null}
                        </div>

                        <dl className="relative mt-4 grid grid-cols-2 gap-3">
                          <div className="flex flex-col-reverse">
                            <dd className="mt-1 font-mono text-base text-text-heading">
                              {formatCompactCount(professor.total_reviews)}
                            </dd>
                            <dt className="text-xs text-text-muted">Reviews</dt>
                          </div>
                          <div className="flex flex-col-reverse">
                            <dd className="mt-1 font-mono text-base text-text-heading">
                              {courses.length}
                            </dd>
                            <dt className="text-xs text-text-muted">
                              {courses.length === 1 ? "Course" : "Courses"}
                            </dt>
                          </div>
                        </dl>

                        <div className="relative mb-4 mt-4 min-h-6">
                          <div className="flex flex-wrap items-center gap-1">
                            {courses.slice(0, 3).map((course) => (
                              <span
                                key={course}
                                className="code-tag"
                              >
                                {course}
                              </span>
                            ))}
                            {courses.length > 3 && (
                              <span className="py-0.5 text-xs text-text-body">
                                +{courses.length - 3} more
                              </span>
                            )}
                            {courses.length === 0 && (
                              <span className="text-xs text-text-body">
                                No course history yet
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="relative mt-auto border-t border-border pt-3">
                          <Link
                            href={`/professor/${professor.id}`}
                            onClick={() => trackPick(i)}
                            className="inline-flex items-center gap-1 text-sm text-text-body transition-colors duration-150 hover:text-text-heading"
                          >
                            View profile
                            <ChevronRight strokeWidth={1.5} className="h-4 w-4" />
                          </Link>
                        </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* No Results Message */}
            {!loading && !error && professors.length === 0 && (
              <div className="text-center py-16">
                <GraduationCap className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-2xl font-medium text-text-heading mb-2">
                  No professors found
                </h3>
                <p className="text-text-body">
                  Check the spelling, or clear the department and rating
                  filters.
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {!error && (currentPage > 1 || hasNextPage) && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="border-border bg-canvas text-text-body hover:bg-button-hover dark:bg-card dark:hover:bg-raised"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-text-body">
                  Page {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!hasNextPage || loading}
                  className="border-border bg-canvas text-text-body hover:bg-button-hover dark:bg-card dark:hover:bg-raised"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
