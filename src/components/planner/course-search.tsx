"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { getCourses, type Course } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useSearchTracking } from "@/lib/analytics-hooks";
import { cn } from "@/lib/utils";

interface CourseSearchProps {
  onSelect: (code: string, name: string) => void;
  placeholder?: string;
  /** Codes to mark as already added. */
  existing?: ReadonlySet<string>;
  autoFocus?: boolean;
}

/** Type a code ("csce 31", "CSCE314") or title words; pick from matches. */
export function CourseSearch({ onSelect, placeholder, existing, autoFocus }: CourseSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The API matches "CSCE 31" but not "CSCE31".
    const q = query.trim().replace(/^([A-Za-z]{3,4})(\d)/, "$1 $2");
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      getCourses({ search: q, limit: 8 })
        .then((r) => {
          if (!cancelled) {
            setResults(r);
            setActive(0);
          }
        })
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setLoading(false));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useSearchTracking("planner", query, results.length, loading);

  const choose = (course: Course) => {
    track("search-pick", { from: "planner", position: results.indexOf(course) + 1 });
    onSelect(course.code, course.name);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <Input
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!results.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder ?? "Search by code or title, e.g. CSCE 221 or data structures"}
        className="pl-9"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="course-search-results"
        aria-label="Search courses"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" />
      )}
      {open && results.length > 0 && (
        <ul
          id="course-search-results"
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-white shadow-lg dark:bg-card"
        >
          {results.map((course, i) => {
            const added = existing?.has(course.code);
            return (
              <li
                key={course.id}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(course);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm",
                  i === active && "bg-raised",
                )}
              >
                <span className="min-w-0">
                  <span className="font-medium text-text-heading">{course.code}</span>
                  <span className="ml-2 truncate text-text-body">{course.name}</span>
                </span>
                {added && <span className="shrink-0 text-xs text-text-muted">in your list</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
