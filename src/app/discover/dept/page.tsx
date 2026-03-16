"use client";

import React, { useState, useEffect } from "react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap, Star, ChevronDown, Building2, MapPin, ArrowUpDown } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

const CAMPUS_OPTIONS = [
  { value: "all", label: "All Campuses" },
  { value: "College Station", label: "College Station" },
  { value: "Galveston", label: "Galveston" },
  { value: "Qatar", label: "Qatar" },
  { value: "Health Science", label: "Health Science Center" },
];

interface Term {
  termCode: string;
  termDesc: string;
}

interface Department {
  code: string;
  name: string;
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

const INITIAL_SHOWN = 9;
const INCREMENT = 9;

type SortKey = "easiness" | "gpa" | "ab" | "rating";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "easiness", label: "Easiness Score" },
  { value: "gpa",     label: "Avg GPA" },
  { value: "ab",      label: "A/B Rate" },
  { value: "rating",  label: "Prof Rating" },
];

export default function DiscoverDeptPage() {
  const shouldReduceMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);

  const [terms, setTerms] = useState<Term[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [includeGraduate, setIncludeGraduate] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("easiness");

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTerms, setFetchingTerms] = useState(true);
  const [fetchingDepts, setFetchingDepts] = useState(false);
  const [shownCount, setShownCount] = useState(INITIAL_SHOWN);

  useEffect(() => { setHasMounted(true); }, []);

  // Fetch terms on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/terms`)
      .then((r) => r.json())
      .then((data: Term[]) => setTerms(data))
      .catch(console.error)
      .finally(() => setFetchingTerms(false));
  }, []);

  // Fetch departments from sections for the selected term
  const fetchDepartments = async (term: string) => {
    setFetchingDepts(true);
    setDepartments([]);
    setSelectedDept("");
    try {
      const res = await fetch(`${API_BASE_URL}/discover/${term}/departments`);
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingDepts(false);
    }
  };

  // Fetch courses — centralised so filters can trigger it
  const fetchCourses = async (
    term: string,
    dept: string,
    campus: string,
    graduate: boolean,
  ) => {
    if (!term || !dept) return;
    setLoading(true);
    setCourses([]);
    setShownCount(INITIAL_SHOWN);
    try {
      const url = new URL(`${API_BASE_URL}/discover/${term}/${dept}`);
      const apiCampus = campus === "all" ? "" : campus;
      if (apiCampus) url.searchParams.set("campus", apiCampus);
      url.searchParams.set("include_graduate", String(graduate));
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data: Course[] = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
    setCourses([]);
    fetchDepartments(term);
  };

  const handleDeptChange = (dept: string) => {
    setSelectedDept(dept);
    fetchCourses(selectedTerm, dept, selectedCampus, includeGraduate);
  };

  const handleCampusChange = (campus: string) => {
    setSelectedCampus(campus);
    // Normalize sentinel "all" → empty string for the API
    const apiCampus = campus === "all" ? "" : campus;
    if (selectedDept) fetchCourses(selectedTerm, selectedDept, apiCampus, includeGraduate);
  };

  const handleGraduateToggle = () => {
    const next = !includeGraduate;
    setIncludeGraduate(next);
    if (selectedDept) fetchCourses(selectedTerm, selectedDept, selectedCampus, next);
  };

  const sortedCourses = [...courses].sort((a, b) => {
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

  const visibleCourses = sortedCourses.slice(0, shownCount);
  const hasMore = shownCount < sortedCourses.length;
  const deptLabel = Array.isArray(departments)
    ? departments.find((d) => d.code === selectedDept)?.name ?? selectedDept
    : selectedDept;

  return (
    <MotionConfig reducedMotion={shouldReduceMotion ? "always" : "never"}>
      <div className="min-h-screen relative" style={{ background: "var(--app-bg-gradient)" }}>
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "var(--app-bg-ambient)" }} />

        <Navigation variant="glass" />

        <main className="relative pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">

            {/* Header */}
            <div className="mb-8 space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-heading dark:text-white">
                  Discover by Department
                </h1>
                <p className="text-text-body dark:text-white/70 text-lg max-w-2xl">
                  Pick a term and department to find courses ranked by easiness score.
                </p>
              </div>

              {/* Selectors row */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Term */}
                <Select onValueChange={handleTermChange} value={selectedTerm}>
                  <SelectTrigger className="w-48 h-10 bg-card/80 backdrop-blur-md border-border dark:border-white/15 dark:bg-black/50 dark:text-white rounded-full px-5 shadow-sm transition-all">
                    <SelectValue placeholder={fetchingTerms ? "Loading..." : "Select Term"} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-black/90 dark:border-white/15 dark:text-white">
                    <SelectGroup>
                      <SelectLabel>Available Terms</SelectLabel>
                      {terms.map((term) => (
                        <SelectItem key={term.termCode} value={term.termCode}>
                          {term.termDesc}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Department */}
                <Select onValueChange={handleDeptChange} value={selectedDept} disabled={!selectedTerm || fetchingDepts}>
                  <SelectTrigger className="w-60 h-10 bg-card/80 backdrop-blur-md border-border dark:border-white/15 dark:bg-black/50 dark:text-white rounded-full px-5 shadow-sm transition-all disabled:opacity-50">
                    <SelectValue placeholder={
                      !selectedTerm ? "Select a term first"
                        : fetchingDepts ? "Loading departments..."
                        : "Select Department"
                    } />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-black/90 dark:border-white/15 dark:text-white max-h-72">
                    <SelectGroup>
                      <SelectLabel>Departments</SelectLabel>
                      {(Array.isArray(departments) ? departments : []).map((dept) => (
                        <SelectItem key={dept.code} value={dept.code}>
                          <span className="font-mono text-xs mr-2 text-text-body/60 dark:text-white/40">{dept.code}</span>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Campus */}
                <Select onValueChange={handleCampusChange} value={selectedCampus}>
                  <SelectTrigger className="w-48 h-10 bg-card/80 backdrop-blur-md border-border dark:border-white/15 dark:bg-black/50 dark:text-white rounded-full px-5 shadow-sm transition-all">
                    <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-text-body/50 dark:text-white/40" />
                    <SelectValue placeholder="All Campuses" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-black/90 dark:border-white/15 dark:text-white">
                    <SelectGroup>
                      <SelectLabel>Campus</SelectLabel>
                      {CAMPUS_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select onValueChange={(v) => setSortKey(v as SortKey)} value={sortKey}>
                  <SelectTrigger className="w-44 h-10 bg-card/80 backdrop-blur-md border-border dark:border-white/15 dark:bg-black/50 dark:text-white rounded-full px-5 shadow-sm transition-all">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-1 shrink-0 text-text-body/50 dark:text-white/40" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-black/90 dark:border-white/15 dark:text-white">
                    <SelectGroup>
                      <SelectLabel>Sort by</SelectLabel>
                      {SORT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Graduate toggle */}
                <button
                  type="button"
                  onClick={handleGraduateToggle}
                  className={`h-10 px-4 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                    includeGraduate
                      ? "bg-[#500000] text-white border-[#500000] dark:bg-[#FFCF3F] dark:text-black dark:border-[#FFCF3F]"
                      : "bg-card/80 border-border dark:border-white/15 dark:bg-black/50 dark:text-white/70 text-text-body hover:bg-card"
                  }`}
                  title="Toggle graduate-level courses (600+)"
                >
                  <GraduationCap className="w-4 h-4" />
                  Grad courses
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    includeGraduate
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                      : "bg-black/10 dark:bg-white/10"
                  }`}>
                    {includeGraduate ? "ON" : "OFF"}
                  </span>
                </button>
              </div>
            </div>

            {/* Mascot / Status bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 md:mb-14 flex flex-col md:flex-row items-center md:items-start justify-center gap-4"
            >
              <motion.div
                className="relative group cursor-help shrink-0 z-20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/pixel-reveille.png"
                  alt="Reveille"
                  className="w-60 h-60 object-contain drop-shadow-xl"
                  style={{ imageRendering: "pixelated" }}
                />
              </motion.div>

              <div className="relative w-full md:max-w-xl md:flex-1 lg:mt-8">
                <div className="bg-popover border-2 border-primary rounded-2xl p-4 md:p-5 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-popover border-t-2 border-l-2 border-primary transform rotate-45 md:hidden" />
                  <div className="absolute md:top-20 lg:top-14 -left-3 w-5 h-5 bg-popover border-b-2 border-l-2 border-primary transform rotate-45 hidden md:block" />

                  {loading ? (
                    <div className="flex items-center gap-4">
                      <Loader2 className="w-6 h-6 animate-spin text-primary shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg text-primary mb-1">*sniff sniff*</h3>
                        <p className="text-sm text-text-body dark:text-white/90">
                          Fetching the <strong className="text-emerald-500">easiest</strong> courses in {selectedDept}...
                        </p>
                      </div>
                    </div>
                  ) : !selectedTerm || !selectedDept ? (
                    <>
                      <h3 className="font-bold text-lg text-primary mb-3">Howdy! Woof!</h3>
                      <p className="text-sm text-text-body dark:text-white/90">
                        I&apos;m <strong>Reveille</strong>! Pick a <strong>term</strong> and a <strong>department</strong> above, and I&apos;ll rank every course by{" "}
                        <strong className="text-emerald-500 bg-emerald-500/10 px-1 rounded">EASINESS</strong> for you!
                        Use the campus and grad filters to narrow things down.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-lg lg:text-xl text-primary mb-4">Here&apos;s what the numbers mean!</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-md xl:text-lg">
                        <div className="space-y-1">
                          <h4 className="font-bold text-emerald-500 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">90</span>
                            Easiness Score
                          </h4>
                          <p className="text-xs xl:text-sm text-text-body/80 dark:text-white/70 leading-relaxed">
                            Combines <strong>Average GPA</strong> (50%), <strong>Difficulty</strong> (30%), and <strong>Rating</strong> (20%).
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-text-heading dark:text-white flex items-center gap-2">
                            <span className="text-text-body/50 text-xs tracking-widest">●●●</span>
                            Confidence
                          </h4>
                          <p className="text-xs xl:text-sm text-text-body/80 dark:text-white/70 leading-relaxed">
                            <strong>3 Dots</strong> = Lots of data.<br />
                            <strong>1 Dot</strong> = Limited data, take with a grain of salt!
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-blue-500">% A/B Rate</h4>
                          <p className="text-xs xl:text-sm text-text-body/80 dark:text-white/70 leading-relaxed">
                            Percentage of students who earned an <strong>A</strong> or <strong>B</strong> in this section.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Results Header */}
            {!loading && courses.length > 0 && (
              <div className="flex items-center gap-3 pb-3 mb-6 border-b border-border dark:border-white/10 flex-wrap">
                <Building2 className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold text-text-heading dark:text-white">
                  {deptLabel} — Ranked by Easiness
                </h2>
                <Badge className="bg-[#FFCF3F]/10 text-[#FFCF3F] border-transparent dark:bg-[#FFCF3F]/20">
                  {courses.length} courses
                </Badge>
                {selectedCampus && (
                  <Badge variant="outline" className="text-xs dark:border-white/20 dark:text-white/60">
                    <MapPin className="w-3 h-3 mr-1" />{selectedCampus}
                  </Badge>
                )}
                {includeGraduate && (
                  <Badge variant="outline" className="text-xs dark:border-white/20 dark:text-white/60">
                    <GraduationCap className="w-3 h-3 mr-1" />incl. grad
                  </Badge>
                )}
              </div>
            )}

            {/* Course Grid */}
            {!loading && courses.length > 0 && (
              <>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  initial={shouldReduceMotion ? false : hasMounted ? false : "hidden"}
                  animate="visible"
                  variants={{
                    hidden: { opacity: 1 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
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
                      transition={shouldReduceMotion ? undefined : { type: "spring", stiffness: 420, damping: 34 }}
                      whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01, transition: { duration: 0.18 } }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                    >
                      <Card className="bg-card border-border hover:border-border transition-all duration-200 relative overflow-hidden group dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm dark:hover:border-white/20">
                        <motion.div
                          aria-hidden
                          className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#FFCF3F]/10 blur-2xl"
                          initial={false}
                          animate={shouldReduceMotion ? undefined : { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.8] }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />

                        <CardContent className="relative pt-2">
                          {/* Course header + easiness score */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-text-heading dark:text-white">
                                {course.dept} {course.courseNumber}
                              </h3>
                              <p className="text-sm text-text-body/80 dark:text-white/60 line-clamp-1">
                                {course.courseTitle}
                              </p>
                            </div>

                            <div
                              className="flex flex-col items-center"
                              title={`Easiness: GPA×50% + Ease×30% + Rating×20%\nConfidence: ${course.confidenceScore.toFixed(0)}%`}
                            >
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                course.easinessScore >= 80
                                  ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30"
                                  : course.easinessScore >= 60
                                  ? "bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500/30"
                                  : course.easinessScore >= 40
                                  ? "bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/30"
                                  : "bg-red-500/20 text-red-400 ring-2 ring-red-500/30"
                              }`}>
                                {course.easinessScore.toFixed(0)}
                              </div>
                              <span className="text-[10px] text-text-body/50 dark:text-white/40 mt-1">
                                {course.confidenceScore >= 70 ? "●●●" : course.confidenceScore >= 40 ? "●●○" : "●○○"}
                              </span>
                            </div>
                          </div>

                          {/* Professor */}
                          <div className="flex items-center gap-2 mb-3 min-w-0">
                            <GraduationCap className="w-4 h-4 text-accent shrink-0" />
                            <span className="text-md font-medium text-text-heading dark:text-white truncate">
                              {course.professor
                                ? `${course.professor.firstName} ${course.professor.lastName}`
                                : "TBA"}
                            </span>
                          </div>

                          {/* Stats */}
                          <div className="py-3 px-3 rounded-lg bg-black/5 dark:bg-white/5 mb-3">
                            <div className="grid grid-cols-3 gap-2 text-sm w-full justify-items-center">
                              {course.professor?.avgRating && course.professor.avgRating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-accent fill-current" />
                                  <span className="font-medium text-text-heading dark:text-white">
                                    {course.professor.avgRating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                              {course.professor?.avgGpa && (
                                <div className="text-text-body/80 dark:text-white/60">
                                  <span className="font-medium text-text-heading dark:text-white">
                                    {course.professor.avgGpa.toFixed(2)}
                                  </span>{" "}GPA
                                </div>
                              )}
                              {course.professor?.percentAB && (
                                <div className="text-text-body/80 dark:text-white/60">
                                  <span className="font-medium text-emerald-500">
                                    {course.professor.percentAB.toFixed(0)}%
                                  </span>{" "}A/B
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tags */}
                          {course.professor?.tags && course.professor.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {course.professor.tags.slice(0, 2).map((tag, tagIdx) => (
                                <span
                                  key={tagIdx}
                                  className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-body/70 dark:text-white/50"
                                >
                                  {tag}
                                </span>
                              ))}
                              {course.professor.tags.length > 2 && (
                                <span className="text-xs text-text-body/50 dark:text-white/30">
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

                {/* View More */}
                {hasMore && (
                  <div className="flex justify-center pt-8">
                    <Button
                      variant="outline"
                      onClick={() => setShownCount((n) => Math.min(n + INCREMENT, courses.length))}
                      className="border-border bg-canvas text-text-body hover:bg-button-hover dark:border-white/15 dark:bg-black/30 dark:text-white/80 dark:hover:bg-black/45 rounded-full px-6"
                    >
                      View More
                      <ChevronDown className="w-4 h-4 ml-2" />
                      <span className="ml-1 text-xs text-text-body/70 dark:text-white/60">
                        ({courses.length - shownCount} remaining)
                      </span>
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && selectedTerm && selectedDept && courses.length === 0 && (
              <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border dark:border-white/10 dark:bg-black/30">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-text-heading dark:text-white mb-2">No courses found</h3>
                <p className="text-text-body dark:text-white/70">
                  No courses found for <strong>{selectedDept}</strong>
                  {selectedCampus ? ` on the ${selectedCampus} campus` : ""} in that term.
                  {!includeGraduate && " Try enabling graduate courses."}
                </p>
              </div>
            )}

            {/* Initial spacer */}
            {!loading && (!selectedTerm || !selectedDept) && <div className="py-20" />}
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
