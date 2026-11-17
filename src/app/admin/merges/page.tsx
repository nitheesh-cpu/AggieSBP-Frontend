"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Copy, ExternalLink, Lock, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ADMIN_KEY_STORAGE,
  AdminKeyError,
  type MergeChangeResult,
  type MergeStatus,
  type ProfessorMerge,
  checkAdminKey,
  getProfessorMerges,
  setProfessorMergeStatus,
} from "@/lib/admin-api";

const TABS: { status: MergeStatus; label: string }[] = [
  { status: "proposed", label: "To review" },
  { status: "confirmed", label: "Merged" },
  { status: "rejected", label: "Rejected" },
];

function readStoredKey(): string {
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

function storeKey(key: string | null) {
  try {
    if (key) sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    else sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {
    // Storage blocked: the key just isn't remembered across reloads.
  }
}

export default function AdminMergesPage() {
  const [key, setKey] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The session recorder skips /admin, but only on a fresh page load. If it
    // is already running (we arrived by client-side navigation), reload.
    if (document.querySelector('script[src*="recorder.js"]')) {
      window.location.reload();
      return;
    }
    const stored = readStoredKey();
    if (stored) setKey(stored);
    setReady(true);
  }, []);

  const signOut = useCallback(() => {
    storeKey(null);
    setKey(null);
  }, []);

  if (!ready) return null;

  return (
    <main
      className="min-h-screen px-4 py-10 sm:px-6"
      style={{ background: "var(--app-bg-gradient)" }}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {key ? (
          <MergeReview adminKey={key} onSignOut={signOut} />
        ) : (
          <KeyGate
            onUnlock={(k) => {
              storeKey(k);
              setKey(k);
            }}
          />
        )}
      </div>
    </main>
  );
}

