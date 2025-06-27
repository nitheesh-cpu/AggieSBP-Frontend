"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  getCourses,
  getDepartmentsInfo,
  type Course,
  type DepartmentsInfo,
} from "@/lib/api";
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  BookOpen,
  Star,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  Loader2,
  Globe,
  Calculator,
  MessageCircle,
  Feather,
  Building,
  Clock,
  GraduationCap,
  Landmark,
  Monitor,
  Palette as PaletteIcon,
  Languages,
  Microscope,
  MapPin,
  Users2,
  Trophy,
  ChevronDown,
  ChevronUp,
  BarChart,
  Check,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { useComparison } from "@/contexts/ComparisonContext";
import { ComparisonWidget } from "@/components/comparison-widget";

const quickFilters = [
  {
    id: "undergraduate",
    label: "Undergraduate",
    icon: BookOpen,
    color: "bg-gradient-to-r from-blue-500/50 to-cyan-500/50",
    hoverColor: "hover:from-blue-600 hover:to-cyan-600",
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: TrendingUp,
    color: "bg-gradient-to-r from-orange-500/50 to-red-500/50",
    hoverColor: "hover:from-orange-600 hover:to-red-600",
  },
  {
    id: "graduate",
    label: "Graduate",
    icon: GraduationCap,
    color: "bg-gradient-to-r from-purple-500/50 to-indigo-500/50",
    hoverColor: "hover:from-purple-600 hover:to-indigo-600",
  },
  {
    id: "core",
    label: "Core Curriculum",
    icon: Award,
    color: "bg-gradient-to-r from-emerald-500/50 to-teal-500/50",
    hoverColor: "hover:from-emerald-600 hover:to-teal-600",
  },
  {
    id: "highgpa",
    label: "High GPA (3.5+)",
    icon: Star,
    color: "bg-gradient-to-r from-yellow-500/50 to-amber-500/50",
    hoverColor: "hover:from-yellow-600 hover:to-amber-600",
  },
  {
    id: "lowworkload",
    label: "Light Difficulty",
    icon: Zap,
    color: "bg-gradient-to-r from-green-500/50 to-emerald-500/50",
    hoverColor: "hover:from-green-600 hover:to-emerald-600",
  },
  {
    id: "popular",
    label: "Most Popular",
    icon: Users,
    color: "bg-gradient-to-r from-pink-500/50 to-rose-500/50",
    hoverColor: "hover:from-pink-600 hover:to-rose-600",
  },
];

