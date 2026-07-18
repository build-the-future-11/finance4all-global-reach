# Project Memory (Canonical)

**Product names:** Public UI = **Finance4All**. Pass docs = **FinanceMeta**. Legal unify = D-001 (owner).  
**Repo:** `~/Downloads/finance4all-global-reach-main`  
**Branch:** `cursor/membership-security-supabase-fix`  
**Last updated:** 2026-07-17 (Finisher harden)  
**Status:** Source complete through migration **016**; live launch blocked only on owner OA-*

## Mission

Global financial-literacy nonprofit platform: public site + member portal (learn, Debrief, labs, opportunities, chapters/events, network, resources, admin). Not investment advice.

## Exact current status

Engineering finish line: schemas 001–019, portal workflows, Debrief trust model, moderation, certificates, competitions, chapter tools, content reports (RPC-only insert), ownership force-assign, SECURITY DEFINER search_path pins, newsletter archive filters, sanitized outbound URLs, secure source packaging, e2e smoke/auth surfaces, RLS matrix docs.

## Next task

**Owner only:** OA-1…OA-9 (FINAL_SETUP through Edge/Auth/Vercel/`E2E_*`/legal). If an earlier tarball with `.env` was shared, rotate Supabase anon key / review project exposure.

## Working systems (source)

Auth, onboarding, portal modules, Debrief editorial (013), portal completeness (014), content reports + chapter leader snapshot (015), RPC-only report insert harden (016), Admin (publish, moderate, reports, labs, competitions, leaders), certificates + print, map filters, sitemap, validation suite.

## Owner-blocked (live)

Schema apply, Auth URLs, Vercel env, Edge secrets, brand D-001, live RLS sampling, live E2E credentials.

## Remaining limitations (honest)

| Item | Notes |
| --- | --- |
| Live Supabase | Must run FINAL_SETUP 001–019 |
| Event push reminders | Not built (RSVP + calendar export exist) |
| Debrief AI live provider | Adapter unconfigured by design |
| Certificate PDF binary | HTML print view only |
| Brand rename | D-001 |

See `docs/VALIDATION_REPORT.md` and `docs/OWNER_ACTIONS.md`.
