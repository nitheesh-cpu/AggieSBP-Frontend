"use client";

import React, { useState, useEffect, useRef } from "react";
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
  AlertCircle,
  Calendar,
  MessageSquareText,
} from "lucide-react";
import Link from "next/link";

interface ReviewsPageClientProps {
  /** Loaded on the server (page.tsx); unknown professors never get here. */
  initialProfessor: ProfessorDetail;
  /** First page with the default filters (newest first), loaded on the server. */
  initialReviews: ProfessorReviews;
  /** Reviews per page; the server loaded the first page with this size. */
  pageSize: number;
}

type SortBy = "date" | "rating" | "course";

function queryKey(course: string, sort: SortBy, min: number | undefined, page: number) {
  return `${course}|${sort}|${min ?? ""}|${page}`;
}

// UTC so the server-rendered date matches the browser's.
function formatDate(dateString: string) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ProfessorReviewsPageClient({
  initialProfessor,
  initialReviews,
  pageSize,
}: ReviewsPageClientProps) {
  const professor = initialProfessor;
  const [reviewsData, setReviewsData] = useState<ProfessorReviews>(initialReviews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [courseFilter, setCourseFilterState] = useState<string>("");
  const [sortBy, setSortByState] = useState<SortBy>("date");
  const [minRating, setMinRatingState] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = pageSize;

  // Changing a filter goes back to the first page.
  const setCourseFilter = (value: string) => {
    setCourseFilterState(value);
    setCurrentPage(1);
  };
  const setSortBy = (value: SortBy) => {
    setSortByState(value);
    setCurrentPage(1);
  };
  const setMinRating = (value: number | undefined) => {
    setMinRatingState(value);
    setCurrentPage(1);
  };

  // The server already loaded the default view; only fetch once it changes.
  const loadedKey = useRef(queryKey("", "date", undefined, 1));

  useEffect(() => {
    const key = queryKey(courseFilter, sortBy, minRating, currentPage);
    if (key === loadedKey.current) return;
    let cancelled = false;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const reviewsResponse = await getProfessorReviews(professor.id, {
          course_filter: courseFilter || undefined,
          sort_by: sortBy,
          min_rating: minRating,
          limit: itemsPerPage,
          skip: (currentPage - 1) * itemsPerPage,
        });
        if (cancelled) return;
        loadedKey.current = key;
        setReviewsData(reviewsResponse);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching professor reviews:", err);
        setError("Reviews couldn't be loaded just now. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [professor.id, courseFilter, sortBy, minRating, currentPage, itemsPerPage]);

  const unfiltered = !courseFilter && minRating === undefined;
  // The reviews endpoint has no total; without filters the profile's review
  // count gives the real page count.
  const totalPages = Math.max(
    Math.ceil(reviewsData.pagination.total / itemsPerPage),
    unfiltered ? Math.ceil((professor.total_reviews ?? 0) / itemsPerPage) : 0,
    currentPage,
  );
  const rating =
    typeof professor.overall_rating === "number"
      ? professor.overall_rating
      : reviewsData.summary.avg_overall;
  const reviewCount = professor.total_reviews ?? reviewsData.summary.total_reviews;
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
              <div className="w-14 h-14 bg-raised rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-lg font-medium">
                  {(
                    professor.name
                      ?.split(" ")
                      .map((n) => n?.[0] || "")
                      .join("") || "PR"
                  ).slice(0, 2)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-medium text-text-heading">
                  {professor.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-text-body/30 dark:text-text-muted">•</span>
                  <span className="text-text-body">
                    {reviewCount.toLocaleString("en-US")}{" "}
                    {reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Compact inline */}
          <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-border">
            <Filter className="w-4 h-4 text-text-muted" />
            <Select
              value={courseFilter || "all"}
              onValueChange={(value) =>
                setCourseFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[140px] h-9 bg-canvas border-border text-sm dark:bg-raised">
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

            <Select
              value={sortBy}
              onValueChange={(value: SortBy) => setSortBy(value)}
            >
              <SelectTrigger className="w-[140px] h-9 bg-canvas border-border text-sm dark:bg-raised">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-canvas border-border">
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
              <SelectTrigger className="w-[120px] h-9 bg-canvas border-border text-sm dark:bg-raised">
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent className="bg-canvas border-border">
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
                className="text-text-muted hover:text-text-heading h-9"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Reviews Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-text-heading flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Student reviews
            </h2>
            <span className="text-sm text-text-muted" aria-live="polite">
              {loading ? "Loading…" : `${reviewsData.reviews.length} shown`}
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Reviews List */}
          <div
            className={`space-y-4 mb-8 transition-opacity ${loading ? "opacity-60" : ""}`}
            aria-busy={loading}
          >
            {reviewsData.reviews.map((review) => (
              <Card
                key={review.id}
                className="bg-card border-border hover:border-border-strong transition-colors duration-150"
              >
                <CardContent className="p-5">
                  {/* Header Row: Rating, Course, Grade, Date */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Overall Rating - Larger and more prominent */}
                      {review.overall_rating != null && (
                        <div
                          className="flex items-center gap-1 border border-border bg-raised px-2 h-7 rounded-md"
                          title="This student's quality rating (1-5)"
                        >
                          <span className="font-mono text-sm text-text-heading">
                            {review.overall_rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {/* Course Code */}
                      <span className="code-tag">{review.course.code}</span>
                      {/* Grade */}
                      <Badge variant="outline" className="border-border font-mono font-normal text-text-body">
                        Grade {review.grade}
                      </Badge>
                      {/* Would Take Again */}
                      <Badge variant="outline" className={`border-border font-normal ${review.would_take_again ? "text-positive" : "text-text-muted"}`}>
                        {review.would_take_again ? "Would retake" : "Wouldn't retake"}
                      </Badge>
                    </div>
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-text-muted text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(review.review_date)}</span>
                    </div>
                  </div>

                  {/* Compact Metrics Row */}
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-text-body">
                      <span className="font-mono text-text-heading">{review.clarity_rating.toFixed(1)}</span>
                      <span className="text-text-muted">clarity</span>
                    </div>
                    <span className="text-text-body/30 dark:text-text-muted">•</span>
                    <div className="flex items-center gap-1.5 text-text-body">
                      <span className="font-mono text-text-heading">{review.difficulty_rating.toFixed(1)}</span>
                      <span className="text-text-muted">difficulty</span>
                    </div>
                    <span className="text-text-body/30 dark:text-text-muted">•</span>
                    <div className="flex items-center gap-1.5 text-text-body">
                      <span className="font-mono text-text-heading">{review.helpful_rating.toFixed(1)}</span>
                      <span className="text-text-muted">helpful</span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-text-body dark:text-text-heading mb-4 leading-relaxed">
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
                          className="bg-canvas dark:bg-raised text-text-body border-border px-2 py-0.5 text-xs font-medium"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Votes */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-text-muted text-xs">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{review.thumbs_up}</span>
                      </div>
                      <div className="flex items-center gap-1 text-text-muted text-xs">
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
                size="lg"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
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
                          ? "bg-maroon-band text-on-maroon hover:bg-maroon-band"
                          : ""
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                size="lg"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                variant="outline"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {!loading && reviewsData.reviews.length === 0 && (
            <Card className="text-center py-16 bg-card border-border">
              <MessageSquareText strokeWidth={1.5} className="w-6 h-6 text-text-muted mx-auto mb-3" aria-hidden />
              <h3 className="text-3xl font-medium text-text-heading mb-4">
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
