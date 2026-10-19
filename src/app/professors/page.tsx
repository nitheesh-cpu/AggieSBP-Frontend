"use client";

import React, { useState, useEffect } from "react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getProfessors, type Professor } from "@/lib/api";
import { useOfficialSubjects } from "@/hooks/use-official-subjects";
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

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, page));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        {/* Ambient background */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            background: "var(--app-bg-ambient)",
          }}
        />

        <Navigation variant="glass" />

        <main className="pt-20 pb-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Breadcrumbs */}
            <div className="flex items-center justify-center gap-2 text-xs text-text-body mb-8 dark:text-white/70">
              <span>Home</span>
              <ChevronRight className="w-4 h-4 text-text-body/75 dark:text-white/65" />
              <span className="text-text-heading dark:text-white/90">
                Professors
              </span>
            </div>

            {/* Header */}
            <motion.div
              className="text-center mb-12"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-text-heading dark:text-white text-[28px] sm:text-[34px] md:text-[42px] leading-tight font-semibold tracking-tight mb-4">
                Browse Professors
              </h1>
              <p className="text-text-body dark:text-white/80 text-[13px] sm:text-[14px] md:text-[15px] max-w-2xl mx-auto mb-8 leading-relaxed">
                Discover Texas A&M professors, compare their ratings, and find
                the best instructors for your courses.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-body w-5 h-5 dark:text-white/60" />
                <Input
                  placeholder="Search professors by name..."
                  aria-label="Search professors by name"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-12 rounded-full border-2 border-[#500000]/25 bg-canvas pl-12 text-[14px] text-text-body shadow-sm transition-colors placeholder:text-text-body/75 hover:border-[#500000]/40 focus-visible:border-[#500000]/60 focus-visible:ring-2 focus-visible:ring-[#500000]/15 focus-visible:ring-offset-0 dark:border-white/25 dark:bg-black/45 dark:text-white dark:placeholder:text-white/65 dark:backdrop-blur-sm dark:hover:border-[#FFCF3F]/40 dark:focus-visible:border-[#FFCF3F]/60 dark:focus-visible:ring-[#FFCF3F]/20 sm:h-14 sm:text-[15px]"
                />
              </div>
            </motion.div>

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
                  className="w-full px-4 h-12 bg-canvas border border-border rounded-xl text-text-body focus:outline-none dark:bg-black/45 dark:border-white/15 dark:text-white/90 dark:backdrop-blur-sm"
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
                  className="w-full px-4 h-12 bg-canvas border border-border rounded-xl text-text-body focus:outline-none dark:bg-black/45 dark:border-white/15 dark:text-white/90 dark:backdrop-blur-sm"
                >
                  <option value="">Any rating</option>
                  <option value="4">4.0+ stars</option>
                  <option value="3.5">3.5+ stars</option>
                  <option value="3">3.0+ stars</option>
                  <option value="2.5">2.5+ stars</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <p className="text-text-body text-sm dark:text-white/75">
                {loading
                  ? "Loading professors…"
                  : professors.length === 0
                    ? "No matches"
                    : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${(currentPage - 1) * itemsPerPage + professors.length}, most-reviewed first`}
              </p>
              {(currentPage > 1 || hasNextPage) && (
                <p className="text-sm text-text-body dark:text-white/75">
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
                {professors.map((professor) => {
                  const depts = realDepartments(professor);
                  const courses = realCourses(professor);
                  return (
                    <motion.div
                      key={professor.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : { y: -2, transition: { duration: 0.18 } }
                      }
                    >
                      <Card className="group relative h-full gap-0 overflow-clip border-border bg-card p-4 transition-all duration-normal hover:border-[#500000]/25 hover:shadow-md dark:border-white/10 dark:bg-black/45 dark:backdrop-blur-sm dark:hover:border-[#FFCF3F]/25">
                        <div className="relative mb-3 flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-canvas text-accent dark:border-white/10 dark:bg-white/10">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/professor/${professor.id}`}
                              className="group/name"
                            >
                              <h3 className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-text-heading transition-colors group-hover/name:text-accent dark:text-white sm:text-xl">
                                {professor.name}
                              </h3>
                            </Link>
                            {depts.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {depts.slice(0, 3).map((dept) => (
                                  <button
                                    type="button"
                                    key={dept}
                                    onClick={() => setDepartmentFilter(dept)}
                                    title={`Show ${dept} professors`}
                                    className="rounded-full border border-border bg-canvas px-2 py-0.5 text-[11px] font-medium text-text-body transition-colors hover:border-[#500000]/30 hover:text-[#500000] dark:border-white/15 dark:bg-black/20 dark:text-white/80 dark:hover:border-[#FFCF3F]/35 dark:hover:text-[#FFCF3F]"
                                  >
                                    {dept}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <dl className="relative grid grid-cols-3 divide-x divide-border/70 rounded-xl border border-border/70 bg-canvas/60 py-2 text-center dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
                          <div className="px-1">
                            <dd className="flex items-center justify-center gap-1 text-base font-semibold tracking-tight text-text-heading dark:text-white">
                              <Star className="h-3.5 w-3.5 fill-current text-accent" />
                              {professor.overall_rating
                                ? professor.overall_rating.toFixed(1)
                                : "—"}
                            </dd>
                            <dt className="text-[11px] text-text-body dark:text-white/70">
                              rating
                            </dt>
                          </div>
                          <div className="px-1">
                            <dd className="text-base font-semibold text-text-heading dark:text-white">
                              {formatCompactCount(professor.total_reviews)}
                            </dd>
                            <dt className="text-[11px] text-text-body dark:text-white/70">
                              reviews
                            </dt>
                          </div>
                          <div className="px-1">
                            <dd className="text-base font-semibold text-text-heading dark:text-white">
                              {courses.length}
                            </dd>
                            <dt className="text-[11px] text-text-body dark:text-white/70">
                              {courses.length === 1 ? "course" : "courses"}
                            </dt>
                          </div>
                        </dl>

                        <div className="relative mt-3 min-h-6">
                          <div className="flex flex-wrap gap-1">
                            {courses.slice(0, 3).map((course) => (
                              <span
                                key={course}
                                className="rounded-md bg-[#500000]/6 px-2 py-0.5 font-mono text-[11px] text-text-heading dark:bg-[#FFCF3F]/10 dark:text-white/80"
                              >
                                {course}
                              </span>
                            ))}
                            {courses.length > 3 && (
                              <span className="py-0.5 text-[11px] text-text-body dark:text-white/70">
                                +{courses.length - 3} more
                              </span>
                            )}
                            {courses.length === 0 && (
                              <span className="text-xs text-text-body dark:text-white/70">
                                No course history yet
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="relative mt-3 border-t border-border/60 pt-3 dark:border-white/10">
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="-ml-3 text-[#500000] hover:bg-[#500000]/7 hover:text-[#500000] dark:text-[#FFCF3F] dark:hover:bg-[#FFCF3F]/10 dark:hover:text-[#FFCF3F]"
                          >
                            <Link href={`/professor/${professor.id}`}>
                              View profile
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
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
                <GraduationCap className="w-16 h-16 text-text-body/75 mx-auto mb-4 dark:text-white/65" />
                <h3 className="text-2xl font-semibold text-text-heading dark:text-white mb-2">
                  No professors found
                </h3>
                <p className="text-text-body dark:text-white/75">
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
                  className="border-border bg-canvas text-text-body hover:bg-button-hover dark:border-white/15 dark:bg-black/30 dark:text-white/80 dark:hover:bg-black/45"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-text-body dark:text-white/75">
                  Page {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!hasNextPage || loading}
                  className="border-border bg-canvas text-text-body hover:bg-button-hover dark:border-white/15 dark:bg-black/30 dark:text-white/80 dark:hover:bg-black/45"
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
