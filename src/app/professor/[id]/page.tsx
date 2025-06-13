"use client";

import React, { useState, useEffect, use } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProfessor, type ProfessorDetail } from "@/lib/api";
import {
  Star,
  TrendingUp,
  ArrowLeft,
  MessageSquare,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface ProfessorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProfessorPage({ params }: ProfessorPageProps) {
  const resolvedParams = use(params);
  const [professor, setProfessor] = useState<ProfessorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        setLoading(true);
        const professorData = await getProfessor(resolvedParams.id);
        setProfessor(professorData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load professor data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfessor();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#500000]" />
              <div className="text-text-body">Loading professor profile...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !professor) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-12">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold text-text-heading mb-2">
                Professor Not Found
              </h3>
              <p className="text-text-body mb-4">
                {error || "Professor profile could not be loaded"}
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

          {/* Professor Header */}
          <div className="">
            {/* Main Professor Info Card */}
            <Card className="bg-card border-border mb-8 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#500000] to-[#600000] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl font-bold">
                        {(
                          professor.name
                            ?.split(" ")
                            .map((n) => n?.[0] || "")
                            .join("") || "PR"
                        ).slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-2xl font-bold text-text-heading mb-2">
                        {professor.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 text-text-body">
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-yellow-700">
                            {professor.overall_rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-sm">
                            {professor.total_reviews} reviews
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-sm">
                            {professor.would_take_again_percent.toFixed(0)}%
                            would take again
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="lg:ml-auto">
                    <Link href={`/professor/${professor.id}/reviews`}>
                      <Button className="bg-[#500000] hover:bg-[#600000] hover:scale-105 text-white px-4 py-2 text-sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View All Reviews
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Departments */}
                {professor.departments && professor.departments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h3 className="text-xs font-semibold text-text-heading mb-2 uppercase tracking-wide">
                      Departments
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {professor.departments.map((dept, index) =>
                        dept ? (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gradient-to-r from-[#500000] to-[#600000] text-white border-transparent px-2 py-1 text-xs"
                          >
                            {dept}
                          </Badge>
                        ) : null,
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Courses Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-heading">
                Courses Taught
              </h2>
              <div className="text-sm text-text-body border-gray-500 border-2 px-3 py-1 rounded-full">
                {professor.courses?.filter((course) => course.course_id)
                  .length || 0}{" "}
                courses
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {professor.courses?.map((course) =>
                course.course_id ? (
                  <Card
                    key={course.course_id}
                    className="bg-card border-border hover:border-[#500000] hover:scale-105 transition-all duration-300 group"
                  >
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-text-heading mb-1 transition-colors">
                          {course.course_id}
                        </h3>
                        <p className="text-text-body line-clamp-2 leading-relaxed text-sm">
                          {course.course_name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="font-semibold text-yellow-700 text-sm">
                            {course.avg_rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-text-body">
                          <MessageSquare className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {course.reviews_count} reviews
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/course/${course.course_id?.replace(/\s+/g, "") || ""}`}
                      >
                        <Button
                          variant="default"
                          className="w-full bg-[#500000] hover:bg-[#600000] text-white transition-all duration-200 text-sm py-2"
                        >
                          View Course Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : null,
              )}
            </div>
          </div>

          {/* Recent Reviews Section */}
          {professor.recent_reviews && professor.recent_reviews.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-heading">
                  Recent Reviews
                </h2>
                <Link href={`/professor/${professor.id}/reviews`}>
                  <Button
                    variant="default"
                    className="bg-[#500000] text-white hover:bg-[#500000] hover:scale-105 transition-all duration-200 text-sm"
                  >
                    View All Reviews
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {professor.recent_reviews?.slice(0, 4).map((review) => (
                  <Card
                    key={review.id}
                    className="bg-card border-border hover:shadow-md transition-shadow duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="font-semibold text-yellow-700 text-sm">
                            {review.overall_rating.toFixed(1)}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                        >
                          Grade: {review.grade}
                        </Badge>
                      </div>

                      <blockquote className="text-text-body mb-3 leading-relaxed line-clamp-3 italic border-l-4 border-gray-200 pl-3 text-sm">
                        `&quot;{review.review_text}&quot;`
                      </blockquote>

                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {review.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-gray-50 text-gray-700"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
