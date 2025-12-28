"use client";

import React, { useState, useEffect, use } from "react";
import {
  animate,
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  getCourseDetail,
  getTerms,
  getCourseProfessorsForTerm,
  getCourseSectionsForTerm,
  type CourseDetail,
  type Term,
  type CourseSection,
} from "@/lib/api";
import {
  Star,
  Users,
  BookOpen,
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Eye,
  Award,
  Zap,
  User,
  Check,
  Plus,
  Clock,
  FlaskConical,
  Link as LinkIcon,
  GraduationCap,
  ClipboardList,
  FileText,
  Briefcase,
  UserCircle,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import { useComparison } from "@/contexts/ComparisonContext";
import { useProfessorComparison } from "@/contexts/ProfessorComparisonContext";
import { ComparisonWidget } from "@/components/comparison-widget";
import { ProfessorComparisonWidget } from "@/components/professor-comparison-widget";

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatAnimatedNumber(n: number, decimals: number) {
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withCommas = Number(intPart).toLocaleString("en-US");
  return decimals > 0 ? `${withCommas}.${decPart}` : withCommas;
}

function CountUpNumber({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });

  const motionValue = useMotionValue(0);
  const [display, setDisplay] = React.useState(() =>
    formatAnimatedNumber(0, decimals)
  );

  React.useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      setDisplay(formatAnimatedNumber(value, decimals));
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 1.05,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        setDisplay(formatAnimatedNumber(latest, decimals));
      },
    });

    return () => controls.stop();
  }, [decimals, isInView, motionValue, shouldReduceMotion, value]);

  return <span ref={ref}>{display}</span>;
}

// Helper function to get department name from course code
const getDepartmentFromCode = (courseCode: string) => {
  const departmentMap: { [key: string]: string } = {
    CSCE: "Computer Science & Engineering",
    MATH: "Mathematics",
    MEEN: "Mechanical Engineering",
    CVEN: "Civil Engineering",
    ECEN: "Electrical & Computer Engineering",
    AERO: "Aerospace Engineering",
    BMEN: "Biomedical Engineering",
    CHEN: "Chemical Engineering",
    INEN: "Industrial & Systems Engineering",
    NUEN: "Nuclear Engineering",
    PETE: "Petroleum Engineering",
    PHYS: "Physics & Astronomy",
    CHEM: "Chemistry",
    BIOL: "Biology",
    STAT: "Statistics",
    ENGR: "Engineering",
    ENGL: "English",
    HIST: "History",
    POLS: "Political Science",
    PSYC: "Psychology",
    ECON: "Economics",
    ACCT: "Accounting",
    FINC: "Finance",
    MGMT: "Management",
    MKTG: "Marketing",
    AGEC: "Agricultural Economics",
    ANSC: "Animal Science",
    COSC: "Construction Science",
    RWFM: "Rangeland, Wildlife & Fisheries Management",
    PHAR: "Pharmacy",
    NURS: "Nursing",
    INTA: "International Affairs",
    LAW: "Law",
  };

  // Extract department code from course code (e.g., "CSCE 121" -> "CSCE")
  const deptCode = courseCode.split(/\s+/)[0];
  return departmentMap[deptCode] || deptCode;
};

