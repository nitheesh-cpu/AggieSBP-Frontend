"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
} from 'lucide-react';
import { getDepartments, getDepartmentsInfo, type Department, type DepartmentsInfo } from '@/lib/api';

const categories = [
  {
    id: 'all',
    name: 'All Departments',
    count: 0,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    hoverColor: 'hover:from-purple-600 hover:to-pink-600',
    icon: GraduationCap
  },
  {
    id: 'stem',
    name: 'STEM',
    count: 0,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    hoverColor: 'hover:from-blue-600 hover:to-cyan-600',
    icon: Calculator
  },
  {
    id: 'liberal-arts',
    name: 'Liberal Arts',
    count: 0,
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    hoverColor: 'hover:from-green-600 hover:to-emerald-600',
    icon: Brain
  },
  {
    id: 'business',
    name: 'Business',
    count: 0,
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    hoverColor: 'hover:from-orange-600 hover:to-red-600',
    icon: DollarSign
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    count: 0,
    color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    hoverColor: 'hover:from-yellow-600 hover:to-orange-600',
    icon: Activity
  }
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'courses', label: 'Course Count' },
  { value: 'professors', label: 'Professor Count' },
  { value: 'gpa', label: 'Average GPA' },
  { value: 'rating', label: 'Rating' }
];

