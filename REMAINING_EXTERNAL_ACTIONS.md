# FinanceMeta — Remaining External Actions

Repository-side launch blockers are handled in code and CI. The items below require production credentials, dashboards, live data, or owner approval and therefore must be completed against the real deployment.

## 1. Link the production Supabase project

```bash
supabase link --project-ref <project-ref>
```

## 2. Apply every database migration

Preferred path:

```bash
supabase db push
```

This must apply all migrations through `022_directory_visibility.sql`.

If using the SQL Editor on a fresh project instead:

1. Run `supabase/FINAL_SETUP.sql`.
2. Run `supabase/FINAL_SETUP_PATCH.sql`.
3. Run `supabase/VERIFY_SETUP.sql`.
4. Run `supabase/VERIFY_RELEASE_PATCH.sql`.
5. Resolve every row where `ok = false`.

Then test directory privacy with two ordinary member accounts: a member with `open_to_collaborate = false` must not be discoverable by the other account; enabling it must make the profile discoverable. Email must never be returned by the member directory.

## 3. Set production hosting variables

Set these in Vercel or the chosen host:

```env
VITE_SUPABASE_URL=<production project URL>
VITE_SUPABASE_ANON_KEY=<production anon key>
VITE_APP_URL=<canonical https production URL>
```

Do not put the Supabase service-role key or other backend secrets in `VITE_*` variables.

## 4. Configure Supabase Auth

In **Authentication → URL Configuration** set the canonical Site URL and allow:

```text
https://<production-domain>/auth/callback
https://<production-domain>/reset-password
```

Keep local-development redirects only where needed.

## 5. Configure Google OAuth if enabled

Configure the production Supabase callback in Google Cloud and test a fresh Google account through signup, callback, onboarding, sign-out, and re-login.

## 6. Deploy Edge Functions

```bash
supabase functions deploy weekly-digest --no-verify-jwt
supabase functions deploy delete-account
```

Set the required function secrets:

```bash
supabase secrets set SUPABASE_URL=<url>
supabase secrets set SUPABASE_ANON_KEY=<anon-key>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
supabase secrets set SITE_URL=<production-domain>
supabase secrets set DIGEST_CRON_SECRET=<long-random-secret>
supabase secrets set RESEND_API_KEY=<resend-key>
supabase secrets set DIGEST_FROM_EMAIL=<verified-sender>
```

If email infrastructure is not ready, keep weekly digest delivery disabled for launch rather than exposing a broken flow.

## 7. Establish administrator coverage

Create at least two trusted administrator accounts. Verify ordinary members remain `member` and cannot self-promote or write admin-managed data through direct API calls.

## 8. Review production content and legal text

Before opening registration:

- approve FinanceMeta Privacy and Terms;
- remove seed/demo/unverified production records;
- publish only verified Finance Debrief articles, opportunities, research projects, events, competitions, chapters, lessons, guides, and testimonials;
- approve the final canonical domain and social-preview metadata;
- confirm public claims match current evidence.

## 9. Run authenticated production acceptance

Use dedicated test accounts and verify:

- email signup and confirmation;
- Google OAuth if enabled;
- onboarding and directory visibility consent;
- dashboard and all portal modules;
- saved content and learning progress persistence;
- event registration limits and duplicate prevention;
- lab application eligibility and review transitions;
- connection requests and member-directory privacy;
- password reset/change;
- account export;
- account deletion and sole-admin deletion protection;
- admin publishing, moderation, analytics, content reports, competitions, research, and chapter-leader tools;
- non-admin denial of privileged operations;
- mobile navigation and critical journeys.

Provide `E2E_EMAIL` and `E2E_PASSWORD` for the authenticated Playwright acceptance suite. Repository CI may skip those credentialed journeys, but production launch acceptance may not.

## 10. Merge and deploy

Merge `cursor/membership-security-supabase-fix` into `main` only after required GitHub checks are green. Deploy the merged `main`, keep the previous Vercel deployment available for rollback, and open registration only after the live acceptance checks above pass.
