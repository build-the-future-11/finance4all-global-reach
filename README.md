# Finance4All Global Reach

> **Canonical FinanceMeta/Finance4All portal source:** `build-the-future-11/finance4all-global-reach`  
> `build-the-future-11/FinanceMeta-Landing` and `build-the-future-11/FinanceMeta-Global` are separate sibling/legacy surfaces; do not use them as the portal deployment source unless a task explicitly targets those repositories.

Global nonprofit landing site and **Supabase-powered member portal**.

**Live on Vercel:** set env vars (see [DEPLOYMENT.md](DEPLOYMENT.md)) then deploy.

## Portal modules

| Route | Feature |
|-------|---------|
| `/portal` | Dashboard |
| `/portal/debriefed` | News + digest prefs |
| `/portal/labs` | Research projects + apply |
| `/portal/pathways` | Opportunities, studios, essays |
| `/portal/events` | Chapters + events |
| `/portal/network` | Profiles + connections |
| `/portal/settings` | Profile settings |

## Vercel deploy (required env vars)

```
VITE_SUPABASE_URL=https://pnemeegkwyaicsbnbnmg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
VITE_AUTH_REDIRECT_ORIGIN=https://finance4all-global-reach.vercel.app
```

Add redirect URL in Supabase: `https://YOUR-APP.vercel.app/auth/callback`

Full guide: **[DEPLOYMENT.md](DEPLOYMENT.md)**

## Local dev

```bash
npm install
cp .env.example .env   # add Supabase keys
npm run dev
```

## Stack

React · Vite · Tailwind · shadcn/ui · Supabase · TanStack Query
