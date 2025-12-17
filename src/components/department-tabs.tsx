"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface DepartmentTab {
  id: string;
  label: string;
}

const departments: DepartmentTab[] = [
  { id: "csce", label: "CSCE" },
  { id: "ecen", label: "ECEN" },
  { id: "engr", label: "ENGR" },
  { id: "math", label: "MATH" },
  { id: "biol", label: "BIOL" },
  { id: "hist", label: "HIST" },
];

export const DepartmentTabs = () => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full py-20" data-oid="ffx4gjv">
      <div className="max-w-6xl mx-auto px-6">
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
            <motion.button
              key={department.id}
              onMouseEnter={() => setHoveredTab(department.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`min-w-[120px] px-8 py-4 rounded-xl border transition-all duration-[220ms] ease-out cursor-pointer ${
                hoveredTab === department.id
                  ? "border-[#FFCF3F] bg-black/75"
                  : "border-[#4B5563] bg-black/45"
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
              <span className="tracking-[0.18em] text-white text-[11px] font-medium">
                {department.label}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
