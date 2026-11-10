// Run: npm test  (node --test with native TypeScript type stripping)
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  activeBuckets,
  activeWatchlist,
  addBucket,
  addToWatchlist,
  bucketProgress,
  emptyPlan,
  isValidPlan,
  isWatchedIn,
  importRequirements,
  mergePlans,
  planProgress,
  planKey,
  removeBucket,
  removeFromWatchlist,
  updateBucket,
  watchKey,
  type DegreePlan,
} from "./plan.ts";

const T1 = new Date("2026-11-01T10:00:00Z");
const T2 = new Date("2026-11-02T10:00:00Z");
const T3 = new Date("2026-11-03T10:00:00Z");

const doneSet = (...codes: string[]) => (c: string) => codes.includes(c);

test("addBucket normalizes, assigns ids, clamps pick", () => {
  const p = addBucket(emptyPlan(), {
    name: "  Stats  ",
    pick: 1,
    options: [["stat211"], ["STAT-301"], ["stat 303", "stat 303", "junk"], [], ["nope"]],
  }, T1);
  const b = p.buckets[0];
  assert.equal(b.name, "Stats");
  assert.equal(b.updatedAt, T1.toISOString());
  assert.deepEqual(b.options.map((o) => o.courses), [["STAT 211"], ["STAT 301"], ["STAT 303"]]);
  assert.equal(new Set(b.options.map((o) => o.id)).size, 3);
  // Pick can be more than the options so far (more still to choose), up to 20.
  const big = addBucket(emptyPlan(), { name: "x", pick: 9, options: [["MATH 151"]] }, T1);
  assert.equal(big.buckets[0].pick, 9);
  assert.equal(addBucket(emptyPlan(), { name: "x", pick: 99, options: [] }, T1).buckets[0].pick, 20);
  const low = addBucket(emptyPlan(), { name: "x", pick: 0, options: [["MATH 151"]] }, T1);
  assert.equal(low.buckets[0].pick, 1);
});

test("addBucket ids are unique even for the same timestamp", () => {
  let p = addBucket(emptyPlan(), { name: "a", pick: 1, options: [["MATH 151"]] }, T1);
  p = addBucket(p, { name: "b", pick: 1, options: [["MATH 152"]] }, T1);
  assert.notEqual(p.buckets[0].id, p.buckets[1].id);
});

test("updateBucket, removeBucket", () => {
  let p = addBucket(emptyPlan(), { name: "A", pick: 1, options: [["MATH 151"], ["MATH 171"]] }, T1);
  const id = p.buckets[0].id;
  p = updateBucket(p, id, { name: "Calc", pick: 2 }, T2);
  assert.equal(p.buckets[0].name, "Calc");
  assert.equal(p.buckets[0].pick, 2);
  assert.equal(p.buckets[0].updatedAt, T2.toISOString());
  p = updateBucket(p, id, { options: [["csce121", "csce120"]] }, T2);
  assert.deepEqual(p.buckets[0].options[0].courses, ["CSCE 121", "CSCE 120"]);
  assert.equal(p.buckets[0].pick, 2); // kept: one more option still to add
  const same = updateBucket(p, "missing", { name: "x" }, T3);
  assert.equal(same, p);

  p = removeBucket(p, id, T3);
  assert.equal(activeBuckets(p).length, 0);
  assert.equal(p.buckets.length, 1);
  assert.equal(p.buckets[0].deleted, true);
  assert.equal(removeBucket(p, id, T3), p);
  assert.equal(updateBucket(p, id, { name: "x" }, T3), p);
});

test("watchlist add, remove, re-add", () => {
  let p = addToWatchlist(emptyPlan(), "csce121", T1);
  p = addToWatchlist(p, "MATH 151", T1);
  assert.deepEqual(activeWatchlist(p).map((w) => w.code), ["CSCE 121", "MATH 151"]);
  assert.equal(addToWatchlist(p, "CSCE-121", T2), p); // already there
  assert.equal(addToWatchlist(p, "junk", T2), p);
  p = removeFromWatchlist(p, "csce 121", T2);
  assert.deepEqual(activeWatchlist(p).map((w) => w.code), ["MATH 151"]);
  assert.equal(p.watchlist.length, 2);
  assert.equal(removeFromWatchlist(p, "CSCE 121", T3), p);
  p = addToWatchlist(p, "CSCE 121", T3);
  const item = p.watchlist.find((w) => w.code === "CSCE 121")!;
  assert.equal(item.deleted, undefined);
  assert.equal(item.addedAt, T3.toISOString());
});

