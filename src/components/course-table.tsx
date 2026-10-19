"use client";

import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { motion, useReducedMotion } from "motion/react";
import { getCourses, type Course } from "@/lib/api";

// Big first-year courses students look up most. Numbers come from the API so
// the homepage never shows a GPA the course page disagrees with.
const POPULAR_COURSES: { icon: string; code: string }[] = [
  { icon: "💻", code: "CSCE 120" },
  { icon: "⚡", code: "ECEN 248" },
  { icon: "📐", code: "MATH 151" },
  { icon: "⚙️", code: "ENGR 102" },
  { icon: "🧬", code: "BIOL 111" },
  { icon: "📚", code: "HIST 105" },
];

export const CourseTable: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [courses, setCourses] = React.useState<Record<string, Course | null>>({});

  React.useEffect(() => {
    let alive = true;
    void Promise.all(
      POPULAR_COURSES.map(async ({ code }) => {
        try {
          const rows = await getCourses({ search: code, limit: 5 });
          return [code, rows.find((c) => c.code === code) ?? null] as const;
        } catch {
          return [code, null] as const;
        }
      }),
    ).then((entries) => {
      if (alive) setCourses(Object.fromEntries(entries));
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="py-20" data-oid="u1aosgq">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" data-oid="7-_xf5i">
        <div className="max-w-md mx-auto" data-oid="qopl6by">
          <motion.h2
            className="text-[20px] sm:text-[24px] md:text-[26px] text-text-heading dark:text-white leading-[1.4] mb-2"
            data-oid="dez3r-n"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5 }}
          >
            Popular courses at a glance
          </motion.h2>
          <motion.p
            className="text-[12px] sm:text-[13px] text-text-body dark:text-white/80 mb-6"
            data-oid="pjvgnwu"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            Average GPA from official grade data and the average rating of each
            course&apos;s professors. Tap one for professors and sections.
          </motion.p>

          <div
            className="relative rounded-2xl border border-border bg-card px-4 pt-6 pb-4 shadow-sm dark:border-[#4B5563] dark:bg-black/60 dark:shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
            data-oid="dpyv23t"
          >
            <ul className="space-y-3 mb-6" data-oid="90fk0ub">
              {POPULAR_COURSES.map(({ icon, code }) => {
                const course = courses[code];
                const loading = !(code in courses);
                return (
                  <li key={code}>
                    <Link
                      href={`/course/${code.replace(/\s+/g, "")}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-canvas hover:border-[#FFCF3F] transition-colors duration-200 dark:border-[#4B5563] dark:bg-black/70"
                      data-oid="wi27n:e"
                    >
                      <div className="flex min-w-0 items-center gap-3" data-oid="p997bve">
                        <span className="text-xl w-8 flex justify-center" aria-hidden>
                          {icon}
                        </span>
                        <div className="min-w-0">
                          <div className="text-text-heading dark:text-white" data-oid="v2lkzkk">
                            {code}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-text-body dark:text-white/80">
                            {loading ? (
                              <span>Loading…</span>
                            ) : course ? (
                              <>
                                <span>
                                  GPA{" "}
                                  {course.avgGPA !== -1 ? course.avgGPA.toFixed(2) : "—"}
                                </span>
                                {course.difficulty && course.difficulty !== "Unknown" && (
                                  <span>{course.difficulty}</span>
                                )}
                              </>
                            ) : (
                              <span>No data yet</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {course?.rating != null && (
                        <span
                          className="shrink-0 text-right text-accent"
                          title="Average RateMyProfessor rating of this course's professors"
                        >
                          {course.rating.toFixed(1)}/5
                          <span className="block text-[10px] text-text-body dark:text-white/75">
                            prof rating
                          </span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link href="/compare">
              <Button
                variant="outline"
                className="mt-2 w-full border-dashed border-border bg-transparent text-text-heading hover:bg-button-hover dark:border-[#4B5563] dark:text-white dark:hover:bg-black/60"
                data-oid="y197u7a"
              >
                Compare courses side by side
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
