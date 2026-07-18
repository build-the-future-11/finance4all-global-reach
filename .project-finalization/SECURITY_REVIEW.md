# Security Review — FinanceMeta (Pass One)

## Controls verified present (from migrations 001–021 and app code)
- **RLS + ownership force-assign** (migrations 018–020): `SECURITY DEFINER` functions pinned
  to `search_path = public, pg_temp`; `user_id`/`applicant_id`/`author_id`/`lead_researcher_id`
  forced to `auth.uid()` on insert; notification content frozen to the `read` flag only.
- **Analytics RPC hardening** (021, this run): `track_product_event` requires auth, enforces a
  strict event allowlist, validates property key regex + scalar values + 2KB cap, enforces a
  200/day per-user rate limit, and is `REVOKE`d from `PUBLIC`/`anon`, `GRANT`ed only to
  `authenticated`. Non-PII properties only (`decision`, `lesson_count`, `method`, etc.).
- **Client env safety:** only `VITE_*` public values are exposed; the build validator refuses
  production builds missing config or with a non-JWT anon key. No service-role key in client.
- **No secrets committed** in this increment (verified `git status`; only source + SQL + docs).

## This run's analytics event properties (privacy classification)
| Event | Property | Classification |
|---|---|---|
| `education.certificate_issued` | `lesson_count` (number) | Non-PII, bounded |
| `research.application_decided` | `decision` (enum status) | Non-PII, bounded |
| `opportunity.interest_saved` | none | Non-PII |

No emails, names, free text, or URLs are ever passed to `trackEvent` (enforced by typed
`AnalyticsProperties = Record<string, string|number|boolean>` and DB-side validation).

## Residual (for Pass Two)
- Add e2e/integration tests that attempt cross-user reads of `lab_applications` and
  `opportunity_interests` to prove IDOR protection at runtime (currently asserted via policy
  docs + unit tests only).
