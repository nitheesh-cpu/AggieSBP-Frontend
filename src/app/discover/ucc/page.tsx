"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { Navigation } from "@/components/navigation";
import { PageBanner } from "@/components/page-banner";
import { EasinessBadge, EasinessLegend } from "@/components/easiness";
import { pickDefaultTerm, sortTermsForMenu } from "@/lib/terms";
import type { Term as ApiTerm } from "@/lib/api";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Loader2,
  BookOpen,
  GraduationCap,
  Star,
  ChevronDown,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { track } from "@/lib/analytics";
import { useEmptyStateTracking } from "@/lib/use-empty-state-tracking";

interface Term {
  termCode: string;
  termDesc: string;
}

interface Professor {
  id: string;
  firstName: string;
  lastName: string;
  avgRating: number;
  avgDifficulty: number;
  totalRatings: number;
  tags: string[];
  avgGpa: number | null;
  percentAB: number | null;
  gpaStudentCount: number | null;
}

interface Course {
  dept: string;
  courseNumber: string;
  courseTitle: string;
  credits: string;
  professor?: Professor;
  easinessScore: number;
  confidenceScore: number;
}

interface UCCCategory {
  category: string;
  courses: Course[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

// Map to keep track of how many courses are shown per category
type ExpandedState = Record<string, number>;

const INITIAL_COURSES_SHOWN = 6;
const COURSES_INCREMENT = 6;

type SortKey = "easiness" | "gpa" | "ab" | "rating";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "easiness", label: "Easiness Score" },
  { value: "gpa", label: "Avg GPA" },
  { value: "ab", label: "A/B Rate" },
  { value: "rating", label: "Prof Rating" },
];

type SeatFilter = "any" | "open" | "full";

const DEFAULT_SEAT_FILTER: SeatFilter = "open";

interface FilterOptions {
  campuses: string[];
  sectionTypes: string[];
}

const CAMPUS_SELECT_ANY = "__ucc_campus_any__";

const trackFilter = (filter: string) =>
  track("discover-filter", { page: "ucc", filter });

export default function UCCDiscoveryPage() {
  return (
    <React.Suspense>
      <UCCDiscoveryContent />
    </React.Suspense>
  );
}

