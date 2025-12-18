"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useTransform,
  useScroll,
} from "motion/react";

import { Button } from "@/components/ui/button";

export function HomeHeroScroll() {
  const shouldReduceMotion = useReducedMotion();
  const [isPortrait, setIsPortrait] = React.useState(false);

  const targetRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  // Detect portrait orientation (vertical screens)
  React.useEffect(() => {
    const checkOrientation = () => {
      // Check if screen height is greater than width (portrait)
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    // Check on mount
    checkOrientation();

    // Listen for orientation changes and window resize
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  // At the top (progress ~0) the user should only see the image.
  // As they scroll, content slides up and fades into place.
  // Hooks must not be called conditionally — always create motion values,
  // and choose constants at render time if reduced motion is enabled.
  const contentOpacityMv = useTransform(scrollYProgress, [0.02, 0.42], [0, 1]);
  const contentYMv = useTransform(scrollYProgress, [0.0, 0.42], [84, 0]);
  const backdropOpacityMv = useTransform(scrollYProgress, [0.0, 0.22], [0, 1]);
  const imageScaleMv = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  return (
    <section className="relative isolate">
      {/* Scroll area that controls the sticky hero */}
      <div ref={targetRef} className="relative h-[210dvh] min-h-[210svh]">
        <div className="sticky top-0 h-[100dvh] min-h-[100svh] w-full overflow-hidden relative z-20">
          <motion.div
            className="absolute inset-0"
            style={{ scale: shouldReduceMotion ? 1 : imageScaleMv }}
          >
            <Image
              src={isPortrait ? "/academic-plaza4.png" : "/academic-plaza2.png"}
              alt="Academic Plaza"
              fill
              priority
              className="object-cover"
            />
          </motion.div>

          {/* Backdrop only appears once the user starts scrolling */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              opacity: shouldReduceMotion ? 1 : backdropOpacityMv,
              background: "var(--hero-backdrop-gradient)",
            }}
          />

          {/* Content reveals on scroll */}
          <motion.div
            className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-10 pt-10"
            style={{
              opacity: shouldReduceMotion ? 1 : contentOpacityMv,
              y: shouldReduceMotion ? 0 : contentYMv,
            }}
          >
            <div className="max-w-4xl mx-auto text-center space-y-5">
              <h1 className="text-text-heading dark:text-white text-[22px] sm:text-[28px] md:text-[34px] leading-tight font-semibold tracking-tight">
                The fastest way to choose the learning environment for you.
              </h1>

              <p className="text-text-body text-[12px] sm:text-[13px] md:text-[14px] tracking-wide px-6 py-3 rounded-full bg-card border border-border inline-block dark:text-white/90 dark:bg-black/60 dark:border-white/10">
                Compare teaching quality, research impact, and course workload
                in one elegant dashboard.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <Link href="/compare" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-[#FFCF3F] text-[#0f0f0f] hover:bg-[#FFD966] rounded-full px-7">
                    Start comparing
                  </Button>
                </Link>

                <Link href="/courses" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-full border-border text-text-heading hover:bg-button-hover dark:border-white/60 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    Browse courses
                  </Button>
                </Link>
              </div>

              <div className="pt-1 text-text-body text-[11px] sm:text-[12px] tracking-wide dark:text-white/80">
                Search by course · View grade distributions · Student insights
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
