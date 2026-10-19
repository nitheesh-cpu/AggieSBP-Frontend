import type { Term } from "@/lib/api";

const DAY_MS = 24 * 60 * 60 * 1000;
// Registration opens roughly three months before a term starts.
const REGISTRATION_LEAD_DAYS = 120;

export function isCollegeStation(term: Term): boolean {
  return /college station/i.test(term.termDesc);
}

/**
 * The College Station term students are most likely planning for today: the
 * latest one that hasn't ended and whose registration is open or about to be.
 * In October that is next spring, not the fall term in progress.
 */
export function pickDefaultTerm(terms: Term[], now: Date = new Date()): string {
  const cs = terms.filter(isCollegeStation);
  const pool = cs.length > 0 ? cs : terms;
  if (pool.length === 0) return "";

  const today = now.getTime();
  const horizon = today + REGISTRATION_LEAD_DAYS * DAY_MS;
  const candidates = pool.filter((t) => {
    const start = Date.parse(t.startDate);
    const end = Date.parse(t.endDate);
    return (isNaN(end) || end >= today) && (isNaN(start) || start <= horizon);
  });
  const byStartDesc = (a: Term, b: Term) =>
    Date.parse(b.startDate) - Date.parse(a.startDate);
  const chosen = (candidates.length > 0 ? candidates : pool).sort(byStartDesc)[0];
  return chosen?.termCode ?? "";
}

/**
 * College Station terms first (newest first), then every other campus or
 * session type, so the common choice is at the top of each term menu.
 */
export function sortTermsForMenu(terms: Term[]): {
  main: Term[];
  other: Term[];
} {
  const byStartDesc = (a: Term, b: Term) =>
    Date.parse(b.startDate) - Date.parse(a.startDate);
  return {
    main: terms.filter(isCollegeStation).sort(byStartDesc),
    other: terms.filter((t) => !isCollegeStation(t)).sort(byStartDesc),
  };
}

/** "Spring 2027 - College Station" -> "Spring 2027" for College Station terms. */
export function shortTermName(term?: Term | null): string {
  if (!term) return "";
  return isCollegeStation(term)
    ? term.termDesc.replace(/\s*-\s*College Station/i, "")
    : term.termDesc;
}
