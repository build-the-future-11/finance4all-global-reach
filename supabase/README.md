# Supabase Setup

Use this guide to connect Finance4All to a real Supabase project for production.

## 1. Create Or Select The Project

Create a Supabase project, choose the region closest to your expected members, and store the database password in a secure password manager.

In **Project Settings -> API**, copy:

- `VITE_SUPABASE_URL`: the project URL.
- `VITE_SUPABASE_ANON_KEY`: the anon public JWT.

Never place the `service_role` key in frontend, Vercel, or Vite client variables.

## 2. Run Migrations

Open **SQL Editor** and run the migration files in order. If a file has already been applied, verify its objects and continue with the next file.

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

Run `supabase/verify_migration_status.sql` afterward and resolve any missing object before inviting real users.

## 3. Seed Carefully

`supabase/seed.sql` is useful for development and internal testing. Do not open public registration with unverified seed content, demo opportunities, or placeholder chapter records still visible.

## 4. Configure Auth

In **Authentication -> URL Configuration**:

- Set the production Site URL to the canonical app URL.
- Add local and production redirects for `/auth/callback` and `/reset-password`.
- If Google sign-in is enabled, add Supabase's Google callback URL in Google Cloud Console.

Email sign-up should use production confirmation settings before public launch. Local development can temporarily disable confirmation.

## 5. Deploy Edge Functions

Install and authenticate the Supabase CLI outside this repository, then deploy:

```bash
supabase functions deploy weekly-digest --no-verify-jwt
supabase functions deploy delete-account
```

`weekly-digest` is protected by `DIGEST_CRON_SECRET`, so it intentionally does not rely on user JWT verification. `delete-account` keeps JWT verification enabled and validates the member again inside the function.

Set these function secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`
- `DIGEST_CRON_SECRET`
- `RESEND_API_KEY`
- `DIGEST_FROM_EMAIL`

Configure Supabase Cron or an external scheduler to `POST` the weekly digest endpoint with:

```text
Authorization: Bearer DIGEST_CRON_SECRET
```

## 6. Environment Variables

Frontend hosting needs:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`

Restart local dev or redeploy production after changing any `VITE_*` variable.

## 7. Initial Admin

After the first trusted admin signs up, promote that account with a controlled SQL update:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.org';
```

Then sign out and back in before opening `/portal/admin`.

## 8. Production Checks

Before public launch:

- Confirm every public table has RLS enabled.
- Confirm only trusted accounts have `admin` or `lead_researcher` roles.
- Verify avatar uploads accept only expected image types and member-owned paths.
- Verify account export works from Settings.
- Verify account deletion is blocked for the sole admin and succeeds for a non-admin test account.
- Verify the weekly digest sends only published current-week Finance Debrief items and creates one log row per member per week.
- Verify the Admin System tab shows analytics, client errors, and digest delivery logs after test activity.
