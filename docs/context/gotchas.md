# Frontend gotchas

Things that look wrong but are intentional, and bugs already fixed that are easy to bring back. Format: `G-NNN`, then Looks like / Actually / If you change it / Where / (Fixed in). Add new entries at the end of their area. Mark stale ones `superseded`; do not delete them. Code comments cite these IDs, so never renumber.
Design and product decisions are in `decisions.md` (`D-NNN`).

## Tooling and environment

### G-001: `npm run lint` does not work
**Looks like:** A normal lint script.
**Actually:** It runs `next lint`, which Next 16 removed. ESLint 9.28 has no flat `eslint.config.*`, and it ignores the legacy `.eslintrc.json`. CI skips lint on purpose (comment in `.github/workflows/ci.yml`). The checks are `npx tsc --noEmit -p .`, `npm test` and `npm run build`. To lint some files: `ESLINT_USE_FLAT_CONFIG=false npx eslint <paths>`.
**If you change it:** Migrating to a flat config is welcome (open item). Expect older lint debt, such as unused imports in `discover/fit/page.tsx` and `any` in the course page.
**Where:** `package.json`, `.eslintrc.json`, `.github/workflows/ci.yml`

### G-002: tsc reports errors under `.next/types`
**Looks like:** Real type errors, for example a validator pointing at a deleted page.
**Actually:** Stale generated route types. They clear on the next `next build`. Filter them out (`grep -v .next/`).
**Where:** `.next/types/` (generated)

### G-003: Planner lib files have no runtime `@/` imports
**Looks like:** Odd `import type` only, `./topics.ts` with an extension, and no shared helpers.
**Actually:** `npm test` runs `node --test` with Node's native TypeScript type stripping. It cannot resolve `@/` aliases, so tested lib files may only import types, or other pure files by relative `./x.ts` path (`tsconfig.json` has `allowImportingTsExtensions: true`). `schedule-data.ts` is the exception: it fetches, imports `@/lib/...`, and has no test.
**If you change it:** One runtime `@/lib/api` import into `record.ts`, `find.ts`, `topics.ts`, `plan.ts`, `section-times.ts`, `schedule.ts` and so on breaks the whole test run. Put fetch code in `schedule-data.ts` or a hook instead.
**Where:** `src/lib/planner/*.ts`, `src/lib/analytics.ts` (also tested this way), `tsconfig.json`

### G-004: `plan.ts` greps as a binary file
**Looks like:** A corrupted file.
**Actually:** A stray control character in a comment. It is harmless. Use `grep -a` on it. Tools may misreport matches.
**Where:** `src/lib/planner/plan.ts`

### G-005: The build logs "Error fetching professor IDs for sitemap: fetch failed"
**Looks like:** A broken build.
**Actually:** It happens when no API is reachable at build time. The build still passes. CI builds against the public production API URL.
**Where:** `src/lib/api.ts` (sitemap ID fetchers), `src/lib/sitemap-utils.ts`

### G-006: Mixed line endings; bulk regex edits over TSX
**Looks like:** Safe to normalize, or to sweep class strings with a regex.
**Actually:** Files are a mix of CRLF and LF (`git ls-files --eol`). Expect "LF will be replaced by CRLF" warnings. A bulk hex-to-token regex pass once corrupted `compare/page.tsx` and `watch-section-button.tsx` (TS1109, "Unexpected token template head").
**If you change it:** Keep each file's line endings. Limit scripted rewrites to single-line quoted class segments, and run `npx tsc --noEmit -p .` right after.
**Where:** whole repo

### G-007: The local `.env` points at the production API; the frontend ships before the backend
**Looks like:** You can test a new backend route locally.
**Actually:** `NEXT_PUBLIC_API_BASE_URL` in the usual local `.env` is the production API, so changes that are not deployed are invisible until you point it at a local API. Vercel deploys the frontend on push to `main`, but the backend only changes after a manual pull and restart on the server. A new frontend often talks to an old backend.
**If you change it:** Validate response shapes and tolerate missing fields (see G-035). For API fields that become nullable, ship the tolerant frontend first (D-012).
**Where:** `.env` (not committed), `src/lib/api.ts`

## Styling and components

