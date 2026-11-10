/**
 * Compact meeting-time summaries for a course's sections, built from the
 * fit-sections endpoint's `meetings` strings, e.g. "MWF 09:10 AM-10:00 AM"
 * (several meetings joined with "; "). The backend omits meetings with no
 * begin time, so online/TBA sections arrive with `meetings` null or empty.
 *
 * No runtime imports, so `node --test` can run the tests directly.
 */

import type { DiscoverFitSection } from "../api";

export interface Meeting {
  days: string;
  /** Minutes after midnight. */
  start: number;
  end: number;
}

export interface SectionLine {
  crn: string;
  section: string | null;
  instructor: string | null;
  isOpen: boolean | null;
  /** Formatted meetings of this section; empty when online/TBA. */
  times: string[];
}

export interface TimeSummary {
  /** Distinct meeting times across sections, sorted by start time then days. */
  times: string[];
  sectionCount: number;
  openCount: number;
  /** Sections that have at least one meeting time. */
  timedSectionCount: number;
  sections: SectionLine[];
}

const MEETING_RE =
  /^([^\s]*)\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?$/i;

function toMinutes(h: number, m: number, mer: string | undefined): number {
  if (!mer) return h * 60 + m; // 24-hour
  const upper = mer.toUpperCase();
  return (h % 12) * 60 + m + (upper === "PM" ? 12 * 60 : 0);
}

/** Parse one backend meetings string. Unparseable pieces are skipped. */
export function parseMeetings(meetings: string | null | undefined): Meeting[] {
  if (!meetings) return [];
  const out: Meeting[] = [];
  for (const piece of meetings.split(";")) {
    const m = MEETING_RE.exec(piece.trim());
    if (!m) continue;
    const start = toMinutes(Number(m[2]), Number(m[3]), m[4]);
    const end = toMinutes(Number(m[5]), Number(m[6]), m[7]);
    out.push({ days: m[1].trim(), start, end });
  }
  return out;
}

function clock(min: number): { text: string; mer: "AM" | "PM" } {
  const h24 = Math.floor(min / 60) % 24;
  const mm = min % 60;
  const mer = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { text: `${h12}:${String(mm).padStart(2, "0")}`, mer };
}

/** "MWF 9:10–10:00 AM" or "TR 11:10 AM–12:25 PM". */
export function formatMeeting(m: Meeting): string {
  const a = clock(m.start);
  const b = clock(m.end);
  const range = a.mer === b.mer ? `${a.text}–${b.text} ${b.mer}` : `${a.text} ${a.mer}–${b.text} ${b.mer}`;
  return m.days ? `${m.days} ${range}` : range;
}

const DAY_ORDER = "UMTWRFS";

/** Days as a sortable key in weekday order: "MWF" before "TR", "M" before "T" before "R". */
function dayKey(days: string): string {
  return [...days.toUpperCase()]
    .map((d) => String.fromCharCode(97 + Math.max(0, DAY_ORDER.indexOf(d))))
    .join("");
}

function byTime(a: Meeting, b: Meeting): number {
  return a.start - b.start || dayKey(a.days).localeCompare(dayKey(b.days)) || a.end - b.end;
}

export function summarizeSections(sections: DiscoverFitSection[]): TimeSummary {
  const distinct = new Map<string, Meeting>();
  const lines: SectionLine[] = [];
  let openCount = 0;
  let timed = 0;
  for (const s of sections) {
    const meetings = parseMeetings(s.meetings);
    if (s.is_open) openCount++;
    if (meetings.length > 0) timed++;
    for (const m of meetings) distinct.set(`${m.days}|${m.start}|${m.end}`, m);
    lines.push({
      crn: s.crn,
      section: s.section ?? null,
      instructor: s.instructor ?? null,
      isOpen: s.is_open ?? null,
      times: meetings.map(formatMeeting),
    });
  }
  return {
    times: [...distinct.values()].sort(byTime).map(formatMeeting),
    sectionCount: sections.length,
    openCount,
    timedSectionCount: timed,
    sections: lines,
  };
}

/** "Sec 501 · CRN 12345 · Smith · MWF 9:10–10:00 AM · open" */
export function formatSectionLine(l: SectionLine): string {
  const parts = [
    l.section ? `Sec ${l.section}` : null,
    `CRN ${l.crn}`,
    l.instructor,
    l.times.length > 0 ? l.times.join("; ") : "online/TBA",
    l.isOpen == null ? null : l.isOpen ? "open" : "full",
  ];
  return parts.filter(Boolean).join(" · ");
}

export interface SeatStatus {
  sectionCount: number;
  openCount: number;
  /** Has sections and none are open. */
  full: boolean;
  /** At least one open section. */
  hasOpen: boolean;
}

/** Seat availability across a course's sections. */
export function seatStatus(sections: DiscoverFitSection[]): SeatStatus {
  const openCount = sections.filter((s) => s.is_open).length;
  return {
    sectionCount: sections.length,
    openCount,
    full: sections.length > 0 && openCount === 0,
    hasOpen: openCount > 0,
  };
}

/** Compact line for a section picker: "Sec 501 · MWF 9:10–10:00 AM · Smith". */
export function formatSectionBrief(l: SectionLine): string {
  const parts = [
    l.section ? `Sec ${l.section}` : `CRN ${l.crn}`,
    l.times.length > 0 ? l.times.join("; ") : "online/TBA",
    l.instructor,
  ];
  return parts.filter(Boolean).join(" · ");
}
