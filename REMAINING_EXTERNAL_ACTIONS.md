# Remaining External Actions

Only credential, dashboard, legal, production-content, or live-environment tasks
remain.

## 1. Configure Supabase Project

Command or dashboard:

```bash
supabase link --project-ref <project-ref>
```

Expected result: local CLI is linked to the production Supabase project.

## 2. Apply Database

SQL Editor option:

1. Paste `supabase/FINAL_SETUP.sql`.
2. Run it once.
3. Paste `supabase/VERIFY_SETUP.sql`.
4. Confirm every row returns `ok = true`.

CLI option:

```bash
supabase db push
```

Expected result: all tables, functions, policies, views, and storage bucket
exist in production.

## 3. Set Hosting Variables

Set these in Vercel or the chosen host:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_APP_URL
```

Expected result: production build connects to Supabase and OAuth redirects use
the canonical site URL.

## 4. Configure Supabase Auth

Dashboard: Authentication -> URL Configuration.

Set Site URL:

```text
https://your-production-domain
```

Add redirects:

```text
https://your-production-domain/auth/callback
https://your-production-domain/reset-password
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
```

Expected result: email/OAuth sign-in and password reset return to the app.

## 5. Configure Google OAuth If Used

Dashboard: Authentication -> Providers -> Google.

Expected result: Google sign-in opens Google, returns to `/auth/callback`, and
creates exactly one profile.

## 6. Deploy Edge Functions

```bash
supabase functions deploy weekly-digest --no-verify-jwt
supabase functions deploy delete-account
```

Set secrets:

```bash
supabase secrets set SUPABASE_URL=<url>
supabase secrets set SUPABASE_ANON_KEY=<anon-key>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
supabase secrets set SITE_URL=<production-domain>
supabase secrets set DIGEST_CRON_SECRET=<long-random-secret>
supabase secrets set RESEND_API_KEY=<resend-key>
supabase secrets set DIGEST_FROM_EMAIL=<sender>
```

Expected result: account deletion works for a non-admin test account and weekly
digest dry-run/cron requests are authorized correctly.

## 7. Promote Administrators

After trusted admins create accounts:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email IN ('admin@your-domain', 'backup-admin@your-domain');
```

Expected result: both admins can access `/portal/admin`; no other member has an
elevated role.

## 8. Approve Legal And Content

Required owner actions:

- Approve privacy and terms text.
- Remove seed/demo content from production.
- Publish only verified Finance Debrief articles, opportunities, research
  projects, events, chapters, and lessons.

Expected result: public launch contains no fabricated claims or demo records.

## 9. Live Smoke Test

Run with real production test accounts:

- Visitor can read public pages.
- New member signs up, completes onboarding, signs out, and signs back in.
- Member saves Debrief content and lesson progress persists.
- Member applies/registers where eligible and duplicate submission is rejected.
- Admin publishes/edits content and sees operational logs.
- Non-admin cannot access admin routes or write admin data.

Expected result: all journeys pass before public launch.

