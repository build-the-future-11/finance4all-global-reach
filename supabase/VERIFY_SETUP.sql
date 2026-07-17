-- FinanceMeta / Finance4All production setup verification.
-- Run after supabase/FINAL_SETUP.sql or after applying migrations 001-014.
-- Expected result: every row has ok = true.

WITH expected_tables(name) AS (
  VALUES
    ('profiles'),
    ('chapters'),
    ('events'),
    ('event_registrations'),
    ('news_articles'),
    ('explainer_cards'),
    ('digest_preferences'),
    ('research_projects'),
    ('lab_applications'),
    ('opportunities'),
    ('opportunity_interests'),
    ('studio_submissions'),
    ('essay_submissions'),
    ('essay_upvotes'),
    ('introduction_posts'),
    ('connection_requests'),
    ('news_bookmarks'),
    ('project_bookmarks'),
    ('notifications'),
    ('education_modules'),
    ('education_lessons'),
    ('education_lesson_progress'),
    ('resource_items'),
    ('resource_guides'),
    ('webinars'),
    ('testimonials'),
    ('weekly_goal_baselines'),
    ('digest_send_log'),
    ('contact_submissions'),
    ('rate_limit_events'),
    ('product_analytics_events'),
    ('client_error_events'),
    ('approved_sources'),
    ('news_article_versions'),
    ('debrief_ai_generation_logs'),
    ('member_certificates'),
    ('chapter_leaders'),
    ('competitions')
),
table_checks AS (
  SELECT
    'table:' || name AS check_name,
    EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = expected_tables.name
    ) AS ok
  FROM expected_tables
),
expected_columns(table_name, column_name) AS (
  VALUES
    ('profiles', 'id'),
    ('profiles', 'email'),
    ('profiles', 'role'),
    ('profiles', 'onboarding_completed_at'),
    ('profiles', 'updated_at'),
    ('research_projects', 'lead_researcher_id'),
    ('research_projects', 'status'),
    ('research_projects', 'application_deadline'),
    ('lab_applications', 'applicant_id'),
    ('lab_applications', 'project_id'),
    ('lab_applications', 'status'),
    ('events', 'registration_opens_at'),
    ('events', 'registration_closes_at'),
    ('events', 'registration_capacity'),
    ('event_registrations', 'user_id'),
    ('event_registrations', 'event_id'),
    ('education_lesson_progress', 'user_id'),
    ('education_lesson_progress', 'lesson_id'),
    ('contact_submissions', 'email'),
    ('product_analytics_events', 'event_name'),
    ('client_error_events', 'message'),
    ('digest_send_log', 'user_id'),
    ('digest_send_log', 'period_start'),
    ('studio_submissions', 'status'),
    ('essay_submissions', 'status'),
    ('member_certificates', 'verification_code'),
    ('chapter_leaders', 'role'),
    ('competitions', 'status')
),
column_checks AS (
  SELECT
    'column:' || table_name || '.' || column_name AS check_name,
    EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = expected_columns.table_name
        AND column_name = expected_columns.column_name
    ) AS ok
  FROM expected_columns
),
rls_checks AS (
  SELECT
    'rls:' || name AS check_name,
    EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = expected_tables.name
        AND c.relrowsecurity
    ) AS ok
  FROM expected_tables
),
expected_policy_tables(name) AS (
  VALUES
    ('profiles'),
    ('chapters'),
    ('events'),
    ('event_registrations'),
    ('news_articles'),
    ('research_projects'),
    ('lab_applications'),
    ('opportunities'),
    ('opportunity_interests'),
    ('notifications'),
    ('education_lesson_progress'),
    ('contact_submissions'),
    ('product_analytics_events'),
    ('client_error_events'),
    ('studio_submissions'),
    ('essay_submissions'),
    ('member_certificates'),
    ('chapter_leaders'),
    ('competitions')
),
policy_table_checks AS (
  SELECT
    'policy-table:' || name AS check_name,
    EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = expected_policy_tables.name
    ) AS ok
  FROM expected_policy_tables
),
expected_indexes(name) AS (
  VALUES
    ('notifications_user_created'),
    ('notifications_user_unread'),
    ('education_lesson_progress_user'),
    ('contact_submissions_status_created'),
    ('rate_limit_lookup'),
    ('research_projects_open_deadline'),
    ('lab_applications_project_submitted'),
    ('events_status_starts_at'),
    ('event_registrations_event'),
    ('news_articles_published_at'),
    ('opportunities_active_deadline'),
    ('digest_send_log_user_period'),
    ('product_analytics_events_name_time'),
    ('product_analytics_events_user_time'),
    ('client_error_events_time'),
    ('client_error_events_user_time')
),
index_checks AS (
  SELECT
    'index:' || name AS check_name,
    EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname = expected_indexes.name
    ) AS ok
  FROM expected_indexes
),
expected_triggers(name) AS (
  VALUES
    ('on_auth_user_created'),
    ('profiles_updated_at'),
    ('research_projects_updated_at'),
    ('profiles_chapter_member_count'),
    ('profiles_enforce_insert_role'),
    ('profiles_protect_role'),
    ('lab_applications_validate'),
    ('event_registrations_validate'),
    ('validate_connection_request_write'),
    ('validate_studio_submission_write'),
    ('validate_essay_submission_write'),
    ('validate_introduction_post_write')
),
trigger_checks AS (
  SELECT
    'trigger:' || name AS check_name,
    EXISTS (
      SELECT 1
      FROM pg_trigger t
      WHERE NOT t.tgisinternal
        AND t.tgname = expected_triggers.name
    ) AS ok
  FROM expected_triggers
),
expected_functions(name) AS (
  VALUES
    ('handle_new_user'),
    ('get_user_role'),
    ('is_admin'),
    ('is_lead_or_admin'),
    ('ensure_my_profile'),
    ('complete_profile_onboarding'),
    ('update_my_profile'),
    ('set_my_avatar'),
    ('submit_contact_submission'),
    ('validate_event_registration'),
    ('check_rate_limit'),
    ('record_rate_limit'),
    ('portal_search'),
    ('track_product_event'),
    ('report_client_error'),
    ('purge_operational_events'),
    ('publish_news_article'),
    ('transition_news_article_status'),
    ('record_news_article_version'),
    ('queue_debrief_ai_generation'),
    ('enforce_news_article_publish_rules'),
    ('moderate_studio_submission'),
    ('moderate_essay_submission'),
    ('issue_my_curriculum_certificate'),
    ('appoint_chapter_leader'),
    ('remove_chapter_leader')
),
function_checks AS (
  SELECT
    'function:' || name AS check_name,
    EXISTS (
      SELECT 1
      FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name = expected_functions.name
    ) AS ok
  FROM expected_functions
),
expected_function_grants(name) AS (
  VALUES
    ('ensure_my_profile'),
    ('complete_profile_onboarding'),
    ('update_my_profile'),
    ('set_my_avatar'),
    ('submit_contact_submission'),
    ('portal_search'),
    ('track_product_event'),
    ('report_client_error'),
    ('publish_news_article'),
    ('transition_news_article_status'),
    ('queue_debrief_ai_generation'),
    ('moderate_studio_submission'),
    ('moderate_essay_submission'),
    ('issue_my_curriculum_certificate'),
    ('appoint_chapter_leader'),
    ('remove_chapter_leader')
),
function_grant_checks AS (
  SELECT
    'function-grant:authenticated:' || name AS check_name,
    EXISTS (
      SELECT 1
      FROM information_schema.routine_privileges
      WHERE routine_schema = 'public'
        AND routine_name = expected_function_grants.name
        AND grantee = 'authenticated'
        AND privilege_type = 'EXECUTE'
    ) AS ok
  FROM expected_function_grants
),
view_checks AS (
  SELECT
    'view:member_directory' AS check_name,
    EXISTS (
      SELECT 1
      FROM information_schema.views
      WHERE table_schema = 'public'
        AND table_name = 'member_directory'
    ) AS ok
),
storage_checks AS (
  SELECT
    'storage:avatars bucket' AS check_name,
    EXISTS (
      SELECT 1
      FROM storage.buckets
      WHERE id = 'avatars'
        AND public = true
    ) AS ok
),
storage_policy_checks AS (
  SELECT
    'storage-policy:avatars >= 4' AS check_name,
    (
      SELECT count(*) >= 4
      FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname IN (
          'Public avatar read',
          'Users upload own avatar',
          'Users update own avatar',
          'Users delete own avatar'
        )
    ) AS ok
),
policy_count_check AS (
  SELECT
    'policy-count:public >= 55' AS check_name,
    (
      SELECT count(*) >= 55
      FROM pg_policies
      WHERE schemaname = 'public'
    ) AS ok
),
anon_service_check AS (
  SELECT
    'security:member_directory view exists without email' AS check_name,
    EXISTS (
      SELECT 1
      FROM information_schema.views
      WHERE table_schema = 'public'
        AND table_name = 'member_directory'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'member_directory'
        AND column_name = 'email'
    ) AS ok
)
SELECT * FROM table_checks
UNION ALL SELECT * FROM column_checks
UNION ALL SELECT * FROM rls_checks
UNION ALL SELECT * FROM policy_table_checks
UNION ALL SELECT * FROM index_checks
UNION ALL SELECT * FROM trigger_checks
UNION ALL SELECT * FROM function_checks
UNION ALL SELECT * FROM function_grant_checks
UNION ALL SELECT * FROM view_checks
UNION ALL SELECT * FROM storage_checks
UNION ALL SELECT * FROM storage_policy_checks
UNION ALL SELECT * FROM policy_count_check
UNION ALL SELECT * FROM anon_service_check
ORDER BY check_name;
