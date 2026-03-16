"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { motion } from "motion/react";
import {
  BookOpen,
  GraduationCap,
  Users,
  Bell,
  GitCompare,
  Award,
  Search,
} from "lucide-react";

type DashboardAction = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const ACTIONS: DashboardAction[] = [
  {
    title: "Browse courses",
    description: "Search courses, filter by difficulty and GPA, and pick sections.",
    href: "/courses",
    icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    title: "Browse by department",
    description: "See everything offered in your department.",
    href: "/departments",
    icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    title: "Find easy core/UCC classes",
    description: "Use data-driven easiness scores for core curriculum.",
    href: "/discover/ucc",
    icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    title: "Discover courses by department",
    description: "Rank every course in a department by easiness score, GPA, and professor ratings.",
    href: "/discover/dept",
    icon: <Search className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    title: "Compare professors",
    description: "Put professors side-by-side and choose faster.",
    href: "/compare",
    icon: <GitCompare className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    title: "Look up a professor",
    description: "See reviews, GPA data, and AI summaries.",
    href: "/professors",
    icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    title: "My alerts & watched sections",
    description: "Manage seat-open alerts and test notifications.",
    href: "/profile/alerts",
    icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
];

export default function DashboardPage() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(display-mode: standalone)");
    const iosStandalone =
      (navigator as any).standalone === true ||
      (navigator as any).standalone === "yes";
    setIsStandalone(mq.matches || iosStandalone);
  }, []);

  return (
    <div
      className="min-h-screen relative flex flex-col"
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

      <main className="flex-grow pt-20 sm:pt-24 px-4 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-1 sm:space-y-2"
          >
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 hidden sm:block">
              AggieSB+ dashboard
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-heading dark:text-white leading-tight">
              What do you want to do right now?
            </h1>
            {isStandalone && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                App mode detected — use the cards below to jump straight into
                common tasks.
              </p>
            )}
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {ACTIONS.map((action) => (
              <Link key={action.title} href={action.href}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className="h-full rounded-2xl border border-border/60 dark:border-white/10 bg-white/70 dark:bg-black/70 p-3 sm:p-4 flex gap-2.5 sm:gap-3 items-start shadow-sm active:shadow-none"
                >
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[#500000]/8 dark:bg-[#FFCF3F]/15 text-[#500000] dark:text-[#FFCF3F]">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[13px] sm:text-sm font-semibold text-heading dark:text-white mb-0.5 sm:mb-1">
                      {action.title}
                    </h2>
                    <p className="text-xs text-body dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

