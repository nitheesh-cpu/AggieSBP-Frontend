"use client";

import React from "react";
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
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <h3 className="text-sm font-normal text-text-body">
        Browse by department
      </h3>
      <ul className="flex flex-wrap gap-2">
        {departments.map((department) => (
          <li key={department.id}>
            <Link
              href={department.href}
              prefetch={false}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 font-mono text-sm text-text-heading transition-colors duration-150 hover:border-border-strong hover:bg-raised"
            >
              {department.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
