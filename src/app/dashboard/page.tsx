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
  Award,
  Search,
  ArrowRight,
  Clock,
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
    title: "Browse courses",
    description: "Search by course, GPA, difficulty, or department.",
    href: "/courses",
    icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    title: "Find a professor",
    description: "See ratings, GPA history, reviews, and AI summaries.",
    href: "/professors",
    icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    title: "Explore easy courses",
    description: "Rank a department by easiness, GPA, and professors.",
    href: "/discover/dept",
    icon: <Search className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    title: "Core curriculum",
    description: "Find easier options for each UCC requirement.",
    href: "/discover/ucc",
    icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    title: "Browse departments",
    description: "Explore courses, faculty, and GPA by department.",
    href: "/departments",
    icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    title: "Fit my schedule",
    description: "Find sections that work with your availability.",
    href: "/discover/fit",
    icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
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
  const standaloneRest = MOBILE_APP_QUICK_LINKS.filter(
    (link) => !link.emphasis && link.href !== "/dashboard",
  );

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
                href="/profile/alerts"
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#500000] bg-[#500000] px-5 py-4 text-base font-semibold text-white transition-colors hover:bg-[#3d0000] dark:border-[#FFCF3F] dark:bg-[#FFCF3F] dark:text-black dark:hover:bg-[#FFD966] sm:py-5"
              >
                <Bell className="h-5 w-5 shrink-0" aria-hidden />
                {standalonePrimary.name}
              </Link>
            ) : null}
            <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3 sm:gap-4">
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
          </div>
        ) : (
          <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-1.5 sm:space-y-2"
            >
              <p className="hidden text-xs font-mono uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 sm:block">
                AggieSB+ dashboard
              </p>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-heading dark:text-white sm:text-3xl">
                Your AggieSB+ dashboard
              </h1>
              <p className="max-w-2xl text-sm text-body dark:text-white/60">
                Watch sections, research courses, and find the right professors.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="relative overflow-hidden rounded-3xl border border-[#500000]/20 bg-[#500000] p-5 text-white shadow-lg dark:border-[#FFCF3F]/30 dark:bg-black/70 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-7"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#FFCF3F]/15 blur-2xl" />
              <div className="relative flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FFCF3F] text-black">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FFCF3F]">
                    Primary feature
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">Seat alerts</h2>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-white/65">
                    Manage watched sections, confirm notification devices, and test your alert setup.
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="relative mt-5 h-11 w-full shrink-0 rounded-full bg-[#FFCF3F] px-5 text-black hover:bg-[#FFD966] sm:mt-0 sm:w-auto"
              >
                <Link href="/profile/alerts">
                  Manage alerts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <div>
              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-base font-semibold text-heading dark:text-white">
                  Explore
                </h2>
                <span className="text-xs text-body/70 dark:text-white/40">Choose a tool</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ACTIONS.map((action) => (
                <Link key={action.title} href={action.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="group flex h-full items-start gap-3 rounded-2xl border border-border/70 bg-white/65 p-4 shadow-sm transition-colors hover:border-[#500000]/25 hover:bg-white/85 active:shadow-none dark:border-white/10 dark:bg-black/50 dark:hover:border-[#FFCF3F]/25 dark:hover:bg-black/65"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#500000]/8 text-[#500000] dark:bg-[#FFCF3F]/15 dark:text-[#FFCF3F]">
                      {action.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-heading dark:text-white">
                        {action.title}
                      </h3>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-body/45 transition-transform group-hover:translate-x-0.5 dark:text-white/35" />
                      </div>
                      <p className="mt-1 text-xs leading-5 text-body dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {!isStandalone ? <Footer /> : null}
    </div>
  );
}
