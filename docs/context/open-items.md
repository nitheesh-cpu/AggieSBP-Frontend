# Frontend open items

Known issues, deferred ideas and unverified things. Each line has the date first recorded and its source (session notes or a code check). Close items by moving them to "Closed" with a date and commit. Do not delete them silently.
Backend and extension items live in those repos' `docs/context/open-items.md`. Manual setup steps (Vercel env, Search Console, Umami) are tracked in the parent repo's `docs/manual-setup.md`.

## In flight

- **After the switch from ISR to force-dynamic (D-044, 2026-11-20):** verified in production on 2026-11-20: `/course/CSCE221` is a `MISS` on first request, then `x-vercel-cache: HIT` with a rising `Age`. Browsers get `Cache-Control: private, no-store`, and only the edge caches. The only ISR writers left are the sitemaps (the `/sitemap.xml` index, the course and professor sitemap chunks, and four `unstable_cache` id lists), all daily, about 10 writes a day. Still open: watch the API load from edge misses, and decide whether `/api/revalidate` (`revalidatePath`) still has a purpose. It doesn't purge the `Vercel-CDN-Cache-Control` edge cache for these pages, so after a data fix they can stay stale for up to a day. (2026-11-20) **Update 2026-11-22:** the edge cache is now 7 days (D-048), so a data fix can stay stale up to a week; purge the CDN cache in Vercel when it matters. Vercel free tier on 2026-11-22: ISR writes 204K/200K (mostly before D-044), CDN requests 950K/1M, Fluid Active CPU 3h7m/4h. If CPU still runs out after D-048, options are self-hosting `next start` on the VM behind Cloudflare, or Vercel Pro.

## Bugs and gaps

- **CI may fail `npm test` on Node 20** [unverified]. `.github/workflows/ci.yml` uses Node 20, but `npm test` runs `.ts` files with Node's native type stripping and a glob, which need a newer Node. Locally it passes on Node 24 (104 tests). Check the latest CI run before changing the version. (code check 2026-11-20)
- **`npm run lint` is broken.** Migrate to an ESLint flat config and bump `eslint-config-next` (15.3.3). There is known lint debt: 6 unused imports in `discover/fit/page.tsx`, and unused imports plus `any` in the course page. See G-001. (M7/M10 2026-11-10)
- **`has_plan` session tag goes stale.** `AnalyticsSessionTags` calls `umami.identify` once per page load, so an import in the middle of a visit leaves `has_plan:false`. The suggested fix is to identify again after an import. (M8 2026-11-10, still one identify call)
- **Discover result cards (UCC/department) do not link anywhere**, so there is no `discover-result-click`. This is a possible UX gap. (M8 2026-11-10, verified: no links in `discover/dept/page.tsx`)
- **Completed-only Howdy imports cannot build schedules.** The builder only counts courses planned for the chosen term plus starred electives. (M8 2026-11-10)
- **Starred topics are matched by exact text.** A star saved with a truncated title does not show as starred on the canonical row. (M7 2026-11-10)
- **Lecture/lab pairing.** The generator picks one section per schedule type but does not know which lab belongs to which lecture. Users are told to double-check in College Scheduler. [unverified whether `section-times.ts` changed this] (M6 2026-11-10)
- **Fit My Schedule with zero results is a dead end.** Offering to loosen the filters was suggested, not built. [unverified] (M8 2026-11-10)
- **Ratings-only easiness can outrank GPA-backed scores.** Ranking them slightly lower was offered; the owner did not decide. (M7 2026-11-10)
- **GPA boosters include major-restricted courses** (BMEN design, VTPP practicum). (M7 2026-11-10)
- **`POST /courses/compare` returned 500 in production.** The new compare page does not use it, but the caller still exists in `src/lib/api.ts`. Fix or delete it together with the backend route. (M4 2026-10-26, caller verified 2026-11-20)
- **Design inconsistencies noted, not fixed:** native `<select>` (professor filters, course term picker) next to shadcn Select on `/courses`; the course description shown twice on the course page; "Challenging" for a 3.27-GPA course (thresholds); hero vs. section left-edge misalignment; an empty band in the `/courses` Filters panel; dead space around the professor avatar; "Counts toward: College Station - ACST" jargon. (M3 2026-11-07)
- **Professor page details:** headline review count vs. stats mismatch (13 vs 11) [unverified whether fixed]. (M3 2026-10-17)

## Cleanup

