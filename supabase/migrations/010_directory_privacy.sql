-- Keep account email and onboarding state out of the member directory.
-- Member-facing reads use the fixed-column view below; direct profile reads are
-- limited to the account owner or an administrator.

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins view profiles" ON profiles;
CREATE POLICY "Admins view profiles"
  ON profiles FOR SELECT TO authenticated
  USING (is_admin());

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
  AND NULLIF(trim(display_name), '') IS NOT NULL;

REVOKE ALL ON TABLE member_directory FROM anon;
GRANT SELECT ON TABLE member_directory TO authenticated;
