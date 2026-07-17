# Last Known Good State

**Recorded:** 2026-07-17 (Pass 4 close)  
**Git branch:** `cursor/membership-security-supabase-fix`  
**Prior Pass 3:** `14a20ed` / `27cfba2`  
**Pass 4 checkpoint:** see latest commit after this file update

## Validation snapshot

| Command | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` | 94/94 |
| `npm run lint` | 0 errors / 8 warnings |
| `npm run release:static` | pass |
| `CI=true npm run test:e2e` | 11 passed / 2 skipped |

## Known-good (source)

- Passes 1–4 engineering scope through Wave 3
- Migrations 001–014; Debrief + portal completeness
- E2E smoke + auth surfaces; authenticated optional via `E2E_*`

## Not known-good (live)

- Schema/auth/Vercel/Edge until OA-*
- Live RLS role sampling
- Brand unify (D-001)
