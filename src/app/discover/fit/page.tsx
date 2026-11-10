"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigation } from "@/components/navigation";
import { PageBanner } from "@/components/page-banner";
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
  getDiscoverGpaBoosters,
  getDiscoverFitMatches,
  getDiscoverCourseProfessors,
  getCourseProfessorsWithDetailsForTerm,
  postDiscoverFitSectionAttributeOptions,
  postDiscoverFitSectionCampusOptions,
  type DiscoverFitCourseMatch,
  type DiscoverFitSeatFilter,
  type DiscoverFitSection,
  type Term as ApiTerm,
} from "@/lib/api";
import { pickDefaultTerm, sortTermsForMenu } from "@/lib/terms";
import { EasinessBadge, EasinessLegend } from "@/components/easiness";
import { WatchSectionButton } from "@/components/watch-section-button";
import { EasinessPill } from "@/components/planner/course-state";
import { lastName } from "@/lib/planner/schedule-data";
import { parseMeetings, formatMeeting } from "@/lib/planner/section-times";
import {
  ProfessorSummaryPanel,
  ProfessorSummaryToggle,
  type ProfessorSummaryState,
} from "@/components/discover/professor-summary-toggle";
import type { DiscoverRow } from "@/lib/planner/find";
import { canonicalTopics, topicOf, topicKey, titleCase } from "@/lib/planner/topics";
import {
  Loader2,
  CalendarClock,
  MessageSquareText,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useAcademicRecord } from "@/hooks/use-academic-record";
import { useCoursePrereqs } from "@/hooks/use-course-prereqs";
import { buildContext, evaluateCourse, type Eligibility } from "@/lib/planner/prereqs";
import { activeCourses, currentTermKey, termKeyFromCode } from "@/lib/planner/record";

