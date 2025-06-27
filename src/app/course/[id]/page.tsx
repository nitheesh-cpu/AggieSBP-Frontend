"use client";

import React, { useState, useEffect, use } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getCourseDetail, type CourseDetail } from "@/lib/api";
import {
  Star,
  Users,
  BookOpen,
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Eye,
  Award,
  Zap,
  User,
  Check,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useComparison } from "@/contexts/ComparisonContext";
import { useProfessorComparison } from "@/contexts/ProfessorComparisonContext";
import { ComparisonWidget } from "@/components/comparison-widget";
import { ProfessorComparisonWidget } from "@/components/professor-comparison-widget";

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to get department name from course code
const getDepartmentFromCode = (courseCode: string) => {
  const departmentMap: { [key: string]: string } = {
    CSCE: "Computer Science & Engineering",
    MATH: "Mathematics",
    MEEN: "Mechanical Engineering",
    CVEN: "Civil Engineering",
    ECEN: "Electrical & Computer Engineering",
    AERO: "Aerospace Engineering",
    BMEN: "Biomedical Engineering",
    CHEN: "Chemical Engineering",
    INEN: "Industrial & Systems Engineering",
    NUEN: "Nuclear Engineering",
    PETE: "Petroleum Engineering",
    PHYS: "Physics & Astronomy",
    CHEM: "Chemistry",
    BIOL: "Biology",
    STAT: "Statistics",
    ENGR: "Engineering",
    ENGL: "English",
    HIST: "History",
    POLS: "Political Science",
    PSYC: "Psychology",
    ECON: "Economics",
    ACCT: "Accounting",
    FINC: "Finance",
    MGMT: "Management",
    MKTG: "Marketing",
    AGEC: "Agricultural Economics",
    ANSC: "Animal Science",
    COSC: "Construction Science",
    RWFM: "Rangeland, Wildlife & Fisheries Management",
    PHAR: "Pharmacy",
    NURS: "Nursing",
    INTA: "International Affairs",
    LAW: "Law",
  };

  // Extract department code from course code (e.g., "CSCE 121" -> "CSCE")
  const deptCode = courseCode.split(/\s+/)[0];
  return departmentMap[deptCode] || deptCode;
};

// Helper function to get department gradient colors
const getDepartmentColor = (courseCode: string) => {
  const colorMap: { [key: string]: string } = {
    CSCE: "bg-gradient-to-r from-blue-500 to-cyan-500",
    MATH: "bg-gradient-to-r from-indigo-500 to-purple-500",
    MEEN: "bg-gradient-to-r from-gray-500 to-slate-600",
    CVEN: "bg-gradient-to-r from-orange-500 to-red-500",
    ECEN: "bg-gradient-to-r from-yellow-500 to-amber-500",
    AERO: "bg-gradient-to-r from-sky-500 to-blue-500",
    BMEN: "bg-gradient-to-r from-rose-500 to-pink-500",
    CHEN: "bg-gradient-to-r from-green-500 to-emerald-500",
    INEN: "bg-gradient-to-r from-purple-500 to-violet-500",
    NUEN: "bg-gradient-to-r from-red-500 to-orange-500",
    PETE: "bg-gradient-to-r from-amber-500 to-yellow-500",
    PHYS: "bg-gradient-to-r from-purple-600 to-indigo-600",
    CHEM: "bg-gradient-to-r from-green-600 to-teal-500",
    BIOL: "bg-gradient-to-r from-emerald-500 to-green-500",
    STAT: "bg-gradient-to-r from-violet-500 to-purple-500",
    ENGR: "bg-gradient-to-r from-slate-500 to-gray-500",
    ENGL: "bg-gradient-to-r from-pink-500 to-rose-500",
    HIST: "bg-gradient-to-r from-amber-600 to-orange-500",
    POLS: "bg-gradient-to-r from-red-600 to-rose-500",
    ECON: "bg-gradient-to-r from-yellow-600 to-amber-500",
    ACCT: "bg-gradient-to-r from-yellow-500 to-orange-500",
    FINC: "bg-gradient-to-r from-green-600 to-emerald-500",
    MGMT: "bg-gradient-to-r from-blue-600 to-indigo-500",
    MKTG: "bg-gradient-to-r from-pink-600 to-purple-500",
    PHAR: "bg-gradient-to-r from-blue-600 to-purple-500",
    NURS: "bg-gradient-to-r from-red-500 to-pink-500",
    LAW: "bg-gradient-to-r from-purple-600 to-indigo-600",
  };

  const deptCode = courseCode.split(/\s+/)[0];
  return colorMap[deptCode] || "bg-gradient-to-r from-gray-500 to-slate-500";
};

