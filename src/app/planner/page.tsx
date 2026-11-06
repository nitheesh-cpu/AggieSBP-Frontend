"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Cloud, CloudOff, GraduationCap, HardDrive, Loader2, RefreshCw } from "lucide-react";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { CourseSearch } from "@/components/planner/course-search";
import { PasteImportDialog } from "@/components/planner/paste-import-dialog";
import { PrereqCheck } from "@/components/planner/prereq-check";
import { RecordList } from "@/components/planner/record-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAcademicRecord, type RecordSyncStatus } from "@/hooks/use-academic-record";
import { useCoursePrereqs } from "@/hooks/use-course-prereqs";
import {
  activeCourses,
  CLASSIFICATIONS,
  removeCourse,
  setClassification,
  updateCourse,
  upsertCourses,
  type Classification,
} from "@/lib/planner/record";

const CARD = "bg-white/55 dark:bg-black/45 backdrop-blur-md border-border";
const NO_CLASSIFICATION = "__none__";

export default function PlannerPage() {
  const { record, status, signedIn, loaded, update, retrySync } = useAcademicRecord();
  const courses = useMemo(() => activeCourses(record), [record]);
  const codes = useMemo(() => courses.map((c) => c.code), [courses]);
  const existing = useMemo(() => new Set(codes), [codes]);
  const { info } = useCoursePrereqs(codes);

  return (
    <div className="min-h-screen relative" style={{ background: "var(--app-bg-gradient)" }}>
      <Navigation variant="glass" />
      <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="rounded-2xl border border-border bg-white/55 dark:bg-black/45 backdrop-blur-md p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="w-6 h-6 text-accent" />
                <h1 className="text-3xl font-bold text-text-heading dark:text-white">
                  Degree Planner
                </h1>
              </div>
              <p className="max-w-2xl text-sm text-text-body dark:text-white/80">
                Add the classes you&apos;ve taken, are taking, or plan to take. We use them
                to check prerequisites, so you only see classes you can actually sign up for.
              </p>
            </div>
            <SyncBadge status={status} signedIn={signedIn} onRetry={() => void retrySync()} />
          </div>
        </div>

        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">My courses</TabsTrigger>
            <TabsTrigger value="check">Can I take…?</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card className={CARD}>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-text-heading dark:text-white">
                      Add courses
                    </h2>
                    <p className="text-sm text-text-body dark:text-white/70">
                      Search for one at a time, or paste a whole list.
                    </p>
                  </div>
                  <ClassificationPicker
                    value={record.classification ?? null}
                    onChange={(c) => update((r) => setClassification(r, c))}
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <CourseSearch
                      existing={existing}
                      onSelect={(code) =>
                        update((r) =>
                          upsertCourses(r, [{ code, status: "completed", source: "manual" }]),
                        )
                      }
                    />
                  </div>
                  <PasteImportDialog
                    existing={existing}
                    onImport={(inputs) =>
                      update((r) =>
                        upsertCourses(
                          r,
                          inputs.map((input) => {
                            const prev = activeCourses(r).find((c) => c.code === input.code);
                            return {
                              ...input,
                              grade: input.grade ?? prev?.grade ?? null,
                              term: input.term ?? prev?.term ?? null,
                            };
                          }),
                        ),
                      )
                    }
                  />
                </div>
                <p className="text-xs text-text-body/80 dark:text-white/60">
                  New courses are added as completed. Set the term, grade, and status on each
                  one below. Grades matter for prerequisites that need a C or better.
                </p>
              </CardContent>
            </Card>

            <Card className={CARD}>
              <CardContent className="p-6">
                {!loaded ? (
                  <p className="flex items-center gap-2 text-sm text-text-body">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading your courses…
                  </p>
                ) : courses.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="font-medium text-text-heading dark:text-white">No courses yet</p>
                    <p className="mt-1 text-sm text-text-body dark:text-white/70">
                      Search above or paste a list to get started.
                    </p>
                  </div>
                ) : (
                  <RecordList
                    courses={courses}
                    info={info}
                    onEdit={(code, patch) => update((r) => updateCourse(r, code, patch))}
                    onRemove={(code) => update((r) => removeCourse(r, code))}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="check">
            <Card className={CARD}>
              <CardContent className="space-y-4 p-6">
                <div>
                  <h2 className="text-lg font-semibold text-text-heading dark:text-white">
                    Can I take this class?
                  </h2>
                  <p className="text-sm text-text-body dark:text-white/70">
                    Checks the catalog prerequisites against your courses as of the term you
                    pick. Classes in progress or planned for earlier terms count as done.
                  </p>
                </div>
                <PrereqCheck record={record} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function ClassificationPicker({
  value,
  onChange,
}: {
  value: Classification | null;
  onChange: (c: Classification | null) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text-body dark:text-white/80">
      Classification
      <Select
        value={value ?? NO_CLASSIFICATION}
        onValueChange={(v) => onChange(v === NO_CLASSIFICATION ? null : (v as Classification))}
      >
        <SelectTrigger className="h-8 w-[9rem] text-xs" aria-label="Classification">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_CLASSIFICATION}>Not set</SelectItem>
          {CLASSIFICATIONS.map((c) => (
            <SelectItem key={c} value={c}>
              {c[0].toUpperCase() + c.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function SyncBadge({
  status,
  signedIn,
  onRetry,
}: {
  status: RecordSyncStatus;
  signedIn: boolean;
  onRetry: () => void;
}) {
  const base = "flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs";
  if (status === "loading" || status === "syncing") {
    return (
      <span className={base}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> {signedIn ? "Syncing" : "Loading"}
      </span>
    );
  }
  if (status === "synced") {
    return (
      <span className={base}>
        <Cloud className="h-3.5 w-3.5 text-emerald-600" /> Saved to your account
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className={`${base} border-amber-500/50`}>
        <CloudOff className="h-3.5 w-3.5 text-amber-600" /> Saved on this device only
        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs" onClick={onRetry}>
          <RefreshCw className="h-3 w-3" /> Retry
        </Button>
      </span>
    );
  }
  return (
    <span className={base}>
      <HardDrive className="h-3.5 w-3.5" /> Saved on this device.{" "}
      <Link href="/auth" className="font-medium underline">
        Sign in
      </Link>{" "}
      to keep it everywhere
    </span>
  );
}