// Helper function to get department gradient colors
const getDepartmentColor = (courseCode: string) => {
  const colorMap: { [key: string]: string } = {
    // Accounting & Business
    ACCT: "bg-yellow-600 dark:bg-yellow-500 text-white",
    BUAD: "bg-blue-600 dark:bg-blue-500 text-white",
    BUSN: "bg-indigo-600 dark:bg-indigo-500 text-white",
    FINC: "bg-green-600 dark:bg-green-500 text-white",
    FINP: "bg-emerald-600 dark:bg-emerald-500 text-white",
    MGMT: "bg-purple-600 dark:bg-purple-500 text-white",
    MKTG: "bg-pink-600 dark:bg-pink-500 text-white",
    SCMT: "bg-orange-600 dark:bg-orange-500 text-white",
    ECON: "bg-yellow-600 dark:bg-yellow-500 text-white",
    IBUS: "bg-blue-600 dark:bg-blue-500 text-white",
    ISTM: "bg-cyan-600 dark:bg-cyan-500 text-white",
    IDIS: "bg-gray-600 dark:bg-gray-500 text-white",

    // Engineering
    CSCE: "bg-blue-600 dark:bg-blue-500 text-white",
    ECEN: "bg-yellow-600 dark:bg-yellow-500 text-white",
    MEEN: "bg-gray-600 dark:bg-gray-500 text-white",
    CVEN: "bg-orange-600 dark:bg-orange-500 text-white",
    CHEN: "bg-green-600 dark:bg-green-500 text-white",
    AERO: "bg-sky-600 dark:bg-sky-500 text-white",
    PETE: "bg-amber-600 dark:bg-amber-500 text-white",
    NUEN: "bg-red-600 dark:bg-red-500 text-white",
    BMEN: "bg-rose-600 dark:bg-rose-500 text-white",
    ISEN: "bg-purple-600 dark:bg-purple-500 text-white",
    OCEN: "bg-cyan-600 dark:bg-cyan-500 text-white",
    ENGR: "bg-slate-600 dark:bg-slate-500 text-white",
    BAEN: "bg-green-600 dark:bg-green-500 text-white",
    EVEN: "bg-emerald-600 dark:bg-emerald-500 text-white",
    MSEN: "bg-indigo-600 dark:bg-indigo-500 text-white",
    AREN: "bg-blue-600 dark:bg-blue-500 text-white",
    SENG: "bg-red-600 dark:bg-red-500 text-white",
    SSEN: "bg-blue-600 dark:bg-blue-500 text-white",
    CLEN: "bg-gray-600 dark:bg-gray-500 text-white",
    ENDG: "bg-purple-600 dark:bg-purple-500 text-white",
    ENDS: "bg-green-600 dark:bg-green-500 text-white",
    ENTC: "bg-orange-600 dark:bg-orange-500 text-white",
    ESET: "bg-blue-600 dark:bg-blue-500 text-white",
    MMET: "bg-gray-600 dark:bg-gray-500 text-white",
    MXET: "bg-purple-600 dark:bg-purple-500 text-white",
    ITDE: "bg-cyan-600 dark:bg-cyan-500 text-white",
    MTDE: "bg-indigo-600 dark:bg-indigo-500 text-white",
    DAEN: "bg-blue-600 dark:bg-blue-500 text-white",

    // Sciences
    MATH: "bg-indigo-600 dark:bg-indigo-500 text-white",
    STAT: "bg-purple-600 dark:bg-purple-500 text-white",
    CHEM: "bg-green-600 dark:bg-green-500 text-white",
    BIOL: "bg-emerald-600 dark:bg-emerald-500 text-white",
    PHYS: "bg-purple-600 dark:bg-purple-500 text-white",
    GEOL: "bg-amber-600 dark:bg-amber-500 text-white",
    GEOG: "bg-blue-600 dark:bg-blue-500 text-white",
    GEOS: "bg-emerald-600 dark:bg-emerald-500 text-white",
    GEOP: "bg-orange-600 dark:bg-orange-500 text-white",
    ASTR: "bg-indigo-600 dark:bg-indigo-500 text-white",
    ATMO: "bg-cyan-600 dark:bg-cyan-500 text-white",
    OCNG: "bg-blue-600 dark:bg-blue-500 text-white",
    BICH: "bg-green-600 dark:bg-green-500 text-white",
    GENE: "bg-red-600 dark:bg-red-500 text-white",
    BIMS: "bg-blue-600 dark:bg-blue-500 text-white",
    BIOT: "bg-purple-600 dark:bg-purple-500 text-white",
    EEBL: "bg-green-600 dark:bg-green-500 text-white",
    ECCB: "bg-emerald-600 dark:bg-emerald-500 text-white",
    BESC: "bg-teal-600 dark:bg-teal-500 text-white",
    ENSS: "bg-green-600 dark:bg-green-500 text-white",
    WMHS: "bg-cyan-600 dark:bg-cyan-500 text-white",
    ANLY: "bg-blue-600 dark:bg-blue-500 text-white",
    MASC: "bg-purple-600 dark:bg-purple-500 text-white",

    // Medical & Health
    NURS: "bg-red-600 dark:bg-red-500 text-white",
    HLTH: "bg-blue-600 dark:bg-blue-500 text-white",
    HBEH: "bg-pink-600 dark:bg-pink-500 text-white",
    KINE: "bg-orange-600 dark:bg-orange-500 text-white",
    ATTR: "bg-green-600 dark:bg-green-500 text-white",
    NUTR: "bg-red-600 dark:bg-red-500 text-white",
    PHAR: "bg-blue-600 dark:bg-blue-500 text-white",
    PHSC: "bg-purple-600 dark:bg-purple-500 text-white",
    MPHY: "bg-red-600 dark:bg-red-500 text-white",
    MSCI: "bg-cyan-600 dark:bg-cyan-500 text-white",
    MCMD: "bg-green-600 dark:bg-green-500 text-white",
    PHLT: "bg-emerald-600 dark:bg-emerald-500 text-white",
    PHEB: "bg-blue-600 dark:bg-blue-500 text-white",
    PHEO: "bg-green-600 dark:bg-green-500 text-white",
    PHPM: "bg-purple-600 dark:bg-purple-500 text-white",
    SOPH: "bg-blue-600 dark:bg-blue-500 text-white",
    HCPI: "bg-red-600 dark:bg-red-500 text-white",
    EDHP: "bg-teal-600 dark:bg-teal-500 text-white",
    IBST: "bg-indigo-600 dark:bg-indigo-500 text-white",
    FIVS: "bg-purple-600 dark:bg-purple-500 text-white",
    FORS: "bg-gray-600 dark:bg-gray-500 text-white",
    NRSC: "bg-pink-600 dark:bg-pink-500 text-white",
    NEXT: "bg-indigo-600 dark:bg-indigo-500 text-white",
    PBSI: "bg-purple-600 dark:bg-purple-500 text-white",

    // Dental
    AEGD: "bg-blue-600 dark:bg-blue-500 text-white",
    ENDO: "bg-green-600 dark:bg-green-500 text-white",
    ORTH: "bg-purple-600 dark:bg-purple-500 text-white",
    PEDD: "bg-pink-600 dark:bg-pink-500 text-white",
    PERI: "bg-orange-600 dark:bg-orange-500 text-white",
    PROS: "bg-cyan-600 dark:bg-cyan-500 text-white",
    OMFP: "bg-red-600 dark:bg-red-500 text-white",
    OMFR: "bg-indigo-600 dark:bg-indigo-500 text-white",
    OMFS: "bg-amber-600 dark:bg-amber-500 text-white",
    OBIO: "bg-emerald-600 dark:bg-emerald-500 text-white",
    DDHS: "bg-teal-600 dark:bg-teal-500 text-white",
    DPHS: "bg-blue-600 dark:bg-blue-500 text-white",

    // Veterinary
    VIBS: "bg-amber-600 dark:bg-amber-500 text-white",
    VLCS: "bg-amber-600 dark:bg-amber-500 text-white",
    VSCS: "bg-green-600 dark:bg-green-500 text-white",
    VMID: "bg-red-600 dark:bg-red-500 text-white",
    VPAR: "bg-purple-600 dark:bg-purple-500 text-white",
    VPAT: "bg-blue-600 dark:bg-blue-500 text-white",
    VTMI: "bg-cyan-600 dark:bg-cyan-500 text-white",
    VTPB: "bg-emerald-600 dark:bg-emerald-500 text-white",
    VTPP: "bg-pink-600 dark:bg-pink-500 text-white",

    // Agriculture & Life Sciences
    AGEC: "bg-green-600 dark:bg-green-500 text-white",
    AGLS: "bg-emerald-600 dark:bg-emerald-500 text-white",
    AGSC: "bg-green-600 dark:bg-green-500 text-white",
    AGSM: "bg-amber-600 dark:bg-amber-500 text-white",
    ANSC: "bg-amber-600 dark:bg-amber-500 text-white",
    HORT: "bg-pink-600 dark:bg-pink-500 text-white",
    POSC: "bg-yellow-600 dark:bg-yellow-500 text-white",
    RWFM: "bg-green-600 dark:bg-green-500 text-white",
    SCSC: "bg-amber-600 dark:bg-amber-500 text-white",
    FSTC: "bg-red-600 dark:bg-red-500 text-white",
    CULN: "bg-orange-600 dark:bg-orange-500 text-white",
    MEPS: "bg-emerald-600 dark:bg-emerald-500 text-white",
    PLPA: "bg-green-600 dark:bg-green-500 text-white",
    ENTO: "bg-amber-600 dark:bg-amber-500 text-white",
    ALEC: "bg-blue-600 dark:bg-blue-500 text-white",
    ALED: "bg-green-600 dark:bg-green-500 text-white",
    AGCJ: "bg-cyan-600 dark:bg-cyan-500 text-white",

    // Liberal Arts & Humanities
    ENGL: "bg-pink-600 dark:bg-pink-500 text-white",
    HIST: "bg-amber-600 dark:bg-amber-500 text-white",
    PHIL: "bg-purple-600 dark:bg-purple-500 text-white",
    SPAN: "bg-red-600 dark:bg-red-500 text-white",
    FREN: "bg-blue-600 dark:bg-blue-500 text-white",
    GERM: "bg-gray-600 dark:bg-gray-500 text-white",
    CHIN: "bg-yellow-600 dark:bg-yellow-500 text-white",
    JAPN: "bg-pink-600 dark:bg-pink-500 text-white",
    ARAB: "bg-green-600 dark:bg-green-500 text-white",
    ITAL: "bg-green-600 dark:bg-green-500 text-white",
    RUSS: "bg-red-600 dark:bg-red-500 text-white",
    MODL: "bg-purple-600 dark:bg-purple-500 text-white",
    CLAS: "bg-amber-600 dark:bg-amber-500 text-white",
    RELS: "bg-purple-600 dark:bg-purple-500 text-white",
    AFST: "bg-orange-600 dark:bg-orange-500 text-white",
    ASIA: "bg-red-600 dark:bg-red-500 text-white",
    HISP: "bg-orange-600 dark:bg-orange-500 text-white",
    WGST: "bg-pink-600 dark:bg-pink-500 text-white",
    DHUM: "bg-cyan-600 dark:bg-cyan-500 text-white",

    // Social Sciences
    POLS: "bg-red-600 dark:bg-red-500 text-white",
    SOCI: "bg-blue-600 dark:bg-blue-500 text-white",
    ANTH: "bg-amber-600 dark:bg-amber-500 text-white",
    CPSY: "bg-teal-600 dark:bg-teal-500 text-white",
    EPSY: "bg-purple-600 dark:bg-purple-500 text-white",
    SPSY: "bg-pink-600 dark:bg-pink-500 text-white",
    GLST: "bg-blue-600 dark:bg-blue-500 text-white",
    INTA: "bg-green-600 dark:bg-green-500 text-white",

    // Fine Arts
    ARTS: "bg-violet-600 dark:bg-violet-500 text-white",
    MUSC: "bg-indigo-600 dark:bg-indigo-500 text-white",
    THEA: "bg-pink-600 dark:bg-pink-500 text-white",
    DCED: "bg-purple-600 dark:bg-purple-500 text-white",
    PVFA: "bg-cyan-600 dark:bg-cyan-500 text-white",
    VIST: "bg-blue-600 dark:bg-blue-500 text-white",
    VIZA: "bg-green-600 dark:bg-green-500 text-white",
    PERF: "bg-orange-600 dark:bg-orange-500 text-white",
    MSTC: "bg-purple-600 dark:bg-purple-500 text-white",
    FILM: "bg-gray-600 dark:bg-gray-500 text-white",

    // Architecture & Planning
    ARCH: "bg-gray-600 dark:bg-gray-500 text-white",
    CARC: "bg-blue-600 dark:bg-blue-500 text-white",
    LAND: "bg-green-600 dark:bg-green-500 text-white",
    PLAN: "bg-purple-600 dark:bg-purple-500 text-white",
    URPN: "bg-amber-600 dark:bg-amber-500 text-white",
    URSC: "bg-cyan-600 dark:bg-cyan-500 text-white",
    COSC: "bg-orange-600 dark:bg-orange-500 text-white",
    LDEV: "bg-emerald-600 dark:bg-emerald-500 text-white",

    // Education
    EDCI: "bg-blue-600 dark:bg-blue-500 text-white",
    EDAD: "bg-purple-600 dark:bg-purple-500 text-white",
    TEED: "bg-green-600 dark:bg-green-500 text-white",
    SPED: "bg-pink-600 dark:bg-pink-500 text-white",
    RDNG: "bg-cyan-600 dark:bg-cyan-500 text-white",
    LDTC: "bg-indigo-600 dark:bg-indigo-500 text-white",
    EHRD: "bg-amber-600 dark:bg-amber-500 text-white",
    CEHD: "bg-emerald-600 dark:bg-emerald-500 text-white",
    BEFB: "bg-orange-600 dark:bg-orange-500 text-white",
    BESL: "bg-yellow-600 dark:bg-yellow-500 text-white",
    MEFB: "bg-purple-600 dark:bg-purple-500 text-white",
    SEFB: "bg-red-600 dark:bg-red-500 text-white",
    TEFB: "bg-blue-600 dark:bg-blue-500 text-white",
    ECDE: "bg-pink-600 dark:bg-pink-500 text-white",

    // Communication & Journalism
    COMM: "bg-blue-600 dark:bg-blue-500 text-white",
    JOUR: "bg-gray-600 dark:bg-gray-500 text-white",

    // Military & Defense
    MLSC: "bg-green-600 dark:bg-green-500 text-white",
    AERS: "bg-sky-600 dark:bg-sky-500 text-white",
    NVSC: "bg-blue-600 dark:bg-blue-500 text-white",
    SOMS: "bg-red-600 dark:bg-red-500 text-white",

    // Law & Government
    LAW: "bg-purple-600 dark:bg-purple-500 text-white",
    BUSH: "bg-blue-600 dark:bg-blue-500 text-white",
    PSAA: "bg-green-600 dark:bg-green-500 text-white",

    // Recreation & Tourism
    RPTS: "bg-emerald-100 text-emerald-600",
    HMGT: "bg-orange-100 text-orange-600",
    SPMT: "bg-red-100 text-red-600",

    // Technology & Information Systems
    TCMG: "bg-blue-100 text-blue-600",
    TCMT: "bg-purple-100 text-purple-600",
    ITSV: "bg-cyan-100 text-cyan-600",

    // Energy
    ENGY: "bg-yellow-100 text-yellow-600",

    // Economics & Finance
    ECMT: "bg-indigo-100 text-indigo-600",

    // General/Administrative
    ARSC: "bg-gray-100 text-gray-600",
    HONR: "bg-yellow-100 text-yellow-600",
    UGST: "bg-blue-100 text-blue-600",
    FYEX: "bg-green-100 text-green-600",
    SYEX: "bg-purple-100 text-purple-600",
    ASCC: "bg-cyan-100 text-cyan-600",
    INST: "bg-amber-100 text-amber-600",
    SABR: "bg-emerald-100 text-emerald-600",
    NSEB: "bg-orange-100 text-orange-600",
    TAMU: "bg-maroon-100 text-maroon-600",
  };

  const deptCode = courseCode.split(/\s+/)[0];
  return colorMap[deptCode] || "bg-slate-700 dark:bg-slate-600 text-white";
};

