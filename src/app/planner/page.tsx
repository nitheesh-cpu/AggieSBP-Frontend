"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Cloud, CloudOff, HardDrive, Loader2, RefreshCw, School } from "lucide-react";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { PageBanner } from "@/components/page-banner";
import { CourseSearch } from "@/components/planner/course-search";
import { FindCourses } from "@/components/planner/find-courses";
import { HowdyImportDialog } from "@/components/planner/howdy-import-dialog";
import { PasteImportDialog } from "@/components/planner/paste-import-dialog";
import { RecordList } from "@/components/planner/record-list";
import { ScheduleBuilder } from "@/components/planner/schedule-builder";
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
import { useDegreePlan } from "@/hooks/use-degree-plan";
import { getTerms, type Term } from "@/lib/api";
import { track } from "@/lib/analytics";
import { pickDefaultTerm } from "@/lib/terms";
import {
  parseHowdyFragment,
  parseHowdyPayload,
  serializeHowdy,
  type HowdyImport,
} from "@/lib/planner/howdy";
import {
  activeCourses,
  CLASSIFICATIONS,
  removeCourse,
  setClassification,
  updateCourse,
  upsertCourses,
  type Classification,
} from "@/lib/planner/record";

const CARD = "bg-white/55 dark:bg-card backdrop-blur-md border-border";
const NO_CLASSIFICATION = "__none__";
const HOWDY_PENDING_KEY = "aggiesbp:planner:howdy-import";

function readPendingHowdy(): HowdyImport | null {
  try {
    const raw = window.sessionStorage.getItem(HOWDY_PENDING_KEY);
    return raw ? parseHowdyPayload(raw) : null;
  } catch {
    return null;
  }
}

