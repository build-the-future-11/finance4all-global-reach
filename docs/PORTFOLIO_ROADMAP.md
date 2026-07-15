# Portfolio Roadmap

## Phase 1: Launch Finance4All / FinanceMeta

- Complete external release checklist.
- Align public/legal name.
- Configure production Supabase, Edge Functions, Auth, email, domain, and
  monitoring.
- Run multi-role production smoke tests.
- Freeze launch content and legal pages.

## Phase 2: Stabilize The Bu1ld Nexus

- Review and either commit or separate its existing uncommitted work.
- Run its release gate locally and against the target production environment.
- Verify Supabase phases, RLS, email/digest handlers, auth redirects, admin
  roles, and account deletion.
- Decide whether its existing docs are sufficient for launch operations.

## Phase 3: Shared Release Discipline

- Standardize release checklists across active products without forcing common
  architecture.
- Keep a reusable smoke-test script for visitor/member/admin journeys.
- Maintain product-specific data models and Supabase projects.
- Document incident owners, backup owners, and content approval owners per
  product.

## Phase 4: Cleanup

- Archive or label ObscuredRecordsAgent if it is not part of a product launch.
- Remove or restore missing VertexED workspace references.
- Remove stale generated artifacts from active launch workspaces.
