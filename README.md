# AggieSB+ (Aggie Schedule Builder Plus)

Grade distributions, professor reviews, seat alerts and a schedule builder for Texas A&M students, all in one place.

**Live:** https://aggieschedulebuilderplus.vercel.app

**Backend:** [AggieSBP-Backend](https://github.com/nitheesh-cpu/AggieSBP-Backend) · **Extension:** [AggieSBP-Extension](https://github.com/nitheesh-cpu/AggieSBP-Extension)

## Features

- **Course and professor pages** with grade distributions, reviews and AI summaries
- **Compare** up to 4 courses or professors side by side
- **Discover** easy core classes, GPA boosters, or classes that fit around your current schedule
- **Seat alerts** with push notifications when a full section opens up
- **Schedule builder** that imports your classes (including from Howdy), shows electives you're eligible for, and builds conflict-free schedules ranked by how easy the professors are
- Works signed out; sign in to sync across devices

## Stack

Next.js 16, React 19, TypeScript, Tailwind v4, Radix UI, SuperTokens, deployed on Vercel.

## Run it locally

Prerequisites: Node 22.18+ (the test script runs TypeScript files directly with Node) and the [backend](https://github.com/nitheesh-cpu/AggieSBP-Backend) running. `package.json` does not declare an `engines` field.

```bash
git clone https://github.com/nitheesh-cpu/AggieSBP-Frontend.git
cd AggieSBP-Frontend
npm ci
npm run dev        # http://localhost:3000
```

### Environment variables

Create `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
```

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | client + server | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | client + server | Public site URL |
| `NEXT_PUBLIC_BASE_URL` | build time | Base URL override (e.g. Vercel previews); defaults to `http://localhost:3000` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | client | Web Push public key for seat alerts |
| `NEXT_PUBLIC_UMAMI_PROXY` | client, optional | Analytics proxy |
| `INTERNAL_API_KEY` | server only | Sent to the backend as `X-Internal-Key` so server-side fetches skip rate limits; must match the backend's value |
| `REVALIDATE_SECRET` | server only | Secret for the cache revalidation endpoint |

Never prefix the two server-only secrets with `NEXT_PUBLIC_`.

### Checks and build

```bash
npm test             # Node's built-in runner, src/**/*.test.ts
npx tsc --noEmit     # type check
npm run build        # production build
```

`npm run lint` does not currently work: it runs `next lint`, which was removed in Next.js 16, and the repo still has a legacy `.eslintrc.json`.

## Layout

```
src/app/            pages (course, professor, compare, discover, planner, alerts, dashboard)
src/components/     UI
src/lib/planner/    schedule generator, prereq checks, Howdy import, special topics
src/hooks/          planner sync, push notifications
public/             service worker, manifest, icons
```

MIT License
