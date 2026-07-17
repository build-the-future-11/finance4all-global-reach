# Project Status

**Product:** Finance4All (FinanceMeta member platform)  
**Branch:** `cursor/membership-security-supabase-fix`  
**Phase:** 4 complete (engineering) — owner OA-* remain  
**Schema:** migrations **001–016**  
**Continuity:** `.cursor/project_state.json`

## Status taxonomy

| Area | Status |
| --- | --- |
| Source product + schema 001–016 | **Verified complete** |
| Local CI matrix | **Verified complete** |
| Playwright CI with local http `VITE_APP_URL` | **Verified complete** (`ciViteEnv` coerce) |
| Authenticated e2e vs staging | **Implemented but partially verified** (needs `E2E_*`) |
| Live Supabase / Auth / Vercel / Edge | **Externally blocked** (OA-1…OA-5) |
| Legal brand D-001 | **Externally blocked** (OA-7) |
| Event push reminders / PDF certs | **Not completed** (non-blocking) |

## Owner blockers

See `docs/OWNER_ACTIONS.md` and `KNOWN_LIMITATIONS.md`. Do not mark public launch complete until those are done with production evidence.

## Demo / release

- [DEMO_GUIDE.md](DEMO_GUIDE.md)
- [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md)
- `npm run package:source` → `dist-packages/finance4all-finished-source.tgz`
