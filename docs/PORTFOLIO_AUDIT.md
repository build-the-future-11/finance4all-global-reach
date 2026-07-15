# Portfolio Audit

Status: workspace-level product and risk audit.

## Finance4All / FinanceMeta

Purpose: financial-literacy nonprofit public site and member portal.

Maturity: production code baseline, pending external launch tasks.

Architecture: Vite/React/Supabase with RLS, migrations, Edge Functions, admin
surfaces, tests, and deployment documentation.

Main risks:
- Production Supabase migrations, secrets, redirects, and legal/content approval
  are external gates.
- Public name alignment is unresolved between Finance4All and FinanceMeta.

Verdict: prioritize for production launch testing.

## The Bu1ld Nexus

Purpose: independent machine-learning research and building platform.

Maturity: active development / near launch. The repo already has auth, member
routes, admin routes, Supabase phases through 22, release scripts, tests, and
uncommitted user-owned changes.

Architecture: TanStack Start/React/Supabase with API handlers for email,
digest, and account deletion.

Main risks:
- Existing uncommitted changes must be reviewed by the owner before release.
- Live Supabase, email, digest, RLS, and release checks need production
  environment verification.
- `wrangler.jsonc` contains public Supabase anon configuration. This is not a
  secret, but it should still point only at the intended production project.

Verdict: near-launch, but separate from Finance4All.

## ObscuredRecordsAgent

Purpose: local Python/media workflow utility.

Maturity: prototype/utility.

Architecture: local script and media artifacts, not a web app.

Main risks:
- No evidence of a deployable website, auth system, or membership workflow.

Verdict: archive or maintain as a separate utility.

## Missing VertexED Workspace

The configured path was not present during discovery. No audit was possible.

Verdict: blocked until the directory is restored or removed from the workspace.
