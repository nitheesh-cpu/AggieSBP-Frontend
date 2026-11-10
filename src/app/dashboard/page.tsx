"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Building2,
  CalendarClock,
  Gauge,
  GitCompare,
  GraduationCap,
  Puzzle,
  Shapes,
  Users,
  type LucideIcon,
} from "lucide-react";
import { MOBILE_APP_QUICK_LINKS } from "@/lib/nav-quick-links";
import { GlobalOmnibar } from "@/components/home/global-omnibar";
import { PageBanner } from "@/components/page-banner";
import { track } from "@/lib/analytics";
import {
  ComparePreview,
  CoursesPreview,
  DepartmentsPreview,
  EasiestPreview,
  ExtensionPreview,
  FitPreview,
  PlannerPreview,
  ProfessorPreview,
  SeatAlertPreview,
  UccPreview,
} from "@/components/dashboard/tool-previews";

const EXTENSION_URL =
  "https://chromewebstore.google.com/detail/aggie-schedule-builder-pl/glckdcnecomhlmlegmjdceblibmaljpm";

type Tool = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  Preview: () => React.ReactElement;
};

const TOOL_GROUPS: { title: string; hint: string; tools: Tool[] }[] = [
  {
    title: "Find courses",
    hint: "Grades and difficulty for every A&M course",
    tools: [
      {
        title: "Browse courses",
        description: "Search by code, GPA, difficulty or department",
        href: "/courses",
        icon: BookOpen,
        Preview: CoursesPreview,
      },
      {
        title: "Easiest courses",
        description: "Rank a department by easiness, GPA and professors",
        href: "/discover/dept",
        icon: Gauge,
        Preview: EasiestPreview,
      },
      {
        title: "Core curriculum",
        description: "Easier options for each UCC requirement",
        href: "/discover/ucc",
        icon: Shapes,
        Preview: UccPreview,
      },
      {
        title: "Departments",
        description: "Course counts, GPA and ratings by department",
        href: "/departments",
        icon: Building2,
        Preview: DepartmentsPreview,
      },
    ],
  },
  {
    title: "Plan your semester",
    hint: "Pick professors and sections that fit",
    tools: [
      {
        title: "Find a professor",
        description: "Ratings, GPA history, reviews and summaries",
        href: "/professors",
        icon: Users,
        Preview: ProfessorPreview,
      },
      {
        title: "Compare",
        description: "Courses or professors side by side",
        href: "/compare",
        icon: GitCompare,
        Preview: ComparePreview,
      },
      {
        title: "Fit my schedule",
        description: "Sections that work around the times you're busy",
        href: "/discover/fit",
        icon: CalendarClock,
        Preview: FitPreview,
      },
      {
        title: "Degree planner",
        description: "Track your courses and check prerequisites",
        href: "/planner",
        icon: GraduationCap,
        Preview: PlannerPreview,
      },
    ],
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
          ? "relative flex h-[calc(100dvh-env(safe-area-inset-top))] max-h-[calc(100dvh-env(safe-area-inset-top))] min-h-0 flex-col overflow-hidden bg-canvas"
          : "relative flex min-h-screen flex-col bg-canvas"
      }
    >

      <Navigation variant="glass" />

      <main
        className={
          isStandalone
            ? "relative z-10 flex flex-1 min-h-0 flex-col px-5 pt-16 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-[4.25rem]"
            : "relative z-10 flex-grow pb-16"
        }
      >
        {isStandalone ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {standalonePrimary ? (
              <Link
                href="/profile/alerts"
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:py-5"
              >
                <Bell strokeWidth={1.5} className="h-[18px] w-[18px] shrink-0" aria-hidden />
                {standalonePrimary.name}
              </Link>
            ) : null}
            <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3 sm:gap-4">
              {standaloneRest.map((item) => (
                <Link
                  key={`${item.href}-${item.name}`}
                  href={item.href}
                  className="flex min-h-0 min-w-0 items-center justify-center rounded-xl border border-border bg-card px-3 py-4 text-center text-sm font-medium text-text-heading transition-colors hover:bg-raised sm:px-4 sm:text-base"
                >
                  <span className="line-clamp-2 leading-snug">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <>
          <PageBanner
            title="Dashboard"
            subtitle="Everything AggieSB+ does, in one place. Search, or pick a tool below."
            aside={
              <>
          {/* The PNG has transparent padding: the dog spans ~15-82% across and
              ~22-83% down, head at the top right. The bubble is pinned just
              above the head so its tail touches her ear. */}
          <div aria-hidden className="relative -mb-12 h-44 w-44">
            <img
              src="/pixel-reveille.png"
              alt=""
              className="h-44 w-44 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="absolute bottom-[142px] right-4 whitespace-nowrap rounded-lg border border-border-strong bg-card px-3 py-2 font-[family-name:var(--font-press-start-2p)] text-[10px] leading-4 text-accent">
              Howdy
              <span className="absolute -bottom-[6px] right-4 h-2.5 w-2.5 rotate-45 border-b border-r border-border-strong bg-card" />
            </span>
          </div>
              </>
            }
          >
            <GlobalOmnibar analyticsFrom="dashboard" />
          </PageBanner>

          <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
            {/* Featured: seat alerts and the extension */}
            <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Link
                href="/profile/alerts"
                className="group flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 transition-colors duration-150 hover:border-border-strong lg:col-span-2 lg:flex-row lg:items-center"
              >
                <div className="lg:w-60 lg:shrink-0">
                  <div className="flex items-center gap-2">
                    <Bell strokeWidth={1.5} className="h-[18px] w-[18px] text-text-muted" aria-hidden />
                    <h2 className="text-lg font-medium text-text-heading">Seat alerts</h2>
                  </div>
                  <p className="mt-2 max-w-sm text-sm leading-5 text-text-body">
                    Watch a full section and get a notification the moment a seat
                    opens
                  </p>
                  <span className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 group-hover:bg-primary/90">
                    Manage alerts
                    <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
                  </span>
                </div>
                <div className="w-full min-w-0 lg:flex-1">
                  <SeatAlertPreview />
                </div>
              </Link>

              <a
                href={EXTENSION_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("extension-click", { from: "dashboard", browser: "chrome" })}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors duration-150 hover:border-border-strong"
              >
                <div className="flex items-center gap-2">
                  <Puzzle strokeWidth={1.5} className="h-[18px] w-[18px] text-text-muted" aria-hidden />
                  <h2 className="text-lg font-medium text-text-heading">Browser extension</h2>
                </div>
                <p className="mt-2 text-sm leading-5 text-text-body">
                  Ratings and grades right inside College Scheduler
                </p>
                <div className="mt-4 flex-1">
                  <ExtensionPreview />
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-text-heading">
                  Add to Chrome
                  <ArrowUpRight
                    strokeWidth={1.5}
                    className="h-4 w-4 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </a>
            </section>

            {TOOL_GROUPS.map((group) => (
              <section key={group.title} className="mt-12">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-medium text-text-heading">{group.title}</h2>
                  <p className="hidden text-sm text-text-muted sm:block">{group.hint}</p>
                </div>
                <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {group.tools.map(({ title, description, href, icon: Icon, Preview }) => (
                    <li key={title}>
                      <Link
                        href={href}
                        className="group flex h-full flex-col rounded-xl border border-border bg-card p-3 transition-colors duration-150 hover:border-border-strong hover:bg-raised/40"
                      >
                        <Preview />
                        <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                          <div className="flex items-center gap-2">
                            <Icon strokeWidth={1.5} className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                            <h3 className="text-sm font-medium text-text-heading">{title}</h3>
                            <ArrowRight
                              strokeWidth={1.5}
                              className="ml-auto h-4 w-4 shrink-0 text-text-muted transition-[transform,color] duration-150 group-hover:translate-x-0.5 group-hover:text-text-heading"
                            />
                          </div>
                          <p className="mt-1.5 text-sm leading-5 text-text-body">{description}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          </>
        )}
      </main>

      {!isStandalone ? <Footer /> : null}
    </div>
  );
}
