# Finance4All

Finance4All is a public financial-literacy site and authenticated member portal for learning, Finance Debrief publishing, research applications, opportunities, chapters, events, saved content, notifications, and administration.

## Production Readiness

The frontend, portal workflows, Supabase schema, Edge Function contracts, and operator documentation are designed for production deployment. Production launch still requires the external steps in [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md): real Supabase credentials, migrations, Edge Function deployment, mail sender approval, OAuth URLs, legal review, content review, monitoring, and dependency audit from an approved security environment.

## Main Areas

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/login`, `/signup`, `/reset-password` | Authentication |
| `/portal` | Personalized member dashboard |
| `/portal/debriefed` | Finance Debrief articles, explainers, saved reading, digest preferences |
| `/portal/labs` | Research projects and applications |
| `/portal/pathways` | Opportunities, studios, and essays |
| `/portal/education` | Courses and lesson progress |
| `/portal/events` | Chapters and event registration |
| `/portal/network` | Member directory, introductions, and connection requests |
| `/portal/settings` | Profile, communications, export, password, account deletion |
| `/portal/admin` | Publishing, inbox, member roles, and operational system view |

## Deployment

Use [DEPLOYMENT.md](DEPLOYMENT.md) for the complete production deployment path and [supabase/SUPABASE_SETUP.md](supabase/SUPABASE_SETUP.md) for Supabase-specific setup.

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Local development needs the same browser-safe client variables documented in `.env.example`.

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit
VITE_APP_URL=<canonical-production-url> npm run build
npm run release:static
npm run test:e2e
```

Run `npm audit --omit=dev --audit-level=high` from an approved security environment before public launch.

## Stack

React, Vite, TypeScript, Tailwind, shadcn/ui, Supabase, TanStack Query, and Playwright.
