"use client";

import React, { useEffect, useMemo, useRef, useState, use } from "react";
import {
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

interface ProfessorPageProps {
  params: Promise<{
    id: string;
  }>;
}

function CountUpNumber({
  value,
  shouldReduceMotion,
  decimals = 0,
  suffix = "",
  formatter,
}: {
  value: number;
  shouldReduceMotion: boolean;
  decimals?: number;
  suffix?: string;
  formatter?: (n: number) => string;
}) {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(() => {
    const base = formatter ? formatter(value) : value.toFixed(decimals);
    return `${base}${suffix}`;
  });

  const format = useMemo(() => {
    return (n: number) => {
      const base = formatter ? formatter(n) : n.toFixed(decimals);
      return `${base}${suffix}`;
    };
  }, [decimals, formatter, suffix]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(format(value));
      return;
    }

    motionValue.set(0);
    const controls = animate(motionValue, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(format(latest)),
    });

    return () => controls.stop();
  }, [format, motionValue, shouldReduceMotion, value]);

  return <span>{displayValue}</span>;
}

// Use the same solid department colors as Courses page.
function getDepartmentBadgeColor(deptCode: string) {
  const colorMap: Record<string, string> = {
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

    // Default
    default: "bg-slate-600 dark:bg-slate-500 text-white",
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

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        setLoading(true);
        const professorData = await getProfessor(resolvedParams.id);
        setProfessor(professorData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load professor data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfessor();
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
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
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
              <Card className="p-8 rounded-2xl shadow-none bg-red-50 border border-red-200">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                  <h3 className="text-xl font-semibold text-red-700 mb-2">
                    Professor Not Found
                  </h3>
                  <p className="text-red-700/90 mb-6">
                    {error || "Professor profile could not be loaded"}
                  </p>
                  <Link href="/courses">
                    <Button className="rounded-full bg-button-primary text-button-primary hover:opacity-95">
                      Browse Courses
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

            {/* Professor Header */}
            <div className="">
              {/* Main Professor Info Card */}
              <Card className="p-6 rounded-2xl shadow-none bg-card border-border mb-8 relative overflow-hidden dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm">
                <motion.div
                  aria-hidden
                  className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#FFCF3F]/10 blur-2xl"
                  initial={false}
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.8] }
                  }
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-button-primary rounded-full flex items-center justify-center flex-shrink-0">
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
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            {
                              label: "Overall Rating",
                              icon: Star,
                              value: professor.overall_rating ?? null,
                              decimals: 1,
                            },
                            {
                              label: "Total Reviews",
                              icon: MessageSquare,
                              value: professor.total_reviews ?? null,
                              formatter: (n: number) =>
                                Math.round(n).toLocaleString(),
                            },
                            {
                              label: "Would Take Again",
                              icon: TrendingUp,
                              value: professor.would_take_again_percent ?? null,
                              decimals: 0,
                              suffix: "%",
                            },
                          ].map((s) => {
                            const Icon = s.icon;
                            return (
                              <div
                                key={s.label}
                                className="rounded-2xl border border-border bg-canvas/70 px-4 py-3 dark:border-white/10 dark:bg-black/30"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-canvas border border-border flex items-center justify-center text-accent dark:bg-white/10 dark:border-white/10">
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-accent text-lg font-semibold tracking-tight leading-tight">
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
                                        "N/A"
                                      )}
                                    </div>
                                    <div className="text-text-body text-xs dark:text-white/70">
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
                        <Button className="bg-[#FFCF3F] text-[#0f0f0f] hover:bg-[#FFD966] rounded-full px-5">
                          <Eye className="w-4 h-4 mr-2" />
                          View All Reviews
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Overall Summary */}
                  {professor.overall_summary && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xs font-semibold text-text-heading uppercase tracking-wide">
                          Summary
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs border-border bg-canvas text-text-body dark:border-white/15 dark:bg-black/30 dark:text-white/70 font-medium rounded-full"
                        >
                          Generated by AI
                        </Badge>
                      </div>
                      <div className="bg-canvas/70 border border-border rounded-2xl p-4 dark:bg-black/30 dark:border-white/10">
                        <p className="text-sm text-text-body dark:text-white/80 leading-relaxed">
                          {professor.overall_summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Departments */}
                  {professor.departments &&
                    professor.departments.length > 0 && (
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
                                className={`${getDepartmentBadgeColor(dept)} border-transparent px-3 py-1 text-xs font-medium rounded-full`}
                              >
                                {dept}
                              </Badge>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}

                  {/* Tags */}
                  {professor.tag_frequencies &&
                    Object.keys(professor.tag_frequencies).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-semibold text-text-heading uppercase tracking-wide">
                            Student Tags
                          </h3>
                          {Object.keys(professor.tag_frequencies).length >
                            6 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllTags(!showAllTags)}
                              className="text-xs text-accent hover:bg-button-hover h-6 px-2 rounded-full"
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
                                className="text-xs border-border bg-canvas/70 text-text-body font-medium px-3 py-1 rounded-full dark:border-white/15 dark:bg-black/30 dark:text-white/80"
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

            {/* Courses Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-heading">
                  Courses Taught
                </h2>
                <div className="text-sm text-text-body/80 dark:text-white/70 border border-border dark:border-white/15 px-3 py-1 rounded-full bg-canvas/70 dark:bg-black/30">
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
                      className="bg-card border-border hover:border-border transition-all duration-200 group relative overflow-hidden rounded-2xl shadow-none dark:bg-black/45 dark:border-white/10 dark:backdrop-blur-sm dark:hover:border-white/20"
                    >
                      <div
                        aria-hidden
                        className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#FFCF3F]/10 blur-2xl"
                      />
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h3 className="text-lg font-bold text-text-heading mb-1 transition-colors">
                            {course.course_id}
                          </h3>
                          <p className="text-text-body dark:text-white/75 line-clamp-2 leading-relaxed text-sm">
                            {course.course_name}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-accent fill-current" />
                            <span className="font-semibold text-text-heading dark:text-white">
                              {course.avg_rating
                                ? course.avg_rating.toFixed(1)
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-text-body dark:text-white/70">
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
                            className="w-full bg-[#FFCF3F] text-[#0f0f0f] hover:bg-[#FFD966] rounded-full transition-all duration-200 text-sm py-2"
                          >
                            View Course Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : null
                )}
              </div>
            </div>

            {/* Recent Reviews Section */}
            {professor.recent_reviews &&
              professor.recent_reviews.length > 0 && (
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
                            <div className="flex items-center gap-1 bg-yellow-600 dark:bg-yellow-500 px-2 py-1 rounded-lg">
                              <Star className="w-3 h-3 text-white fill-current" />
                              <span className="font-semibold text-white text-sm">
                                {review.overall_rating
                                  ? review.overall_rating.toFixed(1)
                                  : "N/A"}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-blue-600 dark:bg-blue-500 text-white border-transparent text-xs"
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
    </MotionConfig>
  );
}
