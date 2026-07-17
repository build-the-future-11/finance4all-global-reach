# Release Checklist

Status: final release checklist. Only external/manual tasks remain.

## Repository Verification

- [x] Unit tests passed.
- [x] E2E smoke tests passed.
- [x] TypeScript passed.
- [x] ESLint passed with existing Fast Refresh warnings and no errors.
- [x] Production build passed with `VITE_APP_URL` set.
- [x] Production dependency audit passed with zero high vulnerabilities.
- [x] Browser smoke test passed on desktop and mobile.
- [x] Diff whitespace check passed.

## Production Supabase

- [ ] Create or confirm the production Supabase project.
- [ ] Apply migrations `001` through `012` in order.
- [ ] Run `supabase/VERIFY_SETUP.sql` and confirm every row returns `ok = true`.
- [ ] Confirm RLS is enabled and policies match the release audit.
- [ ] Configure storage bucket and avatar policies.
- [ ] Promote two real administrators through a controlled database operation.
- [ ] Remove demo content and seed-only records.

## Auth And Email

- [ ] Set production Site URL and redirect URLs.
- [ ] Configure Google OAuth if used.
- [ ] Verify password recovery and OAuth callback on the production domain.
- [ ] Configure sender domain and email templates.
- [ ] Deploy `weekly-digest` and configure cron with `DIGEST_CRON_SECRET`.
- [ ] Deploy `delete-account` with JWT verification.

## Hosting

- [ ] Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_URL`.
- [ ] Point canonical domain to hosting.
- [ ] Validate security headers and CSP in production.
- [ ] Validate metadata, robots, sitemap, and social preview image.

## Content, Legal, And Operations

- [ ] Approve privacy and terms pages.
- [ ] Assign support mailbox owner and response process.
- [ ] Publish only reviewed Debrief, learning, opportunities, chapter, event,
      and research content.
- [ ] Configure monitoring for hosting, Supabase functions, auth anomalies, and
      database backups.
- [ ] Run live smoke tests for visitor, member, research lead if enabled, and
      administrator.

Release verdict: do not mark public launch complete until every unchecked item
above is completed with production evidence.