test("bucketProgress: 1 stats class from three options", () => {
  const p = addBucket(emptyPlan(), {
    name: "Stats", pick: 1, options: [["STAT 211"], ["STAT 301"], ["STAT 303"]],
  }, T1);
  const b = p.buckets[0];
  let r = bucketProgress(b, doneSet());
  assert.deepEqual(r, { satisfiedOptions: [], remaining: 1, complete: false });
  r = bucketProgress(b, doneSet("STAT 301"));
  assert.deepEqual(r.satisfiedOptions, [b.options[1].id]);
  assert.equal(r.remaining, 0);
  assert.equal(r.complete, true);
  r = bucketProgress(b, doneSet("STAT 211", "STAT 301", "STAT 303"));
  assert.equal(r.satisfiedOptions.length, 3);
  assert.equal(r.remaining, 0);
});

test("bucketProgress: 2 electives from four options", () => {
  const p = addBucket(emptyPlan(), {
    name: "CS electives", pick: 2,
    options: [["CSCE 221"], ["CSCE 222"], ["CSCE 310"], ["CSCE 312"]],
  }, T1);
  const b = p.buckets[0];
  let r = bucketProgress(b, doneSet("CSCE 310"));
  assert.equal(r.remaining, 1);
  assert.equal(r.complete, false);
  r = bucketProgress(b, doneSet("CSCE 310", "CSCE 221"));
  assert.equal(r.remaining, 0);
  assert.equal(r.complete, true);
  assert.deepEqual(r.satisfiedOptions, [b.options[0].id, b.options[2].id]);
});

test("bucketProgress: (A and B) or (C and D)", () => {
  const p = addBucket(emptyPlan(), {
    name: "Sequence", pick: 1, options: [["PHYS 206", "PHYS 216"], ["PHYS 207", "PHYS 217"]],
  }, T1);
  const b = p.buckets[0];
  assert.equal(bucketProgress(b, doneSet("PHYS 206")).complete, false);
  assert.equal(bucketProgress(b, doneSet("PHYS 206", "PHYS 217")).complete, false);
  const r = bucketProgress(b, doneSet("PHYS 207", "PHYS 217"));
  assert.equal(r.complete, true);
  assert.deepEqual(r.satisfiedOptions, [b.options[1].id]);
});

test("bucketProgress: empty bucket and empty options never count", () => {
  const b = { id: "x", name: "x", pick: 1, options: [{ id: "x-o0", courses: [] }], updatedAt: "" };
  assert.equal(bucketProgress(b, () => true).complete, false);
});

function twoDevices(): { base: DegreePlan; id: string } {
  const base = addBucket(emptyPlan(), { name: "A", pick: 1, options: [["MATH 151"]] }, T1);
  return { base: addToWatchlist(base, "CSCE 121", T1), id: base.buckets[0].id };
}

test("mergePlans: newest edit wins per item and is commutative", () => {
  const { base, id } = twoDevices();
  const a = updateBucket(base, id, { name: "From A" }, T2);
  const b = updateBucket(addToWatchlist(base, "MATH 152", T2), id, { name: "From B" }, T3);
  const ab = mergePlans(a, b, T3);
  const ba = mergePlans(b, a, T3);
  assert.deepEqual(ab, ba);
  assert.equal(planKey(ab), planKey(ba));
  assert.equal(ab.buckets[0].name, "From B");
  assert.deepEqual(activeWatchlist(ab).map((w) => w.code), ["CSCE 121", "MATH 152"]);
});

test("mergePlans: disjoint buckets are unioned; null inputs ok", () => {
  const a = addBucket(emptyPlan(), { name: "A", pick: 1, options: [["MATH 151"]] }, T1);
  const b = addBucket(emptyPlan(), { name: "B", pick: 1, options: [["MATH 152"]] }, T2);
  const m = mergePlans(a, b, T3);
  assert.deepEqual(m.buckets.map((x) => x.name), ["A", "B"]);
  assert.deepEqual(mergePlans(null, a, T3), a);
  assert.deepEqual(mergePlans(undefined, null, T3), emptyPlan());
});

