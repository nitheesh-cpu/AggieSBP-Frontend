/**
 * The student's degree plan: requirement buckets plus a watchlist of courses.
 *
 * A bucket reads "choose `pick` of these options"; an option is one or more
 * courses that must all be taken together. So "1 stats class from STAT
 * 211/301/303" is pick 1 over three single-course options, and "A and B, or
 * C and D" is pick 1 over the options [A, B] and [C, D].
 *
 * Local-first like the academic record: every bucket and watch item carries
 * its own updatedAt and removals are tombstones, so two copies merge per item
 * (newest edit wins) without resurrecting deleted ones.
 *
 * This file only imports ./topics.ts (itself import-free), so `node --test` can
 * run its tests directly.
 */

import { topicKey } from "./topics.ts";

export interface BucketOption {
  id: string;
  /** Normalized codes, all required together for this option. */
  courses: string[];
}

export interface Bucket {
  id: string;
  name: string;
  /** How many of `options` must be satisfied. */
  pick: number;
  options: BucketOption[];
  /**
   * The larger requirement this belongs to, e.g. "Statistics Minor" for its
   * "Elective (9 hrs)" rule. Groups with the same area are shown together.
   */
  area?: string | null;
  /**
   * Courses allowed to count, when the degree lists them (Howdy's "Select
   * from ..."). Shown as suggestions; only `options` count as the plan.
   */
  allowed?: string[] | null;
  updatedAt: string;
  /** Tombstone, so merges don't bring back a bucket removed on another device. */
  deleted?: boolean;
}

export interface WatchItem {
  code: string;
  /**
   * Special topics courses (CSCE 489) are several classes under one number;
   * a starred topic is its own item. Upper-case topic name; absent for a whole
   * course (and for items saved before topics existed).
   */
  topic?: string | null;
  addedAt: string;
  updatedAt: string;
  /** Tombstone, so merges don't bring back an item removed on another device. */
  deleted?: boolean;
}

export interface DegreePlan {
  version: 1;
  buckets: Bucket[];
  watchlist: WatchItem[];
}

const TOMBSTONE_TTL_MS = 180 * 24 * 60 * 60 * 1000;

export function emptyPlan(): DegreePlan {
  return { version: 1, buckets: [], watchlist: [] };
}

// ---------------------------------------------------------------------------
// Course codes (same rules as record.ts; duplicated to stay import-free)
// ---------------------------------------------------------------------------

const CODE_RE = /^\s*([A-Za-z]{3,4})[\s\-_]*(\d{3}[A-Za-z]?)\s*$/;

/** "csce121", "CSCE-121", "CSCE 121" -> "CSCE 121"; anything else -> null. */
function normalizeCode(raw: string): string | null {
  const m = CODE_RE.exec(raw);
  return m ? `${m[1].toUpperCase()} ${m[2].toUpperCase()}` : null;
}

// ---------------------------------------------------------------------------
// Edits (all return a new plan)
// ---------------------------------------------------------------------------

export interface BucketInput {
  name: string;
  pick: number;
  options: string[][];
  area?: string | null;
  allowed?: string[] | null;
}

export function activeBuckets(plan: DegreePlan): Bucket[] {
  return plan.buckets.filter((b) => !b.deleted);
}

/** Identity of a watch item: its code, or "code|TOPIC" for a starred topic. */
export function watchKey(w: { code: string; topic?: string | null }): string {
  return topicKey(w.code, w.topic || null);
}

function normalizeTopic(topic: string | null | undefined): string | null {
  const t = topic?.replace(/\s+/g, " ").trim().toUpperCase();
  return t || null;
}

export function activeWatchlist(plan: DegreePlan): WatchItem[] {
  return plan.watchlist.filter((w) => !w.deleted);
}

/** Normalize codes, drop invalid/duplicate ones and empty options, assign ids. */
function buildOptions(bucketId: string, options: string[][]): BucketOption[] {
  const out: BucketOption[] = [];
  for (const raw of options) {
    const courses: string[] = [];
    for (const r of raw) {
      const code = normalizeCode(r);
      if (code && !courses.includes(code)) courses.push(code);
    }
    if (courses.length) out.push({ id: `${bucketId}-o${out.length}`, courses });
  }
  return out;
}

/**
 * 1-20. Pick may be more than the options listed so far: "pick 3" with two
 * options means one more still has to be chosen.
 */
function clampPick(pick: number): number {
  const n = Number.isFinite(pick) ? Math.floor(pick) : 1;
  return Math.max(1, Math.min(n, 20));
}

