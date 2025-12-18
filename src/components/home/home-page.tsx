"use client";

import React from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";

import { Navigation } from "@/components/navigation";
import { HomeHeroScroll } from "@/components/home/home-hero-scroll";
import { HomeDataStats } from "@/components/home/home-data-stats";
import { DepartmentTabs } from "@/components/department-tabs";
import { ValueProposition } from "@/components/value-proposition";
import { CourseTable } from "@/components/course-table";
import { Footer } from "@/components/footer";

type AnimatedSectionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

function AnimatedSection({
  children,
  className,
  delay = 0,
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className={className}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay },
        },
      }}
    >
      {children}
    </motion.section>
  );
}

export function HomePageMotion() {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="min-h-screen relative"
        style={{
          background: "var(--app-bg-gradient)",
        }}
      >
        {/* Ambient background */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            background: "var(--app-bg-ambient)",
          }}
        />

        <Navigation variant="glass" />

        <main>
          <HomeHeroScroll />
          <HomeDataStats />

          {/* Scroll reveal sections */}
          <AnimatedSection delay={0.02}>
            <ValueProposition />
          </AnimatedSection>

          <AnimatedSection delay={0.06}>
            <DepartmentTabs />
          </AnimatedSection>

          <AnimatedSection delay={0.08}>
            <CourseTable />
          </AnimatedSection>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
