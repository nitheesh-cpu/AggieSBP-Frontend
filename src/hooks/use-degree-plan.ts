"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

import { getPlannerState, PlannerConflictError, savePlannerDoc } from "@/lib/api";
import {
  emptyPlan,
  isValidPlan,
  mergePlans,
  planKey,
  type DegreePlan,
} from "@/lib/planner/plan";

/**
 * "loading": reading storage / session. "local": signed out, saved on this
 * device. "syncing" / "synced": signed in. "error": signed in but the account
 * copy couldn't be read or saved; edits are still kept on this device.
 */
export type PlanSyncStatus = "loading" | "local" | "syncing" | "synced" | "error";

const STORAGE_PREFIX = "aggiesbp:planner:plan:v1:";
const ANON_KEY = `${STORAGE_PREFIX}anon`;
const userKey = (userId: string) => `${STORAGE_PREFIX}user:${userId}`;
const SAVE_DEBOUNCE_MS = 700;
const MAX_CONFLICT_RETRIES = 3;

function load(key: string): DegreePlan | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidPlan(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function store(key: string, plan: DegreePlan) {
  try {
    window.localStorage.setItem(key, JSON.stringify(plan));
  } catch {
    // Storage full or blocked: the in-memory copy (and account, if any) still work.
  }
}

/**
 * The student's degree plan (requirement buckets + watchlist), local-first.
 *
 * Signed out, it lives under an anonymous localStorage key. On sign-in that
 * copy is merged into the account (then cleared, so a later visitor on the
 * same device doesn't see it), and every edit is saved to the server with the
 * last revision seen. A 409 means another device saved first: merge its copy
 * and retry. Each signed-in user has their own local key, so signing out
 * shows the anonymous plan, not the previous user's.
 */
export function useDegreePlan() {
  const session = useSessionContext();
  const sessionReady = !session.loading;
  const userId = !session.loading && session.doesSessionExist ? session.userId : null;

  const [plan, setPlanState] = useState<DegreePlan>(emptyPlan);
  const [status, setStatus] = useState<PlanSyncStatus>("loading");

  const planRef = useRef<DegreePlan>(plan);
  const revRef = useRef(0);
  const ownerRef = useRef<string | null>(null);
  const savingRef = useRef(false);
  const pendingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storageKey = userId ? userKey(userId) : ANON_KEY;

  const apply = useCallback(
    (next: DegreePlan) => {
      planRef.current = next;
      setPlanState(next);
      store(storageKey, next);
    },
    [storageKey],
  );

  const push = useCallback(async () => {
    if (!userId) return;
    if (savingRef.current) {
      pendingRef.current = true;
      return;
    }
    savingRef.current = true;
    setStatus("syncing");
    try {
      for (let attempt = 0; ; attempt++) {
        const sent = planRef.current;
        try {
          revRef.current = await savePlannerDoc("plan", sent, revRef.current);
          break;
        } catch (err) {
          if (!(err instanceof PlannerConflictError) || attempt >= MAX_CONFLICT_RETRIES) throw err;
          revRef.current = err.rev;
          const theirs = isValidPlan(err.value) ? err.value : null;
          apply(mergePlans(planRef.current, theirs));
        }
      }
      setStatus("synced");
    } catch {
      setStatus("error");
    } finally {
      savingRef.current = false;
    }
    if (pendingRef.current && ownerRef.current === userId) {
      pendingRef.current = false;
      void push();
    }
  }, [userId, apply]);

  // Load (and, when signed in, merge with the account) whenever the user changes.
  useEffect(() => {
    if (!sessionReady) return;
    let cancelled = false;
    ownerRef.current = userId;
    revRef.current = 0;
    pendingRef.current = false;

    const local = load(storageKey);
    if (!userId) {
      apply(local ?? emptyPlan());
      setStatus("local");
      return;
    }
    const anon = load(ANON_KEY);
    apply(mergePlans(local, anon));
    setStatus("syncing");

    getPlannerState()
      .then((state) => {
        if (cancelled) return;
        revRef.current = state.plan_rev;
        const remote = isValidPlan(state.plan) ? state.plan : null;
        const merged = mergePlans(planRef.current, remote);
        apply(merged);
        if (anon) {
          try {
            window.localStorage.removeItem(ANON_KEY);
          } catch {
            // Storage blocked: nothing to clear.
          }
        }
        if (planKey(merged) !== planKey(remote)) void push();
        else setStatus("synced");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // `push`/`apply` are recreated with userId/storageKey, which are deps already.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady, userId, storageKey]);

  // Another tab edited the same plan: merge it in.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey || !e.newValue) return;
      try {
        const other: unknown = JSON.parse(e.newValue);
        if (!isValidPlan(other)) return;
        const merged = mergePlans(planRef.current, other);
        planRef.current = merged;
        setPlanState(merged);
      } catch {
        // A malformed copy from another tab: keep ours.
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  /** Apply an edit (a pure function of the current plan) and save it. */
  const update = useCallback(
    (edit: (current: DegreePlan) => DegreePlan) => {
      const next = edit(planRef.current);
      if (next === planRef.current) return;
      apply(next);
      if (!userId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void push(), SAVE_DEBOUNCE_MS);
    },
    [apply, push, userId],
  );

  return {
    plan,
    status,
    signedIn: !!userId,
    loaded: status !== "loading",
    update,
    /** Retry a failed sync (e.g. after the API was unreachable). */
    retrySync: push,
  };
}
