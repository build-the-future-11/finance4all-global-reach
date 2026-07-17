-- FinanceMeta / Finance4All RLS role-matrix verification (policy presence).
-- Run after FINAL_SETUP.sql + VERIFY_SETUP.sql.
-- This does NOT impersonate roles; it checks that expected policies exist.
-- Expected: every row ok = true.

WITH expected_policies(tablename, policyname) AS (
  VALUES
    ('profiles', 'Users view own profile'),
    ('profiles', 'Admins view profiles'),
    ('studio_submissions', 'Studios viewable'),
    ('studio_submissions', 'Admin update studio submissions'),
    ('essay_submissions', 'Essays viewable'),
    ('essay_submissions', 'Admin update essays'),
    ('member_certificates', 'Users read own certificates'),
    ('chapter_leaders', 'Chapter leaders readable'),
    ('chapter_leaders', 'Admin manage chapter leaders'),
    ('competitions', 'Open competitions readable'),
    ('competitions', 'Admin manage competitions'),
    ('approved_sources', 'Approved sources readable by authenticated'),
    ('news_articles', 'Published news viewable'),
    ('news_article_versions', 'Admin read article versions'),
    ('education_lesson_progress', 'Users manage own education progress')
),
policy_checks AS (
  SELECT
    'policy:' || tablename || ':' || policyname AS check_name,
    EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = expected_policies.tablename
        AND policyname = expected_policies.policyname
    ) AS ok
  FROM expected_policies
),
rls_enabled AS (
  SELECT
    'rls-enabled:' || c.relname AS check_name,
    c.relrowsecurity AS ok
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname IN (
      'profiles',
      'studio_submissions',
      'essay_submissions',
      'member_certificates',
      'chapter_leaders',
      'competitions',
      'approved_sources',
      'news_articles',
      'education_lesson_progress'
    )
)
SELECT * FROM policy_checks
UNION ALL
SELECT * FROM rls_enabled
ORDER BY check_name;
