/**
 * Umami custom events. The tracker script is loaded in the root layout and
 * only reports on the production host; elsewhere (and when an ad blocker
 * stops the script) these calls do nothing.
 *
 * Every event and its data is listed in `AnalyticsEvents`, so names can't
 * drift between call sites. Plan: ../../../docs/umami-analytics-plan.md
 *
 * Don't use Umami's `data-umami-event` attribute on links: the tracker then
 * cancels the click and does a full page load, which breaks client-side
 * navigation. Call `track()` from `onClick` instead. Requests go out with
 * `keepalive`, so they survive the navigation.
 */

/** The self-hosted Umami server. */
export const UMAMI_ORIGIN = "https://stats.nitheeshk.com";

/**
 * Same-origin path that proxies the Umami scripts and endpoints (rewrites in
 * next.config.ts), so blockers that block the stats host miss them.
 */
export const UMAMI_PROXY_PATH = "/a";

/**
 * Where the tracker and recorder load from. Off unless
 * NEXT_PUBLIC_UMAMI_PROXY=1 at build time. Both scripts send events to the
 * folder they were loaded from (`<base>/api/...`), so the base sets both.
 */
export const UMAMI_BASE =
  process.env.NEXT_PUBLIC_UMAMI_PROXY === "1" ? UMAMI_PROXY_PATH : UMAMI_ORIGIN;

/** Where a search box lives. */
export type SearchFrom =
  | "home"
  | "dashboard"
  | "courses"
  | "professors"
  | "compare-courses"
  | "compare-professors"
  | "planner";

/** Where a nav link was clicked. */
export type NavFrom = "logo" | "header" | "discover-menu" | "mobile" | "footer";

/**
 * Course page blocks reported when scrolled into view. Only blocks below the
 * fold are worth tracking; ones visible on load would fire on every visit.
 */
export type CourseSection = "sections" | "professors";

export type AnalyticsEvents = {
  // Planner, fit, alerts (already shipped)
  "fit-search": { mode: string; busy_blocks: number };
  "courses-import": { source: "paste" | "howdy"; courses: number };
  "find-electives-source": { source: string };
  "course-star": { course: string };
  "course-unstar": { course: string };
  "schedule-builder-run": {
    term: string;
    set_classes: number;
    starred: number;
    options: number;
    impossible: number;
  };
  "schedule-copy-crns": undefined;
  "seat-watch": { course: string; term: string };

  // Phase 1: navigation
  "nav-click": { item: string; from: NavFrom };
  "home-cta": { cta: string };

  // Phase 1: search
  search: { from: SearchFrom; results: number; zero: boolean };
  // `kind` groups misses by cause: a course code, a CRN, a person's name, or
  // other text (see classifyQuery).
  "search-miss": { from: SearchFrom; q: string; kind: SearchMissKind };
  "search-pick": { from: SearchFrom; position: number };
  // A professor search found no review profile but found instructors teaching
  // recently (`results`); `pick` when one of their courses is opened.
  "instructor-fallback": { results: number };
  "instructor-fallback-pick": { position: number };

  // Phase 1: courses list
  "courses-filter": { filter: string; value: string };
  "courses-page": { page: number };

  // Phase 1: course and professor pages
  // For section "professors", how many listed instructors were matched to a
  // review profile, so identity-matching coverage can be watched over time.
  "course-section-view": { section: CourseSection; matched?: number; unmatched?: number };
  // A course page whose course isn't in the catalog (missing data, a renamed
  // subject, or a bad link). Kept out of api-error so data gaps are their own report.
  "course-missing": { code: string };
  "course-prof-expand": undefined;
  "course-link": { kind: "prereq" | "coreq" | "cross-list" | "related" };
  "compare-add": { type: "course" | "professor"; from: string; count: number };
  "professor-reviews-open": { from: string };

  // Phase 2: planner. `schedule-builder-run` already reports how many
  // schedules were found (`options`), so there's no separate result event.
  "planner-import-open": { source: "paste" | "howdy" };
  "planner-course-add": { from: PlannerAddFrom };
  "planner-empty-action": { action: "search" | "paste" | "howdy" | "electives" };
  "planner-next-step": { to: "build" };

  // Phase 2: fit my schedule
  "fit-results": { count: number; zero: boolean };
  "fit-result-click": { position: number };

  // Phase 2: compare
  "compare-tab": { tab: CompareTab };
  "compare-empty": { tab: CompareTab };
  "compare-remove": { type: "course" | "professor"; from: string; count: number };

  // Phase 2: discover. The result cards there don't link anywhere, so there's
  // no result-click event yet.
  "discover-filter": { page: DiscoverPage; filter: string };

  // Phase 3: accounts and alerts
  "signin-start": { from: string };
  "signin-complete": { method: "email" | "google"; new_user: boolean };
  "notifications-prompt": { result: "granted" | "denied" | "dismissed" | "unsupported" };
  "extension-click": { from: string; browser: "chrome" | "firefox" };

  // Phase 3: health
  "api-error": { endpoint: string; status: number };
  "empty-state": { page: string };

  // Home screen app. Chromium fires `appinstalled`; iOS has no install event,
  // so `app-first-launch` (first open from the home screen on this device)
  // is the signal that works everywhere.
  "app-installed": { platform: AppPlatform };
  "app-first-launch": { platform: AppPlatform };
  "install-guide-open": { from: string };
  // The old address's Home Screen app, redirected to /moved (D-053)
  "old-app-open": { platform: AppPlatform };
  "old-app-reinstall-click": { platform: AppPlatform };
};

