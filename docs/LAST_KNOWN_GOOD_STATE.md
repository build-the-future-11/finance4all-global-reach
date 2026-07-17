# Last Known Good State

**Recorded:** 2026-07-17 (Pass 1 close)  
**Git branch:** `cursor/membership-security-supabase-fix`  
**Commit:** `34d2de0` — Complete Pass 1 audit memory and low-risk production fixes.  
**Base:** `main` @ `fbdd503`

## Validation snapshot

| Command | Result |
| --- | --- |
| `npm run lint` | 0 errors / 11 warnings |
| `npm run typecheck` | pass |
| `npm test` | 78/78 |
| `npm run build` (CI placeholder env) | pass |
| `npm run release:static` | pass |
| `CI=true npm run test:e2e` | 7/7 |

## Known-good subsystems (source)

- Auth UI + ProtectedRoute/RoleGuard
- Portal feature routes (hybrid CMS education/resources)
- Admin news/opportunities/events/explainers/chapters/inbox/members/system(+CMS seed)
- Migrations 001–012 in repo + FINAL_SETUP/VERIFY scripts
- Security headers + env build gate

## Not known-good (live)

- Full schema on current Supabase project until OA-1 complete
- OAuth/production redirects until OA-2
- Finance Debrief trustworthy editorial pipeline (not built)

## Restore notes

If Pass 2 regressions occur: keep docs as source of truth; revert Pass 2 migrations; re-run baseline commands above. Do not delete memory files.
