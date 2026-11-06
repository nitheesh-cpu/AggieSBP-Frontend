"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Loader2,
  UserCheck,
  XCircle,
} from "lucide-react";

import { fetchCoursePrereqs } from "@/hooks/use-course-prereqs";
import type { CoursePrereqs } from "@/lib/api";
import {
  buildContext,
  evaluateCourse,
  evaluateTree,
  type EvalContext,
  type PrereqNode,
  type ReqStatus,
} from "@/lib/planner/prereqs";
import {
  courseId,
  currentTermKey,
  nextTermKey,
  termLabel,
  type AcademicRecord,
} from "@/lib/planner/record";
import { cn } from "@/lib/utils";

import { CourseSearch } from "./course-search";
import { TermSelect } from "./record-fields";

const STATUS_STYLE: Record<ReqStatus | "taken", { icon: typeof CheckCircle2; className: string }> = {
  met: { icon: CheckCircle2, className: "text-emerald-600 dark:text-emerald-400" },
  taken: { icon: CheckCircle2, className: "text-emerald-600 dark:text-emerald-400" },
  approval: { icon: UserCheck, className: "text-sky-600 dark:text-sky-400" },
  unknown: { icon: CircleHelp, className: "text-amber-600 dark:text-amber-400" },
  unmet: { icon: XCircle, className: "text-red-600 dark:text-red-400" },
};

/** Pick a course and a term; see whether the record satisfies its prerequisites. */
export function PrereqCheck({ record }: { record: AcademicRecord }) {
  const current = currentTermKey();
  const [term, setTerm] = useState<string>(() => nextTermKey(current));
  const [course, setCourse] = useState<CoursePrereqs | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const requestRef = useRef(0);

  const pick = async (code: string) => {
    const request = ++requestRef.current; // only the latest pick may set state
    setPicked(code);
    setLoading(true);
    setFailed(false);
    try {
      const result = await fetchCoursePrereqs(code);
      if (request === requestRef.current) setCourse(result);
    } catch {
      if (request === requestRef.current) {
        setCourse(null);
        setFailed(true);
      }
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  };

  const ctx = buildContext(record, term, { currentTerm: current });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <CourseSearch onSelect={(code) => void pick(code)} placeholder="Which course? e.g. CSCE 411" />
        </div>
        <div className="flex items-center gap-2 text-sm text-text-body dark:text-white/80">
          <span>in</span>
          <TermSelect
            value={term}
            onChange={(t) => setTerm(t ?? nextTermKey(current))}
            label="Target term"
            noneLabel="Pick a term"
          />
        </div>
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-text-body">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking {picked}…
        </p>
      )}
      {failed && (
        <p className="text-sm text-red-600">
          Couldn&apos;t load prerequisites for {picked}. Try again in a moment.
        </p>
      )}
      {!loading && picked && !failed && !course && (
        <p className="text-sm text-text-body">{picked} isn&apos;t in the catalog.</p>
      )}
      {!loading && course && <CheckResult course={course} ctx={ctx} term={term} />}
    </div>
  );
}

function CheckResult({ course, ctx, term }: { course: CoursePrereqs; ctx: EvalContext; term: string }) {
  const result = evaluateCourse(course.code, course, ctx);
  const style = STATUS_STYLE[result.status];
  const Icon = style.icon;
  const headline = {
    taken: `You've already taken ${course.code}.`,
    met: `You can take ${course.code} in ${termLabel(term)}.`,
    approval: `You can take ${course.code} in ${termLabel(term)} with approval.`,
    unknown: `You may be able to take ${course.code} in ${termLabel(term)}. Check the items marked ? below.`,
    unmet: `You can't take ${course.code} in ${termLabel(term)} yet.`,
  }[result.status];
  const noTrees = !course.prereqTree && !course.coreqTree;

  return (
    <div className="rounded-lg border border-border bg-white/60 p-4 dark:bg-white/5">
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.className)} />
        <div className="space-y-1">
          <p className="font-semibold text-text-heading dark:text-white">{headline}</p>
          <p className="text-sm text-text-body dark:text-white/70">
            <Link href={`/course/${courseId(course.code)}`} className="hover:underline">
              {course.code} · {course.name}
            </Link>
          </p>
          {result.status === "unmet" && "missing" in result && result.missing.length > 0 && (
            <p className="text-sm text-text-body dark:text-white/80">
              Still needed: <strong>{result.missing.join(", ")}</strong>
            </p>
          )}
          {"takeTogether" in result && result.takeTogether.length > 0 && (
            <p className="text-sm text-text-body dark:text-white/80">
              Counts only if you take {result.takeTogether.join(", ")} in the same term.
            </p>
          )}
        </div>
      </div>

      {result.status !== "taken" && (
        <div className="mt-4 space-y-3 text-sm">
          {noTrees && !course.prereqText && (
            <p className="text-text-body dark:text-white/70">No prerequisites listed.</p>
          )}
          {course.prereqTree && (
            <div>
              <div className="mb-1 font-medium text-text-heading dark:text-white">Prerequisites</div>
              <RequirementTree node={course.prereqTree} ctx={ctx} />
            </div>
          )}
          {course.coreqTree && (
            <div>
              <div className="mb-1 font-medium text-text-heading dark:text-white">
                Corequisites (before or the same term)
              </div>
              <RequirementTree node={course.coreqTree} ctx={ctx} />
            </div>
          )}
          {(course.confidence === "low" || (noTrees && course.prereqText)) && (
            <p className="flex items-start gap-2 rounded-md bg-amber-50 p-2 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                The catalog wording here is hard to read reliably, so double-check it:{" "}
                <em>{course.prereqText}</em>
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const APPROVER: Record<string, string> = {
  instructor: "the instructor",
  department: "the department",
  advisor: "an advisor",
  other: "the department or program",
};

/** The tree as nested "All of / One of" lists, each item marked met or not. */
function RequirementTree({ node, ctx }: { node: PrereqNode; ctx: EvalContext }) {
  const status = evaluateTree(node, ctx).status;
  const style = STATUS_STYLE[status];
  const Icon = style.icon;

  if (node.type === "and" || node.type === "or") {
    return (
      <div>
        <div className="flex items-center gap-2 text-text-body dark:text-white/80">
          <Icon className={cn("h-4 w-4 shrink-0", style.className)} />
          {node.type === "and" ? "All of:" : "One of:"}
        </div>
        <ul className="ml-2 mt-1 space-y-1 border-l border-border pl-4">
          {node.children.map((child, i) => (
            <li key={i}>
              <RequirementTree node={child} ctx={ctx} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  let label: React.ReactNode;
  switch (node.type) {
    case "course":
      label = (
        <>
          <Link href={`/course/${courseId(node.code)}`} className="font-medium hover:underline">
            {node.code}
          </Link>
          {node.min_grade && <span className="text-text-body/80"> ({node.min_grade} or better)</span>}
          {node.concurrent && <span className="text-text-body/80"> · can be taken the same term</span>}
        </>
      );
      break;
    case "classification":
      label = `${node.levels.map((l) => l[0].toUpperCase() + l.slice(1)).join(" or ")} classification${
        ctx.classification ? "" : " (set yours above)"
      }`;
      break;
    case "approval":
      label = `Approval from ${APPROVER[node.by] ?? APPROVER.other}`;
      break;
    case "condition":
      label = node.text || "Other requirement";
      break;
  }
  return (
    <div className="flex items-start gap-2 text-text-heading dark:text-white/90">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.className)} />
      <span>{label}</span>
    </div>
  );
}