export type AppPlatform = "ios" | "android" | "desktop";

export type SearchMissKind = "code" | "crn" | "name" | "text";

/** Coarse platform for install events. iPadOS reports as a Mac with touch. */
export function appPlatform(userAgent: string, platform: string, maxTouchPoints: number): AppPlatform {
  if (/iPhone|iPad|iPod/i.test(userAgent) || (platform === "MacIntel" && maxTouchPoints > 1)) {
    return "ios";
  }
  if (/Android/i.test(userAgent)) return "android";
  return "desktop";
}

/**
 * How a course got onto the planner: picked in the "Add courses" search, or
 * starred in Find electives. The watchlist, requirements and prereq-check
 * components aren't mounted right now; add values here if they come back.
 */
export type PlannerAddFrom = "search" | "find-courses";

export type CompareTab = "courses" | "professors";

export type DiscoverPage = "ucc" | "dept";

export type AnalyticsEvent = keyof AnalyticsEvents;

type EventArgs<E extends AnalyticsEvent> = AnalyticsEvents[E] extends undefined
  ? []
  : [data: AnalyticsEvents[E]];

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
      identify?: (data: Record<string, unknown>) => void;
    };
  }
}

/** Tags this visit's session. Safe to call before the tracker has loaded (no-op). */
export function identify(tags: SessionTags): boolean {
  if (typeof window === "undefined" || !window.umami?.identify) return false;
  try {
    window.umami.identify(tags);
    return true;
  } catch {
    return false;
  }
}

/**
 * Endpoints where a 404 is an expected answer, not a failure. The sections
 * endpoints 404 when the course isn't offered that term (most api-errors used
 * to be these). A missing course on /course/:id is reported by the course
 * page as `course-missing` instead.
 */
const EXPECTED_404_ENDPOINTS = new Set([
  "/sections/:id/course/:id",
  "/sections/:id/course/:id/professors",
  "/sections/:id/course/:id/professors/details",
  "/course/:id",
]);

/**
 * Adding a seat watch returns 422 when the user is at the per-account cap. The
 * button already shows that message, so it is not an error worth reporting.
 */
const SEAT_WATCH_CAP_ENDPOINT = "/users/tracking";

/** Whether a failed response is worth an `api-error` event. */
export function isReportableApiError(endpoint: string, status: number): boolean {
  if (status === 404 && EXPECTED_404_ENDPOINTS.has(endpoint)) return false;
  if (status === 422 && endpoint === SEAT_WATCH_CAP_ENDPOINT) return false;
  return true;
}

