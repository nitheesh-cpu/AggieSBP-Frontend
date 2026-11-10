"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Loader2,
  Search,
  Shapes,
} from "lucide-react";

import { getCourses, getDepartments, getProfessors } from "@/lib/api";
import { track, type SearchFrom } from "@/lib/analytics";
import { useSearchTracking } from "@/lib/analytics-hooks";

type SearchResult = {
  id: string;
  kind: "Course" | "Professor" | "Department" | "UCC group";
  title: string;
  subtitle: string;
  href: string;
};

const UCC_GROUPS = [
  ["KHIS", "American History"],
  ["KCOM", "Communication"],
  ["KCRA", "Creative Arts"],
  ["KPLF", "Federal Government / Political Science"],
  ["KPLL", "Local Government / Political Science"],
  ["KLPC", "Language, Philosophy and Culture"],
  ["KLPS", "Life and Physical Sciences"],
  ["KMTH", "Mathematics"],
  ["KSOC", "Social and Behavioral Sciences"],
  ["KUCD", "Cultural Discourse"],
  ["KICD", "International and Cultural Diversity"],
];

const resultIcons = {
  Course: BookOpen,
  Professor: GraduationCap,
  Department: Building2,
  "UCC group": Shapes,
};

type SearchResponse = {
  query: string;
  results: SearchResult[];
  incomplete: boolean;
};