function normalizeAllowed(codes: string[] | null | undefined): string[] | null {
  if (!codes) return null;
  const out = [...new Set(codes.map((c) => normalizeCode(c)).filter((c): c is string => !!c))];
  return out.length ? out : null;
}

/** Add a bucket. Ids come from the timestamp, so they're stable and unique per call. */
export function addBucket(
  plan: DegreePlan,
  input: BucketInput,
  now: Date = new Date(),
): DegreePlan {
  const stamp = now.toISOString();
  const taken = new Set(plan.buckets.map((b) => b.id));
  const base = `b-${now.getTime().toString(36)}`;
  let id = base;
  for (let i = 1; taken.has(id); i++) id = `${base}-${i}`;
  const options = buildOptions(id, input.options);
  const bucket: Bucket = {
    id,
    name: input.name.trim(),
    pick: clampPick(input.pick),
    options,
    area: input.area?.trim() || null,
    allowed: normalizeAllowed(input.allowed),
    updatedAt: stamp,
  };
  return { ...plan, buckets: [...plan.buckets, bucket] };
}

export function updateBucket(
  plan: DegreePlan,
  id: string,
  patch: Partial<BucketInput>,
  now: Date = new Date(),
): DegreePlan {
  const existing = plan.buckets.find((b) => b.id === id && !b.deleted);
  if (!existing) return plan;
  const options = patch.options ? buildOptions(id, patch.options) : existing.options;
  const next: Bucket = {
    id,
    name: patch.name !== undefined ? patch.name.trim() : existing.name,
    pick: clampPick(patch.pick ?? existing.pick),
    options,
    area: patch.area !== undefined ? patch.area?.trim() || null : existing.area ?? null,
    allowed: patch.allowed !== undefined ? normalizeAllowed(patch.allowed) : existing.allowed ?? null,
    updatedAt: now.toISOString(),
  };
  return { ...plan, buckets: plan.buckets.map((b) => (b.id === id ? next : b)) };
}

export function removeBucket(
  plan: DegreePlan,
  id: string,
  now: Date = new Date(),
): DegreePlan {
  if (!plan.buckets.some((b) => b.id === id && !b.deleted)) return plan;
  return {
    ...plan,
    buckets: plan.buckets.map((b) =>
      b.id === id ? { ...b, deleted: true, updatedAt: now.toISOString() } : b,
    ),
  };
}

/** Star a course, or one topic of a special topics course. */
export function addToWatchlist(
  plan: DegreePlan,
  code: string,
  now: Date = new Date(),
  topic?: string | null,
): DegreePlan {
  const norm = normalizeCode(code);
  if (!norm) return plan;
  const t = normalizeTopic(topic);
  const id = topicKey(norm, t);
  const stamp = now.toISOString();
  const existing = plan.watchlist.find((w) => watchKey(w) === id);
  if (existing && !existing.deleted) return plan;
  const item: WatchItem = t
    ? { code: norm, topic: t, addedAt: stamp, updatedAt: stamp }
    : { code: norm, addedAt: stamp, updatedAt: stamp };
  const rest = plan.watchlist.filter((w) => watchKey(w) !== id);
  return { ...plan, watchlist: sortWatch([...rest, item]) };
}

export function removeFromWatchlist(
  plan: DegreePlan,
  code: string,
  now: Date = new Date(),
  topic?: string | null,
): DegreePlan {
  const norm = normalizeCode(code);
  if (!norm) return plan;
  const id = topicKey(norm, normalizeTopic(topic));
  if (!plan.watchlist.some((w) => watchKey(w) === id && !w.deleted)) return plan;
  return {
    ...plan,
    watchlist: plan.watchlist.map((w) =>
      watchKey(w) === id ? { ...w, deleted: true, updatedAt: now.toISOString() } : w,
    ),
  };
}

/** Whether a course (or one of its topics) is starred. */
export function isWatchedIn(plan: DegreePlan, code: string, topic?: string | null): boolean {
  const norm = normalizeCode(code) ?? code;
  const id = topicKey(norm, normalizeTopic(topic));
  return plan.watchlist.some((w) => !w.deleted && watchKey(w) === id);
}

function sortWatch(items: WatchItem[]): WatchItem[] {
  return items.sort((a, b) => cmp(a.code, b.code) || cmp(a.topic ?? "", b.topic ?? ""));
}

