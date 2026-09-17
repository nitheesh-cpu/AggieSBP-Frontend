"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Loader2,
  Search,
  Shapes,
} from "lucide-react";

import { getCourses, getDepartments, getProfessors } from "@/lib/api";

type SearchResult = {
  id: string;
  kind: "Course" | "Professor" | "Department" | "UCC group";
  title: string;
  subtitle: string;
  href: string;
};

const UCC_GROUPS = [
  "American History",
  "Communication",
  "Creative Arts",
  "Government/Political Science",
  "Language, Philosophy and Culture",
  "Life and Physical Sciences",
  "Mathematics",
  "Social and Behavioral Sciences",
];

const SEARCH_TARGETS = ["courses", "professors", "departments", "anything"];

const resultIcons = {
  Course: BookOpen,
  Professor: GraduationCap,
  Department: Building2,
  "UCC group": Shapes,
};

export function GlobalOmnibar() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [promptIndex, setPromptIndex] = React.useState(0);
  const requestId = React.useRef(0);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setPromptIndex((index) => (index + 1) % SEARCH_TARGETS.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      requestId.current += 1;
      setResults([]);
      setLoading(false);
      return;
    }

    const currentRequest = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const [courses, professors, departments] = await Promise.all([
          getCourses({ search: normalizedQuery, limit: 4 }),
          getProfessors({ search: normalizedQuery, limit: 4 }),
          getDepartments({ search: normalizedQuery, limit: 4 }),
        ]);
        if (currentRequest !== requestId.current) return;

        const lowerQuery = normalizedQuery.toLowerCase();
        const nextResults: SearchResult[] = [
          ...courses.map((course) => ({
            id: `course-${course.id}`,
            kind: "Course" as const,
            title: course.code,
            subtitle: course.name,
            href: `/course/${course.code.replace(/\s+/g, "")}`,
          })),
          ...professors.map((professor) => ({
            id: `professor-${professor.id}`,
            kind: "Professor" as const,
            title: professor.name,
            subtitle: professor.departments?.join(" · ") || "Professor",
            href: `/professor/${professor.id}`,
          })),
          ...departments.map((department) => ({
            id: `department-${department.id}`,
            kind: "Department" as const,
            title: department.code || department.id,
            subtitle: department.name,
            href: "/departments",
          })),
          ...UCC_GROUPS.filter((group) =>
            group.toLowerCase().includes(lowerQuery),
          )
            .slice(0, 3)
            .map((group) => ({
              id: `ucc-${group}`,
              kind: "UCC group" as const,
              title: group,
              subtitle: "University Core Curriculum",
              href: "/discover/ucc",
            })),
        ];
        setResults(nextResults);
        setActiveIndex(0);
        setOpen(true);
      } catch (error) {
        if (currentRequest === requestId.current) {
          console.error("Global search failed:", error);
          setResults([]);
        }
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [query]);

  const selectResult = (result: SearchResult) => {
    setOpen(false);
    router.push(result.href);
  };

  return (
    <div className="relative w-full max-w-[36rem] px-4" role="search">
      <div className="relative rounded-[1.4rem] border border-white/35 bg-black/45 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl">
        <Search className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          aria-label="Search professors, courses, departments, and UCC groups"
          aria-expanded={open && query.trim().length >= 2}
          aria-controls="global-search-results"
          autoComplete="off"
          className="h-12 w-full rounded-[1.05rem] border border-white/15 bg-white/95 pl-12 pr-12 text-[15px] font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-[#FFCF3F] focus:ring-2 focus:ring-[#FFCF3F]/30 sm:h-14 sm:text-base"
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter" && results[activeIndex]) {
              event.preventDefault();
              selectResult(results[activeIndex]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder=""
          value={query}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-12 right-12 top-1/2 -translate-y-1/2 overflow-hidden text-[15px] font-medium text-slate-500 sm:text-base"
        >
          {!query && (
            <span className="flex items-baseline whitespace-nowrap">
              <span>Search for&nbsp;</span>
              <motion.span
                layout
                className="relative inline-flex font-semibold text-slate-700"
                transition={{ layout: { duration: 0.24 } }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    layout
                    key={SEARCH_TARGETS[promptIndex]}
                    initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {SEARCH_TARGETS[promptIndex]}
                  </motion.span>
                </AnimatePresence>
              </motion.span>
              <motion.span layout>&nbsp;at Texas A&amp;M…</motion.span>
            </span>
          )}
        </span>
        {loading && (
          <Loader2 className="absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-slate-500" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div
          id="global-search-results"
          className="absolute inset-x-4 top-[calc(100%+0.5rem)] max-h-[48vh] overflow-y-auto rounded-2xl border border-white/20 bg-slate-950/95 p-1.5 text-left shadow-2xl backdrop-blur-xl"
        >
          {!loading && results.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-white/65">
              No matching courses, professors, departments, or UCC groups.
            </p>
          ) : (
            results.map((result, index) => {
              const Icon = resultIcons[result.kind];
              return (
                <button
                  key={result.id}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    index === activeIndex
                      ? "bg-white/15"
                      : "hover:bg-white/10"
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectResult(result)}
                  type="button"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#FFCF3F] text-slate-950">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-white">
                      {result.title}
                    </span>
                    <span className="block truncate text-sm text-white/60">
                      {result.subtitle}
                    </span>
                  </span>
                  <span className="hidden rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/55 sm:block">
                    {result.kind}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
