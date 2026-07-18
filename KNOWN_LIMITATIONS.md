# Known Limitations

Honest inventory. Items marked **Externally blocked** cannot be completed in this environment without owner credentials or live services.

## Verified complete (source)

- Public site + member portal modules through Pass 4 / finisher harden
- Migrations **001–020** in repo + `FINAL_SETUP.sql`
- Content reports RPC-only insert; outbound URL sanitization on portal external links
- Secret-free `npm run package:source`
- Local: typecheck, unit tests, lint (0 errors), production build with CI `VITE_*`, release:static, Playwright smoke/security/auth-surface

## Implemented but partially verified

| Item | Gap |
| --- | --- |
| Authenticated Playwright journeys | Skip without `E2E_EMAIL` / `E2E_PASSWORD` on staging |
| RLS role matrix | Policy-presence SQL exists; live role-as sampling needs OA-1 + staging accounts |
| Debrief AI assist | Adapter/UI present; no live model provider configured (by design) |
| Certificates | HTML print/save; not a binary PDF generator |

## Externally blocked

| ID | Blocker |
| --- | --- |
| OA-1 | Apply FINAL_SETUP 001–020 + VERIFY on live Supabase |
| OA-2 | Auth Site URL + redirect allowlist |
| OA-3 | Vercel `VITE_*` matching live project |
| OA-4 | Google OAuth (optional) |
| OA-5 | Edge Functions + secrets (`weekly-digest`, `delete-account`) |
| OA-6 | Promote admin; review/remove demo seed |
| OA-7 | Legal public brand name (D-001 Finance4All vs FinanceMeta) |
| OA-8 | Privacy/terms operational ownership |
| OA-9 | Staging e2e member credentials |

## Not completed (non-launch-blocking product gaps)

- Push/email event reminders (RSVP + `.ics` export exist)
- Full Fast Refresh lint cleanup for third-party shadcn/ui exports (warnings only; D-011)
- Binary certificate PDF

## Security note

An earlier hand-rolled source tarball may have included `.env`. Use only `npm run package:source`. If the old archive was shared, rotate/review Supabase anon key exposure as appropriate.
