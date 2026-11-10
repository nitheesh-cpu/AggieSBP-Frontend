"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Maximize2, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEligibility } from "@/hooks/use-eligibility";
import {
  buildChart,
  chainOf,
  CREDIT_COLUMN,
  UNSCHEDULED_COLUMN,
  type ChartEdge,
} from "@/lib/planner/flowchart";
import type { CourseState } from "@/lib/planner/find";
import { activeBuckets, activeWatchlist, type DegreePlan } from "@/lib/planner/plan";
import {
  activeCourses,
  courseId,
  currentTermKey,
  nextTermKey,
  termLabel,
  type AcademicRecord,
} from "@/lib/planner/record";
import { cn } from "@/lib/utils";

const BOX: Record<CourseState, string> = {
  done: "border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950",
  in_progress: "border-teal-500/60 bg-teal-50 dark:bg-teal-950",
  planned: "border-sky-500/60 bg-sky-50 dark:bg-sky-950",
  ready: "border-emerald-500/60 border-dashed bg-white dark:bg-card",
  maybe: "border-amber-500/60 border-dashed bg-amber-50 dark:bg-amber-950",
  one_away: "border-orange-500/60 border-dashed bg-orange-50 dark:bg-orange-950",
  locked: "border-neutral-400/60 border-dashed bg-neutral-100 dark:bg-neutral-800",
  pending: "border-border border-dashed bg-white dark:bg-card",
};

const LEGEND: { state: CourseState; label: string }[] = [
  { state: "done", label: "Done" },
  { state: "in_progress", label: "In progress" },
  { state: "planned", label: "Planned" },
  { state: "ready", label: "Not scheduled, can take" },
  { state: "one_away", label: "Not scheduled, 1 course away" },
  { state: "locked", label: "Not scheduled, locked" },
];

const EDGE_STYLE: Record<ChartEdge["kind"] | "outOfOrder", { stroke: string; dash?: string; label: string }> = {
  required: { stroke: "#64748b", label: "Required prerequisite" },
  one_of: { stroke: "#8b5cf6", dash: "6 4", label: "One of several options" },
  coreq: { stroke: "#14b8a6", dash: "2 4", label: "Can be taken the same term" },
  outOfOrder: { stroke: "#dc2626", label: "Planned before its prerequisite" },
};

function columnLabel(key: string): string {
  if (key === CREDIT_COLUMN) return "Transfer & test credit";
  if (key === UNSCHEDULED_COLUMN) return "Not scheduled yet";
  return termLabel(key);
}

interface DrawnEdge {
  edge: ChartEdge;
  d: string;
}

/**
 * Courses by term with prerequisite arrows, like a department flowchart.
 * Hover or click a course to trace what it needs and what it unlocks.
 */
