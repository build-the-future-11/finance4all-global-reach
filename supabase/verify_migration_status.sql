-- Run this in Supabase SQL Editor to see what's already installed.
-- If user_role exists, you already ran 001 — skip to 002, 003, 004 + seed.

SELECT 'enums' AS kind, typname AS name
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
    'news_bookmarks', 'notifications'
  )
ORDER BY kind, name;
