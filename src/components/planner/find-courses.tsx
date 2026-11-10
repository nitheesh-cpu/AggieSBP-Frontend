"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, ChevronsUpDown, Loader2 } from "lucide-react";

import { EasinessLegend } from "@/components/easiness";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WatchSectionButton } from "@/components/watch-section-button";
import { useEligibility } from "@/hooks/use-eligibility";
import {
  getDiscoverDeptCourses,
  getDiscoverFitMatches,
  getDiscoverGpaBoosters,
  getDiscoverUccCourses,
  getTermDepartments,
  type DiscoverFitSection,
  type Term,
  type TermDepartment,
} from "@/lib/api";
import { collapseRows, type Candidate, type CourseState } from "@/lib/planner/find";
import { activeWatchlist, watchKey, type DegreePlan } from "@/lib/planner/plan";
import {
  courseId,
  currentTermKey,
  nextTermKey,
  termKeyFromCode,
  type AcademicRecord,
} from "@/lib/planner/record";
import {
  formatSectionBrief,
  formatSectionLine,
  seatStatus,
  summarizeSections,
} from "@/lib/planner/section-times";
import { parseTopicKey, sameTopic, sectionInTopic, topicLabel } from "@/lib/planner/topics";
import { shortTermName, sortTermsForMenu } from "@/lib/terms";

import { CourseStateBadge, EasinessPill } from "./course-state";
import { WatchButton, type PlanUpdate } from "./plan-actions";

type Source = "dept" | "ucc" | "boosters" | "plan";
type Show = "ready" | "one_away" | "all";
type Seats = "any" | "open" | "full";

const CAMPUS = "College Station";
const PAGE = 30;
const ALL_CATEGORIES = "__all__";

const SHOW_STATES: Record<Show, Set<CourseState>> = {
  ready: new Set(["ready", "maybe", "pending"]),
  one_away: new Set(["ready", "maybe", "pending", "one_away"]),
  all: new Set(["ready", "maybe", "pending", "one_away", "locked"]),
};
const TAKEN_STATES = new Set<CourseState>(["done", "in_progress", "planned"]);
const MAX_TIMES = 3;
const SEAT_BATCH = 150;

/** "CSCE 121" -> "CSCE-121", the key the fit-sections endpoint expects. */
const courseKey = (code: string) => code.trim().replace(/\s+/g, "-");

/** A plan course with no sections in the chosen term. */
interface NotOffered {
  /** Course code or "code|TOPIC" key, and how to show it. */
  key: string;
  label: string;
}

/**
 * Whether a candidate is what a starred item names: a starred topic matches
 * only that topic; a starred plain code matches the plain course or, when the
 * course only exists as topics this term, all of them.
 */
function matchesStar(c: Candidate, star: { code: string; topic: string | null }): boolean {
  if (c.code !== star.code) return false;
  return star.topic ? sameTopic(c.topic, star.topic) : true;
}

/** Only this row's topic's sections (all of them for a regular course). */
function topicSections(
  sections: DiscoverFitSection[] | null | undefined,
  topic: string | null,
): DiscoverFitSection[] | null | undefined {
  if (!sections || !topic) return sections;
  return sections.filter((s) => sectionInTopic(s.title, topic));
}

/**
 * Courses offered in a term, easiest first, limited to ones the student can
 * take by then. Sources: a department, the core curriculum, or the courses
 * already in their requirements and watchlist.
 */
