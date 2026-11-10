"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Chrome,
  GitCompare,
  Puzzle,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  EXTENSIONS,
  gradedProfessors,
  useExampleCourse,
  useExtensionLink,
  type ExtensionLink,
} from "@/components/home/home-shared";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

/** The gold install button, also used in the hero. */
export function ExtensionButton({
  link,
  cta,
  className,
}: {
  link: ExtensionLink | null;
  /** home-cta slug reported on click. */
  cta: string;
  className?: string;
}) {
  const classes = cn(
    "inline-flex h-11 items-center gap-2 rounded-lg bg-accent-gold px-5 text-sm font-medium text-[#1d1305] transition-[background-color,transform] duration-150 hover:bg-accent-gold/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold active:translate-y-px",
    className,
  );

  // Hold the button's space until we know which browser this is
  if (!link) {
    return (
      <span aria-hidden className={cn(classes, "invisible")}>
        <Chrome className="h-4 w-4" />
        Add to Chrome · Free
      </span>
    );
  }

  const Icon = link.browser === "firefox" ? Puzzle : Chrome;
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("home-cta", { cta })}
      className={classes}
    >
      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      {link.label}
      <span className="font-normal text-[#1d1305]/65">· Free</span>
      <span className="sr-only">(opens the extension store)</span>
    </a>
  );
}

const EXTENSION_POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Users,
    title: "Every professor in one panel",
    body: "Ratings, grade distributions and an AI summary of student reviews for each professor teaching the course.",
  },
  {
    icon: BellRing,
    title: "Watch full sections",
    body: "Click Watch on a full section and get a notification the moment a seat opens.",
  },
  {
    icon: GitCompare,
    title: "Compare in one click",
    body: "Send any professors to a side-by-side comparison.",
  },
];

function SectionHeading({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <h2 className="max-w-[20ch] text-[28px] font-medium leading-tight tracking-[-0.02em] text-text-heading sm:text-[32px] lg:text-[40px]">
        {title}
      </h2>
      <p className="mt-4 max-w-[34rem] text-base leading-7 text-text-body">
        {children}
      </p>
    </>
  );
}

export function ExtensionFeature() {
  const link = useExtensionLink();
  // Secondary link to the store for the other browser
  const other =
    link?.browser === "firefox" ? EXTENSIONS.chrome : EXTENSIONS.firefox;

  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div className="min-w-0">
          <SectionHeading title="Pick sections without leaving College Scheduler">
            The AggieSB+ extension adds a professor panel to Texas
            A&amp;M&apos;s registration site, so the data is there while you
            build your schedule.
          </SectionHeading>

          <ul className="mt-8 space-y-5">
            {EXTENSION_POINTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-raised">
                  <Icon
                    strokeWidth={1.75}
                    className="h-4 w-4 text-accent"
                    aria-hidden
                  />
                </span>
                <div>
                  <h3 className="text-sm font-medium text-text-heading">
                    {title}
                  </h3>
                  <p className="mt-0.5 max-w-[30rem] text-sm leading-6 text-text-body">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Extensions only install on desktop browsers */}
          <div className="mt-9 hidden flex-wrap items-center gap-x-5 gap-y-3 pointer-fine:flex">
            <ExtensionButton link={link} cta="extension" />
            <a
              href={other.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("home-cta", { cta: "extension-other-browser" })}
              className={cn(
                "text-sm text-text-body underline-offset-4 hover:text-text-heading hover:underline",
                !link && "invisible",
              )}
            >
              {other.label.replace("Add to", "Also on")}
            </a>
          </div>
          <p className="mt-8 text-sm text-text-muted pointer-fine:hidden">
            Available for Chrome and Firefox on a computer.
          </p>
        </div>

        <ExtensionPreview />
      </div>
    </section>
  );
}

/**
 * A drawing of the extension's professor panel over College Scheduler, filled
 * with the real CSCE 120 professors.
 */