export default function CoursePage({ params }: CoursePageProps) {
  const resolvedParams = use(params);
  const [courseData, setCourseData] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comparison context
  const { addCourse, removeCourse, isSelected, canAddMore } = useComparison();

  // Professor comparison context
  const {
    addProfessor,
    isSelected: isProfessorSelected,
    canAddMore: canAddMoreProfessors,
  } = useProfessorComparison();

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        const data = await getCourseDetail(resolvedParams.id);
        setCourseData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-12">
              <div className="text-text-body">Loading course details...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error || "Course not found"}
            </div>
            <Link href="/courses">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
              </Button>
            </Link>
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
          {/* Breadcrumb */}
          <div>
            <Link href="/courses">
              <Button
                variant="outline"
                className="flex items-center gap-2 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
              </Button>
            </Link>
          </div>

          {/* Course Header */}
          <div className="">
            <Card className="p-6 gap-4 bg-gradient-to-br from-card to-card/50 border-border">
              <div className="flex items-center gap-3 mb-4">
                <Badge
                  variant="outline"
                  className={`${getDepartmentColor(courseData.code)} text-white border-transparent px-3 py-1 text-xs font-medium`}
                >
                  {getDepartmentFromCode(courseData.code)}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent px-3 py-1 text-xs font-medium"
                >
                  {courseData.credits} Credits
                </Badge>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-heading">
                    {courseData.code}: {courseData.name}
                  </h1>

                  <p className="text-text-body mb-4 max-w-4xl leading-relaxed">
                    {courseData.description}
                  </p>
                </div>

                {/* Add to Comparison Button */}
                <Button
                  variant={isSelected(courseData.code) ? "default" : "outline"}
                  onClick={() => {
                    if (isSelected(courseData.code)) {
                      removeCourse(courseData.code);
                    } else {
                      addCourse(courseData.code);
                    }
                  }}
                  disabled={!isSelected(courseData.code) && !canAddMore()}
                  className={`w-full lg:w-auto lg:ml-4 ${
                    isSelected(courseData.code)
                      ? "bg-[#500000] text-white hover:bg-[#600000]"
                      : "border-[#500000] text-[#500000] hover:bg-[#500000] bg-[#500000]/30 text-white"
                  } transition-all duration-200`}
                >
                  {isSelected(courseData.code) ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Added to Compare</span>
                      <span className="sm:hidden">Added</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Add to Compare</span>
                      <span className="sm:hidden">Compare</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-600 border-transparent text-white shadow-md hover:shadow-lg/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-white/90" />
                    <span className="text-white/90 font-medium text-sm">
                      Avg GPA
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {courseData.avgGPA !== -1
                      ? courseData.avgGPA.toFixed(2)
                      : "N/A"}
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-600 border-transparent text-white shadow-md hover:shadow-lg/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-white/90" />
                    <span className="text-white/90 font-medium text-sm">
                      Difficulty
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {courseData.difficulty}
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 border-transparent text-white shadow-md hover:shadow-lg/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-white/90" />
                    <span className="text-white/90 font-medium text-sm">
                      Enrollment
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {courseData.enrollment}
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 border-transparent text-white shadow-md hover:shadow-lg/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-white/90" />
                    <span className="text-white/90 font-medium text-sm">
                      Sections
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {courseData.sections}
                  </div>
                </Card>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-card border-border">
                <h3 className="text-xl font-bold text-heading">
                  Course Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-body uppercase tracking-wider">
                      Description:
                    </span>
                    <p className="text-text-body mt-1 leading-relaxed">
                      {courseData.description}
                    </p>
                  </div>

                  {courseData.prerequisites &&
                    courseData.prerequisites.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-body uppercase tracking-wider">
                          Prerequisites:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {courseData.prerequisites.map(
                            (prereq: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-transparent px-2 py-1 text-xs font-medium"
                              >
                                {prereq}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  <div>
                    <span className="text-xs font-semibold text-body uppercase tracking-wider">
                      Section Attributes:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-2 max-h-24 overflow-y-auto md:max-h-none md:overflow-visible">
                      {courseData.sectionAttributes?.map(
                        (attr: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent px-2 py-1 text-xs font-medium flex-shrink-0"
                          >
                            {attr}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg">
                    <span className="text-xs font-semibold text-body uppercase tracking-wider">
                      Total Sections:
                    </span>
                    <div className="text-xs text-text-body border-gray-500 border-2 px-2 py-1 rounded-full font-medium">
                      {courseData.sections} sections
                    </div>
                  </div>
                </div>
              </Card>

              {/* Professors Section */}
              <Card className="p-4 bg-card border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="text-xl font-bold text-heading">
                    Course Professors
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    {courseData.professors &&
                      courseData.professors.length >= 2 && (
                        <Link
                          href="/compare?tab=professors"
                          className="w-full sm:w-auto"
                        >
                          <Button
                            size="sm"
                            className="bg-[#500000] hover:bg-[#600000] text-white flex items-center gap-2 w-full sm:w-auto"
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              Compare Professors
                            </span>
                            <span className="sm:hidden">Compare</span>
                          </Button>
                        </Link>
                      )}
                    <div className="text-xs text-text-body border-gray-500 border-2 px-2 py-1 rounded-full">
                      {courseData.professors?.length || 0} professors
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {courseData.professors?.map((prof, index: number) => (
                    <Card
                      key={index}
                      className="p-4 gap-0 bg-gradient-to-br from-canvas to-canvas/50 border-border hover:border-[#500000] hover:scale-105 transition-all duration-300 hover:shadow-lg/20 group"
                    >
                      {/* Decorative gradient accent */}
                      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[#500000]/10 to-transparent rounded-bl-3xl group-hover:from-[#500000]/20 transition-all duration-200"></div>

                      <div className="">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-md font-bold text-heading mb-1">
                              {prof.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full shadow-md">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="ml-1 text-xs font-semibold">
                                  {prof.rating.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-0.5 rounded-full shadow-md">
                                <Users className="h-2 w-2" />
                                <span className="ml-1 text-xs font-semibold">
                                  {prof.reviews} reviews
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Professor AI Summary */}
                        {prof.description && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="text-xs font-semibold text-heading uppercase tracking-wide">
                                Summary
                              </h5>
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium"
                              >
                                Generated by AI
                              </Badge>
                            </div>
                            <div className="bg-gradient-to-r from-[#500000]/5 to-[#600000]/5 border border-[#500000]/20 rounded-lg p-3">
                              <p className="text-text-body leading-relaxed text-sm">
                                {prof.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Professor Tags */}
                        {prof.tag_frequencies &&
                          Object.keys(prof.tag_frequencies).length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-xs font-semibold text-heading mb-2 uppercase tracking-wide">
                                Student Tags
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(prof.tag_frequencies)
                                  .sort(([, a], [, b]) => b - a) // Sort by frequency, highest first
                                  .slice(0, 6) // Show top 6 tags
                                  .map(([tag, frequency]) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-transparent px-2 py-1 text-xs font-medium"
                                    >
                                      {tag} ({frequency})
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Grade Distribution for this professor - only show if data exists */}
                      {prof.gradeDistribution && (
                        <div className="border-t border-border pt-3 mt-3">
                          <h5 className="text-sm font-semibold text-heading mb-2">
                            Grade Distribution
                          </h5>
                          <div className="flex gap-1 h-6 mb-2 rounded-lg overflow-hidden shadow-md">
                            <div
                              className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
                              style={{ width: `${prof.gradeDistribution.A}%` }}
                            >
                              {prof.gradeDistribution.A > 12 ? "A" : ""}
                            </div>
                            <div
                              className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                              style={{ width: `${prof.gradeDistribution.B}%` }}
                            >
                              {prof.gradeDistribution.B > 12 ? "B" : ""}
                            </div>
                            <div
                              className="bg-yellow-500 flex items-center justify-center text-white text-xs font-semibold"
                              style={{ width: `${prof.gradeDistribution.C}%` }}
                            >
                              {prof.gradeDistribution.C > 12 ? "C" : ""}
                            </div>
                            <div
                              className="bg-orange-500 flex items-center justify-center text-white text-xs font-semibold"
                              style={{ width: `${prof.gradeDistribution.D}%` }}
                            >
                              {prof.gradeDistribution.D > 12 ? "D" : ""}
                            </div>
                            <div
                              className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold"
                              style={{ width: `${prof.gradeDistribution.F}%` }}
                            >
                              {prof.gradeDistribution.F > 12 ? "F" : ""}
                            </div>
                          </div>
                          <div className="grid grid-cols-5 gap-1 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-green-600 text-sm">
                                {prof.gradeDistribution.A}%
                              </div>
                              <div className="text-body font-medium text-xs">
                                A
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-blue-600 text-sm">
                                {prof.gradeDistribution.B}%
                              </div>
                              <div className="text-body font-medium text-xs">
                                B
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-yellow-600 text-sm">
                                {prof.gradeDistribution.C}%
                              </div>
                              <div className="text-body font-medium text-xs">
                                C
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-orange-600 text-sm">
                                {prof.gradeDistribution.D}%
                              </div>
                              <div className="text-body font-medium text-xs">
                                D
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-red-600 text-sm">
                                {prof.gradeDistribution.F}%
                              </div>
                              <div className="text-body font-medium text-xs">
                                F
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div
                        className={`mt-3 pt-2 ${prof.gradeDistribution ? "border-t border-border" : ""}`}
                      >
                        <div className="flex flex-col sm:flex-row gap-2">
                          {/* Top row on mobile, left side on desktop */}
                          <div className="flex gap-2 sm:flex-1">
                            <Link
                              href={`/professor/${prof.id}`}
                              className="flex-1"
                            >
                              <Button
                                variant="default"
                                className="w-full bg-[#500000] hover:bg-[#600000] text-white transition-all duration-200 hover:scale-105 text-xs py-2"
                              >
                                <User className="w-3 h-3 mr-1" />
                                <span className="sm:hidden">Prof</span>
                                <span className="hidden sm:inline">
                                  Professor
                                </span>
                              </Button>
                            </Link>
                            <Link
                              href={`/professor/${prof.id}/reviews`}
                              className="flex-1"
                            >
                              <Button className="w-full bg-gradient-to-r from-[#500000] to-[#700000] hover:from-[#600000] hover:to-[#800000] text-white transition-all duration-200 hover:scale-105 text-xs py-2">
                                <Eye className="w-3 h-3 mr-1" />
                                <span className="sm:hidden">Reviews</span>
                                <span className="hidden sm:inline">
                                  Reviews ({prof.reviews})
                                </span>
                              </Button>
                            </Link>
                          </div>

                          {/* Bottom row on mobile, right side on desktop */}
                          <Button
                            variant={
                              isProfessorSelected(prof.id)
                                ? "default"
                                : "outline"
                            }
                            onClick={() => {
                              if (isProfessorSelected(prof.id)) {
                                // Remove from comparison
                                // removeProfessor function would be needed here
                              } else {
                                // Add to comparison
                                addProfessor(prof.id);
                              }
                            }}
                            disabled={
                              !isProfessorSelected(prof.id) &&
                              !canAddMoreProfessors()
                            }
                            className={`w-full sm:w-auto sm:min-w-[100px] transition-all duration-200 hover:scale-105 text-xs py-2 ${
                              isProfessorSelected(prof.id)
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "border-[#500000] text-[#500000] hover:bg-[#500000] hover:text-white"
                            }`}
                          >
                            {isProfessorSelected(prof.id) ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                <span className="sm:hidden">Added</span>
                                <span className="hidden sm:inline">Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3 mr-1" />
                                <span className="sm:hidden">Compare</span>
                                <span className="hidden sm:inline">
                                  Compare
                                </span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-3">
              {/* Related Courses */}
              {courseData.relatedCourses &&
                courseData.relatedCourses.length > 0 && (
                  <Card className="p-3 bg-card border-border">
                    <h3 className="text-md font-bold text-heading mb-3">
                      Related Courses
                    </h3>
                    <div className="space-y-2">
                      {courseData.relatedCourses
                        .slice(0, 5)
                        .map((course, index: number) => (
                          <Card
                            key={index}
                            className="gap-2 p-3 bg-gradient-to-br from-canvas to-canvas/50 border-border hover:border-[#500000] hover:scale-101 transition-all duration-300 hover:shadow-md cursor-pointer group relative overflow-hidden"
                          >
                            {/* Small decorative accent */}
                            <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-bl from-[#500000]/10 to-transparent rounded-bl-2xl group-hover:from-[#500000]/20 transition-all duration-200"></div>

                            <div className="text-xs font-bold text-heading">
                              {course.code}
                            </div>
                            <div className="text-xs text-bodyline-clamp-2 leading-relaxed">
                              {course.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge
                                variant="outline"
                                className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent font-medium px-1 py-0.5"
                              >
                                {course.similarity}% match
                              </Badge>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </Card>
                )}

              {/* Quick Actions */}
              <Card className="p-3 bg-gradient-to-br from-card to-card/50 border-border">
                <h3 className="text-md font-bold text-heading">
                  Quick Actions
                </h3>
                <div className="space-y-2 mb-2">
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition-all duration-200 hover:scale-101 py-2 text-xs">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Compare Courses
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition-all duration-200 hover:scale-101 py-2 text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Professor Reviews
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ComparisonWidget />
      <ProfessorComparisonWidget />
    </div>
  );
}
