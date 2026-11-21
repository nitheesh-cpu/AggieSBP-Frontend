# Frontend decision log

Format: `D-NNN`, date, Decision / Why / Rejected / Where / Status. Add new entries at the end of their area. Mark old ones `superseded by D-xxx`; do not delete them.
Dates are when the decision was made (or first recorded). Backend counterparts live in the backend repo's `docs/context/`; cross-repo contracts also go in the parent repo's `docs/context/`.

## Design system and UX rules

### D-001: Maroon and gold are the frame; the site must feel lively and Aggie  (2026-11-06)
**Decision:** Maroon `#500000` and gold `#FFCF3F` carry the frame: solid maroon nav (`bg-maroon-nav`, white links, gold "+" in the wordmark), `PageBanner` on list and tool pages, selected chips/filters/pagination (`bg-maroon-band text-on-maroon`), deep-maroon footer with a gold top border and pixel "Gig 'em". Campus art (Academic Plaza painting) and the pixel Reveille carry the mood.
**Why:** The first "unslop" pass went to plain graphite chrome with tiny accents. Owner: "no soul... stressful dull", "so gloomy... it has to be nice to look at and be lively... without compromising functionality".
**Rejected:** Graphite/neutral chrome; per-department rainbow badge colors; corner glows; gradients; colored icon tiles; inverted `bg-text-heading text-canvas` selected chips.
**Where:** `src/app/globals.css`, `src/components/navigation.tsx`, `src/components/page-banner.tsx`, `src/components/footer.tsx`
**Status:** active

### D-002: Dark mode is neutral charcoal, never maroon-tinted  (2026-11-06)
**Decision:** Dark canvas `#111113`, card `#1b1b1f`, raised `#26262c`. Maroon on dark is lifted to `#7a1a2b` (bands/chips), nav `#5c0f1e`, footer `#2b0a12`. Accent in dark is gold.
**Why:** Owner rejected a maroon-black ramp ("dark mode still looks ass"). Page, cards, nav and banners were all near-identical red-browns, so layers melted together; red-tinted near-black looks dirty; `#500000` on near-black reads as dried blood. White on `#7a1a2b` is about 10:1, gold about 7:1.
**Rejected:** `#170e10` / `#211518` style maroon-black surfaces.
**Where:** `.dark { ... }` block in `src/app/globals.css`
**Status:** active

### D-003: Use the color tokens, not raw hex or one-off `dark:` classes  (2026-11-06)
**Decision:** Tokens in `globals.css` `@theme` and `.dark`: `bg-canvas`, `bg-card`, `bg-raised`, `text-text-heading|body|muted`, `border-border(-strong)`, `bg-maroon-band`, `text-on-maroon`, `text-accent` (maroon light, gold dark), `text-accent-gold` (gold always), `--color-positive|negative|caution`.
**Why:** Before the redesign the shadcn tokens were undefined, so pages hard-coded `#FFCF3F`/`#500000` in about 135 places. Tokens flip with the theme for free.
**Rejected:** Raw hex in components. Exceptions that exist on purpose: gold-on-light text uses `text-[#500000] dark:text-[#FFCF3F]` or `text-[#5c4400]` on `bg-[#FFCF3F]/25` (gold fails contrast on cream). The wordmark "+" must be `text-accent-gold` (`text-accent` is maroon in light and vanishes on the maroon nav).
**Where:** `src/app/globals.css`
**Status:** active

### D-004: Typography  (2026-11-06)
**Decision:** IBM Plex Sans for UI, IBM Plex Mono for figures and codes, Press Start 2P only as a pixel accent (footer "Gig 'em", dashboard Reveille speech bubble, 404 heading). All via `next/font/google` in `src/app/layout.tsx`. Weights cap at 600 (bold maps to 600). No uppercase tracked labels, no italics, no arbitrary `text-[9-12px]` sizes. Course codes and department chips use the mono keycap `.code-tag`.
**Why:** Hierarchy comes from size and color. The body used to be Mono everywhere.
**Rejected:** Press Start 2P for captions, headings or eyebrow labels (owner: out of place, "remove from all").
**Where:** `src/app/layout.tsx`, `src/app/globals.css` (`.code-tag`)
**Status:** active

### D-005: Copy rules for UI text  (2026-11-06)
**Decision:** Sentence case labels and titles ("Courses", "Core curriculum"). No hype words, no exclamation marks, no trailing periods on headings/labels. No emoji: use lucide line icons (`strokeWidth={1.5}`). No unverifiable claims ("Join thousands of Aggies", "students love how effortless", "real-time, multidimensional professor intelligence" were removed because there is no source). Say "College Scheduler" (not "Schedule Builder") when describing where the extension shows data. Describe the site as an "unofficial companion", never the official tool.
**Why:** Owner dislikes generic "AI-made" copy and redundant labels. Aggie touches ("Howdy", "Gig 'em") stay sparing.
**Where:** all pages; home copy in `src/components/home/`
**Status:** active

