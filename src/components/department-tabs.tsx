"use client";

import React, { useState } from "react";
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
    id: "hist",
    label: "CHEM",
    href: "/courses?department=CHEM%20-%20Chemistry",
  },
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
              <Link href={department.href}>
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
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
