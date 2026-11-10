// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  formatMeeting,
  formatSectionBrief,
  formatSectionLine,
  parseMeetings,
  seatStatus,
  summarizeSections,
} from "./section-times.ts";

const sec = (crn: string, meetings: string | null, is_open = true, extra = {}) => ({
  id: crn,
  crn,
  section: "501",
  is_open,
  instructor: "Smith",
  meetings,
  ...extra,
});

test("parseMeetings handles 12h, 24h, multiple meetings and junk", () => {
  assert.deepEqual(parseMeetings("MWF 09:10 AM-10:00 AM"), [{ days: "MWF", start: 550, end: 600 }]);
  assert.deepEqual(parseMeetings("TR 12:45 PM-02:00 PM; F 13:00-14:00"), [
    { days: "TR", start: 765, end: 840 },
    { days: "F", start: 780, end: 840 },
  ]);
  assert.deepEqual(parseMeetings("MWF 12:00 AM-12:50 AM"), [{ days: "MWF", start: 0, end: 50 }]);
  assert.deepEqual(parseMeetings(null), []);
  assert.deepEqual(parseMeetings(""), []);
  assert.deepEqual(parseMeetings("garbage"), []);
});

test("formatMeeting collapses a shared AM/PM", () => {
  assert.equal(formatMeeting({ days: "MWF", start: 550, end: 600 }), "MWF 9:10–10:00 AM");
  assert.equal(formatMeeting({ days: "TR", start: 670, end: 745 }), "TR 11:10 AM–12:25 PM");
  assert.equal(formatMeeting({ days: "", start: 780, end: 840 }), "1:00–2:00 PM");
});

test("summarizeSections dedupes and sorts by start then days", () => {
  const s = summarizeSections([
    sec("1", "TR 11:10 AM-12:25 PM"),
    sec("2", "MWF 09:10 AM-10:00 AM", false),
    sec("3", "TR 11:10 AM-12:25 PM"),
    sec("4", "MWF 11:10 AM-12:00 PM"),
    sec("5", null),
  ]);
  assert.deepEqual(s.times, ["MWF 9:10–10:00 AM", "MWF 11:10 AM–12:00 PM", "TR 11:10 AM–12:25 PM"]);
  assert.equal(s.sectionCount, 5);
  assert.equal(s.openCount, 4);
  assert.equal(s.timedSectionCount, 4);
});

test("sections with only online/TBA have no times", () => {
  const s = summarizeSections([sec("1", null), sec("2", "")]);
  assert.deepEqual(s.times, []);
  assert.equal(s.sectionCount, 2);
  assert.equal(s.timedSectionCount, 0);
});

test("formatSectionLine", () => {
  const s = summarizeSections([sec("12345", "MWF 09:10 AM-10:00 AM"), sec("9", null, false)]);
  assert.equal(formatSectionLine(s.sections[0]), "Sec 501 · CRN 12345 · Smith · MWF 9:10–10:00 AM · open");
  assert.equal(formatSectionLine(s.sections[1]), "Sec 501 · CRN 9 · Smith · online/TBA · full");
});

test("summarizeSections orders same-time meetings by weekday", () => {
  const s = summarizeSections([
    sec("1", "R 07:30 PM-10:30 PM"),
    sec("2", "M 07:30 PM-10:30 PM"),
    sec("3", "T 07:30 PM-10:30 PM"),
  ]);
  assert.deepEqual(s.times, ["M 7:30–10:30 PM", "T 7:30–10:30 PM", "R 7:30–10:30 PM"]);
});

test("seatStatus tells full, open and empty courses apart", () => {
  const full = seatStatus([sec("1", "MWF 09:10 AM-10:00 AM", false), sec("2", null, false)]);
  assert.deepEqual(full, { sectionCount: 2, openCount: 0, full: true, hasOpen: false });
  const mixed = seatStatus([sec("1", null, false), sec("2", null, true)]);
  assert.deepEqual(mixed, { sectionCount: 2, openCount: 1, full: false, hasOpen: true });
  const none = seatStatus([]);
  assert.equal(none.full, false);
  assert.equal(none.hasOpen, false);
});

test("formatSectionBrief is a short picker line", () => {
  const [line] = summarizeSections([sec("1", "MWF 09:10 AM-10:00 AM", false)]).sections;
  assert.equal(formatSectionBrief(line), "Sec 501 · MWF 9:10–10:00 AM · Smith");
  const [tba] = summarizeSections([sec("2", null, false, { section: null, instructor: null })]).sections;
  assert.equal(formatSectionBrief(tba), "CRN 2 · online/TBA");
});