### D-006: Motion rules  (2026-11-06)
**Decision:** One easing curve `[0.22, 1, 0.36, 1]` (also `--ease-out` in CSS). `MotionConfig reducedMotion="user"` on the home page. No hover lifts (`whileHover y/scale`), springs, looping sparkles, bouncing scroll cues, rotating search placeholders or scroll-jacked heroes. `transition-all` is replaced with explicit property lists.
**Why:** Owner wanted calm; dense animated overlays were also called "hectic" in the planner.
**Where:** `src/components/home/home-page.tsx`, `src/app/globals.css`
**Status:** active

### D-007: No count-up number animations; nothing above the fold starts at opacity 0  (2026-11-07)
**Decision:** `CountUpNumber` / `CountUp` render the final value statically with `tabular-nums`. Hero motion is removed so server HTML is visible before hydration.
**Why:** A GPA briefly showing "0.70" on the way to 3.27 looks wrong on a site whose job is accurate numbers. `initial={{opacity:0}}` on the hero made the `<h1>` invisible on slow phones and hurt LCP.
**Rejected:** Animate-from-0 numbers. Component names and an unused `shouldReduceMotion?` prop are kept so call sites did not change.
**Where:** `src/app/course/[id]/course-page-client.tsx`, `src/app/professor/[id]/professor-page-client.tsx`, `src/app/departments/page.tsx`, `src/components/home/home-data-stats.tsx`
**Status:** active

### D-008: Color only where it carries meaning; cards are neutral  (2026-11-07)
**Decision:** Accent marks primary buttons, the wordmark "+", focus, the top GPA bar, grade A and stat figures. Grade bars and legends keep semantic colors. Compare "Best" highlight stays emerald. No full maroon header bands on course/professor/department cards (they read as "a wall of red"); cards are neutral with an accent rating. Maroon appears on selected chips/filters and the frame (D-001).
**Why:** Owner feedback on a maroon-everywhere pass and on rainbow badges. An 11-06 pass had maroon card header bands; the 11-07 pass removed them (newer wins).
**Where:** `src/app/courses/page.tsx`, `src/app/professors/page.tsx`, `src/app/departments/page.tsx`, `src/app/compare/page.tsx`
**Status:** active

### D-009: No decorative tags or labels on course cards  (2026-11-07)
**Decision:** Difficulty, level and section-attribute badges are removed from `/courses` cards. No `line-clamp-2 min-h-10` on titles (left an empty gap under one-line names). Sidebar tag filters still work.
**Why:** Owner: "remove all of those tags because they are useless".
**Where:** `src/app/courses/page.tsx`
**Status:** active

### D-010: `PageBanner` has no eyebrow prop  (2026-11-07)
**Decision:** The gold pixel-font "eyebrow" ("Course catalog", "Find your prof", "Howdy, Ags") was removed from every banner and the prop deleted so it cannot come back.
**Why:** Owner called it out of place, then "Remove from all".
**Rejected:** Re-adding an eyebrow or any pixel-font caption.
**Where:** `src/components/page-banner.tsx`
**Status:** active

### D-011: Theme follows the system; contrast floors  (2026-10-17)
**Decision:** `defaultTheme="system"` (owner asked "should light mode be default?"; the choice was follow the device). `theme-toggle.tsx` uses `resolvedTheme`, not `theme`. Dark `--color-border` is `rgba(255,255,255,0.09)` (was `#1d1d1d`, invisible on `#0f0f0f`). Faint text was raised (dark `text-white/65` minimum, light `text-text-body/75` minimum, placeholders `/65`).
**Why:** Contrast review of the live site. `theme` is `"system"` while following the device, so toggling did nothing visible.
**Rejected:** Forced dark; `text-white/30..55` and `text-text-body/45..60`.
**Where:** `src/app/layout.tsx` (`ThemeProvider`), `src/components/theme-toggle.tsx`
**Status:** active

### D-012: Honest data. Never show a made-up number  (2026-10-17)
**Decision:** The API returns `null` for missing ratings/GPAs; the UI shows a dash, "No data yet" or "Not offered" and hides unknown stats instead of printing 0 or 3.0. No hardcoded demo numbers on pages. Code-drawn previews (dashboard, home) are pictures, not data and must never show a figure that could be read as real.
**Why:** A live review found the backend filled missing ratings with 3.0 ("/courses shows 3.0 for unreviewed courses"), the professor page showed the overall rating on every per-course card, and homepage cards were hardcoded.
**Rejected:** `else 3.0` / `?? 3` fallbacks.
**Where:** `src/app/courses/page.tsx`, `src/app/professor/[id]/professor-page-client.tsx`, `src/components/dashboard/tool-previews.tsx`
**Status:** active. Rule for any API field that becomes nullable: ship the tolerant frontend first, then the backend.

