# Security Guide

Finance4All (FinanceMeta product line) follows a browser-safe Supabase architecture: only the anon JWT ships to clients; privileged keys stay on Supabase Edge Functions.

## Client environment variables

| Variable | Safe in browser | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Public project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Anon JWT only (`eyJ...`) |
| `VITE_APP_URL` | Yes | Canonical site URL for OAuth |
| `SUPABASE_SERVICE_ROLE_KEY` | **Never** | Edge Functions only |
| `sb_secret_...` | **Never** | Server only |
| `DIGEST_CRON_SECRET` | **Never** | Edge Function cron auth |
| `RESEND_API_KEY` | **Never** | Edge Function email |

Copy `.env.example` to `.env` for local development. Never commit `.env`.

## Authentication

- Email/password and Google OAuth via Supabase Auth.
- Protected routes require session + loaded profile (`ProtectedRoute`).
- Incomplete onboarding redirects to `/onboarding`.
- Login redirect state is sanitized to block open redirects.
- Signup includes honeypot and disposable-email checks.
- Client and server-side rate limits on sensitive auth actions.

## Authorization

- **UI:** `RoleGuard` for `/portal/admin` and `/portal/labs/review`.
- **Database:** RLS on all member tables; admin policies on publish tables.
- **Profile writes:** Members use `update_my_profile` / `complete_profile_onboarding` RPCs — cannot self-escalate role or email.
- **Directory:** Public member discovery uses `member_directory` view without exposing emails.
- **Storage:** Avatar uploads scoped to `avatars/{userId}/...` with MIME/size validation.

## Edge Functions

| Function | Auth |
| --- | --- |
| `weekly-digest` | `x-digest-cron-secret` header + service role |
| `delete-account` | Valid user JWT; blocks sole-admin deletion |

Deploy secrets in Supabase dashboard, not Vercel client env.

## HTTP security headers

`vercel.json` sets CSP, HSTS, `X-Frame-Options`, COOP, and related headers. CSP allows Supabase, Google Fonts, and Substack embeds.

## Production build gate

`vite.config.ts` fails production builds when required `VITE_*` variables are missing or malformed.

## Live verification checklist

1. Run `supabase/VERIFY_SETUP.sql` — all checks `ok`.
2. Confirm anonymous users cannot query private tables.
3. Confirm member A cannot read member B's bookmarks, applications, or progress.
4. Confirm non-admins cannot access Admin routes or operational logs.
5. Run `npm audit --omit=dev --audit-level=high` before launch.

See also `SECURITY_AUDIT.md` for the detailed audit log.