function ExtensionPreview() {
  const course = useExampleCourse();
  const professors = gradedProfessors(course).slice(0, 3);

  return (
    <figure
      aria-label="The AggieSB+ professor panel open in College Scheduler for CSCE 120"
      className="min-w-0 overflow-hidden rounded-2xl border border-border-strong bg-card"
    >
      <div aria-hidden className="flex h-9 items-end gap-1 bg-maroon-band px-4">
        <span className="rounded-t-md bg-card px-3 py-1.5 text-[11px] leading-none text-text-heading">
          Build Schedule
        </span>
        <span className="px-3 py-1.5 text-[11px] leading-none text-white/75">
          Shopping Cart
        </span>
      </div>

      <div
        aria-hidden
        className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]"
      >
        {/* Registration table, kept abstract */}
        <div className="hidden min-w-0 p-5 sm:block">
          <p className="font-mono text-sm text-text-heading">CSCE 120</p>
          <p className="mt-0.5 text-xs text-text-muted">
            Program Design and Concepts
          </p>
          <div className="mt-4 divide-y divide-border rounded-lg border border-border">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center gap-3 px-3 py-3">
                <span className="h-2 w-8 rounded-full bg-raised" />
                <span className="h-2 flex-1 rounded-full bg-raised" />
                {row === 1 ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-accent/50 px-2 py-1 text-[11px] leading-none text-accent">
                    <BellRing className="h-3 w-3" aria-hidden />
                    Watch
                  </span>
                ) : (
                  <span className="h-2 w-10 rounded-full bg-raised" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* The panel the extension adds */}
        <div className="min-w-0 border-border bg-canvas/60 p-4 sm:border-l">
          <p className="flex items-center gap-2 text-xs font-medium text-text-heading">
            <Users className="h-3.5 w-3.5 text-accent" aria-hidden />
            Course professors
          </p>
          <ul className="mt-3 space-y-2">
            {(professors.length ? professors : [null, null, null]).map(
              (prof, i) => (
                <li
                  key={prof?.name ?? i}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  {prof?.gradeDistribution ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium text-text-heading">
                          {prof.name}
                        </span>
                        {prof.overallRating != null && (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-accent-gold px-1.5 py-0.5 font-mono text-[11px] leading-none text-[#1d1305]">
                            <Star
                              className="h-2.5 w-2.5 fill-current"
                              aria-hidden
                            />
                            {prof.overallRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <GradeBar distribution={prof.gradeDistribution} />
                    </>
                  ) : (
                    <>
                      <span className="block h-2.5 w-24 rounded-full bg-raised" />
                      <span className="mt-3 block h-1.5 rounded-full bg-raised" />
                    </>
                  )}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </figure>
  );
}

function GradeBar({
  distribution,
}: {
  distribution: { A: number; B: number; C: number; D: number; F: number };
}) {
  const { A, B, C, D, F } = distribution;
  const segments = [
    { value: A, className: "bg-positive" },
    { value: B, className: "bg-positive/50" },
    { value: C, className: "bg-caution" },
    { value: D + F, className: "bg-negative" },
  ];
  return (
    <>
      <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-raised">
        {segments.map((s, i) => (
          <span
            key={i}
            className={s.className}
            style={{ width: `${s.value}%` }}
          />
        ))}
      </div>
      <p className="mt-1.5 font-mono text-[11px] text-text-muted">
        A {A}% · B {B}% · C {C}%
      </p>
    </>
  );
}

const ALERT_STEPS = [
  "Find a full section on College Scheduler or any course page",
  "Click Watch",
  "Turn on notifications once, on your phone or computer",
];

export function SeatAlertsFeature() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
        <div className="min-w-0 lg:order-2">
          <SectionHeading title="Know the moment a seat opens">
            Watch a full section and AggieSB+ checks it for you. No more
            refreshing the registration page.
          </SectionHeading>

          <ol className="mt-8 space-y-3">
            {ALERT_STEPS.map((step, i) => (
              <li
                key={step}
                className="flex items-baseline gap-3 text-sm text-text-body"
              >
                <span className="font-mono text-xs text-text-muted">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <Link
            href="/alerts"
            onClick={() => track("home-cta", { cta: "alerts" })}
            className="mt-9 inline-flex h-11 items-center gap-2 rounded-lg border border-border-strong bg-card px-5 text-sm font-medium text-text-heading transition-colors duration-150 hover:border-accent hover:bg-raised"
          >
            Set up seat alerts
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div
          aria-hidden
          className="relative isolate grid min-h-72 place-items-center overflow-hidden rounded-2xl bg-maroon-band px-6 py-14 lg:order-1"
        >
          <Image
            src="/academic-plaza-desktop.jpeg"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="-z-10 object-cover object-[50%_30%] opacity-25"
          />
          <div className="w-full max-w-sm">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
              <div className="flex items-center gap-2 text-[11px] text-text-muted">
                <span className="grid h-5 w-5 place-items-center rounded bg-accent-gold text-[#1d1305]">
                  <BellRing className="h-3 w-3" strokeWidth={2.25} />
                </span>
                AggieSB+
                <span className="ml-auto">now</span>
              </div>
              <p className="mt-2 text-sm font-medium text-text-heading">
                Seat open in CSCE 120
              </p>
              <p className="mt-0.5 text-sm leading-5 text-text-body">
                A seat just opened in a section you&apos;re watching. Register
                before it fills.
              </p>
            </div>
            <div className="mx-4 h-3 rounded-b-2xl border border-t-0 border-border bg-card/70" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* Small drawings of each tool, shown on wide screens only */

function RankedGraphic() {
  return (
    <div className="space-y-3.5">
      {[94, 86, 79, 71, 64].map((width, i) => (
        <div key={width} className="flex items-center gap-3">
          <span className="w-3 font-mono text-[11px] text-text-muted">{i + 1}</span>
          <span className="h-2 w-14 shrink-0 rounded-full bg-border-strong/60" />
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-raised">
            <span
              className="block h-full rounded-full bg-positive transition-[width] duration-300 ease-out group-hover:w-full"
              style={{ width: `${width}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

const UCC_TILES = ["COMM", "MATH", "SCI", "LPC", "ARTS", "HIST"];

function CoreGraphic() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {UCC_TILES.map((label, i) => (
        <div
          key={label}
          className={cn(
            "rounded-md border px-2.5 py-3 transition-colors duration-150",
            i === 1
              ? "border-accent/60 bg-card"
              : "border-border bg-card group-hover:border-border-strong",
          )}
        >
          <span
            className={cn(
              "block font-mono text-[10px]",
              i === 1 ? "text-accent" : "text-text-muted",
            )}
          >
            {label}
          </span>
          <span className="mt-2.5 block h-1.5 rounded-full bg-raised">
            <span
              className={cn(
                "block h-full rounded-full",
                i === 1 ? "bg-accent" : "bg-border-strong/70",
              )}
              style={{ width: `${[62, 88, 54, 70, 80, 46][i]}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function CompareGraphic() {
  const sides = [
    [82, 58, 74, 66, 88],
    [64, 80, 52, 78, 60],
  ];
  return (
    <div className="relative grid grid-cols-2 gap-6">
      {sides.map((bars, side) => (
        <div key={side} className="rounded-md border border-border bg-card p-3.5">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-raised" />
            <span className="h-2 w-12 rounded-full bg-border-strong/60" />
          </div>
          <div className="mt-4 space-y-3">
            {bars.map((width, i) => (
              <span key={i} className="block h-1.5 rounded-full bg-raised">
                <span
                  className={cn(
                    "block h-full rounded-full",
                    side === 0 ? "bg-accent" : "bg-positive",
                  )}
                  style={{ width: `${width}%` }}
                />
              </span>
            ))}
          </div>
        </div>
      ))}
      <span className="absolute left-1/2 top-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-canvas font-mono text-[10px] text-text-muted">
        vs
      </span>
    </div>
  );
}

const MORE_TOOLS = [
  {
    name: "Easiest courses",
    href: "/discover/dept",
    cta: "easiest",
    description: "Highest-GPA courses in each department",
    graphic: RankedGraphic,
  },
  {
    name: "Core curriculum",
    href: "/discover/ucc",
    cta: "ucc",
    description: "UCC courses ranked by GPA and difficulty",
    graphic: CoreGraphic,
  },
  {
    name: "Compare",
    href: "/compare",
    cta: "compare",
    description: "Courses or professors side by side",
    graphic: CompareGraphic,
  },
];

export function MoreTools() {
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Image
            src="/pixel-reveille.png"
            alt=""
            width={96}
            height={96}
            className="h-14 w-14 shrink-0 object-contain"
            style={{ imageRendering: "pixelated" }}
          />
          <h2 className="text-xl font-medium text-text-heading">
            More ways to choose classes
          </h2>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {MORE_TOOLS.map(({ name, href, cta, description, graphic: Graphic }) => (
            <li key={name}>
              <Link
                href={href}
                onClick={() => track("home-cta", { cta })}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-150 hover:border-border-strong lg:hover:bg-card max-lg:hover:bg-raised"
              >
                <div
                  aria-hidden
                  className="hidden h-52 flex-col justify-center border-b border-border bg-canvas px-6 lg:flex"
                >
                  <Graphic />
                </div>
                <div className="flex flex-1 items-center justify-between gap-4 px-4 py-4 lg:px-5">
                  <span>
                    <span className="block text-sm font-medium text-text-heading">
                      {name}
                    </span>
                    <span className="mt-0.5 block text-sm text-text-body">
                      {description}
                    </span>
                  </span>
                  <ArrowRight
                    strokeWidth={1.5}
                    className="h-4 w-4 shrink-0 text-text-muted transition-[transform,color] duration-150 group-hover:translate-x-0.5 group-hover:text-text-heading"
                    aria-hidden
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