### D-013: Dashboard lists every site feature, each with a code-drawn preview  (2026-11-06)
**Decision:** `/dashboard` shows every tool (featured row: seat alerts + extension; groups "Find courses" and "Plan your semester") with a mini preview from `components/dashboard/tool-previews.tsx`. New features get an entry. The standalone (PWA) dashboard variant is separate.
**Why:** Owner: "dull, hard to read, nothing pops... some website features are missing".
**Where:** `src/app/dashboard/page.tsx`, `src/components/dashboard/tool-previews.tsx`
**Status:** active

## Home page and extension promotion

### D-014: The extension CTA is a prominent gold button on desktop only  (2026-11-06)
**Decision:** `ExtensionButton` (`bg-accent-gold`, "Add to Chrome · Free") sits right under the hero search and in the `ExtensionFeature` section, wrapped `hidden pointer-fine:flex`; touch devices get "Available for Chrome and Firefox on a computer". Browser is detected client side by `useExtensionLink()` (Firefox UA `/Firefox|FxiOS/` -> AMO; everything else -> Chrome Web Store). It returns `null` until mounted and the button renders an invisible same-size placeholder.
**Why:** After a restyle made it a small text link, owner: "the add extension thing is very hidden and it shouldnt be". Extensions cannot install on phones. SSR-guessing flashes "Add to Chrome" for Firefox users.
**Rejected:** Text-link CTA; SSR default browser.
**Where:** `src/components/home/home-features.tsx`, `src/components/home/home-hero-scroll.tsx`, `src/components/home/home-shared.ts`
**Status:** active

### D-015: Home hero shows a static seat-alerts widget; section order is fixed  (2026-11-10)
**Decision:** The hero right side is a static "Example seat alerts" widget (sample data, "Set up seat alerts" -> `/alerts`, `home-cta {cta:"hero-alerts"}`), shown at all widths. Order: hero -> extension feature -> seat-alerts feature -> more tools -> index. The earlier rotating CSCE 120 professor card is gone.
**Why:** Analytics: 24 of 26 home visitors never searched; seat alerts were the draw during registration. Owner asked for it.
**Rejected:** Rotating professor card (also looked cramped on tablet). Moving mobile hero content to the bottom (search suggestions would open under the keyboard; the fade scrim is sized in px for that reason).
**Where:** `src/components/home/home-hero-scroll.tsx`, `src/components/home/home-page.tsx`
**Status:** active

### D-016: Do not use extension store screenshots on the site  (2026-11-07)
**Decision:** The site uses an HTML mock of the extension panel with real top-3 CSCE 120 professors, not `extension/images/*.png`.
**Why:** Those screenshots have marketing arrows baked in, show an old site version and a critical AI summary of a named professor.
**Where:** `src/components/home/home-features.tsx` (`ExtensionPreview`)
**Status:** active

## Schedule builder (planner)

### D-017: `/planner` is a supplemental schedule tool, not a degree planner  (2026-11-10)
**Decision:** Page title "Schedule Builder", three tabs: "1 · What you've taken", "2 · Find electives", "3 · Build schedule". Flow: import taken classes, find eligible electives (prereqs met, offered, easy with that professor), star favorites, generate conflict-free schedules from fixed classes plus elective picks. No requirements tracker, area cards, flowchart or "Can I take...?" in the main flow.
**Why:** Owner: "we dont need to re invent the degree planner, which students barely fill out already... it should be a supplemental tool that works quickly and easily", "i dont want to make this site convoluted and confusing".
**Rejected:** Degree audit, requirement buckets, flowchart (see D-021). The parent repo's `docs/degree-planner-plan.md` describes the abandoned design and is stale.
**Where:** `src/app/planner/page.tsx`, `src/components/planner/`, `src/lib/planner/`
**Status:** active

### D-018: Planner record is local-first and synced; Howdy imports are untrusted  (2026-11-07)
**Decision:** localStorage first (`aggiesbp:planner:record:v1:anon` or `...:user:<id>`), synced to the backend with `base_rev` and 409 merge. Per-course last-write-wins with tombstones (`deleted`, pruned after 180 days). On sign-in the anon copy merges into the account. The extension hands data over in the URL fragment `/planner#howdy=<base64url JSON>` so grades never reach a server; the page validates strictly (max 200 courses), always shows it for review, and requires sign-in to save.
**Why:** Works signed out; grades are sensitive; anyone can craft such a link.
**Where:** `src/hooks/use-academic-record.ts`, `src/lib/planner/record.ts`, `src/lib/planner/howdy.ts`, `src/components/planner/howdy-import-dialog.tsx`
**Status:** active

