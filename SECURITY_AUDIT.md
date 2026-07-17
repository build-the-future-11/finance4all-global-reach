# FinanceMeta Security Audit

Status: source-level security baseline completed; live Supabase verification
still required.

## Passed Source Controls

- No service-role key is referenced by browser code.
- `VITE_SUPABASE_ANON_KEY` is validated as a browser-safe anon key shape.
- Auth redirects use app-origin helpers and sanitize unsafe redirect state.
- User-facing auth and setup errors do not expose raw environment variable,
  localhost, or provider setup details.
- Member profile update helpers strip privileged fields from browser writes.
- Role guards exist in the UI and RLS/migrations enforce server-side ownership.
- Member-owned records use `auth.uid()` ownership checks in policies/functions.
- Admin write workflows rely on database role checks, not client hiding alone.
- Contact submissions and operational events use bounded/sanitized payloads.
- Markdown/URL handling is tested against script and `javascript:` payloads.
- Avatar uploads validate MIME/signature and size in application logic.
- Account deletion requires a valid JWT and blocks removal of the sole admin.

## Live Security Verification Required

Run `supabase/VERIFY_SETUP.sql` after applying `supabase/FINAL_SETUP.sql`.
Every result must return `ok = true`.

Then verify with real accounts:

- Anonymous visitors cannot access portal data.
- Members cannot read or mutate another member's private records.
- Lead researchers cannot administer unrelated content.
- Non-admins cannot update roles, publish content, or read operational logs.
- Suspended/deleted accounts cannot continue using old sessions.
- Storage rejects cross-user paths and unsupported uploads.
- Edge Functions reject missing/invalid secrets or JWTs as designed.

## Residual Risks

- Live RLS can only be proven against the deployed Supabase project.
- Email, OAuth, cron, and Edge Function behavior require provider-side setup.
- Privacy/terms text requires organizational/legal approval.
- Public content must be reviewed so no seed/demo data is mistaken for real
  organizational evidence.

