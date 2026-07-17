# Demo Guide

Local walkthrough of Finance4All / FinanceMeta after `npm install` and a configured `.env`.

## Prerequisites

1. Copy `.env.example` → `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` (e.g. `http://localhost:8080` for local; production builds require `https://…`)
2. Apply `supabase/FINAL_SETUP.sql` (migrations **001–016**) on your Supabase project, then `VERIFY_SETUP.sql` and `VERIFY_RLS_MATRIX.sql` (all `ok`).
3. `npm install` then `npm run dev` (default Vite port from project config).

Without a live schema, public pages still load; authenticated portal data will fail or appear empty.

## Visitor (public)

1. Open `/` — mission, modules, contact.
2. Open `/privacy` and `/terms`.
3. Submit the contact form (honeypot must stay empty).
4. Open `/login` and `/signup`.

## Member (after signup + email confirm if required)

1. Complete onboarding (display name, interests, optional chapter).
2. Dashboard — weekly goals, Search ⌘K, activity.
3. **Learn** — open a lesson; mark progress; issue certificate when curriculum complete; use print view.
4. **Debrief** — read published articles; open article dialog; note educational disclaimer; optional Report.
5. **Labs** — browse projects; apply; save bookmarks.
6. **Opportunities / Studios / Essays** — save interest; submit studio/essay (pending until moderated); Report if needed.
7. **Events & Chapters** — filter map; RSVP; export calendar; view competitions / chapter-leader panel if appointed.
8. **Network** — directory, introduction post, connection request, member profile Report.
9. **Settings** — profile, avatar, digest, export, delete account.

## Admin (after OA-6 promote)

1. Open Admin — Debrief editorial (sources, draft → publish with approved source).
2. Moderate pending studios/essays.
3. Reports tab — triage content reports.
4. Competitions + chapter leaders.
5. Contact inbox; member roles; System analytics / CMS seed (dev only).

## Staging authenticated e2e

```bash
E2E_EMAIL=… E2E_PASSWORD=… CI=true npm run test:e2e
```

Without credentials, auth-surface and smoke tests still run; login journeys **skip**.

## Package for handoff

```bash
npm run package:source
# → dist-packages/finance4all-finished-source.tgz (excludes .env, .vercel, .cursor)
```
