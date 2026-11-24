"use client";

import React, { useEffect, useState } from "react";
import Link from "@/components/app-link";
import { Card } from "@/components/ui/card";
import { searchInstructors, type InstructorMatch } from "@/lib/api";
import { track } from "@/lib/analytics";

const GRADE_BARS: { letter: "A" | "B" | "C" | "D" | "F"; className: string }[] = [
  { letter: "A", className: "bg-accent" },
  { letter: "B", className: "bg-text-heading/45" },
  { letter: "C", className: "bg-text-heading/25" },
  { letter: "D", className: "bg-caution/80" },
  { letter: "F", className: "bg-negative/85" },
];

const spaced = (code: string) => code.replace(/^([A-Z]+)(\d+.*)$/, "$1 $2");

/**
 * Shown when a professor search finds no review profile: instructors teaching
 * recently whose name matches, with their courses and official grades. Many
 * name searches are for instructors nobody has reviewed yet.
 *
 * Calls `onResult` with the number found (0 when none, or on failure).
 */
export function InstructorMatches({
  query,
  onResult,
}: {
  query: string;
  onResult?: (count: number) => void;
}) {
  const [matches, setMatches] = useState<InstructorMatch[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setMatches(null);
    searchInstructors(query)
      .then((found) => {
        if (cancelled) return;
        setMatches(found);
        onResult?.(found.length);
        if (found.length) track("instructor-fallback", { results: found.length });
      })
      .catch(() => {
        if (cancelled) return;
        setMatches([]);
        onResult?.(0);
      });
    return () => {
      cancelled = true;
    };
    // onResult is a callback from the parent; re-running on its identity
    // would refetch on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (!matches?.length) return null;

  return (
    <section aria-labelledby="instructor-matches" className="mb-8">
      <h2 id="instructor-matches" className="text-lg font-medium text-text-heading">
        Teaching recently, no reviews yet
      </h2>
      <p className="mt-1 mb-4 text-sm text-text-body">
        No review profile matched &ldquo;{query}&rdquo;. These instructors match the
        name in the registrar&apos;s recent schedules.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-3">
        {matches.map((person, i) => {
          const grades = person.grades;
          const total = grades
            ? GRADE_BARS.reduce((sum, { letter }) => sum + grades.distribution[letter], 0)
            : 0;
          return (
            <Card
              key={`${person.name}-${i}`}
              className="h-full gap-0 border-border bg-card p-5 shadow-none"
            >
              <h3 className="text-base font-medium leading-6 text-text-heading">
                {person.name}
              </h3>
              <p className="text-xs text-text-muted">
                {person.campus && person.term?.includes(person.campus)
                  ? person.term
                  : [person.campus, person.term].filter(Boolean).join(" · ")}
              </p>

              <ul className="mt-3 flex flex-col gap-1.5">
                {person.courses.slice(0, 4).map((course) => (
                  <li key={course.code}>
                    <Link
                      href={`/course/${course.code}`}
                      onClick={() => track("instructor-fallback-pick", { position: i + 1 })}
                      className="group inline-flex items-baseline gap-2 text-sm text-text-body hover:text-text-heading"
                    >
                      <span className="code-tag">{spaced(course.code)}</span>
                      {course.title && (
                        <span className="line-clamp-1 underline-offset-4 group-hover:underline">
                          {course.title}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
                {person.courses.length > 4 && (
                  <li className="text-xs text-text-body">
                    +{person.courses.length - 4} more
                  </li>
                )}
              </ul>

              <div className="mt-4 border-t border-border pt-3">
                {grades && total > 0 ? (
                  <>
                    <p className="mb-2 text-xs text-text-muted">
                      Official grades
                      {grades.avgGpa != null && (
                        <>
                          {" · "}
                          <span className="font-mono text-text-heading">
                            {grades.avgGpa.toFixed(2)}
                          </span>{" "}
                          GPA
                        </>
                      )}
                      {" · "}
                      {grades.totalStudents.toLocaleString("en-US")} students
                    </p>
                    <div
                      className="flex h-2 gap-0.5 overflow-hidden rounded-full"
                      role="img"
                      aria-label={GRADE_BARS.map(
                        ({ letter }) =>
                          `${letter} ${Math.round((grades.distribution[letter] / total) * 100)}%`,
                      ).join(", ")}
                    >
                      {GRADE_BARS.map(({ letter, className }) =>
                        grades.distribution[letter] > 0 ? (
                          <span
                            key={letter}
                            className={className}
                            style={{ width: `${(grades.distribution[letter] / total) * 100}%` }}
                          />
                        ) : null,
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-text-muted">No reviews or grade reports yet</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