export function FindCourses({
  record,
  plan,
  update,
  terms,
  term,
  onTermChange,
}: {
  record: AcademicRecord;
  plan: DegreePlan;
  update: PlanUpdate;
  terms: Term[];
  term: string;
  onTermChange: (term: string) => void;
}) {
  const setTerm = onTermChange;
  const [source, setSource] = useState<Source>("dept");
  const [departments, setDepartments] = useState<TermDepartment[]>([]);
  const [dept, setDept] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [show, setShow] = useState<Show>("ready");
  const [seats, setSeats] = useState<Seats>("any");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [notOffered, setNotOffered] = useState<NotOffered[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    if (!term) return;
    let cancelled = false;
    getTermDepartments(term)
      .then((d) => !cancelled && setDepartments(d))
      .catch(() => !cancelled && setDepartments([]));
    return () => {
      cancelled = true;
    };
  }, [term]);

  // Starred courses, for the "Starred" source.
  const planCodes = useMemo(() => [...new Set(activeWatchlist(plan).map(watchKey))].sort(), [plan]);
  const planKey = JSON.stringify(planCodes);

  useEffect(() => {
    if (!term) return;
    if (source === "dept" && !dept) {
      setCandidates([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setLimit(PAGE);
    const load = async (): Promise<{ list: Candidate[]; cats: string[]; missing: NotOffered[] }> => {
      if (source === "dept") {
        const rows = await getDiscoverDeptCourses(term, dept, { campus: CAMPUS });
        return { list: collapseRows([{ rows }]), cats: [], missing: [] };
      }
      if (source === "boosters") {
        const rows = await getDiscoverGpaBoosters(term, { campus: CAMPUS });
        return { list: collapseRows([{ rows }]), cats: [], missing: [] };
      }
      if (source === "ucc") {
        const groups = await getDiscoverUccCourses(term, { campus: CAMPUS });
        return {
          list: collapseRows(groups.map((g) => ({ category: g.category, rows: g.courses }))),
          cats: groups.map((g) => g.category),
          missing: [],
        };
      }
      const wanted = (JSON.parse(planKey) as string[]).map(parseTopicKey);
      const depts = [...new Set(wanted.map((w) => w.code.split(" ")[0]))];
      const results = await Promise.all(
        depts.map((d) =>
          getDiscoverDeptCourses(term, d, { campus: CAMPUS, includeGraduate: true }).catch(
            () => [],
          ),
        ),
      );
      const offered = collapseRows(results.map((rows) => ({ rows }))).filter((c) =>
        wanted.some((w) => matchesStar(c, w)),
      );
      return {
        list: offered,
        cats: [],
        missing: wanted
          .filter((w) => !offered.some((c) => matchesStar(c, w)))
          .map((w) => ({
            key: w.topic ? `${w.code}|${w.topic}` : w.code,
            label: topicLabel(w.code, w.topic),
          })),
      };
    };
    load()
      .then(({ list, cats, missing }) => {
        if (cancelled) return;
        setCandidates(list);
        setCategories(cats);
        setNotOffered(missing);
      })
      .catch(() => {
        if (cancelled) return;
        setCandidates([]);
        setFailed(true);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [term, source, dept, planKey]);

  const termKey = termKeyFromCode(term) ?? nextTermKey(currentTermKey());
  const inCategory =
    source === "ucc" && category !== ALL_CATEGORIES
      ? candidates.filter((c) => c.categories.includes(category))
      : candidates;
  const codes = useMemo(() => [...new Set(inCategory.map((c) => c.code))], [inCategory]);
  const { info, error, standing } = useEligibility(record, codes, termKey);

  const eligible: { course: Candidate; standing: ReturnType<typeof standing> }[] = [];
  let hiddenTaken = 0;
  let hiddenLocked = 0;
  for (const course of inCategory) {
    const s = standing(course.code);
    // If prereqs can't be loaded, show everything rather than an empty list.
    const state = error && s.state === "pending" ? "ready" : s.state;
    if (TAKEN_STATES.has(state)) hiddenTaken++;
    else if (!SHOW_STATES[show].has(state)) hiddenLocked++;
    else eligible.push({ course, standing: s });
  }

  // Section data (times and seats), cached per term+course; `null` marks a
  // failed fetch (shows no times, and counts as unknown under a seat filter).
  const [sectionCache, setSectionCache] = useState<Record<string, DiscoverFitSection[] | null>>({});
  const requested = useRef(new Set<string>());

  const visible: typeof eligible = [];
  let hiddenSeats = 0;
  let seatsPending = 0;
  let seatsUnknown = 0;
  for (const row of eligible) {
    if (seats === "any") {
      visible.push(row);
      continue;
    }
    const sections = topicSections(
      sectionCache[`${term}|${courseKey(row.course.code)}`],
      row.course.topic,
    );
    if (sections === undefined) seatsPending++;
    else if (sections === null) seatsUnknown++;
    else {
      const st = seatStatus(sections);
      if (seats === "open" ? st.hasOpen : st.full) visible.push(row);
      else hiddenSeats++;
    }
  }

  // One batched request per chunk. Without a seat filter only the page on
  // screen is fetched; with one, every eligible candidate is.
  const loadSections = useCallback(
    async (codes: string[]) => {
      const seen = requested.current;
      const fresh = codes.filter((code) => !seen.has(`${term}|${courseKey(code)}`));
      fresh.forEach((code) => seen.add(`${term}|${courseKey(code)}`));
      // Results are keyed by term, so a late answer is still correct: keep it
      // rather than cancelling when the list on screen changes.
      for (let i = 0; i < fresh.length; i += SEAT_BATCH) {
        const chunk = fresh.slice(i, i + SEAT_BATCH);
        const keys = chunk.map((code) => `${term}|${courseKey(code)}`);
        try {
          const matches = await getDiscoverFitMatches(term, chunk.map(courseKey), [], {
            seatFilter: "any",
            sectionCampus: CAMPUS,
          });
          const next: Record<string, DiscoverFitSection[] | null> = {};
          for (const k of keys) next[k] = [];
          for (const m of matches) next[`${term}|${m.dept}-${m.course_number}`] = m.sections ?? [];
          setSectionCache((prev) => ({ ...prev, ...next }));
        } catch {
          const next: Record<string, null> = {};
          for (const k of keys) next[k] = null;
          setSectionCache((prev) => ({ ...prev, ...next }));
        }
      }
    },
    [term],
  );

  // Topics of one course share a section fetch, so list each code once.
  const codeList = (rows: typeof eligible) => [...new Set(rows.map((v) => v.course.code))].join(",");
  const fetchCodesKey = loading
    ? ""
    : codeList(seats === "any" ? visible.slice(0, limit) : eligible);
  // The page on screen goes first so its times appear before the seat sweep.
  const pageCodesKey = loading ? "" : codeList(visible.slice(0, limit));

  useEffect(() => {
    if (!term) return;
    const page = pageCodesKey ? pageCodesKey.split(",") : [];
    const all = fetchCodesKey ? fetchCodesKey.split(",") : [];
    void loadSections(page).then(() => loadSections(all));
  }, [term, pageCodesKey, fetchCodesKey, loadSections]);

  const rowSections = (c: Candidate) =>
    topicSections(sectionCache[`${term}|${courseKey(c.code)}`], c.topic);

  const { main, other } = sortTermsForMenu(terms);
  const selectedTerm = terms.find((t) => t.termCode === term);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Term">
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="h-9 w-[12rem]" aria-label="Term">
              <SelectValue placeholder="Loading terms…">{shortTermName(selectedTerm)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {main.map((t) => (
                  <SelectItem key={t.termCode} value={t.termCode}>
                    {shortTermName(t)}
                  </SelectItem>
                ))}
              </SelectGroup>
              {other.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Other campuses and sessions</SelectLabel>
                  {other.map((t) => (
                    <SelectItem key={t.termCode} value={t.termCode}>
                      {t.termDesc}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Look in">
          <Select value={source} onValueChange={(v) => setSource(v as Source)}>
            <SelectTrigger className="h-9 w-[11rem]" aria-label="Where to look">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dept">A department</SelectItem>
              <SelectItem value="ucc">Core curriculum</SelectItem>
              <SelectItem value="boosters">GPA boosters</SelectItem>
              <SelectItem value="plan">Starred ({planCodes.length})</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {source === "dept" && (
          <Field label="Department">
            <DeptPicker departments={departments} value={dept} onChange={setDept} />
          </Field>
        )}
        {source === "ucc" && categories.length > 0 && (
          <Field label="Category">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-[16rem]" aria-label="Core curriculum category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
        <Field label="Show">
          <Select value={show} onValueChange={(v) => setShow(v as Show)}>
            <SelectTrigger className="h-9 w-[13rem]" aria-label="Which courses to show">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ready">Courses I can take</SelectItem>
              <SelectItem value="one_away">Also 1 course away</SelectItem>
              <SelectItem value="all">Everything offered</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Seats">
          <Select
            value={seats}
            onValueChange={(v) => {
              setSeats(v as Seats);
              setLimit(PAGE);
            }}
          >
            <SelectTrigger className="h-9 w-[13rem]" aria-label="Filter by seat availability">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="open">Has open seats</SelectItem>
              <SelectItem value="full">Full (watch for a seat)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-text-body">
        <span>
          {loading
            ? "Loading courses…"
            : source === "dept" && !dept
              ? "Pick a department to see its courses, easiest first."
              : `${visible.length} course${visible.length === 1 ? "" : "s"}, easiest first.`}
          {!loading && (hiddenTaken > 0 || hiddenLocked > 0 || hiddenSeats > 0) && (
            <span className="text-text-muted">
              {" "}
              Hiding {[
                hiddenTaken > 0 && `${hiddenTaken} you've taken or planned`,
                hiddenLocked > 0 && `${hiddenLocked} you can't take yet`,
                hiddenSeats > 0 &&
                  `${hiddenSeats} ${seats === "open" ? "with no open seats" : "that aren't full"}`,
              ]
                .filter((x): x is string => Boolean(x))
                .join(", ")
                .replace(/, ([^,]*)$/, " and $1")}
              .
            </span>
          )}
          {!loading && seats !== "any" && seatsPending > 0 && (
            <span className="text-text-muted"> Checking seats…</span>
          )}
          {!loading && seats !== "any" && seatsUnknown > 0 && (
            <span className="text-text-muted">
              {" "}
              {seatsUnknown} couldn&apos;t be checked for seats.
            </span>
          )}
        </span>
        <EasinessLegend compact />
      </div>

      {source === "boosters" && (
        <p className="text-xs text-text-muted">
          Courses from any department with a high average GPA in recent semesters. Seminars,
          internships, research and special topics are left out.
        </p>
      )}
      {error && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Couldn&apos;t load prerequisites right now, so courses aren&apos;t filtered by them.
        </p>
      )}
      {failed && (
        <p className="text-sm text-red-600">Couldn&apos;t load courses. Try again in a moment.</p>
      )}
      {loading && (
        <p className="flex items-center gap-2 text-sm text-text-body">
          <Loader2 className="h-4 w-4 animate-spin" /> Finding courses…
        </p>
      )}

      {!loading && visible.length > 0 && (
        <ul className="divide-y divide-border/60 rounded-lg border border-border bg-white/60 dark:bg-raised">
          {visible.slice(0, limit).map(({ course, standing: s }) => (
            <li key={course.key} className="flex items-center gap-3 px-3 py-2.5">
              <EasinessPill score={course.easiness} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Link
                    href={`/course/${courseId(course.code)}`}
                    className="font-medium text-text-heading hover:underline"
                  >
                    {course.code}
                  </Link>
                  <span className="truncate text-sm text-text-body">
                    {course.title || info[course.code]?.name}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-text-muted">
                  {course.bestProfessor && <span>Easiest with {course.bestProfessor}</span>}
                  {course.bestProfessor && !course.bestHasGradeData && (
                    <span title="No grade history for this professor and course, so the score comes from student ratings only.">
                      · no grade data
                    </span>
                  )}
                  {course.professorCount > 1 && <span>· {course.professorCount} professors</span>}
                  {source === "ucc" && course.categories.length > 0 && (
                    <span>· {course.categories.join(", ")}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <MeetingTimes sections={rowSections(course)} />
                  <SeatInfo
                    term={term}
                    code={course.code}
                    label={topicLabel(course.code, course.topic)}
                    sections={rowSections(course)}
                  />
                </div>
              </div>
              {!(error && s.state === "pending") && (
                <CourseStateBadge state={s.state} eligibility={s.eligibility} />
              )}
              <WatchButton plan={plan} update={update} code={course.code} topic={course.topic} />
            </li>
          ))}
        </ul>
      )}
      {!loading && visible.length > limit && (
        <Button variant="outline" className="w-full" onClick={() => setLimit((l) => l + PAGE)}>
          Show more ({visible.length - limit} left)
        </Button>
      )}

      {!loading && source === "plan" && planCodes.length === 0 && (
        <p className="text-sm text-text-body">
          Nothing starred yet. Star courses from a department or the core curriculum first.
        </p>
      )}
      {!loading && source === "plan" && notOffered.length > 0 && (
        <p className="text-sm text-text-body">
          Not offered in {shortTermName(selectedTerm) || "this term"}:{" "}
          {notOffered.map((n) => n.label).join(", ")}
        </p>
      )}
    </div>
  );
}

/** Up to a few distinct meeting times for a course; `undefined` means still loading. */
function MeetingTimes({ sections }: { sections: DiscoverFitSection[] | null | undefined }) {
  const cls = "mt-0.5 text-xs text-text-muted";
  if (sections === undefined) return <div className={cls}>Loading times…</div>;
  if (!sections || sections.length === 0) return null;
  const summary = summarizeSections(sections);
  const title = summary.sections.map(formatSectionLine).join("\n");
  if (summary.times.length === 0) {
    return (
      <div className={cls} title={title}>
        No set meeting times
      </div>
    );
  }
  const shown = summary.times.slice(0, MAX_TIMES);
  const more = summary.times.length - shown.length;
  return (
    <div className={cls} title={title}>
      {shown.join(" · ")}
      {more > 0 && ` · +${more} more`}
    </div>
  );
}

/** Seat status next to the times; for a full course, a way to watch its sections. */
function SeatInfo({
  term,
  code,
  label,
  sections,
}: {
  term: string;
  code: string;
  label: string;
  sections: DiscoverFitSection[] | null | undefined;
}) {
  if (!sections || sections.length === 0) return null;
  const st = seatStatus(sections);
  if (!st.full) {
    return (
      <span className="mt-0.5 text-xs text-text-muted">
        {st.openCount} of {st.sectionCount} open
      </span>
    );
  }
  const [dept, number] = code.split(" ");
  const lines = summarizeSections(sections).sections;
  return (
    <span className="mt-0.5 inline-flex items-center gap-2">
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
        Full
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 gap-1 rounded-full px-2 text-xs font-normal"
          >
            <Bell className="h-3 w-3" /> Watch for a seat
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[22rem] bg-white p-2 dark:bg-card" align="start">
          <div className="px-1 pb-1.5 text-xs font-medium text-text-body">
            {label}: pick a section to watch
          </div>
          <ul className="max-h-64 divide-y divide-border/60 overflow-y-auto">
            {lines.map((l) => (
              <li key={l.crn} className="flex items-center justify-between gap-2 px-1 py-1.5">
                <span className="min-w-0 text-xs text-text-body">{formatSectionBrief(l)}</span>
                <WatchSectionButton
                  termCode={term}
                  crn={l.crn}
                  dept={dept}
                  courseNumber={number}
                  section={l.section}
                  className="shrink-0"
                />
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </span>
  );
}

/** "CSCE - Computer Science" whether or not the API already prefixed the code. */
function deptLabel(d: TermDepartment): string {
  return d.name.toUpperCase().startsWith(d.code.toUpperCase()) ? d.name : `${d.code} - ${d.name}`;
}

/** Searchable department list (there are ~200, too many for a plain select). */
function DeptPicker({
  departments,
  value,
  onChange,
}: {
  departments: TermDepartment[];
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = departments.find((d) => d.code === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Department"
          className="h-9 w-[16rem] justify-between font-normal"
        >
          <span className="truncate">{selected ? deptLabel(selected) : "Pick a department"}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[20rem] bg-white p-0 dark:bg-card" align="start">
        <Command>
          <CommandInput placeholder="Search, e.g. CSCE or statistics" />
          <CommandList className="max-h-72">
            <CommandEmpty>No department found.</CommandEmpty>
            {departments.map((d) => (
              <CommandItem
                key={d.code}
                value={deptLabel(d)}
                onSelect={() => {
                  onChange(d.code);
                  setOpen(false);
                }}
              >
                {deptLabel(d)}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-text-body">{label}</div>
      {children}
    </div>
  );
}
