"use client";

import React, { useEffect, useState } from "react";
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
  const [accountDeleted, setAccountDeleted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("account") === "deleted") {
      setAccountDeleted(true);
      params.delete("account");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (qs ? `?${qs}` : ""),
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Intentional: the installed app has two launch paths (manifest start_url and this redirect). See docs/context/gotchas.md G-021
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
      <div className="min-h-dvh bg-canvas">
        <Navigation variant="glass" />

        {accountDeleted && (
          <div
            role="status"
            className="fixed inset-x-4 top-20 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-text-heading shadow-lg"
          >
            <span>Your account was deleted.</span>
            <button
              type="button"
              onClick={() => setAccountDeleted(false)}
              className="shrink-0 text-text-muted underline underline-offset-2 hover:text-text-heading"
            >
              Dismiss
            </button>
          </div>
        )}

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
