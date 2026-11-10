"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEligibility, type CourseStanding } from "@/hooks/use-eligibility";
import { isCovered, isDone } from "@/lib/planner/find";
import {
  activeBuckets,
  addBucket,
  MAX_REQUIREMENTS_PER_COURSE,
  planProgress,
  removeBucket,
  updateBucket,
  type Bucket,
  type BucketProgress,
  type DegreePlan,
  type PlanProgress,
} from "@/lib/planner/plan";
import { courseId, type AcademicRecord } from "@/lib/planner/record";
import type { CoursePrereqs } from "@/lib/api";
import { cn } from "@/lib/utils";

import { CourseSearch } from "./course-search";
import { CourseStateBadge } from "./course-state";
import { WatchButton, type PlanUpdate } from "./plan-actions";

interface Shared {
  record: AcademicRecord;
  plan: DegreePlan;
  update: PlanUpdate;
  standing: (code: string) => CourseStanding;
  info: Record<string, CoursePrereqs>;
  showStanding: boolean;
}

/**
 * Requirement groups: "pick N of these options", where an option is one
 * course or a combination that must all be taken.
 */
export function Requirements({
  record,
  plan,
  update,
  termKey,
}: {
  record: AcademicRecord;
  plan: DegreePlan;
  update: PlanUpdate;
  termKey: string;
}) {
  const buckets = activeBuckets(plan);
  const codes = useMemo(
    () => [...new Set(buckets.flatMap((b) => b.options.flatMap((o) => o.courses)))],
    [buckets],
  );
  const { info, error, standing } = useEligibility(record, codes, termKey);
  const [creating, setCreating] = useState(false);
  const shared: Shared = { record, plan, update, standing, info, showStanding: !error };
  // Shared across groups: a course counts toward at most two of them.
  const done = useMemo(() => planProgress(buckets, (c) => isDone(record, c)), [buckets, record]);
  const covered = useMemo(
    () => planProgress(buckets, (c) => isCovered(record, c)),
    [buckets, record],
  );

  // Groups that share an area (from Howdy, or added to one) are shown together.
  const sections = useMemo(() => {
    const out: { area: string | null; buckets: Bucket[] }[] = [];
    for (const b of buckets) {
      const area = b.area ?? null;
      const section = area ? out.find((x) => x.area === area) : undefined;
      if (section) section.buckets.push(b);
      else out.push({ area, buckets: [b] });
    }
    return out;
  }, [buckets]);
  const card = (b: Bucket, nested = false) => (
    <BucketCard
      key={b.id}
      bucket={b}
      nested={nested}
      {...shared}
      done={done.byBucket.get(b.id) ?? EMPTY_PROGRESS}
      covered={covered.byBucket.get(b.id) ?? EMPTY_PROGRESS}
      blocked={covered.blockedOptions}
    />
  );

  return (
    <div className="space-y-4">
      {buckets.length === 0 && !creating && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="font-medium text-text-heading">No requirements yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-text-body">
            Import them from Howdy, or add the choices left in your degree, like &ldquo;1 stats
            class from STAT 211, 301 or 303&rdquo; or &ldquo;2 CS electives&rdquo;. Each option can
            be one course or a combination, like &ldquo;MATH 251 and MATH 308&rdquo;.
          </p>
        </div>
      )}

      <div className="grid items-start gap-4 2xl:grid-cols-2">
        {sections.map((section) =>
          section.area ? (
            <AreaCard
              key={`area:${section.area}`}
              area={section.area}
              buckets={section.buckets}
              done={done}
              covered={covered}
              update={update}
            >
              {section.buckets.map((b) => card(b, true))}
            </AreaCard>
          ) : (
            section.buckets.map((b) => card(b))
          ),
        )}
      </div>

      {creating ? (
        <NewBucketForm
          areas={sections.map((x) => x.area).filter((a): a is string => !!a)}
          onCancel={() => setCreating(false)}
          onCreate={(input) => {
            update((p) => addBucket(p, input));
            setCreating(false);
          }}
        />
      ) : (
        <Button variant="outline" className="gap-2" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New requirement
        </Button>
      )}
    </div>
  );
}

