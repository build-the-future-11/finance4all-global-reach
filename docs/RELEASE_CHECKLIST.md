# Release Checklist

Engineering source gates vs owner live gates. Keep claims honest: only mark checked items that were actually verified.

## Repository Verification (engineering)

- [x] Unit tests (`npm test`)
- [x] E2E smoke + auth-surface (`CI=true npm run test:e2e`; auth journeys skip without `E2E_*`)
- [x] TypeScript (`npm run typecheck`)
- [x] ESLint 0 errors (Fast Refresh warnings on shadcn/Auth acceptable per D-011)
- [x] Production build with CI placeholder `VITE_*` (`https` `VITE_APP_URL` required)
- [x] `npm run release:static`
- [x] `npm run package:source` (no `.env` / `.vercel` / `.cursor`)
- [x] Migrations **001–016** present; `FINAL_SETUP.sql` synced
- [x] `VERIFY_SETUP.sql` + `VERIFY_RLS_MATRIX.sql` (includes absent direct INSERT on `content_reports`)

## Production Supabase (owner)

- [ ] Create or confirm the production Supabase project
- [ ] Apply `supabase/FINAL_SETUP.sql` (migrations **001–016**)
- [ ] Run `VERIFY_SETUP.sql` — every row `ok = true`
- [ ] Run `VERIFY_RLS_MATRIX.sql` — every row `ok = true`
- [ ] Confirm storage `avatars` policies
- [ ] Promote administrators through controlled SQL
- [ ] Remove demo/seed-only records before public launch

## Auth And Email (owner)

- [ ] Production Site URL and redirect URLs
- [ ] Google OAuth if used
- [ ] Password recovery + OAuth callback on production domain
- [ ] Sender domain and email templates
- [ ] Deploy `weekly-digest` + cron (`DIGEST_CRON_SECRET`)
- [ ] Deploy `delete-account` with JWT verification

## Hosting (owner)

- [ ] `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL`
- [ ] Canonical domain
- [ ] Security headers / CSP in production
- [ ] Metadata, robots, sitemap, social preview

## Content, Legal, And Operations (owner)

- [ ] Approve privacy and terms; brand decision D-001
- [ ] Support mailbox owner
- [ ] Publish only reviewed Debrief / learning / opportunities / events content
- [ ] Monitoring and backups
- [ ] Live smoke: visitor, member, admin

## Verdict

**Source:** release-candidate ready after local verification.  
**Public launch:** not complete until every unchecked owner item has production evidence.