### G-008: `text-4xl` is smaller than `text-3xl`
**Looks like:** A normal Tailwind scale.
**Actually:** `globals.css` overrides `--text-xl: 24px`, `--text-2xl: 32px`, `--text-3xl: 48px`. `text-4xl` is still Tailwind's default 36px. New headings use explicit sizes such as `text-[28px] sm:text-[32px] lg:text-[40px]`.
**If you change it:** "Bumping" a heading from 3xl to 4xl makes it smaller.
**Where:** `src/app/globals.css` (`@theme`)

### G-009: Gold text on light backgrounds; the wordmark "+"
**Looks like:** Inconsistent raw hex where a token should be.
**Actually:** Gold `#FFCF3F` fails contrast on the cream canvas. Gold-looking text in light mode is `text-[#500000] dark:text-[#FFCF3F]`, and gold badges are `text-[#5c4400]` on `bg-[#FFCF3F]/25`. The "+" in the nav wordmark must be `text-accent-gold`: `text-accent` is maroon in light mode and disappears on the maroon nav.
**Where:** `src/components/navigation.tsx`, badges across pages, D-003

### G-010: Long arbitrary-value class strings fail silently
**Looks like:** A class string that works.
**Actually:** A missing space once glued `...100%)]lg:bg-[...]` into one invalid class. Both the `sm:` and `lg:` gradients were dropped with no error.
**If you change it:** After editing a long arbitrary class (hero fades, compare table widths), check the computed style at each breakpoint.
**Where:** `src/components/home/home-hero-scroll.tsx`, `src/app/compare/page.tsx`

### G-011: JSX whitespace and flex containers
**Looks like:** Odd `{" "}` and single template strings where plain JSX text would do.
**Actually:** A line-wrapped `{courseData.code} isn&apos;t offered` rendered "CSCE 121isn't". `DialogDescription` is a flex container, so `{n} courses from…` rendered "16courses". Use `{" "}` or one template string.
**Where:** `src/app/course/[id]/course-page-client.tsx`, `src/components/planner/howdy-import-dialog.tsx`

### G-012: Radix Select never gets `""`
**Looks like:** `value={termCode || undefined}` and sentinels like `"__ucc_campus_any__"` are noise.
**Actually:** A controlled Radix Select with `value=""` and no matching item breaks (the Fit term dropdown would not open until another dropdown had opened). Radix also cannot have an item with an empty-string value, so "Any campus" uses a sentinel.
**Where:** `src/app/discover/fit/page.tsx` (`FIT_CAMPUS_SELECT_ANY`), `src/app/discover/ucc/page.tsx` (`CAMPUS_SELECT_ANY`)

### G-013: `Boolean(a || b) && (...)`
**Looks like:** A redundant `Boolean()`.
**Actually:** Without it, `0 || 0` renders a literal `0` in the page.
**Where:** `src/app/compare/page.tsx` (`Boolean(c.lectureHours || c.labHours)`)

### G-014: Planner dialogs set their own background
**Looks like:** `bg-white … dark:bg-card` on `DialogContent` duplicates the base style.
**Actually:** When the planner was built, `bg-background` was not defined in the theme and dialogs rendered see-through. `--color-background` is defined in `globals.css` now, so the override is harmless.
**If you change it:** Check both themes before removing it. Check `globals.css` before you rely on any shadcn token.
**Where:** `src/components/planner/howdy-import-dialog.tsx`, `paste-import-dialog.tsx`

### G-015: The Reveille "Howdy" bubble offsets are measured
**Looks like:** Magic numbers and a negative bottom margin.
**Actually:** `public/pixel-reveille.png` (1024x1024) has large transparent padding. The dog spans about 15-82% x and 22-83% y. The bubble is pinned above her ear, and the negative margin cancels the empty space under her feet.
**If you change it:** Aligning to the image box makes the bubble float away from the dog.
**Where:** `src/app/dashboard/page.tsx` (comment near the Reveille block)

### G-016: The course header difficulty label uses `whitespace-nowrap` and gets smaller at `lg`
**Looks like:** An inconsistent size ramp.
**Actually:** `break-words` split "Challenging" mid-word. At `lg` the 4-column stat grid narrows each box, so the size steps down there.
**Where:** `src/app/course/[id]/course-page-client.tsx`
**Fixed in:** `7c3f5b0`

