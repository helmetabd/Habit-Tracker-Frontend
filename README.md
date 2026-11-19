# Habit Tracker — a habit tracker PWA

A small, installable habit tracker. Everything is stored locally in your
browser (`localStorage`) — no account, no server.

## Features

- **Today** — a daily checklist of whatever habits are scheduled for today.
- **Ledger** — a grid of every habit against the last 28 days, tap any cell
  (past or present) to toggle it. Good for backfilling a day you forgot to log.
- **Stats** — a 7-day completion chart, plus current streak, best streak, and
  30-day completion rate per habit.
- **Scheduling** — habits can run daily or on specific days of the week.
- **Reminders** — optional per-habit time-of-day reminder using browser
  notifications. This only fires while the app/tab is open (browsers don't
  allow silent background wake-ups without a push server) — good enough for
  an app kept open or installed as a PWA.
- **Installable** — has a manifest + service worker, so it can be "Added to
  Home Screen" / installed like a native app, and works offline after first load.

## Run it locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview   # to sanity-check the production build locally
```

The output lands in `dist/` — a static site you can host anywhere.

## Deploy

`dist/` is a fully static site. Drag-and-drop it onto Netlify, or run:

```bash
npx vercel deploy --prod    # or
npx netlify deploy --prod --dir=dist
```

Once deployed over HTTPS, visiting it on your phone and choosing
"Add to Home Screen" installs it as a standalone app.

## Project structure

```
src/
  types.ts                domain types (Habit, CompletionLog)
  lib/
    dates.ts               date-key helpers, weekday scheduling
    streaks.ts              streak + completion-rate math
    storage.ts               localStorage read/write
    notifications.ts          browser Notification helpers
  hooks/
    useHabits.ts              single source of truth: state + persistence + reminders
  components/
    Header.tsx, TodayList.tsx, LedgerGrid.tsx,
    StatsPanel.tsx, HabitForm.tsx, TabBar.tsx
  App.tsx                    ties views together via tabs
```

## Notes / next steps you might want

- Data lives only in this browser. To sync across devices you'd need a
  backend (e.g. Supabase) — the `useHabits` hook is the one place you'd swap
  localStorage calls for API calls.
- Reminders are best-effort (see above). For real background push
  notifications you'd need a service-worker push subscription plus a server.