/** One of Howdy's areas ("Statistics Minor") holding its rules. */
function AreaCard({
  area,
  buckets,
  done,
  covered,
  update,
  children,
}: {
  area: string;
  buckets: Bucket[];
  done: PlanProgress;
  covered: PlanProgress;
  update: PlanUpdate;
  children: React.ReactNode;
}) {
  const [adding, setAdding] = useState(false);
  const picks = buckets.reduce((sum, b) => sum + b.pick, 0);
  const satisfied = buckets.reduce(
    (sum, b) => sum + Math.min(done.byBucket.get(b.id)?.satisfiedOptions.length ?? 0, b.pick),
    0,
  );
  const complete = picks > 0 && satisfied >= picks;
  const plannedComplete =
    picks > 0 && buckets.every((b) => covered.byBucket.get(b.id)?.complete);
  return (
    <section
      className="space-y-3 rounded-lg border border-border bg-white/60 p-4 dark:bg-raised"
      aria-label={area}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-text-heading">
          {area}{" "}
          <span
            className={cn(
              "text-sm font-medium",
              complete
                ? "text-emerald-600 dark:text-emerald-400"
                : plannedComplete
                  ? "text-sky-600 dark:text-sky-400"
                  : "text-red-600 dark:text-red-400",
            )}
          >
            {complete ? "Met" : plannedComplete ? "Met with your plan" : "Not met"}
          </span>
        </h3>
        <div className="w-40 text-right">
          <div className="text-xs text-text-body">
            {satisfied} of {picks} done
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${picks ? (satisfied / picks) * 100 : 0}%` }}
            />
          </div>
        </div>
      </header>
      <div className="space-y-3">{children}</div>
      {adding ? (
        <NewBucketForm
          areas={[area]}
          fixedArea={area}
          onCancel={() => setAdding(false)}
          onCreate={(input) => {
            update((p) => addBucket(p, input));
            setAdding(false);
          }}
        />
      ) : (
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add a rule to {area}
        </Button>
      )}
    </section>
  );
}

/**
 * The degree's list of courses that can count, collapsed: suggestions to add
 * as options, not part of the plan.
 */
function AllowedCourses({
  codes,
  info,
  onAdd,
}: {
  codes: string[];
  info: Record<string, CoursePrereqs>;
  onAdd: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1 text-sm text-text-body hover:text-text-heading"
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        {codes.length} other course{codes.length === 1 ? "" : "s"} can count
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {codes.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onAdd(code)}
              title={info[code]?.name ? `Add ${code}: ${info[code].name}` : `Add ${code}`}
              className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-text-body hover:border-text-muted hover:text-text-heading"
            >
              <Plus className="h-3 w-3" /> {code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_PROGRESS: BucketProgress = { satisfiedOptions: [], remaining: 0, complete: false };

function PickSelect({
  value,
  max,
  onChange,
  label,
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
}) {
  const options = Array.from({ length: Math.max(max, 1) }, (_, i) => i + 1);
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className="h-8 w-16 text-sm" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((n) => (
          <SelectItem key={n} value={String(n)}>
            {n}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function NewBucketForm({
  onCreate,
  onCancel,
  areas = [],
  fixedArea,
}: {
  onCreate: (input: { name: string; pick: number; options: string[][]; area: string | null }) => void;
  onCancel: () => void;
  /** Existing areas to suggest. */
  areas?: string[];
  /** Adding inside an area card: the area is set and not shown. */
  fixedArea?: string;
}) {
  const [name, setName] = useState("");
  const [area, setArea] = useState(fixedArea ?? "");
  const [pick, setPick] = useState(1);
  const [options, setOptions] = useState<string[]>([]);
  const valid = name.trim().length > 0 && options.length > 0;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-white/60 p-4 dark:bg-raised">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name, e.g. Stats class or CS electives"
          aria-label="Requirement name"
          autoFocus
          className="sm:flex-1"
        />
        <div className="flex items-center gap-2 text-sm text-text-body">
          Pick
          <PickSelect
            value={Math.min(pick, Math.max(options.length, 1))}
            max={options.length}
            onChange={setPick}
            label="How many to pick"
          />
          of {options.length || "the"} option{options.length === 1 ? "" : "s"}
        </div>
      </div>
      {!fixedArea && (
        <>
          <Input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Part of (optional), e.g. Statistics Minor"
            aria-label="Area this requirement belongs to"
            list="requirement-areas"
          />
          <datalist id="requirement-areas">
            {areas.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </>
      )}
      <CourseSearch
        placeholder="Add the courses you could choose from"
        existing={new Set(options)}
        onSelect={(code) => setOptions((o) => (o.includes(code) ? o : [...o, code]))}
      />
      {options.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {options.map((code) => (
            <li
              key={code}
              className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-sm"
            >
              {code}
              <button
                type="button"
                onClick={() => setOptions((o) => o.filter((c) => c !== code))}
                className="text-text-muted hover:text-red-600"
                aria-label={`Remove ${code}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-text-muted">
        Each course is its own option. You can add combinations (&ldquo;A and B&rdquo;) after
        saving.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={!valid}
          onClick={() =>
            onCreate({
              area: (fixedArea ?? area).trim() || null,
              name,
              pick: Math.min(pick, options.length),
              options: options.map((c) => [c]),
            })
          }
        >
          Save requirement
        </Button>
      </div>
    </div>
  );
}

