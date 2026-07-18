# Validation Report

**Project:** Finance4All / FinanceMeta  
**Branch:** `cursor/membership-security-supabase-fix`  
**Recorded:** 2026-07-18 (ownership + DEFINER harden)  
**Migrations:** 001–019

## Commands run in this environment

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASSED |
| `npm test` | PASSED (116) |
| `npm run release:static` | PASSED |
| `npm run package:source` | PASSED (396 entries; no `.env`) |
| `CI=true npm run test:e2e` | PASSED (16) / SKIPPED (2) — authenticated journeys need `E2E_*` |

## This run

- Migration **018** pins SECURITY DEFINER `search_path`
- Migration **019** force-assigns ownership from `auth.uid()`, indexes ownership queries, deep-links lab received notifications
- Lab review honors `?project=` filter
- `ownershipForceAssign.test.ts` regression coverage

## Not runnable here

| Check | Why |
| --- | --- |
| Live VERIFY_* | OA-1 |
| Authenticated portal e2e | OA-9 `E2E_*` |
| Edge invoke | OA-5 |
