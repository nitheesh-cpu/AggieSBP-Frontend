"use client";

import React, { useCallback, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Minus,
  Star,
  BookOpen,
  User,
  GraduationCap,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import { useProfessorComparison } from "@/contexts/ProfessorComparisonContext";

function ComparePageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "courses";

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [selectedCoursesDetails, setSelectedCoursesDetails] = useState<
    CourseDetail[]
  >([]);

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);
  const [professorSearchTerm, setProfessorSearchTerm] = useState("");
  const [professorDetails, setProfessorDetails] = useState<ProfessorDetail[]>(
    []
  );

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [professorsLoading, setProfessorsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Course comparison context
  const {
    selectedCourses,
    addCourse,
    removeCourse,
    isSelected: isCourseSelected,
    canAddMore: canAddMoreCourses,
  } = useComparison();

  // Professor comparison context
  const {
    selectedProfessors,
    addProfessor,
    removeProfessor,
    isSelected: isProfessorSelected,
    canAddMore: canAddMoreProfessors,
  } = useProfessorComparison();

  // Load courses only when needed (when user searches or when there are selected courses)
  const loadCourses = useCallback(async () => {
    if (courses.length === 0) {
      try {
        setCoursesLoading(true);
        const data = await getCourses({ limit: 5000 });
        setCourses(data);
        setFilteredCourses(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load courses");
        console.error("Failed to load courses:", err);
      } finally {
        setCoursesLoading(false);
      }
    }
  }, [courses.length]);

  // Load professors only when needed (when user searches or when there are selected professors)
  const loadProfessors = useCallback(async () => {
    if (professors.length === 0) {
      try {
        setProfessorsLoading(true);
        const data = await getProfessors({ limit: 5000 });
        setProfessors(data);
        setFilteredProfessors(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load professors"
        );
        console.error("Failed to load professors:", err);
      } finally {
        setProfessorsLoading(false);
      }
    }
  }, [professors.length]);

  // Load data if there are already selected items
  useEffect(() => {
    // Load courses if there are already selected courses
    if (selectedCourses.length > 0 && tab === "courses") {
      loadCourses();
    }

    // Load professors if there are already selected professors
    if (selectedProfessors.length > 0 && tab === "professors") {
      loadProfessors();
    }
  }, [
    loadCourses,
    loadProfessors,
    tab,
    selectedCourses.length,
    selectedProfessors.length,
  ]);

  // Load course details for comparison
  useEffect(() => {
    const loadCourseDetails = async () => {
      if (selectedCourses.length > 0) {
        try {
          const coursePromises = selectedCourses.map((courseId) =>
            getCourseDetail(courseId)
          );
          const details = await Promise.all(coursePromises);
          setSelectedCoursesDetails(details);
        } catch (err) {
          console.error("Failed to load course details:", err);
        }
      } else {
        setSelectedCoursesDetails([]);
      }
    };

    loadCourseDetails();
  }, [selectedCourses]);

  // Load professor details for comparison
  useEffect(() => {
    const loadProfessorDetails = async () => {
      if (selectedProfessors.length > 0) {
        try {
          const details = await compareProfessors(selectedProfessors);
          setProfessorDetails(details);
        } catch (err) {
          console.error("Failed to load professor details:", err);
        }
      } else {
        setProfessorDetails([]);
      }
    };

    loadProfessorDetails();
  }, [selectedProfessors]);

  // Filter courses
  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        course.code.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(courseSearchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [courseSearchTerm, courses]);

  // Filter professors
  useEffect(() => {
    const filtered = professors.filter((prof) =>
      prof.name.toLowerCase().includes(professorSearchTerm.toLowerCase())
    );
    setFilteredProfessors(filtered);
  }, [professorSearchTerm, professors]);

  const addCourseToComparison = (course: Course) => {
    if (canAddMoreCourses() && !isCourseSelected(course.id)) {
      addCourse(course.id);
    }
  };

  const removeCourseFromComparison = (courseId: string) => {
    removeCourse(courseId);
  };

  const addProfessorToComparison = (professor: Professor) => {
    if (canAddMoreProfessors() && !isProfessorSelected(professor.id)) {
      addProfessor(professor.id);
    }
  };

  const removeProfessorFromComparison = (professorId: string) => {
    removeProfessor(professorId);
  };

  if (error) {
    return (
      <div
        className="min-h-screen relative"
        style={{
          background: "var(--app-bg-gradient)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "var(--app-bg-ambient)",
          }}
        />

        <Navigation variant="glass" />
        <main className="pt-20 pb-20 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <Card className="max-w-2xl mx-auto mt-10 p-8 bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
              <div className="text-center">
                <div className="text-red-300/90 mb-2 font-medium">
                  Unable to load comparison tools
                </div>
                <div className="text-text-body text-sm break-words dark:text-white/70">
                  {error}
                </div>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: "var(--app-bg-gradient)",
      }}
    >
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "var(--app-bg-ambient)",
        }}
      />

      <Navigation variant="glass" />

      {/* Hero */}
      <section className="pt-20 pb-4 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-xs text-text-body mb-8 dark:text-white/70">
            <span>Home</span>
            <ChevronRight className="w-4 h-4 text-text-body/60 dark:text-white/40" />
            <span className="text-text-heading dark:text-white/90">
              Compare
            </span>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-text-heading dark:text-white text-[28px] sm:text-[34px] md:text-[42px] leading-tight font-semibold tracking-tight mb-4">
              Compare & Discover
            </h1>
            <p className="text-text-body dark:text-white/80 text-[13px] sm:text-[14px] md:text-[15px] max-w-2xl mx-auto leading-relaxed">
              Compare courses and professors side by side to make informed
              decisions about your academic path.
            </p>
          </div>
        </div>
      </section>

      <main className="pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8 flex justify-center">
            <Tabs value={tab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card border border-border dark:bg-black/45 dark:border-white/15 dark:backdrop-blur-sm">
                <TabsTrigger
                  value="courses"
                  asChild
                  className="data-[state=active]:bg-[#FFCF3F] data-[state=active]:text-[#0f0f0f] data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <a href="/compare?tab=courses">Courses</a>
                </TabsTrigger>
                <TabsTrigger
                  value="professors"
                  asChild
                  className="data-[state=active]:bg-[#FFCF3F] data-[state=active]:text-[#0f0f0f] data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <a href="/compare?tab=professors">Professors</a>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Course Search */}
                  <div className="lg:col-span-1">
                    <Card className="p-6 bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                      <h2 className="text-xl font-semibold text-text-heading dark:text-white mb-4">
                        Add Courses to Compare
                      </h2>

                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body dark:text-white/60" />
                          <Input
                            placeholder="Search for courses..."
                            value={courseSearchTerm}
                            onChange={(e) => {
                              setCourseSearchTerm(e.target.value);
                              if (e.target.value.length > 0) loadCourses();
                            }}
                            onFocus={() => loadCourses()}
                            className="pl-10 bg-canvas border-border text-text-body placeholder:text-text-body/60 dark:bg-black/30 dark:border-white/15 dark:text-white dark:placeholder:text-white/40"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {coursesLoading ? (
                          <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#FFCF3F]" />
                            <p className="text-sm text-white/70">
                              Loading courses...
                            </p>
                          </div>
                        ) : courses.length === 0 &&
                          courseSearchTerm.length === 0 ? (
                          <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-text-body/50 mx-auto mb-3 dark:text-white/50" />
                            <p className="text-sm text-text-body dark:text-white/70">
                              Start typing to search for courses
                            </p>
                          </div>
                        ) : filteredCourses.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-text-body dark:text-white/70">
                              No courses found matching &quot;
                              {courseSearchTerm}&quot;
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredCourses.map((course) => (
                              <div
                                key={course.id}
                                className="p-3 bg-canvas rounded-xl border border-border hover:border-border transition-all cursor-pointer dark:bg-black/30 dark:border-white/10 dark:hover:border-white/20"
                                onClick={() => addCourseToComparison(course)}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="font-medium text-text-heading dark:text-white">
                                      {course.code}
                                    </div>
                                    <div className="text-sm text-text-body truncate dark:text-white/70">
                                      {course.name}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                      !canAddMoreCourses() ||
                                      isCourseSelected(course.id)
                                    }
                                    className="ml-2 border-border hover:bg-button-hover dark:border-white/15 dark:bg-black/20 dark:text-white/80 dark:hover:bg-black/35"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Course Comparison View */}
                  <div className="lg:col-span-2">
                    {selectedCourses.length === 0 ? (
                      <Card className="p-12 bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                        <div className="text-center">
                          <BookOpen className="w-16 h-16 text-text-body/50 mx-auto mb-4 dark:text-white/50" />
                          <h3 className="text-xl font-semibold text-text-heading dark:text-white mb-2">
                            No courses selected
                          </h3>
                          <p className="text-text-body dark:text-white/70">
                            Search and add courses from the left panel to start
                            comparing.
                          </p>
                        </div>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        <Card className="p-4 bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-text-heading dark:text-white">
                              Comparing {selectedCourses.length} Course
                              {selectedCourses.length > 1 ? "s" : ""}
                            </h2>
                            <div className="text-sm text-text-body dark:text-white/70">
                              {4 - selectedCourses.length} more can be added
                            </div>
                          </div>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                          {selectedCoursesDetails.map((course, index) => (
                            <div key={course.code}>
                              <Card className="p-4 bg-card border-border hover:border-border transition-all dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm dark:hover:border-white/20">
                                <div className="flex items-start justify-between mb-3 gap-3">
                                  <div className="min-w-0">
                                    <h3 className="font-semibold text-text-heading dark:text-white">
                                      {course.code}
                                    </h3>
                                    <p className="text-sm text-text-body line-clamp-2 dark:text-white/70">
                                      {course.name}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      removeCourseFromComparison(
                                        selectedCourses[index]
                                      )
                                    }
                                    className="border-border hover:bg-button-hover text-red-600 hover:text-red-700 dark:border-white/15 dark:bg-black/20 dark:text-red-300 dark:hover:text-red-200 dark:hover:bg-black/35"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-body dark:text-white/70">
                                      GPA
                                    </span>
                                    <span className="font-medium text-text-heading dark:text-white">
                                      {course.avgGPA !== -1
                                        ? course.avgGPA.toFixed(2)
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-body dark:text-white/70">
                                      Credits
                                    </span>
                                    <span className="font-medium text-text-heading dark:text-white">
                                      {course.credits}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-body dark:text-white/70">
                                      Difficulty
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="border-border text-text-body bg-canvas dark:border-white/15 dark:text-white/80 dark:bg-black/20"
                                    >
                                      {course.difficulty}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-body dark:text-white/70">
                                      Rating
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-[#FFCF3F] fill-current" />
                                      <span className="font-medium text-text-heading dark:text-white">
                                        {course.rating
                                          ? course.rating.toFixed(1)
                                          : "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="professors" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Professor Search */}
                  <div className="lg:col-span-1">
                    <Card className="p-6 bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                      <h2 className="text-xl font-semibold text-text-heading dark:text-white mb-4">
                        Add Professors to Compare
                      </h2>

                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-body dark:text-white/60" />
                          <Input
                            placeholder="Search for professors..."
                            value={professorSearchTerm}
                            onChange={(e) => {
                              setProfessorSearchTerm(e.target.value);
                              if (e.target.value.length > 0) loadProfessors();
                            }}
                            onFocus={() => loadProfessors()}
                            className="pl-10 bg-canvas border-border text-text-body placeholder:text-text-body/60 dark:bg-black/30 dark:border-white/15 dark:text-white dark:placeholder:text-white/40"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {professorsLoading ? (
                          <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#FFCF3F]" />
                            <p className="text-sm text-white/70">
                              Loading professors...
                            </p>
                          </div>
                        ) : professors.length === 0 &&
                          professorSearchTerm.length === 0 ? (
                          <div className="text-center py-8">
                            <GraduationCap className="w-12 h-12 text-text-body/50 mx-auto mb-3 dark:text-white/50" />
                            <p className="text-sm text-text-body dark:text-white/70">
                              Start typing to search for professors
                            </p>
                          </div>
                        ) : filteredProfessors.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-text-body dark:text-white/70">
                              No professors found matching &quot;
                              {professorSearchTerm}&quot;
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredProfessors.map((professor) => (
                              <div
                                key={professor.id}
                                className="p-3 bg-canvas rounded-xl border border-border hover:border-border transition-all cursor-pointer dark:bg-black/30 dark:border-white/10 dark:hover:border-white/20"
                                onClick={() =>
                                  addProfessorToComparison(professor)
                                }
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-canvas border border-border flex items-center justify-center text-[#FFCF3F] dark:bg-white/10 dark:border-white/10">
                                      <User className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-medium text-text-heading truncate dark:text-white">
                                        {professor.name}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-[#FFCF3F] fill-current" />
                                        <span className="text-xs text-text-body dark:text-white/70">
                                          {professor.overall_rating
                                            ? professor.overall_rating.toFixed(
                                                1
                                              )
                                            : "N/A"}{" "}
                                          ({professor.total_reviews || 0})
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                      !canAddMoreProfessors() ||
                                      isProfessorSelected(professor.id)
                                    }
                                    className="ml-2 border-border hover:bg-button-hover dark:border-white/15 dark:bg-black/20 dark:text-white/80 dark:hover:bg-black/35"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Professor Comparison View */}
                  <div className="lg:col-span-2">
                    {selectedProfessors.length === 0 ? (
                      <Card className="p-12 bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                        <div className="text-center">
                          <GraduationCap className="w-16 h-16 text-text-body/50 mx-auto mb-4 dark:text-white/50" />
                          <h3 className="text-xl font-semibold text-text-heading dark:text-white mb-2">
                            No professors selected
                          </h3>
                          <p className="text-text-body dark:text-white/70">
                            Search and add professors from the left panel to
                            start comparing.
                          </p>
                        </div>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        <Card className="p-4 bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-text-heading dark:text-white">
                              Comparing {selectedProfessors.length} Professor
                              {selectedProfessors.length > 1 ? "s" : ""}
                            </h2>
                            <div className="text-sm text-text-body dark:text-white/70">
                              {4 - selectedProfessors.length} more can be added
                            </div>
                          </div>
                        </Card>

                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-4 bg-card border border-border dark:bg-black/45 dark:border-white/15 dark:backdrop-blur-sm">
                            {[
                              { value: "overview", label: "Overview" },
                              { value: "courses", label: "Courses" },
                              { value: "tags", label: "Tags" },
                              { value: "reviews", label: "Reviews" },
                            ].map((t) => (
                              <TabsTrigger
                                key={t.value}
                                value={t.value}
                                className="data-[state=active]:bg-[#FFCF3F] data-[state=active]:text-[#0f0f0f] transition-all duration-200"
                              >
                                {t.label}
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {professorDetails.map((professor) => (
                                <div key={professor.id}>
                                  <Card className="p-4 bg-card border-border hover:border-border transition-all dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm dark:hover:border-white/20">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-canvas border border-border flex items-center justify-center text-[#FFCF3F] dark:bg-white/10 dark:border-white/10">
                                          <User className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                          <h3 className="font-semibold text-text-heading truncate dark:text-white">
                                            {professor.name}
                                          </h3>
                                        </div>
                                      </div>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() =>
                                          removeProfessorFromComparison(
                                            professor.id
                                          )
                                        }
                                        className="border-border hover:bg-button-hover text-red-600 hover:text-red-700 dark:border-white/15 dark:bg-black/20 dark:text-red-300 dark:hover:text-red-200 dark:hover:bg-black/35"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                    </div>

                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-body dark:text-white/70">
                                          Overall Rating
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <Star className="w-4 h-4 text-[#FFCF3F] fill-current" />
                                          <span className="font-medium text-text-heading dark:text-white">
                                            {professor.overall_rating
                                              ? professor.overall_rating.toFixed(
                                                  1
                                                )
                                              : "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-body dark:text-white/70">
                                          Reviews
                                        </span>
                                        <span className="font-medium text-text-heading dark:text-white">
                                          {professor.total_reviews}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-body dark:text-white/70">
                                          Would Take Again
                                        </span>
                                        <span className="font-medium text-text-heading dark:text-white">
                                          {professor.would_take_again_percent
                                            ? professor.would_take_again_percent.toFixed(
                                                0
                                              )
                                            : "N/A"}
                                          %
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-body dark:text-white/70">
                                          Courses
                                        </span>
                                        <span className="font-medium text-text-heading dark:text-white">
                                          {professor.courses.length}
                                        </span>
                                      </div>
                                    </div>
                                  </Card>
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="courses" className="space-y-4">
                            <Card className="p-6 bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                              <h3 className="text-lg font-semibold text-text-heading dark:text-white mb-4">
                                Courses Taught
                              </h3>
                              <div className="space-y-4">
                                {professorDetails.map((professor) => (
                                  <div key={professor.id}>
                                    <h4 className="font-medium text-text-heading mb-2 dark:text-white">
                                      {professor.name}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {professor.courses
                                        .slice(0, 6)
                                        .map((course) => (
                                          <div
                                            key={course.course_id}
                                            className="flex items-center justify-between p-2 bg-canvas rounded-lg border border-border dark:bg-black/30 dark:border-white/10"
                                          >
                                            <span className="text-sm font-medium text-text-heading dark:text-white">
                                              {course.course_id
                                                ? course.course_id
                                                : "Overall Rating"}
                                            </span>
                                            <div className="flex items-center gap-1">
                                              <Star className="w-3 h-3 text-[#FFCF3F] fill-current" />
                                              <span className="text-xs text-text-body dark:text-white/70">
                                                {course.avg_rating
                                                  ? course.avg_rating.toFixed(1)
                                                  : "N/A"}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                    {professor.courses.length > 6 && (
                                      <p className="text-xs text-text-body/80 mt-2 dark:text-white/60">
                                        +{professor.courses.length - 6} more
                                        courses
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </Card>
                          </TabsContent>

                          <TabsContent value="tags" className="space-y-4">
                            <Card className="p-6 bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                              <h3 className="text-lg font-semibold text-text-heading dark:text-white mb-4">
                                Student Tags
                              </h3>
                              <div className="space-y-6">
                                {professorDetails.map((professor) => (
                                  <div key={professor.id}>
                                    <h4 className="font-medium text-text-heading mb-3 dark:text-white">
                                      {professor.name}
                                    </h4>
                                    {professor.tag_frequencies &&
                                    Object.keys(professor.tag_frequencies)
                                      .length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(
                                          professor.tag_frequencies
                                        )
                                          .sort(([, a], [, b]) => b - a)
                                          .map(([tag, frequency]) => (
                                            <Badge
                                              key={tag}
                                              variant="outline"
                                              className="bg-gradient-to-br from-rose-700 to-rose-900 text-white border-transparent px-3 py-1 text-sm font-medium"
                                            >
                                              {tag} ({frequency})
                                            </Badge>
                                          ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-text-body dark:text-white/70">
                                        No tags available
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </Card>
                          </TabsContent>

                          <TabsContent value="reviews" className="space-y-4">
                            <Card className="p-6 bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                              <h3 className="text-lg font-semibold text-text-heading dark:text-white mb-4">
                                Recent Reviews
                              </h3>
                              <div className="space-y-6">
                                {professorDetails.map((professor) => (
                                  <div key={professor.id}>
                                    <h4 className="font-medium text-text-heading mb-3 dark:text-white">
                                      {professor.name}
                                    </h4>
                                    {professor.recent_reviews &&
                                    professor.recent_reviews.length > 0 ? (
                                      <div className="space-y-3">
                                        {professor.recent_reviews
                                          .slice(0, 2)
                                          .map((review) => (
                                            <div
                                              key={review.id}
                                              className="p-3 bg-canvas rounded-lg border border-border dark:bg-black/30 dark:border-white/10"
                                            >
                                              <div className="mb-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-[#FFCF3F] fill-current" />
                                                    <span className="text-sm font-medium text-text-heading dark:text-white">
                                                      {review.overall_rating
                                                        ? review.overall_rating.toFixed(
                                                            1
                                                          )
                                                        : "N/A"}
                                                    </span>
                                                  </div>
                                                  <Badge
                                                    variant="secondary"
                                                    className="text-xs flex-shrink-0 bg-card text-text-body border border-border dark:bg-white/10 dark:text-white dark:border-white/10"
                                                  >
                                                    {review.grade}
                                                  </Badge>
                                                </div>
                                                <div className="flex flex-wrap gap-1 max-w-full">
                                                  {Object.entries(
                                                    review.tags || []
                                                  )
                                                    .slice(0, 4)
                                                    .map(([idx, tag]) => (
                                                      <Badge
                                                        key={idx}
                                                        variant="outline"
                                                        className="bg-gradient-to-br from-green-700 to-green-900 text-white border-transparent px-2 py-0.5 text-xs font-medium flex-shrink-0"
                                                      >
                                                        {tag}
                                                      </Badge>
                                                    ))}
                                                </div>
                                              </div>
                                              <p className="text-sm text-text-body line-clamp-3 dark:text-white/70">
                                                {review.review_text}
                                              </p>
                                            </div>
                                          ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-text-body dark:text-white/70">
                                        No recent reviews available
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
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
          style={{
            background: "var(--app-bg-gradient)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "var(--app-bg-ambient)",
            }}
          />
          <Navigation variant="glass" />
          <main className="pt-20 pb-20 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-10">
                <h1 className="text-text-heading dark:text-white text-[28px] sm:text-[34px] md:text-[42px] leading-tight font-semibold tracking-tight mb-4">
                  Compare & Discover
                </h1>
                <p className="text-text-body dark:text-white/80 text-[13px] sm:text-[14px] md:text-[15px] max-w-2xl mx-auto leading-relaxed">
                  Loading comparison tools...
                </p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#FFCF3F]" />
              </div>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