const sectionAttributeFilters = [
  {
    id: "DIST",
    label: "Distance Education",
    icon: Monitor,
    color: "bg-gradient-to-r from-slate-500/50 to-gray-500/50",
    hoverColor: "hover:from-slate-600 hover:to-gray-600",
  },
  {
    id: "HONR",
    label: "Honors",
    icon: Trophy,
    color: "bg-gradient-to-r from-yellow-500/50 to-amber-500/50",
    hoverColor: "hover:from-yellow-600 hover:to-amber-600",
  },
  {
    id: "KHIS",
    label: "Core American History",
    icon: Landmark,
    color: "bg-gradient-to-r from-amber-600/50 to-yellow-500/50",
    hoverColor: "hover:from-amber-700 hover:to-yellow-600",
  },
  {
    id: "KCOM",
    label: "Core Communication",
    icon: MessageCircle,
    color: "bg-gradient-to-r from-blue-500/50 to-cyan-500/50",
    hoverColor: "hover:from-blue-600 hover:to-cyan-600",
  },
  {
    id: "KCRA",
    label: "Core Creative Arts",
    icon: PaletteIcon,
    color: "bg-gradient-to-r from-purple-600/50 to-pink-500/50",
    hoverColor: "hover:from-purple-700 hover:to-pink-600",
  },
  {
    id: "KPLF",
    label: "Core Fed Gov/Pol Sci",
    icon: Building,
    color: "bg-gradient-to-r from-red-600/50 to-rose-500/50",
    hoverColor: "hover:from-red-700 hover:to-rose-600",
  },
  {
    id: "KLPC",
    label: "Core Lang- Phil- Culture",
    icon: Languages,
    color: "bg-gradient-to-r from-indigo-500/50 to-purple-500/50",
    hoverColor: "hover:from-indigo-600 hover:to-purple-600",
  },
  {
    id: "KLPS",
    label: "Core Life/Physical Sci",
    icon: Microscope,
    color: "bg-gradient-to-r from-green-600/50 to-emerald-500/50",
    hoverColor: "hover:from-green-700 hover:to-emerald-600",
  },
  {
    id: "KPLL",
    label: "Core Local Gov/Pol Sci",
    icon: MapPin,
    color: "bg-gradient-to-r from-orange-600/50 to-red-500/50",
    hoverColor: "hover:from-orange-700 hover:to-red-600",
  },
  {
    id: "KMTH",
    label: "Core Mathematics",
    icon: Calculator,
    color: "bg-gradient-to-r from-blue-600/50 to-indigo-500/50",
    hoverColor: "hover:from-blue-700 hover:to-indigo-600",
  },
  {
    id: "KSOC",
    label: "Core Social & Beh Sci",
    icon: Users2,
    color: "bg-gradient-to-r from-pink-500/50 to-rose-500/50",
    hoverColor: "hover:from-pink-600 hover:to-rose-600",
  },
  {
    id: "KHTX",
    label: "Core Texas History",
    icon: Clock,
    color: "bg-gradient-to-r from-yellow-600/50 to-orange-500/50",
    hoverColor: "hover:from-yellow-700 hover:to-orange-600",
  },
  {
    id: "KUCD",
    label: "Univ Req-Cult Discourse",
    icon: Globe,
    color: "bg-gradient-to-r from-teal-500/50 to-cyan-500/50",
    hoverColor: "hover:from-teal-600 hover:to-cyan-600",
  },
  {
    id: "KICD",
    label: "Univ Req-Int'l&Cult Div",
    icon: Globe,
    color: "bg-gradient-to-r from-emerald-500/50 to-teal-500/50",
    hoverColor: "hover:from-emerald-600 hover:to-teal-600",
  },
  {
    id: "UCRT",
    label: "Univ Req-Oral Communication",
    icon: MessageCircle,
    color: "bg-gradient-to-r from-orange-500/50 to-red-500/50",
    hoverColor: "hover:from-orange-600 hover:to-red-600",
  },
  {
    id: "UWRT",
    label: "Univ Req-Writing Intensive",
    icon: Feather,
    color: "bg-gradient-to-r from-violet-500/50 to-purple-500/50",
    hoverColor: "hover:from-violet-600 hover:to-purple-600",
  },
];

