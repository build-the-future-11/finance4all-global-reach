# Last Known Good State

**Recorded:** 2026-07-17 (Pass 3 Wave 2 close)  
**Git branch:** `cursor/membership-security-supabase-fix`  
**Prior Pass 2:** `3f3f43d` / `43e2c14`  
**Pass 3 checkpoint:** see latest commit after this file update

## Validation snapshot

| Command | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` | 92/92 |
| `npm run build` (CI placeholder env) | pass |
| `npm run release:static` | pass |
| `CI=true npm run test:e2e` | 7/7 |

## Known-good subsystems (source)

- Auth + ProtectedRoute/RoleGuard
- Debrief editorial (001–013)
- **Portal completeness (014):** moderation, certificates, chapter leaders, competitions, map filters, nav labels, sitemap
- Admin tabs including Moderation + Competitions

## Not known-good (live)

- Schema until OA-1 (013–014)
- Brand unify until D-001
- Authenticated e2e until Pass 4

## Restore notes

If Pass 4 regressions occur: keep docs; revert Pass 4 changes; re-run baseline above. Prefer forward fixes over dropping 014.