const departmentIcons = {
  // Accounting & Business
  'ACCT': { icon: Calculator, color: 'bg-yellow-100 text-yellow-600' },
  'BUAD': { icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
  'BUSN': { icon: Building2, color: 'bg-indigo-100 text-indigo-600' },
  'FINC': { icon: PiggyBank, color: 'bg-green-100 text-green-600' },
  'FINP': { icon: CreditCard, color: 'bg-emerald-100 text-emerald-600' },
  'MGMT': { icon: Users, color: 'bg-purple-100 text-purple-600' },
  'MKTG': { icon: Megaphone, color: 'bg-pink-100 text-pink-600' },
  'SCMT': { icon: Cog, color: 'bg-orange-100 text-orange-600' },
  'ECON': { icon: DollarSign, color: 'bg-yellow-100 text-yellow-600' },
  'IBUS': { icon: Globe, color: 'bg-blue-100 text-blue-600' },
  'ISTM': { icon: Monitor, color: 'bg-cyan-100 text-cyan-600' },
  'IDIS': { icon: Factory, color: 'bg-gray-100 text-gray-600' },

  // Engineering
  'CSCE': { icon: Monitor, color: 'bg-blue-100 text-blue-600' },
  'ECEN': { icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  'MEEN': { icon: Cog, color: 'bg-gray-100 text-gray-600' },
  'CVEN': { icon: HardHat, color: 'bg-orange-100 text-orange-600' },
  'CHEN': { icon: FlaskConical, color: 'bg-green-100 text-green-600' },
  'AERO': { icon: Rocket, color: 'bg-sky-100 text-sky-600' },
  'PETE': { icon: Drill, color: 'bg-amber-100 text-amber-600' },
  'NUEN': { icon: Atom, color: 'bg-red-100 text-red-600' },
  'BMEN': { icon: HeartPulse, color: 'bg-rose-100 text-rose-600' },
  'ISEN': { icon: Cpu, color: 'bg-purple-100 text-purple-600' },
  'OCEN': { icon: Waves, color: 'bg-cyan-100 text-cyan-600' },
  'ENGR': { icon: Building, color: 'bg-slate-100 text-slate-600' },
  'BAEN': { icon: Tractor, color: 'bg-green-100 text-green-600' },
  'EVEN': { icon: Recycle, color: 'bg-emerald-100 text-emerald-600' },
  'MSEN': { icon: Atom, color: 'bg-indigo-100 text-indigo-600' },
  'AREN': { icon: Compass, color: 'bg-blue-100 text-blue-600' },
  'SENG': { icon: Shield, color: 'bg-red-100 text-red-600' },
  'SSEN': { icon: Ship, color: 'bg-blue-100 text-blue-600' },
  'CLEN': { icon: Building, color: 'bg-gray-100 text-gray-600' },
  'ENDG': { icon: Compass, color: 'bg-purple-100 text-purple-600' },
  'ENDS': { icon: Layout, color: 'bg-green-100 text-green-600' },
  'ENTC': { icon: Wrench, color: 'bg-orange-100 text-orange-600' },
  'ESET': { icon: CircuitBoard, color: 'bg-blue-100 text-blue-600' },
  'MMET': { icon: Factory, color: 'bg-gray-100 text-gray-600' },
  'MXET': { icon: Settings, color: 'bg-purple-100 text-purple-600' },
  'ITDE': { icon: Code, color: 'bg-cyan-100 text-cyan-600' },
  'MTDE': { icon: Cpu, color: 'bg-indigo-100 text-indigo-600' },
  'DAEN': { icon: Database, color: 'bg-blue-100 text-blue-600' },

  // Sciences
  'MATH': { icon: Calculator, color: 'bg-indigo-100 text-indigo-600' },
  'STAT': { icon: BarChart3, color: 'bg-purple-100 text-purple-600' },
  'CHEM': { icon: FlaskConical, color: 'bg-green-100 text-green-600' },
  'BIOL': { icon: Dna, color: 'bg-emerald-100 text-emerald-600' },
  'PHYS': { icon: Atom, color: 'bg-purple-100 text-purple-600' },
  'GEOL': { icon: Mountain, color: 'bg-amber-100 text-amber-600' },
  'GEOG': { icon: Map, color: 'bg-blue-100 text-blue-600' },
  'GEOS': { icon: Globe, color: 'bg-emerald-100 text-emerald-600' },
  'GEOP': { icon: Mountain, color: 'bg-orange-100 text-orange-600' },
  'ASTR': { icon: Telescope, color: 'bg-indigo-100 text-indigo-600' },
  'ATMO': { icon: Globe, color: 'bg-cyan-100 text-cyan-600' },
  'OCNG': { icon: Waves, color: 'bg-blue-100 text-blue-600' },
  'BICH': { icon: Microscope, color: 'bg-green-100 text-green-600' },
  'GENE': { icon: Dna, color: 'bg-red-100 text-red-600' },
  'BIMS': { icon: Microscope, color: 'bg-blue-100 text-blue-600' },
  'BIOT': { icon: Dna, color: 'bg-purple-100 text-purple-600' },
  'EEBL': { icon: Leaf, color: 'bg-green-100 text-green-600' },
  'ECCB': { icon: TreePine, color: 'bg-emerald-100 text-emerald-600' },
  'BESC': { icon: Leaf, color: 'bg-teal-100 text-teal-600' },
  'ENSS': { icon: Recycle, color: 'bg-green-100 text-green-600' },
  'WMHS': { icon: Waves, color: 'bg-cyan-100 text-cyan-600' },
  'ANLY': { icon: BarChart3, color: 'bg-blue-100 text-blue-600' },
  'MASC': { icon: Calculator, color: 'bg-purple-100 text-purple-600' },

  // Medical & Health
  'NURS': { icon: Cross, color: 'bg-red-100 text-red-600' },
  'HLTH': { icon: Stethoscope, color: 'bg-blue-100 text-blue-600' },
  'HBEH': { icon: Heart, color: 'bg-pink-100 text-pink-600' },
  'KINE': { icon: Activity, color: 'bg-orange-100 text-orange-600' },
  'ATTR': { icon: HeartPulse, color: 'bg-green-100 text-green-600' },
  'NUTR': { icon: Apple, color: 'bg-red-100 text-red-600' },
  'PHAR': { icon: Pill, color: 'bg-blue-100 text-blue-600' },
  'PHSC': { icon: TestTube, color: 'bg-purple-100 text-purple-600' },
  'MPHY': { icon: HeartPulse, color: 'bg-red-100 text-red-600' },
  'MSCI': { icon: Stethoscope, color: 'bg-cyan-100 text-cyan-600' },
  'MCMD': { icon: Microscope, color: 'bg-green-100 text-green-600' },
  'PHLT': { icon: Shield, color: 'bg-emerald-100 text-emerald-600' },
  'PHEB': { icon: BarChart3, color: 'bg-blue-100 text-blue-600' },
  'PHEO': { icon: Recycle, color: 'bg-green-100 text-green-600' },
  'PHPM': { icon: Users, color: 'bg-purple-100 text-purple-600' },
  'SOPH': { icon: Shield, color: 'bg-blue-100 text-blue-600' },
  'HCPI': { icon: Plus, color: 'bg-red-100 text-red-600' },
  'EDHP': { icon: GraduationCap, color: 'bg-teal-100 text-teal-600' },
  'IBST': { icon: Microscope, color: 'bg-indigo-100 text-indigo-600' },
  'FIVS': { icon: Microscope, color: 'bg-purple-100 text-purple-600' },
  'FORS': { icon: Shield, color: 'bg-gray-100 text-gray-600' },
  'NRSC': { icon: Brain, color: 'bg-pink-100 text-pink-600' },
  'NEXT': { icon: Brain, color: 'bg-indigo-100 text-indigo-600' },
  'PBSI': { icon: Brain, color: 'bg-purple-100 text-purple-600' },

  // Dental
  'AEGD': { icon: Smile, color: 'bg-blue-100 text-blue-600' },
  'ENDO': { icon: Smile, color: 'bg-green-100 text-green-600' },
  'ORTH': { icon: Smile, color: 'bg-purple-100 text-purple-600' },
  'PEDD': { icon: Smile, color: 'bg-pink-100 text-pink-600' },
  'PERI': { icon: Smile, color: 'bg-orange-100 text-orange-600' },
  'PROS': { icon: Smile, color: 'bg-cyan-100 text-cyan-600' },
  'OMFP': { icon: Smile, color: 'bg-red-100 text-red-600' },
  'OMFR': { icon: Smile, color: 'bg-indigo-100 text-indigo-600' },
  'OMFS': { icon: Smile, color: 'bg-amber-100 text-amber-600' },
  'OBIO': { icon: Smile, color: 'bg-emerald-100 text-emerald-600' },
  'DDHS': { icon: Smile, color: 'bg-teal-100 text-teal-600' },
  'DPHS': { icon: Shield, color: 'bg-blue-100 text-blue-600' },

  // Veterinary
  'VIBS': { icon: PawPrint, color: 'bg-brown-100 text-brown-600' },
  'VLCS': { icon: Dog, color: 'bg-amber-100 text-amber-600' },
  'VSCS': { icon: PawPrint, color: 'bg-green-100 text-green-600' },
  'VMID': { icon: Cross, color: 'bg-red-100 text-red-600' },
  'VPAR': { icon: Microscope, color: 'bg-purple-100 text-purple-600' },
  'VPAT': { icon: TestTube, color: 'bg-blue-100 text-blue-600' },
  'VTMI': { icon: Microscope, color: 'bg-cyan-100 text-cyan-600' },
  'VTPB': { icon: FlaskConical, color: 'bg-emerald-100 text-emerald-600' },
  'VTPP': { icon: Pill, color: 'bg-pink-100 text-pink-600' },

  // Agriculture & Life Sciences
  'AGEC': { icon: DollarSign, color: 'bg-green-100 text-green-600' },
  'AGLS': { icon: TreePine, color: 'bg-emerald-100 text-emerald-600' },
  'AGSC': { icon: Leaf, color: 'bg-green-100 text-green-600' },
  'AGSM': { icon: Cog, color: 'bg-amber-100 text-amber-600' },
  'ANSC': { icon: PawPrint, color: 'bg-brown-100 text-brown-600' },
  'HORT': { icon: Flower, color: 'bg-pink-100 text-pink-600' },
  'POSC': { icon: PawPrint, color: 'bg-yellow-100 text-yellow-600' },
  'RWFM': { icon: TreePine, color: 'bg-green-100 text-green-600' },
  'SCSC': { icon: Shovel, color: 'bg-amber-100 text-amber-600' },
  'FSTC': { icon: Apple, color: 'bg-red-100 text-red-600' },
  'CULN': { icon: ChefHat, color: 'bg-orange-100 text-orange-600' },
  'MEPS': { icon: Leaf, color: 'bg-emerald-100 text-emerald-600' },
  'PLPA': { icon: Microscope, color: 'bg-green-100 text-green-600' },
  'ENTO': { icon: Microscope, color: 'bg-amber-100 text-amber-600' },
  'ALEC': { icon: Users, color: 'bg-blue-100 text-blue-600' },
  'ALED': { icon: GraduationCap, color: 'bg-green-100 text-green-600' },
  'AGCJ': { icon: Newspaper, color: 'bg-cyan-100 text-cyan-600' },

  // Liberal Arts & Humanities
  'ENGL': { icon: Feather, color: 'bg-pink-100 text-pink-600' },
  'HIST': { icon: Clock, color: 'bg-amber-100 text-amber-600' },
  'PHIL': { icon: Lightbulb, color: 'bg-purple-100 text-purple-600' },
  'SPAN': { icon: Languages, color: 'bg-red-100 text-red-600' },
  'FREN': { icon: MessageCircle, color: 'bg-blue-100 text-blue-600' },
  'GERM': { icon: Globe, color: 'bg-gray-100 text-gray-600' },
  'CHIN': { icon: Languages, color: 'bg-yellow-100 text-yellow-600' },
  'JAPN': { icon: MessageCircle, color: 'bg-pink-100 text-pink-600' },
  'ARAB': { icon: Languages, color: 'bg-green-100 text-green-600' },
  'ITAL': { icon: Globe, color: 'bg-green-100 text-green-600' },
  'RUSS': { icon: Languages, color: 'bg-red-100 text-red-600' },
  'MODL': { icon: MessageCircle, color: 'bg-purple-100 text-purple-600' },
  'CLAS': { icon: Columns, color: 'bg-amber-100 text-amber-600' },
  'RELS': { icon: Cross, color: 'bg-purple-100 text-purple-600' },
  'AFST': { icon: Globe, color: 'bg-orange-100 text-orange-600' },
  'ASIA': { icon: Globe, color: 'bg-red-100 text-red-600' },
  'HISP': { icon: Languages, color: 'bg-orange-100 text-orange-600' },
  'WGST': { icon: Users, color: 'bg-pink-100 text-pink-600' },
  'DHUM': { icon: Monitor, color: 'bg-cyan-100 text-cyan-600' },

  // Social Sciences
  'POLS': { icon: Vote, color: 'bg-red-100 text-red-600' },
  'SOCI': { icon: Users, color: 'bg-blue-100 text-blue-600' },
  'ANTH': { icon: User, color: 'bg-amber-100 text-amber-600' },
  'CPSY': { icon: Brain, color: 'bg-teal-100 text-teal-600' },
  'EPSY': { icon: Brain, color: 'bg-purple-100 text-purple-600' },
  'SPSY': { icon: Brain, color: 'bg-pink-100 text-pink-600' },
  'GLST': { icon: Globe, color: 'bg-blue-100 text-blue-600' },
  'INTA': { icon: Handshake, color: 'bg-green-100 text-green-600' },

  // Fine Arts
  'ARTS': { icon: Palette, color: 'bg-violet-100 text-violet-600' },
  'MUSC': { icon: Music, color: 'bg-indigo-100 text-indigo-600' },
  'THEA': { icon: Drama, color: 'bg-pink-100 text-pink-600' },
  'DCED': { icon: Activity, color: 'bg-purple-100 text-purple-600' },
  'PVFA': { icon: Camera, color: 'bg-cyan-100 text-cyan-600' },
  'VIST': { icon: Camera, color: 'bg-blue-100 text-blue-600' },
  'VIZA': { icon: Monitor, color: 'bg-green-100 text-green-600' },
  'PERF': { icon: Drama, color: 'bg-orange-100 text-orange-600' },
  'MSTC': { icon: Headphones, color: 'bg-purple-100 text-purple-600' },
  'FILM': { icon: Camera, color: 'bg-gray-100 text-gray-600' },

  // Architecture & Planning
  'ARCH': { icon: Building, color: 'bg-gray-100 text-gray-600' },
  'CARC': { icon: Compass, color: 'bg-blue-100 text-blue-600' },
  'LAND': { icon: Trees, color: 'bg-green-100 text-green-600' },
  'PLAN': { icon: Map, color: 'bg-purple-100 text-purple-600' },
  'URPN': { icon: Building2, color: 'bg-amber-100 text-amber-600' },
  'URSC': { icon: Building2, color: 'bg-cyan-100 text-cyan-600' },
  'COSC': { icon: HardHat, color: 'bg-orange-100 text-orange-600' },
  'LDEV': { icon: Map, color: 'bg-emerald-100 text-emerald-600' },

  // Education
  'EDCI': { icon: GraduationCap, color: 'bg-blue-100 text-blue-600' },
  'EDAD': { icon: Users, color: 'bg-purple-100 text-purple-600' },
  'TEED': { icon: BookOpen, color: 'bg-green-100 text-green-600' },
  'SPED': { icon: Heart, color: 'bg-pink-100 text-pink-600' },
  'RDNG': { icon: BookOpen, color: 'bg-cyan-100 text-cyan-600' },
  'LDTC': { icon: Monitor, color: 'bg-indigo-100 text-indigo-600' },
  'EHRD': { icon: Users, color: 'bg-amber-100 text-amber-600' },
  'CEHD': { icon: School, color: 'bg-emerald-100 text-emerald-600' },
  'BEFB': { icon: Languages, color: 'bg-orange-100 text-orange-600' },
  'BESL': { icon: MessageCircle, color: 'bg-yellow-100 text-yellow-600' },
  'MEFB': { icon: GraduationCap, color: 'bg-purple-100 text-purple-600' },
  'SEFB': { icon: Heart, color: 'bg-red-100 text-red-600' },
  'TEFB': { icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  'ECDE': { icon: Baby, color: 'bg-pink-100 text-pink-600' },

  // Communication & Journalism
  'COMM': { icon: Megaphone, color: 'bg-blue-100 text-blue-600' },
  'JOUR': { icon: Newspaper, color: 'bg-gray-100 text-gray-600' },

  // Military & Defense
  'MLSC': { icon: Shield, color: 'bg-green-100 text-green-600' },
  'AERS': { icon: Plane, color: 'bg-sky-100 text-sky-600' },
  'NVSC': { icon: Anchor, color: 'bg-blue-100 text-blue-600' },
  'SOMS': { icon: Flag, color: 'bg-red-100 text-red-600' },

  // Law & Government
  'LAW': { icon: Scale, color: 'bg-purple-100 text-purple-600' },
  'BUSH': { icon: Building2, color: 'bg-blue-100 text-blue-600' },
  'PSAA': { icon: FileText, color: 'bg-green-100 text-green-600' },

  // Recreation & Tourism
  'RPTS': { icon: Trees, color: 'bg-emerald-100 text-emerald-600' },
  'HMGT': { icon: Building2, color: 'bg-orange-100 text-orange-600' },
  'SPMT': { icon: Activity, color: 'bg-red-100 text-red-600' },

  // Technology & Information Systems
  'TCMG': { icon: Monitor, color: 'bg-blue-100 text-blue-600' },
  'TCMT': { icon: Cpu, color: 'bg-purple-100 text-purple-600' },
  'ITSV': { icon: Server, color: 'bg-cyan-100 text-cyan-600' },

  // Energy
  'ENGY': { icon: Fuel, color: 'bg-yellow-100 text-yellow-600' },

  // Economics & Finance
  'ECMT': { icon: BarChart3, color: 'bg-indigo-100 text-indigo-600' },

  // General/Administrative
  'ARSC': { icon: GraduationCap, color: 'bg-gray-100 text-gray-600' },
  'HONR': { icon: Star, color: 'bg-yellow-100 text-yellow-600' },
  'UGST': { icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  'FYEX': { icon: Star, color: 'bg-green-100 text-green-600' },
  'SYEX': { icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  'ASCC': { icon: GraduationCap, color: 'bg-cyan-100 text-cyan-600' },
  'INST': { icon: BookOpen, color: 'bg-amber-100 text-amber-600' },
  'SABR': { icon: Globe, color: 'bg-emerald-100 text-emerald-600' },
  'NSEB': { icon: Handshake, color: 'bg-orange-100 text-orange-600' },
  'TAMU': { icon: Building, color: 'bg-maroon-100 text-maroon-600' }
};

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [allDepartmentsLoaded, setAllDepartmentsLoaded] = useState(false);
  const [departmentsInfo, setDepartmentsInfo] = useState<DepartmentsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 30;

  // Cache keys for localStorage
  const CACHE_KEY = 'aggie-rmp-all-departments';
  const CACHE_TIMESTAMP_KEY = 'aggie-rmp-departments-timestamp';
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
        console.log('Loaded departments from cache:', parsedDepartments.length);
        return parsedDepartments;
      }
    } catch (error) {
      console.error('Failed to load cached departments:', error);
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
      console.log('Saved departments to cache:', departmentsData.length);
    } catch (error) {
      console.error('Failed to save departments to cache:', error);
    }
  };

  // Load departments info once
  useEffect(() => {
    const loadDepartmentsInfo = async () => {
      try {
        const departmentsInfoData = await getDepartmentsInfo();
        setDepartmentsInfo(departmentsInfoData);
      } catch (err) {
        console.error('Failed to load departments info:', err);
        // Don't set error state for departments info failure, just log it
        // The page can still function without the summary statistics
      }
    };
    loadDepartmentsInfo();
  }, []);

  // Progressive loading: first few departments, then all departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cachedDepartments = loadCachedDepartments();
        if (cachedDepartments && cachedDepartments.length > 10) {
          console.log('Using cached departments');
          setDepartments(cachedDepartments);
          setAllDepartments(cachedDepartments);
          setAllDepartmentsLoaded(true);
          setLoading(false);
          return;
        }

        // Load first batch quickly (limited to show immediate results)
        console.log('Loading first batch of departments...');
        const initialDepartments = await getDepartments({ limit: 30 });
        setDepartments(initialDepartments);
        setLoading(false);

        // Load all departments in background
        setIsLoadingAll(true);
        console.log('Loading all departments in background...');
        const allDepartmentsData = await getDepartments({ limit: 1000 }); // Departments are typically < 200
        console.log('Loaded all departments:', allDepartmentsData.length);

        // Update with all departments
        setDepartments(allDepartmentsData);
        setAllDepartments(allDepartmentsData);
        setAllDepartmentsLoaded(true);
        setIsLoadingAll(false);

        // Cache the results
        saveCachedDepartments(allDepartmentsData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load departments');
        console.error('Failed to load departments:', err);
        setLoading(false);
        setIsLoadingAll(false);
      }
    };

    loadDepartments();
  }, []);

  // Client-side filtering for category, search, and sorting
  const filteredDepartments = useMemo(() => {
    const dataToFilter = allDepartmentsLoaded ? allDepartments : departments;

    let filtered = dataToFilter.filter(dept => {
      const matchesSearch = !searchTerm ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || dept.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort departments
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'courses':
          return b.courses - a.courses;
        case 'professors':
          return b.professors - a.professors;
        case 'gpa':
          return b.avgGpa - a.avgGpa;
        case 'rating':
          return b.rating - a.rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [departments, allDepartments, allDepartmentsLoaded, searchTerm, selectedCategory, sortBy]);

  // Calculate dynamic category counts
  const categoriesWithCounts = useMemo(() => {
    const dataToCount = allDepartmentsLoaded ? allDepartments : departments;

    const counts = {
      all: dataToCount.length,
      stem: dataToCount.filter(dept => dept.category === 'stem').length,
      'liberal-arts': dataToCount.filter(dept => dept.category === 'liberal-arts').length,
      business: dataToCount.filter(dept => dept.category === 'business').length,
      agriculture: dataToCount.filter(dept => dept.category === 'agriculture').length
    };

    return categories.map(category => ({
      ...category,
      count: counts[category.id as keyof typeof counts] || 0
    }));
  }, [departments, allDepartments, allDepartmentsLoaded]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDepartments.length / itemsPerPage));
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const IconComponent = ({ code }: { code: string }) => {
    const Icon = departmentIcons[code as keyof typeof departmentIcons]?.icon || GraduationCap;
    return <Icon className="w-6 h-6" />;
  };

  const CategoryIcon = ({ category }: { category: { icon: React.ComponentType<{ className?: string }>; color: string } }) => {
    const Icon = category.icon;
    return <Icon className="w-4 h-4 mr-2" />;
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-body mb-8">
            <span>Home</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-heading">Departments</span>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-semibold text-heading mb-6">
              Explore Academic Departments
            </h1>
            <p className="text-lg text-body max-w-2xl mx-auto mb-8">
              Discover comprehensive data on all Texas A&M departments. Compare courses,
              professors, and academic performance across every field of study.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-body w-5 h-5" />
              <Input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg bg-card border-border rounded-full"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Card className="p-8 mb-12 bg-card border-border">
              <div className="text-center text-body">Loading departments...</div>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-8 mb-12 bg-red-50 border-red-200">
              <div className="text-center">
                <div className="text-red-700 mb-4">
                  <div className="text-lg font-semibold mb-2">Unable to Load Departments</div>
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
                  Try Again
                </Button>
              </div>
            </Card>
          )}

          {/* Statistics Overview */}
          {!loading && !error && departmentsInfo && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 border-transparent text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="w-8 h-8 text-white/80" />
                  <div>
                    <div className="text-3xl font-bold">
                      {departmentsInfo.summary.total_departments}
                    </div>
                    <div className="text-white/80 font-medium">Departments</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 border-transparent text-white">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-8 h-8 text-white/80" />
                  <div>
                    <div className="text-3xl font-bold">
                      {departmentsInfo.summary.total_courses.toLocaleString()}
                    </div>
                    <div className="text-white/80 font-medium">Total Courses</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 border-transparent text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-8 h-8 text-white/80" />
                  <div>
                    <div className="text-3xl font-bold">
                      {departmentsInfo.summary.total_professors.toLocaleString()}
                    </div>
                    <div className="text-white/80 font-medium">Total Professors</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-600 border-transparent text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-8 h-8 text-white/80" />
                  <div>
                    <div className="text-3xl font-bold">
                      {departmentsInfo.summary.overall_avg_rating}
                    </div>
                    <div className="text-white/80 font-medium">Avg Rating</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </div>
      </section>

      {/* Filters and Sort */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Category Filters */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-3">
                {categoriesWithCounts.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`${selectedCategory === category.id
                      ? `${category.color} ${category.hoverColor} text-white border-transparent`
                      : 'border-border hover:bg-button-hover'
                      } transition-all duration-normal`}
                  >
                    <CategoryIcon category={category} />
                    {category.name}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-body" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-card border border-border rounded-lg px-4 py-2 text-body"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedDepartments.map((department) => (
                <Card
                  key={department.id}
                  className="p-6 bg-gradient-to-br from-card to-card/50 border-border hover:border-[#500000] transition-all duration-normal hover:scale-[1.02] hover:shadow-xl cursor-pointer group relative overflow-hidden"
                >
                  {/* Decorative gradient accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#500000]/10 to-transparent rounded-bl-3xl"></div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${departmentIcons[department.code as keyof typeof departmentIcons]?.color || 'bg-[#500000]/10'}`}>
                      <IconComponent code={department.code} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-heading">
                          {department.code}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-[#FFCF3F] fill-current" />
                          <span className="text-sm text-body">{department.rating}</span>
                        </div>
                      </div>
                      <h4 className="text-sm text-body font-medium mb-2">
                        {department.name}
                      </h4>
                      <p className="text-sm text-body line-clamp-2">
                        {department.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <BookOpen className="w-4 h-4 text-[#500000]" />
                        <span className="text-lg font-semibold text-heading">
                          {department.courses}
                        </span>
                      </div>
                      <div className="text-xs text-body">Courses</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-[#500000]" />
                        <span className="text-lg font-semibold text-heading">
                          {department.professors}
                        </span>
                      </div>
                      <div className="text-xs text-body">Professors</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-[#500000]" />
                        <span className="text-lg font-semibold text-heading">
                          {department.avgGpa}
                        </span>
                      </div>
                      <div className="text-xs text-body">Avg GPA</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-body mb-2">Top Courses:</div>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const courses = department.topCourses.slice(0, 3);
                        const badges = [];

                        // Add actual course badges
                        courses.forEach((course, index) => {
                          badges.push(
                            <Badge
                              key={`course-${index}`}
                              variant="outline"
                              className="text-xs border-border text-body"
                            >
                              {course}
                            </Badge>
                          );
                        });

                        // Add empty badges to maintain spacing (up to 3 total)
                        for (let i = courses.length; i < 3; i++) {
                          badges.push(
                            <Badge
                              key={`empty-${i}`}
                              variant="outline"
                              className="text-xs border-transparent text-transparent"
                            >
                              &nbsp;&nbsp;&nbsp;
                            </Badge>
                          );
                        }

                        return badges;
                      })()}
                    </div>
                  </div>

                  <Link href={`/courses?department=${encodeURIComponent(department.name)}`}>
                    <Button
                      className="w-full bg-[#500000] hover:bg-[#600000] text-white group-hover:bg-[#600000] transition-all duration-normal"
                    >
                      View Department
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && filteredDepartments.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-heading mb-2">
                No departments found
              </h3>
              <p className="text-body">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-border"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

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
                        className="border-border"
                      >
                        1
                      </Button>
                    );
                    if (startPage > 2) {
                      pages.push(<span key="ellipsis1" className="px-2">...</span>);
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
                        className={currentPage === i
                          ? "bg-[#500000] text-white"
                          : "border-border"}
                      >
                        {i}
                      </Button>
                    );
                  }

                  // Always show last page
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(<span key="ellipsis2" className="px-2">...</span>);
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
                      </Button>
                    );
                  }

                  return pages;
                })()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-border"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}