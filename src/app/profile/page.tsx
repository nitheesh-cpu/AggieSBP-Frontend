"use client";

import { useEffect, useMemo, useState } from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { motion } from "motion/react";
import { getAccountSummary, type AccountSummary } from "@/lib/api";
import { User, Bell, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <SessionAuth>
      <ProfileContent />
    </SessionAuth>
  );
}

function displayUserId(userId: string): { short: string; full: string } {
  const full = userId || "—";
  if (full.length <= 24) return { short: full, full };
  return { short: `${full.slice(0, 10)}…${full.slice(-8)}`, full };
}

function ProfileContent() {
  const session = useSessionContext();
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [accountPending, setAccountPending] = useState(true);

  useEffect(() => {
    async function loadAccount() {
      if (session.loading) return;
      if (!session.doesSessionExist) {
        setAccount(null);
        setAccountPending(false);
        return;
      }
      setAccountPending(true);
      try {
        setAccount(await getAccountSummary());
      } catch (error) {
        console.error("Failed to load account summary:", error);
        setAccount(null);
      } finally {
        setAccountPending(false);
      }
    }
    void loadAccount();
  }, [session]);

  const userId =
    !session.loading && session.doesSessionExist ? session.userId : "";

  const idDisplay = useMemo(() => displayUserId(userId), [userId]);

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ background: "var(--app-bg-gradient)" }}
    >

      <Navigation variant="glass" />

      <main className="relative z-10 flex-grow px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-5xl space-y-8 sm:space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-2"
          >
            <p className="text-xs font-medium tracking-[0.18em] text-text-muted">
              Account
            </p>
            <h1 className="text-[32px] leading-tight font-medium text-text-heading sm:text-4xl">
              Profile
            </h1>
            <p className="max-w-2xl text-sm text-text-body">
              Manage your account and notification preferences.
            </p>
          </motion.div>

          {/* Account card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="overflow-hidden border-border/70 bg-white/70 shadow-md backdrop-blur-md dark:border-border dark:bg-card">
              <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-raised">
                    <User strokeWidth={1.5} className="h-6 w-6 text-text-muted" />
                  </div>
                  <div className="min-w-0 space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-text-muted">
                        Email
                      </p>
                      <p
                        className="flex items-center gap-2 truncate text-sm font-medium text-text-heading sm:text-base"
                        title={account?.primary_email ?? undefined}
                      >
                        <Mail className="h-4 w-4 shrink-0 text-text-muted" />
                        <span className="truncate">
                          {accountPending
                            ? "Loading…"
                            : (account?.primary_email ?? "—")}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-text-muted">
                        Sign-in methods
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {accountPending ? (
                          <span className="text-xs text-text-body dark:text-text-muted">
                            Loading…
                          </span>
                        ) : account?.sign_in_methods?.length ? (
                          account.sign_in_methods.map((m) => (
                            <Badge
                              key={`${m.recipe}-${m.label}-${m.provider ?? ""}`}
                              variant="outline"
                              className="border-border bg-transparent font-mono text-xs font-normal text-text-body"
                            >
                              {m.label}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-text-body dark:text-text-muted">
                            —
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-0.5 border-t border-border/50 pt-3 dark:border-border">
                      <p className="text-xs font-medium text-text-muted">
                        User id (support)
                      </p>
                      <p
                        className="font-mono text-xs text-text-body dark:text-text-muted"
                        title={idDisplay.full}
                      >
                        {idDisplay.short}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                  <Button
                    asChild
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href="/profile/alerts" className="gap-2">
                      <Bell className="h-4 w-4" />
                      My alerts
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-full border-border dark:border-border-strong">
                    <Link href="/dashboard">Open dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
