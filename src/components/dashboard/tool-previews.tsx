import React from "react";
import { Check, Lock } from "lucide-react";

/**
 * Small drawings of what each tool produces, built from the same pieces the
 * real pages use (code keycaps, GPA bars, grade colors). They are pictures of
 * the tool, not data, so none of them shows a figure.
 */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="relative h-28 overflow-hidden rounded-lg border border-border bg-canvas p-3"
    >
      {children}
    </div>
  );
}

function Line({ w, strong = false }: { w: string; strong?: boolean }) {
  return (
    <span
      className={`block h-1.5 rounded-full ${strong ? "bg-text-muted/60" : "bg-text-muted/25"}`}
      style={{ width: w }}
    />
  );
}

export function CoursesPreview() {
  const rows = [
    { code: "CSCE 120", w: "86%", top: true },
    { code: "MATH 151", w: "64%" },
    { code: "HIST 105", w: "74%" },
  ];
  return (
    <Frame>
      <div className="flex h-full flex-col justify-between">
        {rows.map((r) => (
          <div key={r.code} className="flex items-center gap-3">
            <span className="code-tag shrink-0">{r.code}</span>
            <span className="relative h-1.5 flex-1 rounded-full bg-raised">
              <span
                className={`absolute inset-y-0 left-0 rounded-full ${r.top ? "bg-accent" : "bg-text-muted/50"}`}
                style={{ width: r.w }}
              />
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function EasiestPreview() {
  const bars = [92, 78, 70, 58, 46, 34, 26];
  return (
    <Frame>
      <div className="flex h-full items-end gap-1.5 pt-5">
        {bars.map((h, i) => (
          <span
            key={i}
            className={`flex-1 rounded-t-sm ${i === 0 ? "bg-accent" : "bg-text-muted/35"}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <span className="absolute left-3 top-3 font-mono text-[11px] text-text-muted">
        easiest first
      </span>
    </Frame>
  );
}

export function UccPreview() {
  const groups = [
    "American History",
    "Communication",
    "Creative Arts",
    "Mathematics",
    "Life & Physical",
    "Social & Behavioral",
  ];
  return (
    <Frame>
      <div className="flex flex-wrap gap-1.5">
        {groups.map((g, i) => (
          <span
            key={g}
            className={`inline-flex h-6 items-center rounded-md border px-2 text-[11px] ${
              i === 3
                ? "border-accent bg-accent/10 text-text-heading"
                : "border-border bg-card text-text-body"
            }`}
          >
            {g}
          </span>
        ))}
      </div>
    </Frame>
  );
}

export function DepartmentsPreview() {
  const codes = ["CSCE", "ECEN", "MATH", "BIOL", "CHEM", "ENGR"];
  return (
    <Frame>
      <div className="grid h-full grid-cols-3 gap-1.5">
        {codes.map((c, i) => (
          <span
            key={c}
            className={`flex flex-col justify-between rounded-md border p-1.5 ${
              i === 0 ? "border-border-strong bg-raised" : "border-border bg-card"
            }`}
          >
            <span className="font-mono text-[11px] leading-none text-text-heading">{c}</span>
            <Line w={`${[70, 52, 84, 60, 44, 66][i]}%`} />
          </span>
        ))}
      </div>
    </Frame>
  );
}

export function ProfessorPreview() {
  return (
    <Frame>
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-raised font-mono text-xs text-text-heading">
          RT
        </span>
        <div className="flex-1 space-y-1.5">
          <Line w="58%" strong />
          <Line w="36%" />
        </div>
        <span className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-3 w-1.5 rounded-sm ${i < 4 ? "bg-accent" : "bg-text-muted/25"}`}
            />
          ))}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Clear lectures", "Tough grader", "Gives extra credit"].map((t) => (
          <span
            key={t}
            className="inline-flex h-6 items-center rounded-md border border-border bg-card px-2 text-[11px] text-text-body"
          >
            {t}
          </span>
        ))}
      </div>
    </Frame>
  );
}

export function ComparePreview() {
  const rows = [
    ["78%", "62%"],
    ["54%", "70%"],
    ["66%", "48%"],
  ];
  return (
    <Frame>
      <div className="grid h-full grid-cols-2 gap-3">
        {[0, 1].map((col) => (
          <div key={col} className="flex flex-col justify-between">
            <span className="code-tag self-start">{col === 0 ? "MATH 151" : "MATH 171"}</span>
            <div className="space-y-1.5">
              {rows.map((r, i) => {
                const mine = parseInt(r[col]);
                const other = parseInt(r[1 - col]);
                return (
                  <span key={i} className="relative block h-1.5 rounded-full bg-raised">
                    <span
                      className={`absolute inset-y-0 left-0 rounded-full ${mine > other ? "bg-accent" : "bg-text-muted/45"}`}
                      style={{ width: r[col] }}
                    />
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function FitPreview() {
  const days = ["M", "T", "W", "R", "F"];
  // [day, startRow, rows, kind]
  const blocks: [number, number, number, "busy" | "fit"][] = [
    [0, 0, 2, "busy"],
    [2, 0, 2, "busy"],
    [4, 0, 2, "busy"],
    [1, 2, 2, "fit"],
    [3, 2, 2, "fit"],
    [0, 3, 1, "busy"],
    [4, 3, 1, "busy"],
  ];
  return (
    <Frame>
      <div className="grid h-full grid-cols-5 gap-1.5">
        {days.map((d, di) => (
          <div key={d} className="flex flex-col">
            <span className="mb-1 text-center font-mono text-[11px] leading-none text-text-muted">{d}</span>
            <div className="relative flex-1 rounded-sm bg-raised/60">
              {blocks
                .filter(([day]) => day === di)
                .map(([, start, len, kind], i) => (
                  <span
                    key={i}
                    className={`absolute inset-x-0.5 rounded-sm ${
                      kind === "fit"
                        ? "bg-accent"
                        : "bg-[repeating-linear-gradient(135deg,var(--color-border-strong)_0_3px,transparent_3px_6px)]"
                    }`}
                    style={{ top: `${start * 25 + 2}%`, height: `${len * 25 - 4}%` }}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function PlannerPreview() {
  const rows = [
    { code: "MATH 151", state: "done" },
    { code: "MATH 152", state: "done" },
    { code: "MATH 251", state: "next" },
  ] as const;
  return (
    <Frame>
      <div className="relative flex h-full flex-col justify-between">
        <span className="absolute bottom-3 left-[9px] top-3 w-px bg-border-strong" />
        {rows.map((r) => (
          <div key={r.code} className="relative flex items-center gap-3">
            <span
              className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border ${
                r.state === "done"
                  ? "border-positive/40 bg-positive/15 text-positive"
                  : "border-border-strong bg-card text-text-muted"
              }`}
            >
              {r.state === "done" ? (
                <Check strokeWidth={2} className="h-3 w-3" />
              ) : (
                <Lock strokeWidth={1.5} className="h-2.5 w-2.5" />
              )}
            </span>
            <span className="code-tag">{r.code}</span>
            <Line w={r.state === "done" ? "40%" : "28%"} />
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function SeatAlertPreview() {
  return (
    <div aria-hidden className="space-y-2">
      <div className="flex items-center gap-3 rounded-lg border border-positive/30 bg-positive/10 px-3 py-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-positive" />
        <span className="text-sm text-text-heading">Seat opened</span>
        <span className="code-tag ml-auto">STAT 211</span>
        <span className="font-mono text-xs text-text-body">sec 503</span>
      </div>
      {[
        ["CSCE 313", "sec 502"],
        ["MATH 251", "sec 201"],
      ].map(([code, sec]) => (
        <div
          key={code}
          className="flex items-center gap-3 rounded-lg border border-border bg-canvas px-3 py-2.5"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-text-muted/40" />
          <span className="text-sm text-text-body">Watching</span>
          <span className="code-tag ml-auto">{code}</span>
          <span className="font-mono text-xs text-text-muted">{sec}</span>
        </div>
      ))}
    </div>
  );
}

export function ExtensionPreview() {
  return (
    <div aria-hidden className="rounded-lg border border-border bg-canvas p-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-text-muted/30" />
        <span className="h-2 w-2 rounded-full bg-text-muted/30" />
        <span className="h-2 w-2 rounded-full bg-text-muted/30" />
        <span className="ml-2 h-4 flex-1 rounded bg-raised" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="code-tag">CSCE 121</span>
        <span className="font-mono text-xs text-text-muted">501 · MWF</span>
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-md border border-accent/50 bg-accent/10 px-2 py-1.5">
        <span className="text-xs font-medium text-text-heading">AggieSB+</span>
        <Line w="30%" strong />
        <Line w="22%" />
      </div>
    </div>
  );
}
