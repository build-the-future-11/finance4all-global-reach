# Deploy to Vercel (Production)

This is a **Vite** app. All client env vars must use the `VITE_` prefix so they are exposed at build time. Do **not** use `NEXT_PUBLIC_`.

## Current release gate

`main` now fails closed when the browser Supabase configuration is missing, malformed, or placeholder-valued. A green GitHub Actions build does **not** prove that the Vercel project has the same environment configuration, because CI supplies its own test values.

Before treating a Vercel deployment as production-ready, verify all of the following on the exact deployed commit:

- `VITE_SUPABASE_URL` is present and points at the canonical FinanceMeta Supabase project.
- `VITE_SUPABASE_PUBLISHABLE_KEY` is present and uses the browser-safe `sb_publishable_...` format.
- The variables are enabled for **Production and Preview** (and Development if Vercel development environments are used).
- The deployment was rebuilt after any environment-variable change.
- Database migrations through `20260906172830_harden_recovered_profile_functions.sql` have been applied in order.
- Google OAuth redirect URLs match the deployed production and preview domains.

If a Vercel deployment starts failing after the fail-closed configuration gate was introduced, check the build log for `validate-public-env` output first. Do not weaken or bypass the validator to make a deployment green.

## 1. Connect repo to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `build-the-future-11/finance4all-global-reach`
3. Framework: **Vite** (auto-detected)
4. **Do not deploy yet** — add env vars first

## 2. Environment variables (REQUIRED)

In Vercel → Project → **Settings** → **Environment Variables**, add:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_SUPABASE_URL` | `https://pnemeegkwyaicsbnbnmg.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` from Supabase dashboard | Production, Preview, Development |
| `VITE_AUTH_REDIRECT_ORIGIN` | `https://finance4all-global-reach.vercel.app` | Production, Preview, Development |

Legacy anon JWT variables are intentionally ignored. This prevents an obsolete
key from another Supabase project from silently becoming the production fallback.

**Never** add `SUPABASE_SERVICE_ROLE_KEY`, `sb_secret_...`, or any secret key to Vercel env vars that ship to the browser. Those are server-only.

Then click **Redeploy** — Vite bakes env vars in at **build** time, so changing them requires a new deploy.

### Local development

```bash
cp .env.example .env
# Edit .env with your browser-safe Supabase public key, then:
npm run dev
```

Dev server runs at **http://localhost:8080** (see `vite.config.ts`).

### Validate the same contract locally

```bash
npm run validate:env
npm run build
```

The release path should stay fail-closed: invalid or placeholder Supabase configuration must fail before a deploy is accepted.

## 3. Supabase redirect URLs (REQUIRED for Google login)

