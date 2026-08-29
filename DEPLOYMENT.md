# FinanceMeta Production Deployment

FinanceMeta is a Vite application backed by Supabase Auth, Database, Storage, and Edge Functions. Production deployment is complete only when the frontend, all database migrations, Edge Functions, auth redirects, runtime secrets, content review, and live smoke tests are complete.

## 1. Canonical release branch

Deploy only code that has passed review and CI from the hardened release branch and has been merged into `main`.

Current release source:

```text
cursor/membership-security-supabase-fix
```

Do not deploy the older `main` state before the hardened branch is merged.

## 2. Hosting environment

Set these browser-safe variables in the hosting provider before building:

| Name | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Production Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Browser-safe anon JWT |
| `VITE_APP_URL` | Yes | Canonical public production URL including `https://` |

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `sb_secret_...`, provider API keys, cron secrets, or mail credentials in `VITE_*` variables.

After changing any `VITE_*` value, rebuild and redeploy. Vite reads these values at build time.

## 3. Database: preferred production path

The canonical production database path is migration-based:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

This applies every migration in `supabase/migrations/` in order, including the current release migrations through:

```text
022_directory_visibility.sql
```

Do not manually stop at migration 012 or 021.

After applying migrations, run both verification scripts in the SQL Editor:

1. `supabase/VERIFY_SETUP.sql`
2. `supabase/VERIFY_RELEASE_PATCH.sql`

Resolve every row where `ok = false` before opening registration.

### SQL Editor path for a fresh project

If the Supabase CLI is unavailable, use the release SQL artifacts in this order:

1. Run `supabase/FINAL_SETUP.sql`.
2. Run `supabase/FINAL_SETUP_PATCH.sql`.
3. Run `supabase/VERIFY_SETUP.sql`.
4. Run `supabase/VERIFY_RELEASE_PATCH.sql`.
5. Confirm all verification rows return `ok = true`.
6. Explicitly test with two normal accounts that a member whose `open_to_collaborate` value is `false` cannot be resolved by another ordinary member, while setting it to `true` makes the profile discoverable.

`FINAL_SETUP.sql` is frozen through migration `021_analytics_journey_events.sql`. `FINAL_SETUP_PATCH.sql` contains later release migrations, currently `022_directory_visibility.sql`. CI checks both artifacts against their corresponding migration ranges.

Seed data is for internal review only. Remove or replace unverified seed/demo records before public launch.

## 4. Supabase Auth

In **Authentication → URL Configuration**:

- Site URL: the canonical production URL.
- Redirect URLs: production `/auth/callback` and `/reset-password` URLs.
- Add local development URLs only where needed.
- If Google OAuth is enabled, configure the Supabase project callback URL in Google Cloud Console.

Email confirmation settings should match the actual membership policy before invitations are sent.

## 5. Edge Functions

Deploy:

```bash
supabase functions deploy weekly-digest --no-verify-jwt
supabase functions deploy delete-account
```

`weekly-digest` uses a cron secret and must be called only by the scheduler. `delete-account` keeps JWT verification enabled and validates the signed-in member before deletion.

Set function secrets:

| Secret | Used by |
| --- | --- |
| `SUPABASE_URL` | Both |
| `SUPABASE_ANON_KEY` | `delete-account` |
| `SUPABASE_SERVICE_ROLE_KEY` | Both |
| `SITE_URL` | Both |
| `DIGEST_CRON_SECRET` | `weekly-digest` |
| `RESEND_API_KEY` | `weekly-digest` |
| `DIGEST_FROM_EMAIL` | `weekly-digest` |

Schedule the weekly digest as a `POST` containing:

```text
Authorization: Bearer <DIGEST_CRON_SECRET>
```

If email infrastructure is not ready at initial launch, keep the weekly digest disabled rather than shipping a broken preference.

## 6. Required release verification

Use Node.js 22 or newer. Before merge/deploy, require all of these to pass from the repository root:

```bash
npm ci
npm run audit:ci
npm run lint
npm run typecheck
npm test
npm run build
npm run release:static
npm run test:e2e
```

For authenticated E2E coverage, provide dedicated non-production test credentials through `E2E_EMAIL` and `E2E_PASSWORD`. A CI run that skips authenticated portal journeys is not sufficient as the final production acceptance test.

## 7. Production smoke tests

Run these checks against the actual production deployment:

1. Public landing, Discover, Competitions, Privacy, and Terms load on desktop and mobile without console errors or horizontal overflow.
2. Email signup succeeds, confirmation behavior is correct, onboarding completes once, sign-out works, and sign-in restores the account.
3. Google sign-in returns to `/portal` when OAuth is enabled.
4. Dashboard, Finance Debrief, Saved, Learn, Resources, Events & Chapters, Opportunities, Meta Labs, Network, Activity, and Settings load from production data.
5. A member with `open_to_collaborate = false` is not discoverable by another normal member; enabling it makes the profile discoverable.
6. Account email never appears in the member directory.
7. Draft Finance Debrief articles are visible only to administrators; published articles are visible to members.
8. Event registration respects status, registration windows, capacity, duplicate prevention, and persists across sign-in.
9. Lab applications enforce project status, deadlines, ownership, duplicate rules, and authorized review transitions.
10. A member can export account data and delete a non-admin test account.
11. Deleting the sole administrator is blocked.
12. Avatar uploads reject unsupported files and store only in the member-owned path.
13. Admin Inbox, Members, content editors, moderation, competitions, research projects, chapter leadership, analytics, and System surfaces enforce role permissions.
14. Non-admin users cannot write administrative data even by direct API calls.
15. Weekly digest sends only published eligible content and writes one delivery-log row per member/week when enabled.
16. Privacy, terms, support contact, canonical URL, metadata, social preview, and public program copy are approved.
17. No seed/demo/unverified content or unsupported scale claims remain in production.

## 8. Administrator coverage

Before launch, create at least two trusted administrator accounts. Confirm ordinary members remain `member` unless deliberately promoted through an administrative workflow.

Never expose a browser-facing workflow that allows a member to promote their own role.

## 9. Rollback

Keep the previous hosting deployment available until production verification passes. If a migration, Edge Function, auth configuration, or portal journey fails:

1. Stop inviting or onboarding users.
2. Restore the previous frontend deployment where appropriate.
3. Do not roll back irreversible database changes blindly; fix forward or restore from an approved backup.
4. Re-run database verification and production smoke tests before reopening access.

## 10. Launch gate

FinanceMeta is **GO** only when:

- the hardened branch is merged to `main`;
- GitHub Actions is green;
- all production migrations through `022` are applied;
- both Supabase verification scripts pass;
- authenticated golden-journey smoke tests pass against the live environment;
- directory privacy behavior is verified with two ordinary accounts;
- legal/content review is complete;
- at least two administrators are available;
- the final production URL is configured consistently in Vercel and Supabase.
