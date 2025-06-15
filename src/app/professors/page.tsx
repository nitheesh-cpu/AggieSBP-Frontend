"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProfessors, type Professor } from "@/lib/api";
import {
  Search,
  Plus,
  Star,
  User,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useProfessorComparison } from "@/contexts/ProfessorComparisonContext";
import { ProfessorComparisonWidget } from "@/components/professor-comparison-widget";

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addProfessor, isSelected, canAddMore } = useProfessorComparison();

  // Get unique departments for filter dropdown
  const uniqueDepartments = Array.from(
    new Set(professors.flatMap((prof) => prof.departments)),
  ).sort();

  useEffect(() => {
    const loadProfessors = async () => {
      try {
        setLoading(true);
        const data = await getProfessors({ limit: 1000 }); // Get all professors
        setProfessors(data);
        setFilteredProfessors(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load professors",
        );
        console.error("Failed to load professors:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfessors();
  }, []);

  useEffect(() => {
    let filtered = professors;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((prof) =>
        prof.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter((prof) =>
        prof.departments.includes(departmentFilter),
      );
    }

    // Apply rating filter
    if (minRating !== null) {
      filtered = filtered.filter((prof) => prof.overall_rating >= minRating);
    }

    setFilteredProfessors(filtered);
  }, [searchTerm, departmentFilter, minRating, professors]);

  const handleAddProfessor = (professor: Professor) => {
    if (canAddMore() && !isSelected(professor.id)) {
      addProfessor(professor.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-12">
              <div className="text-text-body">Loading professors...</div>
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
              Error loading professors: {error}
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
              Browse Professors
            </h1>
            <p className="text-lg text-text-body max-w-2xl mx-auto">
              Discover Texas A&M professors, compare their ratings, and find the
              best instructors for your courses.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-body" />
                  <Input
                    placeholder="Search professors by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-card border-border"
                  />
                </div>
              </div>

              <div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-text-heading focus:outline-none focus:ring-2 focus:ring-[#500000]"
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={minRating ?? ""}
                  onChange={(e) =>
                    setMinRating(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-text-heading focus:outline-none focus:ring-2 focus:ring-[#500000]"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3">3.0+ Stars</option>
                  <option value="2.5">2.5+ Stars</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-text-body">
              Showing {filteredProfessors.length} of {professors.length}{" "}
              professors
            </p>
          </div>

          {/* Professor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredProfessors.map((professor) => (
              <Card
                key={professor.id}
                className="p-6 bg-card border-border hover:border-[#500000] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#500000] to-[#800000] rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Link href={`/professor/${professor.id}`}>
                        <h3 className="font-semibold text-text-heading hover:text-[#500000] transition-colors">
                          {professor.name}
                        </h3>
                      </Link>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddProfessor(professor)}
                    disabled={!canAddMore() || isSelected(professor.id)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Compare
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-body">
                      Overall Rating
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-text-heading">
                        {professor.overall_rating
                          ? professor.overall_rating.toFixed(1)
                          : "N/A"}
                      </span>
                      <span className="text-xs text-text-body">
                        ({professor.total_reviews} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-body">
                      Would Take Again
                    </span>
                    <span className="font-medium text-text-heading">
                      {professor.would_take_again_percent
                        ? professor.would_take_again_percent.toFixed(0)
                        : "N/A"}
                      %
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-body">
                      Courses Taught
                    </span>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-text-body" />
                      <span className="font-medium text-text-heading">
                        {professor.courses_taught.length}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex flex-wrap gap-1">
                      {professor.departments.slice(0, 2).map((dept) => (
                        <Badge
                          key={dept}
                          variant="secondary"
                          className="text-xs"
                        >
                          {dept}
                        </Badge>
                      ))}
                      {professor.departments.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{professor.departments.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredProfessors.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-text-body mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-heading mb-2">
                No professors found
              </h3>
              <p className="text-text-body">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Comparison Widget */}
      <ProfessorComparisonWidget />

      <Footer />
    </div>
  );
}
