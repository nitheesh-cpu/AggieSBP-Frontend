"use client";

import React, { useState, useEffect } from "react";
import {
  animate,
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getProfessors, type Professor } from "@/lib/api";
import {
  Search,
  Star,
  User,
  GraduationCap,
  BookOpen,
  Users,
  Building,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

function formatAnimatedNumber(n: number, decimals: number) {
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withCommas = Number(intPart).toLocaleString("en-US");
  return decimals > 0 ? `${withCommas}.${decPart}` : withCommas;
}

function formatCompactCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function CountUpNumber({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });

  const motionValue = useMotionValue(0);
  const [display, setDisplay] = React.useState(() =>
    formatAnimatedNumber(0, decimals)
  );

  React.useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      setDisplay(formatAnimatedNumber(value, decimals));
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 1.05,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        setDisplay(formatAnimatedNumber(latest, decimals));
      },
    });

    return () => controls.stop();
  }, [decimals, isInView, motionValue, shouldReduceMotion, value]);

  return <span ref={ref}>{display}</span>;
}

export default function ProfessorsPage() {
  const shouldReduceMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = React.useState(false);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3 * 8; // 3 columns × 4 rows

  // Get unique departments for filter dropdown
  const uniqueDepartments = Array.from(
    new Set(professors.flatMap((prof) => prof.departments))
  ).sort();

  // Ensure we only run "initial" enter animations once per mount.
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const loadProfessors = async () => {
      try {
        setLoading(true);
        const data = await getProfessors({ limit: 5000 }); // Get all professors
        setProfessors(data);
        setFilteredProfessors(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load professors"
        );
        console.error("Failed to load professors:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfessors();
  }, []);

  useEffect(() => {
    let filtered = professors;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((prof) =>
        prof.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter((prof) =>
        prof.departments.includes(departmentFilter)
      );
    }

    // Apply rating filter
    if (minRating !== null) {
      filtered = filtered.filter((prof) => prof.overall_rating >= minRating);
    }

    setFilteredProfessors(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, minRating, professors]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProfessors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfessors = filteredProfessors.slice(startIndex, endIndex);

  // Pagination helper functions
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const ratingValues = professors
    .map((p) => (typeof p.overall_rating === "number" ? p.overall_rating : 0))
    .filter((r) => r > 0);
  const averageRating =
    ratingValues.length > 0
      ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
      : 0;
  const totalReviews = professors.reduce(
    (sum, p) => sum + (p.total_reviews || 0),
    0
  );

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
          <div className="max-w-7xl mx-auto px-6">
            {/* Breadcrumbs */}
            <div className="flex items-center justify-center gap-2 text-xs text-text-body mb-8 dark:text-white/70">
              <span>Home</span>
              <ChevronRight className="w-4 h-4 text-text-body/60 dark:text-white/40" />
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 rounded-full border-2 border-[#500000]/25 bg-canvas pl-12 text-[14px] text-text-body shadow-sm transition-colors placeholder:text-text-body/60 hover:border-[#500000]/40 focus-visible:border-[#500000]/60 focus-visible:ring-2 focus-visible:ring-[#500000]/15 focus-visible:ring-offset-0 dark:border-white/25 dark:bg-black/45 dark:text-white dark:placeholder:text-white/40 dark:backdrop-blur-sm dark:hover:border-[#FFCF3F]/40 dark:focus-visible:border-[#FFCF3F]/60 dark:focus-visible:ring-[#FFCF3F]/20 sm:h-14 sm:text-[15px]"
                />
              </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
              <Card className="p-8 mb-12 bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                <div className="text-center text-text-body dark:text-white/70">
                  Loading professors...
                </div>
              </Card>
            )}

            {/* Error State */}
            {!loading && error && (
              <Card className="p-8 mb-12 bg-red-50 border-red-200">
                <div className="text-center text-red-700">
                  Error loading professors: {error}
                </div>
              </Card>
            )}

            {/* Statistics Overview */}
            {!loading && !error && (
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10"
                initial={shouldReduceMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 },
                  },
                }}
              >
                {[
                  {
                    label: "Professors",
                    value: professors.length,
                    decimals: 0,
                    icon: Users,
                  },
                  {
                    label: "Departments",
                    value: uniqueDepartments.length,
                    decimals: 0,
                    icon: Building,
                  },
                  {
                    label: "Total Reviews",
                    value: totalReviews,
                    decimals: 0,
                    icon: MessageSquare,
                  },
                  {
                    label: "Avg Rating",
                    value: averageRating,
                    decimals: 1,
                    icon: Star,
                  },
                ].map((s) => {
                  const StatIcon = s.icon;
                  return (
                    <motion.div
                      key={s.label}
                      variants={{
                        hidden: { opacity: 0, y: 14 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                      className="rounded-2xl border border-border bg-card px-4 py-4 dark:border-white/10 dark:bg-black/45 dark:backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-canvas border border-border flex items-center justify-center text-accent dark:bg-white/10 dark:border-white/10">
                          <StatIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-accent text-xl sm:text-2xl font-semibold tracking-tight">
                            <CountUpNumber
                              value={s.value}
                              decimals={s.decimals}
                            />
                          </div>
                          <div className="text-text-body text-xs sm:text-sm dark:text-white/80">
                            {s.label}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Filters */}
            {!loading && !error && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-4 h-12 bg-canvas border border-border rounded-xl text-text-body focus:outline-none dark:bg-black/45 dark:border-white/15 dark:text-white/90 dark:backdrop-blur-sm"
                  >
                    <option value="">All Departments</option>
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={minRating ?? ""}
                    onChange={(e) =>
                      setMinRating(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="w-full px-4 h-12 bg-canvas border border-border rounded-xl text-text-body focus:outline-none dark:bg-black/45 dark:border-white/15 dark:text-white/90 dark:backdrop-blur-sm"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3">3.0+ Stars</option>
                    <option value="2.5">2.5+ Stars</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Results Summary */}
            {!loading && !error && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-text-body text-sm dark:text-white/70">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredProfessors.length)} of{" "}
                  {filteredProfessors.length} professors
                  {filteredProfessors.length !== professors.length && (
                    <span className="text-text-body/70 dark:text-white/50">
                      {" "}
                      (filtered from {professors.length} total)
                    </span>
                  )}
                </p>
                {totalPages > 1 && (
                  <p className="text-sm text-text-body dark:text-white/70">
                    Page {currentPage} of {totalPages}
                  </p>
                )}
              </div>
            )}

            {/* Professor Grid */}
            {!loading && !error && (
              <motion.div
                key={`${currentPage}-${searchTerm}-${departmentFilter}-${minRating ?? ""}`}
                className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-3"
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
                layout
              >
                {currentProfessors.map((professor) => (
                  <motion.div
                    key={professor.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={
                      shouldReduceMotion
                        ? undefined
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            y: -2,
                            scale: 1.01,
                            transition: { duration: 0.18 },
                          }
                    }
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                  >
                    <Card className="group relative gap-0 overflow-hidden border-border bg-card p-4 transition-all duration-normal hover:border-[#500000]/25 hover:shadow-md dark:border-white/10 dark:bg-black/45 dark:backdrop-blur-sm dark:hover:border-[#FFCF3F]/25">
                      {/* subtle corner highlight */}
                      <motion.div
                        aria-hidden
                        className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#FFCF3F]/10 blur-2xl"
                        initial={false}
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.8] }
                        }
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />

                      <div className="relative mb-3 flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-canvas text-accent dark:border-white/10 dark:bg-white/10">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link href={`/professor/${professor.id}`} className="group/name">
                              <h3 className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-text-heading transition-colors group-hover/name:text-accent dark:text-white sm:text-xl">
                                {professor.name}
                              </h3>
                            </Link>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {professor.departments
                                .filter(Boolean)
                                .slice(0, 3)
                                .map((dept) => (
                                  <button
                                    type="button"
                                    key={dept}
                                    onClick={() => setDepartmentFilter(dept)}
                                    className="rounded-full border border-border bg-canvas px-2 py-0.5 text-[10px] font-medium text-text-body transition-colors hover:border-[#500000]/30 hover:text-[#500000] dark:border-white/15 dark:bg-black/20 dark:text-white/70 dark:hover:border-[#FFCF3F]/35 dark:hover:text-[#FFCF3F]"
                                  >
                                    {dept}
                                  </button>
                                ))}
                            </div>
                          </div>
                      </div>

                      <div className="relative grid grid-cols-3 divide-x divide-border/70 rounded-xl border border-border/70 bg-canvas/60 px-1 py-2.5 dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center justify-center gap-1 px-2">
                            <Star className="h-3.5 w-3.5 fill-current text-accent" />
                            <span className="text-base font-semibold tracking-tight text-text-heading dark:text-white">
                              {professor.overall_rating > 0
                                ? professor.overall_rating.toFixed(1)
                                : "—"}
                            </span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 px-2 text-xs text-text-body dark:text-white/60">
                          <MessageSquare className="h-3.5 w-3.5 text-accent" />
                          <span className="font-medium text-text-heading dark:text-white">
                            {formatCompactCount(professor.total_reviews)}
                          </span>
                          <span className="hidden xl:inline">reviews</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 px-2 text-xs text-text-body dark:text-white/60">
                          <BookOpen className="h-3.5 w-3.5 text-accent" />
                          <span className="font-medium text-text-heading dark:text-white">
                            {professor.courses_taught.length}
                          </span>
                          <span className="hidden xl:inline">courses</span>
                        </div>
                      </div>

                      <div className="relative mt-3 min-h-6">
                        <div className="flex flex-wrap gap-1">
                          {professor.courses_taught.slice(0, 3).map((course) => (
                            <span
                              key={course}
                              className="rounded-md bg-[#500000]/6 px-2 py-0.5 font-mono text-[11px] text-text-heading dark:bg-[#FFCF3F]/10 dark:text-white/75"
                            >
                              {course}
                            </span>
                          ))}
                          {professor.courses_taught.length > 3 && (
                            <span className="py-0.5 text-[11px] text-text-body/70 dark:text-white/45">
                              +{professor.courses_taught.length - 3} more
                            </span>
                          )}
                          {professor.courses_taught.length === 0 && (
                            <span className="text-xs text-text-body/65 dark:text-white/45">
                              No course history available
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
                ))}
              </motion.div>
            )}

            {/* No Results Message */}
            {!loading && !error && filteredProfessors.length === 0 && (
              <div className="text-center py-16">
                <GraduationCap className="w-16 h-16 text-text-body/50 mx-auto mb-4 dark:text-white/50" />
                <h3 className="text-2xl font-semibold text-text-heading dark:text-white mb-2">
                  No professors found
                </h3>
                <p className="text-text-body dark:text-white/70">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && totalPages > 1 && (
              <motion.div
                className="flex items-center justify-center gap-2 mt-8"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="border-border bg-canvas text-text-body hover:bg-button-hover dark:border-white/15 dark:bg-black/30 dark:text-white/80 dark:hover:bg-black/45"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(
                      1,
                      currentPage - Math.floor(maxVisiblePages / 2)
                    );
                    const endPage = Math.min(
                      totalPages,
                      startPage + maxVisiblePages - 1
                    );

                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    if (startPage > 1) {
                      pages.push(
                        <Button
                          key={1}
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(1)}
                          className="border-border bg-canvas text-text-body hover:bg-button-hover dark:border-white/15 dark:bg-black/30 dark:text-white/80 dark:hover:bg-black/45"
                        >
                          1
                        </Button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span
                            key="ellipsis1"
                            className="px-2 text-text-body/70 dark:text-white/60"
                          >
                            ...
                          </span>
                        );
                      }
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(i)}
                          className={
                            currentPage === i
                              ? "bg-[#FFCF3F] text-[#0f0f0f]"
                              : "border-border bg-canvas text-text-body hover:bg-button-hover dark:border-white/15 dark:bg-black/30 dark:text-white/80 dark:hover:bg-black/45"
                          }
                        >
                          {i}
                        </Button>
                      );
                    }

                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span
                            key="ellipsis2"
                            className="px-2 text-text-body/70 dark:text-white/60"
                          >
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <Button
                          key={totalPages}
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(totalPages)}
                          className="border-border bg-canvas text-text-body hover:bg-button-hover dark:border-white/15 dark:bg-black/30 dark:text-white/80 dark:hover:bg-black/45"
                        >
                          {totalPages}
                        </Button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="border-border bg-canvas text-text-body hover:bg-button-hover dark:border-white/15 dark:bg-black/30 dark:text-white/80 dark:hover:bg-black/45"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
