-- FinanceMeta supplemental release verification for post-021 migrations.
-- Run after FINAL_SETUP_PATCH.sql or `supabase db push`.
-- Expected result: every row has ok = true.

WITH checks AS (
  SELECT
    'view:member_directory exists'::text AS check_name,
    to_regclass('public.member_directory') IS NOT NULL AS ok

  UNION ALL

  SELECT
    'view:member_directory filters collaboration visibility',
    COALESCE(
      pg_get_viewdef('public.member_directory'::regclass, true) ILIKE '%open_to_collaborate%'
      AND pg_get_viewdef('public.member_directory'::regclass, true) ILIKE '%auth.uid()%'
      AND pg_get_viewdef('public.member_directory'::regclass, true) ILIKE '%is_admin()%'
    , false)

  UNION ALL

  SELECT
    'view:member_directory excludes email',
    COALESCE(pg_get_viewdef('public.member_directory'::regclass, true) NOT ILIKE '%email%', false)

  UNION ALL

  SELECT
    'view:member_directory anon select revoked',
    NOT has_table_privilege('anon', 'public.member_directory', 'SELECT')

  UNION ALL

  SELECT
    'view:member_directory authenticated select granted',
    has_table_privilege('authenticated', 'public.member_directory', 'SELECT')
)
SELECT * FROM checks ORDER BY check_name;
