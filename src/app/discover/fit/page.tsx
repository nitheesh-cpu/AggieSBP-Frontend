"use client";

import React, { useMemo, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getTerms,
  getDiscoverFitMatches,
  type DiscoverFitCourseMatch,
} from "@/lib/api";
import {
  Loader2,
  CalendarClock,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

type Day = "M" | "T" | "W" | "R" | "F";
type ScheduleBlock = { id: string; days: Day[]; start: string; end: string };
type Term = { termCode: string; termDesc: string };
type DiscoverCourse = {
  dept: string;
  courseNumber: string;
  courseTitle: string;
  easinessScore: number;
};
type UccGroup = { category: string; courses: DiscoverCourse[] };
type FitResult = {
  course: DiscoverCourse;
  compatibleSectionCount: number;
  sampleCrn: string | null;
};
type DiscoverDepartment = { code: string; name: string | null };
type DepartmentApiItem = { code?: string; name?: string };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

const UCC_CATEGORY_OPTIONS = [
  "Core American History (KHIS)",
  "Core Communication (KCOM)",
  "Core Creative Arts (KCRA)",
  "Core Fed Gov/Pol Sci (KPLF)",
  "Core Lang, Phil, Culture(KLPC)",
  "Core Life/Physical Sci (KLPS)",
  "Core Local Gov/Pol Sci (KPLL)",
  "Core Mathematics (KMTH)",
  "Core Social & Beh Sci (KSOC)",
  "Univ Req-Cult Discourse (KUCD)",
  "Univ Req-Int'l&Cult Div (KICD)",
];

function parseTimeToMinutes(time: string): number {
  const clean = time.replace(":", "");
  if (clean.length !== 4) return -1;
  const hh = Number(clean.slice(0, 2));
  const mm = Number(clean.slice(2, 4));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return -1;
  return hh * 60 + mm;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  const hh = h.toString().padStart(2, "0");
  const mm = m.toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function DiscoverFitPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [termCode, setTermCode] = useState("");
  const [mode, setMode] = useState<"ucc" | "department">("ucc");
  const [departments, setDepartments] = useState<DiscoverDepartment[]>(
    [],
  );
  const [allDepartments, setAllDepartments] = useState<DiscoverDepartment[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedUccs, setSelectedUccs] = useState<string[]>([
    UCC_CATEGORY_OPTIONS[0],
  ]);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([
    { id: `${Date.now()}-0`, days: ["M", "W", "F"], start: "09:00", end: "10:15" },
  ]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingFit, setLoadingFit] = useState(false);
  const [courses, setCourses] = useState<DiscoverCourse[]>([]);
  const [fitResults, setFitResults] = useState<FitResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("importSchedule");
    if (!raw) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as Array<{
        days?: Day[];
        day?: Day;
        start: string;
        end: string;
      }>;
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      const imported = parsed
        .map((b, idx) => ({
          id: `${Date.now()}-import-${idx}`,
          days:
            Array.isArray(b.days) && b.days.length > 0
              ? b.days.filter((d): d is Day =>
                  ["M", "T", "W", "R", "F"].includes(d),
                )
              : b.day
                ? [b.day]
                : [],
          start: b.start,
          end: b.end,
        }))
        .filter((b) => b.days.length > 0 && b.start && b.end);
      if (imported.length > 0) setBlocks(imported);
    } catch {
      // ignore malformed import payload
    }
  }, []);

  React.useEffect(() => {
    void (async () => {
      try {
        const t = await getTerms();
        setTerms(t);
      } catch {
        setError("Failed to load terms.");
      }
    })();
  }, []);

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/departments?limit=1000`);
        const data = (await res.json()) as DepartmentApiItem[];
        const normalized = (Array.isArray(data) ? data : [])
          .map((d) => {
            const rawName = String(d.name ?? "");
            const code =
              d.code ||
              (rawName.includes(" - ") ? rawName.split(" - ")[0].trim() : rawName.trim());
            const name =
              rawName.includes(" - ")
                ? rawName.split(" - ").slice(1).join(" - ").trim()
                : rawName || null;
            return { code: String(code || "").trim(), name: name || null };
          })
          .filter((d) => d.code.length > 0);
        setAllDepartments(normalized);
      } catch {
        setAllDepartments([]);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!termCode) return;
    void (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/discover/${termCode}/departments`);
        const data = await res.json();
        setDepartments(
          Array.isArray(data)
            ? data.map((d) => ({
                code: String(d.code ?? ""),
                name: d.name ?? null,
              }))
            : [],
        );
        setSelectedDepartments([]);
      } catch {
        setDepartments([]);
        setSelectedDepartments([]);
      }
    })();
  }, [termCode]);

  const blockValidationError = useMemo(() => {
    for (const b of blocks) {
      const s = parseTimeToMinutes(b.start);
      const e = parseTimeToMinutes(b.end);
      if (s < 0 || e < 0 || s >= e) return "One or more time blocks is invalid.";
    }
    return null;
  }, [blocks]);

  const filteredDepartments = useMemo(() => {
    const source = termCode ? departments : allDepartments;
    const q = departmentSearch.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (d) =>
        (d.code || "").toLowerCase().includes(q) ||
        (d.name || "").toLowerCase().includes(q),
    );
  }, [departments, allDepartments, departmentSearch, termCode]);

  const addBlock = () =>
    setBlocks((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, days: ["T", "R"], start: "13:00", end: "14:15" },
    ]);

  const updateBlock = (id: string, partial: Partial<ScheduleBlock>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...partial } : b)));

  const removeBlock = (id: string) =>
    setBlocks((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== id) : prev));

  const tryAutoFillFromExtension = () => {
    try {
      const raw = localStorage.getItem("aggiesbp-current-schedule");
      if (!raw) {
        setError(
          "No extension schedule found yet. Enter blocks manually for now.",
        );
        return;
      }
      const parsed = JSON.parse(raw) as Array<{ day: Day; start: string; end: string }>;
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      setBlocks(
        parsed.map((p) => ({
          id: crypto.randomUUID(),
          days: [p.day],
          start: p.start,
          end: p.end,
        })),
      );
      setError(null);
    } catch {
      setError("Could not read extension schedule. Use manual entry.");
    }
  };

  const fetchCandidates = async (): Promise<DiscoverCourse[]> => {
    if (!termCode) throw new Error("Select a term.");
    if (mode === "department" && selectedDepartments.length === 0) {
      throw new Error("Select at least one department.");
    }
    if (mode === "ucc" && selectedUccs.length === 0) {
      throw new Error("Select at least one core curriculum category.");
    }

    if (mode === "department") {
      const responses = await Promise.all(
        selectedDepartments.map(async (deptCode) => {
          const res = await fetch(`${API_BASE_URL}/discover/${termCode}/${deptCode}`);
          if (!res.ok) throw new Error(`Failed to load courses for ${deptCode}.`);
          const data = (await res.json()) as DiscoverCourse[];
          return Array.isArray(data) ? data : [];
        }),
      );
      const merged = responses.flat();
      const unique = new Map<string, DiscoverCourse>();
      for (const course of merged) {
        const key = `${course.dept}-${course.courseNumber}`;
        if (!unique.has(key)) unique.set(key, course);
      }
      return Array.from(unique.values()).slice(0, 120);
    }

    const res = await fetch(`${API_BASE_URL}/discover/${termCode}/ucc`);
    if (!res.ok) throw new Error("Failed to load UCC courses.");
    const data = (await res.json()) as UccGroup[];
    const groups = (Array.isArray(data) ? data : []).filter((g) =>
      selectedUccs.includes(g.category),
    );
    const merged = groups.flatMap((g) => g.courses ?? []);
    const unique = new Map<string, DiscoverCourse>();
    for (const course of merged) {
      const key = `${course.dept}-${course.courseNumber}`;
      if (!unique.has(key)) unique.set(key, course);
    }
    return Array.from(unique.values()).slice(0, 120);
  };

  const loadCandidates = async () => {
    setError(null);
    if (blockValidationError) return setError(blockValidationError);
    setLoadingCandidates(true);
    setLoadingFit(true);
    setFitResults([]);
    try {
      const candidates = await fetchCandidates();
      setCourses(candidates);
      const courseKeys = candidates.map((c) => `${c.dept}-${c.courseNumber}`);
      const matches = await getDiscoverFitMatches(
        termCode,
        courseKeys,
        blocks.map((b) => ({
          days: b.days,
          start: b.start,
          end: b.end,
        })),
      );
      const matchMap = new Map<string, DiscoverFitCourseMatch>();
      for (const m of matches) {
        matchMap.set(m.course_key.toUpperCase(), m);
      }
      const fits = candidates
        .map((c) => {
          const key = `${c.dept}-${c.courseNumber}`.toUpperCase();
          const found = matchMap.get(key);
          if (!found) return null;
          return {
            course: c,
            compatibleSectionCount: found.compatible_section_count,
            sampleCrn: found.sample_crn ?? null,
          };
        })
        .filter((v): v is FitResult => v !== null);
      setFitResults(fits);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load candidate classes.");
    } finally {
      setLoadingCandidates(false);
      setLoadingFit(false);
    }
  };

  const toggleDepartment = (deptCode: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptCode)
        ? prev.filter((d) => d !== deptCode)
        : [...prev, deptCode],
    );
    setCourses([]);
    setFitResults([]);
  };

  const toggleUcc = (category: string) => {
    setSelectedUccs((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setCourses([]);
    setFitResults([]);
  };

  const toggleBlockDay = (id: string, day: Day) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const hasDay = b.days.includes(day);
        const nextDays = hasDay ? b.days.filter((d) => d !== day) : [...b.days, day];
        // Keep at least one day selected per block
        return { ...b, days: nextDays.length > 0 ? nextDays : b.days };
      }),
    );
  };

  return (
    <div className="min-h-screen relative" style={{ background: "var(--app-bg-gradient)" }}>
      <Navigation variant="glass" />
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6 space-y-6">
        <div className="rounded-2xl border border-border bg-white/55 dark:bg-black/45 backdrop-blur-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <CalendarClock className="w-6 h-6 text-accent" />
            <h1 className="text-3xl font-bold text-text-heading dark:text-white">
              Fit My Schedule
            </h1>
          </div>
          <p className="text-sm text-text-body dark:text-white/70">
            Build your current time blocks, then find UCC or department classes with at least one
            section that does not conflict.
          </p>
        </div>

        <Card className="bg-white/55 dark:bg-black/45 backdrop-blur-md border-border">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={termCode} onValueChange={setTermCode}>
            <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
            <SelectContent>
              {terms.map((t) => (
                <SelectItem key={t.termCode} value={t.termCode}>{t.termDesc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={mode}
            onValueChange={(v) => {
              setMode(v as "ucc" | "department");
              setCourses([]);
              setFitResults([]);
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ucc">Filter by UCC</SelectItem>
              <SelectItem value="department">Filter by department</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden md:block" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium text-text-heading dark:text-white">
                  {mode === "ucc"
                    ? "Select one or more core curriculum categories"
                    : "Select one or more departments"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (mode === "ucc") setSelectedUccs([]);
                    else setSelectedDepartments([]);
                    setCourses([]);
                    setFitResults([]);
                  }}
                >
                  Clear selected
                </Button>
              </div>
              <div className="rounded-md border border-border p-2">
                <div className="flex flex-wrap gap-2">
                  {mode === "ucc" ? (
                    UCC_CATEGORY_OPTIONS.map((u) => {
                        const active = selectedUccs.includes(u);
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => toggleUcc(u)}
                            className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
                              active
                                ? "bg-[#500000] text-white border-[#500000] dark:bg-[#FFCF3F] dark:text-black dark:border-[#FFCF3F]"
                                : "bg-card text-text-body border-border hover:bg-black/5 dark:bg-black/25 dark:text-white/80 dark:border-white/15 dark:hover:bg-white/10"
                            }`}
                          >
                            {u}
                          </button>
                        );
                      })
                  ) : (
                    <div className="w-full space-y-3">
                      <Input
                        placeholder="Search departments by code or name..."
                        value={departmentSearch}
                        onChange={(e) => setDepartmentSearch(e.target.value)}
                        className="h-9"
                      />
                      <div className="text-xs text-text-body dark:text-white/70">
                        {termCode
                          ? "Click a department to add it below"
                          : "Searching all departments. Choose a term before running fit check."}
                      </div>
                      <div className="max-h-28 overflow-y-auto rounded-md border border-border p-2">
                        <div className="flex flex-wrap gap-2">
                          {filteredDepartments
                            .filter((d) => !selectedDepartments.includes(d.code))
                            .map((d) => (
                              <button
                                key={d.code}
                                type="button"
                                onClick={() => toggleDepartment(d.code)}
                                className="rounded-full px-3 py-1.5 text-xs border transition-colors bg-card text-text-body border-border hover:bg-black/5 dark:bg-black/25 dark:text-white/80 dark:border-white/15 dark:hover:bg-white/10"
                              title={d.name ?? d.code}
                              >
                              {d.code}
                              </button>
                            ))}
                          {filteredDepartments.filter(
                            (d) => !selectedDepartments.includes(d.code),
                          ).length === 0 && (
                            <span className="text-xs text-text-body dark:text-white/60">
                              No matching departments.
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-text-heading dark:text-white mb-2">
                          Selected departments
                        </div>
                        <div className="min-h-10 rounded-md border border-border p-2">
                          <div className="flex flex-wrap gap-2">
                            {selectedDepartments.length === 0 && (
                              <span className="text-xs text-text-body dark:text-white/60">
                                No departments selected yet.
                              </span>
                            )}
                            {selectedDepartments.map((code) => {
                              const dept = departments.find((d) => d.code === code);
                              return (
                                <button
                                  key={code}
                                  type="button"
                                  onClick={() => toggleDepartment(code)}
                                  className="rounded-full px-3 py-1.5 text-xs border transition-colors bg-[#500000] text-white border-[#500000] dark:bg-[#FFCF3F] dark:text-black dark:border-[#FFCF3F]"
                                  title={`Remove ${dept?.name ?? code}`}
                                >
                                  {dept?.name ? `${code} - ${dept.name}` : code} ×
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-text-body dark:text-white/70">
                {mode === "ucc"
                  ? `${selectedUccs.length} selected`
                  : `${selectedDepartments.length} selected`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/55 dark:bg-black/45 backdrop-blur-md border-border">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="font-semibold text-text-heading dark:text-white">Current schedule blocks</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={tryAutoFillFromExtension}>
                  Auto-fill from extension
                </Button>
                <Button variant="outline" onClick={addBlock}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add block
                </Button>
              </div>
            </div>
          {blocks.map((b) => (
            <div key={b.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="rounded-md border border-border p-2">
                <div className="flex flex-wrap gap-1">
                  {(["M", "T", "W", "R", "F"] as Day[]).map((d) => {
                    const active = b.days.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleBlockDay(b.id, d)}
                        className={`rounded-full px-2.5 py-1 text-xs border transition-colors ${
                          active
                            ? "bg-[#500000] text-white border-[#500000] dark:bg-[#FFCF3F] dark:text-black dark:border-[#FFCF3F]"
                            : "bg-card text-text-body border-border hover:bg-black/5 dark:bg-black/25 dark:text-white/80 dark:border-white/15 dark:hover:bg-white/10"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Input
                type="time"
                value={b.start}
                onChange={(e) => updateBlock(b.id, { start: e.target.value })}
              />
              <Input
                type="time"
                value={b.end}
                onChange={(e) => updateBlock(b.id, { end: e.target.value })}
              />
              <Button variant="outline" onClick={() => removeBlock(b.id)} className="w-full">
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          ))}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadCandidates}
            disabled={loadingCandidates || loadingFit}
            className="bg-[#500000] text-white hover:bg-[#3d0000] dark:bg-[#FFCF3F] dark:text-black dark:hover:bg-[#FFD966] rounded-full px-6 h-11 font-semibold shadow-sm"
          >
            {(loadingCandidates || loadingFit) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking fit...
              </>
            ) : (
              "Find classes that fit"
            )}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {!loadingCandidates && courses.length > 0 && (
          <p className="text-sm text-text-body dark:text-white/70">
            {fitResults.length} of {courses.length} candidate classes have at least one
            section that fits your current schedule.
          </p>
        )}

        {!loadingFit && fitResults.length > 0 && (
          <Card className="bg-white/55 dark:bg-black/45 backdrop-blur-md border-border">
            <CardContent className="pt-4">
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-black/5 dark:bg-white/5">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-semibold text-text-heading dark:text-white">
                        Course
                      </th>
                      <th className="px-3 py-2 font-semibold text-text-heading dark:text-white">
                        Title
                      </th>
                      <th className="px-3 py-2 font-semibold text-text-heading dark:text-white whitespace-nowrap">
                        Easiness
                      </th>
                      <th className="px-3 py-2 font-semibold text-text-heading dark:text-white whitespace-nowrap">
                        Compatible Sections
                      </th>
                      <th className="px-3 py-2 font-semibold text-text-heading dark:text-white whitespace-nowrap">
                        Example CRN
                      </th>
                      <th className="px-3 py-2 font-semibold text-text-heading dark:text-white text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fitResults.map(({ course, compatibleSectionCount, sampleCrn }) => (
                      <tr
                        key={`${course.dept}-${course.courseNumber}`}
                        className="border-t border-border/80"
                      >
                        <td className="px-3 py-2.5 font-medium text-text-heading dark:text-white whitespace-nowrap">
                          {course.dept} {course.courseNumber}
                        </td>
                        <td className="px-3 py-2.5 text-text-body dark:text-white/75 max-w-[360px] truncate">
                          {course.courseTitle}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <Badge className="bg-[#FFCF3F]/10 text-[#FFCF3F] border-transparent px-2 py-0.5">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {course.easinessScore.toFixed(1)}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-text-body dark:text-white/75 whitespace-nowrap">
                          {compatibleSectionCount}
                        </td>
                        <td className="px-3 py-2.5 text-text-body dark:text-white/75 whitespace-nowrap">
                          {sampleCrn ?? "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <Link
                            href={`/course/${`${course.dept}${course.courseNumber}`.replace(/\s+/g, "")}`}
                          >
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