test("mergePlans: ties resolve the same either way round", () => {
  const { base, id } = twoDevices();
  const a = updateBucket(base, id, { name: "X" }, T2);
  const b = updateBucket(base, id, { name: "Y" }, T2);
  assert.deepEqual(mergePlans(a, b, T3), mergePlans(b, a, T3));
});

test("mergePlans: tombstones beat older edits and are not resurrected", () => {
  const { base, id } = twoDevices();
  const removed = removeFromWatchlist(removeBucket(base, id, T3), "CSCE 121", T3);
  const stale = updateBucket(base, id, { name: "Old" }, T2);
  for (const m of [mergePlans(removed, stale, T3), mergePlans(stale, removed, T3)]) {
    assert.equal(activeBuckets(m).length, 0);
    assert.equal(activeWatchlist(m).length, 0);
    assert.equal(m.buckets.length, 1); // tombstone kept
  }
  // A newer edit after the removal wins over the tombstone.
  const revived = addToWatchlist(removed, "CSCE 121", new Date("2026-11-04T10:00:00Z"));
  assert.equal(activeWatchlist(mergePlans(removed, revived, T3)).length, 1);
});

test("mergePlans: tombstones older than 180 days are pruned", () => {
  const { base, id } = twoDevices();
  const removed = removeFromWatchlist(removeBucket(base, id, T1), "CSCE 121", T1);
  const soon = new Date(T1.getTime() + 179 * 86_400_000);
  const later = new Date(T1.getTime() + 181 * 86_400_000);
  assert.equal(mergePlans(removed, null, soon).buckets.length, 1);
  assert.equal(mergePlans(removed, null, soon).watchlist.length, 1);
  const pruned = mergePlans(removed, null, later);
  assert.equal(pruned.buckets.length, 0);
  assert.equal(pruned.watchlist.length, 0);
});

test("planKey is stable across item order and detects changes", () => {
  const { base, id } = twoDevices();
  const shuffled: DegreePlan = {
    ...base,
    buckets: [...base.buckets].reverse(),
    watchlist: [...base.watchlist].reverse(),
  };
  assert.equal(planKey(base), planKey(shuffled));
  assert.notEqual(planKey(base), planKey(updateBucket(base, id, { name: "B" }, T2)));
  assert.equal(planKey(null), planKey(emptyPlan()));
});

test("isValidPlan", () => {
  const { base } = twoDevices();
  assert.equal(isValidPlan(emptyPlan()), true);
  assert.equal(isValidPlan(base), true);
  assert.equal(isValidPlan(JSON.parse(JSON.stringify(removeBucket(base, base.buckets[0].id, T2)))), true);
  assert.equal(isValidPlan(null), false);
  assert.equal(isValidPlan("plan"), false);
  assert.equal(isValidPlan([]), false);
  assert.equal(isValidPlan({}), false);
  assert.equal(isValidPlan({ version: 2, buckets: [], watchlist: [] }), false);
  assert.equal(isValidPlan({ version: 1, buckets: [] }), false);
  assert.equal(isValidPlan({ version: 1, buckets: [{ id: "x" }], watchlist: [] }), false);
  assert.equal(
    isValidPlan({ version: 1, buckets: [], watchlist: [{ code: "CSCE 121", addedAt: "a" }] }),
    false,
  );
  const badOption = JSON.parse(JSON.stringify(base));
  badOption.buckets[0].options[0].courses = [1];
  assert.equal(isValidPlan(badOption), false);
  const badDeleted = JSON.parse(JSON.stringify(base));
  badDeleted.watchlist[0].deleted = "yes";
  assert.equal(isValidPlan(badDeleted), false);
});