## Home page and PWA

### G-017: `useExtensionLink()` returns `null` at first
**Looks like:** A flash of nothing; it could be server-rendered with a default.
**Actually:** The server cannot know the browser. A Chrome default flashes "Add to Chrome" for Firefox users. While it is `null`, `ExtensionButton` renders an invisible placeholder of the same size, so the layout does not jump. Firefox UA (`/Firefox|FxiOS/`) goes to AMO, and everything else goes to the Chrome Web Store.
**Where:** `src/components/home/home-shared.ts`, `src/components/home/home-features.tsx` (D-014)

### G-018: The extension button is hidden on touch devices
**Looks like:** A missing CTA on phones.
**Actually:** It is wrapped in `hidden pointer-fine:flex` because extensions only install on desktop browsers. Touch devices get the text "Available for Chrome and Firefox on a computer" instead.
**Where:** `src/components/home/home-hero-scroll.tsx`, `src/components/home/home-features.tsx`

### G-019: The mobile hero fade is sized in px, and content stays at the top
**Looks like:** Hard-coded px stops in the gradient. Moving the content to the bottom would look nicer.
**Actually:** The search suggestions (`max-h-[min(16rem,42vh)]`) would open under the keyboard if the search sat at the bottom, and on phones search is the whole hero. The fade ends just below the search box: base 150/250/420px, `sm:` 300/420/600px, with the canvas again at the bottom 140px. The `lg:` fade is left-to-right.
**Where:** `src/components/home/home-hero-scroll.tsx`

### G-020: The home hero height is capped at 1100px
**Looks like:** `min-h-[min(100svh,1100px)]` is an odd way to write `min-h-svh`.
**Actually:** Umami draws heatmaps in an iframe as tall as the whole page (about 5000px). `min-h-svh` stretched the hero to fill that frame, so the `/` heatmap was useless. Normal screens are shorter than 1100px and are not affected.
**If you change it:** Going back to `min-h-svh` breaks the home page heatmap.
**Where:** `src/components/home/home-hero-scroll.tsx` (section and inner grid)
**Fixed in:** `7a35b2f`

### G-021: The installed app has two launch paths
**Looks like:** Duplicate logic. The manifest has `start_url: "/alerts?source=pwa"`, and the home page also redirects standalone launches to `/dashboard`.
**Actually:** Both are on purpose. iOS versions differ: some open `start_url`, others reopen the page that was saved. Together they cover both.
**If you change it:** Do not remove either without testing an install on a real iPhone. If launch behavior changes, check `appleWebApp` in `layout.tsx` first.
**Where:** `public/manifest.json`, `src/components/home/home-page.tsx` (`display-mode: standalone` effect), `src/app/layout.tsx` (D-043)

### G-022: Two different Chrome Web Store URLs
**Looks like:** One of them is wrong.
**Actually:** Both slugs (`aggiesb+-registration-ass` and `aggie-schedule-builder-pl`) point at the same extension ID and both resolve. They could be unified into `EXTENSIONS` in `home-shared.ts` (open item).
**Where:** `src/components/home/home-shared.ts`, `src/components/planner/howdy-import-dialog.tsx`, `src/components/footer.tsx`, `src/app/dashboard/page.tsx`, `src/app/alerts/page.tsx`

## Planner and Fit My Schedule

### G-023: How the Howdy hash is removed
**Looks like:** A `setTimeout(..., 0)` around `history.replaceState`, plus a second copy of the logic in a `<head>` script.
**Actually:** Two layers. (1) An inline script in `layout.tsx` moves `#howdy=` into `sessionStorage["aggiesbp:planner:howdy-hash"]` before any tracker loads (D-040). (2) The planner reads that key first and falls back to `location.hash`. It clears the URL after Next's own mount and keeps `history.state`. Next writes its own copy of the URL back on mount, so a synchronous clear let the hash come back, and a reload reopened the import. `router.replace` was tried and reverted. The pending import survives the sign-in redirect in `sessionStorage["aggiesbp:planner:howdy-import"]`.
**Where:** `src/app/layout.tsx`, `src/app/planner/page.tsx` (`HOWDY_HASH_KEY`, `HOWDY_PENDING_KEY`)

