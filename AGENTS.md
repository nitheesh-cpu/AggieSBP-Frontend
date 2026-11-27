# AGENTS.md: AggieSB+ frontend

## What this is

The website for AggieSB+ (Aggie Schedule Builder Plus), an unofficial companion to Texas A&M's Aggie Schedule Builder: grades, professor ratings, compare, seat alerts, Fit My Schedule, and the Schedule Builder (`/planner`).
It is Next.js 16 (App Router) with React 19, Tailwind 4, shadcn/Radix, SuperTokens auth and Umami analytics. It is self-hosted at `aggiesbp.com` on the backend VM behind Cloudflare (D-050); the old Vercel address redirects there. A push to `main` deploys once CI passes: every 5 minutes the VM's autodeploy job runs `~/bin/deploy-aggiesbp-web.sh` (it builds, switches release, purges Cloudflare; `rollback` undoes), and the admin overview's Server panel shows what it did (parent D-024, `tools/deploy/README.md`). So push only what is ready to go live. Steps and layout: the parent repo's `docs/self-host-plan.md`.
It is the `frontend/` submodule of the parent `AggieSBP` repo (branch `master`). It talks to `backend/` (FastAPI, branch `develop`) over HTTP, and to `extension/` (Chrome/Firefox, branch `main`) only through links and URL hand-offs (`/planner#howdy=…`, `/discover/fit?importSchedule=…`).
Next 16 differs from older Next.js versions. When unsure about an API, read `node_modules/next/dist/docs/`.

## Run, test and build

```bash
npm ci                     # postinstall copies Partytown files (unused, see open-items)
npm run dev                # next dev --turbopack on :3000
npx tsc --noEmit -p .      # type check; ignore errors under .next/ (stale generated types)
npm test                   # node --test on src/**/*.test.ts (needs Node 22.6+; 104 tests on Node 24)
npm run build              # production build; logs a harmless sitemap fetch error with no API running
```

- `npm run lint` is broken (`next lint` was removed in Next 16, and there is no flat config). For specific files use `ESLINT_USE_FLAT_CONFIG=false npx eslint <paths>`. See G-001.
- Env vars are in `README.md`. The usual local `.env` points `NEXT_PUBLIC_API_BASE_URL` at the production API. To see backend changes that are not deployed yet, point it at a local API (G-007).
- `INTERNAL_API_KEY` and `REVALIDATE_SECRET` are server-only. Never give them a `NEXT_PUBLIC_` prefix (D-035).
- Only one `next dev` can run per folder. The parent repo's `.claude/launch.json` (gitignored) has a `frontend-dev` entry on port 3100.
- On Windows: run npm and npx through Git Bash (PowerShell blocks `npm.ps1`). Many files are CRLF, so keep each file's line endings.

## Before you change anything

Each rule below protects a deliberate choice. Details are in `docs/context/decisions.md` (D-) and `docs/context/gotchas.md` (G-).