test("planProgress lets a course count toward at most two buckets", () => {
  let p = emptyPlan();
  p = addBucket(p, { name: "Major", pick: 1, options: [["CSCE 421"]] }, T1);
  p = addBucket(p, { name: "Minor", pick: 1, options: [["CSCE 421"], ["STAT 404"]] }, T1);
  p = addBucket(p, { name: "Third", pick: 1, options: [["CSCE 421"]] }, T1);
  const [major, minor, third] = p.buckets;
  const done = (c: string) => c === "CSCE 421";
  const progress = planProgress(p.buckets, done);
  // The two single-option groups have no other choice, so they claim it first.
  assert.equal(progress.byBucket.get(major.id)?.complete, true);
  assert.equal(progress.byBucket.get(third.id)?.complete, true);
  assert.equal(progress.byBucket.get(minor.id)?.complete, false);
  assert.ok(progress.blockedOptions.has(minor.options[0].id));

  // Once STAT 404 is done, the flexible group uses it instead.
  const both = planProgress(p.buckets, (c) => c === "CSCE 421" || c === "STAT 404");
  assert.equal(both.byBucket.get(minor.id)?.complete, true);
  assert.deepEqual(both.byBucket.get(minor.id)?.satisfiedOptions, [minor.options[1].id]);
  assert.equal(both.blockedOptions.size, 0);
});

test("planProgress prefers options whose courses are used least", () => {
  let p = emptyPlan();
  p = addBucket(p, { name: "A", pick: 1, options: [["MATH 151"]] }, T1);
  p = addBucket(p, { name: "B", pick: 1, options: [["MATH 151"], ["MATH 152"]] }, T1);
  const [a, b] = p.buckets;
  const progress = planProgress(p.buckets, () => true, 1);
  assert.equal(progress.byBucket.get(a.id)?.complete, true);
  assert.deepEqual(progress.byBucket.get(b.id)?.satisfiedOptions, [b.options[1].id]);
});

test("buckets can belong to an area", () => {
  let p = addBucket(emptyPlan(), { name: "Elective (9 hrs)", pick: 1, options: [["STAT 315"]], area: " Statistics Minor " }, T1);
  const id = p.buckets[0].id;
  assert.equal(p.buckets[0].area, "Statistics Minor");
  p = updateBucket(p, id, { pick: 1 }, T2);
  assert.equal(p.buckets[0].area, "Statistics Minor"); // kept when not patched
  p = updateBucket(p, id, { area: null }, T2);
  assert.equal(p.buckets[0].area, null);
  assert.equal(addBucket(emptyPlan(), { name: "x", pick: 1, options: [] }, T1).buckets[0].area, null);
  assert.equal(isValidPlan(p), true);
  assert.equal(isValidPlan({ ...p, buckets: [{ ...p.buckets[0], area: 5 }] }), false);
});

test("allowed courses are kept apart from the options", () => {
  let p = addBucket(emptyPlan(), { name: "Elective", pick: 3, options: [["STAT 404"]], allowed: ["stat315", "STAT 404", "junk"] }, T1);
  const b = p.buckets[0];
  assert.deepEqual(b.allowed, ["STAT 315", "STAT 404"]);
  assert.equal(b.pick, 3);
  assert.equal(bucketProgress(b, () => true).remaining, 2); // only options count
  p = updateBucket(p, b.id, { options: [["STAT 404"], ["STAT 315"]] }, T2);
  assert.deepEqual(p.buckets[0].allowed, ["STAT 315", "STAT 404"]); // kept
  assert.equal(isValidPlan(p), true);
});

test("importRequirements updates groups already imported instead of duplicating", () => {
  const stats = { name: "Elective (9 hrs)", area: "Statistics Minor", pick: 3, options: [["STAT 404"]], allowed: ["STAT 315"] };
  let p = importRequirements(emptyPlan(), [stats], T1);
  const id = p.buckets[0].id;
  p = importRequirements(p, [{ ...stats, options: [["STAT 404"], ["CSCE 421"]] }], T2);
  const live = p.buckets.filter((b) => !b.deleted);
  assert.equal(live.length, 1);
  assert.equal(live[0].id, id); // same group, updated in place
  assert.deepEqual(live[0].options.map((o) => o.courses), [["STAT 404"], ["CSCE 421"]]);
});

