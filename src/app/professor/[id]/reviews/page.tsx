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
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/courses">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Courses
                </Button>
              </Link>
              <span className="text-text-body">/</span>
              <Link href={`/professor/${professor.id}`}>
                <Button
                  variant="ghost"
                  className="text-text-heading hover:bg-button-hover dark:text-white dark:hover:bg-[#500000]/10"
                >
                  {professor.name}
                </Button>
              </Link>
            </div>
          </div>

          {/* Professor Header */}
          <div className="mb-8">
            <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#500000] to-[#600000] rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {(
                      professor.name
                        ?.split(" ")
                        .map((n) => n?.[0] || "")
                        .join("") || "PR"
                    ).slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text-heading mb-3">
                    {professor.name} - All Reviews
                  </h1>
                  <div className="flex items-center gap-6 text-md">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 rounded-full shadow-md">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-semibold">
                        {reviewsData.summary.avg_overall.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full shadow-md">
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-semibold">
                        {reviewsData.summary.total_reviews} total reviews
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="w-6 h-6 text-[#500000]" />
              <h3 className="text-2xl font-bold text-text-heading">
                Filter Reviews
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-semibold text-text-heading mb-3 block uppercase tracking-wider">
                  Course
                </label>
                <Select
                  value={courseFilter || "all"}
                  onValueChange={(value) =>
                    setCourseFilter(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="bg-canvas border-border h-12">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent className="bg-canvas border-border">
                    <SelectItem value="all">All Courses</SelectItem>
                    {availableCourses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-text-heading mb-3 block uppercase tracking-wider">
                  Sort By
                </label>
                <Select
                  value={sortBy}
                  onValueChange={(value: "date" | "rating" | "course") =>
                    setSortBy(value)
                  }
                >
                  <SelectTrigger className="bg-canvas border-border h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-canvas border-border">
                    <SelectItem value="date">Date (Newest)</SelectItem>
                    <SelectItem value="rating">Rating (Highest)</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-text-heading mb-3 block uppercase tracking-wider">
                  Min Rating
                </label>
                <Select
                  value={minRating?.toString() || "none"}
                  onValueChange={(value) =>
                    setMinRating(value === "none" ? undefined : Number(value))
                  }
                >
                  <SelectTrigger className="bg-canvas border-border h-12">
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-canvas border-border">
                    <SelectItem value="none">Any Rating</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="default"
                  onClick={() => {
                    setCourseFilter("");
                    setSortBy("date");
                    setMinRating(undefined);
                  }}
                  className="w-full h-12 bg-[#500000] hover:bg-[#600000] text-white hover:scale-105 transition-all duration-200 text-md"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4 mb-8">
            {reviewsData.reviews.map((review) => (
              <Card
                key={review.id}
                className="bg-card border-border hover:border-[#500000] hover:scale-101 transition-all duration-300 hover:shadow-lg/20"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-yellow-600 dark:bg-yellow-500 text-white px-2 py-1 rounded-full shadow-md">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold">
                          {review.overall_rating.toFixed(1)}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-button-primary dark:bg-button-primary text-white border-transparent px-2 py-1 text-xs font-medium"
                      >
                        {review.course.code}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-emerald-600 dark:bg-emerald-500 text-white border-transparent px-2 py-1 text-xs font-medium"
                      >
                        Grade: {review.grade}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-text-body px-2 py-1 rounded-full text-xs">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">
                        {formatDate(review.review_date)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="text-center border-2 border-blue-500 bg-blue-400/10 p-2 rounded-lg">
                      <div className="text-md font-bold text-white">
                        {review.clarity_rating.toFixed(1)}
                      </div>
                      <div className="text-xs font-medium text-white">
                        Clarity
                      </div>
                    </div>
                    <div className="text-center border-2 border-red-500 bg-red-400/10 p-2 rounded-lg">
                      <div className="text-md font-bold text-white">
                        {review.difficulty_rating.toFixed(1)}
                      </div>
                      <div className="text-xs font-medium text-white">
                        Difficulty
                      </div>
                    </div>
                    <div className="text-center border-2 border-green-500 bg-green-400/10 p-2 rounded-lg">
                      <div className="text-md font-bold text-white">
                        {review.helpful_rating.toFixed(1)}
                      </div>
                      <div className="text-xs font-medium text-white">
                        Helpfulness
                      </div>
                    </div>
                    <div className="text-center border-2 border-purple-500 bg-purple-400/10 p-2 rounded-lg">
                      <div className="text-md font-bold text-white">
                        {review.would_take_again ? "Yes" : "No"}
                        <div className="text-xs font-medium text-white">
                          Take Again
                        </div>
                      </div>
                    </div>
                  </div>

                  <blockquote className="text-text-body mb-4 text-md leading-relaxed bg-[#500000]/10 p-3 rounded-lg border-l-4 border-[#500000] italic">
                    &quot;{review.review_text}&quot;
                  </blockquote>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {review.tags?.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-gray-600 dark:bg-gray-500 text-white border-transparent px-2 py-0.5 text-xs font-medium"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-text-body">
                      <div className="flex items-center gap-1 bg-emerald-600 dark:bg-emerald-500 px-2 py-1 rounded-full">
                        <ThumbsUp className="w-3 h-3 text-white" />
                        <span className="font-medium text-white text-xs">
                          {review.thumbs_up}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-red-600 dark:bg-red-500 px-2 py-1 rounded-full">
                        <ThumbsDown className="w-3 h-3 text-white" />
                        <span className="font-medium text-white text-xs">
                          {review.thumbs_down}
                        </span>
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