export default function CoursePage({ params }: CoursePageProps) {
  const resolvedParams = use(params);
  const shouldReduceMotion = useReducedMotion();
  const [courseData, setCourseData] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [termProfessorIds, setTermProfessorIds] = useState<Set<string>>(
    new Set()
  );
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loadingTermData, setLoadingTermData] = useState(false);

  // Comparison context
  const { addCourse, removeCourse, isSelected, canAddMore } = useComparison();

  // Professor comparison context
  const {
    addProfessor,
    isSelected: isProfessorSelected,
    canAddMore: canAddMoreProfessors,
  } = useProfessorComparison();

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        const data = await getCourseDetail(resolvedParams.id);
        setCourseData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [resolvedParams.id]);

  // Load terms
  useEffect(() => {
    const loadTerms = async () => {
      try {
        const termsData = await getTerms();
        setTerms(termsData);
      } catch (err) {
        console.error("Failed to load terms:", err);
      }
    };

    loadTerms();
  }, []);

  // Load term-specific professors and sections when term is selected
  useEffect(() => {
    const loadTermData = async () => {
      if (!selectedTerm || !courseData) {
        // Reset to all professors when no term is selected
        setTermProfessorIds(new Set());
        setSections([]);
        return;
      }

      try {
        setLoadingTermData(true);
        const [professorsData, sectionsData] = await Promise.all([
          getCourseProfessorsForTerm(selectedTerm, resolvedParams.id),
          getCourseSectionsForTerm(selectedTerm, resolvedParams.id),
        ]);

        // Create a set of professor IDs/names from term-specific data
        // Use both ID and name for matching since some professors might only have one
        const professorIdSet = new Set<string>();
        professorsData?.forEach((prof) => {
          if (prof.id) {
            professorIdSet.add(prof.id);
          }
          if (prof.name) {
            // Normalize name for matching (lowercase, trim)
            professorIdSet.add(prof.name.toLowerCase().trim());
          }
        });
        setTermProfessorIds(professorIdSet);
        setSections(sectionsData);
      } catch (err) {
        console.error("Failed to load term data:", err);
        setTermProfessorIds(new Set());
        setSections([]);
      } finally {
        setLoadingTermData(false);
      }
    };

    loadTermData();
  }, [selectedTerm, courseData, resolvedParams.id]);

  // Filter professors based on selected term
  const displayedProfessors = React.useMemo(() => {
    if (!courseData?.professors) return undefined;

    // If no term selected, show all professors
    if (!selectedTerm || termProfessorIds.size === 0) {
      return courseData.professors;
    }

    // Filter professors to only those teaching in the selected term
    return courseData.professors.filter((prof) => {
      // Match by ID if available
      if (prof.id && termProfessorIds.has(prof.id)) {
        return true;
      }
      // Match by name (normalized)
      if (prof.name && termProfessorIds.has(prof.name.toLowerCase().trim())) {
        return true;
      }
      return false;
    });
  }, [courseData?.professors, selectedTerm, termProfessorIds]);

  if (loading) {
    return (
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="min-h-screen relative"
          style={{ background: "var(--app-bg-gradient)" }}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ background: "var(--app-bg-ambient)" }}
          />
          <Navigation variant="glass" />
          <main className="pt-24 pb-20 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
              <Card className="p-8 rounded-2xl shadow-none bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                <div className="text-center text-text-body dark:text-white/70">
                  Loading course details...
                </div>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </MotionConfig>
    );
  }

  if (error || !courseData) {
    return (
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="min-h-screen relative"
          style={{ background: "var(--app-bg-gradient)" }}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ background: "var(--app-bg-ambient)" }}
          />
          <Navigation variant="glass" />
          <main className="pt-24 pb-20 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
              <Card className="p-8 rounded-2xl shadow-none bg-red-50 border border-red-200 mb-6">
                <div className="text-center text-red-700 font-semibold">
                  {error || "Course not found"}
                </div>
              </Card>
              <Link href="/courses">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-full"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Courses
                </Button>
              </Link>
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
        style={{ background: "var(--app-bg-gradient)" }}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ background: "var(--app-bg-ambient)" }}
        />
        <Navigation variant="glass" />

        <main className="pt-24 pb-20 relative z-10">
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

            {/* Course Header */}
            <div className="">
              <Card className="p-6 gap-4 rounded-2xl shadow-none bg-card border-border relative overflow-hidden dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                {/* subtle corner highlight (match Courses cards) */}
                <div
                  aria-hidden
                  className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#FFCF3F]/10 blur-2xl"
                />
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className={`${getDepartmentColor(courseData.code)} border-transparent px-3 py-1 text-xs font-medium rounded-full`}
                  >
                    {getDepartmentFromCode(courseData.code)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-accent text-accent bg-canvas/70 px-3 py-1 text-xs font-medium rounded-full dark:bg-black/30 dark:border-accent"
                  >
                    {courseData.credits} Credits
                  </Badge>
                  {courseData.lectureHours !== undefined &&
                    courseData.lectureHours > 0 && (
                      <Badge
                        variant="outline"
                        className="border-border text-text-body bg-canvas/70 px-3 py-1 text-xs font-medium rounded-full dark:bg-black/30 dark:border-white/15 dark:text-white/80"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {courseData.lectureHours}h Lecture
                      </Badge>
                    )}
                  {courseData.labHours !== undefined &&
                    courseData.labHours > 0 && (
                      <Badge
                        variant="outline"
                        className="border-border text-text-body bg-canvas/70 px-3 py-1 text-xs font-medium rounded-full dark:bg-black/30 dark:border-white/15 dark:text-white/80"
                      >
                        <FlaskConical className="w-3 h-3 mr-1" />
                        {courseData.labHours}h Lab
                      </Badge>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 relative">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-text-heading dark:text-white">
                      {courseData.code}: {courseData.name}
                    </h1>

                    <p className="text-text-body dark:text-white/80 mb-4 max-w-4xl leading-relaxed">
                      {courseData.description}
                    </p>
                  </div>

                  {/* Add to Comparison Button */}
                  <Button
                    variant={
                      isSelected(courseData.code) ? "default" : "outline"
                    }
                    onClick={() => {
                      if (isSelected(courseData.code)) {
                        removeCourse(courseData.code);
                      } else {
                        addCourse(courseData.code);
                      }
                    }}
                    disabled={!isSelected(courseData.code) && !canAddMore()}
                    className={`w-full lg:w-auto lg:ml-4 ${
                      isSelected(courseData.code)
                        ? "bg-[#FFCF3F] text-[#0f0f0f] hover:bg-[#FFD966]"
                        : "border-border bg-canvas text-text-body hover:bg-button-hover dark:border-white/15 dark:bg-black/30 dark:text-white/80 dark:hover:bg-black/45"
                    } transition-all duration-200 rounded-full`}
                  >
                    {isSelected(courseData.code) ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">
                          Added to Compare
                        </span>
                        <span className="sm:hidden">Added</span>
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Add to Compare</span>
                        <span className="sm:hidden">Compare</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Avg GPA",
                      value: courseData.avgGPA !== -1 ? courseData.avgGPA : 0,
                      decimals: 2,
                      icon: BarChart3,
                      display:
                        courseData.avgGPA !== -1 ? (
                          <CountUpNumber
                            value={courseData.avgGPA}
                            decimals={2}
                          />
                        ) : (
                          "N/A"
                        ),
                    },
                    {
                      label: "Difficulty",
                      icon: Zap,
                      display: (
                        <span
                          className="block font-semibold tracking-tight leading-tight break-words text-balance line-clamp-2"
                          // Auto-fit the label: short strings stay big, longer shrink.
                          // Uses a CSS variable so the math is stable across renders.
                          style={
                            {
                              ["--len" as never]: courseData.difficulty.length,
                              fontSize:
                                "clamp(1rem, calc(2.3rem - (var(--len) * 0.085rem)), 1.55rem)",
                            } as React.CSSProperties
                          }
                        >
                          {courseData.difficulty}
                        </span>
                      ),
                    },
                    {
                      label: "Enrollment",
                      icon: Users,
                      display: (
                        <CountUpNumber value={courseData.enrollment ?? 0} />
                      ),
                    },
                    {
                      label: "Sections",
                      icon: BookOpen,
                      display: (
                        <CountUpNumber value={courseData.sections ?? 0} />
                      ),
                    },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <motion.div
                        key={m.label}
                        initial={
                          shouldReduceMotion ? false : { opacity: 0, y: 12 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                        className="rounded-2xl border border-border bg-card px-4 py-4 flex items-center dark:border-white/10 dark:bg-black/45 dark:backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="h-10 w-10 rounded-xl bg-canvas border border-border flex items-center justify-center text-accent dark:bg-white/10 dark:border-white/10">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[#500000] dark:text-[#FFCF3F] text-xl sm:text-2xl font-semibold tracking-tight leading-tight break-words">
                              {m.display}
                            </div>
                            <div className="text-text-body text-xs sm:text-sm dark:text-white/80">
                              {m.label}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 rounded-2xl shadow-none bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-text-heading dark:text-white">
                    Course Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-body uppercase tracking-wider">
                        Description:
                      </span>
                      <p className="text-text-body dark:text-white/80 mt-1 leading-relaxed">
                        {courseData.description}
                      </p>
                    </div>

                    {courseData.prerequisites &&
                      typeof courseData.prerequisites === "object" &&
                      !Array.isArray(courseData.prerequisites) &&
                      (courseData.prerequisites.text ||
                        (courseData.prerequisites.courses &&
                          courseData.prerequisites.courses.length > 0)) && (
                        <div>
                          <span className="text-xs font-semibold text-body uppercase tracking-wider">
                            Prerequisites:
                          </span>
                          {courseData.prerequisites.text && (
                            <p className="text-sm text-text-body dark:text-white/70 mt-1 mb-2">
                              {courseData.prerequisites.text}
                            </p>
                          )}
                          {(() => {
                            // Only show course badges if there are courses to display
                            const prereqCourses =
                              courseData.prerequisites.courses || [];
                            const hasCourses = prereqCourses.length > 0;

                            if (!hasCourses) return null;

                            // Find courses that appear in both prerequisites and corequisites
                            // Normalize course codes by removing all whitespace and converting to uppercase for comparison
                            const coreqCoursesRaw =
                              courseData.corequisites?.courses || [];
                            const normalizeCourse = (c: string) =>
                              c.replace(/\s+/g, "").toUpperCase();
                            const coreqCoursesNormalized = new Set(
                              coreqCoursesRaw.map(normalizeCourse)
                            );
                            const hasOverlap = prereqCourses.some((c: string) =>
                              coreqCoursesNormalized.has(normalizeCourse(c))
                            );

                            return (
                              <>
                                <div className="flex flex-wrap items-center gap-2">
                                  {courseData.prerequisites.groups &&
                                  courseData.prerequisites.groups.length > 0
                                    ? // Use groups if available
                                      courseData.prerequisites.groups.map(
                                        (
                                          group: string[],
                                          groupIndex: number
                                        ) => (
                                          <div
                                            key={groupIndex}
                                            className="flex items-center gap-1"
                                          >
                                            {groupIndex > 0 && (
                                              <span className="text-xs text-text-body/60 dark:text-white/50 mx-1 font-medium">
                                                AND
                                              </span>
                                            )}
                                            <div className="flex items-center gap-1">
                                              {group.map(
                                                (
                                                  prereq: string,
                                                  prereqIndex: number
                                                ) => {
                                                  const isAlsoCoreq =
                                                    coreqCoursesNormalized.has(
                                                      normalizeCourse(prereq)
                                                    );
                                                  return (
                                                    <React.Fragment
                                                      key={prereqIndex}
                                                    >
                                                      {prereqIndex > 0 && (
                                                        <span className="text-xs text-accent font-medium">
                                                          or
                                                        </span>
                                                      )}
                                                      <Link
                                                        href={`/course/${prereq.replace(/\s+/g, "")}`}
                                                      >
                                                        <Badge
                                                          variant="outline"
                                                          className={`text-xs px-2 py-1 font-medium rounded-full transition-colors cursor-pointer ${
                                                            isAlsoCoreq
                                                              ? "border-green-500 text-green-800 bg-green-200 dark:border-green-400 dark:text-green-200 dark:bg-green-600/40"
                                                              : "border-border text-text-body bg-canvas/70 hover:bg-accent hover:text-white dark:border-white/15 dark:text-white/80 dark:bg-black/30 dark:hover:bg-accent dark:hover:text-white"
                                                          }`}
                                                          title={
                                                            isAlsoCoreq
                                                              ? "Can be taken before OR concurrently"
                                                              : undefined
                                                          }
                                                        >
                                                          {isAlsoCoreq && (
                                                            <span className="mr-1">
                                                              ⟷
                                                            </span>
                                                          )}
                                                          {prereq}
                                                        </Badge>
                                                      </Link>
                                                    </React.Fragment>
                                                  );
                                                }
                                              )}
                                            </div>
                                          </div>
                                        )
                                      )
                                    : // Fallback to simple courses list
                                      prereqCourses.map(
                                        (prereq: string, index: number) => {
                                          const isAlsoCoreq =
                                            coreqCoursesNormalized.has(
                                              normalizeCourse(prereq)
                                            );
                                          return (
                                            <React.Fragment key={index}>
                                              {index > 0 && (
                                                <span className="text-xs text-text-body/60 dark:text-white/50">
                                                  ,
                                                </span>
                                              )}
                                              <Link
                                                href={`/course/${prereq.replace(/\s+/g, "")}`}
                                              >
                                                <Badge
                                                  variant="outline"
                                                  className={`text-xs px-2 py-1 font-medium rounded-full transition-colors cursor-pointer ${
                                                    isAlsoCoreq
                                                      ? "border-green-500 text-green-800 bg-green-200 dark:border-green-400 dark:text-green-200 dark:bg-green-600/40"
                                                      : "border-border text-text-body bg-canvas/70 hover:bg-accent hover:text-white dark:border-white/15 dark:text-white/80 dark:bg-black/30 dark:hover:bg-accent dark:hover:text-white"
                                                  }`}
                                                  title={
                                                    isAlsoCoreq
                                                      ? "Can be taken before OR concurrently"
                                                      : undefined
                                                  }
                                                >
                                                  {isAlsoCoreq && (
                                                    <span className="mr-1">
                                                      ⟷
                                                    </span>
                                                  )}
                                                  {prereq}
                                                </Badge>
                                              </Link>
                                            </React.Fragment>
                                          );
                                        }
                                      )}
                                </div>
                                {hasOverlap && (
                                  <div className="mt-3 p-2.5 rounded-lg bg-green-100 dark:bg-green-600/30 border border-green-300 dark:border-green-500/50">
                                    <p className="text-xs text-green-800 dark:text-green-200 flex items-center gap-2">
                                      <span className="text-sm">⟷</span>
                                      <span>
                                        <strong>Green courses</strong> can be
                                        taken before OR concurrently (as a
                                        corequisite)
                                      </span>
                                    </p>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}

                    {courseData.corequisites &&
                      courseData.corequisites.courses &&
                      courseData.corequisites.courses.length > 0 && (
                        <div>
                          {(() => {
                            // Find courses that are ONLY corequisites (not also prerequisites)
                            // Normalize course codes for comparison
                            const prereqCoursesRaw =
                              (courseData.prerequisites &&
                              typeof courseData.prerequisites === "object" &&
                              !Array.isArray(courseData.prerequisites)
                                ? courseData.prerequisites.courses
                                : Array.isArray(courseData.prerequisites)
                                  ? courseData.prerequisites
                                  : []) || [];
                            const normalizeCourse = (c: string) =>
                              c.replace(/\s+/g, "").toUpperCase();
                            const prereqCoursesNormalized = new Set(
                              prereqCoursesRaw.map(normalizeCourse)
                            );
                            const coreqOnlyCourses =
                              courseData.corequisites.courses.filter(
                                (c: string) =>
                                  !prereqCoursesNormalized.has(
                                    normalizeCourse(c)
                                  )
                              );
                            const sharedCourses =
                              courseData.corequisites.courses.filter(
                                (c: string) =>
                                  prereqCoursesNormalized.has(
                                    normalizeCourse(c)
                                  )
                              );

                            // If all corequisites are also prerequisites, show a simpler message
                            if (
                              coreqOnlyCourses.length === 0 &&
                              sharedCourses.length > 0
                            ) {
                              return (
                                <>
                                  <span className="text-xs font-semibold text-body uppercase tracking-wider">
                                    Corequisites:
                                  </span>
                                  <p className="text-sm text-text-body dark:text-white/70 mt-1">
                                    {courseData.corequisites.text}
                                  </p>
                                  <p className="text-xs text-text-body/70 dark:text-white/50 mt-1 italic">
                                    (Same as prerequisites marked in green above
                                    - can be taken before or concurrently)
                                  </p>
                                </>
                              );
                            }

                            return (
                              <>
                                <span className="text-xs font-semibold text-body uppercase tracking-wider">
                                  Corequisites:
                                </span>
                                <p className="text-sm text-text-body dark:text-white/70 mt-1 mb-2">
                                  {courseData.corequisites.text}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {courseData.corequisites.courses.map(
                                    (coreq: string, index: number) => {
                                      const isAlsoPrereq =
                                        prereqCoursesNormalized.has(
                                          normalizeCourse(coreq)
                                        );
                                      return (
                                        <Link
                                          key={index}
                                          href={`/course/${coreq.replace(/\s+/g, "")}`}
                                        >
                                          <Badge
                                            variant="outline"
                                            className={`text-xs px-2 py-1 font-medium rounded-full transition-colors cursor-pointer ${
                                              isAlsoPrereq
                                                ? "border-green-500 text-green-800 bg-green-200 dark:border-green-400 dark:text-green-200 dark:bg-green-600/40"
                                                : "border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-500/30 dark:text-orange-400 dark:bg-orange-500/10"
                                            }`}
                                            title={
                                              isAlsoPrereq
                                                ? "Can be taken before OR concurrently"
                                                : "Must be taken concurrently"
                                            }
                                          >
                                            {isAlsoPrereq && (
                                              <span className="mr-1">⟷</span>
                                            )}
                                            {coreq}
                                          </Badge>
                                        </Link>
                                      );
                                    }
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}

                    {courseData.crossListings &&
                      courseData.crossListings.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-body uppercase tracking-wider">
                            Cross-Listed With:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {courseData.crossListings.map(
                              (crossList: string, index: number) => (
                                <Link
                                  key={index}
                                  href={`/course/${crossList.replace(/\s+/g, "")}`}
                                >
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-500/30 dark:text-purple-400 dark:bg-purple-500/10 px-2 py-1 font-medium rounded-full transition-colors cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-500/20"
                                  >
                                    <LinkIcon className="w-3 h-3 mr-1" />
                                    {crossList}
                                  </Badge>
                                </Link>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    <div>
                      <span className="text-xs font-semibold text-body uppercase tracking-wider">
                        Section Attributes:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-2 max-h-24 overflow-y-auto md:max-h-none md:overflow-visible">
                        {courseData.sectionAttributes?.map(
                          (attr: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs border-white/15 text-white/80 bg-black/20 dark:border-white/15 dark:text-white/80 dark:bg-black/30 px-2 py-1 font-medium flex-shrink-0 rounded-full"
                            >
                              {attr}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg">
                      <span className="text-xs font-semibold text-body uppercase tracking-wider">
                        Total Sections:
                      </span>
                      <div className="text-xs text-text-body/80 dark:text-white/70 border border-border dark:border-white/15 px-3 py-1 rounded-full font-medium bg-canvas dark:bg-black/30">
                        <CountUpNumber value={courseData.sections ?? 0} />{" "}
                        sections
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Term Selector */}
                <div className="flex items-center gap-3 mb-2">
                  <label
                    htmlFor="term-selector"
                    className="text-sm font-semibold text-text-heading dark:text-white"
                  >
                    Select Term:
                  </label>
                  <select
                    id="term-selector"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="flex-1 max-w-xs bg-canvas border border-border rounded-xl px-4 py-2 text-text-body dark:bg-black/45 dark:border-white/15 dark:text-white/90 dark:backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                  >
                    <option value="">All Terms</option>
                    {terms.map((term) => (
                      <option key={term.termCode} value={term.termCode}>
                        {term.termDesc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Professors Section */}
                <Card className="p-4 rounded-2xl shadow-none bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="text-xl font-bold text-text-heading dark:text-white">
                      Course Professors
                    </h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      {loadingTermData && (
                        <div className="text-xs text-text-body/80 dark:text-white/70">
                          Loading term data...
                        </div>
                      )}
                      {(displayedProfessors || []).length >= 2 && (
                        <Link
                          href="/compare?tab=professors"
                          className="w-full sm:w-auto"
                        >
                          <Button
                            size="sm"
                            className="bg-[#FFCF3F] text-[#0f0f0f] hover:bg-[#FFD966] rounded-full flex items-center gap-2 w-full sm:w-auto"
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              Compare Professors
                            </span>
                            <span className="sm:hidden">Compare</span>
                          </Button>
                        </Link>
                      )}
                      <div className="text-xs text-text-body/80 dark:text-white/70 border border-border dark:border-white/15 px-3 py-1 rounded-full bg-canvas dark:bg-black/30">
                        <CountUpNumber
                          value={displayedProfessors?.length || 0}
                        />{" "}
                        professors
                        {selectedTerm && " (this term)"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {displayedProfessors?.map((prof, index: number) => (
                      <Card
                        key={index}
                        className="p-4 gap-0 rounded-2xl shadow-none bg-card border-border hover:border-border transition-all duration-200 group relative overflow-hidden dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm dark:hover:border-white/20"
                      >
                        {/* Decorative gradient accent */}
                        <div
                          aria-hidden
                          className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#FFCF3F]/10 blur-2xl"
                        />

                        <div className="">
                          <div className="flex gap-4">
                            {/* Left side: Name and AI Summary header */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-md font-bold text-text-heading dark:text-white mb-1">
                                {prof.name}
                              </h4>
                              {/* Show Grade data only badge if no review data */}
                              {!(prof.id && prof.rating !== undefined) && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-border bg-canvas text-text-body dark:border-white/15 dark:bg-black/30 dark:text-white/70 font-medium rounded-full"
                                >
                                  Grade data only
                                </Badge>
                              )}
                              {/* AI Summary header - show if courseSummary available */}
                              {(() => {
                                const summary = prof.courseSummary;
                                const hasSummary =
                                  summary &&
                                  (summary.teaching ||
                                    summary.exams ||
                                    summary.grading ||
                                    summary.workload ||
                                    summary.personality ||
                                    summary.policies);
                                if (!hasSummary) return null;
                                return (
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <h5 className="text-xs font-semibold text-heading uppercase tracking-wide">
                                      AI Summary
                                    </h5>
                                    <span className="text-xs text-text-body/70 dark:text-white/60">
                                      based on{" "}
                                      {prof.totalReviews ?? prof.reviews ?? 0}{" "}
                                      reviews
                                    </span>
                                    {prof.confidence !== undefined &&
                                      prof.confidence !== null && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs border-border bg-canvas text-text-body dark:border-white/15 dark:bg-black/30 dark:text-white/70 font-medium rounded-full"
                                        >
                                          {(prof.confidence * 100).toFixed(0)}%
                                          confident
                                        </Badge>
                                      )}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Right side: Large rating badge */}
                            {prof.id && prof.rating !== undefined && (
                              <div className="flex items-center justify-center bg-[#FFCF3F] text-[#0f0f0f] px-4 py-2 rounded-2xl min-w-[70px] self-stretch">
                                <div className="flex flex-col items-center">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-current" />
                                    <span className="text-xl font-bold">
                                      {prof.rating.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Professor AI Summary content - show courseSummary or legacy description */}
                          {(() => {
                            // Check if we have any courseSummary content
                            const summary = prof.courseSummary;
                            const hasSummary =
                              summary &&
                              (summary.teaching ||
                                summary.exams ||
                                summary.grading ||
                                summary.workload ||
                                summary.personality ||
                                summary.policies);

                            // Fall back to legacy description if no courseSummary
                            const legacyDesc =
                              prof.description &&
                              prof.description !== "Course instruction" &&
                              prof.description.trim().length > 0
                                ? prof.description
                                : null;

                            if (!hasSummary && !legacyDesc) return null;

                            return (
                              <div className="mb-3 mt-3">
                                <div className="flex items-center gap-2 mb-2 hidden">
                                  <h5 className="text-xs font-semibold text-heading uppercase tracking-wide">
                                    AI Summary
                                  </h5>
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-border bg-canvas text-text-body dark:border-white/15 dark:bg-black/30 dark:text-white/70 font-medium rounded-full"
                                  >
                                    Generated by AI
                                  </Badge>
                                  {prof.confidence !== undefined && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-border bg-canvas text-text-body dark:border-white/15 dark:bg-black/30 dark:text-white/70 font-medium rounded-full"
                                    >
                                      {Math.round(prof.confidence * 100)}%
                                      confidence
                                    </Badge>
                                  )}
                                </div>
                                <div className="bg-canvas/70 border border-border rounded-2xl p-3 dark:bg-black/30 dark:border-white/10 space-y-3">
                                  {hasSummary ? (
                                    <>
                                      {summary.teaching && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <GraduationCap className="w-3.5 h-3.5 text-accent" />
                                            <span className="text-xs font-semibold text-text-heading dark:text-white/90">
                                              Teaching Style
                                            </span>
                                          </div>
                                          <p className="text-text-body dark:text-white/80 leading-relaxed text-sm pl-5">
                                            {summary.teaching}
                                          </p>
                                        </div>
                                      )}
                                      {summary.exams && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <ClipboardList className="w-3.5 h-3.5 text-accent" />
                                            <span className="text-xs font-semibold text-text-heading dark:text-white/90">
                                              Exams & Quizzes
                                            </span>
                                          </div>
                                          <p className="text-text-body dark:text-white/80 leading-relaxed text-sm pl-5">
                                            {summary.exams}
                                          </p>
                                        </div>
                                      )}
                                      {summary.grading && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <FileText className="w-3.5 h-3.5 text-accent" />
                                            <span className="text-xs font-semibold text-text-heading dark:text-white/90">
                                              Grading
                                            </span>
                                          </div>
                                          <p className="text-text-body dark:text-white/80 leading-relaxed text-sm pl-5">
                                            {summary.grading}
                                          </p>
                                        </div>
                                      )}
                                      {summary.workload && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <Briefcase className="w-3.5 h-3.5 text-accent" />
                                            <span className="text-xs font-semibold text-text-heading dark:text-white/90">
                                              Workload
                                            </span>
                                          </div>
                                          <p className="text-text-body dark:text-white/80 leading-relaxed text-sm pl-5">
                                            {summary.workload}
                                          </p>
                                        </div>
                                      )}
                                      {summary.personality && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <UserCircle className="w-3.5 h-3.5 text-accent" />
                                            <span className="text-xs font-semibold text-text-heading dark:text-white/90">
                                              Personality
                                            </span>
                                          </div>
                                          <p className="text-text-body dark:text-white/80 leading-relaxed text-sm pl-5">
                                            {summary.personality}
                                          </p>
                                        </div>
                                      )}
                                      {summary.policies && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <ScrollText className="w-3.5 h-3.5 text-accent" />
                                            <span className="text-xs font-semibold text-text-heading dark:text-white/90">
                                              Policies
                                            </span>
                                          </div>
                                          <p className="text-text-body dark:text-white/80 leading-relaxed text-sm pl-5">
                                            {summary.policies}
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-text-body dark:text-white/80 leading-relaxed text-sm">
                                      {legacyDesc}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Professor Tags - only show if available and not empty */}
                          {prof.tag_frequencies &&
                            Object.keys(prof.tag_frequencies).length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-xs font-semibold text-heading mb-2 uppercase tracking-wide">
                                  Student Tags
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(prof.tag_frequencies)
                                    .sort(([, a], [, b]) => b - a) // Sort by frequency, highest first
                                    .slice(0, 6) // Show top 6 tags
                                    .map(([tag, frequency]) => (
                                      <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-xs border-border bg-canvas/70 text-text-body font-medium px-2 py-1 rounded-full dark:border-white/15 dark:bg-black/30 dark:text-white/80"
                                      >
                                        {tag}{" "}
                                        <span className="text-accent">
                                          ({frequency})
                                        </span>
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            )}
                        </div>

                        {/* Grade Distribution for this professor - only show if data exists */}
                        {prof.gradeDistribution && (
                          <div className="border-t border-border pt-3 mt-3">
                            <h5 className="text-sm font-semibold text-heading mb-2">
                              Grade Distribution
                            </h5>
                            <div className="flex gap-1 h-6 mb-2 rounded-lg overflow-hidden shadow-md">
                              <div
                                className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
                                style={{
                                  width: `${prof.gradeDistribution.A}%`,
                                }}
                              >
                                {prof.gradeDistribution.A > 12 ? "A" : ""}
                              </div>
                              <div
                                className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                                style={{
                                  width: `${prof.gradeDistribution.B}%`,
                                }}
                              >
                                {prof.gradeDistribution.B > 12 ? "B" : ""}
                              </div>
                              <div
                                className="bg-yellow-500 flex items-center justify-center text-white text-xs font-semibold"
                                style={{
                                  width: `${prof.gradeDistribution.C}%`,
                                }}
                              >
                                {prof.gradeDistribution.C > 12 ? "C" : ""}
                              </div>
                              <div
                                className="bg-orange-500 flex items-center justify-center text-white text-xs font-semibold"
                                style={{
                                  width: `${prof.gradeDistribution.D}%`,
                                }}
                              >
                                {prof.gradeDistribution.D > 12 ? "D" : ""}
                              </div>
                              <div
                                className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold"
                                style={{
                                  width: `${prof.gradeDistribution.F}%`,
                                }}
                              >
                                {prof.gradeDistribution.F > 12 ? "F" : ""}
                              </div>
                            </div>
                            <div className="grid grid-cols-5 gap-1 text-xs">
                              <div className="text-center">
                                <div className="font-bold text-green-600 text-sm">
                                  {prof.gradeDistribution.A}%
                                </div>
                                <div className="text-body font-medium text-xs">
                                  A
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-blue-600 text-sm">
                                  {prof.gradeDistribution.B}%
                                </div>
                                <div className="text-body font-medium text-xs">
                                  B
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-yellow-600 text-sm">
                                  {prof.gradeDistribution.C}%
                                </div>
                                <div className="text-body font-medium text-xs">
                                  C
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-orange-600 text-sm">
                                  {prof.gradeDistribution.D}%
                                </div>
                                <div className="text-body font-medium text-xs">
                                  D
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-red-600 text-sm">
                                  {prof.gradeDistribution.F}%
                                </div>
                                <div className="text-body font-medium text-xs">
                                  F
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div
                          className={`mt-3 pt-2 ${prof.gradeDistribution ? "border-t border-border" : ""}`}
                        >
                          {prof.id ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              {/* Top row on mobile, left side on desktop */}
                              <div className="flex gap-2 sm:flex-1">
                                <Link
                                  href={`/professor/${prof.id}`}
                                  className="flex-1"
                                >
                                  <Button
                                    variant="default"
                                    className="w-full bg-[#500000] hover:bg-[#600000] text-white transition-all duration-200 hover:scale-105 text-xs py-2"
                                  >
                                    <User className="w-3 h-3 mr-1" />
                                    <span className="sm:hidden">Prof</span>
                                    <span className="hidden sm:inline">
                                      Professor
                                    </span>
                                  </Button>
                                </Link>
                                <Link
                                  href={`/professor/${prof.id}/reviews`}
                                  className="flex-1"
                                >
                                  <Button className="w-full bg-gradient-to-r from-[#500000] to-[#700000] hover:from-[#600000] hover:to-[#800000] text-white transition-all duration-200 hover:scale-105 text-xs py-2">
                                    <Eye className="w-3 h-3 mr-1" />
                                    <span className="sm:hidden">Reviews</span>
                                    <span className="hidden sm:inline">
                                      Reviews (
                                      {prof.totalReviews ?? prof.reviews ?? 0})
                                    </span>
                                  </Button>
                                </Link>
                              </div>

                              {/* Bottom row on mobile, right side on desktop */}
                              <Button
                                variant={
                                  isProfessorSelected(prof.id!)
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => {
                                  if (isProfessorSelected(prof.id!)) {
                                    // Remove from comparison
                                    // removeProfessor function would be needed here
                                  } else {
                                    // Add to comparison
                                    addProfessor(prof.id!);
                                  }
                                }}
                                disabled={
                                  !isProfessorSelected(prof.id!) &&
                                  !canAddMoreProfessors()
                                }
                                className={`w-full sm:w-auto sm:min-w-[100px] transition-all duration-200 hover:scale-105 text-xs py-2 ${
                                  isProfessorSelected(prof.id!)
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "border-[#500000] text-[#500000] hover:bg-[#500000] hover:text-white"
                                }`}
                              >
                                {isProfessorSelected(prof.id!) ? (
                                  <>
                                    <Check className="w-3 h-3 mr-1" />
                                    <span className="sm:hidden">Added</span>
                                    <span className="hidden sm:inline">
                                      Added
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3 mr-1" />
                                    <span className="sm:hidden">Compare</span>
                                    <span className="hidden sm:inline">
                                      Compare
                                    </span>
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="text-xs text-text-body bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg">
                                <span className="font-medium">
                                  Limited data available
                                </span>
                                <br />
                                <span className="text-gray-500">
                                  Grade distribution only
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>

                {/* Sections Section - Only show when term is selected */}
                {selectedTerm && sections.length > 0 && (
                  <Card className="p-4 rounded-2xl shadow-none bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-text-heading dark:text-white mb-4">
                      Course Sections (
                      {terms.find((t) => t.termCode === selectedTerm)
                        ?.termDesc || selectedTerm}
                      )
                    </h3>
                    <div className="space-y-3">
                      {sections.map((section) => (
                        <Card
                          key={section.id}
                          className="p-4 rounded-xl shadow-none bg-canvas/70 border border-border hover:bg-canvas transition-all duration-200 dark:bg-black/30 dark:border-white/10 dark:hover:bg-black/40"
                        >
                          <div className="flex flex-col gap-3">
                            {/* Header: Section Number and Title */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs font-semibold border-accent text-accent bg-canvas/70 dark:bg-black/30 dark:border-accent"
                                >
                                  Section {section.sectionNumber}
                                </Badge>
                                {section.crn && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-border text-text-body bg-canvas/70 dark:bg-black/30 dark:border-white/15 dark:text-white/80"
                                  >
                                    CRN: {section.crn}
                                  </Badge>
                                )}
                                {section.isOpen ? (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-green-500 text-green-700 bg-green-50 dark:border-green-400 dark:text-green-200 dark:bg-green-600/40"
                                  >
                                    Open
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-red-500 text-red-700 bg-red-50 dark:border-red-400 dark:text-red-200 dark:bg-red-600/40"
                                  >
                                    Closed
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-text-body dark:text-white/70">
                                {section.creditHours} Credits
                              </div>
                            </div>

                            {/* Course Title */}
                            {section.courseTitle && (
                              <div className="text-sm font-medium text-text-heading dark:text-white">
                                {section.courseTitle}
                              </div>
                            )}

                            {/* Instructors */}
                            {section.instructors &&
                              section.instructors.length > 0 && (
                                <div>
                                  <span className="text-xs font-semibold text-text-heading dark:text-white/90 mb-1 block">
                                    Instructor
                                    {section.instructors.length > 1 ? "s" : ""}:
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {section.instructors.map(
                                      (instructor, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-1"
                                        >
                                          <span className="text-sm text-text-body dark:text-white/80">
                                            {instructor.name}
                                          </span>
                                          {instructor.isPrimary && (
                                            <Badge
                                              variant="outline"
                                              className="text-[10px] border-accent text-accent bg-canvas/70 dark:bg-black/30 dark:border-accent px-1.5 py-0"
                                            >
                                              Primary
                                            </Badge>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Meetings */}
                            {section.meetings &&
                              section.meetings.length > 0 && (
                                <div>
                                  <span className="text-xs font-semibold text-text-heading dark:text-white/90 mb-2 block">
                                    Schedule:
                                  </span>
                                  <div className="space-y-2">
                                    {section.meetings.map((meeting, idx) => (
                                      <div
                                        key={idx}
                                        className="flex flex-wrap items-center gap-3 text-xs text-text-body dark:text-white/70 bg-canvas/50 dark:bg-black/20 p-2 rounded-lg"
                                      >
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] border-border text-text-body bg-canvas/70 dark:bg-black/30 dark:border-white/15 dark:text-white/80"
                                        >
                                          {meeting.meetingType}
                                        </Badge>
                                        {meeting.daysOfWeek &&
                                          meeting.daysOfWeek.length > 0 && (
                                            <span className="font-medium">
                                              {meeting.daysOfWeek.join("")}
                                            </span>
                                          )}
                                        {meeting.beginTime &&
                                          meeting.endTime && (
                                            <span>
                                              {meeting.beginTime} -{" "}
                                              {meeting.endTime}
                                            </span>
                                          )}
                                        {meeting.building && meeting.room && (
                                          <span>
                                            {meeting.building} {meeting.room}
                                          </span>
                                        )}
                                        {meeting.startDate &&
                                          meeting.endDate && (
                                            <span className="text-text-body/60 dark:text-white/50">
                                              {meeting.startDate} -{" "}
                                              {meeting.endDate}
                                            </span>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Attributes */}
                            {section.attributesText && (
                              <div className="flex flex-wrap gap-1">
                                {section.attributesText
                                  .split("|")
                                  .map((attr, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-[10px] border-border text-text-body bg-canvas/70 dark:bg-black/30 dark:border-white/15 dark:text-white/80"
                                    >
                                      {attr.trim()}
                                    </Badge>
                                  ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-3">
                {/* Related Courses */}
                {courseData.relatedCourses &&
                  courseData.relatedCourses.length > 0 && (
                    <Card className="p-4 rounded-2xl shadow-none bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                      <h3 className="text-md font-bold text-text-heading dark:text-white mb-3">
                        Related Courses
                      </h3>
                      <div className="space-y-2">
                        {courseData.relatedCourses
                          .slice(0, 5)
                          .map((course, index: number) => (
                            <Card
                              key={index}
                              className="gap-2 p-3 rounded-2xl shadow-none bg-canvas/70 border border-border hover:bg-canvas transition-all duration-200 cursor-pointer group relative overflow-hidden dark:bg-black/30 dark:border-white/10 dark:hover:bg-black/40"
                            >
                              {/* Small decorative accent */}
                              <div
                                aria-hidden
                                className="absolute -top-8 -right-8 h-16 w-16 rounded-full bg-[#FFCF3F]/10 blur-2xl"
                              />

                              <div className="text-xs font-bold text-text-heading dark:text-white">
                                {course.code}
                              </div>
                              <div className="text-xs text-text-body dark:text-white/75 line-clamp-2 leading-relaxed">
                                {course.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className="text-[11px] border-accent text-accent bg-canvas/70 font-medium px-2 py-0.5 rounded-full dark:bg-black/30"
                                >
                                  {course.similarity}% match
                                </Badge>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </Card>
                  )}

                {/* Quick Actions */}
                <Card className="p-4 rounded-2xl shadow-none bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                  <h3 className="text-md font-bold text-text-heading dark:text-white">
                    Quick Actions
                  </h3>
                  <div className="space-y-2 mb-2">
                    <Button className="w-full bg-button-primary text-button-primary hover:opacity-95 transition-all duration-200 py-2 text-xs rounded-full">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Compare Courses
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                    <Button className="w-full border border-accent text-accent bg-canvas/70 hover:bg-button-hover transition-all duration-200 py-2 text-xs rounded-full dark:bg-black/30 dark:border-accent dark:hover:bg-black/40">
                      <Award className="w-3 h-3 mr-1" />
                      Professor Reviews
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <ComparisonWidget />
        <ProfessorComparisonWidget />
      </div>
    </MotionConfig>
  );
}