function sortBuckets(buckets: Bucket[]): Bucket[] {
  // Creation order (ids start with a base-36 timestamp), ties broken by id.
  return buckets.sort((a, b) => cmp(a.id, b.id));
}

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Importing requirements (from Howdy)
// ---------------------------------------------------------------------------

export interface ImportedRequirement {
  name: string;
  area?: string | null;
  pick: number;
  options: string[][];
  allowed?: string[] | null;
}

/** Rule names repeat across areas ("Required courses"), so a group is its area + name. */
export function bucketKey(b: { area?: string | null; name: string }): string {
  return `${b.area ?? ""} ${b.name}`;
}

/**
 * Groups an import of `r` should update: the same area and name, or one from
 * an older import that put the area in the name ("Statistics Minor · Elective").
 */
export function matchingBuckets(plan: DegreePlan, r: ImportedRequirement): Bucket[] {
  const legacyName = r.area ? `${r.area} · ${r.name}` : null;
  return activeBuckets(plan).filter(
    (b) => bucketKey(b) === bucketKey(r) || (!b.area && legacyName !== null && b.name === legacyName),
  );
}

/**
 * Add imported requirements, updating ones already imported instead of
 * duplicating them: the first match takes the new name, area, pick, options
 * and allowed list; any extra copies are removed.
 */
