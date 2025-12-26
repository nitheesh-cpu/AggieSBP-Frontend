"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  BookOpen,
  GraduationCap,
  Users,
  GitCompare,
  Info,
  ArrowRight,
} from "lucide-react";

type QuickLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
};

const QUICK_LINKS: QuickLink[] = [
  {
    name: "Departments",
    href: "/departments",
    icon: <GraduationCap className="w-5 h-5" />,
    description: "Browse by department",
  },
  {
    name: "Courses",
    href: "/courses",
    icon: <BookOpen className="w-5 h-5" />,
    description: "Search courses",
  },
  {
    name: "Professors",
    href: "/professors",
    icon: <Users className="w-5 h-5" />,
    description: "Find professors",
  },
  {
    name: "Compare",
    href: "/compare",
    icon: <GitCompare className="w-5 h-5" />,
    description: "Compare options",
  },
  {
    name: "About",
    href: "/about",
    icon: <Info className="w-5 h-5" />,
    description: "Learn more",
  },
];

export function QuickLinks() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full py-12 bg-card border-y border-border dark:bg-black/20 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-canvas px-4 py-2 text-text-body text-xs tracking-wide dark:border-white/15 dark:bg-black/40 dark:text-white/80">
            Quick Links
          </div>
          <div className="mt-3 text-text-heading dark:text-white text-lg sm:text-xl font-semibold tracking-tight">
            Explore what AggieSB+ has to offer
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.06 },
            },
          }}
        >
          {QUICK_LINKS.map((link) => (
            <motion.div
              key={link.name}
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Link
                href={link.href}
                className="group block h-full"
              >
                <motion.div
                  whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                  className="h-full rounded-xl border border-border bg-canvas p-5 transition-all duration-200 hover:border-[#FFCF3F]/50 hover:shadow-md dark:border-white/10 dark:bg-black/45 dark:hover:border-[#FFCF3F]/50 dark:hover:bg-black/60"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-[#FFCF3F]/10 text-[#FFCF3F] dark:bg-[#FFCF3F]/20 group-hover:bg-[#FFCF3F]/20 dark:group-hover:bg-[#FFCF3F]/30 transition-colors">
                      {link.icon}
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-body dark:text-white/40 group-hover:text-[#FFCF3F] group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  <h3 className="text-text-heading dark:text-white font-semibold text-sm mb-1 group-hover:text-[#FFCF3F] transition-colors">
                    {link.name}
                  </h3>
                  <p className="text-text-body text-xs dark:text-white/60">
                    {link.description}
                  </p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}



