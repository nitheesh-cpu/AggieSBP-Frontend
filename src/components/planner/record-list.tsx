"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CoursePrereqs } from "@/lib/api";
import {
  courseId,
  termLabel,
  type CourseInput,
  type CourseStatus,
  type RecordCourse,
} from "@/lib/planner/record";

import { GradeSelect, STATUS_LABELS, StatusSelect, TermSelect } from "./record-fields";

interface RecordListProps {
  courses: RecordCourse[];
  info: Record<string, CoursePrereqs>;
  onEdit: (code: string, patch: Partial<CourseInput>) => void;
  onRemove: (code: string) => void;
}

const STATUS_ORDER: CourseStatus[] = ["in_progress", "planned", "completed"];

/** Courses grouped by status, then by term (planned soonest first, completed newest first). */
export function RecordList({ courses, info, onEdit, onRemove }: RecordListProps) {
  return (
    <div className="space-y-6">
      {STATUS_ORDER.map((status) => {
        const inStatus = courses.filter((c) => c.status === status);
        if (inStatus.length === 0) return null;
        const terms = [...new Set(inStatus.map((c) => c.term ?? ""))].sort((a, b) => {
          if (!a) return 1; // "no term" last
          if (!b) return -1;
          return status === "planned" ? a.localeCompare(b) : b.localeCompare(a);
        });
        return (
          <section key={status} aria-labelledby={`record-${status}`}>
            <h3
              id={`record-${status}`}
              className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-body dark:text-white/70"
            >
              {STATUS_LABELS[status]} · {inStatus.length}
            </h3>
            <div className="space-y-3">
              {terms.map((term) => (
                <div key={term || "none"}>
                  {(terms.length > 1 || term) && (
                    <div className="mb-1 text-xs font-medium text-text-body/80 dark:text-white/60">
                      {term ? termLabel(term) : "No term (credit by exam, transfer, or unknown)"}
                    </div>
                  )}
                  <ul className="divide-y divide-border/60 rounded-lg border border-border bg-white/60 dark:bg-white/5">
                    {inStatus
                      .filter((c) => (c.term ?? "") === term)
                      .map((c) => (
                        <CourseRow
                          key={c.code}
                          course={c}
                          name={info[c.code]?.name ?? null}
                          onEdit={onEdit}
                          onRemove={onRemove}
                        />
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CourseRow({
  course,
  name,
  onEdit,
  onRemove,
}: {
  course: RecordCourse;
  name: string | null;
  onEdit: RecordListProps["onEdit"];
  onRemove: RecordListProps["onRemove"];
}) {
  const c = course;
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
      <div className="min-w-[10rem] flex-1">
        <Link
          href={`/course/${courseId(c.code)}`}
          className="font-semibold text-text-heading hover:underline dark:text-white"
        >
          {c.code}
        </Link>
        {name && <span className="ml-2 text-sm text-text-body dark:text-white/70">{name}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TermSelect
          value={c.term ?? null}
          onChange={(term) => onEdit(c.code, { term })}
          label={`Term for ${c.code}`}
        />
        <GradeSelect
          value={c.grade ?? null}
          onChange={(grade) => onEdit(c.code, { grade })}
          label={`Grade for ${c.code}`}
        />
        <StatusSelect
          value={c.status}
          onChange={(status) => onEdit(c.code, { status })}
          label={`Status for ${c.code}`}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-body/70 hover:text-red-600"
          onClick={() => onRemove(c.code)}
          aria-label={`Remove ${c.code}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
