"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { BackButton } from "@/components/back-button";
import { TermSelect } from "@/components/term-select";
import { WatchSectionButton } from "@/components/watch-section-button";
import {
  confidenceLabel,
  isLegacySummary,
  looksLikeQuotedReview,
} from "@/components/summary-insights";
import { pickDefaultTerm, shortTermName } from "@/lib/terms";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  getCourseDetail,
  getTerms,
  getCourseProfessorsForTerm,
  getCourseProfessorsWithDetailsForTerm,
  getCourseSectionsForTerm,
  type CourseDetail,
  type Term,
  type CourseSection,
  type ReviewStats,
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
  MessageSquareText,
} from "lucide-react";
import Link from "next/link";
import { useComparison } from "@/contexts/ComparisonContext";
import { useProfessorComparison } from "@/contexts/ProfessorComparisonContext";
import { ComparisonWidget } from "@/components/comparison-widget";
import { ProfessorComparisonWidget } from "@/components/professor-comparison-widget";
import { professorNamesMatch } from "@/lib/name-matching";
import { track } from "@/lib/analytics";
import { useTrackInView } from "@/lib/analytics-hooks";
import {
  ReviewStatsRow,
  SummaryTips,
  SummaryTldr,
} from "@/components/summary-insights";

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

/** Shows the real value right away; a GPA should never read 0.70 on its way to 3.27. */
function CountUpNumber({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  return <span className="tabular-nums">{formatAnimatedNumber(value, decimals)}</span>;
}

/** "10:20 AM", "11:10 AM" -> "10:20–11:10 AM"; keeps both meridiems when they differ. */
function formatMeetingTime(begin: string, end: string) {
  const b = begin.trim().match(/^(.*?)\s*([AP]M)$/i);
  const e = end.trim().match(/^(.*?)\s*([AP]M)$/i);
  if (b && e && b[2].toUpperCase() === e[2].toUpperCase()) {
    return `${b[1]}–${e[1]} ${e[2].toUpperCase()}`;
  }
  return `${begin}–${end}`;
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

  const deptCode = courseCode.split(/\s+/)[0];
  return colorMap[deptCode] || "bg-raised text-text-body";
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
  // Professors teaching this term who have no history for this course yet.
  const [newTermProfessors, setNewTermProfessors] = useState<
    NonNullable<CourseDetail["professors"]>
  >([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loadingTermData, setLoadingTermData] = useState(false);
  const [profSummaryMode, setProfSummaryMode] = useState<Record<string, string>>(
    {}
  );
  // Professor cards start collapsed so the list is scannable on a phone.
  const [expandedProfs, setExpandedProfs] = useState<Set<string>>(new Set());
  const toggleProf = (key: string) =>
    setExpandedProfs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

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
        // Default to the term students are registering for.
        setSelectedTerm((current) => current || pickDefaultTerm(termsData));
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
        setNewTermProfessors([]);
        setSections([]);
        return;
      }

      try {
        setLoadingTermData(true);
        const [professorsData, sectionsData, termProfessorDetails] =
          await Promise.all([
            getCourseProfessorsForTerm(selectedTerm, resolvedParams.id),
            getCourseSectionsForTerm(selectedTerm, resolvedParams.id),
            getCourseProfessorsWithDetailsForTerm(
              selectedTerm,
              resolvedParams.id,
            ).catch(() => [] as NonNullable<CourseDetail["professors"]>),
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
        setNewTermProfessors(termProfessorDetails || []);
        setSections(sectionsData);
      } catch (err) {
        console.error("Failed to load term data:", err);
        setTermProfessorIds(new Set());
        setNewTermProfessors([]);
        setSections([]);
      } finally {
        setLoadingTermData(false);
      }
    };

    loadTermData();
  }, [selectedTerm, courseData, resolvedParams.id]);

  // Filter professors based on selected term, then append professors teaching
  // this term who have no history for this course yet.
  const displayedProfessors = React.useMemo(() => {
    if (!courseData?.professors) return undefined;

    // If no term selected, show all professors
    if (!selectedTerm || termProfessorIds.size === 0) {
      return courseData.professors;
    }

    // Filter professors to only those teaching in the selected term
    const withHistory = courseData.professors.filter((prof) => {
      // Match by ID if available
      if (prof.id && termProfessorIds.has(prof.id)) {
        return true;
      }
      // Match by name (normalized)
      if (prof.name && termProfessorIds.has(prof.name.toLowerCase().trim())) {
        return true;
      }
      if (
        prof.name &&
        Array.from(termProfessorIds).some((termIdentity) =>
          professorNamesMatch(prof.name, termIdentity),
        )
      ) {
        return true;
      }
      return false;
    });

    const firstTime = newTermProfessors.filter(
      (np) =>
        !withHistory.some(
          (p) =>
            (np.id && p.id === np.id) ||
            (np.name && p.name && professorNamesMatch(p.name, np.name)),
        ),
    );

    return [...withHistory, ...firstTime];
  }, [courseData?.professors, selectedTerm, termProfessorIds, newTermProfessors]);

  const historyProfessorKeys = React.useMemo(
    () =>
      new Set(
        (courseData?.professors || []).map((p) => (p.id || p.name) as string),
      ),
    [courseData?.professors],
  );

  const ready = !loading && !error && !!courseData;
  const sectionsRef = useRef<HTMLDivElement>(null);
  const professorsRef = useRef<HTMLDivElement>(null);
  useTrackInView(
    sectionsRef,
    "course-section-view",
    { section: "sections" },
    ready && !!selectedTerm && !loadingTermData,
  );
  useTrackInView(professorsRef, "course-section-view", { section: "professors" }, ready);

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
          <Navigation variant="glass" />
          <main className="pt-24 pb-20 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <Card className="p-8 rounded-2xl shadow-none bg-card border-border">
                <div className="text-center text-text-body">
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
          <Navigation variant="glass" />
          <main className="pt-24 pb-20 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <Card className="p-8 rounded-2xl shadow-none bg-red-50 border border-red-200 mb-6">
                <div className="text-center text-red-700 font-medium">
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
        <Navigation variant="glass" />

        <main className="pt-24 pb-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <BackButton fallbackHref="/courses" fallbackLabel="All courses" />

            {/* Course Header */}
            <div className="">
              <Card className="p-4 sm:p-6 gap-4 rounded-2xl shadow-none bg-card border-border relative overflow-clip">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className="border-border bg-transparent px-2 py-0.5 text-xs font-normal text-text-body"
                  >
                    {getDepartmentFromCode(courseData.code)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border bg-transparent px-2 py-0.5 font-mono text-xs font-normal text-text-body"
                  >
                    {courseData.credits} credits
                  </Badge>
                  {courseData.lectureHours !== undefined &&
                    courseData.lectureHours > 0 && (
                      <Badge
                        variant="outline"
                        className="border-border text-text-body bg-canvas/70 px-3 py-1 text-xs font-medium rounded-full dark:bg-card"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {courseData.lectureHours}h Lecture
                      </Badge>
                    )}
                  {courseData.labHours !== undefined &&
                    courseData.labHours > 0 && (
                      <Badge
                        variant="outline"
                        className="border-border text-text-body bg-canvas/70 px-3 py-1 text-xs font-medium rounded-full dark:bg-card"
                      >
                        <FlaskConical className="w-3 h-3 mr-1" />
                        {courseData.labHours}h Lab
                      </Badge>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 relative">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-medium text-text-heading break-words">
                      {courseData.code}: {courseData.name}
                    </h1>

                    <p className="text-text-body mb-4 max-w-4xl leading-relaxed">
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
                        ? "border border-border-strong bg-raised text-text-heading hover:bg-raised/70"
                        : "border border-border-strong bg-card text-text-heading hover:bg-raised"
                    } transition-colors duration-150`}
                  >
                    {isSelected(courseData.code) ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">
                          Added to compare
                        </span>
                        <span className="sm:hidden">Added</span>
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Add to compare</span>
                        <span className="sm:hidden">Compare</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    {
                      label:
                        courseData.avgGPA === -1
                          ? "Avg GPA"
                          : courseData.gpaScope === "all"
                            ? `Avg GPA (through ${courseData.gpaLastYear ?? "last offered"})`
                            : "Avg GPA (last 4 semesters)",
                      icon: BarChart3,
                      display:
                        courseData.avgGPA !== -1 ? (
                          <CountUpNumber
                            value={courseData.avgGPA}
                            decimals={2}
                          />
                        ) : (
                          <span className="text-base sm:text-lg">No grade data</span>
                        ),
                    },
                    {
                      label: "Difficulty (from GPA)",
                      icon: Zap,
                      display:
                        courseData.difficulty && courseData.difficulty !== "Unknown" ? (
                          <span className="block whitespace-nowrap text-base min-[360px]:text-lg sm:text-xl lg:text-lg xl:text-xl font-medium leading-tight">
                            {courseData.difficulty}
                          </span>
                        ) : (
                          <span className="text-base sm:text-lg">Not enough data</span>
                        ),
                    },
                    {
                      label: courseData.enrollmentYear
                        ? `Students in ${courseData.enrollmentYear}`
                        : "Students last year",
                      icon: Users,
                      display:
                        (courseData.enrollment ?? 0) > 0 ? (
                          <CountUpNumber value={courseData.enrollment ?? 0} />
                        ) : (
                          <span className="text-base sm:text-lg">None recorded</span>
                        ),
                    },
                    {
                      label: selectedTerm
                        ? `Sections in ${shortTermName(terms.find((t) => t.termCode === selectedTerm)) || "this term"}`
                        : "Sections",
                      icon: BookOpen,
                      display: loadingTermData ? (
                        <span className="text-base sm:text-lg">…</span>
                      ) : selectedTerm ? (
                        sections.length > 0 ? (
                          <CountUpNumber value={sections.length} />
                        ) : (
                          <span className="text-base sm:text-lg">Not offered</span>
                        )
                      ) : (courseData.sections ?? 0) > 0 ? (
                        <CountUpNumber value={courseData.sections ?? 0} />
                      ) : (
                        <span className="text-base sm:text-lg">Not offered</span>
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
                        className="rounded-2xl border border-border bg-card px-3 py-3 sm:px-4 sm:py-4 flex items-center"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="hidden sm:flex h-5 w-5 shrink-0 mt-1 items-start justify-center text-text-muted">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-text-heading text-xl sm:text-2xl font-medium leading-tight break-normal">
                              {m.display}
                            </div>
                            <div className="text-text-body text-xs sm:text-sm">
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
                <Card className="p-6 rounded-2xl shadow-none bg-card border-border">
                  <h3 className="text-xl font-medium text-text-heading">
                    Course information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-medium text-body">
                        Description:
                      </span>
                      <p className="text-text-body mt-1 leading-relaxed">
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
                          <span className="text-xs font-medium text-body">
                            Prerequisites:
                          </span>
                          {courseData.prerequisites.text && (
                            <p className="text-sm text-text-body mt-1 mb-2">
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
                                            className="flex flex-wrap items-center gap-1"
                                          >
                                            {groupIndex > 0 && (
                                              <span className="text-xs text-text-muted mx-1 font-medium">
                                                AND
                                              </span>
                                            )}
                                            <div className="flex flex-wrap items-center gap-1">
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
                                                        onClick={() => track("course-link", { kind: "prereq" })}
                                                      >
                                                        <Badge
                                                          variant="outline"
                                                          className={`text-xs px-2 py-1 font-medium rounded-full transition-colors cursor-pointer ${
                                                            isAlsoCoreq
                                                              ? "border-green-500 text-green-800 bg-green-200 dark:border-green-400 dark:text-green-200 dark:bg-green-600/40"
                                                              : "border-border text-text-body bg-canvas/70 hover:bg-raised hover:text-text-heading dark:bg-card"
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
                                                <span className="text-xs text-text-muted">
                                                  ,
                                                </span>
                                              )}
                                              <Link
                                                href={`/course/${prereq.replace(/\s+/g, "")}`}
                                                onClick={() => track("course-link", { kind: "prereq" })}
                                              >
                                                <Badge
                                                  variant="outline"
                                                  className={`text-xs px-2 py-1 font-medium rounded-full transition-colors cursor-pointer ${
                                                    isAlsoCoreq
                                                      ? "border-green-500 text-green-800 bg-green-200 dark:border-green-400 dark:text-green-200 dark:bg-green-600/40"
                                                      : "border-border text-text-body bg-canvas/70 hover:bg-raised hover:text-text-heading dark:bg-card"
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
                                  <span className="text-xs font-medium text-body">
                                    Corequisites:
                                  </span>
                                  <p className="text-sm text-text-body mt-1">
                                    {courseData.corequisites.text}
                                  </p>
                                  <p className="text-xs text-text-muted mt-1">
                                    (Same as prerequisites marked in green above
                                    - can be taken before or concurrently)
                                  </p>
                                </>
                              );
                            }

                            return (
                              <>
                                <span className="text-xs font-medium text-body">
                                  Corequisites:
                                </span>
                                <p className="text-sm text-text-body mt-1 mb-2">
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
                                          onClick={() => track("course-link", { kind: "coreq" })}
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
                          <span className="text-xs font-medium text-body">
                            Cross-Listed With:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {courseData.crossListings.map(
                              (crossList: string, index: number) => (
                                <Link
                                  key={index}
                                  href={`/course/${crossList.replace(/\s+/g, "")}`}
                                  onClick={() => track("course-link", { kind: "cross-list" })}
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

                    {(courseData.sectionAttributes?.length ?? 0) > 0 && (
                    <div>
                      <span className="text-xs font-medium text-body">
                        Counts toward:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-2 max-h-24 overflow-y-auto md:max-h-none md:overflow-visible">
                        {courseData.sectionAttributes?.map(
                          (attr: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs border-border text-text-body bg-canvas/70 dark:bg-card px-2 py-1 font-medium flex-shrink-0 rounded-full"
                            >
                              {attr}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    )}
                  </div>
                </Card>

                {/* Term Selector */}
                <TermSelect
                  id="term-selector"
                  label="Term:"
                  terms={terms}
                  value={selectedTerm}
                  onChange={setSelectedTerm}
                  allTermsLabel="Any term (all professors on record)"
                  className="mb-2"
                />

                {/* Sections for the chosen term, with seat alerts */}
                {selectedTerm && !loadingTermData && (
                  <Card ref={sectionsRef} className="p-4 rounded-2xl shadow-none bg-card border-border">
                    <h3 className="text-xl font-medium text-text-heading">
                      Sections in {shortTermName(terms.find((t) => t.termCode === selectedTerm)) || selectedTerm}
                    </h3>
                    {sections.length === 0 ? (
                      <p className="text-sm text-text-body">
                        {courseData.code}{" "}isn&apos;t offered in this term. Pick another
                        term above, or see past professors below.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-text-body">
                          {sections.filter((s) => s.isOpen).length} of {sections.length}{" "}
                          open. Full sections can be watched for a seat.
                        </p>
                        <div className="mt-3 overflow-hidden rounded-xl border border-border">
                          <div
                            aria-hidden
                            className="hidden md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,10rem)_4rem_8rem] gap-x-4 border-b border-border bg-raised px-4 py-2 text-xs font-medium text-text-muted md:grid"
                          >
                            <span>Section</span>
                            <span>Meets</span>
                            <span>Professor</span>
                            <span>CRN</span>
                            <span className="text-right">Seats</span>
                          </div>
                          <ul className="divide-y divide-border">
                            {sections.map((section) => {
                              const meetings = (section.meetings || []).filter(
                                (m) => m.beginTime && m.endTime,
                              );
                              return (
                                <li
                                  key={section.id}
                                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-4 py-3 text-sm md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,10rem)_4rem_8rem] md:items-center"
                                >
                                  <span className="font-mono font-medium text-text-heading">
                                    {section.sectionNumber}
                                  </span>
                                  <span className="col-start-1 row-start-2 md:col-start-auto md:row-start-auto">
                                    {meetings.length > 0 ? (
                                      <span className="flex flex-col gap-0.5">
                                        {meetings.map((m, i) => (
                                          <span
                                            key={i}
                                            className="flex items-baseline gap-2 tabular-nums text-text-body"
                                          >
                                            <span className="w-10 shrink-0 font-mono text-xs text-text-heading">
                                              {(m.daysOfWeek || []).join("")}
                                            </span>
                                            <span className="whitespace-nowrap">
                                              {formatMeetingTime(m.beginTime, m.endTime)}
                                            </span>
                                            {/* Lecture is the default; only call out the other kinds */}
                                            {m.meetingType && !/^lec/i.test(m.meetingType) && (
                                              <span className="text-xs text-text-muted">
                                                {/^lab/i.test(m.meetingType) ? "Lab" : m.meetingType}
                                              </span>
                                            )}
                                          </span>
                                        ))}
                                      </span>
                                    ) : (
                                      <span className="text-text-muted">Time TBA / online</span>
                                    )}
                                  </span>
                                  <span className="col-start-1 truncate text-text-body md:col-start-auto">
                                    {section.instructors?.[0]?.name || (
                                      <span className="text-text-muted">TBA</span>
                                    )}
                                  </span>
                                  <span className="col-start-1 font-mono text-xs tabular-nums text-text-muted md:col-start-auto">
                                    <span className="md:hidden">CRN </span>
                                    {section.crn}
                                  </span>
                                  <span className="col-start-2 row-start-1 flex items-center justify-end gap-2 md:col-start-auto md:row-start-auto">
                                    {section.isOpen ? (
                                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-positive">
                                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-positive" />
                                        Open
                                      </span>
                                    ) : (
                                      <>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-negative">
                                          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-negative" />
                                          Full
                                        </span>
                                        <WatchSectionButton
                                          termCode={selectedTerm}
                                          crn={section.crn}
                                          dept={section.dept}
                                          courseNumber={section.courseNumber}
                                          section={section.sectionNumber}
                                        />
                                      </>
                                    )}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </>
                    )}
                  </Card>
                )}

                {/* Professors Section */}
                <Card ref={professorsRef} className="p-4 rounded-2xl shadow-none bg-card border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="text-xl font-medium text-text-heading">
                      Professors
                    </h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      {loadingTermData && (
                        <div className="text-xs text-text-body">
                          Checking this term&apos;s sections…
                        </div>
                      )}
                      {(displayedProfessors || []).length >= 2 && (
                        <Link
                          href="/compare?tab=professors"
                          className="w-full sm:w-auto"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2 w-full sm:w-auto"
                          >
                            <BarChart3 strokeWidth={1.5} className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              Compare professors
                            </span>
                            <span className="sm:hidden">Compare</span>
                          </Button>
                        </Link>
                      )}
                      <div className="font-mono text-xs text-text-muted">
                        {displayedProfessors?.length || 0}{" "}
                        {(displayedProfessors?.length || 0) === 1 ? "professor" : "professors"}
                        {selectedTerm && !loadingTermData && termProfessorIds.size > 0 && " teaching this term"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {displayedProfessors?.map((prof, index: number) => (
                      <Card
                        key={index}
                        className="p-4 sm:p-5 gap-0 rounded-2xl shadow-none bg-card border-border transition-colors duration-150 group relative overflow-clip hover:border-border-strong"
                      >

                        <div className="">
                          <div className="flex gap-4">
                            {/* Left side: Name and AI Summary header */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-md font-medium text-text-heading mb-1">
                                {prof.name}
                              </h4>
                              {!historyProfessorKeys.has(
                                (prof.id || prof.name) as string,
                              ) && (
                                <p className="text-xs text-text-muted mb-1">
                                  First time teaching this course
                                </p>
                              )}
                              {/* Show Grade data only badge if no review data */}
                              {!(prof.id && prof.rating !== undefined) && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-border bg-canvas text-text-body dark:bg-card font-medium rounded-full"
                                >
                                  Grade data only
                                </Badge>
                              )}
                              {/* AI Summary header - course vs overall dropdown when available */}
                              {(() => {
                                const courseSummary = prof.courseSummary as any | null | undefined;
                                const hasCourseSummary =
                                  courseSummary &&
                                  (courseSummary.teaching ||
                                    courseSummary.exams ||
                                    courseSummary.grading ||
                                    courseSummary.workload ||
                                    courseSummary.personality ||
                                    courseSummary.policies ||
                                    courseSummary.other ||
                                    (courseSummary.tips?.length || 0) > 0);

                                const overall = (prof as any).overallSummary as
                                  | {
                                      sentiment?: string | null;
                                      tldr?: string | null;
                                      strengths?: string[] | null;
                                      complaints?: string[] | null;
                                      consistency?: string | null;
                                      reviewCount?: number | null;
                                      confidence?: number | null;
                                    }
                                  | null
                                  | undefined;
                                const hasOverall =
                                  !!overall &&
                                  (!!overall.sentiment ||
                                    !!overall.tldr ||
                                    (overall.strengths?.length || 0) > 0 ||
                                    (overall.complaints?.length || 0) > 0 ||
                                    !!overall.consistency);

                                const otherCourseSummaries = ((prof as any)
                                  .otherCourseSummaries || []) as any[];
                                const hasOther =
                                  Array.isArray(otherCourseSummaries) &&
                                  otherCourseSummaries.length > 0;

                                if (!hasCourseSummary && !hasOverall && !hasOther) return null;

                                const key = (prof.id || prof.name) as string;
                                const options: Array<{
                                  value: string;
                                  label: string;
                                  reviewCount: number;
                                  confidence?: number | null;
                                }> = [];

                                if (hasCourseSummary) {
                                  options.push({
                                    value: "course",
                                    label: "This course",
                                    reviewCount:
                                      courseSummary.reviewCount ??
                                      (prof.totalReviews ?? prof.reviews ?? 0),
                                    confidence:
                                      courseSummary.confidence ??
                                      prof.confidence ??
                                      null,
                                  });
                                }
                                if (hasOverall) {
                                  options.push({
                                    value: "overall",
                                    label: "Overall (all courses)",
                                    reviewCount:
                                      overall?.reviewCount ??
                                      (prof.totalReviews ?? prof.reviews ?? 0),
                                    confidence: overall?.confidence ?? null,
                                  });
                                }
                                if (hasOther) {
                                  for (const cs of otherCourseSummaries.slice(0, 3)) {
                                    options.push({
                                      value: `other:${cs.courseCode || "other"}`,
                                      label: cs.courseCode || "Other course",
                                      reviewCount: cs.reviewCount ?? 0,
                                      confidence: cs.confidence ?? null,
                                    });
                                  }
                                }

                                const selected =
                                  profSummaryMode[key] ??
                                  (options.find((o) => o.value === "course")?.value ??
                                    options[0]?.value ??
                                    "course");
                                const active =
                                  options.find((o) => o.value === selected) ??
                                  options[0];

                                return (
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <h5 className="text-xs font-medium text-heading">
                                      Summary
                                    </h5>
                                    <span className="text-xs text-text-body">
                                      from{" "}
                                      {active?.reviewCount ??
                                        (prof.totalReviews ?? prof.reviews ?? 0)}{" "}
                                      reviews
                                      {confidenceLabel(active?.confidence) &&
                                        ` · ${confidenceLabel(active?.confidence)}`}
                                    </span>
                                    {options.length > 1 && (
                                      <select
                                        className="ml-auto text-xs border border-border bg-canvas/70 rounded-full px-2 py-1 dark:bg-card dark:text-text-body"
                                        value={selected}
                                        onChange={(e) =>
                                          setProfSummaryMode((prev) => ({
                                            ...prev,
                                            [key]: e.target.value,
                                          }))
                                        }
                                      >
                                        {options.map((o) => (
                                          <option key={o.value} value={o.value}>
                                            {o.label}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Right side: rating for this course when we have one */}
                            {prof.id && (prof.courseRating ?? prof.rating) != null && (
                              <div
                                className="flex items-center justify-center border border-border bg-raised text-text-heading px-3 py-2 rounded-xl min-w-[72px] self-start"
                                title={
                                  prof.courseRating != null
                                    ? "Average rating in reviews of this course"
                                    : "Average rating across all their courses"
                                }
                              >
                                <div className="flex flex-col items-center">
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono text-xl font-medium">
                                      {(prof.courseRating ?? prof.rating ?? 0).toFixed(1)}
                                    </span>
                                  </div>
                                  <span className="text-xs text-text-muted">
                                    {prof.courseRating != null ? "this course" : "overall"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Professor AI Summary content - supports course/overall dropdown when available */}
                          {(() => {
                            const courseSummary = prof.courseSummary as any | null | undefined;
                            const hasCourseSummary =
                              courseSummary &&
                              (courseSummary.teaching ||
                                courseSummary.exams ||
                                courseSummary.grading ||
                                courseSummary.workload ||
                                courseSummary.personality ||
                                courseSummary.policies ||
                                courseSummary.other ||
                                (courseSummary.tips?.length || 0) > 0);

                            const overall = (prof as any).overallSummary as
                              | {
                                  sentiment?: string | null;
                                  tldr?: string | null;
                                  strengths?: string[] | null;
                                  complaints?: string[] | null;
                                  consistency?: string | null;
                                  reviewStats?: ReviewStats | null;
                                }
                              | null
                              | undefined;
                            const hasOverall =
                              !!overall &&
                              (!!overall.sentiment ||
                                !!overall.tldr ||
                                (overall.strengths?.length || 0) > 0 ||
                                (overall.complaints?.length || 0) > 0 ||
                                !!overall.consistency);

                            const otherCourseSummaries = ((prof as any)
                              .otherCourseSummaries || []) as any[];
                            const key = (prof.id || prof.name) as string;
                            const selected =
                              profSummaryMode[key] ??
                              (hasCourseSummary ? "course" : hasOverall ? "overall" : "");

                            const activeCourseSummary =
                              selected.startsWith("other:")
                                ? otherCourseSummaries.find(
                                    (x) =>
                                      `other:${x.courseCode || "other"}` === selected,
                                  )
                                : selected === "course"
                                  ? courseSummary
                                  : null;

                            const legacyDesc =
                              prof.description &&
                              prof.description !== "Course instruction" &&
                              prof.description.trim().length > 0
                                ? prof.description
                                : null;

                            if (!hasCourseSummary && !hasOverall && !legacyDesc && !activeCourseSummary) {
                              return null;
                            }

                            const expanded = expandedProfs.has(key);
                            const legacy =
                              selected !== "overall" &&
                              !!activeCourseSummary &&
                              isLegacySummary(activeCourseSummary);
                            const sectionText = (text?: string | null) =>
                              legacy && looksLikeQuotedReview(text) ? (
                                <>
                                  <span className=" font-medium text-text-heading">
                                    One student wrote:{" "}
                                  </span>
                                  <span className="">&ldquo;{text}&rdquo;</span>
                                </>
                              ) : (
                                text
                              );
                            return (
                              <div className="mb-3 mt-3">
                                {legacy && (
                                  <p className="mb-2 text-xs text-text-body">
                                    Older summary, not yet updated. It may quote
                                    individual reviews.
                                  </p>
                                )}
                                <div
                                  className={`relative bg-canvas/70 border border-border rounded-2xl p-3 dark:bg-card dark:border-border space-y-3 ${
                                    expanded ? "" : "max-h-56 overflow-hidden"
                                  }`}
                                >
                                  {selected === "overall" && hasOverall ? (
                                    <div className="space-y-2">
                                      <SummaryTldr tldr={overall?.tldr} />
                                      <ReviewStatsRow stats={overall?.reviewStats} />
                                      {overall?.sentiment && (
                                        <p className="text-text-body leading-relaxed text-sm">
                                          <span className="font-medium text-text-heading">
                                            Sentiment:{" "}
                                          </span>
                                          {overall.sentiment}
                                        </p>
                                      )}
                                      {(overall?.strengths?.length || 0) > 0 && (
                                        <p className="text-text-body leading-relaxed text-sm">
                                          <span className="font-medium text-text-heading">
                                            Strengths:{" "}
                                          </span>
                                          {overall?.strengths?.slice(0, 3).join(" · ")}
                                        </p>
                                      )}
                                      {(overall?.complaints?.length || 0) > 0 && (
                                        <p className="text-text-body leading-relaxed text-sm">
                                          <span className="font-medium text-text-heading">
                                            Complaints:{" "}
                                          </span>
                                          {overall?.complaints?.slice(0, 3).join(" · ")}
                                        </p>
                                      )}
                                      {overall?.consistency && (
                                        <p className="text-text-body leading-relaxed text-sm">
                                          <span className="font-medium text-text-heading">
                                            Note:{" "}
                                          </span>
                                          {overall.consistency}
                                        </p>
                                      )}
                                    </div>
                                  ) : activeCourseSummary ? (
                                    <>
                                      <ReviewStatsRow
                                        stats={activeCourseSummary.reviewStats}
                                      />
                                      {activeCourseSummary.teaching && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <GraduationCap strokeWidth={1.5} className="w-3.5 h-3.5 text-text-muted" />
                                            <span className="text-xs font-medium text-text-heading">
                                              Teaching Style
                                            </span>
                                          </div>
                                          <p className="text-text-body leading-relaxed text-sm pl-5">
                                            {sectionText(activeCourseSummary.teaching)}
                                          </p>
                                        </div>
                                      )}
                                      {activeCourseSummary.exams && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <ClipboardList strokeWidth={1.5} className="w-3.5 h-3.5 text-text-muted" />
                                            <span className="text-xs font-medium text-text-heading">
                                              Exams & Quizzes
                                            </span>
                                          </div>
                                          <p className="text-text-body leading-relaxed text-sm pl-5">
                                            {sectionText(activeCourseSummary.exams)}
                                          </p>
                                        </div>
                                      )}
                                      {activeCourseSummary.grading && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <FileText strokeWidth={1.5} className="w-3.5 h-3.5 text-text-muted" />
                                            <span className="text-xs font-medium text-text-heading">
                                              Grading
                                            </span>
                                          </div>
                                          <p className="text-text-body leading-relaxed text-sm pl-5">
                                            {sectionText(activeCourseSummary.grading)}
                                          </p>
                                        </div>
                                      )}
                                      {activeCourseSummary.workload && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <Briefcase strokeWidth={1.5} className="w-3.5 h-3.5 text-text-muted" />
                                            <span className="text-xs font-medium text-text-heading">
                                              Workload
                                            </span>
                                          </div>
                                          <p className="text-text-body leading-relaxed text-sm pl-5">
                                            {sectionText(activeCourseSummary.workload)}
                                          </p>
                                        </div>
                                      )}
                                      {activeCourseSummary.personality && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <UserCircle strokeWidth={1.5} className="w-3.5 h-3.5 text-text-muted" />
                                            <span className="text-xs font-medium text-text-heading">
                                              Personality
                                            </span>
                                          </div>
                                          <p className="text-text-body leading-relaxed text-sm pl-5">
                                            {sectionText(activeCourseSummary.personality)}
                                          </p>
                                        </div>
                                      )}
                                      {activeCourseSummary.policies && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <ScrollText strokeWidth={1.5} className="w-3.5 h-3.5 text-text-muted" />
                                            <span className="text-xs font-medium text-text-heading">
                                              Policies
                                            </span>
                                          </div>
                                          <p className="text-text-body leading-relaxed text-sm pl-5">
                                            {sectionText(activeCourseSummary.policies)}
                                          </p>
                                        </div>
                                      )}
                                      <SummaryTips tips={activeCourseSummary.tips} />
                                      {/* `other` repeats the tips for older clients; show it only without them. */}
                                      {activeCourseSummary.other &&
                                        !(activeCourseSummary.tips?.length > 0) && (
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <MessageSquareText strokeWidth={1.5} className="w-3.5 h-3.5 text-text-muted" />
                                            <span className="text-xs font-medium text-text-heading">
                                              Notes
                                            </span>
                                          </div>
                                          <p className="text-text-body leading-relaxed text-sm pl-5">
                                            {sectionText(activeCourseSummary.other)}
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-text-body leading-relaxed text-sm">
                                      {legacyDesc}
                                    </p>
                                  )}
                                  {!expanded && (
                                    <div
                                      aria-hidden
                                      className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent dark:from-black"
                                    />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!expanded) track("course-prof-expand");
                                    toggleProf(key);
                                  }}
                                  aria-expanded={expanded}
                                  className="mt-2 text-xs font-medium text-text-heading underline underline-offset-2"
                                >
                                  {expanded ? "Show less" : "Read full summary"}
                                </button>
                              </div>
                            );
                          })()}

                          {/* Professor Tags - only show if available and not empty */}
                          {expandedProfs.has((prof.id || prof.name) as string) &&
                            prof.tag_frequencies &&
                            Object.keys(prof.tag_frequencies).length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-xs font-medium text-heading mb-2">
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
                                        className="text-xs border-border bg-canvas/70 text-text-body font-medium px-2 py-1 rounded-full dark:bg-card"
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
                            <h5 className="text-sm font-medium text-heading mb-2">
                              Official grades (their latest semester)
                            </h5>
                            <div className="flex gap-0.5 h-6 mb-2 rounded-md overflow-hidden">
                              <div
                                className="bg-accent text-primary-foreground flex items-center justify-center font-mono text-xs"
                                style={{
                                  width: `${prof.gradeDistribution.A}%`,
                                }}
                              >
                                {prof.gradeDistribution.A > 12 ? "A" : ""}
                              </div>
                              <div
                                className="bg-text-heading/45 text-canvas flex items-center justify-center font-mono text-xs"
                                style={{
                                  width: `${prof.gradeDistribution.B}%`,
                                }}
                              >
                                {prof.gradeDistribution.B > 12 ? "B" : ""}
                              </div>
                              <div
                                className="bg-text-heading/25 text-text-heading flex items-center justify-center font-mono text-xs"
                                style={{
                                  width: `${prof.gradeDistribution.C}%`,
                                }}
                              >
                                {prof.gradeDistribution.C > 12 ? "C" : ""}
                              </div>
                              <div
                                className="bg-caution/80 text-canvas flex items-center justify-center font-mono text-xs"
                                style={{
                                  width: `${prof.gradeDistribution.D}%`,
                                }}
                              >
                                {prof.gradeDistribution.D > 12 ? "D" : ""}
                              </div>
                              <div
                                className="bg-negative/85 text-canvas flex items-center justify-center font-mono text-xs"
                                style={{
                                  width: `${prof.gradeDistribution.F}%`,
                                }}
                              >
                                {prof.gradeDistribution.F > 12 ? "F" : ""}
                              </div>
                            </div>
                            <div className="grid grid-cols-5 gap-1 text-xs">
                              <div className="text-center">
                                <div className="font-mono text-text-heading text-sm">
                                  {prof.gradeDistribution.A}%
                                </div>
                                <div className="text-body font-medium text-xs">
                                  A
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-mono text-text-heading text-sm">
                                  {prof.gradeDistribution.B}%
                                </div>
                                <div className="text-body font-medium text-xs">
                                  B
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-mono text-text-heading text-sm">
                                  {prof.gradeDistribution.C}%
                                </div>
                                <div className="text-body font-medium text-xs">
                                  C
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-mono text-text-heading text-sm">
                                  {prof.gradeDistribution.D}%
                                </div>
                                <div className="text-body font-medium text-xs">
                                  D
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-mono text-text-heading text-sm">
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
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                  >
                                    <User strokeWidth={1.5} className="w-4 h-4" />
                                    <span className="sm:hidden">Prof</span>
                                    <span className="hidden sm:inline">
                                      Professor
                                    </span>
                                  </Button>
                                </Link>
                                <Link
                                  href={`/professor/${prof.id}/reviews`}
                                  onClick={() => track("professor-reviews-open", { from: "course" })}
                                  className="flex-1"
                                >
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Eye strokeWidth={1.5} className="w-4 h-4" />
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
                                size="sm"
                                className={`w-full sm:w-auto sm:min-w-[100px] ${
                                  isProfessorSelected(prof.id!)
                                    ? "border border-border-strong bg-raised text-text-heading hover:bg-raised/70"
                                    : ""
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
                              <div className="text-xs text-text-body bg-canvas/70 border border-border px-3 py-2 rounded-lg dark:bg-card">
                                No reviews found for this professor yet. Only
                                official grade data.
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>

              </div>

              {/* Sidebar */}
              <div className="space-y-3">
                {/* Related Courses */}
                {courseData.relatedCourses &&
                  courseData.relatedCourses.length > 0 && (
                    <Card className="p-4 rounded-2xl shadow-none bg-card border-border">
                      <h3 className="text-md font-medium text-text-heading mb-3">
                        Nearby {courseData.code.split(" ")[0]} courses
                      </h3>
                      <div className="space-y-2">
                        {courseData.relatedCourses
                          .slice(0, 5)
                          .map((course, index: number) => (
                            <Link
                              key={index}
                              href={`/course/${course.code.replace(/\s+/g, "")}`}
                              onClick={() => track("course-link", { kind: "related" })}
                              className="block"
                            >
                            <Card
                              className="gap-2 p-3 rounded-2xl shadow-none bg-canvas/70 border border-border hover:bg-canvas transition-colors duration-150 group relative overflow-clip dark:bg-card dark:hover:bg-raised"
                            >

                              <div>
                                <span className="code-tag">{course.code}</span>
                              </div>
                              <div className="text-xs text-text-body line-clamp-2 leading-relaxed">
                                {course.name}
                              </div>
                            </Card>
                            </Link>
                          ))}
                      </div>
                    </Card>
                  )}

                {/* Quick Actions */}
                <Card className="p-4 rounded-2xl shadow-none bg-card border-border">
                  <h3 className="text-sm font-medium text-text-heading">
                    Next steps
                  </h3>
                  <div className="-mx-2 space-y-1">
                    <Link
                      href="/compare"
                      className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-text-body transition-colors duration-150 hover:bg-raised hover:text-text-heading"
                    >
                      <BarChart3 strokeWidth={1.5} className="w-4 h-4 text-text-muted" />
                      Compare courses
                      <ChevronRight strokeWidth={1.5} className="ml-auto w-4 h-4 text-text-muted" />
                    </Link>
                    <Link
                      href="/discover/fit"
                      className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-text-body transition-colors duration-150 hover:bg-raised hover:text-text-heading"
                    >
                      <Award strokeWidth={1.5} className="w-4 h-4 text-text-muted" />
                      Find sections that fit my schedule
                      <ChevronRight strokeWidth={1.5} className="ml-auto w-4 h-4 text-text-muted" />
                    </Link>
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