/**
 * `fetch` that reports failed responses and network errors as `api-error`
 * (except expected 404s, see isReportableApiError). Behaves exactly like
 * `fetch` otherwise: same return value, same throws.
 */
export async function trackedFetch(
  input: string | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = input.toString();
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      const endpoint = endpointTemplate(url);
      if (isReportableApiError(endpoint, res.status)) {
        track("api-error", { endpoint, status: res.status });
      }
    }
    return res;
  } catch (err) {
    if (!(err instanceof DOMException && err.name === "AbortError")) {
      track("api-error", { endpoint: endpointTemplate(url), status: 0 });
    }
    throw err;
  }
}

/**
 * Events sent before the deferred tracker script has loaded (e.g. sign-in
 * finishing on the OAuth callback page) wait here briefly instead of being
 * dropped. Gives up after ~10s, e.g. when an ad blocker stops the script.
 */
const pending: Array<[string, Record<string, unknown> | undefined]> = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
const FLUSH_INTERVAL_MS = 250;
const FLUSH_ATTEMPTS = 40;

function send(event: string, data?: Record<string, unknown>): void {
  try {
    if (data) window.umami!.track(event, data);
    else window.umami!.track(event);
  } catch {
    // Analytics must never break the page.
  }
}

function flushWhenReady(attempt = 0): void {
  if (window.umami) {
    flushTimer = undefined;
    for (const [event, data] of pending.splice(0)) send(event, data);
    return;
  }
  if (attempt >= FLUSH_ATTEMPTS) {
    flushTimer = undefined;
    pending.length = 0;
    return;
  }
  flushTimer = setTimeout(() => flushWhenReady(attempt + 1), FLUSH_INTERVAL_MS);
}

export function track<E extends AnalyticsEvent>(
  event: E,
  ...args: EventArgs<E>
): void {
  if (typeof window === "undefined") return;
  const raw = args[0] as Record<string, unknown> | undefined;
  const data = raw
    ? Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined && v !== null))
    : undefined;
  if (window.umami) {
    send(event, data);
    return;
  }
  pending.push([event, data]);
  if (flushTimer === undefined) flushWhenReady();
}

/** Shortest query worth reporting; one letter is still typing, not a search. */
export const MIN_SEARCH_LENGTH = 2;
const MAX_MISS_LENGTH = 40;

/**
 * Normalizes a search for reporting: trimmed, lowercased, spaces collapsed,
 * cut to 40 characters. Returns null when it's too short to mean anything.
 */
export function normalizeQuery(q: string): string | null {
  const out = q.trim().toLowerCase().replace(/\s+/g, " ").slice(0, MAX_MISS_LENGTH);
  return out.length >= MIN_SEARCH_LENGTH ? out : null;
}

/**
 * Words that mark a query as a topic or course search rather than a person's
 * name. Only needs the words people actually type next to each other ("bryan
 * kim" is a name, "computer science" isn't); one hit is enough.
 */
const TOPIC_WORDS = new Set([
  // filler
  "an", "and", "the", "of", "for", "in", "to", "with", "on", "ii", "iii",
  // course-search words
  "intro", "introduction", "class", "classes", "course", "courses", "professor", "prof",
  "easy", "easiest", "online", "honors", "lab", "section", "elective", "electives", "core",
  "ucc", "seminar", "principles", "fundamentals", "advanced", "applied", "general",
  "fall", "spring", "summer",
  // subjects
  "science", "sciences", "history", "engineering", "calculus", "calc", "chemistry", "chem",
  "biology", "bio", "physics", "english", "math", "mathematics", "art", "arts", "music",
  "psychology", "psych", "accounting", "computer", "computing", "design", "management",
  "economics", "econ", "writing", "data", "creative", "business", "finance", "marketing",
  "statistics", "stats", "political", "government", "philosophy", "sociology", "anatomy",
  "physiology", "nutrition", "kinesiology", "health", "communication", "communications",
  "language", "literature", "spanish", "french", "german", "chinese", "japanese", "film",
  "theatre", "theater", "dance", "architecture", "agriculture", "animal", "plant", "soil",
  "environmental", "geology", "geography", "ocean", "space", "aerospace", "mechanical",
  "electrical", "civil", "chemical", "industrial", "nuclear", "petroleum", "materials",
  "software", "programming", "algorithms", "systems", "analysis", "theory", "ethics",
  "public", "policy", "international", "studies", "culture", "world", "american",
  "texas", "religion", "law", "medicine", "medical", "veterinary", "nursing", "education",
  "sport", "sports", "fitness", "speech", "visualization",
]);

