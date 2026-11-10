"use client";

import React from "react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

import { GlobalOmnibar } from "@/components/home/global-omnibar";
import { ExtensionButton } from "@/components/home/home-features";
import {
  gradedProfessors,
  useExampleCourse,
  useExtensionLink,
} from "@/components/home/home-shared";

const EXAMPLE_CODE = "CSCE 120";
const EXAMPLE_PATH = "/course/CSCE120";
const GRADES = ["A", "B", "C", "D", "F"] as const;
const ROTATE_MS = 4000;

const imageProps = {
  alt: "",
  fill: true,
  sizes: "100vw",
  loading: "eager" as const,
  fetchPriority: "high" as const,
};
const { props: desktopImage } = getImageProps({
  ...imageProps,
  src: "/academic-plaza-desktop.jpeg",
});
const { props: portraitImage } = getImageProps({
  ...imageProps,
  src: "/academic-plaza-mobile.jpeg",
});

export function HomeHeroScroll() {
  const extension = useExtensionLink();
  const course = useExampleCourse();
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  // Rotate through every CSCE 120 professor with grade data.
  const professors = React.useMemo(() => gradedProfessors(course), [course]);
  const professor = professors.length
    ? professors[index % professors.length]
    : undefined;
  const distribution = professor?.gradeDistribution;
  const rating = professor?.overallRating;

  // Advance to the next professor every few seconds; hold while the card is
  // hovered or focused so it doesn't change under the reader.
  React.useEffect(() => {
    if (professors.length < 2 || paused) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % professors.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [professors.length, paused]);

  return (
    <section className="relative isolate min-h-[min(100svh,1100px)] bg-canvas">
      <picture className="pointer-events-none absolute inset-0 -z-20">
        <source
          media="(orientation: portrait)"
          srcSet={portraitImage.srcSet}
          sizes={portraitImage.sizes}
        />
        <img
          {...desktopImage}
          className="object-cover object-[50%_34%] lg:object-[60%_35%]"
        />
      </picture>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-canvas)_150px,color-mix(in_srgb,var(--color-canvas)_90%,transparent)_250px,transparent_420px,transparent_calc(100%_-_140px),var(--color-canvas)_100%)] sm:bg-[linear-gradient(to_bottom,var(--color-canvas)_300px,color-mix(in_srgb,var(--color-canvas)_90%,transparent)_420px,transparent_600px,transparent_calc(100%_-_140px),var(--color-canvas)_100%)] lg:bg-[linear-gradient(to_right,var(--color-canvas)_0%,color-mix(in_srgb,var(--color-canvas)_95%,transparent)_30%,color-mix(in_srgb,var(--color-canvas)_76%,transparent)_47%,transparent_75%)]"
      />
      <div className="mx-auto grid min-h-[min(100svh,1100px)] max-w-7xl content-start gap-6 px-4 pb-14 pt-24 sm:px-6 sm:pt-28 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:content-center lg:items-center lg:gap-12 lg:pb-20 lg:pt-28 xl:gap-24">
        <div className="min-w-0">
          <h1 className="max-w-[14ch] text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.03em] text-text-heading">
            Course search for Texas A&amp;M
          </h1>
          <p className="mt-4 max-w-[31rem] text-base leading-6 text-text-body sm:text-lg sm:leading-7">
            Compare official grade distributions and professor ratings. Get
            alerts when a seat opens.
          </p>
          <div className="relative z-10 mt-5 max-w-[35rem] sm:mt-7">
            <GlobalOmnibar />
          </div>
          {/* Extensions only install on desktop browsers, so touch devices skip this */}
          <div className="mt-5 hidden flex-wrap items-center gap-x-4 gap-y-2 pointer-fine:flex">
            <ExtensionButton link={extension} />
            <p className="text-sm text-text-body">
              Ratings and grades inside College Scheduler
            </p>
          </div>
        </div>

        <Link
          href={EXAMPLE_PATH}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="group hidden min-w-0 max-w-[35rem] rounded-2xl lg:block border border-border-strong bg-card p-4 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:translate-y-0 motion-reduce:transform-none sm:p-6 lg:max-w-none"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="code-tag">{EXAMPLE_CODE}</span>
            <ArrowRight className="h-5 w-5 shrink-0 text-accent" aria-hidden />
          </div>
          <h2 className="mt-2 text-lg font-medium leading-tight text-text-heading">
            {course?.name || "Program Design and Concepts"}
          </h2>
          <div className="mt-3 min-h-20">
            {distribution && professor ? (
              <MotionConfig reducedMotion="user">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={professor.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-text-body">
                      <span>{professor.name}</span>
                      {rating != null && (
                        <span className="font-medium text-text-heading">
                          {rating.toFixed(1)}/5 professor rating
                        </span>
                      )}
                    </div>
                    <p className="mt-3 flex justify-between gap-3 text-xs text-text-muted">
                      <span>Grade distribution</span>
                      {professors.length > 1 && (
                        <span className="font-mono" aria-hidden>
                          {(index % professors.length) + 1}/{professors.length}{" "}
                          profs
                        </span>
                      )}
                    </p>
                    <ul
                      aria-label="Grade percentages"
                      className="mt-2 grid grid-cols-5 gap-2"
                    >
                      {GRADES.map((grade) => (
                        <li key={grade} className="min-w-0">
                          <div
                            className="h-1.5 overflow-hidden rounded-full bg-raised"
                            aria-hidden
                          >
                            <div
                              className="h-full rounded-full bg-accent"
                              style={{ width: `${distribution[grade]}%` }}
                            />
                          </div>
                          <div className="mt-1 flex flex-wrap items-baseline gap-x-1 text-xs">
                            <span className="text-text-body">{grade}</span>
                            <span className="font-mono text-text-heading">
                              {distribution[grade]}%
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </MotionConfig>
            ) : (
              <p className="text-sm text-text-body">
                {course === undefined
                  ? "Loading grade data…"
                  : "View grade data and professors"}
              </p>
            )}
          </div>
        </Link>
      </div>
    </section>
  );
}
