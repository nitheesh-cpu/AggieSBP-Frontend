"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
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

type AnimatedSectionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

function AnimatedSection({
  children,
  className,
  delay = 0,
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className={className}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay },
        },
      }}
    >
      {children}
    </motion.section>
  );
}

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

        <Navigation variant="glass" />

        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Hero Section */}
            <AnimatedSection delay={0.02} className="mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
                <div className="lg:col-span-3">
                  <Badge
                    variant="outline"
                    className="mb-5 border-border bg-card text-text-heading dark:border-border-strong"
                  >
                    About AggieSB+
                  </Badge>

                  <h1 className="text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-medium text-text-heading mb-6">
                    Pick classes by real outcomes: GPA data, reviews and
                    comparisons in one place
                  </h1>

                  <p className="mb-8 max-w-2xl text-base leading-7 text-text-body">
                    AggieSB+ helps Texas A&amp;M students choose courses and
                    professors with grade distributions, course difficulty and
                    student reviews, all on one page per course and professor.
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Link href="/courses">
                      <Button size="lg">
                        Explore courses
                      </Button>
                    </Link>
                    <Link href="/professors">
                      <Button variant="outline" size="lg">
                        Browse professors
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-2 flex justify-center lg:justify-end">
                  <div className="relative w-full max-w-[34rem] aspect-[16/9] lg:max-w-[32rem]">
                    <Image
                      src="/reveille.png"
                      alt="Reveille"
                      fill
                      sizes="(min-width: 1024px) 512px, (min-width: 640px) 544px, 100vw"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* How It Works */}
            <AnimatedSection delay={0.06} className="mb-16">
              <h2 className="text-text-heading text-center mb-8 text-2xl font-medium leading-tight">
                How it works
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
                      className="data-[state=active]:bg-raised data-[state=active]:text-text-heading data-[state=active]:shadow-none transition-colors duration-150"
                    >
                      Search
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="data-[state=active]:bg-raised data-[state=active]:text-text-heading data-[state=active]:shadow-none transition-colors duration-150"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="compare"
                      className="data-[state=active]:bg-raised data-[state=active]:text-text-heading data-[state=active]:shadow-none transition-colors duration-150"
                    >
                      Compare
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="data-[state=active]:bg-raised data-[state=active]:text-text-heading data-[state=active]:shadow-none transition-colors duration-150"
                    >
                      Reviews
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="search" className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-medium text-text-heading mb-4">
                      1. Search for Courses & Professors
                    </h3>
                    <p className="text-text-body max-w-2xl mx-auto">
                      Use our powerful search to find courses by code, name, or
                      department.
                    </p>
                  </div>

                  <Card className="p-6 bg-card border-border max-w-2xl mx-auto">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-body dark:text-text-muted" />
                      <Input
                        placeholder="Search courses (try 'CSCE' or 'calculus')"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-canvas border-border text-text-body placeholder:text-text-muted dark:bg-card dark:text-text-heading dark:placeholder:text-white/65"
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
                              .includes(searchTerm.toLowerCase())
                        )
                        .map((course) => (
                          <div
                            key={course.id}
                            className="p-3 bg-black/30 rounded border border-white/10"
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
                                  <Badge
                                    variant="outline"
                                    className="border-border text-text-body"
                                  >
                                    GPA: {course.avgGPA}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="border-border text-text-body"
                                  >
                                    {course.difficulty}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-text-body">
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
                    <h3 className="text-2xl font-medium text-text-heading mb-4">
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
                        <h3 className="text-2xl font-medium text-text-heading mb-2">
                          {sampleCourses[0].code}
                        </h3>
                        <p className="text-text-body mb-4">
                          {sampleCourses[0].name}
                        </p>
                      </div>
                      <Button
                        onClick={() => addToComparison(sampleCourses[0].id)}
                        disabled={selectedCourses.includes(sampleCourses[0].id)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Compare
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-canvas rounded border border-border dark:bg-card">
                        <div className="text-lg font-medium text-text-heading">
                          {sampleCourses[0].avgGPA}
                        </div>
                        <div className="text-sm text-text-muted">
                          Avg GPA
                        </div>
                      </div>
                      <div className="text-center p-3 bg-canvas rounded border border-border dark:bg-card">
                        <div className="text-lg font-medium text-text-heading">
                          {sampleCourses[0].credits}
                        </div>
                        <div className="text-sm text-text-muted">
                          Credits
                        </div>
                      </div>
                      <div className="text-center p-3 bg-canvas rounded border border-border dark:bg-card">
                        <div className="text-lg font-medium text-text-heading">
                          {sampleCourses[0].difficulty}
                        </div>
                        <div className="text-sm text-text-muted">
                          Difficulty
                        </div>
                      </div>
                      <div className="text-center p-3 bg-canvas rounded border border-border dark:bg-card">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-medium text-text-heading">
                            {sampleCourses[0].rating}
                          </span>
                        </div>
                        <div className="text-sm text-text-muted">
                          Rating
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="compare" className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-medium text-text-heading mb-4">
                      3. Compare Side by Side
                    </h3>
                    <p className="text-text-body max-w-2xl mx-auto">
                      Compare up to 4 courses at once to make the best choice.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="p-6 gap-0 bg-card border-border shadow-none">
                      <h4 className="text-lg font-medium text-text-heading mb-4">
                        Add to Comparison
                      </h4>
                      <div className="space-y-2">
                        {sampleCourses.map((course) => (
                          <div
                            key={course.id}
                            className="p-3 bg-black/30 rounded border border-white/10"
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
                            <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-text-heading mb-2">
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
                            <h4 className="text-lg font-medium text-text-heading">
                              Comparing {selectedCourses.length} Course
                              {selectedCourses.length > 1 ? "s" : ""}
                            </h4>
                          </Card>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCourses.map((courseId) => {
                              const course = sampleCourses.find(
                                (c) => c.id === courseId
                              );
                              if (!course) return null;

                              return (
                                <Card
                                  key={courseId}
                                  className="p-4 bg-card border-border"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h3 className="font-medium text-text-heading">
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
                                      <span className="text-sm text-text-muted">
                                        GPA
                                      </span>
                                      <span className="font-medium text-text-heading">
                                        {course.avgGPA}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-text-muted">
                                        Credits
                                      </span>
                                      <span className="font-medium text-text-heading">
                                        {course.credits}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-text-muted">
                                        Difficulty
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="border-border text-text-body"
                                      >
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
                    <h3 className="text-2xl font-medium text-text-heading mb-4">
                      4. Read Real Student Reviews
                    </h3>
                    <p className="text-text-body max-w-2xl mx-auto">
                      Get insights from real students who have taken the
                      courses.
                    </p>
                  </div>

                  <Card className="p-6 bg-card border-border max-w-4xl mx-auto">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 border border-border text-text-heading px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">
                            {sampleReview.overall_rating}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-raised text-white border-transparent"
                        >
                          CSCE 121
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-border bg-transparent text-text-body"
                        >
                          Grade: {sampleReview.grade}
                        </Badge>
                      </div>
                      <div className="text-sm text-text-muted">
                        {new Date(sampleReview.review_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </div>

                    <blockquote className="text-text-body mb-4 leading-relaxed bg-canvas p-3 rounded-lg border-l-2 border-border-strong">
                      &quot;{sampleReview.review_text}&quot;
                    </blockquote>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {sampleReview.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-border bg-transparent text-text-body"
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
            </AnimatedSection>

            {/* Features */}

            <AnimatedSection delay={0.1} className="mb-16">
              <h2 className="text-text-heading text-center mb-12 text-2xl font-medium leading-tight">
                What you can do
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="p-6 gap-0 bg-card border-border shadow-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center text-text-muted">
                      <Search strokeWidth={1.5} className="w-[18px] h-[18px]" />
                    </div>
                    <h3 className="text-base font-medium text-text-heading">
                      Smart search
                    </h3>
                  </div>
                  <p className="text-text-body">
                    Find courses and professors quickly with intelligent search
                    and filtering.
                  </p>
                </Card>

                <Card className="p-6 gap-0 bg-card border-border shadow-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center text-text-muted">
                      <BookOpen strokeWidth={1.5} className="w-[18px] h-[18px]" />
                    </div>
                    <h3 className="text-base font-medium text-text-heading">
                      Detailed information
                    </h3>
                  </div>
                  <p className="text-text-body">
                    Get comprehensive course details including GPA data and
                    professor information.
                  </p>
                </Card>

                <Card className="p-6 gap-0 bg-card border-border shadow-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center text-text-muted">
                      <MessageSquare strokeWidth={1.5} className="w-[18px] h-[18px]" />
                    </div>
                    <h3 className="text-base font-medium text-text-heading">
                      Student reviews
                    </h3>
                  </div>
                  <p className="text-text-body">
                    Read authentic reviews from students with detailed ratings
                    and feedback.
                  </p>
                </Card>

                <Card className="p-6 gap-0 bg-card border-border shadow-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center text-text-muted">
                      <Filter strokeWidth={1.5} className="w-[18px] h-[18px]" />
                    </div>
                    <h3 className="text-base font-medium text-text-heading">
                      Advanced filtering
                    </h3>
                  </div>
                  <p className="text-text-body">
                    Use powerful filters to narrow down by GPA, difficulty, and
                    department.
                  </p>
                </Card>

                <Card className="p-6 gap-0 bg-card border-border shadow-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center text-text-muted">
                      <CheckCircle strokeWidth={1.5} className="w-[18px] h-[18px]" />
                    </div>
                    <h3 className="text-base font-medium text-text-heading">
                      Side-by-side comparison
                    </h3>
                  </div>
                  <p className="text-text-body">
                    Compare up to 4 courses or professors to make informed
                    decisions.
                  </p>
                </Card>

                <Card className="p-6 gap-0 bg-card border-border shadow-none">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center text-text-muted">
                      <User strokeWidth={1.5} className="w-[18px] h-[18px]" />
                    </div>
                    <h3 className="text-base font-medium text-text-heading">
                      Professor profiles
                    </h3>
                  </div>
                  <p className="text-text-body">
                    Explore detailed professor profiles with ratings and student
                    feedback.
                  </p>
                </Card>
              </div>
            </AnimatedSection>

            {/* Getting Started */}
            <AnimatedSection delay={0.14} className="text-center">
              <h2 className="text-text-heading mb-8 text-2xl font-medium leading-tight">
                Ready to plan your semester
              </h2>
              <p className="text-text-body mb-8 max-w-2xl mx-auto">
                Search a course or a professor and see the grades, reviews and
                difficulty before you register.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/courses">
                  <Button size="lg">
                    Browse courses
                    <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/professors">
                  <Button variant="outline" size="lg">
                    Find professors
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
