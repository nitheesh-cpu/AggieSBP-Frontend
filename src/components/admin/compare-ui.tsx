"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/*
 * Side-by-side comparison helpers shared by the admin review pages
 * (professor merges, instructor links): mark where two names differ, flag
 * thin rating counts, and highlight course codes that both sides share.
 */

type TokenState = "same" | "partial" | "differs";

const clean = (token: string) => token.toLowerCase().replace(/[^a-z]/g, "");

/** Each word of `name`, marked by whether `other` has it. */
export function compareNames(name: string, other: string) {
  const others = other
    .split(/[\s-]+/)
    .map(clean)
    .filter(Boolean);
  return name
    .split(/(\s+)/)
    .filter(Boolean)
    .map((text) => {
      if (/^\s+$/.test(text)) return { text, state: "space" as const };
      const parts = text.split("-").map(clean).filter(Boolean);
      if (!parts.length) return { text, state: "same" as TokenState };
      const states = parts.map((c): TokenState => {
        if (others.includes(c)) return "same";
        // An initial ("G." for Gwan), a shortened name ("Josh" for Joshua).
        const partial = others.some(
          (o) =>
            (c.length === 1 && o.startsWith(c)) ||
            (o.length === 1 && c.startsWith(o)) ||
            (Math.min(c.length, o.length) >= 3 &&
              (o.startsWith(c) || c.startsWith(o))),
        );
        return partial ? "partial" : "differs";
      });
      const state: TokenState = states.every((s) => s === "same")
        ? "same"
        : states.some((s) => s === "differs") &&
            !states.some((s) => s === "same")
          ? "differs"
          : "partial";
      return { text, state };
    });
}

/** "FURTH HOWARD" against "Howard Furth": the same two words, reversed. */
export function namesSwapped(a: string, b: string) {
  const x = a.split(/\s+/).map(clean).filter(Boolean);
  const y = b.split(/\s+/).map(clean).filter(Boolean);
  if (x.length < 2 || y.length < 2) return false;
  const [xf, xl] = [x[0], x[x.length - 1]];
  const [yf, yl] = [y[0], y[y.length - 1]];
  return xf !== xl && xf === yl && xl === yf;
}

/** A name with the words the other name lacks highlighted. */
export function MarkedName({
  name,
  other,
  className = "",
}: {
  name: string;
  other: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {compareNames(name, other).map((token, i) =>
        token.state === "space" ? (
          <span key={i}>{token.text}</span>
        ) : token.state === "same" ? (
          <span key={i}>{token.text}</span>
        ) : token.state === "partial" ? (
          <span
            key={i}
            title="Only partly matches the other name (initial or shortened)"
            className="underline decoration-amber-600 decoration-dotted decoration-2 underline-offset-4 dark:decoration-amber-400"
          >
            {token.text}
            <span className="sr-only"> (partial match)</span>
          </span>
        ) : (
          <mark
            key={i}
            title="Not in the other name"
            className="rounded bg-amber-200/70 px-0.5 text-inherit dark:bg-amber-500/25"
          >
            {token.text}
            <span className="sr-only"> (differs)</span>
          </mark>
        ),
      )}
    </span>
  );
}

/** The legend for MarkedName and CourseChip. */
export function CompareLegend() {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
      <span>
        <mark className="rounded bg-amber-200/70 px-1 text-text-heading dark:bg-amber-500/25">
          Name
        </mark>{" "}
        not in the other name
      </span>
      <span>
        <span className="underline decoration-amber-600 decoration-dotted decoration-2 underline-offset-4 dark:decoration-amber-400">
          Name
        </span>{" "}
        initial or shortened
      </span>
      <span>
        <span className="rounded border border-emerald-600/40 bg-emerald-50 px-1 font-mono text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          CSCE
        </span>{" "}
        subject on both sides
      </span>
    </p>
  );
}

/** Rating count, flagged when there is too little to compare. */
export function RatingCount({
  count,
  average,
}: {
  count: number | null;
  average?: number | null;
}) {
  const n = count ?? 0;
  const tone =
    n === 0
      ? "border-red-600/40 text-red-700 dark:text-red-300"
      : n < 3
        ? "border-amber-600/40 text-amber-800 dark:text-amber-300"
        : "border-border text-text-body";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap ${tone}`}
    >
      {n === 0
        ? "No ratings"
        : `${n.toLocaleString()} ${n === 1 ? "rating" : "ratings"}`}
      {n > 0 && average != null && (
        <span className="text-text-muted">· {average.toFixed(1)} avg</span>
      )}
      {n > 0 && n < 3 && <span className="sr-only">(few ratings)</span>}
    </span>
  );
}

export const subjectOf = (code: string) =>
  /^[A-Z]+/.exec(code.replace(/\s+/g, "").toUpperCase())?.[0] ?? code;

/** A course code or subject, green when the other side has the subject too. */
export function CourseChip({
  code,
  shared,
  href,
}: {
  code: string;
  shared: boolean;
  href?: string;
}) {
  const className = `inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-xs ${
    shared
      ? "border-emerald-600/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
      : "border-border text-text-body"
  }`;
  const label = (
    <>
      {code}
      {shared && <span className="sr-only"> (shared)</span>}
    </>
  );
  return href ? (
    <a
      href={href}
      className={`${className} hover:underline focus-visible:outline-2 focus-visible:outline-ring`}
    >
      {label}
    </a>
  ) : (
    <span className={className}>{label}</span>
  );
}

const CODE = /\b([A-Z]{4}\s?\d{3}[A-Z]?|[A-Z]{4})\b/g;

/** Evidence text with course codes and subjects set off, shared ones green. */
export function EvidenceText({
  text,
  sharedSubjects,
}: {
  text: string;
  sharedSubjects: Set<string>;
}) {
  const parts = text.split(CODE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <CourseChip
            key={i}
            code={part}
            shared={sharedSubjects.has(subjectOf(part))}
          />
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/**
 * A button that asks once more before acting, for actions that touch many
 * items at once. The second click within a few seconds does it.
 */
export function ConfirmStepButton({
  label,
  confirmLabel,
  onConfirm,
  disabled,
  variant = "default",
  icon,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  icon?: React.ReactNode;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 6000);
    return () => window.clearTimeout(timer);
  }, [armed]);
  useEffect(() => {
    if (disabled) setArmed(false);
  }, [disabled]);

  if (!armed)
    return (
      <Button
        size="sm"
        variant={variant}
        disabled={disabled}
        onClick={() => setArmed(true)}
        className="gap-1.5"
      >
        {icon}
        {label}
      </Button>
    );
  return (
    <span className="inline-flex items-center gap-2" role="group">
      <Button
        size="sm"
        variant={variant}
        disabled={disabled}
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
        className="gap-1.5 ring-2 ring-amber-500 ring-offset-1 ring-offset-canvas"
        autoFocus
      >
        {icon}
        {confirmLabel}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setArmed(false)}>
        Cancel
      </Button>
    </span>
  );
}
