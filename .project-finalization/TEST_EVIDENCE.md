# Test Evidence — Pass One increment (2026-07-18)

All commands run from repo root.

| Check | Command | Result |
|---|---|---|
| Type check | `npx tsc --noEmit` | PASS (exit 0, no errors) |
| Lint | `npm run lint` | PASS (0 errors, 8 pre-existing `react-refresh/only-export-components` warnings) |
| Unit tests | `npm run test` | PASS — 29 files, 120 tests (before analytics drift test) |
| Unit tests (after new test) | `npx vitest run src/lib/analytics.test.ts` | PASS — 3/3 (incl. new client/DB allowlist drift guard) |
| Production build (no env) | `npm run build` | FAILS by design — env validator requires `VITE_APP_URL`, `VITE_SUPABASE_URL`, JWT `VITE_SUPABASE_ANON_KEY` |
| Production build (valid env) | `VITE_APP_URL=... VITE_SUPABASE_URL=...supabase.co VITE_SUPABASE_ANON_KEY=eyJ... npm run build` | PASS — built in ~5.3s, route-level code splitting confirmed (Dashboard chunk 25.2 kB / 7.3 kB gz) |
| Static release readiness | `npm run release:static` | PASS — "Final readiness checks passed." |
| E2E (no CI) | `npm run test:e2e` | Server not started (webServer gated on `CI`) — not a product failure |
| E2E (correct invocation) | `CI=1 npm run test:e2e` | PASS — 16 passed, 2 skipped (auth-gated) across chromium + mobile (Pixel 5) |

## Notes
- Playwright Chromium was downloaded once via `npx playwright install chromium`.
- The env validator failing the build without configuration is a **security feature**, not a defect; verified the build succeeds with valid-format public env values.
- E2E covers: landing console-clean load, login reachability, contact form, public competitions, discover page, hero CTA → Discover, module CTA → signup?next, unauthenticated portal/network redirects to login, signup honeypot hidden, poisoned-redirect protection, and mobile landing/discover usability.
