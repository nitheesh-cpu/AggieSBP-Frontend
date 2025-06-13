"use client";

import React, { useState } from "react";

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

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex">
          {departments.map((department, index) => (
            <div
              key={department.id}
              className={`flex-1 relative ${
                index < departments.length - 1 ? "border-r border-border" : ""
              }`}
              onMouseEnter={() => setHoveredTab(department.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div
                className={`py-6 px-8 text-center transition-all duration-[220ms] ease-out cursor-pointer ${
                  hoveredTab === department.id
                    ? "bg-button-hover text-text-heading"
                    : "text-text-body"
                }`}
              >
                <span className="text-base font-medium tracking-wide">
                  {department.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
