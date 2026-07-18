# Finance4All

Public financial-literacy site and authenticated member portal: learning, Finance Debrief, research labs, opportunities, chapters/events, network, resources, and administration.

**Canonical status:** [docs/PROJECT_MEMORY.md](docs/PROJECT_MEMORY.md)  
**Owner-only launch steps:** [docs/OWNER_ACTIONS.md](docs/OWNER_ACTIONS.md)  
**Validation snapshot:** [docs/VALIDATION_REPORT.md](docs/VALIDATION_REPORT.md)  
**Launch checklist:** [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md)  
**Demo walkthrough:** [DEMO_GUIDE.md](DEMO_GUIDE.md)  
**Honest limitations:** [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)  
**Release checklist:** [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md)

## Quick start

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

## Database

1. Supabase SQL Editor → paste `supabase/FINAL_SETUP.sql` (migrations **001–019**)  
2. Run `supabase/VERIFY_SETUP.sql` then `supabase/VERIFY_RLS_MATRIX.sql`  
3. Confirm every row `ok = true`

Details: [DATABASE.md](DATABASE.md), [DEPLOYMENT.md](DEPLOYMENT.md), [supabase/SUPABASE_SETUP.md](supabase/SUPABASE_SETUP.md)

## Product map

| Area | Path |
| --- | --- |
| Landing | `/` |
| Auth | `/login`, `/signup`, `/forgot-password`, `/reset-password` |
| Dashboard | `/portal` |
| Debriefed | `/portal/debriefed` (collections, newsletter archive, explainers) |
| Meta Labs | `/portal/labs` |
| Opportunities | `/portal/pathways` |
| Learn | `/portal/education` (certificates) |
| Events & Chapters | `/portal/events` (map, leaders, competitions) |
| Network | `/portal/network` |
| Admin | `/portal/admin` (Debrief, moderation, reports, labs overview, …) |

## Packaged source

After a finisher build: `npm run package:source` → `dist-packages/finance4all-finished-source.tgz` (excludes `node_modules`, `dist`, `.git`, `.env*`, `.vercel`, `.cursor`). Never ship a hand-rolled tarball that includes `.env`.

## Stack

React, Vite, TypeScript, Tailwind, shadcn/ui, Supabase, TanStack Query, Playwright.