type Day = "M" | "T" | "W" | "R" | "F";
type ScheduleBlock = { id: string; days: Day[]; start: string; end: string };
type Term = ApiTerm;
type DiscoverCourse = {
  dept: string;
  courseNumber: string;
  courseTitle: string;
  easinessScore: number;
};
type FitResult = {
  course: DiscoverCourse;
  compatibleSectionCount: number;
  sampleCrn: string | null;
  sections: DiscoverFitSection[];
  /** Set on a special-topics card: the (upper-case) topic this card covers. */
  topic?: string | null;
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

type SectionScore = {
  score: number;
  lowConfidence: boolean;
  noGradeData: boolean;
};

/** Per-professor easiness for one section, matched by instructor last name within the course. */
function sectionScore(
  rows: DiscoverRow[] | undefined,
  instructor: string | null | undefined,
): SectionScore | null {
  const last = lastName(instructor);
  if (!rows || !last) return null;
  for (const r of rows) {
    if (typeof r.easinessScore !== "number") continue;
    if (lastName(r.professor?.lastName) !== last) continue;
    return {
      score: r.easinessScore,
      lowConfidence: (r.confidenceScore ?? 100) < 20,
      noGradeData: r.professor?.hasGradeData === false,
    };
  }
  return null;
}

function formatSectionMeetings(meetings: string | null | undefined): string {
  const raw = (meetings ?? "").trim();
  if (!raw) return "Time TBA / online";
  const parsed = parseMeetings(raw).map(formatMeeting).join("; ");
  return parsed || raw;
}

/** Course-level key (DEPT-NUM) of a card, shared by all topic cards of one course. */
function courseKeyOf(r: FitResult): string {
  return `${r.course.dept}-${r.course.courseNumber}`;
}

/** Topic-aware identity of a card; used for React keys and expansion state. */
function cardKeyOf(r: FitResult): string {
  return topicKey(courseKeyOf(r), r.topic);
}

/** Split one course's sections into one group per special topic (null = no topic title). */
function splitByTopic(sections: DiscoverFitSection[]): Map<string | null, DiscoverFitSection[]> {
  const raw = sections.map((s) => topicOf(s.title));
  // Titles get truncated inconsistently ("...DEV SYS" vs "...DEV SY"); the shared
  // helper merges those without merging distinct short topics.
  const canon = canonicalTopics(raw.filter((t): t is string => t !== null));
  const groups = new Map<string | null, DiscoverFitSection[]>();
  sections.forEach((s, i) => {
    const t = raw[i] === null ? null : (canon.get(raw[i]!) ?? raw[i]);
    const list = groups.get(t);
    if (list) list.push(s);
    else groups.set(t, [s]);
  });
  return groups;
}

function buildFitResults(
  candidates: DiscoverCourse[],
  matches: DiscoverFitCourseMatch[],
): FitResult[] {
  const matchMap = new Map<string, DiscoverFitCourseMatch>();
  for (const m of matches) {
    matchMap.set(m.course_key.toUpperCase(), m);
  }
  const results: FitResult[] = [];
  for (const c of candidates) {
    const key = `${c.dept}-${c.courseNumber}`.toUpperCase();
    const found = matchMap.get(key);
    if (!found) continue;
    const sections = found.sections ?? [];
    const groups = splitByTopic(sections);
    if (!Array.from(groups.keys()).some((t) => t !== null)) {
      results.push({
        course: c,
        compatibleSectionCount: found.compatible_section_count,
        sampleCrn: found.sample_crn ?? null,
        sections,
      });
      continue;
    }
    // Special topics: one card per topic, plus a plain card for untitled-topic sections.
    for (const [topic, group] of groups) {
      results.push({
        course: topic ? { ...c, courseTitle: titleCase(topic) } : c,
        compatibleSectionCount: group.length,
        sampleCrn: group[0]?.crn ?? null,
        sections: group,
        topic,
      });
    }
  }
  // Easiest first, like the other discover pages (stable, so topics of a course stay together).
  return results.sort((a, b) => (b.course.easinessScore ?? 0) - (a.course.easinessScore ?? 0));
}

export default function DiscoverFitPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [termCode, setTermCode] = useState("");
  const [mode, setMode] = useState<"ucc" | "department" | "boosters">("ucc");
  const [departments, setDepartments] = useState<DiscoverDepartment[]>(
    [],
  );
  const [allDepartments, setAllDepartments] = useState<DiscoverDepartment[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedUccs, setSelectedUccs] = useState<string[]>([
    UCC_CATEGORY_OPTIONS[0],
  ]);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingFit, setLoadingFit] = useState(false);
  const [courses, setCourses] = useState<DiscoverCourse[]>([]);
  const [fitResults, setFitResults] = useState<FitResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [seatFilter, setSeatFilter] = useState<DiscoverFitSeatFilter>("open");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [selectedAttributeDescs, setSelectedAttributeDescs] = useState<string[]>([]);
  const [attributeOptions, setAttributeOptions] = useState<string[]>([]);
  const [sectionCampus, setSectionCampus] = useState("");
  const [campusOptions, setCampusOptions] = useState<string[]>([]);
  const [attributeSearch, setAttributeSearch] = useState("");
  const [filteringFit, setFilteringFit] = useState(false);
  const [fitReady, setFitReady] = useState(false);
  const [profRows, setProfRows] = useState<Record<string, DiscoverRow[]>>({});
  const [openSummaries, setOpenSummaries] = useState<Set<string>>(new Set());
  const [summaryCache, setSummaryCache] = useState<Record<string, ProfessorSummaryState>>({});
  const summaryRequested = useRef<Set<string>>(new Set());
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
        setTermCode((current) => current || pickDefaultTerm(t));
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

  // Per-professor easiness for the courses in the results; refetched only when the
  // set of result courses or the term changes (not for client-side filters).
  const profKeysSig = useMemo(
    () =>
      Array.from(new Set(fitResults.map((r) => `${r.course.dept}-${r.course.courseNumber}`)))
        .sort()
        .join(","),
    [fitResults],
  );
  useEffect(() => {
    if (!termCode || !profKeysSig) {
      setProfRows({});
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const rows = await getDiscoverCourseProfessors(termCode, profKeysSig.split(","));
        if (cancelled) return;
        const grouped: Record<string, DiscoverRow[]> = {};
        for (const r of rows) {
          const k = `${r.dept}-${r.courseNumber}`.toUpperCase();
          (grouped[k] ??= []).push(r);
        }
        setProfRows(grouped);
      } catch {
        if (!cancelled) setProfRows({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [termCode, profKeysSig]);

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

  const { record } = useAcademicRecord();
  const hasRecord = activeCourses(record).length > 0;
  const [hideTaken, setHideTaken] = useState(true);
  const [hideUnmet, setHideUnmet] = useState(true);
  const resultCodes = useMemo(
    () =>
      hasRecord
        ? Array.from(
            new Set(fitResults.map((r) => `${r.course.dept} ${r.course.courseNumber}`)),
          )
        : [],
    [hasRecord, fitResults],
  );
  const {
    info: prereqInfo,
    unknown: prereqUnknown,
    error: prereqError,
  } = useCoursePrereqs(resultCodes);

  const { visibleResults, hiddenTaken, hiddenUnmet, eligibility } = useMemo(() => {
    const eligibility = new Map<string, Eligibility>();
    const targetKey = termCode ? termKeyFromCode(termCode) : null;
    if (!hasRecord || !targetKey) {
      return { visibleResults: fitResults, hiddenTaken: 0, hiddenUnmet: 0, eligibility };
    }
    const ctx = buildContext(record, targetKey, { currentTerm: currentTermKey() });
    // Counted per course, not per topic card, so they match the summary line.
    const takenCourses = new Set<string>();
    const unmetCourses = new Set<string>();
    const visibleResults: FitResult[] = [];
    for (const r of fitResults) {
      const code = `${r.course.dept} ${r.course.courseNumber}`;
      const ev = evaluateCourse(code, prereqInfo[code], ctx);
      // Prereq data unavailable or still loading: only "taken" is trustworthy.
      const loaded = code in prereqInfo || prereqUnknown.includes(code);
      if (ev.status !== "taken" && (prereqError || !loaded)) {
        visibleResults.push(r);
        continue;
      }
      if (ev.status === "taken" && hideTaken) {
        takenCourses.add(code);
        continue;
      }
      if (ev.status === "unmet" && hideUnmet) {
        unmetCourses.add(code);
        continue;
      }
      eligibility.set(code, ev);
      visibleResults.push(r);
    }
    return {
      visibleResults,
      hiddenTaken: takenCourses.size,
      hiddenUnmet: unmetCourses.size,
      eligibility,
    };
  }, [fitResults, hasRecord, record, termCode, prereqInfo, prereqUnknown, prereqError, hideTaken, hideUnmet]);

  // Easiest first by the professors of the sections that fit, not the course's
  // best professor overall (whose section may be filtered out). Courses whose
  // fitting sections have no history go last. Until professor scores load,
  // keep the course-wide order.
  const orderedResults = useMemo(() => {
    if (Object.keys(profRows).length === 0) return visibleResults;
    // Per card: best professor among that card's own sections.
    const best = (r: FitResult): number | null => {
      const rows = profRows[`${r.course.dept}-${r.course.courseNumber}`.toUpperCase()];
      let top: number | null = null;
      for (const s of r.sections) {
        const sc = sectionScore(rows, s.instructor);
        if (sc && (top === null || sc.score > top)) top = sc.score;
      }
      return top;
    };
    return visibleResults
      .map((r) => ({ r, score: best(r) }))
      .sort((a, b) => {
        if (a.score === null || b.score === null) {
          if (a.score !== b.score) return a.score === null ? 1 : -1;
          return (b.r.course.easinessScore ?? 0) - (a.r.course.easinessScore ?? 0);
        }
        return b.score - a.score;
      })
      .map(({ r }) => r);
  }, [visibleResults, profRows]);

  const toggleSummary = (sectionId: string, courseId: string) => {
    const opening = !openSummaries.has(sectionId);
    setOpenSummaries((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
    if (!opening || !termCode) return;
    const cacheKey = `${termCode}|${courseId}`;
    if (summaryRequested.current.has(cacheKey)) return;
    summaryRequested.current.add(cacheKey);
    setSummaryCache((prev) => ({ ...prev, [cacheKey]: { status: "loading" } }));
    void getCourseProfessorsWithDetailsForTerm(termCode, courseId)
      .then((professors) =>
        setSummaryCache((prev) => ({
          ...prev,
          [cacheKey]: { status: "done", professors: professors ?? [] },
        })),
      )
      .catch(() => {
        summaryRequested.current.delete(cacheKey); // allow retry on next open
        setSummaryCache((prev) => ({ ...prev, [cacheKey]: { status: "error" } }));
      });
  };

  // Classes are counted per course (a special-topics course with several topic
  // cards is still one class), matching the candidate count.
  const fitCourseCount = useMemo(
    () => new Set(fitResults.map(courseKeyOf)).size,
    [fitResults],
  );

  const hasActiveSectionFilters =
    seatFilter !== "open" ||
    selectedAttributeDescs.length > 0 ||
    sectionCampus.trim().length > 0;

  const addBlock = () =>
    setBlocks((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        days: prev.length % 2 === 0 ? ["M", "W", "F"] : ["T", "R"],
        start: prev.length % 2 === 0 ? "09:10" : "11:10",
        end: prev.length % 2 === 0 ? "10:00" : "12:25",
      },
    ]);

  const updateBlock = (id: string, partial: Partial<ScheduleBlock>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...partial } : b)));

  const removeBlock = (id: string) =>
    setBlocks((prev) => prev.filter((b) => b.id !== id));

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

    if (mode === "boosters") {
      const rows = await getDiscoverGpaBoosters(termCode);
      const best = new Map<string, DiscoverCourse>();
      for (const row of rows) {
        const key = `${row.dept}-${row.courseNumber}`;
        const prev = best.get(key);
        if (!prev || (row.easinessScore ?? 0) > (prev.easinessScore ?? 0)) {
          best.set(key, {
            dept: row.dept,
            courseNumber: row.courseNumber,
            courseTitle: row.courseTitle,
            easinessScore: row.easinessScore ?? 0,
          });
        }
      }
      return Array.from(best.values()).slice(0, 120);
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

    const res = await fetch(
      `${API_BASE_URL}/discover/${termCode}/ucc-fit-candidates`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: selectedUccs }),
      },
    );
    if (!res.ok) throw new Error("Failed to load UCC courses.");
    const data = (await res.json()) as DiscoverCourse[];
    const merged = Array.isArray(data) ? data : [];

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
    setSeatFilter("open");
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
        } else if (mode === "boosters") {
          setError("No GPA booster courses found for this term.");
        } else {
          setError("No candidate courses found for the selected departments.");
        }
        return;
      }
      const courseKeys = candidates.map((c) => `${c.dept}-${c.courseNumber}`);
      // Campus options first, so a campus term ("Spring 2027 - Galveston") can
      // be applied to the very first fit request.
      const siteOpts = await postDiscoverFitSectionCampusOptions(termCode, courseKeys).catch(
        (e) => {
          console.error("Failed to load campus options:", e);
          return [] as string[];
        },
      );
      const termDesc = terms.find((t) => t.termCode === termCode)?.termDesc ?? "";
      const campusFromTerm = termDesc.includes(" - ")
        ? termDesc.split(" - ").pop()!.trim().toLowerCase()
        : "";
      const termCampus =
        (campusFromTerm &&
          (Array.isArray(siteOpts) ? siteOpts : []).find(
            (o) => o.trim().toLowerCase() === campusFromTerm,
          )) ||
        "";
      // Set while hasCompletedFitOnceRef is still false so the refine effect doesn't refetch.
      if (termCampus) setSectionCampus(termCampus);
      const [matches, attrOpts] = await Promise.all([
        getDiscoverFitMatches(
          termCode,
          courseKeys,
          blocks.map((b) => ({ days: b.days, start: b.start, end: b.end })),
          {
            seatFilter: "open",
            sectionAttributeDescs: [],
            ...(termCampus ? { sectionCampus: termCampus } : {}),
          },
        ),
        postDiscoverFitSectionAttributeOptions(termCode, courseKeys).catch((e) => {
          console.error("Failed to load attribute options:", e);
          return [] as string[];
        }),
      ]);
      setFitResults(buildFitResults(candidates, matches));
      setAttributeOptions(Array.isArray(attrOpts) ? attrOpts : []);
      setCampusOptions(Array.isArray(siteOpts) ? siteOpts : []);
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
    setSeatFilter("open");
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
    setSeatFilter("open");
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
      <PageBanner
        title="Fit my schedule"
        subtitle={<>Add the times you&apos;re already busy, pick core curriculum categories, departments or GPA boosters, and see which classes still have a section that fits</>}
      />
      <main className="pt-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-6">

        <Card className="bg-white/55 dark:bg-card backdrop-blur-md border-border">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={termCode || undefined} onValueChange={setTermCode}>
            <SelectTrigger aria-label="Term"><SelectValue placeholder="Select term" /></SelectTrigger>
            <SelectContent>
              {(() => {
                const { main, other } = sortTermsForMenu(terms);
                return [...main, ...other].map((t) => (
                  <SelectItem key={t.termCode} value={t.termCode}>{t.termDesc}</SelectItem>
                ));
              })()}
            </SelectContent>
          </Select>
          <Select
            value={mode}
            onValueChange={(v) => {
              setMode(v as "ucc" | "department" | "boosters");
              setCourses([]);
              setFitResults([]);
              hasCompletedFitOnceRef.current = false;
              setFitReady(false);
              setSeatFilter("open");
              setSelectedAttributeDescs([]);
              setSectionCampus("");
              setAttributeOptions([]);
              setCampusOptions([]);
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ucc">Core curriculum categories</SelectItem>
              <SelectItem value="department">Departments</SelectItem>
              <SelectItem value="boosters">GPA boosters</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden md:block" />
            </div>

            {hasRecord ? (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={hideTaken}
                    onCheckedChange={(v) => setHideTaken(v === true)}
                  />
                  <span className="text-sm text-text-body">
                    Hide classes I&apos;ve taken
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={hideUnmet}
                    onCheckedChange={(v) => setHideUnmet(v === true)}
                  />
                  <span className="text-sm text-text-body">
                    Only classes I can take (prerequisites met)
                  </span>
                </label>
              </div>
            ) : (
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-text-body">
                  Want only classes you can take? Add the classes you&apos;ve taken in the{" "}
                  <Link
                    href="/planner"
                    className="font-medium text-text-heading underline underline-offset-2"
                  >
                    Schedule builder
                  </Link>{" "}
                  — import them from Howdy&apos;s degree planner with the AggieSB+ extension,
                  paste them from your transcript, or add them one by one. We&apos;ll hide
                  classes you&apos;ve taken or don&apos;t have the prerequisites for.
                </p>
              </div>
            )}

            {mode === "boosters" ? (
              <p className="text-sm text-text-body">
                Courses from any department with a high average GPA in recent semesters.
                Seminars, internships, research and special topics are left out.
              </p>
            ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium text-text-heading">
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
                    setSeatFilter("open");
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
                                ? "bg-maroon-band text-on-maroon border-transparent"
                                : "bg-card text-text-body border-border hover:bg-black/5 dark:hover:bg-raised"
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
                      <div className="text-xs text-text-body">
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
                                className="rounded-full px-3 py-1.5 text-xs border transition-colors bg-card text-text-body border-border hover:bg-black/5 dark:hover:bg-raised"
                              title={d.name ?? d.code}
                              >
                              {d.code}
                              </button>
                            ))}
                          {filteredDepartments.filter(
                            (d) => !selectedDepartments.includes(d.code),
                          ).length === 0 && (
                            <span className="text-xs text-text-body dark:text-text-muted">
                              No matching departments.
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-text-heading mb-2">
                          Selected departments
                        </div>
                        <div className="min-h-10 rounded-md border border-border p-2">
                          <div className="flex flex-wrap gap-2">
                            {selectedDepartments.length === 0 && (
                              <span className="text-xs text-text-body dark:text-text-muted">
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
                                  className="rounded-full px-3 py-1.5 text-xs border transition-colors bg-maroon-band text-on-maroon border-transparent"
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
              <p className="text-xs text-text-body">
                {mode === "ucc"
                  ? `${selectedUccs.length} selected`
                  : `${selectedDepartments.length} selected`}
              </p>
            </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/55 dark:bg-card backdrop-blur-md border-border">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="font-medium text-text-heading">Times you&apos;re busy</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={tryAutoFillFromExtension}>
                  Auto-fill from extension
                </Button>
                <Button variant="outline" onClick={addBlock}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add busy time
                </Button>
              </div>
            </div>
          {blocks.length === 0 && (
            <p className="text-sm text-text-body">
              No busy times yet, so every section counts as fitting. Add your current
              classes, work, or other commitments to narrow it down.
            </p>
          )}
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
                            ? "bg-maroon-band text-on-maroon border-transparent"
                            : "bg-card text-text-body border-border hover:bg-black/5 dark:hover:bg-raised"
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
                aria-label="Busy from"
                value={b.start}
                onChange={(e) => updateBlock(b.id, { start: e.target.value })}
              />
              <Input
                type="time"
                aria-label="Busy until"
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

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={loadCandidates}
            disabled={loadingCandidates || loadingFit}
            className="h-11 px-6"
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
          {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
        </div>

        {!loadingCandidates && courses.length > 0 && (
          <p className="text-sm text-text-body">
            {fitCourseCount} of {courses.length} classes have at least one
            {seatFilter === "open" ? " open" : ""} section that fits your busy times
            {hasActiveSectionFilters ? " and the filters below" : ""}.
          </p>
        )}

        {!loadingCandidates && courses.length > 0 && !loadingFit && (
          <Card className="bg-white/55 dark:bg-card backdrop-blur-md border-border">
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                <div className="flex items-center gap-2 text-text-heading">
                  <Filter strokeWidth={1.5} className="w-5 h-5 shrink-0 text-text-muted" />
                  <span className="text-sm font-medium">Refine by section</span>
                </div>
                {campusOptions.length > 1 && (
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <Label className="text-xs text-text-body">
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
                )}
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <Label className="text-xs text-text-body">
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
                      <SelectItem value="open">Open seats only</SelectItem>
                      <SelectItem value="any">Include full sections</SelectItem>
                      <SelectItem value="full">Full sections only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[220px]">
                  <Label className="text-xs text-text-body">
                    Section type (honors, online, …)
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
                            ? "Any type"
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
                            <p className="text-xs text-text-body dark:text-text-muted px-1 py-2">
                              No attribute list for these courses (data may be missing for this
                              term).
                            </p>
                          )}
                          {filteredAttributeOptions.map((attr) => {
                            const checked = selectedAttributeDescs.includes(attr);
                            return (
                              <label
                                key={attr}
                                className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-black/5 dark:hover:bg-raised cursor-pointer"
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
                                <span className="text-xs leading-snug text-text-body">
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
                <p className="text-xs text-text-body max-w-xl">
                  Picking several section types shows sections that have any of them.
                  Full sections can be watched for an open seat.
                </p>
              </div>

              {filteringFit && (
                <p className="text-sm text-text-body flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  Updating results…
                </p>
              )}

              {!filteringFit && hiddenTaken + hiddenUnmet > 0 && (
                <p className="text-xs text-text-body">
                  {[
                    hiddenTaken > 0
                      ? `Hid ${hiddenTaken} ${hiddenTaken === 1 ? "class" : "classes"} you've taken`
                      : null,
                    hiddenUnmet > 0
                      ? `${hiddenTaken > 0 ? "hid" : "Hid"} ${hiddenUnmet} you can't take yet`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  .
                </p>
              )}

              {!filteringFit && visibleResults.length > 0 && (
                <>
                  <EasinessLegend compact />
                  <ul className="space-y-3">
                    {orderedResults.map((result) => {
                      const { course, compatibleSectionCount, sections } = result;
                      const key = courseKeyOf(result);
                      const cardKey = cardKeyOf(result);
                      const expanded = expandedCourse === cardKey;
                      const shown = expanded ? sections : sections.slice(0, 3);
                      const elig = eligibility.get(`${course.dept} ${course.courseNumber}`);
                      const courseRows = profRows[key.toUpperCase()];
                      const scored = sections.map((s) => sectionScore(courseRows, s.instructor));
                      const known = scored
                        .filter((x): x is SectionScore => x !== null)
                        .map((x) => Math.round(x.score));
                      const lo = known.length ? Math.min(...known) : null;
                      const hi = known.length ? Math.max(...known) : null;
                      // Once professor scores have loaded, never fall back to the
                      // course-wide score: it may belong to a professor whose
                      // section doesn't fit.
                      const profsLoaded = Object.keys(profRows).length > 0;
                      const someUnknown = profsLoaded && known.length < sections.length;
                      const split = lo !== null && hi !== null && (lo !== hi || someUnknown);
                      return (
                        <li
                          key={cardKey}
                          className="rounded-xl border border-border bg-card/70 p-3 sm:p-4 dark:bg-card"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/course/${course.dept}${course.courseNumber}`}
                                className="font-medium text-text-heading hover:underline"
                              >
                                {course.dept} {course.courseNumber}
                              </Link>
                              <p className="text-sm text-text-body">
                                {course.courseTitle}
                              </p>
                              <p className="mt-1 text-xs text-text-body">
                                {compatibleSectionCount}{" "}
                                {compatibleSectionCount === 1 ? "section fits" : "sections fit"}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              {split ? (
                                <div
                                  className="flex shrink-0 flex-col items-center"
                                  title={
                                    someUnknown
                                      ? "Easiness differs by professor, and some sections have no history. See each section below."
                                      : "Easiness differs by professor. See each section below."
                                  }
                                >
                                  <div className="flex h-12 min-w-12 items-center justify-center rounded-full bg-muted px-3 text-lg font-bold tabular-nums text-text-heading ring-2 ring-border">
                                    {lo === hi ? lo : `${lo}–${hi}`}
                                    {someUnknown && "?"}
                                  </div>
                                  <span className="mt-1 text-xs font-medium text-text-body">
                                    {someUnknown ? "some unknown" : "by professor"}
                                  </span>
                                </div>
                              ) : profsLoaded && lo === null ? (
                                <div
                                  className="flex shrink-0 flex-col items-center"
                                  title="None of these sections' professors have history for this course."
                                >
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold text-text-muted ring-2 ring-border">
                                    ?
                                  </div>
                                  <span className="mt-1 text-xs font-medium text-text-body">no history</span>
                                </div>
                              ) : (
                                <EasinessBadge score={lo ?? course.easinessScore} />
                              )}
                              {elig && elig.status !== "taken" && (
                                <>
                                  {elig.status === "met" && (
                                    <Badge className="border-transparent bg-emerald-700 text-white dark:bg-emerald-500 dark:text-black">
                                      Can take
                                    </Badge>
                                  )}
                                  {elig.status === "approval" && (
                                    <Badge variant="outline" className="text-text-body">
                                      Needs approval
                                    </Badge>
                                  )}
                                  {elig.status === "unknown" && (
                                    <Badge variant="outline" className="text-text-body">
                                      Check prereqs
                                    </Badge>
                                  )}
                                  {elig.status === "unmet" && (
                                    <Badge className="border-transparent bg-red-700 text-white dark:bg-red-400 dark:text-black whitespace-normal">
                                      {elig.missing.length > 0
                                        ? `Missing ${elig.missing.slice(0, 3).join(", ")}`
                                        : "Prereqs not met"}
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {shown.length > 0 && (
                            <ul className="mt-3 divide-y divide-border/70 rounded-lg border border-border/70 dark:divide-white/10 dark:border-border">
                              {shown.map((s) => {
                                const sc = sectionScore(courseRows, s.instructor);
                                const summaryOpen = openSummaries.has(s.id);
                                return (
                                <li
                                  key={s.id}
                                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2 text-sm"
                                >
                                  <span className="font-medium text-text-heading">
                                    Sec {s.section ?? "—"}
                                  </span>
                                  <span className="text-text-body">
                                    {formatSectionMeetings(s.meetings)}
                                  </span>
                                  {s.instructor && (
                                    <span className="text-text-body">
                                      {s.instructor}
                                    </span>
                                  )}
                                  <span className="text-xs text-text-body">
                                    CRN {s.crn}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    {sc ? (
                                      <>
                                        <EasinessPill score={sc.score} />
                                        {sc.lowConfidence && (
                                          <span className="text-xs text-text-muted">few reviews</span>
                                        )}
                                        {sc.noGradeData && (
                                          <span
                                            className="text-xs text-text-muted"
                                            title="No grade history for this professor and course, so the score comes from student ratings only."
                                          >
                                            no grade data
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-xs text-text-muted">No history</span>
                                    )}
                                  </span>
                                  {s.instructor && (
                                    <ProfessorSummaryToggle
                                      open={summaryOpen}
                                      onToggle={() =>
                                        toggleSummary(s.id, `${course.dept}${course.courseNumber}`)
                                      }
                                    />
                                  )}
                                  <span className="ml-auto flex items-center gap-2">
                                    {s.is_open ? (
                                      <Badge className="border-transparent bg-emerald-700 text-white dark:bg-emerald-500 dark:text-black">
                                        Open
                                      </Badge>
                                    ) : (
                                      <>
                                        <Badge className="border-transparent bg-red-700 text-white dark:bg-red-400 dark:text-black">
                                          Full
                                        </Badge>
                                        <WatchSectionButton
                                          termCode={termCode}
                                          crn={s.crn}
                                          dept={course.dept}
                                          courseNumber={course.courseNumber}
                                          section={s.section}
                                        />
                                      </>
                                    )}
                                  </span>
                                  {s.instructor && summaryOpen && (
                                    <ProfessorSummaryPanel
                                      state={summaryCache[`${termCode}|${course.dept}${course.courseNumber}`]}
                                      instructor={s.instructor}
                                      courseId={`${course.dept}${course.courseNumber}`}
                                    />
                                  )}
                                </li>
                                );
                              })}
                            </ul>
                          )}
                          {sections.length > 3 && (
                            <button
                              type="button"
                              onClick={() => setExpandedCourse(expanded ? null : cardKey)}
                              className="mt-2 text-xs font-medium text-text-heading underline underline-offset-2"
                            >
                              {expanded
                                ? "Show fewer sections"
                                : `Show all ${sections.length} sections`}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              {!filteringFit && fitResults.length > 0 && visibleResults.length === 0 && (
                <p className="text-sm text-text-body">
                  Every matching class is hidden by your class history filters.
                </p>
              )}

              {!filteringFit && fitResults.length === 0 && fitReady && (
                <p className="text-sm text-text-body">
                  {hasActiveSectionFilters
                    ? "No class still has a section that fits under these filters. Try “Include full sections”, clearing section types, or picking more categories."
                    : "None of these classes has a section that fits your busy times."}
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
