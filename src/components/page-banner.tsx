import React from "react";
import Image from "next/image";

type PageBannerProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Search box or actions that belong to the page header */
  children?: React.ReactNode;
  /** Right-hand slot on wide screens (e.g. Reveille) */
  aside?: React.ReactNode;
};

/**
 * Page header shared by the list and tool pages: the Academic Plaza painting
 * under an Aggie maroon overlay, with a white title.
 * It sits directly under the fixed nav, so pages render it before their
 * padded content.
 */
export function PageBanner({ title, subtitle, children, aside }: PageBannerProps) {
  return (
    <section className="relative isolate overflow-hidden bg-maroon-band pt-14 text-white">
      <Image
        src="/academic-plaza-desktop.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[50%_32%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(80,0,0,0.97)_0%,rgba(80,0,0,0.9)_40%,rgba(80,0,0,0.66)_100%)] dark:bg-[linear-gradient(90deg,rgba(92,15,30,0.95)_0%,rgba(92,15,30,0.86)_40%,rgba(92,15,30,0.55)_100%)]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-accent-gold/60" />

      <div className="mx-auto flex max-w-7xl items-end justify-between gap-8 px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-12">
        <div className="min-w-0 max-w-3xl flex-1">
          <h1 className="text-[32px]font-medium leading-tight tracking-[-0.01em] text-white sm:text-[40px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-2xl text-base leading-6 text-white/80 sm:text-lg sm:leading-7">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-6 max-w-2xl">{children}</div>}
        </div>
        {aside && <div className="hidden shrink-0 md:block">{aside}</div>}
      </div>
    </section>
  );
}
