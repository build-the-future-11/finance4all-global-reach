# FinanceMeta Test Report

Status: latest local verification completed successfully.

## Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `npm test` | Passed | 19 test files, 78 tests passed. |
| `npx tsc --noEmit` | Passed | No TypeScript errors. |
| `npm run lint` | Passed | 0 errors, 11 existing Fast Refresh warnings. |
| `VITE_APP_URL=<canonical-production-url> npm run build` | Passed | Production Vite build completed with a valid URL set during verification. |
| `npm run release:static` | Passed | Final artifact, setup SQL, env, stale-reference, and unsupported-claim checks passed. |
| `npm run release:check` | Passed | Runs lint, typecheck, unit tests, production build with safe build env, and final static readiness checks. |
| `npm audit --omit=dev --audit-level=high` | Passed | 0 vulnerabilities after network access was approved. |
| `npm run preview -- --host 127.0.0.1 --port 4173` | Passed | Local preview server started for e2e tests. |
| `npm run test:e2e` | Passed | 7 Playwright tests passed against local preview. |
| `git diff --check` | Passed | No whitespace errors. |

## E2E Coverage

The current Playwright suite verifies:

- Landing page loads without console/page errors.
- Login page is reachable.
- Contact form is visible.
- `/portal` redirects unauthenticated users to login.
- `/portal/network` redirects unauthenticated users to login.
- Signup honeypot field is hidden from real users.
- Login page resists poisoned redirect state.

## Unit And Component Coverage

The Vitest suite covers:

- Auth error sanitization.
- Supabase configuration failure states.
- Production messaging for missing account service.
- Protected route and role guard behavior.
- Markdown and unsafe URL sanitization.
- File validation and avatar safety.
- Event registration business rules.
- Education progress persistence.
- Member-directory privacy.
- Profile write boundaries.
- Operational integrity helpers.
- Deployment security rules.
- Analytics and error reporting.
- Admin sanitization.
- Account data export.

## Known Test Gaps

These require a live Supabase project or additional test infrastructure:

- Real email sign-up confirmation and password reset.
- Google OAuth callback with provider credentials.
- RLS enforcement against production Supabase.
- Storage policy enforcement against production bucket.
- Edge Function execution with production secrets.
- Live weekly digest delivery through the email provider.
- Multi-account admin/member/research-lead smoke test.

These gaps are listed as external actions, not hidden as passed tests.
