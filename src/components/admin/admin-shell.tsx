"use client";

import Link from "@/components/app-link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminAuthError, checkAdminAccess } from "@/lib/admin-api";

/** Pages that use the whole screen width; the rest keep a reading width. */
const WIDE_PAGES = new Set(["/admin", "/admin/merges", "/admin/instructors"]);

/** Cloudflare Access's sign-out endpoint on this site (D-052). */
const ACCESS_LOGOUT_URL = "/cdn-cgi/access/logout";

type Access =
  | { state: "checking" }
  | { state: "ok" }
  | { state: "expired" }
  | { state: "error"; message: string };

const AdminContext = createContext<{
  /** Pages call this when a request comes back 401/403: the Access sign-in expired. */
  signOut: () => void;
} | null>(null);
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("Admin authentication is required.");
  return context;
}

/**
 * Cloudflare Access signs admins in before this page loads (D-052); there is
 * no key to type. This only confirms the server accepts the sign-in, and
 * shows what to do when it has expired.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [access, setAccess] = useState<Access>({ state: "checking" });
  const signOut = useCallback(() => setAccess({ state: "expired" }), []);

  useEffect(() => {
    // A recorder already loaded on a public page must be removed before showing admin data.
    if (document.querySelector('script[src*="recorder.js"]')) {
      window.location.reload();
      return;
    }
    let active = true;
    void checkAdminAccess()
      .then(() => {
        if (active) setAccess({ state: "ok" });
      })
      .catch((e: unknown) => {
        if (!active) return;
        if (e instanceof AdminAuthError) setAccess({ state: "expired" });
        else
          setAccess({
            state: "error",
            message: e instanceof Error ? e.message : "Could not check admin access.",
          });
      });
    return () => {
      active = false;
    };
  }, []);

  if (access.state === "checking")
    return (
      <p className="p-8 text-sm text-text-muted">Checking admin access…</p>
    );

  const wide = access.state === "ok" && WIDE_PAGES.has(pathname);
  return (
    <main
      className={
        wide
          ? "min-h-dvh px-4 py-5 sm:px-6 lg:px-8"
          : "min-h-dvh px-4 py-8 sm:px-6"
      }
      style={{ background: "var(--app-bg-gradient)" }}
    >
      <div
        className={
          wide
            ? "mx-auto max-w-[112rem] space-y-5"
            : "mx-auto max-w-6xl space-y-6"
        }
      >
        {access.state === "ok" ? (
          <AdminContext.Provider value={{ signOut }}>
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
              <Link
                href="/admin"
                className="text-lg font-semibold text-text-heading"
              >
                AggieSB+ Admin
              </Link>
              <Button variant="outline" size="sm" asChild>
                {/* A full page load, so Cloudflare Access can end the session. */}
                <a href={ACCESS_LOGOUT_URL}>
                  <LogOut />
                  Sign out
                </a>
              </Button>
              <nav aria-label="Admin" className="flex w-full flex-wrap gap-2">
                {[
                  ["/admin", "Overview"],
                  ["/admin/seat-alerts", "Seat Alerts"],
                  ["/admin/merges", "Professor merges"],
                  ["/admin/instructors", "Instructor links"],
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
          <section className="mx-auto mt-12 max-w-sm space-y-4 rounded-xl border border-border bg-card p-6">
            <h1 className="text-xl font-medium text-text-heading">
              {access.state === "expired" ? "Sign in again" : "Admin unavailable"}
            </h1>
            <p role="alert" className="text-sm text-text-body">
              {access.state === "expired"
                ? "Your admin sign-in has expired. Reload the page and sign in through Cloudflare again."
                : access.message}
            </p>
            <Button className="w-full" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </section>
        )}
      </div>
    </main>
  );
}
