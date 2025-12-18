"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

interface DepartmentTab {
  id: string;
  label: string;
  href: string;
}

const departments: DepartmentTab[] = [
  {
    id: "csce",
    label: "CSCE",
    href: "/courses?department=CSCE%20-%20Computer%20Sci%20%26%20Engr",
  },
  {
    id: "ecen",
    label: "ECEN",
    href: "/courses?department=ECEN%20-%20Electrical%20%26%20Comp%20Engr",
  },
  {
    id: "engr",
    label: "ENGR",
    href: "/courses?department=ENGR%20-%20Engineering",
  },
  {
    id: "math",
    label: "MATH",
    href: "/courses?department=MATH%20-%20Mathematics",
  },
  { id: "biol", label: "BIOL", href: "/courses?department=BIOL%20-%20Biology" },
  {
    id: "chem",
    label: "CHEM",
    href: "/courses?department=CHEM%20-%20Chemistry",
  },
];

export const DepartmentTabs = () => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full py-20" data-oid="ffx4gjv">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-6">
          <div className="text-text-body text-[12px] sm:text-[13px] tracking-wide dark:text-white/80">
            Pick a department to jump into its courses.
          </div>
        </div>
        <motion.div
          className="flex flex-wrap justify-center gap-6"
          data-oid="o3ha5rp"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.06 },
            },
          }}
        >
          {departments.map((department) => (
            <Link key={department.id} href={department.href} prefetch={false}>
              <motion.span
                onMouseEnter={() => setHoveredTab(department.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`inline-flex items-center justify-center min-w-[120px] px-8 py-4 rounded-xl border transition-all duration-[220ms] ease-out cursor-pointer select-none ${
                  hoveredTab === department.id
                    ? "border-[#FFCF3F] bg-card dark:bg-black/75"
                    : "border-border bg-card dark:border-[#4B5563] dark:bg-black/45"
                }`}
                data-oid="jj0_m:8"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={
                  shouldReduceMotion ? undefined : { y: -2, scale: 1.03 }
                }
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <span className="tracking-[0.18em] text-text-heading text-[11px] font-medium dark:text-white">
                  {department.label}
                </span>
              </motion.span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
