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
 * This file has no runtime imports so `node --test` can run its tests directly.
 */

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
  updatedAt: string;
  /** Tombstone, so merges don't bring back a bucket removed on another device. */
  deleted?: boolean;
}

export interface WatchItem {
  code: string;
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
}

export function activeBuckets(plan: DegreePlan): Bucket[] {
  return plan.buckets.filter((b) => !b.deleted);
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

function clampPick(pick: number, optionCount: number): number {
  const n = Number.isFinite(pick) ? Math.floor(pick) : 1;
  return Math.max(1, Math.min(n, Math.max(optionCount, 1)));
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
    pick: clampPick(input.pick, options.length),
    options,
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
    pick: clampPick(patch.pick ?? existing.pick, options.length),
    options,
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

export function addToWatchlist(
  plan: DegreePlan,
  code: string,
  now: Date = new Date(),
): DegreePlan {
  const norm = normalizeCode(code);
  if (!norm) return plan;
  const stamp = now.toISOString();
  const existing = plan.watchlist.find((w) => w.code === norm);
  if (existing && !existing.deleted) return plan;
  const item: WatchItem = { code: norm, addedAt: stamp, updatedAt: stamp };
  const rest = plan.watchlist.filter((w) => w.code !== norm);
  return { ...plan, watchlist: sortWatch([...rest, item]) };
}

export function removeFromWatchlist(
  plan: DegreePlan,
  code: string,
  now: Date = new Date(),
): DegreePlan {
  const norm = normalizeCode(code);
  if (!norm || !plan.watchlist.some((w) => w.code === norm && !w.deleted)) return plan;
  return {
    ...plan,
    watchlist: plan.watchlist.map((w) =>
      w.code === norm ? { ...w, deleted: true, updatedAt: now.toISOString() } : w,
    ),
  };
}

function sortWatch(items: WatchItem[]): WatchItem[] {
  return items.sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
}

function sortBuckets(buckets: Bucket[]): Bucket[] {
  // Creation order (ids start with a base-36 timestamp), ties broken by id.
  return buckets.sort((a, b) => cmp(a.id, b.id));
}

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
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
    const prev = watch.get(x.code);
    if (!prev || newer(x, prev)) watch.set(x.code, x);
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
      b.updatedAt,
      !!b.deleted,
    ]),
    watchlist: sortWatch([...p.watchlist]).map((w) => [
      w.code,
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
    typeof x.updatedAt === "string" &&
    (x.deleted === undefined || typeof x.deleted === "boolean")
  );
}

function isWatchItem(x: unknown): x is WatchItem {
  return (
    isObj(x) &&
    typeof x.code === "string" &&
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