function BucketCard({
  bucket,
  nested = false,
  plan,
  update,
  standing,
  info,
  showStanding,
  done,
  covered,
  blocked,
}: Shared & {
  bucket: Bucket;
  nested?: boolean;
  done: BucketProgress;
  covered: BucketProgress;
  blocked: ReadonlySet<string>;
}) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(bucket.name);
  const [combo, setCombo] = useState<string[] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const doneCount = Math.min(done.satisfiedOptions.length, bucket.pick);
  const coveredCount = Math.min(covered.satisfiedOptions.length, bucket.pick);
  const existing = new Set(bucket.options.flatMap((o) => o.courses));

  const setOptions = (options: string[][]) =>
    update((p) => updateBucket(p, bucket.id, { options }));
  const current = bucket.options.map((o) => o.courses);

  return (
    <section
      className={cn(
        "rounded-lg border p-4",
        nested
          ? "border-border/60 bg-white/40 dark:bg-white/[0.02]"
          : "border-border bg-white/60 dark:bg-raised",
      )}
      aria-label={bucket.area ? `${bucket.area}: ${bucket.name}` : bucket.name}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {editingName ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) update((p) => updateBucket(p, bucket.id, { name }));
                setEditingName(false);
              }}
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8"
                autoFocus
                aria-label="Requirement name"
              />
              <Button type="submit" size="icon" variant="ghost" className="h-8 w-8" aria-label="Save name">
                <Check className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <h3
              className={cn(
                "flex items-center gap-2 font-medium text-text-heading",
                nested && "text-sm",
              )}
            >
              {bucket.name}
              <button
                type="button"
                onClick={() => {
                  setName(bucket.name);
                  setEditingName(true);
                }}
                className="text-text-muted hover:text-text-heading"
                aria-label={`Rename ${bucket.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </h3>
          )}
          <div className="mt-1 flex items-center gap-2 text-sm text-text-body">
            Pick
            <PickSelect
              value={bucket.pick}
              max={Math.min(
                20,
                Math.max(bucket.pick, bucket.options.length, bucket.allowed?.length ?? 0, 6),
              )}
              onChange={(pick) => update((p) => updateBucket(p, bucket.id, { pick }))}
              label={`How many to pick for ${bucket.name}`}
            />
            of {bucket.options.length} option{bucket.options.length === 1 ? "" : "s"}
            {bucket.pick > bucket.options.length && (
              <span className="text-amber-700 dark:text-amber-400">
                · choose {bucket.pick - bucket.options.length} more
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress done={doneCount} covered={coveredCount} pick={bucket.pick} />
          {confirmDelete ? (
            <span className="flex items-center gap-1">
              <Button
                size="sm"
                variant="destructive"
                className="h-8"
                onClick={() => update((p) => removeBucket(p, bucket.id))}
              >
                Delete
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setConfirmDelete(false)}>
                Keep
              </Button>
            </span>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-muted hover:text-red-600"
              onClick={() => setConfirmDelete(true)}
              aria-label={`Delete ${bucket.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ul className="mt-3 divide-y divide-border/60 rounded-md border border-border/60">
        {bucket.options.map((option, i) => {
          const satisfied = done.satisfiedOptions.includes(option.id);
          return (
            <li
              key={option.id}
              className={cn(
                "flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2",
                satisfied && "bg-emerald-50/60 dark:bg-emerald-500/5",
              )}
            >
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                {option.courses.length > 1 && (
                  <span className="text-xs font-medium text-text-muted">All of:</span>
                )}
                {option.courses.map((code, j) => {
                  const s = standing(code);
                  return (
                    <span key={code} className="flex min-w-0 items-center gap-2">
                      {j > 0 && <span className="text-text-muted">+</span>}
                      <Link
                        href={`/course/${courseId(code)}`}
                        className="font-medium text-text-heading hover:underline"
                      >
                        {code}
                      </Link>
                      {option.courses.length === 1 && info[code]?.name && (
                        <span className="truncate text-sm text-text-body">{info[code].name}</span>
                      )}
                      {(showStanding || s.state !== "pending") && (
                        <CourseStateBadge state={s.state} eligibility={s.eligibility} />
                      )}
                    </span>
                  );
                })}
                {blocked.has(option.id) && (
                  <span className="basis-full text-xs text-amber-700 dark:text-amber-400">
                    Already counts toward {MAX_REQUIREMENTS_PER_COURSE} other requirements, so it
                    can&apos;t count here too.
                  </span>
                )}
              </div>
              <div className="flex items-center">
                {option.courses.length === 1 && (
                  <WatchButton plan={plan} update={update} code={option.courses[0]} />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-text-muted hover:text-red-600"
                  onClick={() => setOptions(current.filter((_, k) => k !== i))}
                  aria-label={`Remove option ${option.courses.join(" and ")}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          );
        })}
        {bucket.options.length === 0 && (
          <li className="px-3 py-2 text-sm text-text-body">No options yet. Add one below.</li>
        )}
      </ul>

      {bucket.allowed && bucket.allowed.some((c) => !existing.has(c)) && (
        <AllowedCourses
          codes={bucket.allowed.filter((c) => !existing.has(c))}
          info={info}
          onAdd={(code) => setOptions([...current, [code]])}
        />
      )}

      <div className="mt-3 space-y-2">
        {combo ? (
          <div className="space-y-2 rounded-md border border-dashed border-border p-3">
            <p className="text-sm text-text-body">
              Combination: all of these count together as one option.
            </p>
            <CourseSearch
              placeholder="Add a course to the combination"
              existing={new Set(combo)}
              onSelect={(code) => setCombo((c) => (c && !c.includes(code) ? [...c, code] : c))}
            />
            <div className="flex flex-wrap items-center gap-2">
              {combo.map((code) => (
                <span
                  key={code}
                  className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-sm"
                >
                  {code}
                  <button
                    type="button"
                    onClick={() => setCombo((c) => c?.filter((x) => x !== code) ?? null)}
                    className="text-text-muted hover:text-red-600"
                    aria-label={`Remove ${code} from the combination`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              <span className="ml-auto flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setCombo(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={combo.length < 2}
                  onClick={() => {
                    setOptions([...current, combo]);
                    setCombo(null);
                  }}
                >
                  Add combination
                </Button>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex-1">
              <CourseSearch
                placeholder="Add a course option"
                existing={existing}
                onSelect={(code) => {
                  if (!current.some((o) => o.length === 1 && o[0] === code)) {
                    setOptions([...current, [code]]);
                  }
                }}
              />
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setCombo([])}>
              <Plus className="h-4 w-4" /> Combination (A and B)
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function Progress({ done, covered, pick }: { done: number; covered: number; pick: number }) {
  const complete = done >= pick;
  return (
    <div className="w-36 text-right">
      <div className="text-sm font-medium text-text-heading">
        {complete ? "Complete" : `${done} of ${pick} done`}
      </div>
      {!complete && covered > done && (
        <div className="text-xs text-text-body">{covered} of {pick} with your plan</div>
      )}
      <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div className="bg-emerald-500" style={{ width: `${(done / pick) * 100}%` }} />
        <div className="bg-sky-400" style={{ width: `${((covered - done) / pick) * 100}%` }} />
      </div>
    </div>
  );
}