- **Unused `@qwik.dev/partytown`** dependency and its `postinstall` copy into `public/~partytown`. Nothing in `src` uses it. (M7 2026-11-10, verified 2026-11-20)
- **Seven unimported components:** `mission-section`, `hero-section`, `testimonial-carousel`, `theme-demo`, `comparison-slider`, `value-proposition`, `department-tabs` in `src/components/`. Nobody has decided to delete them. Ask the owner first. These are not the parked planner components (D-021), which must stay. (M4 2026-11-06, verified 2026-11-20)
- **Two Chrome Web Store URLs.** Unify them into `EXTENSIONS` in `home-shared.ts` (G-022). (M4/M8)
- **`NEXT_PUBLIC_VAPID_PRIVATE_KEY` in local `.env` files.** Nothing in `src` reads it (verified 2026-11-20), so it is not bundled. Remove it from frontend env files anyway; the private key belongs to the backend only. (M3/M7)
- **The parent's `docs/degree-planner-plan.md` is stale.** It describes the abandoned degree planner (D-017). Rewrite or archive it in the parent repo. (M6 2026-11-10)
- **The parent's `docs/umami-analytics-plan.md` drifts from the code.** `planner-empty-action` and `planner-next-step` are missing from it. Its Privacy section once described rrweb replays, but replays are off (heatmaps only). Re-check it against `AnalyticsEvents` when adding events. (M8 2026-11-10)

## Not verified on a real device or in a browser

- iPhone notch spacing (safe-area insets) was only reviewed in code. The Sonner toaster, compare/course/departments sticky bars and `ui/sheet|drawer|dialog` were not audited for insets. The manifest has no maskable icon. Whether `start_url` should be `/dashboard` was left to the owner. (M7 2026-11-10)
- The home seat-alerts widget and planner onboarding were not checked at 375px or in dark mode when shipped. (M8 2026-11-10)
- `signin-complete`, the real notification prompt, `app-first-launch` and `install-guide-open` were not exercised in a browser. (M8 2026-11-10)
- The delete-account flow on `/profile` was not clicked through. SuperTokens delete was only tested with mocks. (M10 2026-11-17)
- `/profile` and `/profile/alerts` were restyled in code only during the 11-06 redesign. (M4 2026-11-06)
- The admin instructor-links page and the merges redesign were tested with mock data only. (M11 2026-11-18)
- A real extension Howdy import after the hash-scrub fix (`cb81e68`). (M8 2026-11-10)

## Analytics and SEO follow-ups

- **Umami first-party proxy** (`NEXT_PUBLIC_UMAMI_PROXY=1`) is built but off. Enable it only after confirming that Umami sees real client IPs through it (D-042). (M9 2026-11-16)
- **Leaked rows in Umami:** 2 `#howdy=` pageviews and 14 OAuth callback URLs were recorded before the scrubs (D-040). Deleting them in Umami is not confirmed. (M8/M11)
- **The "Seat alerts sign-up" funnel** in Umami starts at `/alerts`, but most sign-ins come from `/profile/alerts` or the installed app. Rebuild it. [unverified] (M8 2026-11-10)
- **Service-worker events start new Umami sessions**, so compare totals, not per-session funnels. (M10 2026-11-17)
- **Search Console:** 13 mobile URLs "need improvement" on Core Web Vitals; many courses get impressions and no clicks (for example MSEN 325). Nothing beyond the SSR and title work is confirmed. Removing the old sitemap entries in Search Console (D-027) was a manual step for the owner and is not confirmed. (M3/M11)
- **Full subject-name searches** ("accounting 327") returned 0 results in a review. `classifyQuery` now classifies them, but the backend fix is unconfirmed. "Did you mean professor X?" for name searches typed into `/courses` was proposed, not built (`/professors` has the instructor fallback). [unverified] (M9/M10)
- **Vercel bot traffic:** check Observability → Bot Name after `dc26bcc`. Decide on unknown bots, and on a firewall rule if `meta-externalagent` ignores robots.txt. (M8 2026-11-16) 2026-11-24: meta-externalagent gone; Amazonbot and meta-webindexer added to robots (D-028 update). Recheck Bot Name around 2026-11-26.

## Deferred ideas

- **Custom domain** to get off `*.vercel.app` (campus filters flag it). If adopted: `NEXT_PUBLIC_SITE_URL`, the `site-url.ts` fallback, `PRODUCTION_HOSTNAME` in `public/sw.js`, Search Console, backend CORS, `SITE_REVALIDATE_URL`, extension links (D-027, G-042). (M3 2026-11-09)
- **Schedule Builder next steps** from the pivot (D-017): multi-subject and level filters in Find electives, Fit busy blocks in the builder, sending a schedule to College Scheduler through the extension, seat alerts for chosen sections, folding Fit into the builder. [unverified status] (M6 2026-11-10)
- **Infinite "load more"** for recent reviews (the backend supports skip/limit). (M5)

## Closed

- 2026-11-20: Admin merges page fallback for a missing `rmpId` is done (`rmpIdFromProfessorId` in `src/lib/admin-api.ts`). (M9 → M10)
- 2026-11-20: `/_next/image` open proxy (`images.remotePatterns` hostname `**`). `next.config.ts` no longer has an `images` block. (M5)
- 2026-11-20: About 40 `whileInView` opacity-0 entrances site-wide are down to 5, all below the fold. (M3)