### G-024: `forceMount` on the planner tabs
**Looks like:** `forceMount` plus `data-[state=inactive]:hidden` is a hack. Normal Radix tabs would unmount.
**Actually:** It keeps the Find electives and Build schedule state (filters, loaded results, generated schedules) alive when you switch tabs. The term is shared between Find and Build.
**If you change it:** Switching tabs resets the user's work.
**Where:** `src/app/planner/page.tsx`

### G-025: Find electives keeps late meeting-time answers
**Looks like:** A missing cancellation on list change (a race).
**Actually:** Results are cached in `sectionCache`, keyed `${term}|DEPT-NUM`, so a late answer is still correct. The list re-renders several times while prerequisite data loads. A version that cancelled on change dropped the times.
**Where:** `src/components/planner/find-courses.tsx` (comment "Results are keyed by term…")

### G-026: Fit: campus is set before the first request; prereq badges wait for data
**Looks like:** Effect ordering that could be tidied.
**Actually:** The campus is derived from the term name (the text after the last " - ") and set while `hasCompletedFitOnceRef` is still false, so the refine effect does not fire a duplicate request. A course gets a "Can take" or "Missing …" badge, and the "hide unmet" filter, only once its prereq data has loaded (`code in prereqInfo || prereqUnknown.includes(code)`). Before that, results briefly all showed "Can take".
**If you change it:** Moving `setSectionCampus` after the flag flips doubles the requests.
**Where:** `src/app/discover/fit/page.tsx`

## Compare, course and search pages

### G-027: The zero-width label column on phones
**Looks like:** `<col className="w-0 sm:w-44">`, a `<th>` with `p-0 sm:p-4` and an `sr-only sm:not-sr-only` label, plus an extra `sm:hidden` row above each data row. It looks broken or redundant.
**Actually:** At 375px a 141px label column left room for one course. On phones each label renders in its own full-width row (`colSpan={cells.length + 1}`, `aria-hidden`) above the values. The real row-header `<th>` stays in the grid at zero width, so value cells do not shift columns and screen readers still get the label. The table is `table-fixed` with an inline `--cols` and a `min-w-[calc(var(--cols)*150px)]` width, so columns stay equal and extra columns scroll inside the table.
**If you change it:** Removing the zero-width `<th>`, or hiding the column (the first attempt), misaligns every row.
**Where:** `src/app/compare/page.tsx` (`ComparisonTable`)

### G-028: Compare course ids are normalized
**Looks like:** Extra normalizing in add, remove and isSelected.
**Actually:** The course page used to store "ACCT 327" (with a space), and `/course/ACCT 327` returned 400. `toCourseId` strips spaces and uppercases, and it rewrites ids saved earlier in localStorage (`aggie-rmp-comparison`). The bug dated back to the first commit.
**Where:** `src/contexts/ComparisonContext.tsx`
**Fixed in:** `d17a3e4`

### G-029: `compare-empty` waits for `hydrated` and lives in `ComparePageContent`
**Looks like:** It could sit in `CourseComparison` or `ProfessorComparison`.
**Actually:** Those remount on every tab switch and would fire again. Without the hydration gate, users with saved selections fire `compare-empty` on the first render. A `useRef(Set)` limits it to once per tab per mount.
**Where:** `src/app/compare/page.tsx`, `src/contexts/ComparisonContext.tsx`, `ProfessorComparisonContext.tsx`

### G-030: Course page professor lists merge three sources
**Looks like:** Overly complex merging in `course-page-client.tsx`.
**Actually:** (1) Professors teaching a course for the first time are fetched for the term and appended ("First time teaching this course"); before that they vanished. (2) Grade-history instructors ("RICHARD J", no id) are enriched with the matched profile's id, name and ratings, so the matched "Jacques Richard" is not hidden. (3) `historyProfessorKeys` must still recognise enriched entries, or "First time teaching" shows wrongly. That broke once during the fix.
**Where:** `src/app/course/[id]/course-page-client.tsx`
**Fixed in:** `d17a3e4`, `f3cf8bb`