/**
 * Sorts a search into the `search-miss` kinds, so misses can be grouped by
 * cause. Rules, first match wins:
 * - "crn": exactly 5 digits ("12345").
 * - "code": a subject of 2-5 letters and a 1-3 digit number, in either order
 *   and with or without a space or dash ("acct 327", "acct327", "327 acct",
 *   "acct-327", "csce 3", "cs 121"). A full subject name with a 3-digit
 *   number ("accounting 327") is also "code": the person wants one course by
 *   number, the search just doesn't know the subject name. A longer word with
 *   a 1-2 digit number ("calculus 2") is "text".
 * - "name": has a comma ("hanik, bruce walter"), or is 2-4 alphabetic words
 *   with none in TOPIC_WORDS ("bryan kim", "nana yobo").
 * - "text": anything else ("computer science", "creative arts", "smith").
 */
export function classifyQuery(q: string): SearchMissKind {
  const s = q.trim().toLowerCase().replace(/\s+/g, " ");
  if (/^\d{5}$/.test(s)) return "crn";
  if (
    /^[a-z]{2,5} ?[-_.]? ?\d{1,3}$/.test(s) ||
    /^\d{1,3} ?[-_.]? ?[a-z]{2,5}$/.test(s) ||
    /^[a-z]{6,} ?-? ?\d{3}$/.test(s)
  ) {
    return "code";
  }
  const nameWord = /^[a-z][a-z.'-]*$/;
  if (s.includes(",")) {
    const words = s.split(/[ ,]+/).filter(Boolean);
    if (words.length >= 2 && words.every((w) => nameWord.test(w))) return "name";
    return "text";
  }
  const words = s.split(" ");
  if (
    words.length >= 2 &&
    words.length <= 4 &&
    words.every((w) => nameWord.test(w) && !TOPIC_WORDS.has(w.replace(/[.'-]/g, "")))
  ) {
    return "name";
  }
  return "text";
}

/**
 * An API path with IDs replaced, so errors group by endpoint:
 * "https://api.../course/CSCE221?x=1" → "/course/:id". A segment counts as
 * an ID if it has a digit, base64 padding, or is over 20 characters.
 */
export function endpointTemplate(url: string): string {
  let path: string;
  try {
    path = new URL(url, "http://x").pathname;
  } catch {
    return "unknown";
  }
  const parts = path
    .split("/")
    .filter(Boolean)
    .map((seg) => (/\d|=|%3D/i.test(seg) || seg.length > 20 ? ":id" : seg));
  return `/${parts.join("/")}`;
}

/**
 * Session tags for `umami.identify`. Deliberately no user ID: only coarse
 * flags so reports can be split by signed-in vs anonymous and so on.
 */
export type SessionTags = {
  signed_in: boolean;
  has_plan: boolean;
  theme: "light" | "dark";
  /** Opened as the home screen app (standalone display mode). */
  installed: boolean;
};

/**
 * The page type for a path, for `from` fields: "/course/CSCE221" → "course",
 * "/" → "home". Never includes IDs, so it stays low-cardinality.
 */
export function pageFrom(pathname: string): string {
  const first = pathname.split(/[?#]/)[0].split("/").filter(Boolean)[0];
  return first ?? "home";
}
