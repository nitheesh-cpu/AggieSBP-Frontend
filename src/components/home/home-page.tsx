"use client";

import React, { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { useRouter } from "next/navigation";

import { Navigation } from "@/components/navigation";
import { HomeHeroScroll } from "@/components/home/home-hero-scroll";
import { HomeDataStats } from "@/components/home/home-data-stats";
import {
  ExtensionFeature,
  MoreTools,
  SeatAlertsFeature,
} from "@/components/home/home-features";
import { Footer } from "@/components/footer";

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
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="min-h-screen bg-canvas">
        <Navigation variant="glass" />

        <main>
          <HomeHeroScroll />
          <ExtensionFeature />
          <SeatAlertsFeature />
          <MoreTools />
          <HomeDataStats />
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