### G-031: `course-section-view` scope and timing
**Looks like:** Missing tracking for prerequisites and "Nearby courses", and the professors event fires late.
**Actually:** Only `sections` and `professors` are tracked. The other blocks are visible on load at 1440x900, so they would fire on every visit. The professors event (with `matched`/`unmatched`) is sent only after term details load. Before that it ran on the fallback list with no ids, and every instructor counted as unmatched.
**If you change it:** Moving the tracking earlier, or tracking blocks above the fold, makes the data meaningless.
**Where:** `src/app/course/[id]/course-page-client.tsx`

### G-032: `ExpandableText` measures overflow only while collapsed
**Looks like:** The effect returns early when `expanded`, and the button shows on `overflows || expanded`.
**Actually:** When expanded, the text no longer overflows, so measuring then would hide "Show less". A `ResizeObserver` re-checks on resize.
**Where:** `src/app/course/[id]/course-page-client.tsx`

### G-033: Course-code parsing in the planner
**Looks like:** Inconsistent rules.
**Actually:** `parsePastedCourses` skips lowercase "abcd 123" matches that contain a space on transcript-style (caps) input, so words like "Sec 501" do not match. It still accepts a no-space typed code like "csce221" (the `/\s/.test(m[0])` check). A grade is trusted only when it is the only token after the code or comes right after a number ("4.000 A"), so title words like "ENGINEERS I" are not read as grades. The planner course search inserts the space ("CSCE31" → "CSCE 31") because the API search needs it.
**If you change it:** Removing the exception breaks "CSCE 121, csce221".
**Where:** `src/lib/planner/record.ts`, `src/components/planner/course-search.tsx` (tests in `record.test.ts`)

### G-034: Topic prefix merge needs 20 characters
**Looks like:** An arbitrary `TRUNCATED_MIN = 20`.
**Actually:** Howdy cuts titles at about 30 characters, inconsistently ("…DEV SYS" vs "…DEV SY"). A topic that is a prefix of another is merged only if it is 20 or more characters long. Otherwise "AI" would swallow "AI IN BIOLOGY" (a test asserts this).
**Where:** `src/lib/planner/topics.ts` (D-022)

### G-035: The UCC page parses filter options defensively
**Looks like:** `Array.isArray(data?.campuses) ? data.campuses : []` is paranoid.
**Actually:** The production API without the new route answered `[]`, which crashed the page on `filterOptions.campuses.length`. This also covers future deploy skew (G-007).
**Where:** `src/app/discover/ucc/page.tsx`

### G-036: Department names carry a "CODE - " prefix; RMP labels are free text
**Looks like:** Repeated `name.replace(/^[A-Z]{3,4}\s*-\s*/, "")`.
**Actually:** The departments API returns names like "CSCE - Computer Sci & Engr". Without the strip, pages show the code twice. Professor department chips use only official subject codes (`use-official-subjects.ts`), because RMP labels are free text ("WHISKEY", "BBQCLASS") and must never be shown raw (D-025).
**Where:** `src/app/departments/page.tsx`, `src/app/courses/page.tsx`, `src/hooks/use-official-subjects.ts`

## SEO and sitemaps

### G-037: `generateSitemaps` passes `id` as a Promise
**Looks like:** A needless `Number(await props.id)`.
**Actually:** In Next 16 the id is a `Promise<string>`. The old `id * 25000` gave NaN, and production served empty `/courses/sitemap/0.xml` and `/professors/sitemap/0.xml`.
**Where:** `src/app/courses/sitemap.ts`, `src/app/professors/sitemap.ts`
**Fixed in:** `999a275`

### G-038: The professor canonical keeps a literal "="; dates are formatted in UTC
**Looks like:** `.replace(/%3D/gi, "=")` and `timeZone: "UTC"` are fussy.
**Actually:** Professor ids are base64 and end in "=". The canonical must match the sitemap URL exactly. Server and client render the same dates only with a fixed time zone and locale, otherwise hydration mismatches.
**Where:** `src/lib/seo-metadata.ts` (`professorCanonicalPath`), `src/app/professor/[id]/professor-page-client.tsx`, `reviews/reviews-page-client.tsx`

## Analytics

