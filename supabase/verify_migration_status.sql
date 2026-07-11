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
    'education_lesson_progress'
  )
ORDER BY kind, name;
