"use client";

import React, { useEffect, useMemo, useState, use } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getProfessor,
  getTerms,
  getCourseSectionsForTerm,
  type ProfessorDetail,
  type Term,
} from "@/lib/api";
import {
  Star,
  TrendingUp,
  ArrowLeft,
  MessageSquare,
  Loader2,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquareText,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { professorNamesMatch } from "@/lib/name-matching";
import {
  RatingTrend,
  ReviewStatsRow,
  SummaryTips,
  SummaryTldr,
  confidenceLabel,
} from "@/components/summary-insights";
import { BackButton } from "@/components/back-button";
import { TermSelect } from "@/components/term-select";
import { useOfficialSubjects } from "@/hooks/use-official-subjects";

function formatCourseCode(code: string) {
  return code.replace(/^([A-Z]+)\s*(\d+)/, "$1 $2");
}

function formatReviewDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface ProfessorPageProps {
  params: Promise<{
    id: string;
  }>;
}

const SUMMARY_TOPICS = new Set([
  "teaching",
  "exams",
  "grading",
  "workload",
  "personality",
  "policies",
  "other",
]);

function parseSummaryTheme(value: string) {
  const match = value.match(/^([^:]{2,24}):\s*(.+)$/);
  if (!match || !SUMMARY_TOPICS.has(match[1].trim().toLowerCase())) {
    return { topic: null, text: value.trim() };
  }

  return {
    topic: match[1].trim(),
    text: match[2].trim(),
  };
}

function SummaryThemeColumn({
  items,
  tone,
}: {
  items: string[];
  tone: "positive" | "negative";
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = React.useId();
  if (items.length === 0) return null;

  const isPositive = tone === "positive";
  const title = isPositive ? "Strengths" : "Common concerns";
  const visibleItems = expanded ? items : items.slice(0, 3);

  return (
    <section
      className={`self-start overflow-hidden rounded-xl border ${
        isPositive
          ? "border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-500/15 dark:bg-emerald-500/[0.04]"
          : "border-red-200/70 bg-red-50/40 dark:border-red-500/15 dark:bg-red-500/[0.04]"
      }`}
    >
      <div
        className={`flex items-center gap-2 border-b px-3 py-2.5 ${
          isPositive
            ? "border-emerald-200/70 dark:border-emerald-500/15"
            : "border-red-200/70 dark:border-red-500/15"
        }`}
      >
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            isPositive
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
              : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
          }`}
        >
          {isPositive ? (
            <ThumbsUp className="h-4 w-4" />
          ) : (
            <ThumbsDown className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-text-heading">
            {title}
          </h3>
        </div>
        <span className="rounded-full border border-border/70 bg-card/70 px-2 py-0.5 text-xs tabular-nums text-text-muted dark:border-border dark:bg-card">
          {items.length}
        </span>
      </div>

      <ul
        id={listId}
        className="divide-y divide-border/60 dark:divide-white/[0.07]"
      >
        {visibleItems.map((item, index) => {
          const { topic, text } = parseSummaryTheme(item);
          return (
            <li key={`${item}-${index}`} className="px-3 py-2.5">
              <p className="break-words text-sm leading-[1.55] text-text-body">
                {topic && (
                  <span
                    className={`mr-2 inline-block rounded px-1.5 py-0.5 align-baseline text-[10px] font-semibold ${
                      isPositive
                        ? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-red-100/80 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                    }`}
                  >
                    {topic}
                  </span>
                )}
                {text}
              </p>
            </li>
          );
        })}
      </ul>
      {items.length > 3 && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-label={`${expanded ? "Show fewer" : "Show all"} ${title.toLowerCase()}`}
          onClick={() => setExpanded((value) => !value)}
          className="flex min-h-10 w-full items-center justify-center gap-1.5 border-t border-border/60 px-3 py-2 text-xs font-medium text-text-body hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current dark:border-white/[0.07] dark:hover:bg-raised"
        >
          {expanded ? "Show less" : `Show ${items.length - 3} more`}
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </section>
  );
}

function CountUpNumber({
  value,
  decimals = 0,
  suffix = "",
  formatter,
}: {
  value: number;
  /** Unused now that values render immediately; kept so call sites stay unchanged. */
  shouldReduceMotion?: boolean;
  decimals?: number;
  suffix?: string;
  formatter?: (n: number) => string;
}) {
  const base = formatter ? formatter(value) : value.toFixed(decimals);
  return <span className="tabular-nums">{`${base}${suffix}`}</span>;
}

// Use the same solid department colors as Courses page.
function getDepartmentBadgeColor(deptCode: string) {
  const colorMap: Record<string, string> = {
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

    // Default
    default: "bg-raised text-text-body",
  };

  return colorMap[deptCode] || colorMap.default;
}

export default function ProfessorPage({ params }: ProfessorPageProps) {
  const resolvedParams = use(params);
  const shouldReduceMotion = useReducedMotion();
  const [professor, setProfessor] = useState<ProfessorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [termCourseIds, setTermCourseIds] = useState<Set<string>>(new Set());
  const [loadingTermData, setLoadingTermData] = useState(false);
  const { codes: officialCodes } = useOfficialSubjects();

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

  // Load term-specific courses when term is selected
  useEffect(() => {
    const loadTermCourses = async () => {
      if (!selectedTerm || !professor) {
        setTermCourseIds(new Set());
        return;
      }

      try {
        setLoadingTermData(true);
        // Get all courses the professor teaches
        // const professorCourseIds = new Set(
        //   professor.courses
        //     ?.filter((c) => c.course_id)
        //     .map((c) => c.course_id.replace(/\s+/g, "").toUpperCase()) || []
        // );

        // For each course, check if professor is teaching it in the selected term
        const termCourseSet = new Set<string>();

        // Fetch sections for each course and check if professor is teaching
        const sectionPromises =
          professor.courses
            ?.filter((c) => c.course_id)
            .map(async (course) => {
              try {
                const courseId = course.course_id.replace(/\s+/g, "");
                const sections = await getCourseSectionsForTerm(
                  selectedTerm,
                  courseId,
                );

                // Check if any section has this professor as an instructor
                const hasProfessor = sections.some((section) =>
                  section.instructors?.some((instructor) =>
                    professorNamesMatch(instructor.name, professor.name),
                  ),
                );

                if (hasProfessor) {
                  return courseId.toUpperCase();
                }
                return null;
              } catch (err) {
                console.error(
                  `Failed to load sections for ${course.course_id}:`,
                  err,
                );
                return null;
              }
            }) || [];

        const results = await Promise.all(sectionPromises);
        results.forEach((courseId) => {
          if (courseId) {
            termCourseSet.add(courseId);
          }
        });

        setTermCourseIds(termCourseSet);
      } catch (err) {
        console.error("Failed to load term courses:", err);
        setTermCourseIds(new Set());
      } finally {
        setLoadingTermData(false);
      }
    };

    loadTermCourses();
  }, [selectedTerm, professor, resolvedParams.id]);

  // Filter courses based on selected term
  const displayedCourses = React.useMemo(() => {
    if (!professor?.courses) return [];

    // No term picked (or still loading it): every course they've taught.
    if (!selectedTerm || loadingTermData) {
      return professor.courses.filter((course) => course.course_id);
    }

    // Filter courses to only those taught in the selected term
    return professor.courses.filter((course) => {
      if (!course.course_id) return false;
      const normalizedCourseId = course.course_id
        .replace(/\s+/g, "")
        .toUpperCase();
      return termCourseIds.has(normalizedCourseId);
    });
  }, [professor?.courses, selectedTerm, termCourseIds, loadingTermData]);

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
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-text-muted" />
                  Loading professor profile...
                </div>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </MotionConfig>
    );
  }

  if (error || !professor) {
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
              <Card className="p-8 rounded-2xl shadow-none bg-red-50 border border-red-200">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                  <h3 className="text-xl font-medium text-red-700 mb-2">
                    Professor Not Found
                  </h3>
                  <p className="text-red-700/90 mb-6">
                    {error || "Professor profile could not be loaded"}
                  </p>
                  <Link href="/professors">
                    <Button className="rounded-full bg-button-primary text-button-primary hover:opacity-95">
                      Browse professors
                    </Button>
                  </Link>
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
        style={{ background: "var(--app-bg-gradient)" }}
      >
        <Navigation variant="glass" />

        <main className="pt-24 pb-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <BackButton fallbackHref="/professors" fallbackLabel="All professors" />

            {/* Professor Header */}
            <div className="">
              {/* Main Professor Info Card */}
              <Card className="p-6 rounded-2xl shadow-none bg-card border-border mb-8 relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="hidden sm:flex w-14 h-14 bg-raised border border-border rounded-full items-center justify-center flex-shrink-0">
                        <span className="font-mono text-text-heading text-lg font-medium">
                          {(
                            professor.name
                              ?.split(" ")
                              .map((n) => n?.[0] || "")
                              .join("") || "PR"
                          ).slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h1 className="text-[32px] leading-tight font-medium text-text-heading break-words">
                          {professor.name}
                        </h1>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          {[
                            {
                              label: "Overall rating",
                              icon: Star,
                              value: professor.overall_rating ?? null,
                              decimals: 1,
                            },
                            {
                              label: "Reviews",
                              icon: MessageSquare,
                              value: professor.total_reviews ?? null,
                              formatter: (n: number) =>
                                Math.round(n).toLocaleString(),
                            },
                            {
                              label: "Would take again",
                              icon: TrendingUp,
                              value: professor.would_take_again_percent ?? null,
                              decimals: 0,
                              suffix: "%",
                            },
                          ].map((s) => {
                            return (
                              <div
                                key={s.label}
                                className="rounded-xl border border-border bg-canvas px-4 py-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="min-w-0">
                                    <div className="font-mono text-xl font-medium leading-tight text-text-heading">
                                      {typeof s.value === "number" ? (
                                        <CountUpNumber
                                          value={s.value}
                                          shouldReduceMotion={
                                            !!shouldReduceMotion
                                          }
                                          decimals={s.decimals}
                                          suffix={s.suffix}
                                          formatter={s.formatter}
                                        />
                                      ) : (
                                        <span title="Not enough reviews yet">—</span>
                                      )}
                                    </div>
                                    <div className="mt-1 text-text-body text-xs">
                                      {s.label}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="lg:ml-auto">
                      <Link href={`/professor/${professor.id}/reviews`}>
                        <Button>
                          <Eye strokeWidth={1.5} className="w-4 h-4" />
                          Read all reviews
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <RatingTrend
                    stats={professor.overallSummary?.reviewStats}
                    className="mt-4"
                  />

                  {/* Overall Summary */}
                  {professor.overall_summary && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xs font-medium text-text-heading">
                          Summary
                        </h3>
                        <span className="font-mono text-xs text-text-muted">
                          Written by AI from student reviews
                        </span>
                      </div>
                      <div className="bg-canvas border border-border rounded-xl p-4">
                        <p className="text-sm text-text-body leading-relaxed">
                          {professor.overall_summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Departments */}
                  {professor.departments &&
                    professor.departments.some((dept) => dept && officialCodes.has(dept)) && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h3 className="text-xs font-medium text-text-heading mb-2">
                          Departments
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {professor.departments.map((dept, index) =>
                            dept && officialCodes.has(dept) ? (
                              <Badge
                                key={index}
                                variant="outline"
                                className={`${getDepartmentBadgeColor(dept)} border-transparent px-3 py-1 text-xs font-medium rounded-full`}
                              >
                                {dept}
                              </Badge>
                            ) : null,
                          )}
                        </div>
                      </div>
                    )}

                  {/* Tags */}
                  {professor.tag_frequencies &&
                    Object.keys(professor.tag_frequencies).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-medium text-text-heading">
                            Student Tags
                          </h3>
                          {Object.keys(professor.tag_frequencies).length >
                            6 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllTags(!showAllTags)}
                              className="text-xs text-text-body hover:bg-raised hover:text-text-heading h-6 px-2"
                            >
                              {showAllTags ? (
                                <>
                                  <ChevronUp className="w-3 h-3 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3 mr-1" />
                                  Show All (
                                  {
                                    Object.keys(professor.tag_frequencies)
                                      .length
                                  }
                                  )
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(professor.tag_frequencies)
                            .sort(([, a], [, b]) => b - a) // Sort by frequency, highest first
                            .slice(0, showAllTags ? undefined : 6) // Show only first 6 unless expanded
                            .map(([tag, frequency]) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs border-border bg-canvas/70 text-text-body font-medium px-3 py-1 rounded-full dark:bg-card"
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
                </CardContent>
              </Card>
            </div>

            {/* Overall Summary Section */}
            {professor.overallSummary && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-medium text-text-heading">
                    What students say
                  </h2>
                  <span className="font-mono text-xs text-text-muted">
                    Summarized by AI
                  </span>
                </div>

                <Card className="rounded-2xl shadow-none bg-card border-border overflow-hidden">
                  <CardContent className="p-6">
                    {(professor.overallSummary.tldr ||
                      professor.overallSummary.reviewStats) && (
                      <div className="mb-6 space-y-3">
                        <SummaryTldr
                          tldr={professor.overallSummary.tldr}
                          prominent
                        />
                        <ReviewStatsRow
                          stats={professor.overallSummary.reviewStats}
                        />
                      </div>
                    )}

                    <p className="mb-6 text-sm text-text-body">
                      {professor.overallSummary.sentiment && (
                        <span className="font-medium text-text-heading">
                          {professor.overallSummary.sentiment}
                        </span>
                      )}
                      {professor.overallSummary.sentiment && " · "}
                      Based on {professor.total_reviews} reviews
                      {confidenceLabel(professor.overallSummary.confidence) &&
                        ` · ${confidenceLabel(professor.overallSummary.confidence)}`}
                    </p>

                    {/* Strengths & Concerns Grid */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
                      <SummaryThemeColumn
                        items={professor.overallSummary.strengths || []}
                        tone="positive"
                      />
                      <SummaryThemeColumn
                        items={professor.overallSummary.complaints || []}
                        tone="negative"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Courses Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-medium text-text-heading">
                  Courses taught
                </h2>
                <div className="text-sm text-text-body border border-border px-3 py-1 rounded-full bg-canvas/70 dark:bg-card">
                  {displayedCourses.length}{" "}
                  {displayedCourses.length === 1 ? "course" : "courses"}
                  {selectedTerm && !loadingTermData && " this term"}
                </div>
              </div>

              {/* Term Selector */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <TermSelect
                  id="term-selector-professor"
                  label="Show courses taught in:"
                  terms={terms}
                  value={selectedTerm}
                  onChange={setSelectedTerm}
                  allTermsLabel="Any term (full history)"
                />
                {loadingTermData && (
                  <div className="text-xs text-text-body">
                    Checking this term&apos;s sections…
                  </div>
                )}
              </div>

              {selectedTerm && !loadingTermData && displayedCourses.length === 0 && (
                <p className="mb-6 rounded-xl border border-border bg-canvas/70 px-4 py-3 text-sm text-text-body dark:bg-card">
                  {professor.name}{" "}isn&apos;t listed on any sections of these courses
                  in the selected term.
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayedCourses.map((course) =>
                  course.course_id ? (
                    <Card
                      key={course.course_id}
                      className="bg-card border-border hover:border-border transition-colors duration-150 group relative h-full overflow-hidden rounded-2xl shadow-none dark:hover:border-border-strong"
                    >
                      <CardContent className="flex h-full flex-col p-4">
                        <div className="mb-3">
                          <h3 className="text-lg font-medium text-text-heading mb-1 transition-colors">
                            {formatCourseCode(course.course_id)}
                          </h3>
                          {course.course_name && (
                            <p className="text-text-body line-clamp-2 leading-relaxed text-sm">
                              {course.course_name}
                            </p>
                          )}
                        </div>

                        <dl className="mb-4 grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-border bg-canvas/70 px-3 py-2 dark:bg-card">
                            <dd className="flex items-center gap-1 font-medium text-text-heading">
                              <Star className="w-4 h-4 text-text-muted" />
                              {course.avg_rating
                                ? course.avg_rating.toFixed(1)
                                : "—"}
                            </dd>
                            <dt className="text-xs text-text-body">
                              rating in this course · {course.reviews_count}{" "}
                              {course.reviews_count === 1 ? "review" : "reviews"}
                            </dt>
                          </div>
                          <div className="rounded-xl border border-border bg-canvas/70 px-3 py-2 dark:bg-card">
                            <dd className="font-medium text-text-heading">
                              {course.avg_gpa != null
                                ? course.avg_gpa.toFixed(2)
                                : "—"}
                            </dd>
                            <dt className="text-xs text-text-body">
                              {course.avg_gpa != null
                                ? `avg GPA · ${(course.gpa_students ?? 0).toLocaleString()} students`
                                : "no official grade data"}
                            </dt>
                          </div>
                        </dl>

                        <SummaryTips tips={course.tips} className="mb-4" />

                        {/* Pinned to the bottom so buttons line up across the row */}
                        <Button asChild variant="outline" className="mt-auto w-full">
                          <Link
                            href={`/course/${course.course_id?.replace(/\s+/g, "") || ""}`}
                          >
                            View course
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : null,
                )}
              </div>
            </div>

            {/* Recent Reviews Section */}
            {professor.recent_reviews &&
              professor.recent_reviews.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-medium text-text-heading">
                      Recent reviews
                    </h2>
                    <Link href={`/professor/${professor.id}/reviews`}>
                      <Button variant="outline" size="sm">
                        All reviews
                      </Button>
                    </Link>
                  </div>

                  <div className="columns-1 lg:columns-2 gap-4 space-y-4">
                    {professor.recent_reviews?.slice(0, 4).map((review) => (
                      <Card
                        key={review.id}
                        className="bg-card border-border transition-shadow duration-150 break-inside-avoid"
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {review.overall_rating != null && (
                              <div
                                className="flex items-center gap-1 border border-border bg-raised px-2 h-6 rounded-md"
                                title="This student's quality rating (1-5)"
                              >
                                <span className="font-mono text-text-heading text-xs">
                                  {review.overall_rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                            {review.course_code && (
                              <Badge
                                variant="outline"
                                className="text-xs border-border text-text-heading dark:border-border-strong"
                              >
                                {formatCourseCode(review.course_code)}
                              </Badge>
                            )}
                            {review.grade && (
                              <Badge
                                variant="outline"
                                className="bg-blue-700 dark:bg-blue-500 text-white border-transparent text-xs"
                              >
                                Grade: {review.grade}
                              </Badge>
                            )}
                            {formatReviewDate(review.review_date) && (
                              <span className="ml-auto text-xs text-text-body">
                                {formatReviewDate(review.review_date)}
                              </span>
                            )}
                          </div>

                          <blockquote className="text-text-body leading-relaxed border-l-4 border-border dark:border-gray-600 pl-3 text-sm">
                            &quot;{review.review_text}&quot;
                          </blockquote>

                          {review.tags && review.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
                              {review.tags.slice(0, 3).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs bg-raised text-text-body dark:border-border"
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
    </MotionConfig>
  );
}
