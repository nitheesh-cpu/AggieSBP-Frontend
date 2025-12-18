"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compareCourses, type CourseDetail } from "@/lib/api";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Star,
  Zap,
  Loader2,
  AlertCircle,
  BookOpen,
  Target,
  Trophy,
  BarChart3,
  CheckCircle,
  Info,
  Award,
  User,
  Layers,
} from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

function CourseComparisonPageContent() {
  const { selectedCourses, clearAll } = useComparison();
  const router = useRouter();
  const [courses, setCourses] = useState<CourseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (selectedCourses.length < 2) {
      router.push("/courses");
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const cleanedCourses = selectedCourses.map((course) =>
          course.replace(/\s+/g, "")
        );
        const courseData = await compareCourses(cleanedCourses);
        setCourses(courseData);
        setError(null);
      } catch (err) {
        console.error("Error fetching course comparison:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load course comparison"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedCourses, router]);

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case "Light":
        return "bg-emerald-600 dark:bg-emerald-500 text-white border-transparent";
      case "Moderate":
        return "bg-yellow-600 dark:bg-yellow-500 text-white border-transparent";
      case "Challenging":
        return "bg-orange-600 dark:bg-orange-500 text-white border-transparent";
      case "Intensive":
        return "bg-red-600 dark:bg-red-500 text-white border-transparent";
      case "Rigorous":
        return "bg-red-700 dark:bg-red-600 text-white border-transparent";
      default:
        return "bg-gray-600 dark:bg-gray-500 text-white border-transparent";
    }
  };

  const getDifficultyScore = (difficulty: string) => {
    switch (difficulty) {
      case "Light":
        return 1;
      case "Moderate":
        return 2;
      case "Challenging":
        return 3;
      case "Intensive":
        return 4;
      case "Rigorous":
        return 5;
      default:
        return 0;
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeColors: { [key: string]: string } = {
      A: "bg-green-500",
      B: "bg-blue-500",
      C: "bg-yellow-500",
      D: "bg-orange-500",
      F: "bg-red-500",
    };
    return gradeColors[grade] || "bg-gray-400";
  };

  // Analysis calculations
  const courseAnalysis = useMemo(() => {
    if (courses.length === 0) return null;

    const avgGPAs = courses.map((c) => c.avgGPA).filter((gpa) => gpa !== -1);
    const ratings = courses
      .map((c) => c.rating)
      .filter((r): r is number => r !== undefined && r > 0);
    const enrollments = courses
      .map((c) => c.enrollment)
      .filter((e): e is number => e !== undefined && e > 0);
    const difficulties = courses
      .map((c) => getDifficultyScore(c.difficulty))
      .filter((d) => d > 0);

    return {
      bestGPA: avgGPAs.length > 0 ? Math.max(...avgGPAs) : 0,
      worstGPA: avgGPAs.length > 0 ? Math.min(...avgGPAs) : 0,
      bestRating: ratings.length > 0 ? Math.max(...ratings) : 0,
      worstRating: ratings.length > 0 ? Math.min(...ratings) : 0,
      highestEnrollment: enrollments.length > 0 ? Math.max(...enrollments) : 0,
      lowestEnrollment: enrollments.length > 0 ? Math.min(...enrollments) : 0,
      easiestDifficulty:
        difficulties.length > 0 ? Math.min(...difficulties) : 0,
      hardestDifficulty:
        difficulties.length > 0 ? Math.max(...difficulties) : 0,
      avgCredits:
        courses.reduce((sum, c) => sum + c.credits, 0) / courses.length,
    };
  }, [courses]);

  if (loading) {
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
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-16">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-[#500000]" />
              <h3 className="text-xl font-semibold text-heading mb-2">
                Loading Course Comparison
              </h3>
              <p className="text-body">Fetching detailed course data...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
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
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <Card className="max-w-2xl mx-auto mt-16 p-8 text-center bg-red-50 border-red-200">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-2xl font-semibold text-heading mb-4">
                Failed to Load Comparison
              </h3>
              <p className="text-body mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button onClick={() => router.push("/courses")}>
                  Back to Courses
                </Button>
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
      style={{ background: "var(--app-bg-gradient)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--app-bg-ambient)" }}
      />
      <Navigation variant="glass" />

      <main className="pt-24 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Enhanced Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <Link href="/courses">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-[#500000] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Courses
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={clearAll}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Clear All & Start Over
              </Button>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-heading mb-4 bg-gradient-to-r from-[#500000] to-[#800000] bg-clip-text text-transparent">
                Course Comparison Analysis
              </h1>
              <p className="text-xl text-body max-w-3xl mx-auto">
                In-depth comparison of {courses.length} courses with detailed
                metrics, analytics, and insights to help you make informed
                decisions.
              </p>
            </div>

            {/* Quick Stats Banner */}
            {courseAnalysis && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    <div>
                      <div className="text-sm opacity-90">Highest GPA</div>
                      <div className="text-lg font-bold">
                        {courseAnalysis.bestGPA.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-transparent">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    <div>
                      <div className="text-sm opacity-90">Best Rating</div>
                      <div className="text-lg font-bold">
                        {courseAnalysis.bestRating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-transparent">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <div>
                      <div className="text-sm opacity-90">Max Enrollment</div>
                      <div className="text-lg font-bold">
                        {courseAnalysis.highestEnrollment.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white border-transparent">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <div>
                      <div className="text-sm opacity-90">Avg Credits</div>
                      <div className="text-lg font-bold">
                        {courseAnalysis.avgCredits.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Enhanced Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-8 h-12 bg-card border border-border">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:border-[#500000] transition-all duration-200"
              >
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="detailed"
                className="flex items-center gap-2 data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:border-[#500000] transition-all duration-200"
              >
                <Target className="w-4 h-4" />
                Detailed
              </TabsTrigger>
              <TabsTrigger
                value="professors"
                className="flex items-center gap-2 data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:border-[#500000] transition-all duration-200"
              >
                <User className="w-4 h-4" />
                Professors
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:border-[#500000] transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div
                className={`grid grid-cols-1 ${courses.length === 2 ? "md:grid-cols-2" : courses.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"} gap-6`}
              >
                {courses.map((course, index) => (
                  <Card
                    key={course.code}
                    className="bg-gradient-to-br from-card to-card/50 border-border hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                  >
                    {/* Course Rank Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        className={`${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"} text-white`}
                      >
                        #{index + 1}
                      </Badge>
                    </div>

                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#500000]/10 to-transparent rounded-bl-full"></div>

                    <CardHeader className="pb-4 relative z-10">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-heading mb-2">
                          {course.code}
                        </h3>
                        <p className="text-sm text-body mb-3 line-clamp-2 min-h-[2.5rem]">
                          {course.name}
                        </p>
                        <div className="flex justify-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-500 border-blue-700"
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            {course.credits} Credits
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-500 border-purple-700"
                          >
                            <Layers className="w-3 h-3 mr-1" />
                            {course.sections || "N/A"} Sections
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Enhanced Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <span className="text-2xl font-bold text-green-700">
                              {course.avgGPA !== -1
                                ? course.avgGPA.toFixed(2)
                                : "N/A"}
                            </span>
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Average GPA
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Star className="w-5 h-5 text-yellow-600 fill-current" />
                            <span className="text-2xl font-bold text-yellow-700">
                              {course.rating ? course.rating.toFixed(1) : "N/A"}
                            </span>
                          </div>
                          <div className="text-xs text-yellow-600 font-medium">
                            Student Rating
                          </div>
                        </div>
                      </div>

                      {/* Difficulty & Popularity */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-body">
                            Difficulty
                          </span>
                          <Badge
                            className={getDifficultyBadgeColor(
                              course.difficulty
                            )}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            {course.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-body">
                            Enrollment
                          </span>
                          <div className="flex items-center gap-1 text-sm font-medium text-body">
                            <Users className="w-4 h-4" />
                            {course.enrollment?.toLocaleString() || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Course Description */}
                      <div>
                        <h4 className="text-sm font-medium text-heading mb-2 ">
                          Description
                        </h4>
                        <p className="text-sm text-body line-clamp-3 p-2 rounded bg-gray-50/30">
                          {course.description || "No description available."}
                        </p>
                      </div>

                      {/* Prerequisites */}
                      {course.prerequisites &&
                        course.prerequisites.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-heading mb-2">
                              Prerequisites
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {course.prerequisites
                                .slice(0, 3)
                                .map((prereq, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs bg-red-50 border-red-200 text-red-700"
                                  >
                                    {prereq}
                                  </Badge>
                                ))}
                              {course.prerequisites.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{course.prerequisites.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Action Button */}
                      <Link href={`/course/${course.code.replace(/\s+/g, "")}`}>
                        <Button className="w-full bg-gradient-to-r from-[#500000] to-[#700000] hover:from-[#600000] hover:to-[#800000] text-white transition-all duration-300">
                          View Full Details
                          <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Detailed Comparison Tab */}
            <TabsContent value="detailed" className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader>
                  <h3 className="text-xl font-semibold text-heading flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Detailed Course Comparison
                  </h3>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-gray-50/50">
                          <th className="text-left p-4 font-medium text-heading">
                            Metric
                          </th>
                          {courses.map((course) => (
                            <th
                              key={course.code}
                              className="text-center p-4 font-medium text-heading min-w-[150px]"
                            >
                              {course.code}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border hover:bg-gray-50/50">
                          <td className="p-4 font-medium text-body">
                            Course Name
                          </td>
                          {courses.map((course) => (
                            <td
                              key={course.code}
                              className="p-4 text-center text-sm text-body"
                            >
                              {course.name}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border hover:bg-gray-50/50">
                          <td className="p-4 font-medium text-body">Credits</td>
                          {courses.map((course) => (
                            <td key={course.code} className="p-4 text-center">
                              <Badge variant="outline">{course.credits}</Badge>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border hover:bg-gray-50/50">
                          <td className="p-4 font-medium text-body">
                            Average GPA
                          </td>
                          {courses.map((course) => (
                            <td key={course.code} className="p-4 text-center">
                              <span
                                className={`font-semibold ${course.avgGPA >= 3.5 ? "text-green-600" : course.avgGPA >= 3.0 ? "text-yellow-600" : "text-red-600"}`}
                              >
                                {course.avgGPA !== -1
                                  ? course.avgGPA.toFixed(2)
                                  : "N/A"}
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border hover:bg-gray-50/50">
                          <td className="p-4 font-medium text-body">
                            Student Rating
                          </td>
                          {courses.map((course) => (
                            <td key={course.code} className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-semibold">
                                  {course.rating
                                    ? course.rating.toFixed(1)
                                    : "N/A"}
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border hover:bg-gray-50/50">
                          <td className="p-4 font-medium text-body">
                            Difficulty
                          </td>
                          {courses.map((course) => (
                            <td key={course.code} className="p-4 text-center">
                              <Badge
                                className={getDifficultyBadgeColor(
                                  course.difficulty
                                )}
                              >
                                {course.difficulty}
                              </Badge>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border hover:bg-gray-50/50">
                          <td className="p-4 font-medium text-body">
                            Enrollment
                          </td>
                          {courses.map((course) => (
                            <td
                              key={course.code}
                              className="p-4 text-center font-semibold text-body"
                            >
                              {course.enrollment?.toLocaleString() || "N/A"}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border hover:bg-gray-50/50">
                          <td className="p-4 font-medium text-body">
                            Sections
                          </td>
                          {courses.map((course) => (
                            <td
                              key={course.code}
                              className="p-4 text-center font-semibold text-body"
                            >
                              {course.sections || "N/A"}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border hover:bg-gray-50/50">
                          <td className="p-4 font-medium text-body">
                            Prerequisites
                          </td>
                          {courses.map((course) => (
                            <td key={course.code} className="p-4 text-center">
                              {course.prerequisites &&
                              course.prerequisites.length > 0 ? (
                                <Badge
                                  variant="outline"
                                  className="bg-red-50 border-red-200 text-red-700"
                                >
                                  {course.prerequisites.length} required
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 border-green-200 text-green-700"
                                >
                                  None
                                </Badge>
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professors Tab */}
            <TabsContent value="professors" className="space-y-6">
              <div className="grid gap-6">
                {courses.map((course) => (
                  <Card key={course.code} className="overflow-hidden">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-heading flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {course.code} - Top Professors
                      </h3>
                    </CardHeader>
                    <CardContent>
                      {course.professors && course.professors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {course.professors.map((prof, index) => (
                            <Card
                              key={index}
                              className="p-4 bg-[#500000] border-gray-200"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-heading text-sm">
                                    {prof.name}
                                  </h4>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-xs font-medium">
                                      {prof.rating
                                        ? prof.rating.toFixed(1)
                                        : "N/A"}
                                    </span>
                                    <span className="text-xs text-body">
                                      ({prof.reviews} reviews)
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {prof.gradeDistribution && (
                                <div className="space-y-2">
                                  <h5 className="text-xs font-medium text-body">
                                    Grade Distribution
                                  </h5>
                                  <div className="grid grid-cols-5 gap-1">
                                    {Object.entries(prof.gradeDistribution).map(
                                      ([grade, percentage]) => (
                                        <div
                                          key={grade}
                                          className="text-center"
                                        >
                                          <div
                                            className={`w-full h-8 ${getGradeColor(grade)} rounded-sm flex items-center justify-center text-white text-xs font-bold`}
                                          >
                                            {grade}
                                          </div>
                                          <div className="text-xs text-body mt-1">
                                            {percentage}%
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {prof.teachingStyle && (
                                <div className="mt-3">
                                  <h5 className="text-xs font-medium text-body mb-1">
                                    Teaching Style
                                  </h5>
                                  <p className="text-xs text-body">
                                    {prof.teachingStyle}
                                  </p>
                                </div>
                              )}

                              {prof.tag_frequencies &&
                                Object.keys(prof.tag_frequencies).length >
                                  0 && (
                                  <div className="mt-3">
                                    <h5 className="text-xs font-medium text-body mb-2">
                                      Student Tags
                                    </h5>
                                    <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                                      {Object.entries(prof.tag_frequencies)
                                        .sort(([, a], [, b]) => b - a) // Sort by frequency, highest first
                                        .slice(0, 4) // Show top 4 tags only on mobile
                                        .map(([tag, frequency]) => (
                                          <Badge
                                            key={tag}
                                            variant="outline"
                                            className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-transparent px-2 py-1 text-xs font-medium flex-shrink-0 truncate max-w-[120px]"
                                          >
                                            {tag} ({frequency})
                                          </Badge>
                                        ))}
                                    </div>
                                  </div>
                                )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-body">
                          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No professor data available for this course.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {courseAnalysis && (
                <>
                  {/* Comparative Analysis */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-xl font-semibold text-heading flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Comparative Analysis
                      </h3>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* GPA Analysis */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-heading">
                            GPA Distribution
                          </h4>
                          <div className="space-y-2">
                            {courses.map((course) => (
                              <div
                                key={course.code}
                                className="flex items-center gap-3"
                              >
                                <div className="w-16 text-sm font-medium text-body">
                                  {course.code}
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                                  <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                                    style={{
                                      width: `${(course.avgGPA / 4) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="w-12 text-sm font-semibold text-body text-right">
                                  {course.avgGPA !== -1
                                    ? course.avgGPA.toFixed(2)
                                    : "N/A"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Rating Analysis */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-heading">
                            Student Ratings
                          </h4>
                          <div className="space-y-2">
                            {courses.map((course) => (
                              <div
                                key={course.code}
                                className="flex items-center gap-3"
                              >
                                <div className="w-16 text-sm font-medium text-body">
                                  {course.code}
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                                  <div
                                    className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full"
                                    style={{
                                      width: `${((course.rating || 0) / 5) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="w-12 text-sm font-semibold text-body text-right">
                                  {course.rating
                                    ? course.rating.toFixed(1)
                                    : "N/A"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-blue-50/10 border border-blue-200 rounded-lg p-6">
                        <h4 className="font-semibold text-heading flex items-center gap-2 mb-4">
                          <Info className="w-5 h-5 text-blue-600" />
                          Recommendations
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <h5 className="font-medium text-heading text-sm">
                                Easiest Course
                              </h5>
                              <p className="text-sm text-body">
                                {
                                  courses.find(
                                    (c) =>
                                      getDifficultyScore(c.difficulty) ===
                                      courseAnalysis.easiestDifficulty
                                  )?.code
                                }{" "}
                                - Best for maintaining high GPA
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                              <h5 className="font-medium text-heading text-sm">
                                Highest Rated
                              </h5>
                              <p className="text-sm text-body">
                                {
                                  courses.find(
                                    (c) =>
                                      c.rating === courseAnalysis.bestRating
                                  )?.code
                                }{" "}
                                - Students love this course
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <h5 className="font-medium text-heading text-sm">
                                Best GPA
                              </h5>
                              <p className="text-sm text-body">
                                {
                                  courses.find(
                                    (c) => c.avgGPA === courseAnalysis.bestGPA
                                  )?.code
                                }{" "}
                                - Historically strong performance
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div>
                              <h5 className="font-medium text-heading text-sm">
                                Most Popular
                              </h5>
                              <p className="text-sm text-body">
                                {
                                  courses.find(
                                    (c) =>
                                      c.enrollment ===
                                      courseAnalysis.highestEnrollment
                                  )?.code
                                }{" "}
                                - High student demand
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CourseComparisonPage() {
  return <CourseComparisonPageContent />;
}
