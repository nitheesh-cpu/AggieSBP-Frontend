"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardPaste } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCoursePrereqs } from "@/hooks/use-course-prereqs";
import { track } from "@/lib/analytics";
import {
  defaultStatusForTerm,
  parsePastedCourses,
  type CourseInput,
  type CourseStatus,
  type Grade,
} from "@/lib/planner/record";

import { GradeSelect, StatusSelect, TermSelect } from "./record-fields";

interface Row {
  code: string;
  include: boolean;
  term: string | null;
  grade: Grade | null;
  status: CourseStatus;
}

const EXAMPLE = `CSCE 121, CSCE 221, MATH 151, MATH 152

or paste lines from your transcript:
Fall 2025
CSCE 222  DISCRETE STRUC COMPUTING  3.000  A`;

/**
 * Paste a list of courses (or transcript lines), review what was found, then
 * add the selected ones. Nothing is added until the student confirms.
 */
export function PasteImportDialog({
  existing,
  onImport,
}: {
  existing: ReadonlySet<string>;
  onImport: (courses: CourseInput[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  // Per-code edits on top of what was parsed.
  const [edits, setEdits] = useState<Record<string, Partial<Row>>>({});

  const parsed = useMemo(() => parsePastedCourses(text), [text]);
  const codes = useMemo(() => parsed.map((p) => p.code), [parsed]);
  const { info, unknown, error } = useCoursePrereqs(codes);
  const unknownSet = new Set(unknown);

  const rows: Row[] = parsed.map((p) => ({
    code: p.code,
    term: p.term,
    grade: p.grade,
    status: defaultStatusForTerm(p.term),
    // Skip codes the catalog doesn't have (likely typos) unless re-checked.
    include: !unknownSet.has(p.code),
    ...edits[p.code],
  }));
  const selected = rows.filter((r) => r.include);

  const edit = (code: string, patch: Partial<Row>) =>
    setEdits((prev) => ({ ...prev, [code]: { ...prev[code], ...patch } }));

  const reset = () => {
    setText("");
    setEdits({});
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o && !open) track("planner-import-open", { source: "paste" });
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ClipboardPaste className="h-4 w-4" />
          Paste a list
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-3xl dark:bg-card">
        <DialogHeader>
          <DialogTitle>Paste your courses</DialogTitle>
          <DialogDescription>
            Paste course codes separated by commas or lines, or copy rows from your
            transcript in Howdy. We pick out the course codes, plus the term and grade
            when the lines include them. You can review everything before it&apos;s added.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE}
          rows={7}
          className="font-mono text-sm"
          aria-label="Pasted courses"
        />

        {rows.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-text-body">
              Found {rows.length} course{rows.length === 1 ? "" : "s"}. Fix any term,
              grade, or status below.
              {error && " Couldn't check course names right now, so all are selected."}
            </p>
            <div className="max-h-[45vh] overflow-y-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white/95 text-left text-xs text-text-body dark:bg-card">
                  <tr>
                    <th className="w-8 p-2" />
                    <th className="p-2">Course</th>
                    <th className="p-2">Term</th>
                    <th className="p-2">Grade</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const name = info[r.code]?.name;
                    const isUnknown = unknownSet.has(r.code);
                    return (
                      <tr key={r.code} className="border-t border-border/60">
                        <td className="p-2">
                          <Checkbox
                            checked={r.include}
                            onCheckedChange={(v) => edit(r.code, { include: v === true })}
                            aria-label={`Include ${r.code}`}
                          />
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-text-heading">
                            {r.code}
                            {existing.has(r.code) && (
                              <span className="ml-2 text-xs font-normal text-text-muted">
                                already added, will update
                              </span>
                            )}
                          </div>
                          {name && (
                            <div className="text-xs text-text-body">{name}</div>
                          )}
                          {isUnknown && (
                            <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                              <AlertTriangle className="h-3 w-3" />
                              Not in the catalog. Check for a typo.
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <TermSelect
                            value={r.term}
                            onChange={(term) =>
                              edit(r.code, { term, status: defaultStatusForTerm(term) })
                            }
                            label={`Term for ${r.code}`}
                          />
                        </td>
                        <td className="p-2">
                          <GradeSelect
                            value={r.grade}
                            onChange={(grade) => edit(r.code, { grade })}
                            label={`Grade for ${r.code}`}
                          />
                        </td>
                        <td className="p-2">
                          <StatusSelect
                            value={r.status}
                            onChange={(status) => edit(r.code, { status })}
                            label={`Status for ${r.code}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={selected.length === 0}
            onClick={() => {
              onImport(
                selected.map((r) => ({
                  code: r.code,
                  status: r.status,
                  term: r.term,
                  grade: r.grade,
                  source: "paste",
                })),
              );
              setOpen(false);
              reset();
            }}
          >
            Add {selected.length} course{selected.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