function CoursesPageContent() {
  const { addCourse, removeCourse, isSelected, canAddMore } = useComparison();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [allCoursesLoaded, setAllCoursesLoaded] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentsInfo | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(
    searchParams?.get("search") || "",
  );
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(
    searchParams?.get("department") || "All",
  );
  const [selectedDifficulty] = useState(searchParams?.get("difficulty") || "");
  const [minGpa] = useState<string>(searchParams?.get("min_gpa") || "");
  const [maxGpa] = useState<string>(searchParams?.get("max_gpa") || "");
  const [minRating] = useState<string>(searchParams?.get("min_rating") || "");
  const [maxRating] = useState<string>(searchParams?.get("max_rating") || "");
  const [sortBy, setSortBy] = useState("code");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>(
    [],
  );
  const [selectedSectionAttributes, setSelectedSectionAttributes] = useState<
    string[]
  >([]);

  const coursesPerPage = 30;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Toggle functions for filters
  const toggleQuickFilter = (filterId: string) => {
    console.log("Toggling quick filter:", filterId);
    setSelectedQuickFilters((prev) => {
      const newFilters = prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId];
      console.log("New quick filters:", newFilters);
      return newFilters;
    });
  };

  const toggleSectionAttribute = (attributeId: string) => {
    console.log("Toggling section attribute:", attributeId);
    setSelectedSectionAttributes((prev) => {
      const newAttributes = prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId];
      console.log("New section attributes:", newAttributes);
      return newAttributes;
    });
  };

  // Cache keys for localStorage
  const CACHE_KEY = "aggie-rmp-all-courses";
  const CACHE_TIMESTAMP_KEY = "aggie-rmp-courses-timestamp";
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Check if cached data is still valid
  const isCacheValid = () => {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    return Date.now() - parseInt(timestamp) < CACHE_DURATION;
  };

  // Load cached courses if available
  const loadCachedCourses = useCallback(async () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached && isCacheValid()) {
        const parsedCourses = JSON.parse(cached);
        console.log("Loaded courses from cache:", parsedCourses.length);
        return parsedCourses;
      }
    } catch (error) {
      console.error("Failed to load cached courses:", error);
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    }
    return null;
  }, []);

  // Save courses to cache
  const saveCachedCourses = (coursesData: Course[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(coursesData));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      console.log("Saved courses to cache:", coursesData.length);
    } catch (error) {
      console.error("Failed to save courses to cache:", error);
    }
  };

  // Load departments info
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await getDepartmentsInfo();
        setDepartments(data);
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };

    loadDepartments();
  }, []);

  // Progressive loading: first 30 courses, then all courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cachedCourses = await loadCachedCourses();
        if (cachedCourses && cachedCourses.length > 30) {
          console.log("Using cached courses");
          setCourses(cachedCourses);
          setAllCourses(cachedCourses);
          setAllCoursesLoaded(true);
          setLoading(false);
          return;
        }

        // Load first 30 courses quickly
        console.log("Loading first 30 courses...");
        const initialCourses = await getCourses({ limit: 30 });
        setCourses(initialCourses);
        setLoading(false);

        // Load all courses in background
        setIsLoadingAll(true);
        console.log("Loading all courses in background...");
        const allCoursesData = await getCourses({ limit: 5000 });
        console.log("Loaded all courses:", allCoursesData.length);

        // Update with all courses
        setCourses(allCoursesData);
        setAllCourses(allCoursesData);
        setAllCoursesLoaded(true);
        setIsLoadingAll(false);

        // Cache the results
        saveCachedCourses(allCoursesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load courses");
        console.error("Failed to load courses:", err);
        setLoading(false);
        setIsLoadingAll(false);
      }
    };

    loadCourses();
  }, [loadCachedCourses]);

  // Filter and search logic
  const filteredAndSearchedCourses = useMemo(() => {
    const dataToFilter = allCoursesLoaded ? allCourses : courses;

    const filtered = dataToFilter.filter((course) => {
      const notNull = course !== null;

      const matchesSearch =
        !searchTerm ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        !selectedDepartment ||
        selectedDepartment === "All" ||
        course.department.name === selectedDepartment;

      const matchesDifficulty =
        !selectedDifficulty || course.difficulty === selectedDifficulty;

      const matchesMinGpa = !minGpa || course.avgGPA >= parseFloat(minGpa);

      const matchesMaxGpa = !maxGpa || course.avgGPA <= parseFloat(maxGpa);

      const matchesMinRating =
        !minRating || course.rating >= parseFloat(minRating);

      const matchesMaxRating =
        !maxRating || course.rating <= parseFloat(maxRating);

      // Quick filters logic
      let matchesQuickFilters = true;
      if (selectedQuickFilters.length > 0) {
        matchesQuickFilters = selectedQuickFilters.some((filterId) => {
          switch (filterId) {
            case "undergraduate":
              return course.tags.some((tag) =>
                tag.toLowerCase().includes("undergraduate"),
              );
            case "advanced":
              return course.tags.some((tag) =>
                tag.toLowerCase().includes("advanced"),
              );
            case "graduate":
              return course.tags.some(
                (tag) => tag.toLowerCase() === "graduate",
              );
            case "core":
              return course.sectionAttributes.some(
                (attr) =>
                  attr.includes("KHIS") ||
                  attr.includes("KCOM") ||
                  attr.includes("KCRA") ||
                  attr.includes("KPLF") ||
                  attr.includes("KLPC") ||
                  attr.includes("KLPS") ||
                  attr.includes("KPLL") ||
                  attr.includes("KMTH") ||
                  attr.includes("KSOC") ||
                  attr.includes("KHTX"),
              );
            case "highgpa":
              return course.avgGPA !== -1 && course.avgGPA >= 3.5;
            case "lowworkload":
              return course.difficulty === "Light";
            case "popular":
              return course.enrollment >= 500;
            default:
              return false;
          }
        });
      }

      // Section attributes logic
      let matchesSectionAttributes = true;
      if (selectedSectionAttributes.length > 0) {
        matchesSectionAttributes = selectedSectionAttributes.some((attrId) =>
          course.sectionAttributes.some((attr) => attr.includes(attrId)),
        );
      }

      return (
        notNull &&
        matchesSearch &&
        matchesDepartment &&
        matchesDifficulty &&
        matchesMinGpa &&
        matchesMaxGpa &&
        matchesMinRating &&
        matchesMaxRating &&
        matchesQuickFilters &&
        matchesSectionAttributes
      );
    });

    // Sort the filtered courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "gpa":
          return b.avgGPA - a.avgGPA;
        case "difficulty": {
          const difficultyOrder: { [key: string]: number } = {
            Light: 1,
            Moderate: 2,
            Challenging: 3,
            Intensive: 4,
            Rigorous: 5,
          };
          return (
            (difficultyOrder[a.difficulty] || 0) -
            (difficultyOrder[b.difficulty] || 0)
          );
        }
        case "enrollment":
          return b.enrollment - a.enrollment;
        case "rating":
          return b.rating - a.rating;
        default:
          return a.code.localeCompare(b.code);
      }
    });

    return filtered;
  }, [
    courses,
    allCourses,
    allCoursesLoaded,
    searchTerm,
    selectedDepartment,
    selectedDifficulty,
    minGpa,
    maxGpa,
    minRating,
    maxRating,
    selectedQuickFilters,
    selectedSectionAttributes,
    sortBy,
  ]);

  // Update filtered courses when dependencies change
  useEffect(() => {
    setFilteredCourses(filteredAndSearchedCourses);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredAndSearchedCourses]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / coursesPerPage),
  );

  // Pagination
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage,
  );

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case "Light":
        return "bg-green-100/50 text-white border-transparent";
      case "Moderate":
        return "bg-yellow-100/50 text-white border-transparent";
      case "Challenging":
        return "bg-orange-100/50 text-white border-transparent";
      case "Intensive":
        return "bg-red-100/50 text-white border-transparent";
      case "Rigorous":
        return "bg-red-200/50 text-white border-transparent";
      default:
        return "bg-gray-100/50 text-white border-transparent";
    }
  };

  const getDepartmentColor = (deptName: string) => {
    if (deptName === "All")
      return "bg-gradient-to-r from-purple-500 to-pink-500";

    const colorMap: { [key: string]: string } = {
      ACCT: "bg-gradient-to-r from-yellow-500/50 to-orange-500/50",
      MATH: "bg-gradient-to-r from-indigo-500/50 to-purple-500/50",
      MEEN: "bg-gradient-to-r from-gray-500/50 to-slate-600/50",
      CSCE: "bg-gradient-to-r from-blue-500/50 to-cyan-500/50",
      BUAD: "bg-gradient-to-r from-emerald-500/50 to-teal-500/50",
      CVEN: "bg-gradient-to-r from-orange-500/50 to-red-500/50",
      CHEM: "bg-gradient-to-r from-green-500/50 to-emerald-500/50",
      FINC: "bg-gradient-to-r from-green-600/50 to-lime-500/50",
      STAT: "bg-gradient-to-r from-purple-600/50 to-indigo-500/50",
      COSC: "bg-gradient-to-r from-amber-500/50 to-yellow-500/50",
      PHAR: "bg-gradient-to-r from-blue-600/50 to-purple-500/50",
      NURS: "bg-gradient-to-r from-red-500/50 to-pink-500/50",
      PETE: "bg-gradient-to-r from-amber-600/50 to-orange-600/50",
      ECON: "bg-gradient-to-r from-yellow-600/50 to-amber-500/50",
      ANSC: "bg-gradient-to-r from-emerald-600/50 to-green-500/50",
    };

    const deptCode = deptName.split(" - ")[0];
    return colorMap[deptCode] || "bg-gradient-to-r from-gray-500 to-slate-500";
  };

  const getCourseTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "undergraduate":
        return "bg-gradient-to-r from-blue-500/50 to-cyan-500/50 text-white border-transparent";
      case "advanced":
        return "bg-gradient-to-r from-orange-500/50 to-red-500/50 text-white border-transparent";
      case "graduate":
        return "bg-gradient-to-r from-purple-500/50 to-indigo-500/50 text-white border-transparent";
      default:
        return "border-gray-300/50";
    }
  };

  // Get statistics from departments_info API
  const avgGPA = departments?.summary.overall_avg_gpa || 0;
  const totalCoursesCount = departments?.summary.total_courses || 0;
  const totalProfessors = departments?.summary.total_professors || 0;
  const totalDepartments = departments?.summary.total_departments || 0;

  // Top 15 departments by course count (from SQL query)
  const topDepartments = [
    "ACCT - Accounting",
    "MATH - Mathematics",
    "MEEN - Mechanical Engineering",
    "CSCE - Computer Sci & Engr",
    "BUAD - Business Administration",
    "CVEN - Civil Engineering",
    "CHEM - Chemistry",
    "FINC - Finance",
    "STAT - Statistics",
    "COSC - Construction Science",
    "PHAR - Pharmacy",
    "NURS - Nursing",
    "PETE - Petroleum Engineering",
    "ECON - Economics",
    "ANSC - Animal Science",
  ];
  const departmentNames = ["All", ...topDepartments];

  // Show initial loading screen only for initial page load
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#500000]" />
              <div className="text-text-body">Loading courses...</div>
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
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="text-center mb-8">
            <h1 className="text-text-heading text-3xl font-semibold mb-4">
              Browse All Courses
            </h1>
            <p className="text-text-body text-lg max-w-2xl mx-auto">
              Discover the perfect courses for your academic journey with
              comprehensive data on grades, difficulty, and professor insights.
            </p>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 border-transparent text-white">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-white/80" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {totalCoursesCount.toLocaleString()}
                  </p>
                  <p className="text-white/80 font-medium">Total Courses</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-white/80" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {avgGPA.toFixed(2)}
                  </p>
                  <p className="text-white/80 font-medium">Avg GPA</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-600 border-transparent text-white">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-white/80" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {totalProfessors.toLocaleString()}
                  </p>
                  <p className="text-white/80 font-medium">Total Professors</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 border-transparent text-white">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-white/80" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {totalDepartments}
                  </p>
                  <p className="text-white/80 font-medium">Departments</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto px-6 mb-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Error loading courses: {error}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <Card className="bg-card border-border p-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-body" />
                {searchTerm !== debouncedSearchTerm && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-[#500000]" />
                )}
                <Input
                  placeholder="Search courses by code or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 bg-canvas border-border"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-canvas border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-canvas border-border">
                  <SelectItem value="code">Sort by Code</SelectItem>
                  <SelectItem value="gpa">Sort by GPA</SelectItem>
                  <SelectItem value="difficulty">Sort by Difficulty</SelectItem>
                  <SelectItem value="enrollment">Sort by Enrollment</SelectItem>
                  <SelectItem value="rating">Sort by Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Filters */}
            <div className="">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-text-heading">
                  Quick Filters
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className="border-border hover:bg-button-hover"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {filtersExpanded ? "Less Filters" : "More Filters"}
                  {filtersExpanded ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </div>

              <div
                className={`flex flex-wrap gap-3 ${filtersExpanded ? "mb-4" : ""}`}
              >
                {quickFilters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <Button
                      key={filter.id}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleQuickFilter(filter.id)}
                      className={`${
                        selectedQuickFilters.includes(filter.id)
                          ? `${filter.color} ${filter.hoverColor} text-white border-transparent`
                          : "border-border hover:bg-button-hover"
                      } transition-all duration-200`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Expandable Filters */}
            <div
              className={`transition-all duration-300 overflow-hidden ${filtersExpanded ? "max-h-[1000px] opacity-100  mt-6" : "max-h-0 opacity-0"}`}
            >
              {/* Section Attribute Filters */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-heading mb-3">
                  Section Attributes
                </h3>
                <div className="flex flex-wrap gap-3 mb-4 max-h-48 overflow-y-auto md:max-h-none md:overflow-visible">
                  {sectionAttributeFilters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <Button
                        key={filter.id}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSectionAttribute(filter.id)}
                        className={`${
                          selectedSectionAttributes.includes(filter.id)
                            ? `${filter.color} ${filter.hoverColor} text-white border-transparent`
                            : "border-border hover:bg-button-hover"
                        } transition-all duration-200 flex-shrink-0`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {filter.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Department Filter */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-heading mb-3">
                  Departments
                </h3>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto md:max-h-none md:overflow-visible">
                  {departmentNames.map((deptName) => (
                    <Badge
                      key={deptName}
                      variant="outline"
                      className={`cursor-pointer transition-all duration-200 flex-shrink-0 ${
                        selectedDepartment === deptName
                          ? `${getDepartmentColor(deptName)} text-white border-transparent hover:opacity-90`
                          : "border-border hover:bg-button-hover"
                      }`}
                      onClick={() => setSelectedDepartment(deptName)}
                    >
                      {deptName}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="max-w-7xl mx-auto px-6">
          {isLoadingAll ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#500000]" />
              <div className="text-text-body">Loading courses...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedCourses.map((course) => (
                <Card
                  key={course.id}
                  className="bg-gradient-to-br from-card to-card/50 border-border hover:border-[#500000] transition-all duration-200 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden group"
                >
                  <CardContent className="">
                    {/* Decorative gradient accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#500000]/10 to-transparent rounded-bl-3xl group-hover:from-[#500000]/20 transition-all duration-200"></div>

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-text-heading mb-1">
                          {course.code}
                        </h3>
                        <p className="text-sm text-text-body mb-2 line-clamp-2">
                          {course.name}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getDepartmentColor(course.department.name)} text-white border-transparent`}
                        >
                          {course.department.name}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 text-[#FFCF3F] fill-current" />
                          <span className="text-sm font-medium text-text-heading">
                            {course.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-text-body">
                          {course.sections} sections
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-4 h-4 text-[#500000]" />
                          <span className="text-lg font-semibold text-text-heading">
                            {course.avgGPA !== -1
                              ? course.avgGPA.toFixed(2)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="text-xs text-text-body">GPA</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BookOpen className="w-4 h-4 text-[#500000]" />
                          <span className="text-lg font-semibold text-text-heading">
                            {course.credits}
                          </span>
                        </div>
                        <div className="text-xs text-text-body">Credits</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-[#500000]" />
                          <span className="text-lg font-semibold text-text-heading">
                            {course.enrollment}
                          </span>
                        </div>
                        <div className="text-xs text-text-body">Students</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 mb-4">
                      <Badge
                        className={getDifficultyBadgeColor(course.difficulty)}
                      >
                        {course.difficulty}
                      </Badge>
                      {/* </div> */}

                      {/* <div className="flex flex-wrap gap-1 mb-4"> */}
                      {course.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={`tag-${index}`}
                          variant="outline"
                          className={`text-xs ${getCourseTagColor(tag)} font-medium`}
                        >
                          {tag}
                        </Badge>
                      ))}
                      {course.sectionAttributes.map((attr, index) => {
                        const filter = sectionAttributeFilters.find(
                          (f) => f.id === attr.split(" - ")[1],
                        );
                        return filter ? (
                          <Badge
                            key={`attr-${index}`}
                            variant="outline"
                            className={`text-xs ${filter.color} text-white border-transparent font-medium`}
                          >
                            {filter.label}
                          </Badge>
                        ) : null;
                      })}
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Link
                          href={`/course/${course.code.replace(/\s+/g, "")}`}
                          className="flex-1"
                        >
                          <Button className="w-full bg-[#500000] hover:bg-[#600000] text-white group-hover:bg-[#600000] transition-all duration-normal">
                            View Details
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                        <Button
                          variant={
                            isSelected(course.code) ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            if (isSelected(course.code)) {
                              removeCourse(course.code);
                            } else {
                              addCourse(course.code);
                            }
                          }}
                          disabled={!isSelected(course.code) && !canAddMore()}
                          className={`${
                            isSelected(course.code)
                              ? "bg-[#500000] text-white hover:bg-[#600000]"
                              : "border-[#500000] text-[#500000] hover:bg-[#500000] bg-[#500000]/30 text-white"
                          } pt-4.25 pb-4.25 transition-all duration-200`}
                        >
                          {isSelected(course.code) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <BarChart className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoadingAll && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-border"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {/* Smart pagination logic */}
                {(() => {
                  const maxVisible = 7; // Maximum number of page buttons to show
                  const halfVisible = Math.floor(maxVisible / 2);
                  let startPage = Math.max(1, currentPage - halfVisible);
                  const endPage = Math.min(
                    totalPages,
                    startPage + maxVisible - 1,
                  );

                  // Adjust start if we're near the end
                  if (endPage - startPage < maxVisible - 1) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  const pages = [];

                  // First page + ellipsis
                  if (startPage > 1) {
                    pages.push(
                      <Button
                        key={1}
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        className="border-border"
                      >
                        1
                      </Button>,
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span
                          key="start-ellipsis"
                          className="px-2 text-text-body"
                        >
                          ...
                        </span>,
                      );
                    }
                  }

                  // Main page range
                  for (let page = startPage; page <= endPage; page++) {
                    pages.push(
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? "bg-[#500000] text-white"
                            : "border-border"
                        }
                      >
                        {page}
                      </Button>,
                    );
                  }

                  // Last page + ellipsis
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span
                          key="end-ellipsis"
                          className="px-2 text-text-body"
                        >
                          ...
                        </span>,
                      );
                    }
                    pages.push(
                      <Button
                        key={totalPages}
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="border-border"
                      >
                        {totalPages}
                      </Button>,
                    );
                  }

                  return pages;
                })()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="border-border"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Page info */}
              <div className="text-sm text-text-body ml-4">
                Page {currentPage} of {totalPages} (
                {filteredCourses.length.toLocaleString()} courses)
              </div>
            </div>
          )}

          {!isLoadingAll && filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-text-heading mb-2">
                No courses found
              </h3>
              <p className="text-text-body">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ComparisonWidget />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas">
          <Navigation />
          <main className="pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#500000]" />
                <div className="text-text-body">Loading courses...</div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <CoursesPageContent />
    </Suspense>
  );
}
