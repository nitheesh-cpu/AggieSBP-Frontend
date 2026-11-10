/**
 * Flowchart layout: courses placed in term columns, with prerequisite edges
 * between the ones on the chart. Pure data, so `node --test` can run it.
 */

import type { PrereqNode } from "./prereqs";
import type { AcademicRecord } from "./record";

export const CREDIT_COLUMN = "credit";
export const UNSCHEDULED_COLUMN = "unscheduled";

/**
 * required: needed no matter what. one_of: one of several alternatives.
 * coreq: may be taken the same term.
 */
export type EdgeKind = "required" | "one_of" | "coreq";

export interface ChartEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  /**
   * Scheduled too late: a required prerequisite in the same term or later, or
   * a corequisite in a later term.
   */
  outOfOrder: boolean;
}

export interface ChartColumn {
  key: string;
  courses: string[];
}

export interface Chart {
  columns: ChartColumn[];
  edges: ChartEdge[];
  /** Column key per course. */
  columnOf: Map<string, string>;
}

export interface ChartTrees {
  prereqTree: PrereqNode | null;
  coreqTree: PrereqNode | null;
}

const NOT_PASSED = new Set(["F", "U", "Q", "W", "I"]);
const KIND_RANK: Record<EdgeKind, number> = { required: 2, one_of: 1, coreq: 0 };

/** Which column each record course goes in. Failed attempts are left off. */
function placeRecord(record: AcademicRecord, currentTerm: string): Map<string, string> {
  const columnOf = new Map<string, string>();
  for (const c of record.courses) {
    if (c.deleted) continue;
    if (c.status === "completed" && c.grade && NOT_PASSED.has(c.grade)) continue;
    let column: string;
    if (c.term) column = c.term;
    else if (c.status === "completed") column = CREDIT_COLUMN;
    else if (c.status === "in_progress") column = currentTerm;
    else column = UNSCHEDULED_COLUMN;
    columnOf.set(c.code, column);
  }
  return columnOf;
}

function columnOrder(key: string): string {
  if (key === CREDIT_COLUMN) return "0";
  if (key === UNSCHEDULED_COLUMN) return "9";
  return `1${key}`;
}

/** Every course a tree references, with how it's needed. */
export function treeLinks(
  tree: PrereqNode | null | undefined,
  asCoreq = false,
): { code: string; kind: EdgeKind }[] {
  const out: { code: string; kind: EdgeKind }[] = [];
  const walk = (node: PrereqNode, underOr: boolean) => {
    if (node.type === "and" || node.type === "or") {
      // An "or" with one child is really just that child.
      const or = node.type === "or" && node.children.length > 1;
      for (const child of node.children) walk(child, underOr || or);
    } else if (node.type === "course") {
      const kind: EdgeKind =
        asCoreq || node.concurrent ? "coreq" : underOr ? "one_of" : "required";
      out.push({ code: node.code, kind });
    }
  };
  if (tree) walk(tree, false);
  return out;
}

/**
 * Lay out the record (plus `extra` courses not in it, e.g. from requirements
 * and the watchlist) by term, and connect prerequisites that are on the chart.
 */
export function buildChart(
  record: AcademicRecord,
  trees: Record<string, ChartTrees | undefined>,
  opts: { currentTerm: string; extra?: string[] },
): Chart {
  const columnOf = placeRecord(record, opts.currentTerm);
  for (const code of opts.extra ?? []) {
    if (!columnOf.has(code)) columnOf.set(code, UNSCHEDULED_COLUMN);
  }

  // Edges between courses on the chart; keep the strongest kind per pair.
  const byPair = new Map<string, ChartEdge>();
  for (const to of columnOf.keys()) {
    const info = trees[to];
    if (!info) continue;
    const links = [...treeLinks(info.prereqTree), ...treeLinks(info.coreqTree, true)];
    for (const { code: from, kind } of links) {
      if (from === to || !columnOf.has(from)) continue;
      const key = `${from}>${to}`;
      const prev = byPair.get(key);
      if (!prev || KIND_RANK[kind] > KIND_RANK[prev.kind]) {
        byPair.set(key, { from, to, kind, outOfOrder: false });
      }
    }
  }
  const edges = [...byPair.values()];
  for (const e of edges) {
    const a = columnOf.get(e.from)!;
    const b = columnOf.get(e.to)!;
    // "One of" links have alternatives, so a late one isn't necessarily a problem.
    if (e.kind === "one_of" || a === UNSCHEDULED_COLUMN || b === UNSCHEDULED_COLUMN) continue;
    if (b === CREDIT_COLUMN || a === CREDIT_COLUMN) continue; // credit is already earned
    // Corequisites may share the term; prerequisites must come strictly before.
    e.outOfOrder = e.kind === "coreq" ? a > b : a >= b;
  }

  const keys = [...new Set(columnOf.values())].sort((a, b) =>
    columnOrder(a).localeCompare(columnOrder(b)),
  );
  const columns: ChartColumn[] = keys.map((key) => ({
    key,
    courses: [...columnOf.entries()].filter(([, k]) => k === key).map(([code]) => code).sort(),
  }));

  // Fewer crossings: order each column by where its prerequisites sit to the left.
  const row = new Map<string, number>();
  const parents = new Map<string, string[]>();
  for (const e of edges) parents.set(e.to, [...(parents.get(e.to) ?? []), e.from]);
  for (const column of columns) {
    const score = (code: string) => {
      const rows = (parents.get(code) ?? []).map((p) => row.get(p)).filter((r) => r !== undefined);
      return rows.length ? rows.reduce((s, r) => s + r, 0) / rows.length : Number.POSITIVE_INFINITY;
    };
    column.courses.sort((a, b) => {
      const d = score(a) - score(b);
      return Number.isNaN(d) || d === 0 ? a.localeCompare(b) : d;
    });
    column.courses.forEach((code, i) => row.set(code, i));
  }

  return { columns, edges, columnOf };
}

/** Everything upstream (prerequisites) and downstream (what it unlocks) of a course. */
export function chainOf(edges: ChartEdge[], code: string): Set<string> {
  const chain = new Set([code]);
  const walk = (direction: "up" | "down") => {
    const seen = new Set([code]);
    const stack = [code];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const e of edges) {
        const next = direction === "up" ? (e.to === cur ? e.from : null) : e.from === cur ? e.to : null;
        if (next && !seen.has(next)) {
          seen.add(next);
          chain.add(next);
          stack.push(next);
        }
      }
    }
  };
  walk("up");
  walk("down");
  return chain;
}
