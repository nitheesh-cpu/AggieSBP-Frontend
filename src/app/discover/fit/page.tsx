"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getTerms,
  getDiscoverFitMatches,
  postDiscoverFitSectionAttributeOptions,
  postDiscoverFitSectionCampusOptions,
  type DiscoverFitCourseMatch,
  type DiscoverFitSeatFilter,
} from "@/lib/api";
import {
  Loader2,
  CalendarClock,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Filter,
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

/** Radix Select cannot use empty string as a value; maps to “any campus”. */
const FIT_CAMPUS_SELECT_ANY = "__fit_campus_any__";

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

function normalizeUccCategory(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

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

function buildFitResults(
  candidates: DiscoverCourse[],
  matches: DiscoverFitCourseMatch[],
): FitResult[] {
  const matchMap = new Map<string, DiscoverFitCourseMatch>();
  for (const m of matches) {
    matchMap.set(m.course_key.toUpperCase(), m);
  }
  return candidates
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
  const [seatFilter, setSeatFilter] = useState<DiscoverFitSeatFilter>("any");
  const [selectedAttributeDescs, setSelectedAttributeDescs] = useState<string[]>([]);
  const [attributeOptions, setAttributeOptions] = useState<string[]>([]);
  const [sectionCampus, setSectionCampus] = useState("");
  const [campusOptions, setCampusOptions] = useState<string[]>([]);
  const [attributeSearch, setAttributeSearch] = useState("");
  const [filteringFit, setFilteringFit] = useState(false);
  const [fitReady, setFitReady] = useState(false);
  const hasCompletedFitOnceRef = useRef(false);
  const filterRequestId = useRef(0);
  const coursesRef = useRef(courses);
  const blocksRef = useRef(blocks);
  const termCodeRef = useRef(termCode);
  coursesRef.current = courses;
  blocksRef.current = blocks;
  termCodeRef.current = termCode;

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

  useEffect(() => {
    if (!hasCompletedFitOnceRef.current) return;
    if (!termCodeRef.current || coursesRef.current.length === 0) return;
    if (blockValidationError) return;
    const reqId = ++filterRequestId.current;
    let cancelled = false;
    void (async () => {
      setFilteringFit(true);
      try {
        const list = coursesRef.current;
        const matches = await getDiscoverFitMatches(
          termCodeRef.current,
          list.map((c) => `${c.dept}-${c.courseNumber}`),
          blocksRef.current.map((b) => ({
            days: b.days,
            start: b.start,
            end: b.end,
          })),
          {
            seatFilter,
            sectionAttributeDescs: selectedAttributeDescs,
            ...(sectionCampus.trim()
              ? { sectionCampus: sectionCampus.trim() }
              : {}),
          },
        );
        if (cancelled || filterRequestId.current !== reqId) return;
        setFitResults(buildFitResults(list, matches));
      } catch (e) {
        if (!cancelled && filterRequestId.current === reqId) {
          setError(e instanceof Error ? e.message : "Failed to update fit filters.");
        }
      } finally {
        if (!cancelled && filterRequestId.current === reqId) {
          setFilteringFit(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [seatFilter, selectedAttributeDescs, sectionCampus, blockValidationError]);

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

  const filteredAttributeOptions = useMemo(() => {
    const q = attributeSearch.trim().toLowerCase();
    if (!q) return attributeOptions;
    return attributeOptions.filter((a) => a.toLowerCase().includes(q));
  }, [attributeOptions, attributeSearch]);

  const hasActiveSectionFilters =
    seatFilter !== "any" ||
    selectedAttributeDescs.length > 0 ||
    sectionCampus.trim().length > 0;

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

    const selectedNormalized = new Set(
      selectedUccs.map((value) => normalizeUccCategory(value)),
    );
    const uccRes = await fetch(`${API_BASE_URL}/discover/${termCode}/ucc`);
    if (!uccRes.ok) throw new Error("Failed to load UCC courses.");
    const uccData = (await uccRes.json()) as UccGroup[];
    const groups = (Array.isArray(uccData) ? uccData : []).filter((g) =>
      selectedNormalized.has(normalizeUccCategory(g.category ?? "")),
    );
    let merged = groups.flatMap((g) => g.courses ?? []);

    // Fallback for terms where the heavy /ucc query returns no rows.
    if (merged.length === 0) {
      const fallbackRes = await fetch(
        `${API_BASE_URL}/discover/${termCode}/ucc-fit-candidates`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categories: selectedUccs }),
        },
      );
      if (!fallbackRes.ok) {
        throw new Error("Failed to load UCC courses.");
      }
      const fallbackData = (await fallbackRes.json()) as DiscoverCourse[];
      merged = Array.isArray(fallbackData) ? fallbackData : [];
    }

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
    setSeatFilter("any");
    setSelectedAttributeDescs([]);
    setSectionCampus("");
    setAttributeSearch("");
    setAttributeOptions([]);
    setCampusOptions([]);
    hasCompletedFitOnceRef.current = false;
    setFitReady(false);
    try {
      const candidates = await fetchCandidates();
      setCourses(candidates);
      if (candidates.length === 0) {
        setFitResults([]);
        if (mode === "ucc") {
          setError(
            "No candidate courses found for the selected UCC categories in this term.",
          );
        } else {
          setError("No candidate courses found for the selected departments.");
        }
        return;
      }
      const courseKeys = candidates.map((c) => `${c.dept}-${c.courseNumber}`);
      const matches = await getDiscoverFitMatches(
        termCode,
        courseKeys,
        blocks.map((b) => ({
          days: b.days,
          start: b.start,
          end: b.end,
        })),
        { seatFilter: "any", sectionAttributeDescs: [] },
      );
      setFitResults(buildFitResults(candidates, matches));
      try {
        const [attrOpts, siteOpts] = await Promise.all([
          postDiscoverFitSectionAttributeOptions(termCode, courseKeys),
          postDiscoverFitSectionCampusOptions(termCode, courseKeys),
        ]);
        setAttributeOptions(Array.isArray(attrOpts) ? attrOpts : []);
        setCampusOptions(Array.isArray(siteOpts) ? siteOpts : []);
      } catch {
        setAttributeOptions([]);
        setCampusOptions([]);
      }
      hasCompletedFitOnceRef.current = true;
      setFitReady(true);
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
    hasCompletedFitOnceRef.current = false;
    setFitReady(false);
    setSeatFilter("any");
    setSelectedAttributeDescs([]);
    setSectionCampus("");
    setAttributeOptions([]);
    setCampusOptions([]);
  };

  const toggleUcc = (category: string) => {
    setSelectedUccs((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setCourses([]);
    setFitResults([]);
    hasCompletedFitOnceRef.current = false;
    setFitReady(false);
    setSeatFilter("any");
    setSelectedAttributeDescs([]);
    setSectionCampus("");
    setAttributeOptions([]);
    setCampusOptions([]);
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
              hasCompletedFitOnceRef.current = false;
              setFitReady(false);
              setSeatFilter("any");
              setSelectedAttributeDescs([]);
              setSectionCampus("");
              setAttributeOptions([]);
              setCampusOptions([]);
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
                    hasCompletedFitOnceRef.current = false;
                    setFitReady(false);
                    setSeatFilter("any");
                    setSelectedAttributeDescs([]);
                    setSectionCampus("");
                    setAttributeOptions([]);
                    setCampusOptions([]);
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
            {fitResults.length} of {courses.length} candidate classes
            {hasActiveSectionFilters
              ? " have at least one section that fits your schedule and matches the filters below."
              : " have at least one section that fits your current schedule."}
          </p>
        )}

        {!loadingCandidates && courses.length > 0 && !loadingFit && (
          <Card className="bg-white/55 dark:bg-black/45 backdrop-blur-md border-border">
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                <div className="flex items-center gap-2 text-text-heading dark:text-white">
                  <Filter className="w-4 h-4 shrink-0 text-accent" />
                  <span className="text-sm font-semibold">Refine by section</span>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <Label className="text-xs text-text-body dark:text-white/70">
                    Campus
                  </Label>
                  <Select
                    value={sectionCampus.trim() ? sectionCampus : FIT_CAMPUS_SELECT_ANY}
                    onValueChange={(v) =>
                      setSectionCampus(v === FIT_CAMPUS_SELECT_ANY ? "" : v)
                    }
                  >
                    <SelectTrigger className="h-9 w-full sm:w-[220px]">
                      <SelectValue placeholder="Any campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FIT_CAMPUS_SELECT_ANY}>Any campus</SelectItem>
                      {campusOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <Label className="text-xs text-text-body dark:text-white/70">
                    Seats
                  </Label>
                  <Select
                    value={seatFilter}
                    onValueChange={(v) => setSeatFilter(v as DiscoverFitSeatFilter)}
                  >
                    <SelectTrigger className="h-9 w-full sm:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Open or full</SelectItem>
                      <SelectItem value="open">Open only</SelectItem>
                      <SelectItem value="full">Full only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[220px]">
                  <Label className="text-xs text-text-body dark:text-white/70">
                    Catalog attributes
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 w-full sm:w-[260px] justify-between font-normal"
                        type="button"
                      >
                        <span className="truncate text-left">
                          {selectedAttributeDescs.length === 0
                            ? "Any attribute"
                            : `${selectedAttributeDescs.length} selected`}
                        </span>
                        <ChevronDown className="w-4 h-4 shrink-0 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[min(100vw-2rem,380px)] p-0" align="start">
                      <div className="p-2 border-b border-border">
                        <Input
                          placeholder="Search attributes…"
                          value={attributeSearch}
                          onChange={(e) => setAttributeSearch(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <ScrollArea className="h-[min(50vh,280px)]">
                        <div className="p-2 space-y-1">
                          {attributeOptions.length === 0 && (
                            <p className="text-xs text-text-body dark:text-white/60 px-1 py-2">
                              No attribute list for these courses (data may be missing for this
                              term).
                            </p>
                          )}
                          {filteredAttributeOptions.map((attr) => {
                            const checked = selectedAttributeDescs.includes(attr);
                            return (
                              <label
                                key={attr}
                                className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() => {
                                    setSelectedAttributeDescs((prev) =>
                                      prev.includes(attr)
                                        ? prev.filter((x) => x !== attr)
                                        : [...prev, attr],
                                    );
                                  }}
                                  className="mt-0.5"
                                />
                                <span className="text-xs leading-snug text-text-body dark:text-white/80">
                                  {attr}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      {selectedAttributeDescs.length > 0 && (
                        <div className="p-2 border-t border-border">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-full text-xs"
                            onClick={() => setSelectedAttributeDescs([])}
                          >
                            Clear attributes
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-xs text-text-body dark:text-white/60 max-w-xl">
                  <span className="font-medium text-text-heading/90 dark:text-white/70">
                    Campus
                  </span>{" "}
                  uses the registration site on each section (College Station vs Galveston, etc.).
                  <span className="font-medium text-text-heading/90 dark:text-white/70">
                    {" "}
                    Catalog attributes
                  </span>{" "}
                  come from Howdy’s attribute list (UCC tags, honors, distance, etc.); multiple
                  selections match if a section has any one of them (OR). Counts only include
                  sections that fit your time blocks and pass the seat filter.
                </p>
              </div>

              {filteringFit && (
                <p className="text-sm text-text-body dark:text-white/75 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  Updating results…
                </p>
              )}

              {!filteringFit && fitResults.length > 0 && (
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
              )}

              {!filteringFit && fitResults.length === 0 && fitReady && (
                <p className="text-sm text-text-body dark:text-white/75">
                  {hasActiveSectionFilters
                    ? "No courses still have a compatible section under these filters. Try “Any campus”, “Open or full”, clearing catalog attributes, or broadening your search."
                    : "None of the candidate courses have a section that fits your current time blocks."}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
