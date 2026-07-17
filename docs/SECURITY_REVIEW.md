# Security Review

Pass 1 source-level review. Live RLS proof remains owner/staging work.

## Strengths

- No service-role usage in browser bundles
- Anon key shape validation; production build env gate in `vite.config.ts`
- Safe internal redirects (`safeInternalPath` / app origin helpers)
- Profile write RPCs block role/email self-escalation
- Directory privacy via `member_directory`
- Rate limiting RPCs for sensitive actions
- Signup honeypot + password strength helpers
- Avatar MIME/size validation
- Account deletion Edge Function requires JWT; sole-admin protection
- Weekly digest requires cron secret
- Vercel CSP / HSTS / frame denial
- Markdown/URL sanitization tests present

## Gaps / risks

| ID | Risk | Status |
| --- | --- | --- |
| FM-SEC-001 | Live RLS unproven on current Supabase project | BLOCKED |
| FM-SEC-002 | Edge secrets/deploy may be incomplete | BLOCKED |
| FM-DEBRIEF-003 | Server publish guard + AI log requirement (013) | RESOLVED (source); live OA-1 |
| FM-DATA-001 | Incomplete live schema increases misconfig risk | BLOCKED |
| FM-PUBLIC-003 | Relative OG image | UNRESOLVED |

## Required env hygiene

Never put in git or `VITE_*`:

- `SUPABASE_SERVICE_ROLE_KEY` / `sb_secret_*`
- `DIGEST_CRON_SECRET`
- `RESEND_API_KEY`

`.env.example` documents client vars only — keep it that way.

## Role matrix (expected)

| Actor | Portal data | Admin publish | Other users’ private rows |
| --- | --- | --- | --- |
| Anon | No | No | No |
| Member | Own + published | No | No |
| Lead researcher | Own projects + apps | Limited | No |
| Admin | Yes | Yes | Via admin policies only |
| Service role | Edge only | N/A | N/A |

## Pass 1 validation run

Lint/typecheck/unit/build/release:static/e2e — all passed (see CURRENT_PASS_CONTEXT).

## Residual

Authenticate live matrix tests after `VERIFY_SETUP.sql` succeeds.
