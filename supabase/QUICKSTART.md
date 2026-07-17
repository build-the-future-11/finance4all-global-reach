# Finance4All Supabase Quickstart

Use this as the shortest safe path for production setup. For full detail, read `supabase/SUPABASE_SETUP.md` and `DEPLOYMENT.md`.

## 1. Configure The Project

Create or select the Supabase project, then set production Auth URLs:

- Site URL: the canonical production URL.
- Redirect URLs: `/auth/callback` and `/reset-password` for production, preview, and local development.
- Google OAuth callback in Google Cloud Console if Google sign-in is enabled.

## 2. Apply Migrations

Run every migration from `001` through `012` in order, or paste
`supabase/FINAL_SETUP.sql` once into a new project's SQL Editor. Then run
`supabase/VERIFY_SETUP.sql`.

Do not open member registration until every verification row returns `ok = true`.

## 3. Deploy Functions

```bash
supabase functions deploy weekly-digest --no-verify-jwt
supabase functions deploy delete-account
```

Set the secrets listed in `supabase/SUPABASE_SETUP.md`, then schedule `weekly-digest` with:

```text
Authorization: Bearer DIGEST_CRON_SECRET
```

## 4. Promote Initial Admins

After trusted operators sign up:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email IN ('<admin-email>', '<backup-admin-email>');
```

Keep at least two admin accounts before public launch.

## 5. Verify Production Behavior

- Sign up, complete onboarding, sign out, and sign back in.
- Publish and save a Finance Debrief article.
- Register for an event.
- Submit and review a research application.
- Export account data.
- Delete a non-admin test account.
- Confirm the sole-admin deletion guard.
- Confirm Admin System shows analytics, client errors, and digest logs after test activity.
- Remove or replace seed content before inviting members.
