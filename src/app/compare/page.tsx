"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCourses, type Course } from "@/lib/api";
import { Search, Plus, Minus, Star, BookOpen } from "lucide-react";

export default function ComparePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses({ limit: 2000 }); // Set a high limit to get all courses
        setCourses(data);
        setFilteredCourses(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load courses");
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const addCourseToComparison = (course: Course) => {
    if (
      selectedCourses.length < 4 &&
      !selectedCourses.find((c) => c.id === course.id)
    ) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const removeCourseFromComparison = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter((c) => c.id !== courseId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-12">
              <div className="text-text-body">Loading courses...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              Error loading courses: {error}
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
              Compare Courses
            </h1>
            <p className="text-lg text-text-body max-w-2xl mx-auto">
              Compare up to 4 courses side by side to make informed decisions
              about your academic path.
            </p>
          </div>

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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-canvas border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredCourses.map((course) => (
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
                            selectedCourses.length >= 4 ||
                            selectedCourses.some((c) => c.id === course.id)
                          }
                          className="ml-2"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Comparison View */}
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
                  {/* Selected Courses Header */}
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

                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="grades">Grades</TabsTrigger>
                      <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {selectedCourses.map((course) => (
                          <Card
                            key={course.id}
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
                                  removeCourseFromComparison(course.id)
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
                                    {course.rating.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="grades" className="space-y-4">
                      <Card className="p-6 bg-card border-border">
                        <h3 className="text-lg font-semibold text-text-heading mb-4">
                          GPA Comparison
                        </h3>
                        <div className="space-y-4">
                          {selectedCourses.map((course) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <span className="font-medium text-text-heading">
                                  {course.code}
                                </span>
                                <span className="text-sm text-text-body ml-2">
                                  ({course.enrollment} students)
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-text-heading">
                                  {course.avgGPA !== -1
                                    ? course.avgGPA.toFixed(2)
                                    : "N/A"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="difficulty" className="space-y-4">
                      <Card className="p-6 bg-card border-border">
                        <h3 className="text-lg font-semibold text-text-heading mb-4">
                          Difficulty & Workload
                        </h3>
                        <div className="space-y-4">
                          {selectedCourses.map((course) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <span className="font-medium text-text-heading">
                                  {course.code}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge variant="outline">
                                  {course.difficulty}
                                </Badge>
                                <div className="text-sm text-text-body">
                                  {course.sections} section
                                  {course.sections !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                      <div className="grid gap-4">
                        {selectedCourses.map((course) => (
                          <Card
                            key={course.id}
                            className="p-4 bg-card border-border"
                          >
                            <h3 className="font-semibold text-text-heading mb-2">
                              {course.code}: {course.name}
                            </h3>
                            <div className="text-sm text-text-body mb-3">
                              {course.department.name}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {course.sectionAttributes
                                .slice(0, 3)
                                .map((attr, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {attr}
                                  </Badge>
                                ))}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
