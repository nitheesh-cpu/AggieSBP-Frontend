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
  "search-miss": { from: SearchFrom; q: string };
  "search-pick": { from: SearchFrom; position: number };

  // Phase 1: courses list
  "courses-filter": { filter: string; value: string };
  "courses-page": { page: number };

  // Phase 1: course and professor pages
  "course-section-view": { section: CourseSection };
  "course-prof-expand": undefined;
  "course-link": { kind: "prereq" | "coreq" | "cross-list" | "related" };
  "compare-add": { type: "course" | "professor"; from: string; count: number };
  "professor-reviews-open": { from: string };

  // Phase 2: planner. `schedule-builder-run` already reports how many
  // schedules were found (`options`), so there's no separate result event.
  "planner-import-open": { source: "paste" | "howdy" };
  "planner-course-add": { from: PlannerAddFrom };

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
};

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
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

export function track<E extends AnalyticsEvent>(
  event: E,
  ...args: EventArgs<E>
): void {
  if (typeof window === "undefined") return;
  try {
    const data = args[0] as Record<string, unknown> | undefined;
    if (data) {
      const clean = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined && v !== null),
      );
      window.umami?.track(event, clean);
    } else {
      window.umami?.track(event);
    }
  } catch {
    // Analytics must never break the page.
  }
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
 * The page type for a path, for `from` fields: "/course/CSCE221" → "course",
 * "/" → "home". Never includes IDs, so it stays low-cardinality.
 */
export function pageFrom(pathname: string): string {
  const first = pathname.split(/[?#]/)[0].split("/").filter(Boolean)[0];
  return first ?? "home";
}
