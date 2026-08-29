# FinanceMeta

FinanceMeta is a student-facing financial education, research, opportunity, and community platform with a Supabase-backed member portal.

Visitors can discover programs, research, opportunities, competitions, and chapters. Members can create an account, complete a profile, learn through Catalyst, follow Finance Debrief, apply to Meta Labs, register for events, save opportunities, opt into the member directory, connect with other members, and track participation from a personal dashboard.

**Current hosted origin:** [https://finance4all-global-reach.vercel.app](https://finance4all-global-reach.vercel.app)

The hosted project slug is legacy infrastructure; the product identity is **FinanceMeta**.

## What members can do

| Area | After signup |
| --- | --- |
| Dashboard | Track activity, progress, applications, registrations, and saved items |
| Finance Debrief | Read educational market summaries and explainers with source attribution |
| Meta Labs | Browse and apply to scoped research projects |
| Pathways | Browse/save opportunities and submit studio projects or essays |
| Learn | Complete Catalyst lessons and earn certificates |
| Events & Chapters | Find chapters, RSVP to events, and view competitions |
| Network | Opt into directory visibility, connect with members, and post introductions |
| Resources | Use guides, standards, and facilitator materials |
| Settings | Manage profile, directory visibility, password, communications, export, and deletion |

## Requirements

- Node.js **22 or newer**
- npm
- Supabase project for authenticated/database-backed flows

## Quick start

```bash
npm ci
cp .env.example .env
# Fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_APP_URL
npm run dev
```

## Repository verification

```bash
npm run audit:ci
npm run lint
npm run typecheck
npm test
npm run build
npm run release:static
npm run test:e2e
```

CI supplies build-only placeholder public variables. Final authenticated production acceptance additionally requires dedicated `E2E_EMAIL` and `E2E_PASSWORD` test credentials.

## Database setup

Preferred production path:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

The release currently contains migrations through `022_directory_visibility.sql`.

For a fresh project using the SQL Editor:

1. Run `supabase/FINAL_SETUP.sql`.
2. Run `supabase/FINAL_SETUP_PATCH.sql`.
3. Run `supabase/VERIFY_SETUP.sql`.
4. Run `supabase/VERIFY_RELEASE_PATCH.sql`.
5. Resolve every row where `ok = false`.

Do **not** run `supabase/seed.sql` on production; it contains development sample content.

## Membership privacy

Account email is not included in the member directory. Ordinary members can discover another member profile only when that profile has opted in through **Open to collaborate**. The database view enforces this rule; it is not only a client-side filter. Administrators retain directory access for moderation/support.

## Deployment

Do not deploy the stale default branch before the hardened release branch is merged. The release runbook and owner-only production actions are maintained in:

- [DEPLOYMENT.md](DEPLOYMENT.md)
- [REMAINING_EXTERNAL_ACTIONS.md](REMAINING_EXTERNAL_ACTIONS.md)
- [DATABASE.md](DATABASE.md)

## Stack

React, Vite, TypeScript, Tailwind, shadcn/ui, Supabase, TanStack Query, Playwright.
