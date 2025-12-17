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

  const targetRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  // At the top (progress ~0) the user should only see the image.
  // As they scroll, content slides up and fades into place.
  const contentOpacity = shouldReduceMotion
    ? 1
    : useTransform(scrollYProgress, [0.02, 0.42], [0, 1]);
  const contentY = shouldReduceMotion
    ? 0
    : useTransform(scrollYProgress, [0.0, 0.42], [84, 0]);
  const backdropOpacity = shouldReduceMotion
    ? 1
    : useTransform(scrollYProgress, [0.0, 0.22], [0, 1]);

  const imageScale = shouldReduceMotion
    ? 1
    : useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  return (
    <section className="relative isolate">
      {/* Scroll area that controls the sticky hero */}
      <div ref={targetRef} className="relative h-[210svh]">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden relative z-20">
          <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
            <Image
              src="/academic-plaza2.png"
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
              opacity: backdropOpacity,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.55) 32%, rgba(0,0,0,0) 70%)",
            }}
          />

          {/* Content reveals on scroll */}
          <motion.div
            className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-10 pt-10"
            style={{ opacity: contentOpacity, y: contentY }}
          >
            <div className="max-w-4xl mx-auto text-center space-y-5">
              <h1 className="text-white text-[22px] sm:text-[28px] md:text-[34px] leading-tight font-semibold tracking-tight">
                The fastest way to choose the learning environment for you.
              </h1>

              <p className="text-white/90 text-[12px] sm:text-[13px] md:text-[14px] tracking-wide px-6 py-3 rounded-full bg-black/60 inline-block">
                Compare teaching quality, research impact, and course workload in
                one elegant dashboard.
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
                    className="w-full sm:w-auto rounded-full border-white/60 text-white hover:bg-white/10 hover:text-white"
                  >
                    Browse courses
                  </Button>
                </Link>
              </div>

              <div className="pt-1 text-white/80 text-[11px] sm:text-[12px] tracking-wide">
                Search by course · View grade distributions · Student insights
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


