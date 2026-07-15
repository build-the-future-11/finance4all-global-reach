# Security Audit

Status: source-level security baseline with external production gates.

## Implemented Controls

- Protected routes require authentication before portal access.
- Profile creation and onboarding are idempotent database-backed flows.
- Client-side profile updates cannot mutate role, email, profile ID, or
  lifecycle fields.
- RLS protects member-owned bookmarks, notifications, preferences, lesson
  progress, applications, registrations, and profile-sensitive fields.
- Draft content remains admin-only; published content is member-visible.
- Research application and event registration rules enforce ownership,
  duplicate prevention, deadlines, capacity, and status.
- Admin write paths require admin role checks in database policy, not only UI.
- Avatar uploads validate file signature and size before storage upload and use
  ownership-constrained paths.
- Account deletion is handled by a JWT-protected Edge Function and blocks
  deletion of the sole administrator.
- Weekly digest delivery uses server-only secrets and deduplicated send logs.
- Product analytics and client error reporting use allowlisted event names,
  bounded properties, and sanitization.
- Production headers, CSP, HSTS, frame protections, and metadata are configured.
- User-facing errors avoid leaking Supabase, localhost, deployment, redirect,
  or environment-key details.

## Remaining Live Verification

- Run all migrations against production and verify every table has expected RLS.
- Confirm no service-role key, email secret, or digest secret is exposed through
  client environment variables or bundled output.
- Verify Supabase Auth redirects for the production domain and each OAuth
  provider.
- Verify Edge Function JWT/secret behavior in production.
- Confirm storage bucket policy rejects cross-user writes and oversized files.
- Confirm database backups, log retention, and incident ownership.

## Known Residual Risks

- Legal/privacy documents need approval by the organization, not a code change.
- Production content must be reviewed before launch to avoid claims the code
  cannot verify.
- Real email deliverability, OAuth app review, and cron reliability require
  provider-side testing.

## Security Verdict

The repository is suitable for production testing after production credentials
and Supabase resources are configured. Public launch should wait for the live
verification list above.
