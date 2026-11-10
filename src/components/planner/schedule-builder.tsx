"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Copy, Loader2, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Term } from "@/lib/api";
import { track } from "@/lib/analytics";
import { activeWatchlist, removeFromWatchlist, watchKey, type DegreePlan } from "@/lib/planner/plan";
import {
  activeCourses,
  courseId,
  currentTermKey,
  nextTermKey,
  termKeyFromCode,
  type AcademicRecord,
} from "@/lib/planner/record";
import { loadGenCourses } from "@/lib/planner/schedule-data";
import {
  formatTime,
  generateSchedules,
  WEEKDAYS,
  type Day,
  type GenerateResult,
  type Option,
  type Schedule,
} from "@/lib/planner/schedule";
import { keyLabel, parseTopicKey } from "@/lib/planner/topics";
import { cn } from "@/lib/utils";

import { CourseSearch } from "./course-search";
import { EasinessPill } from "./course-state";
import type { PlanUpdate } from "./plan-actions";
import { TermPicker } from "./term-picker";

const NONE = "none";
const EARLIEST = [
  { value: NONE, label: "Any time" },
  { value: "480", label: "8:00a" },
  { value: "540", label: "9:00a" },
  { value: "600", label: "10:00a" },
  { value: "660", label: "11:00a" },
];
const LATEST = [
  { value: NONE, label: "Any time" },
  { value: "900", label: "3:00p" },
  { value: "960", label: "4:00p" },
  { value: "1020", label: "5:00p" },
  { value: "1080", label: "6:00p" },
];
const DAY_LABEL: Record<Day, string> = { M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri", S: "Sat", U: "Sun" };
const COLORS = [
  "bg-sky-500/80",
  "bg-emerald-500/80",
  "bg-amber-500/80",
  "bg-violet-500/80",
  "bg-rose-500/80",
  "bg-teal-500/80",
  "bg-orange-500/80",
];

/**
 * Pick your set classes and how many electives to take from your starred
 * courses; get conflict-free schedules ranked by how easy this term's
 * sections are and how well the times work.
 */
export function ScheduleBuilder({
  record,
  plan,
  update,
  terms,
  term,
  onTermChange,
  onFindElectives,
}: {
  record: AcademicRecord;
  plan: DegreePlan;
  update: PlanUpdate;
  terms: Term[];
  term: string;
  onTermChange: (term: string) => void;
  onFindElectives: () => void;
}) {
  const termKey = termKeyFromCode(term) ?? nextTermKey(currentTermKey());

  // Set classes default to what the record already plans for this term.
  const plannedHere = useMemo(
    () =>
      activeCourses(record)
        .filter((c) => c.status !== "completed" && c.term === termKey)
        .map((c) => c.code),
    [record, termKey],
  );
  const [added, setAdded] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const fixed = [...new Set([...plannedHere, ...added])].filter((c) => !removed.includes(c));

  // Starred courses grouped by subject, each a "pick N" pool. A starred topic
  // ("CSCE 489|COMPUTER VISION") is its own elective; the key is its identity.
  const starred = [
    ...new Set(
      activeWatchlist(plan)
        .filter((w) => !fixed.includes(w.code))
        .map(watchKey),
    ),
  ];
  const subjects = [...new Set(starred.map((c) => c.split(" ")[0]))].sort();
  const [picks, setPicks] = useState<Record<string, number>>({});
  const pickFor = (subject: string, size: number) => Math.min(picks[subject] ?? 1, size);

  const [earliest, setEarliest] = useState(NONE);
  const [latest, setLatest] = useState(NONE);
  const [daysOff, setDaysOff] = useState<Day[]>([]);
  const [openOnly, setOpenOnly] = useState(true);
  const [includeHonors, setIncludeHonors] = useState(false);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<(GenerateResult & { notOffered: string[] }) | null>(null);
  const [failed, setFailed] = useState(false);

  const totalPicks = subjects.reduce(
    (n, s) => n + pickFor(s, starred.filter((c) => c.startsWith(`${s} `)).length),
    0,
  );
  const canRun = !!term && fixed.length + totalPicks > 0;

  const run = async () => {
    setRunning(true);
    setFailed(false);
    setResult(null);
    try {
      const { courses, notOffered } = await loadGenCourses(term, [...fixed, ...starred], {
        includeHonors,
      });
      const byCode = new Map(courses.map((c) => [c.code, c]));
      const pools = subjects
        .map((s) => {
          const inSubject = starred.filter((c) => c.startsWith(`${s} `));
          return {
            name: s,
            pick: pickFor(s, inSubject.length),
            courses: inSubject.flatMap((c) => byCode.get(c) ?? []),
          };
        })
        .filter((p) => p.pick > 0);
      const generated = generateSchedules(
        fixed.flatMap((c) => byCode.get(c) ?? []),
        pools,
        {
          earliest: earliest === NONE ? null : Number(earliest),
          latest: latest === NONE ? null : Number(latest),
          daysOff,
          openOnly,
        },
      );
      setResult({ ...generated, notOffered });
      track("schedule-builder-run", {
        term,
        set_classes: fixed.length,
        starred: starred.length,
        options: generated.options.length,
        impossible: generated.impossible.length,
      });
    } catch {
      setFailed(true);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 1. Set classes */}
        <section className="space-y-3">
          <h3 className="text-base font-medium text-text-heading">Classes you&apos;re taking</h3>
          <p className="text-sm text-text-body">
            Ones you already know. Courses you planned for this term are added for you.
          </p>
          <ChipList
            codes={fixed}
            empty="None yet."
            onRemove={(code) => {
              setAdded((a) => a.filter((c) => c !== code));
              setRemoved((r) => [...r, code]);
            }}
          />
          <CourseSearch
            placeholder="Add a class, e.g. CSCE 482"
            existing={new Set(fixed)}
            onSelect={(code) => {
              setRemoved((r) => r.filter((c) => c !== code));
              setAdded((a) => (a.includes(code) ? a : [...a, code]));
            }}
          />
        </section>

        {/* 2. Electives from starred */}
        <section className="space-y-3">
          <h3 className="text-base font-medium text-text-heading">Electives to fit in</h3>
          {subjects.length === 0 ? (
            <p className="text-sm text-text-body">
              Star the electives you&apos;d take in{" "}
              <button type="button" onClick={onFindElectives} className="font-medium underline">
                Find electives
              </button>
              , and they show up here.
            </p>
          ) : (
            <>
              <p className="text-sm text-text-body">From your starred courses, how many of each?</p>
              {subjects.map((s) => {
                const inSubject = starred.filter((c) => c.startsWith(`${s} `));
                return (
                  <div key={s} className="space-y-2 rounded-md border border-border p-3">
                    <div className="flex items-center gap-2 text-sm text-text-body">
                      Take
                      <Select
                        value={String(pickFor(s, inSubject.length))}
                        onValueChange={(v) => setPicks((p) => ({ ...p, [s]: Number(v) }))}
                      >
                        <SelectTrigger className="h-8 w-16" aria-label={`How many ${s} electives`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: inSubject.length + 1 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span>
                        {s} of {inSubject.length}
                      </span>
                    </div>
                    <ChipList
                      codes={inSubject}
                      onRemove={(key) =>
                        update((p) => {
                          const { code, topic } = parseTopicKey(key);
                          return removeFromWatchlist(p, code, new Date(), topic);
                        })
                      }
                      removeLabel="Unstar"
                    />
                  </div>
                );
              })}
            </>
          )}
        </section>

        {/* 3. Times */}
        <section className="space-y-3">
          <h3 className="text-base font-medium text-text-heading">When you&apos;ll take them</h3>
          <TermPicker terms={terms} value={term} onChange={onTermChange} />
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-body">
            No class before
            <TimeSelect value={earliest} onChange={setEarliest} options={EARLIEST} label="Earliest start" />
            or after
            <TimeSelect value={latest} onChange={setLatest} options={LATEST} label="Latest end" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-text-body">
            Days off:
            {WEEKDAYS.map((d) => {
              const on = daysOff.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setDaysOff((cur) => (on ? cur.filter((x) => x !== d) : [...cur, d]))
                  }
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs",
                    on
                      ? "border-amber-500 bg-amber-500/15 font-medium text-text-heading"
                      : "border-border text-text-body hover:text-text-heading",
                  )}
                >
                  {DAY_LABEL[d]}
                </button>
              );
            })}
          </div>
          <Label className="flex items-center gap-2 text-sm font-normal text-text-body">
            <Checkbox checked={openOnly} onCheckedChange={(v) => setOpenOnly(v === true)} />
            Only sections with open seats
          </Label>
          <Label className="flex items-center gap-2 text-sm font-normal text-text-body">
            <Checkbox checked={includeHonors} onCheckedChange={(v) => setIncludeHonors(v === true)} />
            Include honors sections
          </Label>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void run()} disabled={!canRun || running} className="gap-2">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {running ? "Finding schedules…" : "Find schedules"}
        </Button>
        {!canRun && (
          <span className="text-sm text-text-body">Add a class or star some electives first.</span>
        )}
        {canRun && !result && !running && !failed && (
          <span className="text-sm text-text-body">
            Ready. Find schedules to see every way these fit together.
          </span>
        )}
      </div>

      {failed && (
        <p className="text-sm text-red-600">Couldn&apos;t load sections. Try again in a moment.</p>
      )}
      {result && <Results result={result} />}
    </div>
  );
}

