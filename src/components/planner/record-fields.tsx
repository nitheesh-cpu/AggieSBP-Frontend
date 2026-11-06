"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GRADES,
  termKeyRange,
  termLabel,
  type CourseStatus,
  type Grade,
} from "@/lib/planner/record";
import { cn } from "@/lib/utils";

// Radix Select can't use "" as a value.
const NONE = "__none__";

export const STATUS_LABELS: Record<CourseStatus, string> = {
  completed: "Completed",
  in_progress: "In progress",
  planned: "Planned",
};

/** Six years back through two ahead, newest first. */
export function termOptions(now: Date = new Date()): string[] {
  const year = now.getFullYear();
  return termKeyRange(year - 6, year + 2);
}

interface FieldProps<T> {
  value: T;
  onChange: (value: T) => void;
  className?: string;
  label: string;
}

export function TermSelect({
  value,
  onChange,
  className,
  label,
  noneLabel = "No term / credit",
}: FieldProps<string | null> & { noneLabel?: string }) {
  return (
    <Select value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? null : v)}>
      <SelectTrigger className={cn("h-8 w-[9.5rem] text-xs", className)} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value={NONE}>{noneLabel}</SelectItem>
        {termOptions().map((key) => (
          <SelectItem key={key} value={key}>
            {termLabel(key)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function StatusSelect({ value, onChange, className, label }: FieldProps<CourseStatus>) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CourseStatus)}>
      <SelectTrigger className={cn("h-8 w-[8.5rem] text-xs", className)} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_LABELS) as CourseStatus[]).map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function GradeSelect({ value, onChange, className, label }: FieldProps<Grade | null>) {
  return (
    <Select value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? null : (v as Grade))}>
      <SelectTrigger className={cn("h-8 w-[5.5rem] text-xs", className)} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Grade</SelectItem>
        {GRADES.map((g) => (
          <SelectItem key={g} value={g}>
            {g}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
