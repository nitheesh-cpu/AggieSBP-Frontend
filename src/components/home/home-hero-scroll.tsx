"use client";

import { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowRight, BellRing, CheckCircle2 } from "lucide-react";

import { GlobalOmnibar } from "@/components/home/global-omnibar";
import { ExtensionButton } from "@/components/home/home-features";
import { useExtensionLink } from "@/components/home/home-shared";
import { track } from "@/lib/analytics";

const WATCHING = [
  { code: "CSCE 313", section: "Section 502" },
  { code: "MATH 251", section: "Section 201" },
];

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
            <GlobalOmnibar analyticsFrom="home" />
          </div>
          {/* Extensions only install on desktop browsers, so touch devices skip this */}
          <div className="mt-5 hidden flex-wrap items-center gap-x-4 gap-y-2 pointer-fine:flex">
            <ExtensionButton link={extension} cta="hero-extension" from="home-hero" />
            <p className="text-sm text-text-body">
              Ratings and grades inside College Scheduler
            </p>
          </div>
        </div>

        <div className="w-full min-w-0 max-w-[35rem] lg:max-w-none">
          <div className="rounded-2xl border border-border-strong bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <BellRing
                  strokeWidth={1.5}
                  className="h-[18px] w-[18px] shrink-0 text-text-muted"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-medium text-text-heading">
                    Seat alerts
                  </p>
                  <p className="text-xs text-text-muted">3 sections watched</p>
                </div>
              </div>
              <span className="flex items-center gap-2 font-mono text-xs text-text-muted">
                <span className="h-2 w-2 rounded-full bg-positive" aria-hidden />
                Checking
              </span>
            </div>

            <div className="space-y-2" aria-label="Example seat alerts">
              <div className="rounded-xl border border-positive/30 bg-positive/10 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    strokeWidth={1.5}
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 text-positive"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-heading">
                      A seat just opened
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-body">
                      <span className="code-tag">STAT 211</span>
                      Section 503 · CRN 48213
                    </p>
                  </div>
                </div>
              </div>
              {WATCHING.map((row) => (
                <div
                  key={row.code}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-canvas px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm text-text-body">
                    <span className="code-tag">{row.code}</span>
                    {row.section}
                  </div>
                  <span className="text-xs text-text-muted">Watching</span>
                </div>
              ))}
            </div>

            <Link
              href="/alerts"
              onClick={() => track("home-cta", { cta: "hero-alerts" })}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px"
            >
              Set up seat alerts
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <p className="mt-3 text-center text-xs text-text-muted">
              Get notified the moment a seat opens
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
