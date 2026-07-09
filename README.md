# Finance4All Global Reach

Global nonprofit landing site and member portal for finance education, research, and community.

## Quick start

```bash
npm install
cp .env.example .env   # add your Supabase credentials
npm run dev
```

- **Landing page:** http://localhost:8080
- **Member portal:** http://localhost:8080/login

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Run `supabase/seed.sql` for sample content
4. Copy your URL and anon key into `.env`

See [supabase/README.md](supabase/README.md) for full details.

## Portal modules

| Route | Module |
|-------|--------|
| `/portal` | Dashboard |
| `/portal/debriefed` | News feed + digest preferences |
| `/portal/debriefed/explainers` | Beginner finance explainers |
| `/portal/labs` | Research projects + applications |
| `/portal/labs/review` | Application review (lead/admin) |
| `/portal/pathways` | Opportunity board |
| `/portal/pathways/studios` | Project submissions |
| `/portal/pathways/essays` | Essay challenge + upvotes |
| `/portal/events` | Chapters + events |
| `/portal/network` | Member profiles + connections |

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (auth, Postgres, RLS)
- TanStack React Query

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run preview  # preview production build
npm run lint     # eslint
npm test         # vitest
```
