"use client";

import React, { useEffect } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";

import { Navigation } from "@/components/navigation";
import { HomeHeroScroll } from "@/components/home/home-hero-scroll";
import { HomeDataStats } from "@/components/home/home-data-stats";
import { ReveilleIntro } from "@/components/home/reveille-intro";
import { QuickLinks } from "@/components/home/quick-links";
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
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(display-mode: standalone)");
    const iosStandalone =
      (navigator as any).standalone === true ||
      (navigator as any).standalone === "yes";
    if (mq.matches || iosStandalone) {
      router.replace("/dashboard");
    }
  }, [router]);

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
          <QuickLinks />

          {/* Scroll reveal sections */}
          <AnimatedSection delay={0.02}>
            <ReveilleIntro />
          </AnimatedSection>

          <AnimatedSection delay={0.04}>
            <HomeDataStats />
          </AnimatedSection>

          <AnimatedSection delay={0.04}>
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
