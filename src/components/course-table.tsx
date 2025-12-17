"use client";

import React from "react";
import { Button } from "./ui/button";
import { motion, useReducedMotion } from "motion/react";

interface CourseRow {
  icon: string;
  course: string;
  avgGPA: string;
  workload: string;
  rating: string;
}

const courseData: CourseRow[] = [
  {
    icon: "💻",
    course: "CSCE121",
    avgGPA: "3.18",
    workload: "Medium",
    rating: "4.6/5",
  },
  {
    icon: "⚡",
    course: "ECEN248",
    avgGPA: "2.95",
    workload: "High",
    rating: "4.2/5",
  },
  {
    icon: "📐",
    course: "MATH251",
    avgGPA: "2.87",
    workload: "High",
    rating: "3.9/5",
  },
  {
    icon: "⚙️",
    course: "ENGR102",
    avgGPA: "3.45",
    workload: "Light",
    rating: "4.8/5",
  },
  {
    icon: "🧬",
    course: "BIOL111",
    avgGPA: "3.22",
    workload: "Medium",
    rating: "4.4/5",
  },
  {
    icon: "📚",
    course: "HIST105",
    avgGPA: "3.67",
    workload: "Light",
    rating: "4.7/5",
  },
  {
    icon: "💻",
    course: "CSCE314",
    avgGPA: "3.05",
    workload: "High",
    rating: "4.1/5",
  },
  {
    icon: "⚡",
    course: "ECEN303",
    avgGPA: "2.78",
    workload: "High",
    rating: "3.8/5",
  },
  {
    icon: "📐",
    course: "MATH308",
    avgGPA: "3.12",
    workload: "Medium",
    rating: "4.3/5",
  },
  {
    icon: "⚙️",
    course: "ENGR216",
    avgGPA: "3.38",
    workload: "Medium",
    rating: "4.5/5",
  },
  {
    icon: "🧬",
    course: "BIOL212",
    avgGPA: "2.94",
    workload: "High",
    rating: "4.0/5",
  },
  {
    icon: "📚",
    course: "HIST202",
    avgGPA: "3.52",
    workload: "Light",
    rating: "4.6/5",
  },
];

export const CourseTable: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20" data-oid="u1aosgq">
      <div className="max-w-6xl mx-auto px-6" data-oid="7-_xf5i">
        <div className="max-w-md mx-auto" data-oid="qopl6by">
          <motion.h2
            className="text-[20px] sm:text-[24px] md:text-[26px] text-white leading-[1.4] mb-2"
            data-oid="dez3r-n"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5 }}
          >
            Compare courses before you enroll
          </motion.h2>
          <motion.p
            className="text-[11px] sm:text-[12px] text-white/80 mb-6"
            data-oid="pjvgnwu"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            Credit hours, average GPA, and professor rating—all side by side.
          </motion.p>

          <motion.div
            className="relative rounded-2xl border border-[#4B5563] bg-black/60 px-4 pt-6 pb-4 shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
            data-oid="dpyv23t"
          >
            <motion.div
              className="space-y-3 mb-6"
              data-oid="90fk0ub"
              initial={shouldReduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
            >
              {courseData.map((course, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#4B5563] bg-black/70 hover:border-[#FFCF3F] transition-all duration-200 group cursor-pointer"
                  data-oid="wi27n:e"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={
                    shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }
                  }
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                >
                  <div className="flex items-center gap-3" data-oid="p997bve">
                    <span
                      className="text-xl w-8 flex justify-center"
                      data-oid="414ly32"
                    >
                      {course.icon}
                    </span>
                    <div>
                      <div className="text-white" data-oid="v2lkzkk">
                        {course.course}
                      </div>
                      <div className="flex gap-4 mt-1 text-[10px] text-white/70">
                        <span data-oid="its91ip">GPA {course.avgGPA}</span>
                        <span data-oid="4gzf_j4">LOAD {course.workload}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[#FFCF3F]" data-oid="2np2d31">
                    {course.rating}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: 0.06 }}
            >
              <Button
                variant="outline"
                className="mt-2 w-full border-dashed border-[#4B5563] bg-transparent text-white hover:bg-black/60"
                data-oid="y197u7a"
              >
                Try a sample search
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
