"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { Navigation } from "@/components/navigation";
import { PageBanner } from "@/components/page-banner";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Users,
  BookOpen,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  Star,
  Building,
  Calculator,
  Brain,
  Globe,
  DollarSign,
  Palette,
  Activity,
  ChevronLeft,
  Monitor,
  Code,
  Cpu,
  Wrench,
  Cog,
  Factory,
  HardHat,
  Zap,
  CircuitBoard,
  FlaskConical,
  TestTube,
  Atom,
  Rocket,
  Plane,
  Waves,
  Ship,
  Fuel,
  Drill,
  HeartPulse,
  Microscope,
  Dna,
  Leaf,
  TreePine,
  Mountain,
  Telescope,
  Recycle,
  Stethoscope,
  Cross,
  Plus,
  PawPrint,
  Dog,
  Pill,
  Shield,
  Briefcase,
  PiggyBank,
  CreditCard,
  Megaphone,
  Building2,
  MessageCircle,
  Feather,
  Clock,
  Lightbulb,
  Columns,
  Tractor,
  Apple,
  ChefHat,
  Flower,
  Trees,
  Shovel,
  Music,
  Drama,
  Camera,
  Compass,
  Layout,
  User,
  Map,
  Vote,
  Flag,
  Anchor,
  Scale,
  FileText,
  Handshake,
  Heart,
  Smile,
  BarChart3,
  Newspaper,
  Languages,
  School,
  Baby,
  Headphones,
  Database,
  Server,
  Settings,
  Loader2,
} from "lucide-react";
import {
  getDepartments,
  getDepartmentsInfo,
  type Department,
  type DepartmentsInfo,
} from "@/lib/api";

function formatAnimatedNumber(n: number, decimals: number) {
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withCommas = Number(intPart).toLocaleString("en-US");
  return decimals > 0 ? `${withCommas}.${decPart}` : withCommas;
}

/** Shows the real value right away instead of counting up from zero. */
function CountUpNumber({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  return <span className="tabular-nums">{formatAnimatedNumber(value, decimals)}</span>;
}

// const categories = [
//   {
//     id: "all",
//     name: "All Departments",
//     count: 0,
//     color: "",
//     hoverColor: "",
//     icon: GraduationCap,
//   },
//   {
//     id: "stem",
//     name: "STEM",
//     count: 0,
//     color: "",
//     hoverColor: "",
//     icon: Calculator,
//   },
//   {
//     id: "liberal-arts",
//     name: "Liberal Arts",
//     count: 0,
//     color: "",
//     hoverColor: "",
//     icon: Brain,
//   },
//   {
//     id: "business",
//     name: "Business",
//     count: 0,
//     color: "",
//     hoverColor: "",
//     icon: DollarSign,
//   },
//   {
//     id: "agriculture",
//     name: "Agriculture",
//     count: 0,
//     color: "",
//     hoverColor: "",
//     icon: Activity,
//   },
// ];

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "courses", label: "Course count" },
  { value: "professors", label: "Professor count" },
  { value: "gpa", label: "Average GPA" },
  { value: "rating", label: "Rating" },
];