1. **Never derive the site origin from `VERCEL_URL`.** Use `SITE_URL` from `src/lib/site-url.ts`. Preview hosts got about 11,900 sitemap URLs rejected. (D-027)
2. **Never send `X-Frame-Options: DENY`.** Framing is controlled by an enforced CSP `frame-ancestors 'self' <umami host>`. DENY turns the Umami heatmaps black. (D-033)
3. **Course, professor and reviews pages stay server components.** Client-rendered versions caused 116 soft-404s. API 404 means `notFound()`; 5xx or a timeout means "temporarily unavailable", never "Not Found". (D-026). They render per request with CDN caching, not ISR, because the Vercel ISR write quota ran out. Don't add `revalidate` back without a decision record: self-hosting removed that quota, but Cloudflare caching (D-050) now does the job. (D-044)
4. **Do not re-filter `/courses` search results on the client.** A text check dropped "ACCT327"-style matches. (D-031)
5. **Track only with `track()` in `onClick`. Never put `data-umami-event` on a link,** because it forces full page loads. Keep the `pending` queue and `keepalive`. (D-038)
6. **Keep the inline `<head>` scripts in `layout.tsx` before the tracker.** They scrub `#howdy=` grades and OAuth codes from analytics URLs. (D-040, G-023)
7. **`UmamiRecorder` stays a guarded client component** (production host only; skips `/admin` and `/auth`; honours the opt-out). Do not replace it with a raw `<script>`. (D-037, D-034)
8. **Expected 404s are not `api-error`s.** Keep `isReportableApiError` and `course-missing`. (D-041)
9. **Session auth uses header tokens, never cookies** (`tokenTransferMethod: "header"`). The backend's CORS is only safe because of this. (D-036)
10. **No count-up number animations and no `opacity: 0` above the fold.** (D-007)
11. **Dark mode is neutral charcoal, never maroon-tinted.** (D-002)
12. **Planner lib files have no runtime `@/` imports,** or `npm test` breaks. (G-003)
13. **Parked planner components (`requirements`, `watchlist`, `prereq-check`, `flowchart`) are not dead code.** Do not delete them or wire them back in without asking the owner. (D-021)
14. **Easiness is per professor.** Never fall back to the course-wide score, and never make an unknown professor look safe. (D-019, D-020)
15. **Show honest data only.** Show a dash or "No data yet" instead of a made-up 0 or 3.0. No hard-coded demo numbers. (D-012)
16. **The frontend must tolerate the old backend.** The site deploys separately from the backend, so validate response shapes. (G-007, G-035)
17. **Weird-looking layout code is deliberate:** the 1100px hero cap (G-020), the zero-width compare column (G-027), planner `forceMount` (G-024), and the two launch paths of the installed app (G-021).
18. **Admin pages:** Cloudflare Access signs admins in; the browser calls `/api/admin/*` on the site, which checks the Access token and adds the admin key on the server. Never send the admin key to the browser. Requests use plain `fetch` (never `trackedFetch`), and the pages are noindex. (D-034, D-052)

## Design rules (the owner's explicit choices)

A redesign is the most likely way to undo these. Most come straight from the owner's feedback on earlier passes. Details: D-001 to D-016.

- **Lively and Aggie, not gloomy.** Maroon `#500000` and gold `#FFCF3F` form the frame: solid maroon nav, `PageBanner` with the Academic Plaza painting, maroon selected chips and pagination, deep-maroon footer with a gold top border, and the pixel Reveille. The owner rejected a plain graphite redesign as having "no soul". (D-001)
- **Dark mode is neutral charcoal** (`#111113` / `#1b1b1f` / `#26262c`). Maroon is lifted to `#7a1a2b`, and the dark accent is gold. Never tint dark surfaces red. (D-002)
- **Use the tokens** in `globals.css` (`bg-canvas`, `bg-card`, `text-text-heading`, `bg-maroon-band`, `text-accent`, `text-accent-gold`…), not raw hex or one-off `dark:` classes. The documented exceptions are the gold-on-light text colors. (D-003, G-009)
- **Color only where it carries meaning.** Cards are neutral, with no maroon header bands, rainbow department badges, gradients, corner glows or colored icon tiles. Grade colors and the emerald compare "Best" stay. (D-008)
- **Type:** IBM Plex Sans for the UI, Plex Mono for figures and codes (`.code-tag` keycaps). Press Start 2P only for the footer "Gig 'em", the dashboard Reveille bubble and the 404 heading. Weights go up to 600. No uppercase tracked labels, no italics, no `text-[9-12px]`. Watch the `text-4xl` < `text-3xl` trap. (D-004, G-008)
- **No pixel-font "eyebrow" labels in banners.** `PageBanner` has no `eyebrow` prop on purpose. (D-010)
- **No decorative tags on course cards** (difficulty, level and attribute badges were removed as "useless"). (D-009)
- **Copy:** sentence case, plain and specific. No hype, no exclamation marks, no emoji (use lucide icons, `strokeWidth={1.5}`), no claims without a source. Say "College Scheduler" for where the extension shows data, and call the site an "unofficial companion". Aggie touches ("Howdy", "Gig 'em") are rare. (D-005)
- **Motion is calm:** one easing curve `[0.22, 1, 0.36, 1]` and `MotionConfig reducedMotion="user"`. No hover lifts, springs, looping sparkles, rotating placeholders or scroll-jacking. No count-ups, and nothing above the fold that starts invisible. (D-006, D-007)
- **The extension CTA is a prominent gold button,** right under the hero search, on desktop (`pointer-fine`) only. Do not turn it back into a text link. The browser is detected on the client by `useExtensionLink()`. (D-014, G-017, G-018)
- **Home page section order is fixed:** hero (search plus the static seat-alerts widget) → extension → seat alerts → more tools. Keep the order during restyles. (D-015)
- **No extension store screenshots on the site.** Use the HTML mock. (D-016)
- **The dashboard lists every feature** with a code-drawn preview that never shows a real-looking figure. (D-013)
- **The Schedule Builder stays a quick supplemental tool,** not a degree audit. Keep the three tabs. Do not add requirements, a flowchart or "Can I take…?" to the main flow. (D-017)
- **The TL;DR callout is only on the professor page.** The course page keeps the inline style. (D-023)
- **Theme follows the system,** with contrast floors (no faint `/30-/60` text). (D-011)
- **Check at 375px, tablet and desktop, in light and dark, before saying a UI change is done.**

