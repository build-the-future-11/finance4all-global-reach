# Owner Actions

Only credential, dashboard, legal, or live-environment tasks. Engineering work is not listed here.

## OA-1 — Apply database on live Supabase

**Project:** `xwlrzgfuhfbckgvcmyoq` (or whichever is canonical)  
**Steps:**

1. SQL Editor → paste `supabase/FINAL_SETUP.sql` → Run (now includes migration **013** Debrief editorial)  
2. Paste `supabase/VERIFY_SETUP.sql` → Run  
3. Confirm every row `ok = true` (including `approved_sources`, version/AI log tables, publish RPCs)

**Unblocks:** FM-DATA-001, FM-AUTH-002, portal runtime, live Finance Debrief publish guards

**Note:** If a prior FINAL_SETUP was already applied without 013, either re-run the full script (idempotent where designed) or run `supabase/migrations/013_finance_debrief_editorial.sql` alone, then VERIFY.

## OA-2 — Auth URL configuration

Dashboard → Authentication → URL Configuration  

Site URL: `https://finance4all-global-reach.vercel.app` (or final domain)  

Redirects:

```
http://localhost:8080/auth/callback
http://localhost:8080/reset-password
https://finance4all-global-reach.vercel.app/auth/callback
https://finance4all-global-reach.vercel.app/reset-password
https://finance4all-global-reach-*.vercel.app/auth/callback
https://finance4all-global-reach-*.vercel.app/reset-password
```

**Unblocks:** FM-AUTH-001

## OA-3 — Confirm hosting env

Vercel → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL`  
Redeploy after changes.

## OA-4 — Google OAuth (if used)

Enable provider; Google Cloud redirect = Supabase callback URL.

## OA-5 — Edge Functions + secrets

```bash
supabase functions deploy weekly-digest --no-verify-jwt
supabase functions deploy delete-account
```

Set: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `DIGEST_CRON_SECRET`, `SITE_URL`, optional `RESEND_API_KEY` / `DIGEST_FROM_EMAIL`.

Schedule cron with `x-digest-cron-secret` header.

## OA-6 — First admin

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL';
```

Then Admin → System → Seed CMS (after 008 present).

## OA-7 — Content & legal

- Remove or replace demo `seed.sql` content before public registration  
- Approve privacy/terms  
- Decide legal public name (Finance4All vs FinanceMeta) → D-001

## OA-8 — Security environment audit

`npm audit --omit=dev --audit-level=high` from approved security environment before launch.
