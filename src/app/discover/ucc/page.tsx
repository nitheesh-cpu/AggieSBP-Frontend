"use client";

import React, { useState, useEffect } from "react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
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
import { Loader2, BookOpen, GraduationCap, Star, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function UCCDiscoveryPage() {
  const shouldReduceMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [uccData, setUccData] = useState<UCCCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingTerms, setFetchingTerms] = useState<boolean>(true);
  const [expandedState, setExpandedState] = useState<ExpandedState>({});

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetch terms on mount
  useEffect(() => {
    async function fetchTerms() {
      try {
        const res = await fetch(`${API_BASE_URL}/terms`);
        if (!res.ok) throw new Error("Failed to fetch terms");
        const data = await res.json();
        setTerms(data);
      } catch (error) {
        console.error("Error fetching terms:", error);
      } finally {
        setFetchingTerms(false);
      }
    }
    fetchTerms();
  }, []);

  // Fetch UCC data when term is selected
  const handleTermChange = async (termCode: string) => {
    setSelectedTerm(termCode);
    setLoading(true);
    setUccData([]);
    setExpandedState({});

    try {
      const res = await fetch(`${API_BASE_URL}/discover/${termCode}/ucc`);
      if (!res.ok) throw new Error("Failed to fetch UCC data");
      const data = await res.json();
      setUccData(data);
      // Initialize expanded state for each category
      const initialExpanded: ExpandedState = {};
      data.forEach((cat: UCCCategory) => {
        initialExpanded[cat.category] = INITIAL_COURSES_SHOWN;
      });
      setExpandedState(initialExpanded);
    } catch (error) {
      console.error("Error fetching UCC data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMore = (category: string, totalCourses: number) => {
    setExpandedState((prev) => ({
      ...prev,
      [category]: Math.min((prev[category] || INITIAL_COURSES_SHOWN) + COURSES_INCREMENT, totalCourses),
    }));
  };

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

        <main className="relative pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header Section */}
            <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-heading dark:text-white">
                  University Core Curriculum
                </h1>
                <p className="text-text-body dark:text-white/70 text-lg max-w-2xl">
                  Discover courses that satisfy your core curriculum requirements for the selected term.
                </p>
              </div>

              <div className="w-full md:w-80">
                <Select onValueChange={handleTermChange} value={selectedTerm}>
                  <SelectTrigger className="w-full h-12 bg-card/80 backdrop-blur-md border-border dark:border-white/15 dark:bg-black/50 dark:text-white rounded-full px-5 shadow-sm transition-all">
                    <SelectValue placeholder={fetchingTerms ? "Loading terms..." : "Select a Term"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card/80 backdrop-blur-md border-border dark:border-white/15 dark:bg-black/50 dark:text-white rounded-full px-5 shadow-sm transition-all">
                    <SelectGroup>
                      <SelectLabel>Available Terms</SelectLabel>
                      {terms.map((term) => (
                        <SelectItem key={term.termCode} value={term.termCode} className="hover:bg-card hover:dark:bg-black/70">

                          {term.termDesc}
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
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/pixel-reveille.png"
                  alt="Reveille - The First Lady of Aggieland"
                  className="w-60 h-60 md:w-60 md:h-60 object-contain drop-shadow-xl"
                  style={{ imageRendering: "pixelated" }}
                />
              </motion.div>

              {/* Speech Bubble - Consistent styling for all states */}
              <div className="relative w-full md:max-w-xl md:flex-1 lg:mt-8">
                <div className="bg-popover border-2 border-primary rounded-2xl p-4 md:p-5 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
                  {/* Speech bubble pointer - mobile (top, pointing up to Reveille) */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-popover border-t-2 border-l-2 border-primary transform rotate-45 md:hidden" />
                  {/* Speech bubble pointer - desktop (left side, pointing to Reveille) */}
                  <div className="absolute md:top-20 lg:top-14 -left-3 w-5 h-5 bg-popover border-b-2 border-l-2 border-primary transform rotate-45 hidden md:block" />

                  {loading ? (
                    // Loading State
                    <div className="flex items-center gap-4">
                      <Loader2 className="w-6 h-6 animate-spin text-primary shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg leading-relaxed text-primary mb-1">
                          *sniff sniff*
                        </h3>
                        <p className="text-sm text-text-body dark:text-white/90">
                          Fetching the <strong className="text-emerald-500">easiest</strong> courses for you...
                        </p>
                      </div>
                    </div>
                  ) : !selectedTerm ? (
                    // Intro State
                    <>
                      <h3 className="font-bold text-lg leading-relaxed text-primary mb-3">
                        Howdy! Woof!
                      </h3>
                      <p className="text-sm text-text-body dark:text-white/90">
                        I&apos;m <strong>Reveille</strong>! Pick a term above, and I&apos;ll fetch the <strong className="text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded">EASIEST</strong> core curriculum courses for you.
                      </p>
                    </>
                  ) : (
                    // Metrics Legend (Active State)
                    <>
                      <h3 className="font-bold text-lg lg:text-xl leading-relaxed text-primary mb-4">
                        Here&apos;s what the numbers mean!
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-md xl:text-lg">
                        {/* Easiness Explanation */}
                        <div className="space-y-1">
                          <h4 className="font-bold text-emerald-500 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">90</span>
                            Easiness Score
                          </h4>
                          <p className="text-xs xl:text-sm text-text-body/80 dark:text-white/70 leading-relaxed">
                            My custom formula! Combines <strong>Average GPA</strong> (50%), <strong>Difficulty Rating</strong> (30%), and <strong>Student Quality</strong> (20%).
                          </p>
                        </div>

                        {/* Confidence Dots */}
                        <div className="space-y-1">
                          <h4 className="font-bold text-text-heading dark:text-white flex items-center gap-2">
                            <span className="text-text-body/50 text-xs tracking-widest">●●●</span>
                            Confidence
                          </h4>
                          <p className="text-xs xl:text-sm text-text-body/80 dark:text-white/70 leading-relaxed">
                            <strong>3 Dots</strong> = Lots of data.<br />
                            <strong>1 Dot</strong> = Limited data, take it with a grain of salt!
                          </p>
                        </div>

                        {/* A/B Rate */}
                        <div className="space-y-1">
                          <h4 className="font-bold text-blue-500 flex items-center gap-2">
                            % A/B Rate
                          </h4>
                          <p className="text-xs xl:text-sm text-text-body/80 dark:text-white/70 leading-relaxed">
                            Percentage of students who earned an <strong>A</strong> or <strong>B</strong> in this professor&apos;s class.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Results */}
            {!loading && uccData.length > 0 && (
              <div className="space-y-16">
                {uccData.map((category) => {
                  if (category.courses.length === 0) return null;
                  const shownCount = expandedState[category.category] || INITIAL_COURSES_SHOWN;
                  const visibleCourses = category.courses.slice(0, shownCount);
                  const hasMore = shownCount < category.courses.length;

                  return (
                    <section key={category.category} className="space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-border dark:border-white/10">
                        <BookOpen className="w-5 h-5 text-accent" />
                        <h2 className="text-xl font-semibold text-text-heading dark:text-white">{category.category}</h2>
                        <Badge className="bg-[#FFCF3F]/10 text-[#FFCF3F] border-transparent dark:bg-[#FFCF3F]/20">
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
                            <Card className="bg-card border-border hover:border-border transition-all duration-200 relative overflow-hidden group dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm dark:hover:border-white/20">
                              {/* Subtle corner highlight */}
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

                              <CardContent className="relative pt-2">
                                {/* Header: Course info + Easiness Score */}
                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-text-heading dark:text-white">
                                      {course.dept} {course.courseNumber}
                                    </h3>
                                    <p className="text-sm text-text-body/80 dark:text-white/60 line-clamp-1">
                                      {course.courseTitle}
                                    </p>
                                  </div>

                                  {/* Easiness Score Circle */}
                                  <div
                                    className="flex flex-col items-center"
                                    title={`Easiness: GPA×50% + Ease×30% + Rating×20%\nConfidence: ${course.confidenceScore.toFixed(0)}%`}
                                  >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${course.easinessScore >= 80
                                      ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30'
                                      : course.easinessScore >= 60
                                        ? 'bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500/30'
                                        : course.easinessScore >= 40
                                          ? 'bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/30'
                                          : 'bg-red-500/20 text-red-400 ring-2 ring-red-500/30'
                                      }`}>
                                      {course.easinessScore.toFixed(0)}
                                    </div>
                                    <span className="text-[10px] text-text-body/50 dark:text-white/40 mt-1">
                                      {course.confidenceScore >= 70 ? '●●●' : course.confidenceScore >= 40 ? '●●○' : '●○○'}
                                    </span>
                                  </div>
                                </div>

                                {/* Professor + Stats Row */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <GraduationCap className="w-4 h-4 text-accent shrink-0" />
                                    <span className="text-md font-medium text-text-heading dark:text-white truncate">
                                      {course.professor
                                        ? `${course.professor.firstName} ${course.professor.lastName}`
                                        : "TBA"}
                                    </span>
                                  </div>
                                </div>
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
                                        <span className="font-medium text-text-heading dark:text-white">{course.professor.avgGpa.toFixed(2)}</span> GPA
                                      </div>
                                    )}
                                    {course.professor?.percentAB && (
                                      <div className="text-text-body/80 dark:text-white/60">
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

                      {/* View More Button */}
                      {hasMore && (
                        <div className="flex justify-center pt-4">
                          <Button
                            variant="outline"
                            onClick={() => handleViewMore(category.category, category.courses.length)}
                            className="border-border bg-canvas text-text-body hover:bg-button-hover dark:border-white/15 dark:bg-black/30 dark:text-white/80 dark:hover:bg-black/45 rounded-full px-6"
                          >
                            View More
                            <ChevronDown className="w-4 h-4 ml-2" />
                            <span className="ml-1 text-xs text-text-body/70 dark:text-white/60">
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
            {!loading && selectedTerm && uccData.length === 0 && (
              <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border dark:border-white/10 dark:bg-black/30">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-text-heading dark:text-white mb-2">
                  No courses found
                </h3>
                <p className="text-text-body dark:text-white/70">
                  No UCC courses found for this term.
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
