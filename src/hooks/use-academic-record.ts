"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

import { getPlannerState, PlannerConflictError, savePlannerDoc } from "@/lib/api";
import {
  emptyRecord,
  mergeRecords,
  recordKey,
  type AcademicRecord,
} from "@/lib/planner/record";

/**
 * "loading": reading storage / session. "local": signed out, saved on this
 * device. "syncing" / "synced": signed in. "error": signed in but the account
 * copy couldn't be read or saved; edits are still kept on this device.
 */
export type RecordSyncStatus = "loading" | "local" | "syncing" | "synced" | "error";

const STORAGE_PREFIX = "aggiesbp:planner:record:v1:";
const ANON_KEY = `${STORAGE_PREFIX}anon`;
const userKey = (userId: string) => `${STORAGE_PREFIX}user:${userId}`;
const SAVE_DEBOUNCE_MS = 700;
const MAX_CONFLICT_RETRIES = 3;

function load(key: string): AcademicRecord | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.version === 1 && Array.isArray(parsed.courses) ? parsed : null;
  } catch {
    return null;
  }
}

function store(key: string, record: AcademicRecord) {
  try {
    window.localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // Storage full or blocked: the in-memory copy (and account, if any) still work.
  }
}

/**
 * The student's academic record, local-first.
 *
 * Signed out, it lives under an anonymous localStorage key. On sign-in that
 * copy is merged into the account (then cleared, so a later visitor on the
 * same device doesn't see it), and every edit is saved to the server with the
 * last revision seen. A 409 means another device saved first: merge its copy
 * and retry. Each signed-in user has their own local key, so signing out
 * shows the anonymous record, not the previous user's.
 */
export function useAcademicRecord() {
  const session = useSessionContext();
  const sessionReady = !session.loading;
  const userId = !session.loading && session.doesSessionExist ? session.userId : null;

  const [record, setRecordState] = useState<AcademicRecord>(emptyRecord);
  const [status, setStatus] = useState<RecordSyncStatus>("loading");

  const recordRef = useRef<AcademicRecord>(record);
  const revRef = useRef(0);
  const ownerRef = useRef<string | null>(null);
  const savingRef = useRef(false);
  const pendingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storageKey = userId ? userKey(userId) : ANON_KEY;

  const apply = useCallback(
    (next: AcademicRecord) => {
      recordRef.current = next;
      setRecordState(next);
      store(storageKey, next);
    },
    [storageKey],
  );

  const push = useCallback(async () => {
    if (!userId || ownerRef.current !== userId) return;
    // Everything below is ignored if the signed-in user changes mid-save.
    const stillOwner = () => ownerRef.current === userId;
    if (savingRef.current) {
      pendingRef.current = true;
      return;
    }
    savingRef.current = true;
    setStatus("syncing");
    try {
      for (let attempt = 0; ; attempt++) {
        const sent = recordRef.current;
        try {
          const rev = await savePlannerDoc("record", sent, revRef.current);
          if (!stillOwner()) return;
          revRef.current = rev;
          break;
        } catch (err) {
          if (!stillOwner()) return;
          if (!(err instanceof PlannerConflictError) || attempt >= MAX_CONFLICT_RETRIES) throw err;
          revRef.current = err.rev;
          apply(mergeRecords(recordRef.current, err.value as AcademicRecord));
        }
      }
      setStatus("synced");
    } catch {
      if (stillOwner()) setStatus("error");
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
    // A save scheduled for the previous user must not fire for this one.
    if (timerRef.current) clearTimeout(timerRef.current);
    ownerRef.current = userId;
    revRef.current = 0;
    pendingRef.current = false;

    const local = load(storageKey);
    if (!userId) {
      apply(local ?? emptyRecord());
      setStatus("local");
      return;
    }
    const anon = load(ANON_KEY);
    apply(mergeRecords(local, anon));
    setStatus("syncing");

    getPlannerState()
      .then((state) => {
        if (cancelled) return;
        revRef.current = state.record_rev;
        const merged = mergeRecords(recordRef.current, state.record);
        apply(merged);
        if (anon) {
          try {
            window.localStorage.removeItem(ANON_KEY);
          } catch {}
        }
        if (recordKey(merged) !== recordKey(state.record)) void push();
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

  // Another tab edited the same record: merge it in.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey || !e.newValue) return;
      try {
        const other = JSON.parse(e.newValue) as AcademicRecord;
        const merged = mergeRecords(recordRef.current, other);
        recordRef.current = merged;
        setRecordState(merged);
      } catch {}
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

  /** Apply an edit (a pure function of the current record) and save it. */
  const update = useCallback(
    (edit: (current: AcademicRecord) => AcademicRecord) => {
      const next = edit(recordRef.current);
      if (next === recordRef.current) return;
      apply(next);
      if (!userId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void push(), SAVE_DEBOUNCE_MS);
    },
    [apply, push, userId],
  );

  return {
    record,
    status,
    signedIn: !!userId,
    loaded: status !== "loading",
    update,
    /** Retry a failed sync (e.g. after the API was unreachable). */
    retrySync: push,
  };
}