const departmentIcons = {
  // Accounting & Business
  ACCT: {
    icon: Calculator,
    color: "bg-raised text-text-body",
  },
  BUAD: { icon: Briefcase, color: "bg-raised text-text-body" },
  BUSN: {
    icon: Building2,
    color: "bg-raised text-text-body",
  },
  FINC: { icon: PiggyBank, color: "bg-raised text-text-body" },
  FINP: {
    icon: CreditCard,
    color: "bg-raised text-text-body",
  },
  MGMT: { icon: Users, color: "bg-raised text-text-body" },
  MKTG: { icon: Megaphone, color: "bg-raised text-text-body" },
  SCMT: { icon: Cog, color: "bg-raised text-text-body" },
  ECON: {
    icon: DollarSign,
    color: "bg-raised text-text-body",
  },
  IBUS: { icon: Globe, color: "bg-raised text-text-body" },
  ISTM: { icon: Monitor, color: "bg-raised text-text-body" },
  IDIS: { icon: Factory, color: "bg-raised text-text-body" },

  // Engineering
  CSCE: { icon: Monitor, color: "bg-raised text-text-body" },
  ECEN: { icon: Zap, color: "bg-raised text-text-body" },
  MEEN: { icon: Cog, color: "bg-raised text-text-body" },
  CVEN: { icon: HardHat, color: "bg-raised text-text-body" },
  CHEN: {
    icon: FlaskConical,
    color: "bg-raised text-text-body",
  },
  AERO: { icon: Rocket, color: "bg-raised text-text-body" },
  PETE: { icon: Drill, color: "bg-raised text-text-body" },
  NUEN: { icon: Atom, color: "bg-raised text-text-body" },
  BMEN: { icon: HeartPulse, color: "bg-raised text-text-body" },
  ISEN: { icon: Cpu, color: "bg-raised text-text-body" },
  OCEN: { icon: Waves, color: "bg-raised text-text-body" },
  ENGR: { icon: Building, color: "bg-raised text-text-body" },
  BAEN: { icon: Tractor, color: "bg-raised text-text-body" },
  EVEN: {
    icon: Recycle,
    color: "bg-raised text-text-body",
  },
  MSEN: { icon: Atom, color: "bg-raised text-text-body" },
  AREN: { icon: Compass, color: "bg-raised text-text-body" },
  SENG: { icon: Shield, color: "bg-raised text-text-body" },
  SSEN: { icon: Ship, color: "bg-raised text-text-body" },
  CLEN: { icon: Building, color: "bg-raised text-text-body" },
  ENDG: { icon: Compass, color: "bg-raised text-text-body" },
  ENDS: { icon: Layout, color: "bg-raised text-text-body" },
  ENTC: { icon: Wrench, color: "bg-raised text-text-body" },
  ESET: {
    icon: CircuitBoard,
    color: "bg-raised text-text-body",
  },
  MMET: { icon: Factory, color: "bg-raised text-text-body" },
  MXET: {
    icon: Settings,
    color: "bg-raised text-text-body",
  },
  ITDE: { icon: Code, color: "bg-raised text-text-body" },
  MTDE: { icon: Cpu, color: "bg-raised text-text-body" },
  DAEN: { icon: Database, color: "bg-raised text-text-body" },

  // Sciences
  MATH: {
    icon: Calculator,
    color: "bg-raised text-text-body",
  },
  STAT: {
    icon: BarChart3,
    color: "bg-raised text-text-body",
  },
  CHEM: {
    icon: FlaskConical,
    color: "bg-raised text-text-body",
  },
  BIOL: { icon: Dna, color: "bg-raised text-text-body" },
  PHYS: { icon: Atom, color: "bg-raised text-text-body" },
  GEOL: { icon: Mountain, color: "bg-raised text-text-body" },
  GEOG: { icon: Map, color: "bg-raised text-text-body" },
  GEOS: { icon: Globe, color: "bg-raised text-text-body" },
  GEOP: {
    icon: Mountain,
    color: "bg-raised text-text-body",
  },
  ASTR: {
    icon: Telescope,
    color: "bg-raised text-text-body",
  },
  ATMO: { icon: Globe, color: "bg-raised text-text-body" },
  OCNG: { icon: Waves, color: "bg-raised text-text-body" },
  BICH: {
    icon: Microscope,
    color: "bg-raised text-text-body",
  },
  GENE: { icon: Dna, color: "bg-raised text-text-body" },
  BIMS: { icon: Microscope, color: "bg-raised text-text-body" },
  BIOT: { icon: Dna, color: "bg-raised text-text-body" },
  EEBL: { icon: Leaf, color: "bg-raised text-text-body" },
  ECCB: {
    icon: TreePine,
    color: "bg-raised text-text-body",
  },
  BESC: { icon: Leaf, color: "bg-raised text-text-body" },
  ENSS: { icon: Recycle, color: "bg-raised text-text-body" },
  WMHS: { icon: Waves, color: "bg-raised text-text-body" },
  ANLY: { icon: BarChart3, color: "bg-raised text-text-body" },
  MASC: {
    icon: Calculator,
    color: "bg-raised text-text-body",
  },

  // Medical & Health
  NURS: { icon: Cross, color: "bg-raised text-text-body" },
  HLTH: { icon: Stethoscope, color: "bg-raised text-text-body" },
  HBEH: { icon: Heart, color: "bg-raised text-text-body" },
  KINE: {
    icon: Activity,
    color: "bg-raised text-text-body",
  },
  ATTR: {
    icon: HeartPulse,
    color: "bg-raised text-text-body",
  },
  NUTR: { icon: Apple, color: "bg-raised text-text-body" },
  PHAR: { icon: Pill, color: "bg-raised text-text-body" },
  PHSC: {
    icon: TestTube,
    color: "bg-raised text-text-body",
  },
  MPHY: { icon: HeartPulse, color: "bg-raised text-text-body" },
  MSCI: { icon: Stethoscope, color: "bg-raised text-text-body" },
  MCMD: {
    icon: Microscope,
    color: "bg-raised text-text-body",
  },
  PHLT: {
    icon: Shield,
    color: "bg-raised text-text-body",
  },
  PHEB: { icon: BarChart3, color: "bg-raised text-text-body" },
  PHEO: { icon: Recycle, color: "bg-raised text-text-body" },
  PHPM: { icon: Users, color: "bg-raised text-text-body" },
  SOPH: { icon: Shield, color: "bg-raised text-text-body" },
  HCPI: { icon: Plus, color: "bg-raised text-text-body" },
  EDHP: {
    icon: GraduationCap,
    color: "bg-raised text-text-body",
  },
  IBST: {
    icon: Microscope,
    color: "bg-raised text-text-body",
  },
  FIVS: {
    icon: Microscope,
    color: "bg-raised text-text-body",
  },
  FORS: { icon: Shield, color: "bg-raised text-text-body" },
  NRSC: { icon: Brain, color: "bg-raised text-text-body" },
  NEXT: { icon: Brain, color: "bg-raised text-text-body" },
  PBSI: { icon: Brain, color: "bg-raised text-text-body" },

  // Dental
  AEGD: { icon: Smile, color: "bg-raised text-text-body" },
  ENDO: { icon: Smile, color: "bg-raised text-text-body" },
  ORTH: { icon: Smile, color: "bg-raised text-text-body" },
  PEDD: { icon: Smile, color: "bg-raised text-text-body" },
  PERI: { icon: Smile, color: "bg-raised text-text-body" },
  PROS: { icon: Smile, color: "bg-raised text-text-body" },
  OMFP: { icon: Smile, color: "bg-raised text-text-body" },
  OMFR: { icon: Smile, color: "bg-raised text-text-body" },
  OMFS: { icon: Smile, color: "bg-raised text-text-body" },
  OBIO: { icon: Smile, color: "bg-raised text-text-body" },
  DDHS: { icon: Smile, color: "bg-raised text-text-body" },
  DPHS: { icon: Shield, color: "bg-raised text-text-body" },

  // Veterinary
  VIBS: { icon: PawPrint, color: "bg-raised text-text-body" },
  VLCS: { icon: Dog, color: "bg-raised text-text-body" },
  VSCS: { icon: PawPrint, color: "bg-raised text-text-body" },
  VMID: { icon: Cross, color: "bg-raised text-text-body" },
  VPAR: {
    icon: Microscope,
    color: "bg-raised text-text-body",
  },
  VPAT: { icon: TestTube, color: "bg-raised text-text-body" },
  VTMI: { icon: Microscope, color: "bg-raised text-text-body" },
  VTPB: {
    icon: FlaskConical,
    color: "bg-raised text-text-body",
  },
  VTPP: { icon: Pill, color: "bg-raised text-text-body" },

  // Agriculture & Life Sciences
  AGEC: {
    icon: DollarSign,
    color: "bg-raised text-text-body",
  },
  AGLS: {
    icon: TreePine,
    color: "bg-raised text-text-body",
  },
  AGSC: { icon: Leaf, color: "bg-raised text-text-body" },
  AGSM: { icon: Cog, color: "bg-raised text-text-body" },
  ANSC: { icon: PawPrint, color: "bg-raised text-text-body" },
  HORT: { icon: Flower, color: "bg-raised text-text-body" },
  POSC: {
    icon: PawPrint,
    color: "bg-raised text-text-body",
  },
  RWFM: { icon: TreePine, color: "bg-raised text-text-body" },
  SCSC: { icon: Shovel, color: "bg-raised text-text-body" },
  FSTC: { icon: Apple, color: "bg-raised text-text-body" },
  CULN: { icon: ChefHat, color: "bg-raised text-text-body" },
  MEPS: { icon: Leaf, color: "bg-raised text-text-body" },
  PLPA: {
    icon: Microscope,
    color: "bg-raised text-text-body",
  },
  ENTO: {
    icon: Microscope,
    color: "bg-raised text-text-body",
  },
  ALEC: { icon: Users, color: "bg-raised text-text-body" },
  ALED: {
    icon: GraduationCap,
    color: "bg-raised text-text-body",
  },
  AGCJ: { icon: Newspaper, color: "bg-raised text-text-body" },

  // Liberal Arts & Humanities
  ENGL: { icon: Feather, color: "bg-raised text-text-body" },
  HIST: { icon: Clock, color: "bg-raised text-text-body" },
  PHIL: {
    icon: Lightbulb,
    color: "bg-raised text-text-body",
  },
  SPAN: { icon: Languages, color: "bg-raised text-text-body" },
  FREN: {
    icon: MessageCircle,
    color: "bg-raised text-text-body",
  },
  GERM: { icon: Globe, color: "bg-raised text-text-body" },
  CHIN: {
    icon: Languages,
    color: "bg-raised text-text-body",
  },
  JAPN: {
    icon: MessageCircle,
    color: "bg-raised text-text-body",
  },
  ARAB: { icon: Languages, color: "bg-raised text-text-body" },
  ITAL: { icon: Globe, color: "bg-raised text-text-body" },
  RUSS: { icon: Languages, color: "bg-raised text-text-body" },
  MODL: {
    icon: MessageCircle,
    color: "bg-raised text-text-body",
  },
  CLAS: { icon: Columns, color: "bg-raised text-text-body" },
  RELS: { icon: Cross, color: "bg-raised text-text-body" },
  AFST: { icon: Globe, color: "bg-raised text-text-body" },
  ASIA: { icon: Globe, color: "bg-raised text-text-body" },
  HISP: {
    icon: Languages,
    color: "bg-raised text-text-body",
  },
  WGST: { icon: Users, color: "bg-raised text-text-body" },
  DHUM: { icon: Monitor, color: "bg-raised text-text-body" },

  // Social Sciences
  POLS: { icon: Vote, color: "bg-raised text-text-body" },
  SOCI: { icon: Users, color: "bg-raised text-text-body" },
  ANTH: { icon: User, color: "bg-raised text-text-body" },
  CPSY: { icon: Brain, color: "bg-raised text-text-body" },
  EPSY: { icon: Brain, color: "bg-raised text-text-body" },
  SPSY: { icon: Brain, color: "bg-raised text-text-body" },
  GLST: { icon: Globe, color: "bg-raised text-text-body" },
  INTA: { icon: Handshake, color: "bg-raised text-text-body" },

  // Fine Arts
  ARTS: { icon: Palette, color: "bg-raised text-text-body" },
  MUSC: { icon: Music, color: "bg-raised text-text-body" },
  THEA: { icon: Drama, color: "bg-raised text-text-body" },
  DCED: {
    icon: Activity,
    color: "bg-raised text-text-body",
  },
  PVFA: { icon: Camera, color: "bg-raised text-text-body" },
  VIST: { icon: Camera, color: "bg-raised text-text-body" },
  VIZA: { icon: Monitor, color: "bg-raised text-text-body" },
  PERF: { icon: Drama, color: "bg-raised text-text-body" },
  MSTC: {
    icon: Headphones,
    color: "bg-raised text-text-body",
  },
  FILM: { icon: Camera, color: "bg-raised text-text-body" },

  // Architecture & Planning
  ARCH: { icon: Building, color: "bg-raised text-text-body" },
  CARC: { icon: Compass, color: "bg-raised text-text-body" },
  LAND: { icon: Trees, color: "bg-raised text-text-body" },
  PLAN: { icon: Map, color: "bg-raised text-text-body" },
  URPN: { icon: Building2, color: "bg-raised text-text-body" },
  URSC: { icon: Building2, color: "bg-raised text-text-body" },
  COSC: { icon: HardHat, color: "bg-raised text-text-body" },
  LDEV: { icon: Map, color: "bg-raised text-text-body" },

  // Education
  EDCI: {
    icon: GraduationCap,
    color: "bg-raised text-text-body",
  },
  EDAD: { icon: Users, color: "bg-raised text-text-body" },
  TEED: { icon: BookOpen, color: "bg-raised text-text-body" },
  SPED: { icon: Heart, color: "bg-raised text-text-body" },
  RDNG: { icon: BookOpen, color: "bg-raised text-text-body" },
  LDTC: { icon: Monitor, color: "bg-raised text-text-body" },
  EHRD: { icon: Users, color: "bg-raised text-text-body" },
  CEHD: {
    icon: School,
    color: "bg-raised text-text-body",
  },
  BEFB: {
    icon: Languages,
    color: "bg-raised text-text-body",
  },
  BESL: {
    icon: MessageCircle,
    color: "bg-raised text-text-body",
  },
  MEFB: {
    icon: GraduationCap,
    color: "bg-raised text-text-body",
  },
  SEFB: { icon: Heart, color: "bg-raised text-text-body" },
  TEFB: { icon: BookOpen, color: "bg-raised text-text-body" },
  ECDE: { icon: Baby, color: "bg-raised text-text-body" },

  // Communication & Journalism
  COMM: { icon: Megaphone, color: "bg-raised text-text-body" },
  JOUR: { icon: Newspaper, color: "bg-raised text-text-body" },

  // Military & Defense
  MLSC: { icon: Shield, color: "bg-raised text-text-body" },
  AERS: { icon: Plane, color: "bg-raised text-text-body" },
  NVSC: { icon: Anchor, color: "bg-raised text-text-body" },
  SOMS: { icon: Flag, color: "bg-raised text-text-body" },

  // Law & Government
  LAW: { icon: Scale, color: "bg-raised text-text-body" },
  BUSH: { icon: Building2, color: "bg-raised text-text-body" },
  PSAA: { icon: FileText, color: "bg-raised text-text-body" },

  // Recreation & Tourism
  RPTS: { icon: Trees, color: "bg-raised text-text-body" },
  HMGT: { icon: Building2, color: "bg-raised text-text-body" },
  SPMT: { icon: Activity, color: "bg-raised text-text-body" },

  // Technology & Information Systems
  TCMG: { icon: Monitor, color: "bg-raised text-text-body" },
  TCMT: { icon: Cpu, color: "bg-raised text-text-body" },
  ITSV: { icon: Server, color: "bg-raised text-text-body" },

  // Energy
  ENGY: { icon: Fuel, color: "bg-raised text-text-body" },

  // Economics & Finance
  ECMT: { icon: BarChart3, color: "bg-raised text-text-body" },

  // General/Administrative
  ARSC: { icon: GraduationCap, color: "bg-raised text-text-muted" },
  HONR: { icon: Star, color: "bg-raised text-text-body" },
  UGST: { icon: BookOpen, color: "bg-raised text-text-body" },
  FYEX: { icon: Star, color: "bg-raised text-text-body" },
  SYEX: { icon: TrendingUp, color: "bg-raised text-text-body" },
  ASCC: { icon: GraduationCap, color: "bg-raised text-text-body" },
  INST: { icon: BookOpen, color: "bg-raised text-text-body" },
  SABR: { icon: Globe, color: "bg-raised text-text-body" },
  NSEB: { icon: Handshake, color: "bg-raised text-text-body" },
  TAMU: { icon: Building, color: "bg-maroon-100 text-maroon-600" },
};

