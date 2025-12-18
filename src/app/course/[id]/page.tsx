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

import { getCourseDetail, type CourseDetail } from "@/lib/api";
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

function AnimatedText({
  text,
  shouldReduceMotion,
  className,
  style,
}: {
  text: string;
  shouldReduceMotion: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (shouldReduceMotion) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    );
  }

  // Match the "count up" feel: quick ease-out, subtle blur -> crisp.
  return (
    <motion.span
      className={className}
      style={style}
      initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {text}
    </motion.span>
  );
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
                <div className="flex items-center gap-3 mb-4">
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
                        <AnimatedText
                          text={courseData.difficulty}
                          shouldReduceMotion={!!shouldReduceMotion}
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
                        />
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
                      courseData.prerequisites.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-body uppercase tracking-wider">
                            Prerequisites:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {courseData.prerequisites.map(
                              (prereq: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs border-white/15 text-white/80 bg-black/20 dark:border-white/15 dark:text-white/80 dark:bg-black/30 px-2 py-1 font-medium rounded-full"
                                >
                                  {prereq}
                                </Badge>
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

                {/* Professors Section */}
                <Card className="p-4 rounded-2xl shadow-none bg-card border-border dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="text-xl font-bold text-text-heading dark:text-white">
                      Course Professors
                    </h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      {courseData.professors &&
                        courseData.professors.length >= 2 && (
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
                          value={courseData.professors?.length || 0}
                        />{" "}
                        professors
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {courseData.professors?.map((prof, index: number) => (
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
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-md font-bold text-text-heading dark:text-white mb-1">
                                {prof.name}
                              </h4>
                              {/* Only show rating and reviews if professor has review data */}
                              {prof.id &&
                              prof.rating !== undefined &&
                              prof.reviews !== undefined ? (
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex items-center bg-[#FFCF3F] text-[#0f0f0f] px-2 py-0.5 rounded-full">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="ml-1 text-xs font-semibold">
                                      {prof.rating.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="flex items-center bg-black/20 text-text-body dark:bg-black/30 dark:text-white/80 px-2 py-0.5 rounded-full border border-border dark:border-white/15">
                                    <Users className="h-2 w-2" />
                                    <span className="ml-1 text-xs font-semibold">
                                      {prof.reviews} reviews
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-border bg-canvas text-text-body dark:border-white/15 dark:bg-black/30 dark:text-white/70 font-medium rounded-full"
                                  >
                                    Grade data only
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Professor AI Summary - only show if available and not generic */}
                          {prof.description &&
                            prof.description !== "Course instruction" &&
                            prof.description.trim().length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="text-xs font-semibold text-heading uppercase tracking-wide">
                                    Summary
                                  </h5>
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-border bg-canvas text-text-body dark:border-white/15 dark:bg-black/30 dark:text-white/70 font-medium rounded-full"
                                  >
                                    Generated by AI
                                  </Badge>
                                </div>
                                <div className="bg-canvas/70 border border-border rounded-2xl p-3 dark:bg-black/30 dark:border-white/10">
                                  <p className="text-text-body dark:text-white/80 leading-relaxed text-sm">
                                    {prof.description}
                                  </p>
                                </div>
                              </div>
                            )}

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
                                      Reviews ({prof.reviews || 0})
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
