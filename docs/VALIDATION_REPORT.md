# Validation Report

**Project:** Finance4All / FinanceMeta  
**Branch:** `cursor/membership-security-supabase-fix`  
**Recorded:** 2026-07-17 (Phase 4 release governor)  
**Migrations:** 001–017

## Commands run in this environment

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASSED |
| `npm test` | PASSED (98) |
| `npm run lint` | PASSED (0 errors; 8 Fast Refresh warnings) |
| `npm run build` (CI `VITE_*`) | PASSED |
| `npm run release:static` | PASSED |
| `npm run package:source` | PASSED (380 entries; no `.env`) |
| `CI=true npm run test:e2e` | PASSED (11) / SKIPPED (2) — after Playwright https coerce |

## Failure repaired this run

Local `.env` had non-https `VITE_APP_URL` (`http://localhost…`). Playwright `webServer.env` used `??` which kept that value; Vite production validate rejected it. Fixed by coercing to `https://ci-placeholder.vercel.app` when value does not start with `https://`.

## Not runnable here

| Check | Why |
| --- | --- |
| Live VERIFY_* | OA-1 |
| Authenticated portal e2e | OA-9 `E2E_*` |
| Edge invoke | OA-5 |
