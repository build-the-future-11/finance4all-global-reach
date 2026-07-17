# Supabase Connection Status

Status: code-ready, externally blocked until production Supabase resources are
configured.

## Code Already Implemented

- Supabase client reads only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Production builds reject missing account-service configuration.
- Auth routes support sign-up, login, callback, forgot password, reset password,
  sign-out, and deep-link return.
- Profile creation and onboarding use database-backed idempotent functions.
- Member-owned data is modeled for bookmarks, notifications, lesson progress,
  event registrations, research applications, opportunity interests, digest
  preferences, account export, avatar uploads, and account deletion.
- Admin workflows depend on RLS-backed roles and content publishing rules.
- Edge Function source exists for weekly digest and account deletion.
- Migration `012_operational_integrity.sql` adds operational analytics, client
  error reporting, digest logs, grants, RLS, content write checks, and retention
  support.

## Required Supabase Dashboard Or CLI Work

1. Create or select the production Supabase project.
2. Set hosting variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL`
3. Apply migrations `001` through `012` in order.
4. Run `supabase/VERIFY_SETUP.sql`.
5. Verify RLS on every exposed table and storage bucket.
6. Configure Auth Site URL and redirect URLs for:
   - `/auth/callback`
   - `/reset-password`
7. Configure Google OAuth if enabled.
8. Configure email templates and sender domain.
9. Deploy Edge Functions:
   - `weekly-digest`
   - `delete-account`
10. Set server-only function secrets:
    - `SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `DIGEST_CRON_SECRET`
    - email provider secrets if digest delivery is enabled
11. Create at least two administrator accounts and promote them through a
    controlled SQL operation.
12. Remove seed-only/demo records before opening public registration.

## Connection Acceptance Criteria

- `/signup` creates a real Supabase Auth user.
- The auth trigger or recovery RPC creates exactly one profile.
- New users complete onboarding once and land on the portal dashboard.
- Saved content, lesson progress, registrations, applications, notifications,
  profile edits, avatar upload, and digest preferences persist after sign-out
  and sign-in.
- Non-members cannot access portal data.
- Members cannot read or mutate another member's private records.
- Suspended/deleted accounts cannot retain access.
- Non-admin users cannot write admin content or change roles.
- Admins can publish content and see operational logs.
- Account deletion anonymizes/deletes the expected records and cannot remove the
  sole administrator.

## Current Blocker

The repository cannot prove live Supabase behavior without the production
project URL, anon key, service-role secret, deployed migrations, and configured
Auth redirects. This is an external configuration blocker, not missing frontend
or schema source code.