## Conventions

- **Code:** TypeScript, `@/` path alias, shadcn components in `src/components/ui/`. Pages are in `src/app/`. Route-specific client code goes in `*-page-client.tsx` next to a server `page.tsx`. The API client is `src/lib/api.ts` (every call goes through `trackedFetch`). Server reads go through `src/lib/server-api.ts` (never import it from a `"use client"` module).
- **Analytics:** event names and data shapes live in `AnalyticsEvents` in `src/lib/analytics.ts`. The reasoning for each event is in the parent repo's `docs/umami-analytics-plan.md` (`../docs/umami-analytics-plan.md` from a parent checkout); update it when you add events. Events carry low-cardinality data only: no emails, ids, names or free text (D-039). Traffic reviews use the parent's `.claude/skills/umami-traffic-review/`.
- **Tests:** pure logic goes in a lib module with a `*.test.ts` next to it (Node's test runner, no jsdom). Before finishing, run `npx tsc --noEmit -p .` and `npm test`, plus `npm run build` for routing, metadata or config changes. For UI changes, check in a browser (G-043 covers analytics testing).
- **Git:** work on `main` (small changes go straight to `main` when the owner says so; pushing deploys, see above). Commit only when asked, and push only when asked as a separate step. Stage only your own files, because other sessions often have uncommitted work in the tree. Commit messages have a short imperative subject (a conventional prefix like `fix:`, `feat:` or `perf:` is common) and a body explaining why. **No AI attribution:** no `Co-Authored-By: Claude…` trailers, no "Generated with Claude Code" footers, in commits or PRs. After pushing, the parent repo needs a separate commit that bumps only the `frontend` pointer.
- **Reports to the owner** state plainly what was and was not verified, committed or deployed.
- **Cross-repo contracts** (special-topic section titles, `hasGradeData`, nullable ratings, admin endpoints): change the backend shape and the frontend tolerance together, and record it in the parent's `docs/context/`.
- **Secrets:** never in code or docs. This repo is public.

## Keeping context current

- Read this file, and skim `docs/context/`, before any non-trivial change. Search `docs/context/` for the file or area you are touching (`grep -rn "planner/page" docs/context`).
- When you make a non-obvious choice, fix a subtle bug, add a workaround, or reject an approach the user suggested, add or update an entry in `docs/context/decisions.md` or `docs/context/gotchas.md` **in the same commit as the code**.
- If code you want to "clean up" looks odd, check `gotchas.md` first. If it is not there and you are not sure, ask the human instead of changing it.
- When an entry turns out wrong or stale, fix it or mark it `superseded by D-xxx`. Do not delete history silently. Never renumber entries: code comments cite them.
- Close or update `docs/context/open-items.md` entries when you resolve them.
- Record cross-repo changes (API contracts between backend, frontend and extension) in the parent repo's `docs/context/` too.
- Never put secrets, IPs, SSH hosts, passwords, tokens, emails or user data in these docs. The repos are public.
