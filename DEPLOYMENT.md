# Production Deployment

Finance4All is a Vite application with Supabase Auth, Database, Storage, and Edge Functions. Production deployment is complete only when the frontend, database migrations, Edge Functions, scheduled digest, email sender, auth redirects, and content review are all configured.

## 1. Hosting Environment

Set these client variables in the hosting provider before deploying:

| Name | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Browser-safe anon JWT |
| `VITE_APP_URL` | Yes | Canonical public URL, including `https://` |

Do not expose `SUPABASE_SERVICE_ROLE_KEY`, `sb_secret_...`, provider API keys, cron secrets, or mail credentials in frontend variables.

After changing any `VITE_*` value, rebuild and redeploy. Vite reads these values at build time.

## 2. Supabase Database

Apply migrations in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_google_oauth.sql`
3. `supabase/migrations/003_bookmarks_notifications.sql`
4. `supabase/migrations/004_avatar_storage.sql`
5. `supabase/migrations/005_security_hardening.sql`
6. `supabase/migrations/006_education_progress.sql`
7. `supabase/migrations/007_contact_submissions.sql`
8. `supabase/migrations/008_platform_cms.sql`
9. `supabase/migrations/009_membership_integrity.sql`
10. `supabase/migrations/010_public_claims_content.sql`
11. `supabase/migrations/011_directory_privacy.sql`
12. `supabase/migrations/012_operational_integrity.sql`

Then run `supabase/verify_migration_status.sql`. Do not open registration until the verification query shows the expected objects and RLS policies.

Seed data is for internal review only. Remove or replace unverified seed records before public launch.

## 3. Supabase Auth

In Supabase Authentication URL settings:

- Site URL: the canonical production URL.
- Redirect URLs: production and preview URLs for `/auth/callback` and `/reset-password`, plus local development URLs if needed.
- Google OAuth callback, if enabled: the Supabase project callback URL in Google Cloud Console.

Email confirmation settings should match the production membership policy before invitations are sent.

## 4. Edge Functions

Deploy:

```bash
supabase functions deploy weekly-digest --no-verify-jwt
supabase functions deploy delete-account
```

`weekly-digest` uses a cron secret and must be called only by the scheduler. `delete-account` keeps JWT verification enabled and validates the member inside the function.

Set these function secrets:

| Secret | Used By |
| --- | --- |
| `SUPABASE_URL` | Both |
| `SUPABASE_ANON_KEY` | `delete-account` |
| `SUPABASE_SERVICE_ROLE_KEY` | Both |
| `SITE_URL` | Both |
| `DIGEST_CRON_SECRET` | `weekly-digest` |
| `RESEND_API_KEY` | `weekly-digest` |
| `DIGEST_FROM_EMAIL` | `weekly-digest` |

Schedule the weekly digest as a `POST` with:

```text
Authorization: Bearer DIGEST_CRON_SECRET
```

## 5. Production Verification

Run these checks against the production deployment:

1. Public landing page loads on desktop and mobile without console errors or horizontal overflow.
2. Sign up with email, complete onboarding once, sign out, and sign back in.
3. Google sign-in returns to `/portal` if OAuth is enabled.
4. Member dashboard, Finance Debrief, saved content, courses, chapters, opportunities, research applications, notifications, and settings load from production data.
5. Draft Finance Debrief articles are visible only to admins; published articles are visible to members.
6. Event registration respects status, open/close windows, capacity, duplicate prevention, and preserved state after sign-in.
7. A member can export account data and delete a non-admin test account.
8. Sole-admin account deletion is blocked.
9. Avatar uploads reject unsupported files and store only in the member-owned path.
10. Admin Inbox, Members, content editors, and System tab load and enforce role permissions.
11. Weekly digest sends only published current-week articles and writes one delivery log row per member/week.
12. Privacy, terms, support contact, canonical URL, metadata, and social previews are approved.
13. `npm audit --omit=dev --audit-level=high` passes from an approved security environment.

## 6. Rollback

Keep the previous hosting deployment available until production verification passes. If a migration or Edge Function deploy fails, stop inviting users, restore the previous frontend deployment, and resolve the Supabase issue before retrying.