export default function DepartmentsPage() {
  return (
    <React.Suspense>
      <DepartmentsPageContent />
    </React.Suspense>
  );
}

function DepartmentsPageContent() {
  const query = useSearchParams().get("search") ?? "";
  const shouldReduceMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = React.useState(false);
  const [searchTerm, setSearchTerm] = useState(query);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(query);
  const [selectedCategory] = useState("all"); // Fixed: removed setSelectedCategory since categories are commented out
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  // const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [allDepartmentsLoaded, setAllDepartmentsLoaded] = useState(false);
  const [departmentsInfo, setDepartmentsInfo] =
    useState<DepartmentsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 30;
  const serverSearchMode = debouncedSearchTerm.trim().length > 0;

  useEffect(() => {
    setSearchTerm(query);
    setDebouncedSearchTerm(query);
  }, [query]);

  // Debounce search input for API-backed searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cache keys for localStorage
  const CACHE_KEY = "aggie-rmp-all-departments";
  const CACHE_TIMESTAMP_KEY = "aggie-rmp-departments-timestamp";
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Check if cached data is still valid
  const isCacheValid = () => {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    return Date.now() - parseInt(timestamp) < CACHE_DURATION;
  };

  // Load cached departments if available
  const loadCachedDepartments = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached && isCacheValid()) {
        const parsedDepartments = JSON.parse(cached);
        console.log("Loaded departments from cache:", parsedDepartments.length);
        return parsedDepartments;
      }
    } catch (error) {
      console.error("Failed to load cached departments:", error);
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    }
    return null;
  };

  // Save departments to cache
  const saveCachedDepartments = (departmentsData: Department[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(departmentsData));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      console.log("Saved departments to cache:", departmentsData.length);
    } catch (error) {
      console.error("Failed to save departments to cache:", error);
    }
  };

  // Load departments info once
  useEffect(() => {
    const loadDepartmentsInfo = async () => {
      try {
        const departmentsInfoData = await getDepartmentsInfo();
        setDepartmentsInfo(departmentsInfoData);
      } catch (err) {
        console.error("Failed to load departments info:", err);
        // Don't set error state for departments info failure, just log it
        // The page can still function without the summary statistics
      }
    };
    loadDepartmentsInfo();
  }, []);

  // Progressive loading: first few departments, then all departments
  useEffect(() => {
    if (serverSearchMode) return;

    const loadDepartments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cachedDepartments = loadCachedDepartments();
        if (cachedDepartments && cachedDepartments.length > 10) {
          console.log("Using cached departments");
          setDepartments(cachedDepartments);
          setAllDepartments(cachedDepartments);
          setAllDepartmentsLoaded(true);
          setLoading(false);
          return;
        }

        // Load first batch quickly (limited to show immediate results)
        console.log("Loading first batch of departments...");
        const initialDepartments = await getDepartments({ limit: 30 });
        setDepartments(initialDepartments);
        setLoading(false);

        // Load all departments in background
        // setIsLoadingAll(true);
        console.log("Loading all departments in background...");
        const allDepartmentsData = await getDepartments({ limit: 1000 }); // Departments are typically < 200
        console.log("Loaded all departments:", allDepartmentsData.length);

        // Update with all departments
        setDepartments(allDepartmentsData);
        setAllDepartments(allDepartmentsData);
        setAllDepartmentsLoaded(true);
        // setIsLoadingAll(false);

        // Cache the results
        saveCachedDepartments(allDepartmentsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load departments"
        );
        console.error("Failed to load departments:", err);
        setLoading(false);
        // setIsLoadingAll(false);
      }
    };

    loadDepartments();
  }, [serverSearchMode]);

  // Industry-standard approach: debounced server-side search prevents
  // incomplete client datasets from hiding valid matches.
  useEffect(() => {
    if (!serverSearchMode) return;

    let cancelled = false;

    const searchDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentPage(1);

        const results = await getDepartments({
          search: debouncedSearchTerm,
          limit: 1000,
        });

        if (cancelled) return;

        setDepartments(results);
        setAllDepartments(results);
        setAllDepartmentsLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to search departments",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void searchDepartments();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearchTerm, serverSearchMode]);

  // Client-side filtering for category, search, and sorting
  const filteredDepartments = useMemo(() => {
    const dataToFilter = allDepartmentsLoaded ? allDepartments : departments;

    let filtered = dataToFilter.filter((dept) => {
      const matchesSearch =
        !debouncedSearchTerm ||
        dept.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        dept.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        dept.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || dept.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort departments
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "courses":
          return b.courses - a.courses;
        case "professors":
          return b.professors - a.professors;
        // Departments without data sort last instead of counting as 0.
        case "gpa":
          return (b.avgGpa ?? -1) - (a.avgGpa ?? -1);
        case "rating":
          return (b.rating ?? -1) - (a.rating ?? -1);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [
    departments,
    allDepartments,
    allDepartmentsLoaded,
    debouncedSearchTerm,
    selectedCategory,
    sortBy,
  ]);

  // TODO: Calculate dynamic category counts
  // const categoriesWithCounts = useMemo(() => {
  //   const dataToCount = allDepartmentsLoaded ? allDepartments : departments;

  //   const counts = {
  //     all: dataToCount.length,
  //     stem: dataToCount.filter((dept) => dept.category === "stem").length,
  //     "liberal-arts": dataToCount.filter(
  //       (dept) => dept.category === "liberal-arts",
  //     ).length,
  //     business: dataToCount.filter((dept) => dept.category === "business")
  //       .length,
  //     agriculture: dataToCount.filter((dept) => dept.category === "agriculture")
  //       .length,
  //   };

  //   return categories.map((category) => ({
  //     ...category,
  //     count: counts[category.id as keyof typeof counts] || 0,
  //   }));
  // }, [departments, allDepartments, allDepartmentsLoaded]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDepartments.length / itemsPerPage)
  );
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  // Ensure we only run "initial" enter animations once per mount.
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const IconComponent = ({ code }: { code: string }) => {
    const Icon =
      departmentIcons[code as keyof typeof departmentIcons]?.icon ||
      GraduationCap;
    return <Icon className="w-6 h-6" />;
  };

  const DepartmentBadge = ({ code, name }: { code: string; name: string }) => {
    const badgeColor =
      departmentIcons[code as keyof typeof departmentIcons]?.color ||
      "bg-raised text-text-body";
    return (
      <Badge
        variant="outline"
        title={name}
        className="max-w-full truncate border-transparent bg-transparent px-0 py-0 text-sm font-normal text-on-maroon-muted"
      >
        {name.replace(/^[A-Z]{3,4}\s*-\s*/, "")}
      </Badge>
    );
  };

  // const CategoryIcon = ({
  //   category,
  // }: {
  //   category: {
  //     icon: React.ComponentType<{ className?: string }>;
  //     color: string;
  //   };
  // }) => {
  //   const Icon = category.icon;
  //   return <Icon className="w-4 h-4 mr-2" />;
  // };

  return (
    <MotionConfig
      reducedMotion="user"
      // Keep transitions quick so scroll doesn't feel like slow loading.
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="min-h-screen relative"
        style={{
          background: "var(--app-bg-gradient)",
        }}
      >

        <Navigation variant="glass" />

        {/* Hero Section */}
        <PageBanner
          title="Departments"
          subtitle={<>Course counts, average GPA and professor ratings for every Texas A&amp;M department</>}
        >
          <div className="relative">
            <Search strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-[18px] h-[18px]" />
            {(searchTerm !== debouncedSearchTerm || loading) && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-text-muted" />
            )}
            <Input
              type="text"
              placeholder="Search by code or name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 rounded-xl border border-transparent bg-card shadow-lg pl-12 pr-10 text-base text-text-heading transition-colors placeholder:text-text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
            />
          </div>
        </PageBanner>

        <section className="pt-10 pb-4 relative z-10">
          <div className="max-w-7xl mx-auto px-6">

            {/* Loading State */}
            {loading && (
              <Card className="p-8 mb-12 bg-card border-border">
                <div className="text-center text-text-body">
                  Loading departments
                </div>
              </Card>
            )}

            {/* Error State */}
            {error && (
              <Card className="p-8 mb-12 bg-red-50 border-red-200">
                <div className="text-center">
                  <div className="text-red-700 mb-4">
                    <div className="text-lg font-medium mb-2">
                      Couldn&apos;t load departments
                    </div>
                    <div className="text-sm">{error}</div>
                  </div>
                  <div className="text-sm text-red-600 mb-4">
                    This might be due to:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>API server is currently down</li>
                      <li>Network connection issues</li>
                      <li>Server maintenance in progress</li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Try again
                  </Button>
                </div>
              </Card>
            )}

            {/* Statistics Overview */}
            {!serverSearchMode && !loading && !error && departmentsInfo && (
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12"
                initial={shouldReduceMotion ? false : "hidden"}
                whileInView="visible"
                // Reveal earlier + faster so it feels intentional, not delayed.
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.04 },
                  },
                }}
              >
                {[
                  {
                    label: "Departments",
                    value: departmentsInfo.summary.total_departments,
                    decimals: 0,
                    icon: Building,
                  },
                  {
                    label: "Courses with recent grade data",
                    value: departmentsInfo.summary.total_courses,
                    decimals: 0,
                    icon: BookOpen,
                  },
                  {
                    label: "Recent professor counts",
                    value: departmentsInfo.summary.total_professors,
                    decimals: 0,
                    icon: Users,
                  },
                  {
                    label: "Average rating",
                    value: Number(departmentsInfo.summary.overall_avg_rating),
                    decimals: 1,
                    icon: Star,
                  },
                ].map((s) => {
                  return (
                    <motion.div
                      key={s.label}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className="rounded-xl border border-border bg-card p-5"
                    >
                      <div className="text-sm text-text-body">{s.label}</div>
                      <div className="mt-3 font-mono text-[28px] font-medium leading-none text-accent">
                        <CountUpNumber value={s.value} decimals={s.decimals} />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Top Departments by Courses */}
            {!serverSearchMode &&
              !loading &&
              !error &&
              departmentsInfo &&
              departmentsInfo.top_departments_by_courses && (
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mb-8"
                >
                  <div className="mb-4">
                    <h3 className="text-text-heading text-base font-medium">
                      Largest departments by course count
                    </h3>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-4 sm:overflow-visible">
                    {departmentsInfo.top_departments_by_courses.map(
                      (dept, index) => (
                        <motion.div
                          key={dept.code}
                          initial={
                            shouldReduceMotion ? false : { opacity: 0, y: 14 }
                          }
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ duration: 0.4, delay: index * 0.03 }}
                          className="group flex-shrink-0 w-[160px] sm:w-auto"
                        >
                          <Link href={`/departments?search=${dept.code}`}>
                            <Card className="p-4 gap-2 bg-card border-border shadow-none transition-colors duration-150 cursor-pointer hover:border-border-strong hover:bg-raised/40">
                              <div className="flex items-baseline justify-between gap-2">
                                <h4 className="font-mono text-2xl font-medium text-text-heading">
                                  {dept.code}
                                </h4>
                                <span className="font-mono text-xs text-text-body">
                                  {dept.rating.toFixed(1)}/5
                                </span>
                              </div>
                              <p className="text-xs text-text-body line-clamp-1 dark:text-text-muted">
                                {dept.name.replace(`${dept.code} - `, "")}
                              </p>
                              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                                <div className="text-center">
                                  <div className="mb-0.5">
                                    <span className="font-mono text-sm text-text-heading">
                                      {dept.courses}
                                    </span>
                                  </div>
                                  <div className="text-xs text-text-body dark:text-text-muted">
                                    Courses
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="mb-0.5">
                                    <span className="font-mono text-sm text-text-heading">
                                      {dept.professors}
                                    </span>
                                  </div>
                                  <div className="text-xs text-text-body dark:text-text-muted">
                                    Profs
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="mb-0.5">
                                    <span className="font-mono text-sm text-text-heading">
                                      {dept.avgGpa.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-text-body dark:text-text-muted">
                                    GPA
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        </motion.div>
                      )
                    )}
                  </div>
                </motion.div>
              )}
          </div>
        </section>

        {/* Filters and Sort */}
        <section className="pb-8 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              className="flex flex-col lg:flex-row gap-6 mb-8"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Category Filters */}
              {/* TODO: Add category filters back in */}
              {/* <div className="flex-1">
              <div className="flex flex-wrap gap-3">
                {categoriesWithCounts.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`${
                      selectedCategory === category.id
                        ? `${category.color} ${category.hoverColor} text-white border-transparent`
                        : "border-border hover:bg-button-hover"
                    } transition-colors duration-normal`}
                  >
                    <CategoryIcon category={category} />
                    {category.name}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div> */}

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <label htmlFor="dept-sort" className="text-sm text-text-body">Sort</label>
                <select
                  id="dept-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 bg-card border border-border rounded-lg px-3 text-sm text-text-heading"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Departments Grid */}
        <section className="pb-20 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            {!loading && !error && (
              <motion.div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-3"
                initial={
                  shouldReduceMotion ? false : hasMounted ? false : "hidden"
                }
                animate="visible"
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.02 },
                  },
                }}
              >
                {paginatedDepartments.map((department) => (
                  <motion.div
                    key={department.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card className="group relative h-full gap-0 overflow-hidden border-border bg-card p-5 shadow-none transition-colors duration-150 hover:border-maroon-edge">
                      <div className="bg-maroon-band relative -mx-5 -mt-5 mb-5 flex items-start gap-3 px-5 py-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <h3 className="font-mono text-lg font-medium text-on-maroon">
                              {department.code}
                            </h3>
                            {department.rating != null && department.rating > 0 && (
                            <span
                              className="shrink-0 font-mono text-base text-accent-gold"
                              title="Average RateMyProfessor rating of this department's professors"
                            >
                              {department.rating}
                              <span className="text-xs text-on-maroon-muted">/5</span>
                            </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <DepartmentBadge
                              code={department.code}
                              name={department.name}
                            />
                          </div>
                          {(() => {
                            const desc = (department.description || "").trim();
                            const codePrefix = `${department.code} -`;
                            const isRedundant =
                              !desc ||
                              desc.toLowerCase() ===
                                department.name.toLowerCase() ||
                              desc.toLowerCase() ===
                                `${department.code} - ${department.name}`.toLowerCase() ||
                              desc.startsWith(codePrefix) ||
                              desc.toLowerCase() ===
                                department.name.replace(/^[A-Z]{3,4}\s*-\s*/, "").toLowerCase();

                            if (isRedundant) return null;

                            return (
                              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-on-maroon-muted">
                                {desc}
                              </p>
                            );
                          })()}
                        </div>
                      </div>

                      <dl className="mb-4 grid grid-cols-3 gap-3">
                        <div>
                          <dt className="text-xs text-text-muted">Courses</dt>
                          <dd className="mt-1 font-mono text-base text-text-heading">{department.courses}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-text-muted">Professors</dt>
                          <dd className="mt-1 font-mono text-base text-text-heading">{department.professors}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-text-muted">Avg GPA</dt>
                          <dd className="mt-1 font-mono text-base text-text-heading">
                            {department.avgGpa != null && department.avgGpa > 0
                              ? department.avgGpa.toFixed(2)
                              : "—"}
                          </dd>
                        </div>
                      </dl>

                      {department.topCourses.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1">
                          {department.topCourses.slice(0, 3).map((course, index) => (
                                <span key={`course-${index}`} className="code-tag">
                                  {course}
                                </span>
                          ))}
                      </div>
                      )}

                      <div className="flex items-center gap-4 border-t border-border pt-3">
                        <Link
                          href={`/courses?department=${encodeURIComponent(department.name)}`}
                          className="inline-flex items-center gap-1 text-sm text-text-heading transition-colors duration-150 hover:text-accent"
                        >
                          All courses
                          <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/discover/dept?dept=${encodeURIComponent(department.code)}`}
                          className="inline-flex items-center gap-1 text-sm text-text-body transition-colors duration-150 hover:text-text-heading"
                        >
                          Easiest courses
                          <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!loading && !error && filteredDepartments.length === 0 && (
              <div className="text-center py-16">
                <Search strokeWidth={1.5} className="w-6 h-6 text-text-muted mx-auto mb-3" />
                <h3 className="text-lg font-medium text-text-heading mb-1">
                  No departments found
                </h3>
                <p className="text-text-body">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex items-center justify-center gap-2 mt-8"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
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
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(
                      1,
                      currentPage - Math.floor(maxVisiblePages / 2)
                    );
                    const endPage = Math.min(
                      totalPages,
                      startPage + maxVisiblePages - 1
                    );

                    // Adjust startPage if endPage is at the limit
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    // Always show first page
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
                          <span key="ellipsis1" className="px-2">
                            ...
                          </span>
                        );
                      }
                    }

                    // Show visible pages
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(i)}
                          className={
                            currentPage === i
                              ? "bg-maroon-band text-on-maroon"
                              : "border-border bg-canvas text-text-body hover:bg-button-hover dark:bg-card dark:hover:bg-raised"
                          }
                        >
                          {i}
                        </Button>
                      );
                    }

                    // Always show last page
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className="px-2">
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
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </MotionConfig>
  );
}
