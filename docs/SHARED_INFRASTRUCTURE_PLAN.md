# Shared Infrastructure Plan

Status: responsible reuse plan for active products.

## Reuse

- Release checks: lint, typecheck, unit tests, e2e smoke, production build,
  dependency audit, diff whitespace check, and browser viewport smoke.
- Supabase patterns: RLS-first authorization, profile lifecycle RPCs, role
  checks, service-role-only Edge Functions, and migration verification scripts.
- UI patterns: safe auth copy, accessible dialogs/forms, member layouts,
  loading states, empty states, denied states, and admin operational views.
- Documentation: product audit, flow map, architecture, implementation plan,
  security audit, release checklist, and production deployment guide.

## Do Not Share

- Supabase projects, service-role keys, production auth user pools, or storage
  buckets across unrelated products.
- Legal pages or public claims across products without owner approval.
- Demo content, seed content, analytics datasets, or user data.
- Admin role assignment procedures unless each organization has explicitly
  approved the same governance model.

## Minimum Standard For Every Active Product

- Public copy avoids unverifiable claims.
- Auth failures do not leak provider secrets, local URLs, or internal setup.
- All member-owned data is protected by server/database authorization.
- Admin workflows are enforced by RLS or server code.
- Production secrets are server-only.
- Release checklist distinguishes code readiness from external configuration.