function KeyGate({ onUnlock }: { onUnlock: (key: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const candidate = value.trim();
    if (!candidate) return;
    setChecking(true);
    setError(null);
    try {
      await checkAdminKey(candidate);
      onUnlock(candidate);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't check the key.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-16 max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-center gap-3">
        <Lock strokeWidth={1.5} className="h-5 w-5 text-text-muted" />
        <h1 className="text-lg font-medium text-text-heading">Admin</h1>
      </div>
      <p className="text-sm text-text-body">
        Enter the admin key (<code>ADMIN_API_KEY</code> on the server). It is kept
        for this tab only.
      </p>
      <Input
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Admin key"
        aria-label="Admin key"
        autoFocus
      />
      {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      <Button type="submit" className="w-full" disabled={checking || !value.trim()}>
        {checking ? "Checking..." : "Unlock"}
      </Button>
    </form>
  );
}

function MergeReview({
  adminKey,
  onSignOut,
}: {
  adminKey: string;
  onSignOut: () => void;
}) {
  const [merges, setMerges] = useState<ProfessorMerge[] | null>(null);
  const [tab, setTab] = useState<MergeStatus>("proposed");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MergeChangeResult | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setMerges(await getProfessorMerges(adminKey));
    } catch (e) {
      if (e instanceof AdminKeyError) onSignOut();
      else setError(e instanceof Error ? e.message : "Couldn't load merges.");
    }
  }, [adminKey, onSignOut]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<MergeStatus, number> = { proposed: 0, confirmed: 0, rejected: 0 };
    for (const m of merges ?? []) c[m.status] += 1;
    return c;
  }, [merges]);

  const visible = useMemo(
    () => (merges ?? []).filter((m) => m.status === tab),
    [merges, tab],
  );

  const changeTab = (next: string) => {
    setTab(next as MergeStatus);
    setSelected(new Set());
  };

  const toggle = (aliasId: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(aliasId);
      else next.delete(aliasId);
      return next;
    });
  };

  const allSelected = visible.length > 0 && visible.every((m) => selected.has(m.aliasId));

  const act = async (aliasIds: string[], action: "confirm" | "reject") => {
    if (!aliasIds.length) return;
    setBusy(true);
    setError(null);
    try {
      const res = await setProfessorMergeStatus(adminKey, aliasIds, action);
      setResult(res);
      setSelected(new Set());
      await load();
    } catch (e) {
      if (e instanceof AdminKeyError) onSignOut();
      else setError(e instanceof Error ? e.message : "The change failed.");
    } finally {
      setBusy(false);
    }
  };

  // What the bulk button does on each tab.
  const bulk =
    tab === "proposed"
      ? null
      : tab === "confirmed"
        ? { action: "reject" as const, label: "Undo selected merges" }
        : { action: "confirm" as const, label: "Merge selected" };

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <h1 className="text-xl font-medium text-text-heading">Duplicate professors</h1>
          <p className="mt-1 text-sm text-text-muted">
            RateMyProfessors entries that look like one person. Merging shows them as one
            professor; nothing is deleted, and any merge can be undone.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onSignOut} className="gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          Lock
        </Button>
      </header>

      {result && <ResultPanel result={result} onDismiss={() => setResult(null)} />}
      {error && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <Tabs value={tab} onValueChange={changeTab}>
        <TabsList>
          {TABS.map(({ status, label }) => (
            <TabsTrigger key={status} value={status}>
              {label} ({counts[status]})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {merges === null ? (
        <p className="text-sm text-text-muted">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-text-muted">
          {tab === "proposed"
            ? "Nothing to review. New candidates appear after the next merge_duplicates --propose run."
            : "None yet."}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-text-body">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(on) =>
                  setSelected(on ? new Set(visible.map((m) => m.aliasId)) : new Set())
                }
              />
              Select all ({visible.length})
            </label>
            <div className="ml-auto flex flex-wrap gap-2">
              {tab === "proposed" ? (
                <>
                  <Button
                    size="sm"
                    disabled={busy || selected.size === 0}
                    onClick={() => act([...selected], "confirm")}
                    className="gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Merge selected ({selected.size})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || selected.size === 0}
                    onClick={() => act([...selected], "reject")}
                    className="gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject selected
                  </Button>
                </>
              ) : (
                bulk && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || selected.size === 0}
                    onClick={() => act([...selected], bulk.action)}
                  >
                    {bulk.label} ({selected.size})
                  </Button>
                )
              )}
            </div>
          </div>

          <ul className="space-y-3">
            {visible.map((merge) => (
              <MergeRow
                key={merge.aliasId}
                merge={merge}
                checked={selected.has(merge.aliasId)}
                onCheck={(on) => toggle(merge.aliasId, on)}
                busy={busy}
                onAct={(action) => act([merge.aliasId], action)}
              />
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function MergeRow({
  merge,
  checked,
  onCheck,
  busy,
  onAct,
}: {
  merge: ProfessorMerge;
  checked: boolean;
  onCheck: (on: boolean) => void;
  busy: boolean;
  onAct: (action: "confirm" | "reject") => void;
}) {
  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(on) => onCheck(on === true)}
          aria-label={`Select ${merge.alias.name}`}
          className="mt-1"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <ProfessorLink professor={merge.alias} fallback={merge.aliasId} />
            <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" aria-label="shown as" />
            <ProfessorLink professor={merge.canonical} fallback={merge.canonicalId} />
            {merge.needsCheck && (
              <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-300">
                Check spelling
              </Badge>
            )}
          </div>
          <p className="text-xs text-text-muted break-words">
            {merge.evidence.replace(/^CHECK: [^;]*; /, "")}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          {merge.status !== "confirmed" && (
            <Button size="sm" disabled={busy} onClick={() => onAct("confirm")} className="gap-1">
              <Check className="h-3.5 w-3.5" />
              Merge
            </Button>
          )}
          {merge.status === "proposed" && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onAct("reject")}>
              Reject
            </Button>
          )}
          {merge.status === "confirmed" && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onAct("reject")}
              className="gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Undo
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

function ProfessorLink({
  professor,
  fallback,
}: {
  professor: ProfessorMerge["alias"];
  fallback: string;
}) {
  const label = professor.name || fallback;
  return (
    <span className="inline-flex min-w-0 items-baseline gap-1.5">
      {professor.rmpId ? (
        // The RateMyProfessors page, to compare the two entries at the source.
        <a
          href={`https://www.ratemyprofessors.com/professor/${professor.rmpId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-text-heading hover:underline"
        >
          {label}
          <ExternalLink className="h-3 w-3 text-text-muted" />
        </a>
      ) : (
        <span className="font-medium text-text-heading">{label}</span>
      )}
      <span className="text-xs text-text-muted">
        {professor.department || "No department"} · {professor.ratings} ratings
      </span>
    </span>
  );
}

function ResultPanel({
  result,
  onDismiss,
}: {
  result: MergeChangeResult;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const changed = result.changes.filter((c) => c.status !== "skipped");
  const skipped = result.changes.filter((c) => c.status === "skipped");

  const copy = async () => {
    if (!result.rebuildCommand) return;
    try {
      await navigator.clipboard.writeText(result.rebuildCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the command is still selectable below.
    }
  };

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-text-heading">
          {changed.length} updated{skipped.length ? `, ${skipped.length} skipped` : ""}. The
          site cache was cleared.
        </p>
        <Button variant="ghost" size="sm" onClick={onDismiss} aria-label="Dismiss">
          <X className="h-4 w-4" />
        </Button>
      </div>
      {skipped.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-text-body">
          {skipped.map((c) => (
            <li key={c.aliasId}>
              {c.aliasId}: {c.problem}
            </li>
          ))}
        </ul>
      )}
      {result.rebuildCommand && (
        <div className="space-y-2">
          <p className="text-text-body">
            Rebuild these professors&apos; summaries on the server (from{" "}
            <code>/home/opc/backend</code>) so they cover the merged reviews:
          </p>
          <div className="flex items-start gap-2">
            <code className="block max-h-32 flex-1 overflow-auto rounded-md bg-raised p-2 text-xs break-all text-text-heading">
              {result.rebuildCommand}
            </code>
            <Button variant="outline" size="sm" onClick={copy} className="gap-1">
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
