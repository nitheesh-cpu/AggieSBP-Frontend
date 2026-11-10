# AggieSB+ (Aggie Schedule Builder Plus)

A course and professor research tool for Texas A&M students: official grade distributions, AI-summarized reviews, seat alerts, and a planner that builds conflict-free schedules ranked by how easy the sections are.

**Live site:** https://aggieschedulebuilderplus.vercel.app

| Repo | Role |
| --- | --- |
| [AggieSBP-Frontend](https://github.com/nitheesh-cpu/AggieSBP-Frontend) (this repo) | Next.js web app |
| [AggieSBP-Backend](https://github.com/nitheesh-cpu/AggieSBP-Backend) | FastAPI backend and data pipelines |
| [AggieSBP-Extension](https://github.com/nitheesh-cpu/AggieSBP-Extension) | Chrome/Firefox extension for A&M's registration site and Howdy |

## Features

- **Course and professor pages.** Grade distributions, review statistics, and AI-written summaries (TL;DR, strengths, common concerns) for each course and professor, plus a reviews page per professor.
- **Compare.** Put up to 4 courses or professors side by side at `/compare`.
- **Discover.** Easiest core curriculum (UCC) courses, GPA boosters (high-GPA courses from any department), department-level browsing, and "Fit my schedule" (`/discover/fit`), which takes the times you are busy and lists classes that still have a section that fits, scored by each section's professor.
- **Seat alerts.** Watch a section and get a web push notification when a seat opens. Installable as a PWA (add to home screen).
- **Schedule builder** (`/planner`):
  - Import taken courses by search, by pasting a transcript-style list, or from Howdy through the extension.
  - Find electives you are eligible for based on prerequisites, with easiness, meeting times, and seat status.
  - Star candidates and generate conflict-free schedules for the term, ranked by professor easiness, days on campus, and gaps.
- **Accounts.** Sign in to keep your planner and alerts across devices. Everything also works signed out, stored on the device.
- Dark and light themes, responsive layout, department and dashboard pages.

## Engineering highlights

- **Schedule generator** (`src/lib/planner/schedule.ts`). Each course becomes one slot per section type (lecture, lab, ...). A branch-and-bound search visits slots with the fewest sections first, tries the easiest sections first, and prunes a branch once its best possible average easiness cannot beat the current top results. Schedules are scored by average easiness minus a penalty per day on campus and for idle time between classes; sections with no instructor history use the course average minus a penalty and are flagged as uncertain. The search is capped (course sets and visited nodes) and reports when it truncated.
- **Prerequisite evaluation** (`src/lib/planner/prereqs.ts`). Evaluates the backend's and/or prerequisite trees against a student's record as of a target term, with minimum grades, concurrent enrollment, and classification. Results are four-valued (`met`, `approval`, `unknown`, `unmet`) so the UI does not claim certainty about things a record cannot show, such as instructor approval or "or equivalent".
- **Local-first sync with merge** (`src/lib/planner/record.ts`, `plan.ts`, `src/hooks/use-academic-record.ts`). Data is saved to `localStorage` first and synced to the account with a debounce. Every course and starred item carries its own `updatedAt`; deletions are tombstones, merged last-write-wins per item (dropped after 180 days). On a 409 from the server, the hook merges the other device's copy and retries.
- **Special topics courses** (`src/lib/planner/topics.ts`). Courses like CSCE 489 are several different classes under one number. Section titles with an `SPTP:` or "Special Topics" prefix are split into separate topics, while honors and campus suffixes stay the same class.
- **PWA and push** (`public/sw.js`, `src/hooks/usePushNotifications.ts`). A service worker shows push notifications and restricts click-through navigation to the College Scheduler terms pages; VAPID-based subscriptions are registered with the backend.
- **SEO at scale** (`src/app/sitemap.xml/route.ts`, `src/lib/sitemap-utils.ts`). A hand-built sitemap index over chunked course and professor sitemaps, backed by cached ID lists, plus per-page `generateMetadata` for course and professor routes.
- **Pure, tested planner core.** The logic in `src/lib/planner/` has no framework imports, so it runs under Node's built-in test runner (9 test files).

## Tech stack

- Next.js 16 (App Router, Turbopack in dev), React 19, TypeScript 5
- Tailwind CSS v4, Radix UI primitives with shadcn-style components, Motion, Recharts, Sonner
- React Hook Form and Zod
- SuperTokens for authentication
- Umami analytics (self-hosted, production host only)
- Deployed on Vercel

## Running locally

Requires Node.js 22.18 or newer (the test script relies on native TypeScript support; developed on Node 24) and a running instance of the [backend API](https://github.com/nitheesh-cpu/AggieSBP-Backend); the app fetches all course, professor, and planner data from it.

```bash
git clone https://github.com/nitheesh-cpu/AggieSBP-Frontend.git
cd AggieSBP-Frontend
npm install
```

Create `.env.local` with these variables (set your own values):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (falls back to `http://localhost:8000`) |
| `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_SITE_URL` | Public site URL, used for sitemaps and metadata |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public VAPID key for web push subscriptions |

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Project layout

```
src/
  app/             Routes: course, professor, compare, planner, alerts,
                   discover (ucc, dept, fit), dashboard, profile, auth,
                   sitemaps, robots
  components/      UI: planner/, home/, dashboard/, discover/, providers/,
                   ui/ (Radix + Tailwind primitives)
  lib/
    api.ts         Backend API client
    planner/       Schedule generator, prerequisites, academic record,
                   degree plan, Howdy import, flowchart, special topics
  hooks/           Record/plan sync, eligibility, push notifications
  contexts/        Comparison state
public/            Service worker, web manifest, icons, images
```

## Testing

```bash
npm test                # node --test over src/**/*.test.ts (native TypeScript)
npx tsc --noEmit        # typecheck
```

Tests cover the schedule generator, prerequisite evaluation, record and plan merging, Howdy parsing, special topics, section time parsing, and the flowchart builder.

`npm run lint` is configured as `next lint`, which Next.js 16 no longer provides; run ESLint directly with `npx eslint`.

## License

MIT. See [LICENSE](LICENSE).
