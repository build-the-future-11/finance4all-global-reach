# Launch Checklist

Engineering source gates vs owner live gates. Pass 4 closeout reference.

## Engineering (repo) — expected green

- [ ] `npm run lint` (0 errors; shadcn Fast Refresh warnings acceptable per D-011)
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build` with CI placeholder `VITE_*`
- [ ] `npm run release:static`
- [ ] `CI=true npm run test:e2e` (public + auth-surface tests; authenticated tests skip without secrets)
- [ ] Optional: `E2E_EMAIL` + `E2E_PASSWORD` against staging → authenticated journeys pass
- [ ] Migrations 001–017 present; `FINAL_SETUP.sql` synced
- [ ] `VERIFY_SETUP.sql` and `VERIFY_RLS_MATRIX.sql` available (includes absent direct INSERT on `content_reports`)
- [ ] `npm run package:source` produces archive without `.env`

## Owner live environment (OA-*)

- [ ] OA-1 Apply `FINAL_SETUP.sql` + `VERIFY_SETUP.sql` (all ok)
- [ ] Run `VERIFY_RLS_MATRIX.sql` (all ok)
- [ ] OA-2 Auth Site URL + redirect allowlist
- [ ] OA-3 Vercel `VITE_*` match live project; redeploy
- [ ] OA-4 Google OAuth (if used)
- [ ] OA-5 Edge Functions + secrets (`weekly-digest`, `delete-account`)
- [ ] OA-6 Promote first admin; review seed content
- [ ] OA-7 Legal public name (D-001)
- [ ] OA-8 Privacy/terms copy review

## Product smoke (after OA-1)

- [ ] Signup → onboarding → dashboard
- [ ] Publish Debrief with approved source
- [ ] Moderate studio/essay
- [ ] Issue curriculum certificate
- [ ] Appoint chapter leader; open competition
- [ ] RSVP event; bookmark article
- [ ] Admin role change; contact inbox

## Explicitly not launch-blocking in Pass 4

- Certificate PDF binary download (verification code is enough)
- Labs create remains lead-researcher portal (admin overview list only)
- Live Debrief AI provider keys
- Brand rename until D-001