function ChipList({
  codes,
  onRemove,
  empty,
  removeLabel = "Remove",
}: {
  codes: string[];
  onRemove: (code: string) => void;
  empty?: string;
  removeLabel?: string;
}) {
  if (codes.length === 0) return empty ? <p className="text-sm text-text-muted">{empty}</p> : null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {codes.map((code) => (
        <li
          key={code}
          className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-sm text-text-heading"
        >
          {keyLabel(code)}
          <button
            type="button"
            onClick={() => onRemove(code)}
            className="text-text-muted hover:text-red-600"
            aria-label={`${removeLabel} ${keyLabel(code)}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function TimeSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-28" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Results({ result }: { result: GenerateResult & { notOffered: string[] } }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1 text-sm text-text-body">
        {result.options.length > 0 && (
          <p className="font-medium text-text-heading">
            Pick an option, then use Copy CRNs to paste its section numbers into Howdy
            registration.
          </p>
        )}
        <p>
          {result.found === 0
            ? "No combination fits. Try fewer electives, more starred options, or looser times."
            : `${result.found} way${result.found === 1 ? "" : "s"} to fit it${
                result.found > result.options.length ? `, showing the best ${result.options.length}` : ""
              }. Ranked by how easy this term's sections are, then fewer days and gaps.`}
          {result.truncated && " Stopped early: star fewer courses for a complete search."}
        </p>
        {result.notOffered.length > 0 && (
          <p className="text-amber-700 dark:text-amber-400">
            Not offered this term: {result.notOffered.map(keyLabel).join(", ")}
          </p>
        )}
        {result.impossible.length > 0 && (
          <p className="text-amber-700 dark:text-amber-400">
            No section left after your filters (open seats, times, days off, honors):{" "}
            {result.impossible.map(keyLabel).join(", ")}
          </p>
        )}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {result.options.map((option, i) => (
          <OptionCard key={option.courses.join("|")} option={option} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

function OptionCard({ option, rank }: { option: Option; rank: number }) {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const schedule = option.schedules[Math.min(index, option.schedules.length - 1)];
  const color = (code: string) => COLORS[option.courses.indexOf(code) % COLORS.length];
  const crns = schedule.sections.map((s) => s.crn).join(", ");

  return (
    <article className="space-y-3 rounded-lg border border-border bg-white/60 p-4 dark:bg-raised">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs text-text-muted">Option {rank}</div>
          <div className="flex flex-wrap gap-1.5">
            {option.courses.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-sm font-medium text-text-heading"
              >
                <span className={cn("h-2.5 w-2.5 rounded-full", color(c))} />
                {keyLabel(c)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div className="text-xs text-text-body">
            {schedule.days} day{schedule.days === 1 ? "" : "s"} a week
            {schedule.uncertain.length > 0 && (
              <div className="text-amber-700 dark:text-amber-400">
                {schedule.uncertain.length} unknown prof{schedule.uncertain.length === 1 ? "" : "s"}
              </div>
            )}
          </div>
          <EasinessPill score={schedule.easiness} />
        </div>
      </header>

      <WeekView schedule={schedule} color={color} />

      <table className="w-full text-sm">
        <tbody>
          {schedule.sections.map((s) => (
            <tr key={s.crn} className="border-t border-border/60 align-top">
              <td className="py-1.5 pr-2">
                <Link
                  href={`/course/${courseId(parseTopicKey(s.course).code)}`}
                  className="font-medium text-text-heading hover:underline"
                >
                  {keyLabel(s.course)}
                </Link>
                <div className="text-xs text-text-muted">
                  {s.type} {s.section} · CRN {s.crn}
                </div>
              </td>
              <td className="py-1.5 pr-2 text-text-body">
                {s.instructor ?? "TBA"}
                {s.easiness == null && (
                  <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    {s.instructor ? "No history for this course" : "Instructor not announced"}
                  </div>
                )}
              </td>
              <td className="py-1.5 pr-2 text-xs text-text-body">
                {s.meetings.length === 0
                  ? "Online / no set time"
                  : s.meetings.map((m, i) => (
                      <div key={i}>
                        {m.days.join("")} {formatTime(m.start)}–{formatTime(m.end)}
                      </div>
                    ))}
              </td>
              <td className="py-1.5 text-right">
                {s.easiness != null && <EasinessPill score={s.easiness} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="flex flex-wrap items-center justify-between gap-2">
        {option.schedules.length > 1 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIndex((i) => (i + 1) % option.schedules.length)}
          >
            Other times ({index + 1} of {option.schedules.length})
          </Button>
        ) : (
          <span />
        )}
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => {
            void navigator.clipboard?.writeText(crns).then(() => {
              track("schedule-copy-crns");
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy CRNs"}
        </Button>
      </footer>
    </article>
  );
}

/** Mon-Fri grid with each class as a block. */
function WeekView({ schedule, color }: { schedule: Schedule; color: (code: string) => string }) {
  const meetings = schedule.sections.flatMap((s) => s.meetings.map((m) => ({ s, m })));
  if (meetings.length === 0) return null;
  const startHour = Math.min(8, Math.floor(Math.min(...meetings.map((x) => x.m.start)) / 60));
  const endHour = Math.max(17, Math.ceil(Math.max(...meetings.map((x) => x.m.end)) / 60));
  const span = (endHour - startHour) * 60;
  const pct = (minutes: number) => ((minutes - startHour * 60) / span) * 100;

  return (
    <div className="grid grid-cols-[2.5rem_repeat(5,minmax(0,1fr))] gap-px overflow-hidden rounded-md border border-border bg-border text-[10px]">
      <div className="bg-white dark:bg-card" />
      {WEEKDAYS.map((d) => (
        <div key={d} className="bg-white py-1 text-center font-medium text-text-body dark:bg-card">
          {DAY_LABEL[d]}
        </div>
      ))}
      <div className="relative h-56 bg-white dark:bg-card">
        {Array.from({ length: endHour - startHour + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute right-1 -translate-y-1/2 text-text-muted"
            style={{ top: `${pct((startHour + i) * 60)}%` }}
          >
            {formatTime((startHour + i) * 60).replace(":00", "")}
          </div>
        ))}
      </div>
      {WEEKDAYS.map((d) => (
        <div key={d} className="relative h-56 bg-white dark:bg-card">
          {meetings
            .filter(({ m }) => m.days.includes(d))
            .map(({ s, m }, i) => (
              <div
                key={`${s.crn}-${i}`}
                className={cn(
                  "absolute inset-x-0.5 overflow-hidden rounded px-1 leading-tight text-white",
                  color(s.course),
                )}
                style={{ top: `${pct(m.start)}%`, height: `${pct(m.end) - pct(m.start)}%` }}
                title={`${keyLabel(s.course)} ${formatTime(m.start)}–${formatTime(m.end)}`}
              >
                {keyLabel(s.course)}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
