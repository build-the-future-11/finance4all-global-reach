-- Run this in Supabase SQL Editor to see what's already installed.

SELECT 'enum' AS kind, typname AS name
FROM pg_type
WHERE typname IN (
  'user_role', 'news_category', 'notification_type',
  'research_project_status', 'lab_application_status'
)
UNION ALL
SELECT 'table', tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'chapters', 'news_articles', 'research_projects',
    'news_bookmarks', 'notifications', 'contact_submissions',
    'education_lesson_progress', 'rate_limit_events', 'explainer_cards',
    'opportunities', 'events', 'event_registrations'
  )
ORDER BY kind, name;

SELECT 'view' AS kind, table_name AS name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name = 'member_directory';

SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'ensure_my_profile', 'complete_profile_onboarding',
    'update_my_profile', 'set_my_avatar', 'submit_contact_submission',
    'validate_event_registration'
  )
ORDER BY routine_name;
