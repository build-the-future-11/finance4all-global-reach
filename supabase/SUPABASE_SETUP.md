# Supabase Production Setup

This file is the operator checklist for bringing Finance4All online against Supabase.

## Credentials

Set these in local `.env` and production hosting:

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Browser-safe anon JWT |
| `VITE_APP_URL` | Yes | Canonical production URL |

Do not expose `service_role` or secret keys to the frontend.

## Database

Run migrations `001` through `012` in order, then run:

```sql
SELECT * FROM verify_migration_status;
```

If your project was partially migrated before, skip only the files whose objects are already present and continue forward. Do not delete production data to re-run an early migration.

## Edge Functions

Deploy:

```bash
supabase functions deploy weekly-digest --no-verify-jwt
supabase functions deploy delete-account
```

Set these Supabase function secrets:

| Secret | Used By |
| --- | --- |
| `SUPABASE_URL` | Both functions |
| `SUPABASE_ANON_KEY` | `delete-account` |
| `SUPABASE_SERVICE_ROLE_KEY` | Both functions |
| `SITE_URL` | Both functions |
| `DIGEST_CRON_SECRET` | `weekly-digest` |
| `RESEND_API_KEY` | `weekly-digest` |
| `DIGEST_FROM_EMAIL` | `weekly-digest` |

Schedule `weekly-digest` with a weekly `POST` request and an `Authorization: Bearer DIGEST_CRON_SECRET` header.

## Auth

Configure:

- Production Site URL.
- Redirect URLs for `/auth/callback` and `/reset-password`.
- Google OAuth credentials and callback URL if Google sign-in is enabled.
- Email confirmation policy appropriate for public launch.

## First Admin

After signup:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.org';
```

Keep at least one admin account active. The account deletion function blocks deletion of the sole admin.

## Verification

Before inviting users:

- Sign up, complete onboarding, sign out, and sign back in.
- Publish one Finance Debrief item, save it as a member, and confirm it appears in export data.
- Register for an event and confirm duplicate registration is blocked.
- Submit a research application and verify only the applicant, project lead, and admins can see the right records.
- Upload and replace an avatar.
- Download account data.
- Delete a non-admin test account.
- Trigger the weekly digest in a test project and confirm one log row per user/week.
- Open `/portal/admin` as an admin and review Inbox, Members, and System.
