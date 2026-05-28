# Saath — साथ

A calm, warm daily health companion PWA for parents. WhatsApp is the alarm
clock; this is the room they walk into. One task per screen, bilingual
(English + Hindi), big tap targets, forgiving streaks.

- **Papa** — neck/upper-back mobility routine + daily pain tracking.
- **Mummy** — BP routine + breathing, daily BP/walk logging.

## Tech

- Vite + React + TypeScript
- Plain CSS modules + CSS variable design tokens (no UI framework)
- `vite-plugin-pwa` (installable, offline app shell + lessons)
- `lucide-react` icons
- `react-router-dom`
- Data: **localStorage only** for v1, behind one async module
  (`src/lib/store.ts`) so the Supabase swap is a single-file change.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build        # type-check + production build to dist/
npm run preview      # serve the production build locally
npm run icons        # regenerate PWA icons from public/favicon.svg
npm run typecheck    # types only
```

## Paste your content (the only edits you need)

1. **Exercise videos** — open `src/data/exercises.ts` and replace each
   `videoId: 'REPLACE_ME'` with your unlisted YouTube id (the part after
   `watch?v=`). That's it; the player reads everything from this file.
2. **Lessons** — `src/data/lessons.json` holds 14 Hinglish placeholder
   lessons. Replace the copy with doctor-reviewed text (keep the shape).
3. **App icon** — edit `public/favicon.svg`, then run `npm run icons`.

## Deploy to Vercel (git push → auto-deploy)

This is a static SPA build, so Vercel needs zero config beyond SPA routing.

1. Push this repo to GitHub.
2. In Vercel: **New Project → Import** this repo.
3. Framework preset: **Vite** (auto-detected). Defaults are correct:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy. Every `git push` to the connected branch auto-deploys.

A `vercel.json` is included so client-side routes (e.g. `/trends`) resolve to
`index.html` instead of 404ing on refresh.

### Verify the PWA on a phone

Open the deployed URL on the phone → browser menu → **Add to Home Screen**.
Launch from the home screen; it should open full-screen (standalone) and the
already-loaded screens + lessons work offline (videos need network).

## Cloud sync with Supabase (optional)

The app runs **local-only** by default (data in the browser). Add Supabase to
sync across the family's devices and keep a durable backup. Sharing uses a
**household code**: every device enters the same code once, and Supabase RLS
scopes all data to that code — no logins for your parents. The code is the only
secret, so make it long and unguessable.

`src/lib/store.ts` dispatches each operation to Supabase when both env vars are
set **and** a household code is entered; otherwise it uses localStorage. No UI
code changed.

**Activate:**

1. Create a Supabase project.
2. In the SQL editor, run `supabase/migrations/0001_init.sql` (creates `logs` +
   `med_logs` and the household RLS policies).
3. Set env vars locally (`.env`, see `.env.example`) and in Vercel
   (Project → Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Redeploy / restart. The app now shows a one-time **Family setup** screen —
   enter the same household code on each device (yours + both parents').

To switch households, clear site data (a Settings screen to change it is a
future addition).

Other `// TODO v2` markers in the code: reminders (web-push), WhatsApp
automation, lesson images, food/protein logging, PDF export.

## Project map

```
src/
  data/         exercises, lessons, medicines, profiles, affirmations  (content)
  lib/          store (persistence dispatch), supabase, share,
                dailyUpdate, confetti, util
  context/      ProfileContext (active parent + accent color)
  components/   TaskCard, BottomNav, StreakChip, TrendChart,
                CalendarHeatmap, PlantMascot, AppLayout
  screens/      Onboarding, HouseholdSetup, Today, ExercisePlayer,
                Log, Medicines, Trends, Lessons
  types.ts      domain types (Supabase-shaped)
supabase/migrations/  SQL schema + RLS
```
