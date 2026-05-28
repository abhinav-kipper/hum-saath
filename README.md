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

## Where the Supabase swap goes (v2)

All persistence lives in `src/lib/store.ts`. The exported functions are already
async and the row types (`src/types.ts`) mirror future tables (string `id`,
`profile`, `date`, ISO `createdAt`). To migrate:

- Create `profiles` and a `logs` table in Supabase (one row per profile/day).
- Replace the localStorage body of each `store.ts` function with Supabase
  queries — signatures and types stay identical, **no UI changes needed**.

Other `// TODO v2` markers in the code: WhatsApp automation, lesson images,
food/protein logging, PDF export.

## Project map

```
src/
  data/         exercises.ts, lessons.json/.ts, profiles.ts   (content)
  lib/store.ts  the only module that touches persistence
  context/      ProfileContext (active parent + accent color)
  components/   TaskCard, BottomNav, StreakChip, TrendChart, AppLayout
  screens/      Onboarding, Today, ExercisePlayer, Log, Trends, Lessons
  types.ts      domain types (Supabase-shaped)
```