test("importRequirements folds old-style names and duplicates into one group", () => {
  let p = emptyPlan();
  // An older import put the area in the name, and it was imported twice.
  p = addBucket(p, { name: "Statistics Minor · Elective (9 hrs)", pick: 3, options: [["STAT 315"], ["STAT 335"]] }, T1);
  p = addBucket(p, { name: "Statistics Minor · Elective (9 hrs)", pick: 3, options: [["STAT 315"]] }, T1);
  p = addBucket(p, { name: "Mine", pick: 1, options: [["MATH 151"]] }, T1);
  p = importRequirements(p, [{ name: "Elective (9 hrs)", area: "Statistics Minor", pick: 3, options: [["STAT 404"]] }], T2);
  const live = p.buckets.filter((b) => !b.deleted);
  assert.deepEqual(
    live.map((b) => [b.area ?? null, b.name, b.options.map((o) => o.courses.join("+"))]),
    [
      ["Statistics Minor", "Elective (9 hrs)", ["STAT 404"]],
      [null, "Mine", ["MATH 151"]],
    ],
  );
});

test("watchlist stars two topics of one course independently", () => {
  let p = addToWatchlist(emptyPlan(), "csce489", T1, "computer vision");
  p = addToWatchlist(p, "CSCE 489", T1, "AGENTIC AI");
  p = addToWatchlist(p, "CSCE 489", T1); // the plain code is its own item
  assert.equal(activeWatchlist(p).length, 3);
  assert.equal(addToWatchlist(p, "CSCE 489", T2, "COMPUTER VISION"), p); // already there
  assert.equal(isWatchedIn(p, "CSCE 489", "COMPUTER VISION"), true);
  assert.equal(isWatchedIn(p, "CSCE 489", "PHYSICAL COMPUTING"), false);
  p = removeFromWatchlist(p, "CSCE 489", T2, "COMPUTER VISION");
  assert.equal(isWatchedIn(p, "CSCE 489", "COMPUTER VISION"), false);
  assert.equal(isWatchedIn(p, "CSCE 489", "AGENTIC AI"), true);
  assert.equal(isWatchedIn(p, "CSCE 489"), true);
  assert.equal(removeFromWatchlist(p, "CSCE 489", T3, "COMPUTER VISION"), p);
  p = removeFromWatchlist(p, "CSCE 489", T3);
  assert.equal(isWatchedIn(p, "CSCE 489"), false);
  assert.equal(isWatchedIn(p, "CSCE 489", "AGENTIC AI"), true);
  assert.deepEqual(
    activeWatchlist(p).map((w) => watchKey(w)),
    ["CSCE 489|AGENTIC AI"],
  );
});

test("watch items saved before topics existed still load and work", () => {
  const old = {
    version: 1,
    buckets: [],
    watchlist: [{ code: "CSCE 121", addedAt: T1.toISOString(), updatedAt: T1.toISOString() }],
  };
  assert.equal(isValidPlan(old), true);
  assert.equal(isValidPlan({ ...old, watchlist: [{ ...old.watchlist[0], topic: null }] }), true);
  assert.equal(isValidPlan({ ...old, watchlist: [{ ...old.watchlist[0], topic: 3 }] }), false);
  const p = old as DegreePlan;
  assert.equal(isWatchedIn(p, "CSCE 121"), true);
  assert.equal(removeFromWatchlist(p, "CSCE 121", T2).watchlist[0].deleted, true);
});

test("mergePlans keys watch items by topic", () => {
  const a = addToWatchlist(emptyPlan(), "CSCE 489", T1, "COMPUTER VISION");
  const b = addToWatchlist(emptyPlan(), "CSCE 489", T1, "AGENTIC AI");
  const m = mergePlans(a, b, T3);
  assert.deepEqual(activeWatchlist(m).map((w) => w.topic), ["AGENTIC AI", "COMPUTER VISION"]);
  // Removing one topic on one device doesn't touch the other.
  const removed = removeFromWatchlist(m, "CSCE 489", T2, "AGENTIC AI");
  const merged = mergePlans(removed, m, T3);
  assert.deepEqual(activeWatchlist(merged).map((w) => w.topic), ["COMPUTER VISION"]);
  assert.equal(planKey(m), planKey(mergePlans(b, a, T3)));
  assert.notEqual(planKey(m), planKey(removed));
});
