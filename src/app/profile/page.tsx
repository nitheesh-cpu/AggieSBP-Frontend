"use client";

import { useEffect, useMemo, useState } from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { motion } from "motion/react";
import {
  getAccountSummary,
  getSchedules,
  type AccountSummary,
  type Schedule,
} from "@/lib/api";
import {
  User,
  Calendar,
  Plus,
  Bell,
  Sparkles,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <SessionAuth>
      <ProfileContent />
    </SessionAuth>
  );
}

function formatScheduleDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function displayUserId(userId: string): { short: string; full: string } {
  const full = userId || "—";
  if (full.length <= 24) return { short: full, full };
  return { short: `${full.slice(0, 10)}…${full.slice(-8)}`, full };
}

function ProfileContent() {
  const session = useSessionContext();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [accountPending, setAccountPending] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (session.loading || !session.doesSessionExist) return;
      try {
        const data = await getSchedules();
        setSchedules(data);
      } catch (error) {
        console.error("Failed to load schedules:", error);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [session]);

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

  const totalCourses = useMemo(
    () =>
      schedules.reduce((n, s) => n + (s.selected_courses?.length ?? 0), 0),
    [schedules],
  );

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ background: "var(--app-bg-gradient)" }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ background: "var(--app-bg-ambient)" }}
      />

      <Navigation variant="glass" />

      <main className="relative z-10 flex-grow px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-5xl space-y-8 sm:space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-2"
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-body/70 dark:text-white/50">
              Account
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-text-heading dark:text-white sm:text-4xl">
              Profile
            </h1>
            <p className="max-w-2xl text-sm text-text-body dark:text-white/70">
              Manage your account and saved schedules.
            </p>
          </motion.div>

          {/* Account card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="overflow-hidden border-border/70 bg-white/70 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-black/50">
              <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#500000]/10 dark:bg-[#FFCF3F]/15 sm:h-20 sm:w-20">
                    <User className="h-8 w-8 text-[#500000] dark:text-[#FFCF3F] sm:h-10 sm:w-10" />
                  </div>
                  <div className="min-w-0 space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-text-body/80 dark:text-white/55">
                        Email
                      </p>
                      <p
                        className="flex items-center gap-2 truncate text-sm font-medium text-text-heading dark:text-white sm:text-base"
                        title={account?.primary_email ?? undefined}
                      >
                        <Mail className="h-4 w-4 shrink-0 text-text-body/70 dark:text-white/50" />
                        <span className="truncate">
                          {accountPending
                            ? "Loading…"
                            : (account?.primary_email ?? "—")}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium uppercase tracking-wide text-text-body/80 dark:text-white/55">
                        Sign-in methods
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {accountPending ? (
                          <span className="text-xs text-text-body dark:text-white/55">
                            Loading…
                          </span>
                        ) : account?.sign_in_methods?.length ? (
                          account.sign_in_methods.map((m) => (
                            <Badge
                              key={`${m.recipe}-${m.label}-${m.provider ?? ""}`}
                              variant="outline"
                              className="border-[#500000]/25 bg-[#500000]/5 text-xs font-normal text-[#500000] dark:border-[#FFCF3F]/40 dark:bg-[#FFCF3F]/10 dark:text-[#FFCF3F]"
                            >
                              {m.label}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-text-body dark:text-white/55">
                            —
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-0.5 border-t border-border/50 pt-3 dark:border-white/10">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-text-body/70 dark:text-white/45">
                        User id (support)
                      </p>
                      <p
                        className="font-mono text-xs text-text-body dark:text-white/60"
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
                    className="rounded-full bg-[#500000] text-white hover:bg-[#3d0000] dark:bg-[#FFCF3F] dark:text-black dark:hover:bg-[#FFD966]"
                  >
                    <Link href="/profile/alerts" className="gap-2">
                      <Bell className="h-4 w-4" />
                      My alerts
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-full border-border dark:border-white/20">
                    <Link href="/dashboard">Open dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Schedules */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            aria-labelledby="profile-schedules-heading"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#500000]/10 dark:bg-[#FFCF3F]/15">
                  <Calendar className="h-4 w-4 text-[#500000] dark:text-[#FFCF3F]" />
                </div>
                <div>
                  <h2
                    id="profile-schedules-heading"
                    className="text-lg font-semibold text-text-heading dark:text-white"
                  >
                    Saved schedules
                  </h2>
                  <p className="text-sm text-text-body dark:text-white/65">
                    {loading
                      ? "Loading…"
                      : `${schedules.length} plan${schedules.length === 1 ? "" : "s"} · ${totalCourses} course${totalCourses === 1 ? "" : "s"}`}
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="w-full shrink-0 rounded-full bg-[#500000] text-white hover:bg-[#3d0000] sm:w-auto dark:bg-[#FFCF3F] dark:text-black dark:hover:bg-[#FFD966]"
              >
                <Link href="/courses" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New schedule
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-44 animate-pulse rounded-xl border border-border/40 bg-white/40 dark:border-white/10 dark:bg-white/5"
                  />
                ))}
              </div>
            ) : schedules.length === 0 ? (
              <Card className="border-dashed border-border/80 bg-white/40 dark:border-white/20 dark:bg-black/35">
                <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center sm:py-14">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#500000]/8 dark:bg-[#FFCF3F]/12">
                    <Sparkles className="h-7 w-7 text-[#500000] dark:text-[#FFCF3F]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-text-heading dark:text-white">
                      No saved schedules yet
                    </p>
                    <p className="max-w-md text-sm text-text-body dark:text-white/65">
                      Browse courses, add sections to a plan, and save it here when you are
                      ready.
                    </p>
                  </div>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/courses">Browse courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {schedules.map((schedule) => {
                  const courses = schedule.selected_courses ?? [];
                  const created = formatScheduleDate(schedule.created_at);
                  return (
                    <Card
                      key={schedule.id}
                      className="border-border/60 bg-white/65 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-black/50"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <CardTitle className="text-lg leading-snug text-text-heading dark:text-white">
                            {schedule.name}
                          </CardTitle>
                          {schedule.term_code ? (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-[#500000]/25 bg-[#500000]/5 text-xs text-[#500000] dark:border-[#FFCF3F]/40 dark:bg-[#FFCF3F]/10 dark:text-[#FFCF3F]"
                            >
                              Term {schedule.term_code}
                            </Badge>
                          ) : null}
                        </div>
                        <CardDescription className="text-xs dark:text-white/55">
                          {courses.length} course{courses.length === 1 ? "" : "s"}
                          {created ? ` · Saved ${created}` : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {courses.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {courses.slice(0, 6).map((course: { subject?: string; course_number?: string }, cIdx: number) => (
                              <span
                                key={cIdx}
                                className="rounded-lg border border-border/60 bg-canvas/80 px-2.5 py-1 font-mono text-xs text-text-heading dark:border-white/15 dark:bg-black/40 dark:text-white/85"
                              >
                                {course.subject} {course.course_number}
                              </span>
                            ))}
                            {courses.length > 6 ? (
                              <span className="self-center text-xs text-text-body dark:text-white/50">
                                +{courses.length - 6} more
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-xs text-text-body dark:text-white/50">
                            No course list stored for this plan.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