/** `analyticsFrom` turns on search reporting; without it nothing is tracked. */
export function GlobalOmnibar({
  analyticsFrom,
}: { analyticsFrom?: SearchFrom } = {}) {
  const router = useRouter();
  const listId = React.useId();
  const [query, setQuery] = React.useState("");
  const [response, setResponse] = React.useState<SearchResponse>();
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const listRef = React.useRef<HTMLUListElement>(null);
  const normalizedQuery = query.trim();
  const currentResponse =
    response?.query === normalizedQuery ? response : undefined;
  const results = currentResponse?.results ?? [];
  const loading = normalizedQuery.length >= 2 && !currentResponse;
  const showPopup = open && normalizedQuery.length >= 2;
  const expanded = showPopup && results.length > 0;
  const activeResult = expanded ? results[activeIndex] : undefined;

  useSearchTracking(
    analyticsFrom ?? "home",
    analyticsFrom ? query : "",
    results.length,
    loading,
  );

  const trackPick = (index: number) => {
    if (analyticsFrom) track("search-pick", { from: analyticsFrom, position: index + 1 });
  };

  React.useEffect(() => {
    if (normalizedQuery.length < 2) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const [courses, professors, departments] = await Promise.allSettled([
        getCourses({ search: normalizedQuery, limit: 4 }),
        getProfessors({ search: normalizedQuery, limit: 4 }),
        getDepartments({ search: normalizedQuery, limit: 4 }),
      ]);
      if (cancelled) return;

      const lowerQuery = normalizedQuery.toLowerCase();
      setResponse({
        query: normalizedQuery,
        incomplete: [courses, professors, departments].some(
          (source) => source.status === "rejected",
        ),
        results: [
          ...(courses.status === "fulfilled" ? courses.value : []).map(
            (course) => ({
              id: `course-${course.id}`,
              kind: "Course" as const,
              title: course.code,
              subtitle: course.name,
              href: `/course/${course.code.replace(/\s+/g, "")}`,
            }),
          ),
          ...(professors.status === "fulfilled" ? professors.value : []).map(
            (professor) => ({
              id: `professor-${professor.id}`,
              kind: "Professor" as const,
              title: professor.name,
              subtitle: professor.departments?.join(" · ") || "Professor",
              href: `/professor/${professor.id}`,
            }),
          ),
          ...(departments.status === "fulfilled" ? departments.value : []).map(
            (department) => {
              const code = department.code || department.id;
              return {
                id: `department-${department.id}`,
                kind: "Department" as const,
                title: code,
                subtitle: department.name,
                href: `/departments?search=${encodeURIComponent(code)}`,
              };
            },
          ),
          ...UCC_GROUPS.filter(([code, title]) =>
            `${title} ${code}`.toLowerCase().includes(lowerQuery),
          )
            .slice(0, 3)
            .map(([code, title]) => ({
              id: `ucc-${code}`,
              kind: "UCC group" as const,
              title,
              subtitle: "University Core Curriculum",
              href: `/discover/ucc?group=${code}`,
            })),
        ],
      });
      setActiveIndex(-1);
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [normalizedQuery]);

  React.useEffect(() => {
    if (!activeResult) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [activeIndex, activeResult]);

  const navigate = (href: string) => {
    setOpen(false);
    setActiveIndex(-1);
    router.push(href);
  };

  return (
    <form
      className="relative w-full"
      role="search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
      onSubmit={(event) => {
        event.preventDefault();
        const pickIndex = activeResult ? activeIndex : expanded && results[0] ? 0 : -1;
        if (pickIndex >= 0) {
          trackPick(pickIndex);
        } else if (analyticsFrom === "home") {
          track("home-cta", { cta: "hero-search" });
        }
        navigate(
          activeResult?.href ??
            (expanded ? results[0]?.href : undefined) ??
            (normalizedQuery
              ? `/courses?search=${encodeURIComponent(normalizedQuery)}`
              : "/courses"),
        );
      }}
    >
      <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-card p-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-ring">
        <input
          role="combobox"
          aria-autocomplete="list"
          aria-label="Search professors, courses, departments, and UCC groups"
          aria-expanded={expanded}
          aria-controls={expanded ? listId : undefined}
          aria-activedescendant={
            activeResult ? `${listId}-${activeResult.id}` : undefined
          }
          autoComplete="off"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-base text-text-heading outline-none placeholder:text-text-muted"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              setActiveIndex(-1);
            } else if (
              results.length > 0 &&
              (event.key === "ArrowDown" || event.key === "ArrowUp")
            ) {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) =>
                event.key === "ArrowDown"
                  ? Math.min(index + 1, results.length - 1)
                  : index < 0
                    ? results.length - 1
                    : Math.max(index - 1, 0),
              );
            }
          }}
          placeholder="Course code or professor"
          value={query}
        />
        <button
          type="submit"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-accent-foreground transition-[background-color,transform] hover:-translate-y-px hover:bg-accent/90 active:translate-y-px motion-reduce:transform-none"
        >
          <Search className="h-4 w-4" aria-hidden />
          Search
        </button>
      </div>

      {showPopup && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-30 rounded-xl border border-border bg-popover p-1 text-left shadow-xl">
          {expanded && (
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label="Search suggestions"
              className="max-h-[min(16rem,42vh)] overflow-y-auto"
            >
              {results.map((result, index) => {
                const Icon = resultIcons[result.kind];
                return (
                  <li
                    key={result.id}
                    id={`${listId}-${result.id}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${index === activeIndex ? "bg-raised" : "hover:bg-raised"}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      trackPick(index);
                      navigate(result.href);
                    }}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0 text-text-muted"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text-heading">
                        {result.title}
                      </span>
                      <span className="block truncate text-xs text-text-body">
                        {result.subtitle}
                      </span>
                    </span>
                    <span className="sr-only font-mono text-xs text-text-muted sm:not-sr-only">
                      {result.kind}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <p
            role="status"
            className={
              expanded && !currentResponse?.incomplete
                ? "sr-only"
                : "flex items-center gap-2 px-3 py-2 text-sm text-text-body"
            }
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />{" "}
                Searching…
              </>
            ) : currentResponse?.incomplete ? (
              expanded ? (
                "Some sources are unavailable. Showing available matches."
              ) : (
                "Search is temporarily unavailable. Try again shortly."
              )
            ) : expanded ? (
              `${results.length} suggestions available`
            ) : (
              "No matching courses, professors, departments or UCC groups"
            )}
          </p>
        </div>
      )}
    </form>
  );
}
