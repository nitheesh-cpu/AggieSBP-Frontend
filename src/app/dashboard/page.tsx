"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
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
import { MOBILE_APP_QUICK_LINKS } from "@/lib/nav-quick-links";

type DashboardAction = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const ACTIONS: DashboardAction[] = [
  {
    title: "My alerts & watched sections",
    description: "Manage seat-open alerts and test notifications.",
    href: "/profile/alerts",
    icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
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

  const standalonePrimary = MOBILE_APP_QUICK_LINKS.find((l) => l.emphasis);
  const standaloneRest = MOBILE_APP_QUICK_LINKS.filter((l) => !l.emphasis);

  return (
    <div
      className={
        isStandalone
          ? "relative flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden"
          : "relative flex min-h-screen flex-col"
      }
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

      <main
        className={
          isStandalone
            ? "relative z-10 flex flex-1 min-h-0 flex-col px-5 pt-16 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-[4.25rem]"
            : "relative z-10 flex-grow px-4 pb-16 pt-20 sm:pt-24"
        }
      >
        {isStandalone ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {standalonePrimary ? (
              <Link
                href={standalonePrimary.href}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#500000] bg-[#500000] px-5 py-4 text-base font-semibold text-white transition-colors hover:bg-[#3d0000] dark:border-[#FFCF3F] dark:bg-[#FFCF3F] dark:text-black dark:hover:bg-[#FFD966] sm:py-5"
              >
                <Bell className="h-5 w-5 shrink-0" aria-hidden />
                {standalonePrimary.name}
              </Link>
            ) : null}
            <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 [grid-template-rows:repeat(4,minmax(0,1fr))] sm:gap-4">
              {standaloneRest.map((item) => (
                <Link
                  key={`${item.href}-${item.name}`}
                  href={item.href}
                  className="flex min-h-0 min-w-0 items-center justify-center rounded-xl border border-[#500000]/20 bg-white/90 px-3 py-4 text-center text-sm font-medium text-heading transition-colors hover:bg-[#500000]/5 dark:border-[#FFCF3F]/25 dark:bg-black/50 dark:text-white/90 dark:hover:bg-white/10 sm:px-4 sm:text-[15px]"
                >
                  <span className="line-clamp-2 leading-snug">{item.name}</span>
                </Link>
              ))}
            </div>
            <Link href="/compare" className="shrink-0 pt-1">
              <Button className="h-12 w-full rounded-xl bg-[#FFCF3F] px-4 text-[#0f0f0f] hover:bg-[#FFD966] sm:h-14">
                Start comparing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-1 sm:space-y-2"
            >
              <p className="hidden text-xs font-mono uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 sm:block">
                AggieSB+ dashboard
              </p>
              <h1 className="text-xl font-bold leading-tight text-heading dark:text-white sm:text-2xl">
                What do you want to do right now?
              </h1>
            </motion.div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {ACTIONS.map((action) => (
                <Link key={action.title} href={action.href}>
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    className="flex h-full items-start gap-2.5 rounded-2xl border border-border/60 bg-white/70 p-3 shadow-sm active:shadow-none dark:border-white/10 dark:bg-black/70 sm:gap-3 sm:p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#500000]/8 text-[#500000] dark:bg-[#FFCF3F]/15 dark:text-[#FFCF3F] sm:h-10 sm:w-10 sm:rounded-xl">
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-0.5 text-[13px] font-semibold text-heading dark:text-white sm:mb-1 sm:text-sm">
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
        )}
      </main>

      {!isStandalone ? <Footer /> : null}
    </div>
  );
}

