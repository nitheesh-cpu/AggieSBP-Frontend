"use client";

import React from "react";
import type { Term } from "@/lib/api";
import { sortTermsForMenu } from "@/lib/terms";

/**
 * Term picker shared by course and professor pages. College Station terms are
 * listed first; other campuses and session types sit in a second group.
 * Wraps under its label on narrow screens instead of pushing the page wider.
 */
export function TermSelect({
  id,
  label,
  terms,
  value,
  onChange,
  allTermsLabel,
  className = "",
}: {
  id: string;
  label: string;
  terms: Term[];
  value: string;
  onChange: (termCode: string) => void;
  /** When set, adds an "all terms" option with an empty value. */
  allTermsLabel?: string;
  className?: string;
}) {
  const { main, other } = sortTermsForMenu(terms);
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`}>
      <label
        htmlFor={id}
        className="text-sm font-semibold text-text-heading dark:text-white"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 sm:w-auto sm:max-w-xs bg-canvas border border-border rounded-xl px-4 py-2 text-text-body dark:bg-black/45 dark:border-white/15 dark:text-white/90 dark:backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
      >
        {allTermsLabel && <option value="">{allTermsLabel}</option>}
        {main.length > 0 && (
          <optgroup label="College Station">
            {main.map((term) => (
              <option key={term.termCode} value={term.termCode}>
                {term.termDesc.replace(/\s*-\s*College Station/i, "")}
              </option>
            ))}
          </optgroup>
        )}
        {other.length > 0 && (
          <optgroup label="Other campuses and sessions">
            {other.map((term) => (
              <option key={term.termCode} value={term.termCode}>
                {term.termDesc}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
}
