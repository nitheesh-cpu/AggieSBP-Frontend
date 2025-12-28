"use client";

import React, { useState, useEffect, use } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getProfessorReviews,
  getProfessor,
  type ProfessorReviews,
  type ProfessorDetail,
} from "@/lib/api";
import {
  Star,
  ArrowLeft,
  MessageSquare,
  Filter,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface ProfessorReviewsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProfessorReviewsPage({
  params,
}: ProfessorReviewsPageProps) {
  const resolvedParams = use(params);
  const [professor, setProfessor] = useState<ProfessorDetail | null>(null);
  const [reviewsData, setReviewsData] = useState<ProfessorReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "rating" | "course">("date");
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 25;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching professor reviews for ID:", resolvedParams.id);

        const [professorData, reviewsResponse] = await Promise.all([
          getProfessor(resolvedParams.id),
          getProfessorReviews(resolvedParams.id, {
            course_filter: courseFilter || undefined,
            sort_by: sortBy,
            min_rating: minRating,
            limit: itemsPerPage,
            skip: (currentPage - 1) * itemsPerPage,
          }),
        ]);

        console.log("Professor data:", professorData);
        console.log("Reviews data:", reviewsResponse);

        setProfessor(professorData);
        setReviewsData(reviewsResponse);
        setError(null);
      } catch (err) {
        console.error("Error fetching professor reviews:", err);
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, courseFilter, sortBy, minRating, currentPage]);

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  useEffect(() => {
    handleFilterChange();
  }, [courseFilter, sortBy, minRating]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#500000]" />
              <div className="text-text-body">Loading professor reviews...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !professor || !reviewsData) {
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
            <div className="text-center py-12">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold text-text-heading mb-2">
                Failed to Load Reviews
              </h3>
              <p className="text-text-body mb-4">
                {error || "Reviews could not be loaded"}
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalPages = Math.ceil(reviewsData.pagination.total / itemsPerPage);
  const availableCourses = [
    ...new Set(
      professor.courses?.map((c) => c.course_id).filter(Boolean) || []
    ),
  ];

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
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Button */}
          <div className="mb-6">
            <Link href={`/professor/${professor.id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to {professor.name}
              </Button>
            </Link>
          </div>

          {/* Professor Header - Compact */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#500000] to-[#700000] rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-lg font-bold">
                  {(
                    professor.name
                      ?.split(" ")
                      .map((n) => n?.[0] || "")
                      .join("") || "PR"
                  ).slice(0, 2)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-heading dark:text-white">
                  {professor.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">
                      {reviewsData.summary.avg_overall.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-text-body/30 dark:text-white/20">•</span>
                  <span className="text-text-body dark:text-white/70">
                    {reviewsData.summary.total_reviews} reviews
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Compact inline */}
          <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-border dark:border-white/10">
            <Filter className="w-4 h-4 text-text-body/50 dark:text-white/40" />
            <Select
              value={courseFilter || "all"}
              onValueChange={(value) =>
                setCourseFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[140px] h-9 bg-canvas border-border text-sm dark:bg-white/5 dark:border-white/10">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent className="bg-canvas border-border dark:bg-black dark:border-white/10">
                <SelectItem value="all">All Courses</SelectItem>
                {availableCourses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: "date" | "rating" | "course") =>
                setSortBy(value)
              }
            >
              <SelectTrigger className="w-[140px] h-9 bg-canvas border-border text-sm dark:bg-white/5 dark:border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-canvas border-border dark:bg-black dark:border-white/10">
                <SelectItem value="date">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="course">By Course</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={minRating?.toString() || "none"}
              onValueChange={(value) =>
                setMinRating(value === "none" ? undefined : Number(value))
              }
            >
              <SelectTrigger className="w-[120px] h-9 bg-canvas border-border text-sm dark:bg-white/5 dark:border-white/10">
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent className="bg-canvas border-border dark:bg-black dark:border-white/10">
                <SelectItem value="none">Any Rating</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
              </SelectContent>
            </Select>

            {(courseFilter || minRating) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCourseFilter("");
                  setSortBy("date");
                  setMinRating(undefined);
                }}
                className="text-text-body/70 hover:text-text-heading dark:text-white/60 dark:hover:text-white h-9"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Reviews Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-heading dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Student Reviews
            </h2>
            <span className="text-sm text-text-body/60 dark:text-white/50">
              {reviewsData.reviews.length} shown
            </span>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 mb-8">
            {reviewsData.reviews.map((review) => (
              <Card
                key={review.id}
                className="bg-card border-border hover:border-[#500000]/50 transition-all duration-300 hover:shadow-lg dark:bg-black/45 dark:border-white/10"
              >
                <CardContent className="p-5">
                  {/* Header Row: Rating, Course, Grade, Date */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Overall Rating - Larger and more prominent */}
                      <div className="flex items-center gap-1.5 bg-yellow-500 text-black px-3 py-1.5 rounded-lg shadow-sm font-bold">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-base">
                          {review.overall_rating.toFixed(1)}
                        </span>
                      </div>
                      {/* Course Code */}
                      <Badge className="bg-[#500000] text-white border-transparent px-2.5 py-0.5 text-xs font-semibold">
                        {review.course.code}
                      </Badge>
                      {/* Grade */}
                      <Badge className="bg-emerald-600 dark:bg-emerald-500 text-white border-transparent px-2.5 py-0.5 text-xs font-semibold">
                        {review.grade}
                      </Badge>
                      {/* Would Take Again */}
                      <Badge className={`${review.would_take_again ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-500 dark:bg-gray-600'} text-white border-transparent px-2.5 py-0.5 text-xs font-semibold`}>
                        {review.would_take_again ? "Would retake ✓" : "Wouldn't retake"}
                      </Badge>
                    </div>
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-text-body/70 dark:text-white/60 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(review.review_date)}</span>
                    </div>
                  </div>

                  {/* Compact Metrics Row */}
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-text-body dark:text-white/80">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{review.clarity_rating.toFixed(1)}</span>
                      <span className="text-text-body/60 dark:text-white/50">clarity</span>
                    </div>
                    <span className="text-text-body/30 dark:text-white/20">•</span>
                    <div className="flex items-center gap-1.5 text-text-body dark:text-white/80">
                      <span className="text-red-600 dark:text-red-400 font-semibold">{review.difficulty_rating.toFixed(1)}</span>
                      <span className="text-text-body/60 dark:text-white/50">difficulty</span>
                    </div>
                    <span className="text-text-body/30 dark:text-white/20">•</span>
                    <div className="flex items-center gap-1.5 text-text-body dark:text-white/80">
                      <span className="text-green-600 dark:text-green-400 font-semibold">{review.helpful_rating.toFixed(1)}</span>
                      <span className="text-text-body/60 dark:text-white/50">helpful</span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-text-body dark:text-white/90 mb-4 leading-relaxed">
                    {review.review_text}
                  </p>

                  {/* Footer: Tags & Votes */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {review.tags?.slice(0, 4).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-canvas dark:bg-white/5 text-text-body dark:text-white/70 border-border dark:border-white/10 px-2 py-0.5 text-xs font-medium"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Votes */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-text-body/60 dark:text-white/50 text-xs">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{review.thumbs_up}</span>
                      </div>
                      <div className="flex items-center gap-1 text-text-body/60 dark:text-white/50 text-xs">
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{review.thumbs_down}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="default"
                size="lg"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-[#500000] hover:bg-[#600000] text-white hover:scale-105 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="lg"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-[#500000] text-white hover:bg-[#600000] hover:scale-105 transition-all duration-200"
                          : "border-border hover:border-[#500000] hover:scale-105 transition-all duration-200"
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="default"
                size="lg"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="bg-[#500000] hover:bg-[#600000] text-white hover:scale-105 transition-all duration-200"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {reviewsData.reviews.length === 0 && (
            <Card className="text-center py-16 bg-gradient-to-br from-card to-card/50 border-border">
              <div className="text-8xl mb-6">📝</div>
              <h3 className="text-3xl font-bold text-text-heading mb-4">
                No reviews found
              </h3>
              <p className="text-lg text-text-body">
                Try adjusting your filter criteria
              </p>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
