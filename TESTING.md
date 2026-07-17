# Testing Guide

## Quick verification

```bash
npm run lint
npm run typecheck
npm test
VITE_SUPABASE_URL=https://ci-placeholder.supabase.co \
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpLXBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.ci-placeholder-signature-for-build-only \
VITE_APP_URL=https://ci-placeholder.vercel.app \
npm run build
npm run release:static
npm run test:e2e
```

Full release gate:

```bash
npm run release:check
```

## Unit and component tests (Vitest)

Location: `src/**/*.test.ts(x)`

Coverage includes:

- Auth error sanitization and Supabase env validation
- `ProtectedRoute` and `RoleGuard`
- Security helpers (password, email, redirects, file validation)
- Profile write boundaries and member directory privacy
- Operational integrity and deployment security headers
- Markdown/URL sanitization
- Education progress local fallback

Run: `npm test` or `npm run test:watch`

## End-to-end tests (Playwright)

Location: `e2e/`

Current coverage:

- Landing loads without page errors
- Login reachable; poisoned redirect resisted
- Contact form visible
- Unauthenticated `/portal`, `/portal/network`, `/onboarding`, `/portal/admin` redirect to login
- Signup honeypot hidden; forgot-password form visible
- **Authenticated journeys** (optional): set `E2E_EMAIL` and `E2E_PASSWORD` against staging/live with OA-1 applied

Run: `npm run test:e2e` (starts against `npm run preview` in CI)

```bash
E2E_EMAIL=member@example.com E2E_PASSWORD='…' CI=true npm run test:e2e
```

Without credentials, authenticated tests **skip** (CI stays green).

## CI

`.github/workflows/ci.yml` runs on push/PR to `main` and `cursor/**`:

1. `npm ci`
2. `npm run audit:ci`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`
6. `npm run build` (placeholder env)
7. `npm run release:static`
8. Playwright e2e

## Manual critical journeys

Before declaring production-ready, verify:

1. Signup → email confirm (if enabled) → onboarding → dashboard
2. Google OAuth → callback → portal
3. Forgot/reset password
4. Save article, apply to lab, register for event
5. Connection request send/accept
6. Education lesson complete (syncs when migration 006 applied)
7. Admin: publish news, change member role, seed CMS
8. Settings: avatar upload, password change, account export

## Database verification

```bash
# In Supabase SQL Editor after migrations:
# paste supabase/VERIFY_SETUP.sql
```

See `DATABASE.md` for migration order.