In [Supabase Dashboard](https://supabase.com/dashboard/project/pnemeegkwyaicsbnbnmg) → **Authentication** → **URL Configuration**:

**Site URL** (production):

```
https://YOUR-PROJECT.vercel.app
```

**Redirect URLs** — add ALL of these:

```
http://localhost:8080/auth/callback
https://YOUR-PROJECT.vercel.app/auth/callback
https://YOUR-PROJECT-*.vercel.app/auth/callback
```

Replace `YOUR-PROJECT` with your Vercel subdomain (e.g. `finance4all-global-reach`).

The app callback route is `/auth/callback` (`src/lib/supabase.ts` → `getAuthRedirectUrl()`).

**Google Cloud Console** (if using Google OAuth): authorized redirect URI must be:

```
https://pnemeegkwyaicsbnbnmg.supabase.co/auth/v1/callback
```

In Supabase → **Authentication** → **Sign In / Providers** → **Email**:

- set the minimum password length to `10` so backend enforcement matches the portal;
- enable leaked-password protection when the project plan supports it;
- record any plan limitation in release evidence instead of implying it is enabled.

## 4. Database

Use the Supabase CLI migration workflow. Do not paste migration files into the production SQL Editor or re-run them blindly.

Required migration order:

1. `supabase/migrations/20260709090402_initial_schema.sql`
2. `supabase/migrations/20260709104954_google_oauth.sql` (Google login)
3. `supabase/migrations/20260710031219_bookmarks_notifications.sql` (bookmarks + notifications)
4. `supabase/migrations/20260711032432_security_hardening.sql` (recovered profile and notification hardening that is present in production)
5. `supabase/migrations/20260711032433_education_progress.sql` (recovered owner-scoped lesson progress table that is present in production)
6. `supabase/migrations/20260830141730_authorization_hardening.sql` (role/ownership/notification/view authorization hardening)
7. `supabase/migrations/20260906121145_portal_security_and_privacy.sql` (least-privilege grants, member-email privacy, immutable ownership, safe auth helpers)
8. `supabase/migrations/20260906150000_retire_unused_hosted_extensions.sql` (retire unused hosted-only RPC/contact surfaces, archive existing rate telemetry privately, and leave the empty avatar bucket private and inert)
9. `supabase/migrations/20260906171941_archive_abandoned_public_tables.sql` (reversibly move empty, unused tables from a partially applied branch into the private legacy namespace)
10. `supabase/migrations/20260906172830_harden_recovered_profile_functions.sql` (pin recovered trigger functions to qualified objects and remove browser-role execution)

The recovered migrations were traced to commit `9539faadecc5d5c564b33e7610e02cbe1789f97c` and matched against the live schema before being restored. See `docs/PRODUCTION_SCHEMA_RECONCILIATION.md` for the observed production state and the remaining ledger-repair boundary.

The authorization migrations are production security requirements, not optional enhancements.

For a fresh local database, run `supabase db reset`. Apply `supabase/seed.sql` only to disposable local or explicitly approved staging environments. For a linked remote project, inspect `supabase migration list --linked` before `supabase db push`.

If a migration was previously applied manually and its schema is already present, first prove the schema matches the repository migration. Then use the documented `supabase migration repair <version> --status applied` command to repair history without executing the SQL again. Record the before/after migration list and exact source SHA. Never insert directly into `supabase_migrations.schema_migrations`.

### Authorization certification after the latest migration

Using an ordinary member account against the canonical production database, verify that:

- changing `profiles.role` through the client/PostgREST is rejected;
- creating a profile cannot self-assign an elevated role;
- ordinary profile fields that are explicitly allowed remain editable;
- another member's email cannot be selected from `profiles`;
- a member cannot fabricate notifications;
- a member cannot self-accept a lab application or self-award an editorial pick;
- a connection recipient cannot rewrite either participant or the request message;
- a studio author cannot transfer authorship or rewrite the submission timestamp;
- the retired public contact table/RPC surface remains absent;
- the retired avatar bucket has no public or member read policy;
- essay/community aggregate upvote counts remain visible while individual voter rows stay protected by RLS.

Record the deployed commit and the date of this certification. Source CI alone is not production certification.

Run `supabase/tests/two_identity_rls_certification.sql` in the SQL Editor for a transaction-only,
two-member RLS check. Then run the manual `Production Auth Certification` GitHub workflow with two
dedicated ordinary-member credentials to certify browser sign-in, session isolation, logout, and
protected-route behavior. These checks prove different layers and neither substitutes for the other.

## 5. Deploy

Push to `main` — Vercel auto-deploys. Or:

```bash
npx vercel --prod
```

## Verify

Run this against the exact production deployment before sharing the portal publicly:

1. Open `https://YOUR-PROJECT.vercel.app/login`.
2. Confirm there are no placeholder/missing-env errors.
3. Complete visitor → signup → onboarding → portal.
4. Complete Google sign-in and confirm it lands on `/portal`.
5. Confirm Portal loads news/events data.
6. Save or create one normal member activity and confirm it persists across logout/login.
7. Confirm a signed-out user is rejected from a protected portal route.
8. Confirm a normal member cannot reach or mutate admin-only functions.
9. Confirm the authorization checks above still pass against production.
10. Record the exact deployed commit SHA in the release evidence.

To promote an administrator, use a trusted database-admin path rather than any browser/client flow. For example, from the Supabase SQL Editor under an appropriately privileged operator account:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

Then open `/portal/admin` and verify the intended admin path. Never expose role promotion as a member-editable client operation.

### Quick API check (local or CI)

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "apikey: YOUR_ANON_JWT" \
  -H "Authorization: Bearer YOUR_ANON_JWT" \
  "https://pnemeegkwyaicsbnbnmg.supabase.co/rest/v1/"
```

Expect `200` — confirms URL and public key are valid.

## Release evidence to retain

For each production release, retain a compact record containing:

- Git commit SHA;
- Vercel deployment URL and successful build result;
- environment-contract validation result (never the secret/public-key value itself);
- migration state through `20260906172830_harden_recovered_profile_functions.sql`;
- auth/onboarding/protected-route smoke-test result;
- ordinary-member authorization test result;
- known failures or exceptions and their owner.

A release is complete only when the deployment and the production authorization behavior are both verified.