### D-019: The schedule generator runs in the browser and never makes an unknown professor look safe  (2026-11-10)
**Decision:** `lib/planner/schedule.ts` is a branch-and-bound over elective course sets and one section per schedule type. Score = average section easiness - 0.75 x days on campus - gapMinutes/120. Unknown instructor or no history = `courseEasiness - UNKNOWN_PENALTY(8)` and flagged ("Instructor not announced" / "No history for this course"). Honors sections excluded unless toggled; College Station only; exam and online/TBA meetings skipped.
**Why:** No backend deploy needed; an unknown professor must not rank as the safe pick.
**Where:** `src/lib/planner/schedule.ts`, `src/lib/planner/schedule-data.ts`
**Status:** active

### D-020: Easiness is shown per professor, not per course  (2026-11-09)
**Decision:** Fit My Schedule and Find electives show per-professor easiness (`getDiscoverCourseProfessors`), order cards by the best professor among FITTING sections, show a range ("63-70 by professor") on the card circle, and label "no grade data" / "few reviews" (`hasGradeData` from the API). If any section's professor is unknown the card shows "66?" + "some unknown"; if none is known, "?" + "no history". Never fall back to the course-wide score once professor rows loaded. One shared scale and explanation lives in `components/easiness.tsx`.
**Why:** Owner: a course-wide score lets you "see a prof under a course and think its easy when one prof is 90 and one is 30". CSCE 482 once ranked 88 from a section that did not fit.
**Where:** `src/app/discover/fit/page.tsx`, `src/components/easiness.tsx`, `src/lib/planner/find.ts`
**Status:** active. Open: ratings-only scores can outrank GPA-backed ones (see open-items).

### D-021: Requirements, watchlist, prereq-check and flowchart are parked, not dead  (2026-11-10)
**Decision:** `components/planner/requirements.tsx`, `watchlist.tsx`, `prereq-check.tsx`, `flowchart.tsx` (+ `lib/planner/flowchart.ts`) are imported by no page. The page passes an empty `noRequirements` set and forces `requirements: []` on pending Howdy imports. The extension's `rulesToRequirements` remains but its panel no longer offers "Send requirements". "Starred" (the watchlist data in `plan.ts`) is still used by Find electives.
**Why:** Owner said "hide"; the agent kept it hidden, not deleted (see D-017).
**Rejected:** Deleting them, or re-wiring them into the UI, without asking the owner.
**Where:** `src/components/planner/`, `src/lib/planner/plan.ts`
**Status:** active

### D-022: Special topics are split by topic everywhere in the planner and Fit  (2026-11-10)
**Decision:** Topic identity is the "SPTP:" prefix on a SECTION's own title, not the course number. `lib/planner/topics.ts` (`topicOf`, `topicKey`, `sameTopic`, `canonicalTopics`). Stars are keyed `"CSCE 489|COMPUTER VISION"`. Honors ("HNR-") and campus ("- GV") titles are not topics.
**Why:** Spring 2027 had about 330 special-topics sections under shared numbers; without the split a course card mixes unrelated classes.
**Contract:** needs the backend fit-sections response to include per-section `title`; without it topics silently do not split.
**Where:** `src/lib/planner/topics.ts`, `src/lib/planner/find.ts`, `src/lib/planner/schedule-data.ts`, `src/app/discover/fit/page.tsx`
**Status:** active

### D-023: The TL;DR callout is only on the professor page  (2026-11-10)
**Decision:** `SummaryTldr` takes `prominent` (default false = original inline paragraph); only `professor-page-client.tsx` passes it. The course page keeps the inline style.
**Why:** Owner explicitly asked for this split.
**Where:** `src/components/summary-insights.tsx`
**Status:** active

## Pages, search and SEO

