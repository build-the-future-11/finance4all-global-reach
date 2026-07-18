# Finance4All

Finance4All is a student-facing finance learning and participation platform.

Visitors can discover programs, research, opportunities, competitions, and chapters. Members can create an account, complete a profile, apply to research projects, register for events, save opportunities, follow Finance Debrief, and track participation from a personal dashboard.

**Live site:** [https://finance4all-global-reach.vercel.app](https://finance4all-global-reach.vercel.app)

## What members can do

| Area | After signup |
| --- | --- |
| Dashboard | Track applications, registrations, and saved items |
| Finance Debrief | Read educational market summaries with source attribution |
| Meta Labs | Apply to scoped research projects |
| Pathways | Browse and save opportunities, submit studios and essays |
| Education | Complete Catalyst lessons and earn certificates |
| Events & Chapters | Find chapters, RSVP, and view competitions |
| Network | Connect with members and post introductions |

## Quick start (developers)

```bash
npm install
cp .env.example .env
# Fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_APP_URL
npm run dev
```

## Verify

```bash
npm run typecheck
npm test
npm run lint
VITE_SUPABASE_URL=https://ci-placeholder.supabase.co \
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpLXBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.ci-placeholder-signature-for-build-only \
VITE_APP_URL=https://ci-placeholder.vercel.app \
npm run build
npm run release:static
CI=true npm run test:e2e
```

## Database setup

1. Supabase SQL Editor → paste `supabase/FINAL_SETUP.sql` (migrations **001–020**)
2. Run `supabase/VERIFY_SETUP.sql` then `supabase/VERIFY_RLS_MATRIX.sql`
3. Confirm every row `ok = true`
4. Do **not** run `supabase/seed.sql` on production — it inserts development sample content

Operator docs: [DATABASE.md](DATABASE.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [docs/OWNER_ACTIONS.md](docs/OWNER_ACTIONS.md)

## Stack

React, Vite, TypeScript, Tailwind, shadcn/ui, Supabase, TanStack Query, Playwright.
