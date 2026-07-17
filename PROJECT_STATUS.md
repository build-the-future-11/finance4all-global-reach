# Project Status

**Product:** Finance4All (FinanceMeta member platform)  
**Branch:** `cursor/membership-security-supabase-fix`  
**Last verified:** local lint, typecheck, unit tests, build, release:static

## Completed

### Public website
- Landing page with mission, origin story, portal modules, outcomes, resources preview, testimonials, CTA, contact
- SEO metadata and Organization JSON-LD
- Responsive layout, skip link, accessible focus states
- Legal pages (`/privacy`, `/terms`)

### Member portal
- Full auth lifecycle: signup, login, Google OAuth, email callback, forgot/reset password, onboarding, logout
- Protected routes with profile retry and onboarding gate
- Dashboard with live community stats, activity, weekly goals, recommendations
- Debriefed (articles, explainers, bookmarks, digest prefs)
- Meta Labs (projects, applications, reviewer dashboard)
- Pathways (opportunities, studios, essays)
- Education (CMS-backed lessons + cross-device progress)
- Resources (CMS-backed library + guides + webinars)
- Events/chapters with registration windows
- Network (directory, connections, introductions, profiles)
- Saved content, notifications, portal search
- Settings (profile, avatar, password, digest, export, delete account)

### Administration
- News, opportunities, events, explainers, chapters CRUD
- Contact inbox with status workflow
- Member role management
- System tab: analytics, client errors, digest log, **CMS seed**

### Database (12 migrations)
- RLS on all member data
- Profile write RPCs, directory privacy, rate limiting
- CMS tables, operational logging
- `FINAL_SETUP.sql` + `VERIFY_SETUP.sql`

### Security
- No service role in frontend
- Production env validation at build time
- CSP and security headers on Vercel
- Rate limits, input sanitization, honeypot

### Tests
- 78 unit/component tests
- 7 Playwright smoke/security tests
- CI pipeline with release static checks

## Credential-only blockers (operator)

1. Supabase project linked; `FINAL_SETUP.sql` applied; `VERIFY_SETUP.sql` all `ok`
2. Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL`
3. Supabase Auth: Site URL + redirect URLs for production and localhost
4. Google OAuth provider (if used)
5. Edge Functions deployed: `weekly-digest`, `delete-account` + secrets
6. Resend/email sender for digest (optional)
7. Promote first admin via SQL
8. Seed or publish production content; remove demo seed if needed
9. `npm audit --omit=dev --audit-level=high` from approved environment

See `REMAINING_EXTERNAL_ACTIONS.md` and `DEPLOYMENT.md`.

## Not finished / follow-up

- E2E tests for authenticated and admin flows
- Admin UI for lab project moderation (currently lead-researcher in-portal)
- Admin UI for studio/essay moderation
- Live RLS proof against production Supabase (requires real accounts)
- FinanceMeta branding rename (codebase uses Finance4All publicly today)

## Commands

```bash
npm install
cp .env.example .env   # fill locally
npm run dev            # http://localhost:8080
npm run release:check  # full local gate
```