export default function PlannerPage() {
  const { record, status, signedIn, loaded, update, retrySync } = useAcademicRecord();
  const courses = useMemo(() => activeCourses(record), [record]);
  const codes = useMemo(() => courses.map((c) => c.code), [courses]);
  const existing = useMemo(() => new Set(codes), [codes]);
  const { info } = useCoursePrereqs(codes);
  const degreePlan = useDegreePlan();
  const [tab, setTab] = useState("courses");
  const syncStatus = combineStatus(status, degreePlan.status);
  const existingByCode = useMemo(() => new Map(courses.map((c) => [c.code, c])), [courses]);
  const noRequirements = useMemo(() => new Set<string>(), []);

  // One term for finding electives and building the schedule.
  const [terms, setTerms] = useState<Term[]>([]);
  const [term, setTerm] = useState("");
  useEffect(() => {
    getTerms()
      .then((t) => {
        setTerms(t);
        setTerm((cur) => cur || pickDefaultTerm(t));
      })
      .catch(() => setTerms([]));
  }, []);

  // Courses sent from Howdy by the extension arrive as #howdy=...; keep them in
  // sessionStorage so they survive the sign-in redirect, and drop the hash.
  const [howdy, setHowdy] = useState<HowdyImport | null>(null);
  const [howdyOpen, setHowdyOpen] = useState(false);
  useEffect(() => {
    const read = () => {
      const fromHash = parseHowdyFragment(window.location.hash);
      if (fromHash) {
        try {
          window.sessionStorage.setItem(HOWDY_PENDING_KEY, serializeHowdy(fromHash));
        } catch {
          // Storage blocked: the import still works for this page view.
        }
        // After Next's own mount (which rewrites the URL), and keeping its history
        // state, so the hash doesn't come back.
        window.setTimeout(() => {
          window.history.replaceState(
            window.history.state,
            "",
            window.location.pathname + window.location.search,
          );
        }, 0);
      }
      const found = fromHash ?? readPendingHowdy();
      const pending = found && found.courses.length > 0 ? { ...found, requirements: [] } : null;
      if (pending) {
        setHowdy(pending);
        setHowdyOpen(true);
        setTab("courses");
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  const clearHowdy = () => {
    setHowdy(null);
    setHowdyOpen(false);
    try {
      window.sessionStorage.removeItem(HOWDY_PENDING_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-clip" style={{ background: "var(--app-bg-gradient)" }}>
      <Navigation variant="glass" />
      <PageBanner
        title="Schedule builder"
        subtitle={<>Tell us what you&apos;ve taken, star the electives you&apos;d take, and get schedules that fit, easiest first.</>}
      />
      <main className="pt-10 pb-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-text-body">Your courses and starred electives</p>
            <SyncBadge
              status={syncStatus}
              signedIn={signedIn}
              onRetry={() => {
                void retrySync();
                void degreePlan.retrySync();
              }}
            />
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="courses">1 · What you&apos;ve taken</TabsTrigger>
            <TabsTrigger value="find">2 · Find electives</TabsTrigger>
            <TabsTrigger value="build">3 · Build schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card className={CARD}>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-text-heading">
                      Add courses
                    </h2>
                    <p className="text-sm text-text-body">
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
                    onImport={(inputs) => {
                      track("courses-import", { source: "paste", courses: inputs.length });
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
                      );
                    }}
                  />
                  <Button variant="outline" className="gap-2" onClick={() => setHowdyOpen(true)}>
                    <School className="h-4 w-4" />
                    {howdy ? "Review Howdy import" : "Import from Howdy"}
                  </Button>
                </div>
                <HowdyImportDialog
                  open={howdyOpen}
                  onOpenChange={setHowdyOpen}
                  pending={howdy}
                  signedIn={signedIn}
                  authReady={loaded}
                  existing={existingByCode}
                  existingRequirements={noRequirements}
                  onImport={(inputs) => {
                    if (inputs.length > 0) update((r) => upsertCourses(r, inputs));
                    track("courses-import", { source: "howdy", courses: inputs.length });
                    clearHowdy();
                  }}
                  onDiscard={clearHowdy}
                />
                <p className="text-xs text-text-muted">
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
                    <p className="font-medium text-text-heading">No courses yet</p>
                    <p className="mt-1 text-sm text-text-body">
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

          <TabsContent value="find" forceMount className="data-[state=inactive]:hidden">
            <Card className={CARD}>
              <CardContent className="space-y-4 p-6">
                <div>
                  <h2 className="text-lg font-medium text-text-heading">Find electives</h2>
                  <p className="text-sm text-text-body">
                    Courses offered in a term, easiest first. Ones you&apos;ve taken or
                    can&apos;t take yet are hidden. Star the ones you&apos;d take, then build a
                    schedule from them.
                  </p>
                </div>
                <FindCourses
                  record={record}
                  plan={degreePlan.plan}
                  update={degreePlan.update}
                  terms={terms}
                  term={term}
                  onTermChange={setTerm}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="build" forceMount className="data-[state=inactive]:hidden">
            <Card className={CARD}>
              <CardContent className="space-y-4 p-6">
                <div>
                  <h2 className="text-lg font-medium text-text-heading">Build your schedule</h2>
                  <p className="text-sm text-text-body">
                    Your set classes plus electives from your starred list, every way they fit
                    together, ranked by how easy this term&apos;s professors are.
                  </p>
                </div>
                <ScheduleBuilder
                  record={record}
                  plan={degreePlan.plan}
                  update={degreePlan.update}
                  terms={terms}
                  term={term}
                  onTermChange={setTerm}
                  onFindElectives={() => setTab("find")}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

/** One badge for both documents: the least settled state wins. */
function combineStatus(a: RecordSyncStatus, b: RecordSyncStatus): RecordSyncStatus {
  for (const s of ["error", "loading", "syncing", "local"] as const) {
    if (a === s || b === s) return s;
  }
  return "synced";
}

function ClassificationPicker({
  value,
  onChange,
}: {
  value: Classification | null;
  onChange: (c: Classification | null) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text-body">
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