export function Flowchart({ record, plan }: { record: AcademicRecord; plan: DegreePlan }) {
  const [includePlan, setIncludePlan] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const focus = pinned ?? hovered;

  // Only courses that are really part of the plan: the watchlist, and groups
  // where every option is needed. A "pick 3 of 19" list is just possibilities.
  const planCodes = useMemo(
    () => [
      ...new Set([
        ...activeBuckets(plan)
          .filter((b) => b.options.length > 0 && b.pick >= b.options.length)
          .flatMap((b) => b.options.flatMap((o) => o.courses)),
        ...activeWatchlist(plan).map((w) => w.code),
      ]),
    ],
    [plan],
  );
  const extra = useMemo(() => (includePlan ? planCodes : []), [includePlan, planCodes]);
  const codes = useMemo(
    () => [...new Set([...activeCourses(record).map((c) => c.code), ...extra])],
    [record, extra],
  );
  const current = currentTermKey();
  // Unscheduled courses are judged for the next term.
  const { info, standing, loading } = useEligibility(record, codes, nextTermKey(current));

  const chart = useMemo(
    () => buildChart(record, info, { currentTerm: current, extra }),
    [record, info, current, extra],
  );
  const chain = useMemo(() => (focus ? chainOf(chart.edges, focus) : null), [chart, focus]);
  const outOfOrder = chart.edges.filter((e) => e.outOfOrder);

  // Arrows are drawn over the columns once the boxes have been laid out.
  const containerRef = useRef<HTMLDivElement>(null);
  const boxes = useRef(new Map<string, HTMLElement>());
  const [drawn, setDrawn] = useState<{ edges: DrawnEdge[]; width: number; height: number }>({
    edges: [],
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const edges: DrawnEdge[] = [];
      for (const edge of chart.edges) {
        const a = boxRect(boxes.current.get(edge.from), container);
        const b = boxRect(boxes.current.get(edge.to), container);
        if (!a || !b) continue;
        const x1 = a.left + a.width;
        const y1 = a.top + a.height / 2;
        const x2 = b.left;
        const y2 = b.top + b.height / 2;
        // Forward edges bend gently; same-column or backward ones loop around.
        const pull = x2 > x1 ? Math.max(24, (x2 - x1) / 2) : 48;
        edges.push({ edge, d: `M ${x1} ${y1} C ${x1 + pull} ${y1}, ${x2 - pull} ${y2}, ${x2 - 2} ${y2}` });
      }
      setDrawn({ edges, width: container.scrollWidth, height: container.scrollHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [chart]);

  // Drag to pan, Ctrl/⌘ + wheel or the buttons to zoom.
  const viewportRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const zoomAt = useCallback((factor: number, cx?: number, cy?: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const px = cx ?? el.clientWidth / 2;
    const py = cy ?? el.clientHeight / 2;
    setView((v) => {
      const scale = Math.min(1.75, Math.max(0.3, v.scale * factor));
      const k = scale / v.scale;
      return { scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);

  const fit = useCallback(() => {
    const el = viewportRef.current;
    const content = containerRef.current;
    if (!el || !content) return;
    const scale = Math.min(
      1,
      Math.max(0.3, Math.min(el.clientWidth / content.offsetWidth, el.clientHeight / content.offsetHeight)),
    );
    setView({ scale, x: Math.max(0, (el.clientWidth - content.offsetWidth * scale) / 2), y: 0 });
  }, []);

  // Fit once the chart first has content.
  const fitted = useRef(false);
  useEffect(() => {
    if (!fitted.current && chart.columns.length > 0 && drawn.width > 0) {
      fitted.current = true;
      fit();
    }
  }, [chart, drawn.width, fit]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // plain wheel scrolls the page
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, chart.columns.length]);

  if (chart.columns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-text-body">
        Add your courses in My courses, or import them from Howdy, to see your flowchart.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="flex items-center gap-2 text-sm font-normal text-text-body">
          <Checkbox
            checked={includePlan}
            onCheckedChange={(v) => setIncludePlan(v === true)}
            aria-label="Show watchlist and required courses not scheduled yet"
          />
          Also show my watchlist and required courses not scheduled yet
        </Label>
        <p className="text-xs text-text-muted">
          {loading
            ? "Loading prerequisites…"
            : "Drag to move around. Hover or click a course to trace its prerequisites."}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => zoomAt(1 / 1.2)} aria-label="Zoom out">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums text-text-body">
            {Math.round(view.scale * 100)}%
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => zoomAt(1.2)} aria-label="Zoom in">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="ml-1 h-8 gap-1" onClick={fit}>
            <Maximize2 className="h-3.5 w-3.5" /> Fit
          </Button>
        </div>
      </div>

      {outOfOrder.length > 0 && (
        <div className="space-y-1 rounded-md border border-red-500/40 bg-red-50 p-3 text-sm text-red-900 dark:bg-red-500/10 dark:text-red-200">
          {outOfOrder.map((e) => (
            <p key={`${e.from}>${e.to}`} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>{e.to}</strong> ({columnLabel(chart.columnOf.get(e.to)!)}) needs{" "}
                <strong>{e.from}</strong>{" "}
                {e.kind === "coreq" ? "the same term or earlier" : "first"}, but that&apos;s planned
                for{" "}
                {columnLabel(chart.columnOf.get(e.from)!)}.
              </span>
            </p>
          ))}
        </div>
      )}

      <div
        ref={viewportRef}
        className="relative h-[calc(100vh-14rem)] min-h-[480px] cursor-grab touch-none select-none overflow-hidden border-y border-border bg-white/40 active:cursor-grabbing dark:bg-white/[0.02]"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          if (!d.moved && Math.hypot(dx, dy) < 4) return; // still a click
          if (!d.moved) {
            d.moved = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }));
        }}
        onPointerUp={() => {
          suppressClick.current = !!drag.current?.moved;
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onClickCapture={(e) => {
          // A drag that ends on a course shouldn't pin it.
          if (suppressClick.current) {
            e.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        <div
          ref={containerRef}
          className="absolute left-0 top-0 inline-flex origin-top-left gap-12 p-6"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        >
          <svg
            className="pointer-events-none absolute left-0 top-0"
            width={drawn.width}
            height={drawn.height}
            aria-hidden
          >
            <defs>
              {Object.entries(EDGE_STYLE).map(([kind, style]) => (
                <marker
                  key={kind}
                  id={`arrow-${kind}`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={style.stroke} />
                </marker>
              ))}
            </defs>
            {drawn.edges.map(({ edge, d }) => {
              const kind = edge.outOfOrder ? "outOfOrder" : edge.kind;
              const style = EDGE_STYLE[kind];
              const lit = !chain || (chain.has(edge.from) && chain.has(edge.to));
              return (
                <path
                  key={`${edge.from}>${edge.to}`}
                  d={d}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={lit && chain ? 2.25 : 1.5}
                  strokeDasharray={style.dash}
                  markerEnd={`url(#arrow-${kind})`}
                  opacity={lit ? 0.9 : 0.08}
                />
              );
            })}
          </svg>

          {chart.columns.map((column) => {
            const credits = column.courses.reduce((sum, c) => sum + (info[c]?.credits ?? 0), 0);
            return (
              <section key={column.key} className="relative w-40 shrink-0" aria-label={columnLabel(column.key)}>
                <header className="mb-3 rounded-md bg-raised px-2 py-1.5 text-center">
                  <div className="text-sm font-semibold text-text-heading">{columnLabel(column.key)}</div>
                  <div className="text-xs text-text-muted">
                    {column.courses.length} course{column.courses.length === 1 ? "" : "s"}
                    {credits > 0 && ` · ${credits} cr.`}
                  </div>
                </header>
                <ul className="space-y-3">
                  {column.courses.map((code) => {
                    const s = standing(code);
                    const recordCourse = record.courses.find((c) => c.code === code && !c.deleted);
                    const missing =
                      s.eligibility && "missing" in s.eligibility ? s.eligibility.missing : [];
                    const dim = chain && !chain.has(code);
                    return (
                      <li key={code}>
                        <button
                          type="button"
                          ref={(node) => {
                            if (node) boxes.current.set(code, node);
                            else boxes.current.delete(code);
                          }}
                          onMouseEnter={() => setHovered(code)}
                          onMouseLeave={() => setHovered((h) => (h === code ? null : h))}
                          onFocus={() => setHovered(code)}
                          onBlur={() => setHovered((h) => (h === code ? null : h))}
                          onClick={() => setPinned((p) => (p === code ? null : code))}
                          aria-pressed={pinned === code}
                          className={cn(
                            "group relative w-full rounded-md border-2 px-2 py-1.5 text-left transition-opacity",
                            BOX[s.state],
                            dim && "opacity-25",
                            focus === code && "ring-2 ring-offset-1 ring-text-heading",
                          )}
                        >
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-sm font-semibold text-text-heading">{code}</span>
                            <span className="text-xs text-text-muted">
                              {recordCourse?.grade ?? (info[code]?.credits != null ? `${info[code].credits} cr` : "")}
                            </span>
                          </div>
                          <div className="truncate text-xs text-text-body" title={info[code]?.name ?? undefined}>
                            {info[code]?.name ?? " "}
                          </div>
                          {column.key === UNSCHEDULED_COLUMN && missing.length > 0 && (
                            <div className="truncate text-[11px] text-orange-700 dark:text-orange-300">
                              Needs {missing.join(", ")}
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      {pinned && (
        <p className="text-sm text-text-body">
          Showing everything {pinned} needs and unlocks.{" "}
          <Link href={`/course/${courseId(pinned)}`} className="inline-flex items-center gap-1 font-medium underline">
            Open {pinned} <ExternalLink className="h-3 w-3" />
          </Link>
        </p>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-body">
        {LEGEND.map(({ state, label }) => (
          <span key={state} className="flex items-center gap-1.5">
            <span className={cn("inline-block h-3 w-5 rounded-sm border-2", BOX[state])} />
            {label}
          </span>
        ))}
        {Object.entries(EDGE_STYLE).map(([kind, style]) => (
          <span key={kind} className="flex items-center gap-1.5">
            <svg width="24" height="8" aria-hidden>
              <line x1="0" y1="4" x2="24" y2="4" stroke={style.stroke} strokeWidth="2" strokeDasharray={style.dash} />
            </svg>
            {style.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A box's position inside the chart, from layout offsets (unaffected by zoom). */
function boxRect(el: HTMLElement | undefined, root: HTMLElement) {
  if (!el) return null;
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  if (node !== root) return null;
  return { left, top, width: el.offsetWidth, height: el.offsetHeight };
}
