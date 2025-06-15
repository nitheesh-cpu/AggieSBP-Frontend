"use client";

import React, { useState, useEffect, Suspense } from "react";
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
    [],
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
  const loadCourses = async () => {
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
  };

  // Load professors only when needed (when user searches or when there are selected professors)
  const loadProfessors = async () => {
    if (professors.length === 0) {
      try {
        setProfessorsLoading(true);
        const data = await getProfessors({ limit: 5000 });
        setProfessors(data);
        setFilteredProfessors(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load professors",
        );
        console.error("Failed to load professors:", err);
      } finally {
        setProfessorsLoading(false);
      }
    }
  };

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
  }, [tab, selectedCourses.length, selectedProfessors.length]);

  // Load course details for comparison
  useEffect(() => {
    const loadCourseDetails = async () => {
      if (selectedCourses.length > 0) {
        try {
          const coursePromises = selectedCourses.map((courseId) =>
            getCourseDetail(courseId),
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
        course.name.toLowerCase().includes(courseSearchTerm.toLowerCase()),
    );
    setFilteredCourses(filtered);
  }, [courseSearchTerm, courses]);

  // Filter professors
  useEffect(() => {
    const filtered = professors.filter((prof) =>
      prof.name.toLowerCase().includes(professorSearchTerm.toLowerCase()),
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
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              Error: {error}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-text-heading mb-4">
              Compare & Discover
            </h1>
            <p className="text-lg text-text-body max-w-2xl mx-auto">
              Compare courses and professors side by side to make informed
              decisions about your academic path.
            </p>
          </div>

          <Tabs value={tab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-card border border-border">
                <TabsTrigger
                  value="courses"
                  asChild
                  className="data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <a href="/compare?tab=courses">Courses</a>
                </TabsTrigger>
                <TabsTrigger
                  value="professors"
                  asChild
                  className="data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <a href="/compare?tab=professors">Professors</a>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="courses" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Course Search */}
                <div className="lg:col-span-1">
                  <Card className="p-6 bg-card border-border">
                    <h2 className="text-xl font-semibold text-text-heading mb-4">
                      Add Courses to Compare
                    </h2>

                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-body" />
                        <Input
                          placeholder="Search for courses..."
                          value={courseSearchTerm}
                          onChange={(e) => {
                            setCourseSearchTerm(e.target.value);
                            if (e.target.value.length > 0) {
                              loadCourses();
                            }
                          }}
                          onFocus={() => loadCourses()}
                          className="pl-10 bg-canvas border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {coursesLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#500000]" />
                          <p className="text-sm text-text-body">
                            Loading courses...
                          </p>
                        </div>
                      ) : courses.length === 0 &&
                        courseSearchTerm.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 text-text-body mx-auto mb-3" />
                          <p className="text-sm text-text-body">
                            Start typing to search for courses
                          </p>
                        </div>
                      ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-text-body">
                            No courses found matching &quot;
                            {courseSearchTerm}&quot;
                          </p>
                        </div>
                      ) : (
                        filteredCourses.map((course) => (
                          <div
                            key={course.id}
                            className="p-3 bg-canvas rounded border border-border hover:border-[#500000] transition-colors cursor-pointer"
                            onClick={() => addCourseToComparison(course)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-text-heading">
                                  {course.code}
                                </div>
                                <div className="text-sm text-text-body">
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
                                className="ml-2"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                {/* Course Comparison View */}
                <div className="lg:col-span-2">
                  {selectedCourses.length === 0 ? (
                    <Card className="p-12 bg-card border-border">
                      <div className="text-center">
                        <BookOpen className="w-16 h-16 text-text-body mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-text-heading mb-2">
                          No courses selected
                        </h3>
                        <p className="text-text-body">
                          Search and add courses from the left panel to start
                          comparing.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      <Card className="p-4 bg-card border-border">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-text-heading">
                            Comparing {selectedCourses.length} Course
                            {selectedCourses.length > 1 ? "s" : ""}
                          </h2>
                          <div className="text-sm text-text-body">
                            {4 - selectedCourses.length} more can be added
                          </div>
                        </div>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {selectedCoursesDetails.map((course) => (
                          <Card
                            key={course.code}
                            className="p-4 bg-card border-border"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-text-heading">
                                  {course.code}
                                </h3>
                                <p className="text-sm text-text-body">
                                  {course.name}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  removeCourseFromComparison(
                                    course.code
                                      .toLowerCase()
                                      .replace(/\s+/g, ""),
                                  )
                                }
                                className="text-red-500 hover:text-red-600"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-text-body">
                                  GPA
                                </span>
                                <span className="font-medium text-text-heading">
                                  {course.avgGPA !== -1
                                    ? course.avgGPA.toFixed(2)
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-text-body">
                                  Credits
                                </span>
                                <span className="font-medium text-text-heading">
                                  {course.credits}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-text-body">
                                  Difficulty
                                </span>
                                <Badge variant="outline">
                                  {course.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-text-body">
                                  Rating
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium text-text-heading">
                                    {course.rating
                                      ? course.rating.toFixed(1)
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="professors" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Professor Search */}
                <div className="lg:col-span-1">
                  <Card className="p-6 bg-card border-border">
                    <h2 className="text-xl font-semibold text-text-heading mb-4">
                      Add Professors to Compare
                    </h2>

                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-body" />
                        <Input
                          placeholder="Search for professors..."
                          value={professorSearchTerm}
                          onChange={(e) => {
                            setProfessorSearchTerm(e.target.value);
                            if (e.target.value.length > 0) {
                              loadProfessors();
                            }
                          }}
                          onFocus={() => loadProfessors()}
                          className="pl-10 bg-canvas border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {professorsLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#500000]" />
                          <p className="text-sm text-text-body">
                            Loading professors...
                          </p>
                        </div>
                      ) : professors.length === 0 &&
                        professorSearchTerm.length === 0 ? (
                        <div className="text-center py-8">
                          <GraduationCap className="w-12 h-12 text-text-body mx-auto mb-3" />
                          <p className="text-sm text-text-body">
                            Start typing to search for professors
                          </p>
                        </div>
                      ) : filteredProfessors.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-text-body">
                            No professors found matching &quot;
                            {professorSearchTerm}&quot;
                          </p>
                        </div>
                      ) : (
                        filteredProfessors.map((professor) => (
                          <div
                            key={professor.id}
                            className="p-3 bg-canvas rounded border border-border hover:border-[#500000] transition-colors cursor-pointer"
                            onClick={() => addProfessorToComparison(professor)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-[#500000] to-[#800000] rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium text-text-heading">
                                    {professor.name}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-text-body">
                                      {professor.overall_rating
                                        ? professor.overall_rating.toFixed(1)
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
                                className="ml-2"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                {/* Professor Comparison View */}
                <div className="lg:col-span-2">
                  {selectedProfessors.length === 0 ? (
                    <Card className="p-12 bg-card border-border">
                      <div className="text-center">
                        <GraduationCap className="w-16 h-16 text-text-body mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-text-heading mb-2">
                          No professors selected
                        </h3>
                        <p className="text-text-body">
                          Search and add professors from the left panel to start
                          comparing.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      <Card className="p-4 bg-card border-border">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-text-heading">
                            Comparing {selectedProfessors.length} Professor
                            {selectedProfessors.length > 1 ? "s" : ""}
                          </h2>
                          <div className="text-sm text-text-body">
                            {4 - selectedProfessors.length} more can be added
                          </div>
                        </div>
                      </Card>

                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
                          <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                          >
                            Overview
                          </TabsTrigger>
                          <TabsTrigger
                            value="courses"
                            className="data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                          >
                            Courses
                          </TabsTrigger>
                          <TabsTrigger
                            value="tags"
                            className="data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                          >
                            Tags
                          </TabsTrigger>
                          <TabsTrigger
                            value="reviews"
                            className="data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                          >
                            Reviews
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {professorDetails.map((professor) => (
                              <Card
                                key={professor.id}
                                className="p-4 bg-card border-border"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-[#500000] to-[#800000] rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-text-heading">
                                        {professor.name}
                                      </h3>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      removeProfessorFromComparison(
                                        professor.id,
                                      )
                                    }
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-body">
                                      Overall Rating
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="font-medium text-text-heading">
                                        {professor.overall_rating
                                          ? professor.overall_rating.toFixed(1)
                                          : "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-body">
                                      Reviews
                                    </span>
                                    <span className="font-medium text-text-heading">
                                      {professor.total_reviews}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-body">
                                      Would Take Again
                                    </span>
                                    <span className="font-medium text-text-heading">
                                      {professor.would_take_again_percent
                                        ? professor.would_take_again_percent.toFixed(
                                            0,
                                          )
                                        : "N/A"}
                                      %
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-body">
                                      Courses
                                    </span>
                                    <span className="font-medium text-text-heading">
                                      {professor.courses.length}
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="courses" className="space-y-4">
                          <Card className="p-6 bg-card border-border">
                            <h3 className="text-lg font-semibold text-text-heading mb-4">
                              Courses Taught
                            </h3>
                            <div className="space-y-4">
                              {professorDetails.map((professor) => (
                                <div key={professor.id}>
                                  <h4 className="font-medium text-text-heading mb-2">
                                    {professor.name}
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {professor.courses
                                      .slice(0, 6)
                                      .map((course) => (
                                        <div
                                          key={course.course_id}
                                          className="flex items-center justify-between p-2 bg-canvas rounded border"
                                        >
                                          <span className="text-sm font-medium text-text-heading">
                                            {course.course_id
                                              ? course.course_id
                                              : "Overall Rating"}
                                          </span>
                                          <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs text-text-body">
                                              {course.avg_rating
                                                ? course.avg_rating.toFixed(1)
                                                : "N/A"}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                  {professor.courses.length > 6 && (
                                    <p className="text-xs text-text-body mt-2">
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
                          <Card className="p-6 bg-card border-border">
                            <h3 className="text-lg font-semibold text-text-heading mb-4">
                              Student Tags
                            </h3>
                            <div className="space-y-6">
                              {professorDetails.map((professor) => (
                                <div key={professor.id}>
                                  <h4 className="font-medium text-text-heading mb-3">
                                    {professor.name}
                                  </h4>
                                  {professor.tag_frequencies &&
                                  Object.keys(professor.tag_frequencies)
                                    .length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {Object.entries(professor.tag_frequencies)
                                        .sort(([, a], [, b]) => b - a) // Sort by frequency, highest first
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
                                    <p className="text-sm text-text-body">
                                      No tags available
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </Card>
                        </TabsContent>

                        <TabsContent value="reviews" className="space-y-4">
                          <Card className="p-6 bg-card border-border">
                            <h3 className="text-lg font-semibold text-text-heading mb-4">
                              Recent Reviews
                            </h3>
                            <div className="space-y-6">
                              {professorDetails.map((professor) => (
                                <div key={professor.id}>
                                  <h4 className="font-medium text-text-heading mb-3">
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
                                            className="p-3 bg-canvas rounded border"
                                          >
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium text-text-heading">
                                                  {review.overall_rating
                                                    ? review.overall_rating.toFixed(
                                                        1,
                                                      )
                                                    : "N/A"}
                                                </span>
                                              </div>
                                              <Badge
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {review.grade}
                                              </Badge>
                                              {Object.entries(
                                                review.tags || [],
                                              ).map(([index, tag]) => (
                                                <Badge
                                                  key={index}
                                                  variant="outline"
                                                  className="bg-gradient-to-br from-green-700 to-green-900 text-white border-transparent px-3 py-1 text-xs font-medium"
                                                >
                                                  {tag}
                                                </Badge>
                                              ))}
                                            </div>
                                            <p className="text-sm text-text-body line-clamp-3">
                                              {review.review_text}
                                            </p>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-text-body">
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
      </main>

      <Footer />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-canvas">
          <Navigation />
          <main className="pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12">
                <h1 className="text-3xl font-semibold text-text-heading mb-4">
                  Compare & Discover
                </h1>
                <p className="text-lg text-text-body max-w-2xl mx-auto">
                  Loading comparison tools...
                </p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#500000]" />
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
