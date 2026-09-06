# Production Schema Reconciliation

Observed on 2026-09-06 against Supabase project `pnemeegkwyaicsbnbnmg`.

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
  remain public and empty; `education_lesson_progress` is the ninth and is
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
`20260906171941_archive_abandoned_public_tables.sql` moves them to `private`
with a `legacy_` prefix. It revokes public/member access and does not delete
tables or rows.

## Reconciliation procedure

1. Apply `20260906171941_archive_abandoned_public_tables.sql` and
   `20260906172830_harden_recovered_profile_functions.sql` to the linked
   production project and retain the command output.
2. Re-run the read-only table, function, RLS, trigger, and row-count audit.
3. Run `supabase migration list --linked` and retain the empty-ledger evidence.
4. Mark the ten proven versions as applied using only the documented command:

   ```bash
   supabase migration repair <version> --status applied
   ```

5. Run `supabase migration list --linked` again and require exact equality with
   `node scripts/verify-migration-ledger.mjs`.
6. Retain the source SHA, before/after lists, verifier receipt, and operator.

Do not insert directly into `supabase_migrations.schema_migrations`, and do not
re-run historical SQL merely to populate the ledger.

## Current blocker

The repository does not contain a Supabase access token or database password,
and it must not. Ledger repair therefore requires an authenticated operator CLI
session. Until the procedure above is completed, source history is recovered
but production migration-ledger certification remains incomplete.
