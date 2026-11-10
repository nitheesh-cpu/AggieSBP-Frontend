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

Needs Node 22.18+ and the [backend](https://github.com/nitheesh-cpu/AggieSBP-Backend) running.

```bash
git clone https://github.com/nitheesh-cpu/AggieSBP-Frontend.git
cd AggieSBP-Frontend
npm install
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
```

Tests: `npm test` (Node's built-in runner over the planner logic in `src/lib/planner/`).

## Layout

```
src/app/            pages (course, professor, compare, discover, planner, alerts, dashboard)
src/components/     UI
src/lib/planner/    schedule generator, prereq checks, Howdy import, special topics
src/hooks/          planner sync, push notifications
public/             service worker, manifest, icons
```

MIT License