function UCCDiscoveryContent() {
  const group = useSearchParams().get("group")?.toUpperCase();
  const shouldReduceMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [uccData, setUccData] = useState<UCCCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [fetchingTerms, setFetchingTerms] = useState<boolean>(true);
  const [expandedState, setExpandedState] = useState<ExpandedState>({});
  const [sortKey, setSortKey] = useState<SortKey>("easiness");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    campuses: [],
    sectionTypes: [],
  });
  const [campus, setCampus] = useState("");
  const [seatFilter, setSeatFilter] = useState<SeatFilter>(DEFAULT_SEAT_FILTER);
  const [sectionTypes, setSectionTypes] = useState<string[]>([]);
  const [sectionTypeSearch, setSectionTypeSearch] = useState("");
  const visibleCategories = uccData.filter(
    ({ category, courses }) =>
      courses.length > 0 && (!group || category.endsWith(`(${group})`)),
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEmptyStateTracking(
    "ucc",
    !loading && !loadFailed && !!selectedTerm && visibleCategories.length === 0,
  );

  const filteredSectionTypeOptions = useMemo(() => {
    const q = sectionTypeSearch.trim().toLowerCase();
    if (!q) return filterOptions.sectionTypes;
    return filterOptions.sectionTypes.filter((t) => t.toLowerCase().includes(q));
  }, [filterOptions.sectionTypes, sectionTypeSearch]);

  // Anything narrowing results (drives the empty-state hint)
  const hasActiveFilters =
    campus !== "" || seatFilter !== "any" || sectionTypes.length > 0;
  // Anything changed from the defaults (drives the reset button)
  const filtersChanged =
    campus !== "" || seatFilter !== DEFAULT_SEAT_FILTER || sectionTypes.length > 0;

  // Fetch terms on mount
  useEffect(() => {
    async function fetchTerms() {
      try {
        const res = await fetch(`${API_BASE_URL}/terms`);
        if (!res.ok) throw new Error("Failed to fetch terms");
        const data = await res.json();
        setTerms(data);
        // Open on the term students are registering for, not an empty page.
        const initial = pickDefaultTerm(data as ApiTerm[]);
        if (initial) handleTermChange(initial);
      } catch (error) {
        console.error("Error fetching terms:", error);
      } finally {
        setFetchingTerms(false);
      }
    }
    fetchTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Campus and section-type options depend on the term; seat filter carries over.
  const handleTermChange = (termCode: string) => {
    setSelectedTerm(termCode);
    setCampus("");
    setSectionTypes([]);
    setSectionTypeSearch("");
  };

  // Fetch filter options when term changes
  useEffect(() => {
    if (!selectedTerm) return;
    const controller = new AbortController();
    setFilterOptions({ campuses: [], sectionTypes: [] });
    fetch(`${API_BASE_URL}/discover/${selectedTerm}/ucc-filter-options`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch UCC filter options");
        return res.json();
      })
      .then((data: Partial<FilterOptions> | null) =>
        // An older backend answers with something else (or []); treat that as "no options".
        setFilterOptions({
          campuses: Array.isArray(data?.campuses) ? data.campuses : [],
          sectionTypes: Array.isArray(data?.sectionTypes) ? data.sectionTypes : [],
        }),
      )
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error("Error fetching UCC filter options:", error);
        }
      });
    return () => controller.abort();
  }, [selectedTerm]);

  // Fetch UCC data when term or filters change
  useEffect(() => {
    if (!selectedTerm) return;
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (campus) params.set("campus", campus);
    if (seatFilter !== "any") params.set("seats", seatFilter);
    sectionTypes.forEach((t) => params.append("section_type", t));
    const query = params.toString();

    setLoading(true);
    setLoadFailed(false);
    setUccData([]);
    setExpandedState({});

    fetch(`${API_BASE_URL}/discover/${selectedTerm}/ucc${query ? `?${query}` : ""}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch UCC data");
        return res.json();
      })
      .then((data: UCCCategory[]) => {
        setUccData(data);
        // Initialize expanded state for each category
        const initialExpanded: ExpandedState = {};
        data.forEach((cat) => {
          initialExpanded[cat.category] = INITIAL_COURSES_SHOWN;
        });
        setExpandedState(initialExpanded);
        setLoading(false);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Error fetching UCC data:", error);
        setLoadFailed(true);
        setLoading(false);
      });
    return () => controller.abort();
  }, [selectedTerm, campus, seatFilter, sectionTypes]);

  const handleViewMore = (category: string, totalCourses: number) => {
    setExpandedState((prev) => ({
      ...prev,
      [category]: Math.min((prev[category] || INITIAL_COURSES_SHOWN) + COURSES_INCREMENT, totalCourses),
    }));
  };

  const sortCourses = (courses: Course[]) =>
    [...courses].sort((a, b) => {
      switch (sortKey) {
        case "gpa":
          return (b.professor?.avgGpa ?? -1) - (a.professor?.avgGpa ?? -1);
        case "ab":
          return (b.professor?.percentAB ?? -1) - (a.professor?.percentAB ?? -1);
        case "rating":
          return (b.professor?.avgRating ?? -1) - (a.professor?.avgRating ?? -1);
        default:
          return b.easinessScore - a.easinessScore;
      }
    });

  return (
    <MotionConfig reducedMotion={shouldReduceMotion ? "always" : "never"}>
      <div
        className="min-h-screen relative"
        style={{ background: "var(--app-bg-gradient)" }}
      >
        {/* Ambient background gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--app-bg-ambient)" }}
        />

        <Navigation variant="glass" />

        <PageBanner
          title="University core curriculum"
          subtitle="The easiest professor-and-course options for each core curriculum (UCC) requirement, for the term you pick"
        />

        <main className="relative pt-10 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Header Section */}
            <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div />

              <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                <Select
                  onValueChange={(value) => {
                    if (value !== selectedTerm) trackFilter("term");
                    handleTermChange(value);
                  }}
                  value={selectedTerm}
                >
                  <SelectTrigger className="h-12 w-full bg-card/80 backdrop-blur-md border-border dark:bg-card dark:text-text-heading rounded-full px-5 shadow-sm transition-colors sm:w-72">
                    <SelectValue placeholder={fetchingTerms ? "Loading terms..." : "Select a Term"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card/80 backdrop-blur-md border-border dark:bg-card dark:text-text-heading rounded-full px-5 shadow-sm transition-colors">
                    <SelectGroup>
                      <SelectLabel>Available Terms</SelectLabel>
                      {(() => {
                        const { main, other } = sortTermsForMenu(terms as ApiTerm[]);
                        return [...main, ...other];
                      })().map((term) => (
                        <SelectItem key={term.termCode} value={term.termCode} className="hover:bg-card hover:dark:bg-card">
                          {term.termDesc}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) => {
                    if (value !== sortKey) trackFilter("sort");
                    setSortKey(value as SortKey);
                  }}
                  value={sortKey}
                >
                  <SelectTrigger className="h-12 w-full bg-card/80 backdrop-blur-md border-border dark:bg-card dark:text-text-heading rounded-full px-5 shadow-sm transition-colors sm:w-48">
                    <ArrowUpDown className="mr-1 h-4 w-4 shrink-0 text-text-muted" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-card dark:border-border dark:text-text-heading">
                    <SelectGroup>
                      <SelectLabel>Sort by</SelectLabel>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mascot & Legend Section - Always mounted so animation works */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 md:mb-15 flex flex-col md:flex-row items-center md:items-start justify-center gap-4"
            >
              {/* Reveille Avatar */}
              <motion.div
                className="relative group cursor-help shrink-0 z-20"
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/pixel-reveille.png"
                  alt="Reveille - The First Lady of Aggieland"
                  className="w-60 h-60 md:w-60 md:h-60 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </motion.div>

              {/* Speech Bubble - Consistent styling for all states */}
              <div className="relative w-full md:max-w-xl md:flex-1 lg:mt-8">
                <div className="bg-card border border-border-strong rounded-2xl p-5 relative">
                  {/* Speech bubble pointer - mobile (top, pointing up to Reveille) */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-popover border-t-2 border-l-2 border-primary transform rotate-45 md:hidden" />
                  {/* Speech bubble pointer - desktop (left side, pointing to Reveille) */}
                  <div className="absolute md:top-20 lg:top-14 -left-3 w-5 h-5 bg-popover border-b-2 border-l-2 border-primary transform rotate-45 hidden md:block" />

                  {loading ? (
                    // Loading State
                    <div className="flex items-center gap-4">
                      <Loader2 className="w-6 h-6 animate-spin text-primary shrink-0" />
                      <div>
                        <h3 className="font-medium text-lg leading-relaxed text-primary mb-1">
                          *sniff sniff*
                        </h3>
                        <p className="text-sm text-text-body dark:text-text-heading">
                          Fetching the <strong className="text-emerald-500">easiest</strong> courses for you...
                        </p>
                      </div>
                    </div>
                  ) : !selectedTerm ? (
                    // Intro State
                    <>
                      <h3 className="font-medium text-lg leading-relaxed text-primary mb-3">
                        Howdy
                      </h3>
                      <p className="text-sm text-text-body dark:text-text-heading">
                        I&apos;m <strong>Reveille</strong>! Pick a term above, and I&apos;ll fetch the <strong className="text-emerald-500 font-medium bg-emerald-500/10 px-1 rounded">EASIEST</strong> core curriculum courses for you.
                      </p>
                    </>
                  ) : (
                    // Metrics Legend (Active State)
                    <>
                      <h3 className="font-medium text-lg lg:text-xl leading-relaxed text-primary mb-4">
                        Here&apos;s what the numbers mean
                      </h3>
                      <EasinessLegend showAbRate />
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Section Filters */}
            {selectedTerm && (
              <Card className="mb-10 bg-white/55 dark:bg-card backdrop-blur-md border-border">
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                    <div className="flex items-center gap-2 text-text-heading lg:self-center">
                      <Filter strokeWidth={1.5} className="w-5 h-5 shrink-0 text-text-muted" />
                      <span className="text-sm font-medium">Refine by section</span>
                    </div>
                    {filterOptions.campuses.length > 1 && (
                      <div className="flex flex-col gap-1.5 min-w-[200px]">
                        <Label className="text-xs text-text-body">
                          Campus
                        </Label>
                        <Select
                          value={campus || CAMPUS_SELECT_ANY}
                          onValueChange={(v) => {
                            const next = v === CAMPUS_SELECT_ANY ? "" : v;
                            if (next !== campus) trackFilter("campus");
                            setCampus(next);
                          }}
                        >
                          <SelectTrigger className="h-9 w-full sm:w-[220px]">
                            <SelectValue placeholder="Any campus" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={CAMPUS_SELECT_ANY}>Any campus</SelectItem>
                            {filterOptions.campuses.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                      <Label className="text-xs text-text-body">
                        Seats
                      </Label>
                      <Select
                        value={seatFilter}
                        onValueChange={(v) => {
                          if (v !== seatFilter) trackFilter("seats");
                          setSeatFilter(v as SeatFilter);
                        }}
                      >
                        <SelectTrigger className="h-9 w-full sm:w-[240px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open seats only</SelectItem>
                          <SelectItem value="any">Include full sections</SelectItem>
                          <SelectItem value="full">Full sections only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-[220px]">
                      <Label className="text-xs text-text-body">
                        Section type (honors, online, …)
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-9 w-full sm:w-[260px] justify-between font-normal"
                            type="button"
                          >
                            <span className="truncate text-left">
                              {sectionTypes.length === 0
                                ? "Any type"
                                : `${sectionTypes.length} selected`}
                            </span>
                            <ChevronDown className="w-4 h-4 shrink-0 opacity-60" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[min(100vw-2rem,380px)] p-0" align="start">
                          <div className="p-2 border-b border-border">
                            <Input
                              placeholder="Search section types…"
                              value={sectionTypeSearch}
                              onChange={(e) => setSectionTypeSearch(e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <ScrollArea className="h-[min(50vh,280px)]">
                            <div className="p-2 space-y-1">
                              {filterOptions.sectionTypes.length === 0 && (
                                <p className="text-xs text-text-body dark:text-text-muted px-1 py-2">
                                  No section types listed for this term.
                                </p>
                              )}
                              {filteredSectionTypeOptions.map((type) => (
                                <label
                                  key={type}
                                  className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-black/5 dark:hover:bg-raised cursor-pointer"
                                >
                                  <Checkbox
                                    checked={sectionTypes.includes(type)}
                                    onCheckedChange={() => {
                                      trackFilter("section-type");
                                      setSectionTypes((prev) =>
                                        prev.includes(type)
                                          ? prev.filter((x) => x !== type)
                                          : [...prev, type],
                                      );
                                    }}
                                    className="mt-0.5"
                                  />
                                  <span className="text-xs leading-snug text-text-body">
                                    {type}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </ScrollArea>
                          {sectionTypes.length > 0 && (
                            <div className="p-2 border-t border-border">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-full text-xs"
                                onClick={() => {
                                  trackFilter("section-type");
                                  setSectionTypes([]);
                                }}
                              >
                                Clear section types
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                    {filtersChanged && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 text-xs"
                        onClick={() => {
                          trackFilter("reset");
                          setCampus("");
                          setSeatFilter(DEFAULT_SEAT_FILTER);
                          setSectionTypes([]);
                        }}
                      >
                        Reset filters
                      </Button>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-text-body">
                    A professor is listed if at least one of their sections matches. Picking
                    several section types shows sections that have any of them.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {group && (
              <Link href="/discover/ucc" className="mb-6 inline-block text-sm text-accent underline underline-offset-4">
                Show all core curriculum groups
              </Link>
            )}
            {!loading && visibleCategories.length > 0 && (
              <div className="space-y-16">
                {visibleCategories.map((category) => {
                  const shownCount = expandedState[category.category] || INITIAL_COURSES_SHOWN;
                  const sortedCourses = sortCourses(category.courses);
                  const visibleCourses = sortedCourses.slice(0, shownCount);
                  const hasMore = shownCount < category.courses.length;

                  return (
                    <section key={category.category} className="space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-border">
                        <BookOpen strokeWidth={1.5} className="w-5 h-5 text-text-muted" />
                        <h2 className="text-xl font-medium text-text-heading">{category.category}</h2>
                        <Badge className="border-border bg-transparent font-mono font-normal text-text-body">
                          {category.courses.length} courses
                        </Badge>
                      </div>

                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                        initial={shouldReduceMotion ? false : hasMounted ? false : "hidden"}
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
                        {visibleCourses.map((course, idx) => (
                          <motion.div
                            key={`${course.dept}-${course.courseNumber}-${idx}`}
                            layout
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            transition={
                              shouldReduceMotion
                                ? undefined
                                : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                            }
                          >
                            <Card className="bg-card border-border hover:border-border transition-colors duration-150 relative overflow-hidden group dark:hover:border-border-strong">
                              {/* Subtle corner highlight */}

                              <CardContent className="relative pt-2">
                                {/* Header: Course info + Easiness Score */}
                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium text-text-heading">
                                      {course.dept} {course.courseNumber}
                                    </h3>
                                    <p className="text-sm text-text-muted line-clamp-1">
                                      {course.courseTitle}
                                    </p>
                                  </div>

                                  <EasinessBadge
                                    score={course.easinessScore}
                                    confidence={course.confidenceScore}
                                  />
                                </div>

                                {/* Professor + Stats Row */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <GraduationCap strokeWidth={1.5} className="w-5 h-5 text-text-muted shrink-0" />
                                    <span className="text-md font-medium text-text-heading truncate">
                                      {course.professor
                                        ? `${course.professor.firstName} ${course.professor.lastName}`
                                        : "TBA"}
                                    </span>
                                  </div>
                                </div>
                                <div className="py-3 px-3 rounded-lg bg-black/5 dark:bg-raised mb-3">
                                  <div className="grid grid-cols-3 gap-2 text-sm w-full justify-items-center">
                                    {course.professor?.avgRating && course.professor.avgRating > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-text-muted" />
                                        <span className="font-medium text-text-heading">
                                          {course.professor.avgRating.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                    {course.professor?.avgGpa && (
                                      <div className="text-text-muted">
                                        <span className="font-medium text-text-heading">{course.professor.avgGpa.toFixed(2)}</span> GPA
                                      </div>
                                    )}
                                    {course.professor?.percentAB && (
                                      <div className="text-text-muted">
                                        <span className="font-medium text-emerald-500">{course.professor.percentAB.toFixed(0)}%</span> A/B
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Tags - only show if available */}
                                {course.professor?.tags && course.professor.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {course.professor.tags.slice(0, 2).map((tag, tagIdx) => (
                                      <span
                                        key={tagIdx}
                                        className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {course.professor.tags.length > 2 && (
                                      <span className="text-xs text-text-muted">
                                        +{course.professor.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* View More Button */}
                      {hasMore && (
                        <div className="flex justify-center pt-4">
                          <Button
                            variant="outline"
                            onClick={() => handleViewMore(category.category, category.courses.length)}
                            className="border-border bg-canvas text-text-body hover:bg-button-hover dark:bg-card dark:hover:bg-raised rounded-full px-6"
                          >
                            View More
                            <ChevronDown className="w-4 h-4 ml-2" />
                            <span className="ml-1 text-xs text-text-muted">
                              ({category.courses.length - shownCount} remaining)
                            </span>
                          </Button>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && selectedTerm && visibleCategories.length === 0 && (
              <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
                <Search strokeWidth={1.5} className="w-6 h-6 text-text-muted mx-auto mb-3" aria-hidden />
                <h3 className="text-2xl font-medium text-text-heading mb-2">
                  No courses found
                </h3>
                <p className="text-text-body">
                  {group
                    ? "No courses in this core curriculum group match the selected term and filters."
                    : hasActiveFilters
                    ? "No UCC courses match these filters. Try loosening them."
                    : "No UCC courses found for this term."}
                </p>
              </div>
            )}

            {/* Initial State - No Term Selected */}
            {/* Initial State - No Term Selected */}
            {!loading && !selectedTerm && (
              <div className="py-20" />
            )}
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
