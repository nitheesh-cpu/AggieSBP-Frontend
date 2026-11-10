"use client";

import React from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

/** `item` is the nav-click slug reported to analytics. */
type FooterLink = { label: string; href: string; item: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Support",
    links: [
      { label: "Report a bug", href: "https://tally.so/r/nWb6re", item: "report-a-bug", external: true },
      { label: "Request a feature", href: "https://tally.so/r/nWb6re", item: "request-a-feature", external: true },
    ],
  },
  {
    title: "Tools",
    links: [
      {
        label: "Chrome extension",
        href: "https://chromewebstore.google.com/detail/aggie-schedule-builder-pl/glckdcnecomhlmlegmjdceblibmaljpm",
        item: "chrome-extension",
        external: true,
      },
      { label: "API docs", href: "https://api-aggiesbp.nitheeshk.com/docs", item: "api-docs", external: true },
    ],
  },
  {
    title: "Website",
    links: [
      { label: "About", href: "/about", item: "about" },
      { label: "Terms", href: "/terms", item: "terms" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="border-t-2 border-accent-gold/70 bg-maroon-deep text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:px-6 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <span className="text-[17px] font-medium leading-none text-white">
            AggieSB<span className="text-accent-gold">+</span>
          </span>
          <p className="mt-3 text-sm text-white/70">
            Grades, professor reviews and seat alerts for Texas A&amp;M courses
          </p>
          <p className="mt-4 font-[family-name:var(--font-press-start-2p)] text-[10px] leading-4 text-accent-gold/80">
            Gig &apos;em
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 sm:gap-12">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium text-accent-gold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      prefetch={link.external ? undefined : false}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      onClick={() => track("nav-click", { item: link.item, from: "footer" })}
                      className="text-sm text-white/75 transition-colors duration-150 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};