export function importRequirements(
  plan: DegreePlan,
  requirements: ImportedRequirement[],
  now: Date = new Date(),
): DegreePlan {
  let next = plan;
  for (const r of requirements) {
    const input: BucketInput = {
      name: r.name,
      pick: r.pick,
      options: r.options,
      area: r.area ?? null,
      allowed: r.allowed?.length ? r.allowed : null,
    };
    const [first, ...extra] = matchingBuckets(next, r);
    if (!first) {
      next = addBucket(next, input, now);
      continue;
    }
    next = updateBucket(next, first.id, input, now);
    for (const dup of extra) next = removeBucket(next, dup.id, now);
  }
  return next;
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export interface BucketProgress {
  /** Ids of options whose courses are all done. */
  satisfiedOptions: string[];
  /** How many more options are needed (never negative). */
  remaining: number;
  complete: boolean;
}

export function bucketProgress(
  bucket: Bucket,
  done: (code: string) => boolean,
): BucketProgress {
  const satisfiedOptions = bucket.options
    .filter((o) => o.courses.length > 0 && o.courses.every((c) => done(c)))
    .map((o) => o.id);
  const remaining = Math.max(0, bucket.pick - satisfiedOptions.length);
  return { satisfiedOptions, remaining, complete: remaining === 0 };
}

/**
 * At A&M a course can usually count toward two requirements (say your major
 * and your minor) but not three. Howdy's evaluation is the real authority;
 * this keeps the planner from letting one course quietly fill every group.
 */
export const MAX_REQUIREMENTS_PER_COURSE = 2;

export interface PlanProgress {
  byBucket: Map<string, BucketProgress>;
  /**
   * Option ids whose courses are done but couldn't count here because each
   * course already counts toward the maximum number of other groups.
   */
  blockedOptions: Set<string>;
}

/**
 * Progress for every bucket at once, sharing courses between them: each
 * course counts toward at most `maxUses` buckets. Buckets with the least
 * room to choose (fewest spare options) claim courses first, and within a
 * bucket the options whose courses are least used so far go first.
 */
export function planProgress(
  buckets: Bucket[],
  done: (code: string) => boolean,
  maxUses: number = MAX_REQUIREMENTS_PER_COURSE,
): PlanProgress {
  const uses = new Map<string, number>();
  const used = (code: string) => uses.get(code) ?? 0;
  const byBucket = new Map<string, BucketProgress>();
  const blockedOptions = new Set<string>();

  const order = buckets
    .map((bucket, index) => ({ bucket, index }))
    .sort(
      (a, b) =>
        a.bucket.options.length - a.bucket.pick - (b.bucket.options.length - b.bucket.pick) ||
        a.index - b.index,
    );

  for (const { bucket } of order) {
    const candidates = bucket.options
      .filter((o) => o.courses.length > 0 && o.courses.every((c) => done(c)))
      .map((o, i) => ({ o, i }))
      .sort(
        (a, b) =>
          Math.max(...a.o.courses.map(used)) - Math.max(...b.o.courses.map(used)) || a.i - b.i,
      );
    const satisfiedOptions: string[] = [];
    for (const { o } of candidates) {
      if (satisfiedOptions.length >= bucket.pick) break;
      if (o.courses.some((c) => used(c) >= maxUses)) {
        blockedOptions.add(o.id);
        continue;
      }
      satisfiedOptions.push(o.id);
      for (const c of o.courses) uses.set(c, used(c) + 1);
    }
    const remaining = Math.max(0, bucket.pick - satisfiedOptions.length);
    byBucket.set(bucket.id, { satisfiedOptions, remaining, complete: remaining === 0 });
  }
  return { byBucket, blockedOptions };
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

/**
 * Merge two copies of a plan: per bucket and per watch item the newer edit
 * wins (tombstones included). Tombstones older than 180 days are dropped.
 * Order-independent.
 */
export function mergePlans(
  a: DegreePlan | null | undefined,
  b: DegreePlan | null | undefined,
  now: Date = new Date(),
): DegreePlan {
  const left = a ?? emptyPlan();
  const right = b ?? emptyPlan();
  const cutoff = now.getTime() - TOMBSTONE_TTL_MS;
  const alive = (x: { deleted?: boolean; updatedAt: string }) =>
    !x.deleted || Date.parse(x.updatedAt) >= cutoff;

  const buckets = new Map<string, Bucket>();
  for (const x of [...left.buckets, ...right.buckets]) {
    const prev = buckets.get(x.id);
    if (!prev || newer(x, prev)) buckets.set(x.id, x);
  }
  const watch = new Map<string, WatchItem>();
  for (const x of [...left.watchlist, ...right.watchlist]) {
    const id = watchKey(x);
    const prev = watch.get(id);
    if (!prev || newer(x, prev)) watch.set(id, x);
  }
  return {
    version: 1,
    buckets: sortBuckets([...buckets.values()].filter(alive)),
    watchlist: sortWatch([...watch.values()].filter(alive)),
  };
}

function newer(x: { updatedAt: string }, y: { updatedAt: string }): boolean {
  if (x.updatedAt !== y.updatedAt) return x.updatedAt > y.updatedAt;
  // Same timestamp from two devices: keep a stable winner either way round.
  return JSON.stringify(x) > JSON.stringify(y);
}

/** Canonical JSON for "did anything change" checks. */
export function planKey(plan: DegreePlan | null | undefined): string {
  const p = plan ?? emptyPlan();
  return JSON.stringify({
    buckets: sortBuckets([...p.buckets]).map((b) => [
      b.id,
      b.name,
      b.pick,
      b.options.map((o) => [o.id, o.courses]),
      b.area ?? null,
      b.allowed ?? null,
      b.updatedAt,
      !!b.deleted,
    ]),
    watchlist: sortWatch([...p.watchlist]).map((w) => [
      w.code,
      ...(w.topic ? [w.topic] : []),
      w.addedAt,
      w.updatedAt,
      !!w.deleted,
    ]),
  });
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isOption(x: unknown): x is BucketOption {
  return (
    isObj(x) &&
    typeof x.id === "string" &&
    Array.isArray(x.courses) &&
    x.courses.every((c) => typeof c === "string")
  );
}

function isBucket(x: unknown): x is Bucket {
  return (
    isObj(x) &&
    typeof x.id === "string" &&
    typeof x.name === "string" &&
    typeof x.pick === "number" &&
    Number.isFinite(x.pick) &&
    Array.isArray(x.options) &&
    x.options.every(isOption) &&
    (x.area === undefined || x.area === null || typeof x.area === "string") &&
    (x.allowed === undefined ||
      x.allowed === null ||
      (Array.isArray(x.allowed) && x.allowed.every((c) => typeof c === "string"))) &&
    typeof x.updatedAt === "string" &&
    (x.deleted === undefined || typeof x.deleted === "boolean")
  );
}

function isWatchItem(x: unknown): x is WatchItem {
  return (
    isObj(x) &&
    typeof x.code === "string" &&
    (x.topic === undefined || x.topic === null || typeof x.topic === "string") &&
    typeof x.addedAt === "string" &&
    typeof x.updatedAt === "string" &&
    (x.deleted === undefined || typeof x.deleted === "boolean")
  );
}

/** Shape check for plans loaded from storage or the server. */
export function isValidPlan(x: unknown): x is DegreePlan {
  return (
    isObj(x) &&
    x.version === 1 &&
    Array.isArray(x.buckets) &&
    x.buckets.every(isBucket) &&
    Array.isArray(x.watchlist) &&
    x.watchlist.every(isWatchItem)
  );
}
