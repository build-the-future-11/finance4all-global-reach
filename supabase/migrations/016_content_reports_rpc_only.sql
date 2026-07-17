-- Harden content_reports: remove direct INSERT so rate limits cannot be bypassed
DROP POLICY IF EXISTS "Users insert own content reports" ON content_reports;
