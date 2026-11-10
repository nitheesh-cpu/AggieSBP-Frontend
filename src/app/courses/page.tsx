"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { Navigation } from "@/components/navigation";
import { PageBanner } from "@/components/page-banner";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const quickFilters = [
  {
    id: "undergraduate",
    label: "100–200 level",
    icon: BookOpen,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "advanced",
    label: "300–400 level",
    icon: TrendingUp,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "graduate",
    label: "Graduate",
    icon: GraduationCap,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "core",
    label: "Core curriculum",
    icon: Award,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "highgpa",
    label: "High GPA (3.5+)",
    icon: Star,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "lowworkload",
    label: "Light difficulty",
    icon: Zap,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "popular",
    label: "Most popular",
    icon: Users,
    color:
      "",
    hoverColor: "",
  },
];

const sectionAttributeFilters = [
  {
    id: "DIST",
    label: "Distance education",
    icon: Monitor,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "HONR",
    label: "Honors",
    icon: Trophy,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KHIS",
    label: "Core American History",
    icon: Landmark,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KCOM",
    label: "Core Communication",
    icon: MessageCircle,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KCRA",
    label: "Core Creative Arts",
    icon: PaletteIcon,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KPLF",
    label: "Core Fed Gov/Pol Sci",
    icon: Building,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KLPC",
    label: "Core Lang- Phil- Culture",
    icon: Languages,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KLPS",
    label: "Core Life/Physical Sci",
    icon: Microscope,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KPLL",
    label: "Core Local Gov/Pol Sci",
    icon: MapPin,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KMTH",
    label: "Core Mathematics",
    icon: Calculator,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KSOC",
    label: "Core Social & Beh Sci",
    icon: Users2,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KHTX",
    label: "Core Texas History",
    icon: Clock,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KUCD",
    label: "Univ Req-Cult Discourse",
    icon: Globe,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "KICD",
    label: "Univ Req-Int'l&Cult Div",
    icon: Globe,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "UCRT",
    label: "Univ Req-Oral Communication",
    icon: MessageCircle,
    color:
      "",
    hoverColor: "",
  },
  {
    id: "UWRT",
    label: "Univ Req-Writing Intensive",
    icon: Feather,
    color:
      "",
    hoverColor: "",
  },
];

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = React.useState(false);
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
    searchParams?.get("search") || ""
  );
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(
    searchParams?.get("department") || "All"
  );
  const [selectedDifficulty] = useState(searchParams?.get("difficulty") || "");
  const [minGpa] = useState<string>(searchParams?.get("min_gpa") || "");
  const [maxGpa] = useState<string>(searchParams?.get("max_gpa") || "");
  const [minRating] = useState<string>(searchParams?.get("min_rating") || "");
  const [maxRating] = useState<string>(searchParams?.get("max_rating") || "");
  // Most-taken first, so the catalog opens on courses with data, not AALO 285
  const [sortBy, setSortBy] = useState("enrollment");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>(
    []
  );
  const [selectedSectionAttributes, setSelectedSectionAttributes] = useState<
    string[]
  >([]);

  const coursesPerPage = 30;
  const serverSearchMode = debouncedSearchTerm.trim().length > 0;

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
    if (serverSearchMode) return;

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
  }, [loadCachedCourses, serverSearchMode]);

  // Industry-standard approach: debounced server-side search to avoid missing
  // results when the full dataset is not loaded on the client yet.
  useEffect(() => {
    if (!serverSearchMode) return;

    let cancelled = false;

    const searchCourses = async () => {
      try {
        setIsLoadingAll(true);
        setError(null);
        setCurrentPage(1);

        const results = await getCourses({
          search: debouncedSearchTerm,
          department:
            selectedDepartment !== "All" ? selectedDepartment : undefined,
          limit: 5000,
        });

        if (cancelled) return;

        setCourses(results);
        setAllCourses(results);
        setAllCoursesLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to search courses");
        }
      } finally {
        if (!cancelled) setIsLoadingAll(false);
      }
    };

    void searchCourses();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearchTerm, selectedDepartment, serverSearchMode]);

  // Filter and search logic
  const filteredAndSearchedCourses = useMemo(() => {
    const dataToFilter = serverSearchMode
      ? courses
      : allCoursesLoaded
        ? allCourses
        : courses;

    const filtered = dataToFilter.filter((course) => {
      const notNull = course !== null;

      const matchesSearch =
        !debouncedSearchTerm ||
        course.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        course.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      const matchesDepartment =
        !selectedDepartment ||
        selectedDepartment === "All" ||
        course.department.name === selectedDepartment;

      const matchesDifficulty =
        !selectedDifficulty || course.difficulty === selectedDifficulty;

      const matchesMinGpa = !minGpa || course.avgGPA >= parseFloat(minGpa);

      const matchesMaxGpa = !maxGpa || course.avgGPA <= parseFloat(maxGpa);

      const matchesMinRating =
        !minRating ||
        (course.rating != null && course.rating >= parseFloat(minRating));

      const matchesMaxRating =
        !maxRating ||
        (course.rating != null && course.rating <= parseFloat(maxRating));

      // Quick filters logic
      let matchesQuickFilters = true;
      if (selectedQuickFilters.length > 0) {
        matchesQuickFilters = selectedQuickFilters.some((filterId) => {
          switch (filterId) {
            case "undergraduate":
              return course.tags.some((tag) =>
                tag.toLowerCase().includes("undergraduate")
              );
            case "advanced":
              return course.tags.some((tag) =>
                tag.toLowerCase().includes("advanced")
              );
            case "graduate":
              return course.tags.some(
                (tag) => tag.toLowerCase() === "graduate"
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
                  attr.includes("KHTX")
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
          course.sectionAttributes.some((attr) => attr.includes(attrId))
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
          // Courses without reviews go last instead of counting as 0.
          return (b.rating ?? -1) - (a.rating ?? -1);
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
    debouncedSearchTerm,
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
    Math.ceil(filteredCourses.length / coursesPerPage)
  );

  // Pagination
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  const getDepartmentColor = (deptName: string) => {
    if (deptName === "All") return "bg-raised text-text-body";

    const colorMap: { [key: string]: string } = {
      // Accounting & Business
      ACCT: "bg-raised text-text-body",
      BUAD: "bg-raised text-text-body",
      BUSN: "bg-raised text-text-body",
      FINC: "bg-raised text-text-body",
      FINP: "bg-raised text-text-body",
      MGMT: "bg-raised text-text-body",
      MKTG: "bg-raised text-text-body",
      SCMT: "bg-raised text-text-body",
      ECON: "bg-raised text-text-body",
      IBUS: "bg-raised text-text-body",
      ISTM: "bg-raised text-text-body",
      IDIS: "bg-raised text-text-body",

      // Engineering
      CSCE: "bg-raised text-text-body",
      ECEN: "bg-raised text-text-body",
      MEEN: "bg-raised text-text-body",
      CVEN: "bg-raised text-text-body",
      CHEN: "bg-raised text-text-body",
      AERO: "bg-raised text-text-body",
      PETE: "bg-raised text-text-body",
      NUEN: "bg-raised text-text-body",
      BMEN: "bg-raised text-text-body",
      ISEN: "bg-raised text-text-body",
      OCEN: "bg-raised text-text-body",
      ENGR: "bg-raised text-text-body",
      BAEN: "bg-raised text-text-body",
      EVEN: "bg-raised text-text-body",
      MSEN: "bg-raised text-text-body",
      AREN: "bg-raised text-text-body",
      SENG: "bg-raised text-text-body",
      SSEN: "bg-raised text-text-body",
      CLEN: "bg-raised text-text-body",
      ENDG: "bg-raised text-text-body",
      ENDS: "bg-raised text-text-body",
      ENTC: "bg-raised text-text-body",
      ESET: "bg-raised text-text-body",
      MMET: "bg-raised text-text-body",
      MXET: "bg-raised text-text-body",
      ITDE: "bg-raised text-text-body",
      MTDE: "bg-raised text-text-body",
      DAEN: "bg-raised text-text-body",

      // Sciences
      MATH: "bg-raised text-text-body",
      STAT: "bg-raised text-text-body",
      CHEM: "bg-raised text-text-body",
      BIOL: "bg-raised text-text-body",
      PHYS: "bg-raised text-text-body",
      GEOL: "bg-raised text-text-body",
      GEOG: "bg-raised text-text-body",
      GEOS: "bg-raised text-text-body",
      GEOP: "bg-raised text-text-body",
      ASTR: "bg-raised text-text-body",
      ATMO: "bg-raised text-text-body",
      OCNG: "bg-raised text-text-body",
      BICH: "bg-raised text-text-body",
      GENE: "bg-raised text-text-body",
      BIMS: "bg-raised text-text-body",
      BIOT: "bg-raised text-text-body",
      EEBL: "bg-raised text-text-body",
      ECCB: "bg-raised text-text-body",
      BESC: "bg-raised text-text-body",
      ENSS: "bg-raised text-text-body",
      WMHS: "bg-raised text-text-body",
      ANLY: "bg-raised text-text-body",
      MASC: "bg-raised text-text-body",

      // Medical & Health
      NURS: "bg-raised text-text-body",
      HLTH: "bg-raised text-text-body",
      HBEH: "bg-raised text-text-body",
      KINE: "bg-raised text-text-body",
      ATTR: "bg-raised text-text-body",
      NUTR: "bg-raised text-text-body",
      PHAR: "bg-raised text-text-body",
      PHSC: "bg-raised text-text-body",
      MPHY: "bg-raised text-text-body",
      MSCI: "bg-raised text-text-body",
      MCMD: "bg-raised text-text-body",
      PHLT: "bg-raised text-text-body",
      PHEB: "bg-raised text-text-body",
      PHEO: "bg-raised text-text-body",
      PHPM: "bg-raised text-text-body",
      SOPH: "bg-raised text-text-body",
      HCPI: "bg-raised text-text-body",
      EDHP: "bg-raised text-text-body",
      IBST: "bg-raised text-text-body",
      FIVS: "bg-raised text-text-body",
      FORS: "bg-raised text-text-body",
      NRSC: "bg-raised text-text-body",
      NEXT: "bg-raised text-text-body",
      PBSI: "bg-raised text-text-body",

      // Dental
      AEGD: "bg-raised text-text-body",
      ENDO: "bg-raised text-text-body",
      ORTH: "bg-raised text-text-body",
      PEDD: "bg-raised text-text-body",
      PERI: "bg-raised text-text-body",
      PROS: "bg-raised text-text-body",
      OMFP: "bg-raised text-text-body",
      OMFR: "bg-raised text-text-body",
      OMFS: "bg-raised text-text-body",
      OBIO: "bg-raised text-text-body",
      DDHS: "bg-raised text-text-body",
      DPHS: "bg-raised text-text-body",

      // Veterinary
      VIBS: "bg-raised text-text-body",
      VLCS: "bg-raised text-text-body",
      VSCS: "bg-raised text-text-body",
      VMID: "bg-raised text-text-body",
      VPAR: "bg-raised text-text-body",
      VPAT: "bg-raised text-text-body",
      VTMI: "bg-raised text-text-body",
      VTPB: "bg-raised text-text-body",
      VTPP: "bg-raised text-text-body",

      // Agriculture & Life Sciences
      AGEC: "bg-raised text-text-body",
      AGLS: "bg-raised text-text-body",
      AGSC: "bg-raised text-text-body",
      AGSM: "bg-raised text-text-body",
      ANSC: "bg-raised text-text-body",
      HORT: "bg-raised text-text-body",
      POSC: "bg-raised text-text-body",
      RWFM: "bg-raised text-text-body",
      SCSC: "bg-raised text-text-body",
      FSTC: "bg-raised text-text-body",
      CULN: "bg-raised text-text-body",
      MEPS: "bg-raised text-text-body",
      PLPA: "bg-raised text-text-body",
      ENTO: "bg-raised text-text-body",
      ALEC: "bg-raised text-text-body",
      ALED: "bg-raised text-text-body",
      AGCJ: "bg-raised text-text-body",

      // Liberal Arts & Humanities
      ENGL: "bg-raised text-text-body",
      HIST: "bg-raised text-text-body",
      PHIL: "bg-raised text-text-body",
      SPAN: "bg-raised text-text-body",
      FREN: "bg-raised text-text-body",
      GERM: "bg-raised text-text-body",
      CHIN: "bg-raised text-text-body",
      JAPN: "bg-raised text-text-body",
      ARAB: "bg-raised text-text-body",
      ITAL: "bg-raised text-text-body",
      RUSS: "bg-raised text-text-body",
      MODL: "bg-raised text-text-body",
      CLAS: "bg-raised text-text-body",
      RELS: "bg-raised text-text-body",
      AFST: "bg-raised text-text-body",
      ASIA: "bg-raised text-text-body",
      HISP: "bg-raised text-text-body",
      WGST: "bg-raised text-text-body",
      DHUM: "bg-raised text-text-body",

      // Social Sciences
      POLS: "bg-raised text-text-body",
      SOCI: "bg-raised text-text-body",
      ANTH: "bg-raised text-text-body",
      CPSY: "bg-raised text-text-body",
      EPSY: "bg-raised text-text-body",
      SPSY: "bg-raised text-text-body",
      GLST: "bg-raised text-text-body",
      INTA: "bg-raised text-text-body",

      // Fine Arts
      ARTS: "bg-raised text-text-body",
      MUSC: "bg-raised text-text-body",
      THEA: "bg-raised text-text-body",
      DCED: "bg-raised text-text-body",
      PVFA: "bg-raised text-text-body",
      VIST: "bg-raised text-text-body",
      VIZA: "bg-raised text-text-body",
      PERF: "bg-raised text-text-body",
      MSTC: "bg-raised text-text-body",
      FILM: "bg-raised text-text-body",

      // Architecture & Planning
      ARCH: "bg-raised text-text-body",
      CARC: "bg-raised text-text-body",
      LAND: "bg-raised text-text-body",
      PLAN: "bg-raised text-text-body",
      URPN: "bg-raised text-text-body",
      URSC: "bg-raised text-text-body",
      COSC: "bg-raised text-text-body",
      LDEV: "bg-raised text-text-body",

      // Education
      EDCI: "bg-raised text-text-body",
      EDAD: "bg-raised text-text-body",
      TEED: "bg-raised text-text-body",
      SPED: "bg-raised text-text-body",
      RDNG: "bg-raised text-text-body",
      LDTC: "bg-raised text-text-body",
      EHRD: "bg-raised text-text-body",
      CEHD: "bg-raised text-text-body",
      BEFB: "bg-raised text-text-body",
      BESL: "bg-raised text-text-body",
      MEFB: "bg-raised text-text-body",
      SEFB: "bg-raised text-text-body",
      TEFB: "bg-raised text-text-body",
      ECDE: "bg-raised text-text-body",

      // Communication & Journalism
      COMM: "bg-raised text-text-body",
      JOUR: "bg-raised text-text-body",

      // Military & Defense
      MLSC: "bg-raised text-text-body",
      AERS: "bg-raised text-text-body",
      NVSC: "bg-raised text-text-body",
      SOMS: "bg-raised text-text-body",

      // Law & Government
      LAW: "bg-raised text-text-body",
      BUSH: "bg-raised text-text-body",
      PSAA: "bg-raised text-text-body",

      // Recreation & Tourism
      RPTS: "bg-raised text-text-body",
      HMGT: "bg-raised text-text-body",
      SPMT: "bg-raised text-text-body",

      // Technology & Information Systems
      TCMG: "bg-raised text-text-body",
      TCMT: "bg-raised text-text-body",
      ITSV: "bg-raised text-text-body",

      // Energy
      ENGY: "bg-raised text-text-body",

      // Economics & Finance
      ECMT: "bg-raised text-text-body",

      // General/Administrative
      ARSC: "bg-raised text-text-muted",
      HONR: "bg-raised text-text-body",
      UGST: "bg-raised text-text-body",
      FYEX: "bg-raised text-text-body",
      SYEX: "bg-raised text-text-body",
      ASCC: "bg-raised text-text-body",
      INST: "bg-raised text-text-body",
      SABR: "bg-raised text-text-body",
      NSEB: "bg-raised text-text-body",
      TAMU: "bg-maroon-100 text-maroon-600",
    };

    const deptCode = deptName.split(" - ")[0];
    return colorMap[deptCode] || "bg-raised text-text-body";
  };

  // Get statistics from departments_info API
  const avgGPA = departments?.summary.overall_avg_gpa || 0;
  const totalCoursesCount = departments?.summary.total_courses || 0;
  const totalProfessors = departments?.summary.total_professors || 0;
  const totalDepartments = departments?.summary.total_departments || 0;

  const activeFilterCount = selectedQuickFilters.length + selectedSectionAttributes.length
    + Number(selectedDepartment !== "All");

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

  // Ensure we only run "initial" enter animations once per mount.
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Show initial loading screen only for initial page load
  if (loading) {
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
          <main className="pt-24 pb-20 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
              <Card className="p-8 bg-card border-border">
                <div className="text-center text-text-body">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-text-muted" />
                  Loading courses...
                </div>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </MotionConfig>
    );
  }

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

        <PageBanner
          title="Courses"
          subtitle={<>Every Texas A&amp;M course with its average GPA, difficulty and professor ratings</>}
        >
          <div className="relative">
            <Search strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-[18px] h-[18px]" />
            {(searchTerm !== debouncedSearchTerm || isLoadingAll) && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-text-muted" />
            )}
            <Input
              type="text"
              aria-label="Search courses by code or title"
              placeholder="Search by code or title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 rounded-xl border border-transparent bg-card shadow-lg pl-12 pr-10 text-base text-text-heading transition-colors placeholder:text-text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
            />
          </div>
        </PageBanner>

        <main className="relative z-10 pb-20 pt-5 sm:pt-8">
          {/* Error Message */}
          {error && (
            <div className="max-w-7xl mx-auto px-6 mb-8">
              <Card className="p-8 rounded-2xl shadow-none bg-red-50 border border-red-200">
                <div className="text-center">
                  <div className="text-red-700 font-medium mb-2">
                    Error loading courses
                  </div>
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </Card>
            </div>
          )}

          <div className="mx-auto mb-5 max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                aria-expanded={filtersExpanded}
                aria-controls="catalog-filters"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
              >
                <Filter strokeWidth={1.5} className="h-4 w-4" aria-hidden />
                Filters
                {activeFilterCount > 0 && <span className="text-accent">({activeFilterCount})</span>}
                {filtersExpanded ? (
                  <ChevronUp strokeWidth={1.5} className="h-4 w-4" aria-hidden />
                ) : (
                  <ChevronDown strokeWidth={1.5} className="h-4 w-4" aria-hidden />
                )}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Sort</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger aria-label="Sort courses" className="w-36 sm:w-48 bg-canvas border-border text-text-body dark:bg-card dark:text-text-heading">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-canvas border-border text-text-body dark:bg-card dark:text-text-heading">
                    <SelectItem value="code">Course code</SelectItem>
                    <SelectItem value="gpa">Average GPA</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                    <SelectItem value="enrollment">Most taken</SelectItem>
                    <SelectItem value="rating">Professor rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card
              id="catalog-filters"
              className={`mt-3 gap-5 rounded-xl border-border bg-card p-4 shadow-none sm:p-5 ${filtersExpanded ? "" : "hidden"}`}
            >
              <div>
                <h2 className="mb-2 text-sm font-medium text-text-heading">Quick filters</h2>
                <div className="flex flex-wrap gap-2">
                  {quickFilters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <Button
                        key={filter.id}
                        variant="outline"
                        size="sm"
                        aria-pressed={selectedQuickFilters.includes(filter.id)}
                        onClick={() => toggleQuickFilter(filter.id)}
                        className={`${
                          selectedQuickFilters.includes(filter.id)
                            ? "border-transparent bg-maroon-band text-on-maroon hover:bg-maroon-band"
                            : "border-border hover:bg-button-hover dark:bg-card dark:text-text-heading dark:hover:bg-raised dark:hover:text-text-heading"
                        } transition-colors duration-150`}
                      >
                        <Icon strokeWidth={1.5} className="w-4 h-4" />
                        {filter.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Section Attribute Filters */}
              <div>
                <h2 className="mb-2 text-sm font-medium text-text-heading">
                  Section attributes
                </h2>
                <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto md:max-h-none md:overflow-visible">
                  {sectionAttributeFilters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <Button
                        key={filter.id}
                        variant="outline"
                        size="sm"
                        aria-pressed={selectedSectionAttributes.includes(filter.id)}
                        onClick={() => toggleSectionAttribute(filter.id)}
                        className={`${
                          selectedSectionAttributes.includes(filter.id)
                            ? "border-transparent bg-maroon-band text-on-maroon hover:bg-maroon-band"
                            : "border-border hover:bg-button-hover dark:bg-card dark:text-text-heading dark:hover:bg-raised dark:hover:text-text-heading"
                        } transition-colors duration-150 flex-shrink-0`}
                      >
                        <Icon strokeWidth={1.5} className="w-4 h-4" />
                        {filter.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <h2 className="mb-2 text-sm font-medium text-text-heading">
                  Departments
                </h2>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto md:max-h-none md:overflow-visible">
                  {departmentNames.map((deptName) => (
                    <Button
                      key={deptName}
                      variant="outline"
                      size="sm"
                      aria-pressed={selectedDepartment === deptName}
                      className={`h-7 cursor-pointer px-2.5 font-mono transition-colors duration-150 flex-shrink-0 ${
                        selectedDepartment === deptName
                          ? "border-transparent bg-maroon-band text-on-maroon"
                          : "border-border hover:bg-button-hover dark:bg-card dark:text-text-heading dark:hover:bg-raised"
                      }`}
                      onClick={() => setSelectedDepartment(deptName)}
                    >
                      {deptName}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Courses Grid */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {isLoadingAll ? (
              <div className="text-center py-12">
                <Loader2 strokeWidth={1.5} className="h-6 w-6 animate-spin mx-auto mb-3 text-text-muted" />
                <div className="text-sm text-text-body">Loading courses</div>
              </div>
            ) : (
              <motion.div
                key={`${currentPage}-${searchTerm}-${selectedDepartment}-${sortBy}`}
                className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-3"
                initial={
                  shouldReduceMotion ? false : hasMounted ? false : "hidden"
                }
                animate="visible"
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.04 },
                  },
                }}
                layout
              >
                {paginatedCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card className="group relative h-full gap-0 overflow-hidden border-border bg-card p-0 shadow-none transition-colors duration-150 hover:border-maroon-edge">
                      {/* Header: the course, its department and how its professors rate */}
                      <div className="flex items-start justify-between gap-3 px-5 pt-5">
                        <div className="min-w-0">
                          <h3 className="font-mono text-lg font-medium leading-6 text-text-heading">
                            {course.code}
                          </h3>
                          <p
                            className="mt-0.5 truncate text-xs text-text-muted"
                            title={course.department.name}
                          >
                            {course.department.name.replace(/^[A-Z]{3,4}\s*-\s*/, "")}
                          </p>
                        </div>
                        {course.rating != null && (
                          <div
                            className="flex shrink-0 flex-col items-end"
                            title="Average RateMyProfessor rating of the professors who teach this course"
                          >
                            <span className="font-mono text-base leading-6 text-accent">
                              {course.rating.toFixed(1)}
                              <span className="text-xs text-text-muted">/5</span>
                            </span>
                            <span className="text-[11px] text-text-muted">prof rating</span>
                          </div>
                        )}
                      </div>

                      <CardContent className="flex flex-1 flex-col px-5 pb-5 pt-3">
                        <p className="line-clamp-2 text-sm leading-5 text-text-body">
                          {course.name}
                        </p>

                        {/* GPA meter on the 0-4 scale */}
                        <div className="mt-4">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-text-muted">Average GPA</span>
                            <span className="font-mono text-base text-text-heading">
                              {course.avgGPA !== -1 ? course.avgGPA.toFixed(2) : "—"}
                            </span>
                          </div>
                          <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-raised">
                            {course.avgGPA !== -1 && (
                              <span
                                className="absolute inset-y-0 left-0 rounded-full bg-accent"
                                style={{ width: `${Math.min(course.avgGPA / 4, 1) * 100}%` }}
                              />
                            )}
                          </div>
                        </div>

                        <p className="mb-4 mt-3 font-mono text-xs text-text-muted">
                          {course.credits} {course.credits === 1 ? "credit" : "credits"}
                          {course.sections > 0 && (
                            <span title="Sections in the latest College Station term">
                              {" · "}
                              {course.sections} {course.sections === 1 ? "section" : "sections"}
                            </span>
                          )}
                        </p>

                        <div className="mt-auto border-t border-border pt-3">
                            <Link
                              href={`/course/${course.code.replace(/\s+/g, "")}`}
                              className="inline-flex items-center gap-1 text-sm text-text-body transition-colors duration-150 after:absolute after:inset-0 after:rounded-xl group-hover:text-text-heading"
                            >
                              View details
                              <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
                            </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {!isLoadingAll && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="border-border bg-canvas text-text-body hover:bg-button-hover dark:bg-card dark:hover:bg-raised"
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
                      startPage + maxVisible - 1
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
                          className="border-border bg-canvas text-text-body hover:bg-button-hover dark:bg-card dark:hover:bg-raised"
                        >
                          1
                        </Button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span
                            key="start-ellipsis"
                            className="px-2 text-text-muted"
                          >
                            ...
                          </span>
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
                              ? "bg-maroon-band text-on-maroon"
                              : "border-border bg-canvas text-text-body hover:bg-button-hover dark:bg-card dark:hover:bg-raised"
                          }
                        >
                          {page}
                        </Button>
                      );
                    }

                    // Last page + ellipsis
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span
                            key="end-ellipsis"
                            className="px-2 text-text-muted"
                          >
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <Button
                          key={totalPages}
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="border-border bg-canvas text-text-body hover:bg-button-hover dark:bg-card dark:hover:bg-raised"
                        >
                          {totalPages}
                        </Button>
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
                  className="border-border bg-canvas text-text-body hover:bg-button-hover dark:bg-card dark:hover:bg-raised"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Page info */}
                <div className="text-sm text-text-muted dark:text-text-body ml-4">
                  Page {currentPage} of {totalPages} (
                  {filteredCourses.length.toLocaleString()} courses)
                </div>
              </div>
            )}

            {!isLoadingAll && filteredCourses.length === 0 && (
              <div className="text-center py-16">
                <Search strokeWidth={1.5} className="w-6 h-6 text-text-muted mx-auto mb-3" aria-hidden />
                <h3 className="text-2xl font-medium text-text-heading mb-2">
                  No courses found
                </h3>
                <p className="text-text-body">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
          {departments && (
            <section aria-labelledby="catalog-stats" className="mx-auto mt-12 max-w-7xl px-4 sm:px-6">
              <h2 id="catalog-stats" className="text-xl font-medium text-text-heading">
                Recent grade records
              </h2>
              <p className="mt-1 text-sm text-text-body">
                GPA and teaching activity in the four most recent semesters with grade data.
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: "Courses with grade data", value: totalCoursesCount.toLocaleString("en-US") },
                  { label: "Avg. department GPA", value: avgGPA.toFixed(2) },
                  { label: "Professor counts across departments", value: totalProfessors.toLocaleString("en-US") },
                  { label: "Departments in directory", value: totalDepartments.toLocaleString("en-US") },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-border bg-card p-4">
                    <dt className="text-sm text-text-body">{label}</dt>
                    <dd className="mt-2 font-mono text-xl font-medium text-accent">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
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
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-text-muted" />
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
