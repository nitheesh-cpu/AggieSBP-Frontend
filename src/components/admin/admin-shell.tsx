"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_KEY_STORAGE, checkAdminKey } from "@/lib/admin-api";

const AdminContext = createContext<{
  adminKey: string;
  signOut: () => void;
} | null>(null);
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("Admin authentication is required.");
  return context;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    } catch {
      /* Storage may be disabled. */
    }
    setKey(null);
    setValue("");
  }, []);

  useEffect(() => {
    // A recorder already loaded on a public page must be removed before showing credentials.
    if (document.querySelector('script[src*="recorder.js"]')) {
      window.location.reload();
      return;
    }
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(ADMIN_KEY_STORAGE);
    } catch {
      /* Tab-only fallback. */
    }
    if (!stored) {
      setReady(true);
      return;
    }
    let active = true;
    void checkAdminKey(stored)
      .then(() => {
        if (active) setKey(stored);
      })
      .catch(() => {
        if (active) signOut();
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [signOut]);

  const wideOverview = key && pathname === "/admin";

  if (!ready)
    return (
      <p className="p-8 text-sm text-text-muted">Checking admin access…</p>
    );
  return (
    <main
      className={
        wideOverview
          ? "min-h-screen px-4 py-5 sm:px-6 lg:px-8"
          : "min-h-screen px-4 py-8 sm:px-6"
      }
      style={{ background: "var(--app-bg-gradient)" }}
    >
      <div
        className={
          wideOverview
            ? "mx-auto max-w-[112rem] space-y-5"
            : "mx-auto max-w-6xl space-y-6"
        }
      >
        {key ? (
          <AdminContext.Provider value={{ adminKey: key, signOut }}>
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
              <Link
                href="/admin"
                className="text-lg font-semibold text-text-heading"
              >
                AggieSB+ Admin
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                <Lock />
                Lock admin
              </Button>
              <nav aria-label="Admin" className="flex w-full flex-wrap gap-2">
                {[
                  ["/admin", "Overview"],
                  ["/admin/seat-alerts", "Seat Alerts"],
                  ["/admin/merges", "Professor merges"],
                  ["/admin/summaries", "Summaries"],
                  ["/admin/jobs", "Run history"],
                  ["/admin/cache", "Cache"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={pathname === href ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 text-sm transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:outline-ring ${pathname === href ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-text-body"}`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </header>
            {children}
          </AdminContext.Provider>
        ) : (
          <form
            className="mx-auto mt-12 max-w-sm space-y-4 rounded-xl border border-border bg-card p-6"
            onSubmit={async (event) => {
              event.preventDefault();
              const candidate = value.trim();
              if (!candidate || checking) return;
              setChecking(true);
              setError(null);
              try {
                await checkAdminKey(candidate);
                try {
                  sessionStorage.setItem(ADMIN_KEY_STORAGE, candidate);
                } catch {
                  /* In-memory access still works. */
                }
                setKey(candidate);
                setValue("");
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : "Could not check admin access.",
                );
              } finally {
                setChecking(false);
              }
            }}
          >
            <h1 className="text-xl font-medium text-text-heading">
              Admin access
            </h1>
            <p className="text-sm text-text-muted">
              Enter your admin key. Access is remembered for this browser tab
              only.
            </p>
            <label className="block space-y-2 text-sm text-text-body">
              <span>Admin key</span>
              <Input
                type="password"
                autoComplete="off"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </label>
            {error && (
              <p
                role="alert"
                className="text-sm text-red-700 dark:text-red-300"
              >
                {error}
              </p>
            )}
            <Button className="w-full" disabled={checking || !value.trim()}>
              {checking ? "Checking…" : "Unlock admin"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
