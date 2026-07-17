# Last Known Good State

**Recorded:** 2026-07-17 (Pass 2 Wave 1 close)  
**Git branch:** `cursor/membership-security-supabase-fix`  
**Prior Pass 1 commit:** `40bc348`  
**Pass 2 checkpoint:** `3f3f43d` — Implement Pass 2 Finance Debrief trustworthy editorial CMS.

## Validation snapshot

| Command | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` | 88/88 |
| `npm run build` (CI placeholder env) | pass |
| `npm run release:static` | pass |
| `CI=true npm run test:e2e` | 7/7 |

## Known-good subsystems (source)

- Auth UI + ProtectedRoute/RoleGuard
- Portal feature routes (hybrid CMS education/resources)
- **Finance Debrief trustworthy editorial pipeline (migrations 001–013):** approved sources, status machine, version history, AI generation logs, publish/transition RPCs, admin UI, member disclaimer, digest newsletter flag
- Admin news/opportunities/events/explainers/chapters/inbox/members/system(+CMS seed)
- Security headers + env build gate

## Not known-good (live)

- Full schema on current Supabase project until OA-1 complete (must include 013)
- OAuth/production redirects until OA-2
- Wave 2 portal completeness (moderation, certificates, competitions, map)

## Restore notes

If Pass 3 regressions occur: keep docs as source of truth; revert Pass 3 changes; re-run baseline commands above. Do not delete memory files. Debrief rollback = drop objects from 013 only if needed; prefer forward fixes.
