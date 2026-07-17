# Project Memory (Canonical)

**Product names:** Public/codebase brand today = **Finance4All**. Pass branding = **FinanceMeta**. Legal unify = D-001.  
**Repo:** `~/Downloads/finance4all-global-reach-main`  
**Branch:** `cursor/membership-security-supabase-fix`  
**Last updated:** 2026-07-17 (Pass 4)  
**Status:** Engineering Waves 1–3 complete in source; production blocked on owner OA-*

## Mission

Global financial-literacy nonprofit: public institution site + member portal (learn, Debrief, labs, opportunities, chapters/events, resources, network, admin). Not investment advice.

## Users

Visitor · Member · Lead researcher · Chapter leader · Administrator

## Architecture

Vite/React/TS portal + Supabase Auth/RLS/RPC/Edge + Vercel SPA. Trust boundary at RLS/RPC.

## Routes

Public: `/`, auth, privacy, terms. Protected: `/onboarding`, `/portal/*`.  
Nav: Dashboard, Debriefed, Meta Labs, Opportunities, Events & Chapters, Network, Learn, Resources, Saved, Activity, Profile, Admin.

## Database

Migrations **001–014**. FINAL_SETUP / VERIFY_SETUP / VERIFY_RLS_MATRIX.

## AuthZ

Roles member | lead_researcher | admin. Debrief publish, moderation, leaders, competitions = admin. Labs create = lead researcher; Admin Labs = overview only.

## Integrations

Supabase required. Optional Resend, Google OAuth, Debrief AI (unconfigured).

## Env

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL` client. Edge secrets never `VITE_*`. Optional `E2E_EMAIL` / `E2E_PASSWORD` for Playwright auth.

## Working (source)

Auth lifecycle, Debrief editorial, moderation, certificates (+ print), leaders/competitions, map filters, nav, sitemap, Admin labs overview, version history UI, e2e smoke+auth surfaces, RLS matrix docs.

## Broken / owner-blocked (live)

Schema apply OA-1; Auth URLs; Vercel env; Edge secrets; brand D-001; live RLS sampling; live E2E credentials.

## Remaining gaps (honest)

| Gap | Notes |
| --- | --- |
| Live schema + RLS sampling | Owner |
| Authenticated e2e against staging | Needs `E2E_*` |
| Brand unify | D-001 |
| Chapter-leader analytics suite | Thin |
| Event reminders / newsletter archives / collections | Not first-class |
| Youth-safety dedicated module | Partial via moderation/rate limits |
| Certificate PDF binary | Print HTML view only |

## Frozen priorities

1. Owner OA-1…OA-8  
2. ~~Pass 2–4 engineering~~ DONE  
3. Staging E2E + monitoring after live schema

## Exact status

Pass 4 **COMPLETE** for engineering acceptance. Next work is **owner-only** unless new product scope is opened.

## Next task

Owner: apply FINAL_SETUP + VERIFY_SETUP + VERIFY_RLS_MATRIX; Auth/Vercel/Edge; optional `E2E_*`.
