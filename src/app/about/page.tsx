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
        {/* Ambient background */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            background: "var(--app-bg-ambient)",
          }}
        />

        <Navigation variant="glass" />

        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Hero Section */}
            <AnimatedSection delay={0.02} className="mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
                <div className="lg:col-span-3">
                  <Badge
                    variant="outline"
                    className="mb-5 border-border bg-card text-text-heading dark:border-white/20 dark:bg-black/25 dark:text-white/90"
                  >
                    About AggieSB+
                  </Badge>

                  <h1 className="text-[22px] sm:text-[26px] md:text-[30px] leading-relaxed text-text-heading dark:text-white mb-6">
                    Pick better classes with real outcomes — GPA data, reviews,
                    and comparisons in one place.
                  </h1>

                  <div className="flex gap-4 mb-8">
                    <div className="w-[2px] rounded-full bg-[#FFCF3F]" />
                    <p className="text-[11px] sm:text-[12px] md:text-[13px] leading-relaxed text-text-body max-w-2xl dark:text-white/80">
                      AggieSB+ helps Texas A&M students choose courses and
                      professors with confidence: grade distributions, course
                      rigor signals, and authentic student feedback — designed
                      to be fast, clean, and decision-first.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Link href="/courses">
                      <Button className="bg-[#FFCF3F] text-[#0f0f0f] hover:bg-[#FFD966] rounded-full px-6">
                        Explore courses
                      </Button>
                    </Link>
                    <Link href="/professors">
                      <Button
                        variant="outline"
                        className="rounded-full border-border bg-card text-text-heading hover:bg-button-hover dark:border-white/25 dark:bg-black/20 dark:text-white dark:hover:bg-black/35 dark:hover:text-white"
                      >
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
                      className="object-contain drop-shadow-[0_18px_38px_rgba(0,0,0,0.55)]"
                      priority
                    />
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* How It Works */}
            <AnimatedSection delay={0.06} className="mb-16">
              <h2 className="text-text-heading dark:text-white text-center mb-8 text-[18px] sm:text-[20px] md:text-[22px] leading-relaxed">
                How it works
              </h2>

              <Tabs
                value={activeDemo}
                onValueChange={setActiveDemo}
                className="w-full"
              >
                <div className="flex justify-center mb-8">
                  <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-card border border-border dark:bg-black/35 dark:border-white/10">
                    <TabsTrigger
                      value="search"
                      className="data-[state=active]:bg-[#FFCF3F] data-[state=active]:text-[#0f0f0f] data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Search
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="data-[state=active]:bg-[#FFCF3F] data-[state=active]:text-[#0f0f0f] data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="compare"
                      className="data-[state=active]:bg-[#FFCF3F] data-[state=active]:text-[#0f0f0f] data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Compare
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="data-[state=active]:bg-[#FFCF3F] data-[state=active]:text-[#0f0f0f] data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Reviews
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="search" className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold text-text-heading dark:text-white mb-4">
                      1. Search for Courses & Professors
                    </h3>
                    <p className="text-text-body max-w-2xl mx-auto dark:text-white/75">
                      Use our powerful search to find courses by code, name, or
                      department.
                    </p>
                  </div>

                  <Card className="p-6 bg-card border-border max-w-2xl mx-auto dark:bg-black/35 dark:border-white/10">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-body dark:text-white/60" />
                      <Input
                        placeholder="Search courses (try 'CSCE' or 'calculus')"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-canvas border-border text-text-body placeholder:text-text-body/60 dark:bg-black/35 dark:border-white/10 dark:text-white dark:placeholder:text-white/45"
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
                                <div className="font-medium text-text-heading dark:text-white">
                                  {course.code}
                                </div>
                                <div className="text-sm text-text-body dark:text-white/75">
                                  {course.name}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className="border-border text-text-body dark:border-white/15 dark:text-white/80"
                                  >
                                    GPA: {course.avgGPA}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="border-border text-text-body dark:border-white/15 dark:text-white/80"
                                  >
                                    {course.difficulty}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-text-body dark:text-white/85">
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
                    <h3 className="text-2xl font-semibold text-text-heading dark:text-white mb-4">
                      2. View Detailed Information
                    </h3>
                    <p className="text-text-body max-w-2xl mx-auto dark:text-white/75">
                      Get comprehensive details about courses including GPA data
                      and professor information.
                    </p>
                  </div>

                  <Card className="p-6 bg-card border-border max-w-4xl mx-auto dark:bg-black/35 dark:border-white/10">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-text-heading dark:text-white mb-2">
                          {sampleCourses[0].code}
                        </h3>
                        <p className="text-text-body mb-4 dark:text-white/75">
                          {sampleCourses[0].name}
                        </p>
                      </div>
                      <Button
                        onClick={() => addToComparison(sampleCourses[0].id)}
                        disabled={selectedCourses.includes(sampleCourses[0].id)}
                        className="bg-[#FFCF3F] text-[#0f0f0f] hover:bg-[#FFD966]"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Compare
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-canvas rounded border border-border dark:bg-black/30 dark:border-white/10">
                        <div className="text-lg font-bold text-text-heading dark:text-white">
                          {sampleCourses[0].avgGPA}
                        </div>
                        <div className="text-sm text-text-body/80 dark:text-white/65">
                          Avg GPA
                        </div>
                      </div>
                      <div className="text-center p-3 bg-canvas rounded border border-border dark:bg-black/30 dark:border-white/10">
                        <div className="text-lg font-bold text-text-heading dark:text-white">
                          {sampleCourses[0].credits}
                        </div>
                        <div className="text-sm text-text-body/80 dark:text-white/65">
                          Credits
                        </div>
                      </div>
                      <div className="text-center p-3 bg-canvas rounded border border-border dark:bg-black/30 dark:border-white/10">
                        <div className="text-lg font-bold text-text-heading dark:text-white">
                          {sampleCourses[0].difficulty}
                        </div>
                        <div className="text-sm text-text-body/80 dark:text-white/65">
                          Difficulty
                        </div>
                      </div>
                      <div className="text-center p-3 bg-canvas rounded border border-border dark:bg-black/30 dark:border-white/10">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-bold text-text-heading dark:text-white">
                            {sampleCourses[0].rating}
                          </span>
                        </div>
                        <div className="text-sm text-text-body/80 dark:text-white/65">
                          Rating
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="compare" className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold text-text-heading dark:text-white mb-4">
                      3. Compare Side by Side
                    </h3>
                    <p className="text-text-body max-w-2xl mx-auto dark:text-white/75">
                      Compare up to 4 courses at once to make the best choice.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="p-6 bg-card border-border dark:bg-black/35 dark:border-white/10">
                      <h4 className="text-lg font-semibold text-text-heading dark:text-white mb-4">
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
                                <div className="font-medium text-text-heading dark:text-white">
                                  {course.code}
                                </div>
                                <div className="text-sm text-text-body dark:text-white/75">
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
                        <Card className="p-12 bg-card border-border dark:bg-black/35 dark:border-white/10">
                          <div className="text-center">
                            <BookOpen className="w-16 h-16 text-text-body/60 mx-auto mb-4 dark:text-white/60" />
                            <h3 className="text-xl font-semibold text-text-heading dark:text-white mb-2">
                              No courses selected
                            </h3>
                            <p className="text-text-body dark:text-white/75">
                              Add courses from the left to start comparing.
                            </p>
                          </div>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          <Card className="p-4 bg-card border-border dark:bg-black/35 dark:border-white/10">
                            <h4 className="text-lg font-semibold text-text-heading dark:text-white">
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
                                  className="p-4 bg-card border-border dark:bg-black/35 dark:border-white/10"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h3 className="font-semibold text-text-heading dark:text-white">
                                        {course.code}
                                      </h3>
                                      <p className="text-sm text-text-body dark:text-white/75">
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
                                      <span className="text-sm text-text-body/80 dark:text-white/65">
                                        GPA
                                      </span>
                                      <span className="font-medium text-text-heading dark:text-white">
                                        {course.avgGPA}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-text-body/80 dark:text-white/65">
                                        Credits
                                      </span>
                                      <span className="font-medium text-text-heading dark:text-white">
                                        {course.credits}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-text-body/80 dark:text-white/65">
                                        Difficulty
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="border-border text-text-body dark:border-white/15 dark:text-white/80"
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
                    <h3 className="text-2xl font-semibold text-text-heading dark:text-white mb-4">
                      4. Read Real Student Reviews
                    </h3>
                    <p className="text-text-body max-w-2xl mx-auto dark:text-white/75">
                      Get insights from real students who have taken the
                      courses.
                    </p>
                  </div>

                  <Card className="p-6 bg-card border-border max-w-4xl mx-auto dark:bg-black/35 dark:border-white/10">
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
                      <div className="text-sm text-text-body/70 dark:text-white/60">
                        {new Date(sampleReview.review_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </div>

                    <blockquote className="text-text-body mb-4 leading-relaxed bg-[#500000]/10 p-3 rounded-lg border-l-4 border-[#FFCF3F] italic dark:text-white/80 dark:bg-[#500000]/15">
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
            </AnimatedSection>

            {/* Features */}

            <AnimatedSection delay={0.1} className="mb-16">
              <h2 className="text-text-heading dark:text-white text-center mb-12 text-[18px] sm:text-[20px] md:text-[22px] leading-relaxed">
                Key features
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="p-6 bg-card border-border dark:bg-black/35 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-heading dark:text-white">
                      Smart Search
                    </h3>
                  </div>
                  <p className="text-text-body dark:text-white/75">
                    Find courses and professors quickly with intelligent search
                    and filtering.
                  </p>
                </Card>

                <Card className="p-6 bg-card border-border dark:bg-black/35 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-heading dark:text-white">
                      Detailed Information
                    </h3>
                  </div>
                  <p className="text-text-body dark:text-white/75">
                    Get comprehensive course details including GPA data and
                    professor information.
                  </p>
                </Card>

                <Card className="p-6 bg-card border-border dark:bg-black/35 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-heading dark:text-white">
                      Student Reviews
                    </h3>
                  </div>
                  <p className="text-text-body dark:text-white/75">
                    Read authentic reviews from students with detailed ratings
                    and feedback.
                  </p>
                </Card>

                <Card className="p-6 bg-card border-border dark:bg-black/35 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                      <Filter className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-heading dark:text-white">
                      Advanced Filtering
                    </h3>
                  </div>
                  <p className="text-text-body dark:text-white/75">
                    Use powerful filters to narrow down by GPA, difficulty, and
                    department.
                  </p>
                </Card>

                <Card className="p-6 bg-card border-border dark:bg-black/35 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-heading dark:text-white">
                      Side-by-Side Comparison
                    </h3>
                  </div>
                  <p className="text-text-body dark:text-white/75">
                    Compare up to 4 courses or professors to make informed
                    decisions.
                  </p>
                </Card>

                <Card className="p-6 bg-card border-border dark:bg-black/35 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#500000] rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-heading dark:text-white">
                      Professor Profiles
                    </h3>
                  </div>
                  <p className="text-text-body dark:text-white/75">
                    Explore detailed professor profiles with ratings and student
                    feedback.
                  </p>
                </Card>
              </div>
            </AnimatedSection>

            {/* Getting Started */}
            <AnimatedSection delay={0.14} className="text-center">
              <h2 className="text-text-heading dark:text-white mb-8 text-[18px] sm:text-[20px] md:text-[22px] leading-relaxed">
                Ready to get started?
              </h2>
              <p className="text-text-body mb-8 max-w-2xl mx-auto dark:text-white/75">
                Join thousands of Aggies who use AggieSB+ to make smarter course
                decisions.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/courses">
                  <Button className="bg-[#FFCF3F] text-[#0f0f0f] hover:bg-[#FFD966] rounded-full px-8">
                    Browse courses
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/professors">
                  <Button
                    variant="outline"
                    className="rounded-full border-border bg-card text-text-heading hover:bg-button-hover px-8 dark:border-white/25 dark:bg-black/20 dark:text-white dark:hover:bg-black/35 dark:hover:text-white"
                  >
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
