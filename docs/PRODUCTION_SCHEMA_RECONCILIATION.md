# Production Schema Reconciliation

Observed and repaired on 2026-09-06 against Supabase project
`pnemeegkwyaicsbnbnmg`. The machine-readable receipt is
`evidence/production-schema-reconciliation-20260906.json`.

## Verified state

- The dashboard reports `No migrations`.
- `to_regclass('supabase_migrations.schema_migrations')` returns `NULL`.
- Every table and function from the original four migrations exists.
- RLS is enabled on every expected public table.
- `private.portal_schema_revisions` exists.
- The profile security triggers from abandoned commit
  `9539faadecc5d5c564b33e7610e02cbe1789f97c` exist in production.
- `education_lesson_progress` exists with owner-scoped RLS.
- The abandoned `contact_submissions` table and its public RPC functions do not
  exist.
- Nine tables from the same abandoned branch were partially created. Eight
  were public and empty; `education_lesson_progress` is the ninth and is
  retained because it came from a complete migration with a valid RLS contract.
- `private.legacy_rate_limit_events` contains three preserved telemetry rows.

The eight empty public tables are:

```text
digest_send_log
education_lessons
education_modules
resource_guides
resource_items
testimonials
webinars
weekly_goal_baselines
```

None is referenced by current application source. Migration
`20260906171941_archive_abandoned_public_tables.sql` moved them to `private`
with a `legacy_` prefix. It revoked public/member access and did not delete
tables or rows. Migration
`20260906172830_harden_recovered_profile_functions.sql` also pinned the
recovered trigger functions to an empty search path and removed browser-role
execution.

## Reconciliation procedure

Completed:

1. Both forward migrations executed in one production transaction and
   committed only after their assertions passed.
2. The post-repair audit found no missing expected public tables, no unexpected
   public tables, and no expected table with RLS disabled.
3. All eight archived tables and the three-row rate-limit table are present in
   `private` with `legacy_` names.
4. The hardened `sync_chapter_member_counts` function has an empty search path
   and is not executable by `authenticated`.

Still required from an authenticated Supabase CLI session:

1. Run `supabase migration list --linked` and retain the empty-ledger evidence.
2. Mark the ten proven versions as applied using only the documented command:

   ```bash
   supabase migration repair <version> --status applied
   ```

3. Run `supabase migration list --linked` again and require exact equality with
   `node scripts/verify-migration-ledger.mjs`.
4. Retain the source SHA, before/after lists, verifier receipt, and operator.

Do not insert directly into `supabase_migrations.schema_migrations`, and do not
re-run historical SQL merely to populate the ledger.

## Current blocker

The repository does not contain a Supabase access token or database password,
and it must not. Ledger repair therefore requires an authenticated operator CLI
session. Until the procedure above is completed, source history is recovered
but production migration-ledger certification remains incomplete.