Event names: `AnalyticsEvents` in `src/lib/analytics.ts`. The "why" for each event: the parent repo's `docs/umami-analytics-plan.md`. Core rules are D-037 to D-042.

### G-039: `useSearchTracking` needs an honest `loading` flag
**Looks like:** Callers pass odd counts and `loading` values.
**Actually:** It fires after 1200 ms without typing, once per distinct query per page view. `loading` must be true while results for the latest query are in flight (and on error), or stale counts get reported. `/courses` passes the full filtered list length (the memo, not the lagging state). The professors count is a floor (the API has no total), but zero and `search-miss` are still correct.
**Where:** `src/lib/analytics-hooks.ts`, callers in `courses`, `professors`, `compare`, planner search

### G-040: `notifications-prompt` lives in the push hook only
**Looks like:** It is missing from the notification buttons.
**Actually:** It fires in `requestPermission` only when `Notification.permission === "default"`, because asking again after an answer shows nothing. A version that tracked it in three components (two of them unmounted) was reverted.
**Where:** `src/hooks/usePushNotifications.ts`

### G-041: Extension links carry UTM params and encoded payloads
**Looks like:** `JSON.parse(decodeURIComponent(raw))` after `params.get` decodes twice.
**Actually:** The extension builds links with the URL API (`withUtm` in the extension repo). The Fit `importSchedule` param is encoded by the extension and re-encoded by `URLSearchParams`, so the double decode is correct. For Howdy links the query goes before the `#howdy=` fragment.
**If you change it:** Do not string-concatenate `?utm_…` onto URLs that already contain `?` or `#`.
**Where:** `src/app/discover/fit/page.tsx`, extension `src/config/constants.ts`

### G-042: `public/sw.js` hardcodes the production host and cannot see the browser opt-out
**Looks like:** It should use `SITE_URL` and respect `umami.disabled`.
**Actually:** A service worker cannot import app modules or read localStorage. It posts `notification-shown/-click/-dismiss` to Umami only on `aggieschedulebuilderplus.vercel.app`, and only when the payload has a course (test pushes are excluded). These three events carry the course and term only, never the notification id. Click tracking runs in parallel with opening the page, so it never delays it.
**If you change it:** On a custom domain, update `PRODUCTION_HOSTNAME` here as well as `site-url.ts`.
**Where:** `public/sw.js`

### G-043: Testing analytics locally
**Looks like:** Tracking is broken on localhost.
**Actually:** The tracker only counts the production host (`data-domains`), and the recorder checks the hostname itself. Stub `window.umami.track` in the page to capture events. `IntersectionObserver` (`useTrackInView`) and count-ups do not run in a hidden browser pane. `redirectToAuth()` does a full page load, which wipes in-memory logs (use sessionStorage).
**Where:** `src/lib/analytics.ts`, `src/components/umami-recorder.tsx`

## Admin

### G-044: Admin requests use plain `fetch`; 409 means a missing migration
**Looks like:** `admin-api.ts` skips the shared `trackedFetch`.
**Actually:** Admin calls must never reach analytics (D-034). `AdminRequestError` carries the HTTP status. A 409 from the instructor-link endpoints means the backend table is missing ("run migration 005"), and the page shows that instead of a generic error.
**Where:** `src/lib/admin-api.ts`, `src/app/admin/instructors/page.tsx`

### G-045: Professor course codes come from RMP reviewers, not the catalog
**Looks like:** every course in a professor's `courses` list has a course page, so each card can link to `/course/<code>`.
**Actually:** the codes are what reviewers typed on RateMyProfessors ("HST226", "TXHISTORY", "207"). Linking them all gave Google about 250 404s (Search Console, 2026-11). The backend's `course_name` comes from a join with the catalog and is null for unknown codes, so the card links only when `course_name` is set and otherwise says the code is not in the catalog. Checked on live data (2026-11-26): 58 of 58 named codes had a page; 11 of 12 unnamed ones 404'd (the exception, PSYC107, resolves through an old subject alias the professor query does not use).
**If you change it:** don't link codes without a catalog match. If the backend ever maps old subject aliases in that join, those links come back on their own.
**Where:** `src/app/professor/[id]/professor-page-client.tsx` (course cards).
