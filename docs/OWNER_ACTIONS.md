# Owner Actions

Only credential, dashboard, legal, or live-environment tasks. Engineering work is not listed here.

## OA-1 — Apply database on live Supabase

**Project:** `xwlrzgfuhfbckgvcmyoq` (or whichever is canonical)  
**Steps:**

1. SQL Editor → paste `supabase/FINAL_SETUP.sql` → Run (migrations **001–020**)  
2. Paste `supabase/VERIFY_SETUP.sql` → Run  
3. Confirm every row `ok = true` (including content_reports, moderation, certificates, leaders, competitions, ownership triggers, SECURITY DEFINER search_path, notification content freeze)  
4. Paste `supabase/VERIFY_RLS_MATRIX.sql` → Run; confirm every row `ok = true`

**Unblocks:** FM-DATA-001, FM-AUTH-002, FM-SEC-001 (policy presence), portal runtime, Debrief, moderation, certificates, competitions, content reports

**Note:** If a prior FINAL_SETUP was applied without 013–020, re-run full script or apply `013`…`020` in order, then VERIFY. **018** pins SECURITY DEFINER `search_path`; **019** force-assigns ownership from `auth.uid()`; **020** freezes notification content updates, sets research/competition ownership, and notifies authors on studio/essay moderation.

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

## OA-9 — Staging E2E credentials (optional)

Create a non-production member account on the live/staging project after OA-1. Set CI or local:

```
E2E_EMAIL=…
E2E_PASSWORD=…
```

Run `CI=true npm run test:e2e` to execute authenticated portal journeys (otherwise those tests skip).

**Unblocks:** FM-BASE-004 live portion
