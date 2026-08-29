-- FinanceMeta release patch for migrations newer than the consolidated FINAL_SETUP.sql.
-- Apply immediately after supabase/FINAL_SETUP.sql when using the SQL Editor path.
-- Preferred production path remains `supabase db push`, which applies every migration in order.

-- ============================================================
-- 022_directory_visibility.sql
-- ============================================================
-- Member-directory privacy: only profiles explicitly open to collaboration are
-- discoverable by other members. A member can always resolve their own profile,
-- and administrators retain directory access for moderation/support.

CREATE OR REPLACE VIEW member_directory
WITH (security_invoker = false)
AS
SELECT
  id,
  display_name,
  role,
  bio,
  avatar_url,
  interests,
  open_to_collaborate,
  chapter_id,
  created_at,
  updated_at
FROM profiles
WHERE onboarding_completed_at IS NOT NULL
  AND NULLIF(trim(display_name), '') IS NOT NULL
  AND (
    open_to_collaborate = true
    OR id = (SELECT auth.uid())
    OR COALESCE((SELECT is_admin()), false)
  );

REVOKE ALL ON TABLE member_directory FROM PUBLIC, anon;
GRANT SELECT ON TABLE member_directory TO authenticated;