### D-024: One `/compare` page  (2026-10-26)
**Decision:** Courses and professors compare on `/compare` (tabs via `?tab=`, max 4 via `MAX_ITEMS`, server-side search as you type). `/courses/compare` redirects permanently in `next.config.ts`. Course rating is computed client side (review-count-weighted mean of its professors' ratings, `summarizeCourse`) because the course detail API has no `rating`. Duplicate professor profiles are merged by name on the page (`byName`).
**Why:** The old pair of pages was split and the richer one was unreachable. The backend now also merges duplicates; do not remove the client merge without checking.
**Where:** `src/app/compare/page.tsx`, `next.config.ts`
**Status:** active

### D-025: Professors and courses lists page on the server  (2026-10-17)
**Decision:** `/professors` is a debounced server search, 24 per page, asking for one extra row to detect a next page. Department chips/filters show only official TAMU subject codes (`hooks/use-official-subjects.ts`, names strip the "CODE - " prefix). `/courses` default sort is "Most taken" (`enrollment`).
**Why:** Loading 5,000 rows then filtering showed "of 5000" (the cap, not the total). RMP department labels are free text ("WHISKEY", "BBQCLASS") and must never be shown raw.
**Where:** `src/app/professors/page.tsx`, `src/hooks/use-official-subjects.ts`, `src/app/courses/page.tsx`
**Status:** active

### D-026: Course, professor and reviews pages are server-rendered with ISR  (2026-11-17)
**Decision:** `src/app/{course,professor}/[id]/page.tsx` and `professor/[id]/reviews/page.tsx` are server components: `revalidate = 604800` (7 days since `33b0df3`; was 86400), `dynamicParams = true` (Next 16.2 `next dev` 404ed every id without it), `generateStaticParams() => []`. Data comes from `src/lib/server-api.ts` (plain fetch, `next.revalidate`, 10 s timeout, React `cache()`, header `X-Internal-Key` from server-only `INTERNAL_API_KEY`). API 400/404/410/422 -> real `notFound()`; 5xx/429/timeout -> `error.tsx` "temporarily unavailable" (never "Not Found"). Metadata lives in the pages; canonical for merged professors points at the surviving id.
**Why:** Search Console flagged 116 soft-404s (115 professor pages) because the client-rendered pages showed a loading card to Google.
**Rejected:** `"use client"` at the page level for these routes.
**Where:** `src/app/course/[id]/`, `src/app/professor/[id]/`, `src/lib/server-api.ts`, `src/lib/seo-metadata.ts`
**Status:** active for the SSR part. The caching part (`revalidate`, `dynamicParams`, `generateStaticParams`, `next.revalidate`) is superseded by D-044 (2026-11-20).

### D-027: `SITE_URL` is the only source of the public origin; the sitemap is a hand-written index  (2026-10-19)
**Decision:** `src/lib/site-url.ts` reads optional `NEXT_PUBLIC_SITE_URL`, else `https://aggieschedulebuilderplus.vercel.app`. Never derive it from `VERCEL_URL`. `/sitemap.xml` is a route (`src/app/sitemap.xml/route.ts`) listing `/static/sitemap.xml` plus every `courses/sitemap/{id}.xml` and `professors/sitemap/{id}.xml` chunk. Static pages moved to `app/static/sitemap.ts`. `COURSES_PER_SITEMAP = 50000`, `PROFESSORS_PER_SITEMAP = 25000` (2 URLs per professor). No `lastModified` entries.
**Why:** Search Console rejected 11,878 professor URLs because the sitemap used the per-deployment preview host. `lastModified = now` on every request teaches Google to ignore lastmod; the API has no real update date. Next has no built-in index for `generateSitemaps()`.
**Rejected:** `VERCEL_URL`, `lastModified: new Date()`, a root `app/sitemap.ts` (collides with the route).
**Where:** `src/lib/site-url.ts`, `src/lib/sitemap-utils.ts`, `src/app/sitemap.xml/route.ts`, `src/app/{courses,professors,static}/sitemap.ts`
**Status:** active. If a custom domain is adopted: set `NEXT_PUBLIC_SITE_URL`, update the fallback, Search Console, CORS, `SITE_REVALIDATE_URL` and extension links.

### D-028: robots blocks AI-training and SEO crawlers, keeps search and preview bots  (2026-11-16)
**Decision:** `src/app/robots.ts` `BLOCKED_BOTS` (meta-externalagent, SemrushBot, CCBot, GPTBot, ClaudeBot, Bytespider, Google-Extended, Applebot-Extended) get `disallow: /`. Everyone else may crawl except `/api/` and `/admin/`. `/_next/` is deliberately NOT blocked. Googlebot, Bingbot, Applebot, facebookexternalhit, OAI-SearchBot and PerplexityBot stay allowed. `app/robots.ts` replaced `public/robots.txt`.
**Why:** meta-externalagent alone was over half of CDN requests and sends no visitors. Google needs `/_next/` JS/CSS to render pages.
**Where:** `src/app/robots.ts`
**Status:** active

### D-029: Titles match searches; account pages are noindex  (2026-11-16)
**Decision:** Course titles look like "MATH 152: Engineering Mathematics II – Grades, Professors & Reviews | Texas A&M" (max 80 chars, built in `seo-metadata.ts`, unit tested). Home title is about 60 chars (an 83-char version would be truncated) and the description calls the site an "Unofficial companion to Texas A&M's Aggie Schedule Builder". `/alerts` targets "class seat alerts". `app/profile/layout.tsx` and `app/auth/layout.tsx` set `robots: {index:false}` (not blocked in robots.txt, because Google must crawl them to see the noindex). `/dashboard` stays indexable. The root layout has no `title.template`; each page sets `title: {absolute}`. The reviews page is its own canonical.
**Why:** Search Console showed course queries at position 5-10 with about 0 CTR.
**Where:** `src/lib/seo-metadata.ts`, `src/app/layout.tsx`, `src/app/profile/layout.tsx`, `src/app/auth/layout.tsx`, `src/app/alerts/page.tsx`
**Status:** active

### D-030: PSYC links redirect to PBSI  (2026-11-16)
**Decision:** `next.config.ts` permanently redirects `/course/PSYC###` and `/course/psyc###` to `/course/PBSI###`.
**Why:** The registrar renamed the subject; old links, saved Compare selections and Google results still point at PSYC.
**Where:** `next.config.ts`
**Status:** active. Older PSYC-era grades and reviews are not merged into PBSI courses (backend).

### D-031: `/courses` search results come from the server and are never re-filtered by text  (2026-11-12)
**Decision:** With a search term the page uses the API result as is (`serverSearchMode`). No client `includes()` check.
**Why:** The old client check dropped server matches like "ACCT327" because codes are stored with a space ("ACCT 327"). That was the top search-miss cause (26% of searches missed).
**Where:** `src/app/courses/page.tsx`
**Status:** active

### D-032: UCC seats filter defaults to "Open seats only"  (2026-10-26)
**Decision:** `DEFAULT_SEAT_FILTER = "open"`, matching Fit. Two separate flags: `hasActiveFilters` (anything narrowing results, drives the "loosen filters" hint) and `filtersChanged` (differs from defaults, drives Reset, which resets seats to "open"). Changing term clears campus and section types, keeps seats.
**Why:** Owner request. Merging the flags breaks the empty-state hint or Reset.
**Where:** `src/app/discover/ucc/page.tsx`
**Status:** active

## Security and infra

### D-033: Framing is controlled by CSP `frame-ancestors`, not `X-Frame-Options`  (2026-11-12)
**Decision:** `next.config.ts` sends an enforced `Content-Security-Policy: frame-ancestors 'self' https://stats.nitheeshk.com` and no `X-Frame-Options`. A separate `Content-Security-Policy-Report-Only` carries `script-src` rules.
**Why:** Umami heatmaps draw the live page in an iframe; `X-Frame-Options: DENY` made them black. XFO cannot allowlist an origin, and `frame-ancestors` is ignored inside a Report-Only header.
**Rejected:** Restoring `DENY` (a common hardening reflex); widening `frame-ancestors`.
**Where:** `next.config.ts`
**Status:** active

### D-034: Admin UI keeps the key in `sessionStorage` and stays out of analytics  (2026-11-16)
**Decision:** `/admin/*` pages (overview, merges, instructors, summaries, jobs, cache, seat-alerts) keep the admin key in `sessionStorage["aggiesbp:admin-key"]` only (never localStorage, never rendered). `src/lib/admin-api.ts` uses plain `fetch`, not `trackedFetch`. `app/admin/layout.tsx` sets `noindex`. `/admin` is disallowed in robots and skipped by the Umami recorder. The wide layouts with side-by-side comparison are intentional (avoid misclicks); bulk confirm uses a two-step button.
**Why:** The recorder captures form fields; admin calls must not appear in analytics; the key must not outlive the tab.
**Where:** `src/lib/admin-api.ts`, `src/app/admin/`, `src/components/admin/`, `src/components/umami-recorder.tsx`
**Status:** active

### D-035: Server-only secrets never get a `NEXT_PUBLIC_` prefix  (2026-11-17)
**Decision:** `INTERNAL_API_KEY` (sent as `X-Internal-Key` by `server-api.ts`) and `REVALIDATE_SECRET` (guards `POST /api/revalidate`: timing-safe compare, refuses everything when unset, accepts only `/course/[id]`, `/professor/[id]`, `/professor/[id]/reviews` paths) are server-only. `ADMIN_API_KEY` and Cronitor keys never go in Vercel.
**Why:** `NEXT_PUBLIC_` values are bundled to the browser.
**Where:** `src/lib/server-api.ts`, `src/app/api/revalidate/`
**Status:** active

### D-036: Sessions use the header token transfer, never cookies  (2026-10-30)
**Decision:** `Session.init({ tokenTransferMethod: "header" })` in `src/config/frontend.tsx`.
**Why:** The backend allows `*.vercel.app` origins in CORS and is only safe because auth is header-only. Switching to cookies would make every Vercel-hosted site a credentialed origin. The extension also depends on bearer tokens.
**Where:** `src/config/frontend.tsx`
**Status:** active

## Analytics

Event names and data shapes are in `AnalyticsEvents` in `src/lib/analytics.ts` (source of truth). The "why" doc is `docs/umami-analytics-plan.md` in the parent AggieSBP repo (`../docs/umami-analytics-plan.md` from a parent checkout); traffic reviews use the parent's `.claude/skills/umami-traffic-review/SKILL.md`.

### D-037: Umami replaced Google Analytics and Partytown  (2026-11-10)
**Decision:** Self-hosted Umami at `stats.nitheeshk.com`, tracker `n.js`, `data-domains` = production host so localhost and preview deploys send nothing. The heatmap recorder is injected by `UmamiRecorder`, not a plain script tag.
**Why:** The recorder ignores `data-domains` and the `umami.disabled` opt-out, so a raw tag would record localhost, previews and the owner. Opt-out per browser: `localStorage.setItem('umami.disabled', 1)`; `AnalyticsOptOut` (on `/terms` and `/privacy`) does the same.
**Where:** `src/app/layout.tsx`, `src/components/umami-recorder.tsx`, `src/components/analytics-opt-out.tsx`
**Status:** active. `@qwik.dev/partytown` is still in `package.json` but unused (see open-items).

### D-038: Track with `track()` in `onClick`; never `data-umami-event` on links  (2026-11-10)
**Decision:** All events go through `track()` in `src/lib/analytics.ts`, composed with existing handlers; requests send with `keepalive`. Events sent before `window.umami` exists wait in a `pending` queue (250 ms x 40 attempts, then dropped).
**Why:** With this tracker `data-umami-event` makes it `preventDefault` the click and do a full page load, breaking Next client navigation. Google sign-in finishes on a fresh `/auth/callback/google` load where the deferred `n.js` usually has not loaded yet; without the queue `signin-complete` is silently lost.
**Where:** `src/lib/analytics.ts`
**Status:** active

### D-039: Every event answers a UX question; no personal data  (2026-11-10)
**Decision:** Low-cardinality values only; no emails, IDs, names or free text, except the zero-result search `q`. Events carry course + counts only. `track()` swallows errors so a blocked script cannot break a page. Compare tracking lives in the context add/remove functions, search tracking in `useSearchTracking`, not on individual buttons. Planner events go only on mounted components (not the parked ones, D-021).
**Why:** Privacy promises in `/privacy` and `/terms`. Bounce rate is misleading on tool pages (one pageview, a full schedule build counts as a bounce), so engagement is measured per page.
**Where:** `src/lib/analytics.ts`, `src/lib/analytics-hooks.ts`, `src/contexts/`
**Status:** active

### D-040: Personal data in URLs is scrubbed before any tracker runs  (2026-11-10)
**Decision:** Inline `<head>` scripts in `src/app/layout.tsx` (a) move `#howdy=` to `sessionStorage["aggiesbp:planner:howdy-hash"]` and `history.replaceState` it away, (b) define `window.umamiBeforeSend`, which strips the query/hash from `/auth/callback` URLs and referrers (the tracker also has `data-before-send` and `data-exclude-hash`). The recorder skips `/admin` and `/auth`. `rr-mask` marks the planner course list.
**Why:** A real leak: Umami recorded `/planner#howdy=<courses and grades>` (2 rows) and OAuth one-time codes in callback URLs (14 rows). The scrub must run before `n.js` and the recorder.
**Rejected:** Clearing the hash in a React effect or after the tracker loads.
**Where:** `src/app/layout.tsx`, `src/components/umami-recorder.tsx`, `src/components/planner/record-list.tsx`
**Status:** active

### D-041: Expected errors are not reported as `api-error`  (2026-11-17)
**Decision:** All `fetch` calls in `src/lib/api.ts` go through `trackedFetch`, which reports `api-error {endpoint, status}` (status 0 = network; `AbortError` skipped). `isReportableApiError` drops expected 404s (sections endpoints "not offered this term", `/course/:id`); a missing course sends `course-missing {code}` instead. `search-miss` carries `kind` from `classifyQuery` (crn / code / name / text).
**Why:** About 89% of old api-errors were expected 404s, which hid real failures. Data before 2026-11-17 is not comparable.
**Where:** `src/lib/analytics.ts`, `src/lib/api.ts`, `src/app/course/[id]/course-missing-tracker.tsx`
**Status:** active

### D-042: The first-party Umami proxy exists but is off  (2026-11-16)
**Decision:** `NEXT_PUBLIC_UMAMI_PROXY=1` (build time) loads scripts from `/a` and forwards only five paths (`/n.js`, `/recorder.js`, `/api/n`, `/api/record`, `/api/websites/:id/recorder`) via `next.config.ts` rewrites. Keep `UMAMI_ORIGIN` / `UMAMI_PROXY_PATH` in `analytics.ts` in step with the config.
**Why:** Ad blockers hide visits. Before enabling, confirm Umami still sees real client IPs through the proxy, or visitors merge and geo is wrong.
**Where:** `next.config.ts`, `src/lib/analytics.ts`
**Status:** active (flag off)

## Mobile and PWA

### D-043: Home-screen app support  (2026-11-10)
**Decision:** `viewportFit: "cover"`, per-scheme `themeColor` (`#500000` / `#5c0f1e`), `appleWebApp` (`black-translucent`), safe-area insets on body, nav, footer and comparison widgets. Manifest `start_url` is `/alerts?source=pwa`; the home page also redirects standalone launches to `/dashboard`. Events `app-installed`, `app-first-launch` (once per device, the only signal that covers iOS), `install-guide-open`.
**Why:** Seat alerts are the main reason people install. Notch spacing was only reviewed in code, not on a device.
**Where:** `src/app/layout.tsx`, `public/manifest.json`, `src/app/globals.css`, `src/components/home/home-page.tsx`
**Status:** active. If launch behavior changes, `appleWebApp` is the first suspect.

## Caching

### D-044: Course and professor pages render per request; Vercel's CDN caches the HTML, not ISR  (2026-11-20)
**Decision:** `course/[id]/page.tsx`, `professor/[id]/page.tsx` and `professor/[id]/reviews/page.tsx` use `export const dynamic = "force-dynamic"`. `server-api.ts` fetches with `cache: "no-store"`. `next.config.ts` sends `Vercel-CDN-Cache-Control: max-age=86400, stale-while-revalidate=604800` for `/course/*` and `/professor/*`. Sitemap `unstable_cache` windows went from 3600 s to 86400 s.
**Why:** every page a crawler touched was an ISR write (and so was every data-cache entry), and the Vercel free-tier ISR write quota ran out. The CDN header is read only by Vercel's edge and isn't overwritten by Next's own `Cache-Control` on dynamic routes, so pages are still cached at the edge for a day.
**Rejected:** keeping ISR with a longer `revalidate` (each first visit is still a write); `generateStaticParams` for all ids (thousands of writes per build).
**Where:** the three pages above, `src/lib/server-api.ts`, `src/lib/sitemap-utils.ts`, `next.config.ts`
**Status:** active. Supersedes the caching part of D-026; SSR, `notFound()` and error handling are unchanged. Every edge cache miss now hits the API (SSR requests carry `X-Internal-Key`, so they aren't rate-limited). Don't add `revalidate` or `next: { revalidate }` back to these routes without checking the ISR quota. `/api/revalidate` (`revalidatePath`) no longer has ISR pages to refresh here; see open-items.

### D-045: Titles and descriptions lead with the number and the action  (2026-11-21)
**Decision:** Course titles carry the real average GPA when there is one ("MSEN 325: Properties of Functional Materials – Avg GPA 2.92 | Texas A&M"); `courseTitle` tries the richest tail first and truncates the course name only as a last resort. Course descriptions open with the GPA and then say what to do ("Compare grades across 1 professor and read 6 student reviews."). Professor titles carry rating and review count ("Doug Klein – Texas A&M Professor: 1.8/5, 31 Reviews & Grades"), falling back to the keyword form when there are no reviews. Home title is "Aggie Schedule Builder Plus: TAMU Professor Grades & Ratings" (60 chars) and the home page now sets a canonical, OpenGraph and a `WebSite` JSON-LD with the alternate names "AggieSB+" and "AggieSB Plus". `/dashboard` got its own layout with a title (it is a client page and showed a stale, image-derived title in Google). Hub pages (courses, professors, departments, core curriculum, compare, about) dropped the generic "- Aggie Schedule Builder Plus" suffix for keyword titles.
**Why:** Search Console (2026-11-16): 35.8K impressions at 1.6% CTR; course codes ranked about position 7 with near-zero clicks, and "official Schedule Builder" queries had 17,950 impressions at 0.1%. Titles had the keywords but nothing that gave a reason to click. Numbers are only shown when the API has them (D-012).
**Rejected:** putting "RateMyProfessors" in titles (trademark, and the page is not that site); `SearchAction` JSON-LD (the site search is not a URL query Google can call); an OG image (does nothing for Google ranking).
**Where:** `src/lib/seo-metadata.ts` (+ test), `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/dashboard/layout.tsx`, the `layout.tsx` of courses, professors, departments, discover/ucc, discover/dept, compare, about
**Status:** active, unmeasured. Compare Search Console CTR for course and professor pages about 2 to 4 weeks after deploy. The CDN keeps old HTML up to a day (D-044), and Google re-snippets over days to weeks.
