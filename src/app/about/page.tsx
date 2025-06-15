"use client";

import React, { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Star,
  BookOpen,
  User,
  Plus,
  Minus,
  MessageSquare,
  TrendingUp,
  Filter,
  ArrowRight,
  CheckCircle,
  Eye,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

// Sample data for demonstrations
const sampleCourses = [
  {
    id: "csce121",
    code: "CSCE 121",
    name: "Introduction to Program Design and Concepts",
    avgGPA: 3.18,
    credits: 4,
    difficulty: "Medium",
    rating: 4.6,
    enrollment: 450,
    description:
      "Computation to solve problems. Methods of computing, algorithm development, programming concepts, and data abstraction.",
  },
  {
    id: "math251",
    code: "MATH 251",
    name: "Engineering Mathematics III",
    avgGPA: 2.87,
    credits: 3,
    difficulty: "High",
    rating: 3.9,
    enrollment: 320,
    description:
      "Sequences, series, vectors, partial derivatives, multiple integrals, vector calculus.",
  },
];

// const sampleProfessors = [
//   {
//     id: "prof1",
//     name: "Dr. Sarah Johnson",
//     overall_rating: 4.7,
//     total_reviews: 89,
//     would_take_again_percent: 85,
//     departments: ["CSCE - Computer Sci & Engr"],
//     courses_taught: ["CSCE 121", "CSCE 314", "CSCE 411"],
//   },
//   {
//     id: "prof2",
//     name: "Prof. Michael Chen",
//     overall_rating: 4.2,
//     total_reviews: 67,
//     would_take_again_percent: 78,
//     departments: ["MATH - Mathematics"],
//     courses_taught: ["MATH 251", "MATH 308", "MATH 411"],
//   },
// ];

const sampleReview = {
  id: "1",
  overall_rating: 4.5,
  clarity_rating: 4.0,
  difficulty_rating: 3.5,
  helpful_rating: 4.5,
  would_take_again: true,
  grade: "A",
  review_text:
    "Great professor! Explains concepts clearly and is always willing to help during office hours. The assignments are challenging but fair.",
  review_date: "2024-01-15",
  tags: ["Clear Explanations", "Helpful", "Fair Grading"],
  thumbs_up: 12,
  thumbs_down: 2,
};

export default function AboutPage() {
  const [activeDemo, setActiveDemo] = useState<string>("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const addToComparison = (courseId: string) => {
    if (!selectedCourses.includes(courseId) && selectedCourses.length < 4) {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const removeFromComparison = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-text-heading mb-6">
              Welcome to AggieSB+
            </h1>
            <p className="text-xl text-text-body max-w-3xl mx-auto mb-8">
              Your comprehensive guide to Texas A&M courses and professors. Make
              informed decisions about your academic journey with real student
              reviews, detailed course information, and powerful comparison
              tools.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/courses">
                <Button className="bg-[#500000] hover:bg-[#600000] text-white px-6 py-3">
                  Start Exploring Courses
                </Button>
              </Link>
              <Link href="/professors">
                <Button variant="outline" className="px-6 py-3">
                  Browse Professors
                </Button>
              </Link>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-text-heading text-center mb-8">
              How It Works
            </h2>

            <Tabs
              value={activeDemo}
              onValueChange={setActiveDemo}
              className="w-full"
            >
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-card border border-border">
                  <TabsTrigger
                    value="search"
                    className="data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    Search
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="compare"
                    className="data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    Compare
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:bg-[#500000] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="search" className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-text-heading mb-4">
                    1. Search for Courses & Professors
                  </h3>
                  <p className="text-text-body max-w-2xl mx-auto">
                    Use our powerful search to find courses by code, name, or
                    department.
                  </p>
                </div>

                <Card className="p-6 bg-card border-border max-w-2xl mx-auto">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-body" />
                    <Input
                      placeholder="Search courses (try 'CSCE' or 'calculus')"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-canvas border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    {sampleCourses
                      .filter(
                        (course) =>
                          searchTerm === "" ||
                          course.code
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          course.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      )
                      .map((course) => (
                        <div
                          key={course.id}
                          className="p-3 bg-canvas rounded border border-border"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-text-heading">
                                {course.code}
                              </div>
                              <div className="text-sm text-text-body">
                                {course.name}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">
                                  GPA: {course.avgGPA}
                                </Badge>
                                <Badge variant="outline">
                                  {course.difficulty}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">
                                    {course.rating}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-text-heading mb-4">
                    2. View Detailed Information
                  </h3>
                  <p className="text-text-body max-w-2xl mx-auto">
                    Get comprehensive details about courses including GPA data
                    and professor information.
                  </p>
                </div>

                <Card className="p-6 bg-card border-border max-w-4xl mx-auto">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-text-heading mb-2">
                        {sampleCourses[0].code}
                      </h3>
                      <p className="text-text-body mb-4">
                        {sampleCourses[0].name}
                      </p>
                    </div>
                    <Button
                      onClick={() => addToComparison(sampleCourses[0].id)}
                      disabled={selectedCourses.includes(sampleCourses[0].id)}
                      className="bg-[#500000] hover:bg-[#600000] text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Compare
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-canvas rounded border">
                      <div className="text-lg font-bold text-text-heading">
                        {sampleCourses[0].avgGPA}
                      </div>
                      <div className="text-sm text-text-body">Avg GPA</div>
                    </div>
                    <div className="text-center p-3 bg-canvas rounded border">
                      <div className="text-lg font-bold text-text-heading">
                        {sampleCourses[0].credits}
                      </div>
                      <div className="text-sm text-text-body">Credits</div>
                    </div>
                    <div className="text-center p-3 bg-canvas rounded border">
                      <div className="text-lg font-bold text-text-heading">
                        {sampleCourses[0].difficulty}
                      </div>
                      <div className="text-sm text-text-body">Difficulty</div>
                    </div>
                    <div className="text-center p-3 bg-canvas rounded border">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-bold text-text-heading">
                          {sampleCourses[0].rating}
                        </span>
                      </div>
                      <div className="text-sm text-text-body">Rating</div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="compare" className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-text-heading mb-4">
                    3. Compare Side by Side
                  </h3>
                  <p className="text-text-body max-w-2xl mx-auto">
                    Compare up to 4 courses at once to make the best choice.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="p-6 bg-card border-border">
                    <h4 className="text-lg font-semibold text-text-heading mb-4">
                      Add to Comparison
                    </h4>
                    <div className="space-y-2">
                      {sampleCourses.map((course) => (
                        <div
                          key={course.id}
                          className="p-3 bg-canvas rounded border border-border"
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
                              onClick={() => addToComparison(course.id)}
                              disabled={selectedCourses.includes(course.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="lg:col-span-2">
                    {selectedCourses.length === 0 ? (
                      <Card className="p-12 bg-card border-border">
                        <div className="text-center">
                          <BookOpen className="w-16 h-16 text-text-body mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-text-heading mb-2">
                            No courses selected
                          </h3>
                          <p className="text-text-body">
                            Add courses from the left to start comparing.
                          </p>
                        </div>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        <Card className="p-4 bg-card border-border">
                          <h4 className="text-lg font-semibold text-text-heading">
                            Comparing {selectedCourses.length} Course
                            {selectedCourses.length > 1 ? "s" : ""}
                          </h4>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedCourses.map((courseId) => {
                            const course = sampleCourses.find(
                              (c) => c.id === courseId,
                            );
                            if (!course) return null;

                            return (
                              <Card
                                key={courseId}
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
                                      removeFromComparison(courseId)
                                    }
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-body">
                                      GPA
                                    </span>
                                    <span className="font-medium text-text-heading">
                                      {course.avgGPA}
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
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-text-heading mb-4">
                    4. Read Real Student Reviews
                  </h3>
                  <p className="text-text-body max-w-2xl mx-auto">
                    Get insights from real students who have taken the courses.
                  </p>
                </div>

                <Card className="p-6 bg-card border-border max-w-4xl mx-auto">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold">
                          {sampleReview.overall_rating}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-gradient-to-r from-[#500000] to-[#600000] text-white border-transparent"
                      >
                        CSCE 121
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white border-transparent"
                      >
                        Grade: {sampleReview.grade}
                      </Badge>
                    </div>
                    <div className="text-sm text-text-body">
                      {new Date(sampleReview.review_date).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </div>
                  </div>

                  <blockquote className="text-text-body mb-4 leading-relaxed bg-[#500000]/10 p-3 rounded-lg border-l-4 border-[#500000] italic">
                    &quot;{sampleReview.review_text}&quot;
                  </blockquote>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {sampleReview.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-gradient-to-r from-gray-500 to-gray-700 text-white border-transparent"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="font-medium text-green-600 text-xs">
                          {sampleReview.thumbs_up}
                        </span>
                      </div>
                      {sampleReview.thumbs_down > 0 && (
                        <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
                          <TrendingDown className="w-3 h-3 text-red-600" />
                          <span className="font-medium text-red-600 text-xs">
                            {sampleReview.thumbs_down}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-text-heading text-center mb-12">
              Key Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-heading">
                    Smart Search
                  </h3>
                </div>
                <p className="text-text-body">
                  Find courses and professors quickly with intelligent search
                  and filtering.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-heading">
                    Detailed Information
                  </h3>
                </div>
                <p className="text-text-body">
                  Get comprehensive course details including GPA data and
                  professor information.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-heading">
                    Student Reviews
                  </h3>
                </div>
                <p className="text-text-body">
                  Read authentic reviews from students with detailed ratings and
                  feedback.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-heading">
                    Advanced Filtering
                  </h3>
                </div>
                <p className="text-text-body">
                  Use powerful filters to narrow down by GPA, difficulty, and
                  department.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-heading">
                    Side-by-Side Comparison
                  </h3>
                </div>
                <p className="text-text-body">
                  Compare up to 4 courses or professors to make informed
                  decisions.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-heading">
                    Professor Profiles
                  </h3>
                </div>
                <p className="text-text-body">
                  Explore detailed professor profiles with ratings and student
                  feedback.
                </p>
              </Card>
            </div>
          </div>

          {/* Getting Started */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-heading mb-8">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-text-body mb-8 max-w-2xl mx-auto">
              Join thousands of Aggies who use AggieSB+ to make smarter course
              decisions.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/courses">
                <Button className="bg-[#500000] hover:bg-[#600000] text-white px-8 py-3 text-lg">
                  Browse Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/professors">
                <Button variant="outline" className="px-8 py-3 text-lg">
                  Find Professors
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
