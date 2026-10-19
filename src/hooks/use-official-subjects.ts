import { useEffect, useState } from "react";
import { getDepartments } from "@/lib/api";

export interface Subject {
  code: string;
  name: string;
}

let cached: Promise<Subject[]> | null = null;

function loadSubjects(): Promise<Subject[]> {
  if (!cached) {
    cached = getDepartments({ limit: 1000 })
      .then((rows) =>
        rows
          .filter((d) => d.code)
          // Names arrive as "CSCE - Computer Sci & Engr"; keep just the name.
          .map((d) => ({
            code: d.code,
            name: (d.name || "").replace(/^[A-Z]+\s*-\s*/, "") || d.code,
          }))
          .sort((a, b) => a.code.localeCompare(b.code))
      )
      .catch((err) => {
        cached = null;
        throw err;
      });
  }
  return cached;
}

/**
 * Official TAMU subject codes (CSCE, MATH, ...). RateMyProfessor course labels
 * are free text ("BBQCLASS", "206"), so anything shown as a department is
 * checked against this list first.
 */
export function useOfficialSubjects(): {
  subjects: Subject[];
  codes: Set<string>;
} {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  useEffect(() => {
    let alive = true;
    loadSubjects()
      .then((s) => alive && setSubjects(s))
      .catch((err) => console.error("Failed to load subjects:", err));
    return () => {
      alive = false;
    };
  }, []);
  return { subjects, codes: new Set(subjects.map((s) => s.code)) };
}
