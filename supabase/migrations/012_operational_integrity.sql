-- Operational integrity, first-party telemetry, and member-content write boundaries.

-- ─── Idempotent weekly digests ───────────────────────────────────────────────

ALTER TABLE digest_send_log
  ADD COLUMN IF NOT EXISTS period_start DATE;

UPDATE digest_send_log
SET period_start = date_trunc('week', timezone('UTC', sent_at))::date
WHERE period_start IS NULL;

WITH ranked AS (
  SELECT id,
    row_number() OVER (
      PARTITION BY user_id, period_start
      ORDER BY CASE status WHEN 'sent' THEN 0 WHEN 'failed' THEN 1 ELSE 2 END, sent_at DESC
    ) AS row_number
  FROM digest_send_log
)
DELETE FROM digest_send_log
WHERE id IN (SELECT id FROM ranked WHERE row_number > 1);

ALTER TABLE digest_send_log
  ALTER COLUMN period_start SET DEFAULT date_trunc('week', timezone('UTC', now()))::date,
  ALTER COLUMN period_start SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS digest_send_log_user_period
  ON digest_send_log (user_id, period_start);

-- ─── Privacy-conscious, first-party product telemetry ───────────────────────

CREATE TABLE IF NOT EXISTS product_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_analytics_events_name_time
  ON product_analytics_events (event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS product_analytics_events_user_time
  ON product_analytics_events (user_id, occurred_at DESC);

ALTER TABLE product_analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin view product analytics" ON product_analytics_events;
CREATE POLICY "Admin view product analytics"
  ON product_analytics_events FOR SELECT TO authenticated
  USING ((SELECT is_admin()));

CREATE OR REPLACE FUNCTION track_product_event(
  p_event_name TEXT,
  p_properties JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_event_name NOT IN (
    'auth.onboarding_completed',
    'auth.sign_in',
    'auth.sign_out',
    'auth.sign_up',
    'contact.submit',
    'content.saved',
    'education.lesson_complete',
    'event.registered',
    'research.application_submitted'
  ) THEN
    RAISE EXCEPTION 'Unsupported analytics event';
  END IF;

  IF p_properties IS NULL OR jsonb_typeof(p_properties) <> 'object'
    OR octet_length(p_properties::text) > 2048 THEN
    RAISE EXCEPTION 'Invalid analytics properties';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_each(p_properties)
    WHERE key !~ '^[a-z][a-z0-9_]{0,39}$'
      OR jsonb_typeof(value) NOT IN ('string', 'number', 'boolean', 'null')
  ) THEN
    RAISE EXCEPTION 'Analytics properties must use short keys and scalar values';
  END IF;

  IF (
    SELECT count(*)
    FROM product_analytics_events
    WHERE user_id = (SELECT auth.uid())
      AND occurred_at >= now() - interval '1 day'
  ) >= 200 THEN
    RAISE EXCEPTION 'Analytics rate limit exceeded';
  END IF;

  INSERT INTO product_analytics_events (user_id, event_name, properties)
  VALUES ((SELECT auth.uid()), p_event_name, p_properties)
  RETURNING id INTO event_id;

  RETURN event_id;
END;
$$;

REVOKE ALL ON TABLE product_analytics_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE product_analytics_events TO authenticated;
REVOKE ALL ON FUNCTION track_product_event(TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION track_product_event(TEXT, JSONB) TO authenticated;

-- ─── Authenticated client error reporting ───────────────────────────────────

CREATE TABLE IF NOT EXISTS client_error_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  error_name TEXT NOT NULL,
  message TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_error_events_time
  ON client_error_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS client_error_events_user_time
  ON client_error_events (user_id, occurred_at DESC);

ALTER TABLE client_error_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin view client errors" ON client_error_events;
CREATE POLICY "Admin view client errors"
  ON client_error_events FOR SELECT TO authenticated
  USING ((SELECT is_admin()));

CREATE OR REPLACE FUNCTION report_client_error(
  p_error_name TEXT,
  p_message TEXT,
  p_tags JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  error_id UUID;
  clean_name TEXT := btrim(COALESCE(p_error_name, ''));
  clean_message TEXT := btrim(COALESCE(p_message, ''));
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF char_length(clean_name) NOT BETWEEN 1 AND 80
    OR char_length(clean_message) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'Invalid error report';
  END IF;

  IF p_tags IS NULL OR jsonb_typeof(p_tags) <> 'object'
    OR octet_length(p_tags::text) > 1024 THEN
    RAISE EXCEPTION 'Invalid error tags';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_each(p_tags)
    WHERE key !~ '^[a-z][a-z0-9_]{0,39}$'
      OR jsonb_typeof(value) NOT IN ('string', 'number', 'boolean', 'null')
  ) THEN
    RAISE EXCEPTION 'Error tags must use short keys and scalar values';
  END IF;

  IF (
    SELECT count(*)
    FROM client_error_events
    WHERE user_id = (SELECT auth.uid())
      AND occurred_at >= now() - interval '1 hour'
  ) >= 20 THEN
    RAISE EXCEPTION 'Error report rate limit exceeded';
  END IF;

  INSERT INTO client_error_events (user_id, error_name, message, tags)
  VALUES ((SELECT auth.uid()), clean_name, clean_message, p_tags)
  RETURNING id INTO error_id;

  RETURN error_id;
END;
$$;

REVOKE ALL ON TABLE client_error_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE client_error_events TO authenticated;
REVOKE ALL ON FUNCTION report_client_error(TEXT, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION report_client_error(TEXT, TEXT, JSONB) TO authenticated;

-- ─── Member-content write boundaries ────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (SELECT auth.uid()) IS NULL OR NEW.from_user_id <> (SELECT auth.uid()) THEN
      RAISE EXCEPTION 'Connections must be sent as the authenticated member';
    END IF;
    NEW.status := 'pending';
    NEW.message := NULLIF(btrim(NEW.message), '');
    IF char_length(COALESCE(NEW.message, '')) > 500 THEN
      RAISE EXCEPTION 'Connection message must be 500 characters or fewer';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.from_user_id IS DISTINCT FROM OLD.from_user_id
    OR NEW.to_user_id IS DISTINCT FROM OLD.to_user_id
    OR NEW.message IS DISTINCT FROM OLD.message
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Connection identity and message cannot be changed';
  END IF;

  IF OLD.to_user_id <> (SELECT auth.uid())
    OR OLD.status <> 'pending'
    OR NEW.status NOT IN ('accepted', 'declined') THEN
    RAISE EXCEPTION 'Only the recipient can accept or decline a pending connection';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_connection_request_write ON connection_requests;
CREATE TRIGGER validate_connection_request_write
  BEFORE INSERT OR UPDATE ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION validate_connection_request();

DROP POLICY IF EXISTS "Recipients respond to connections" ON connection_requests;
CREATE POLICY "Recipients respond to connections"
  ON connection_requests FOR UPDATE TO authenticated
  USING (to_user_id = (SELECT auth.uid()) AND status = 'pending')
  WITH CHECK (to_user_id = (SELECT auth.uid()) AND status IN ('accepted', 'declined'));

CREATE OR REPLACE FUNCTION validate_studio_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NEW.author_id <> (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Submission author must match the authenticated member';
  END IF;
  IF TG_OP = 'UPDATE' AND (
    NEW.id IS DISTINCT FROM OLD.id
    OR NEW.author_id IS DISTINCT FROM OLD.author_id
    OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
  ) THEN
    RAISE EXCEPTION 'Submission identity cannot be changed';
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.writeup := btrim(NEW.writeup);
  NEW.repo_url := NULLIF(btrim(NEW.repo_url), '');
  NEW.demo_url := NULLIF(btrim(NEW.demo_url), '');

  IF char_length(NEW.title) NOT BETWEEN 1 AND 160
    OR char_length(NEW.writeup) NOT BETWEEN 20 AND 5000 THEN
    RAISE EXCEPTION 'Studio title or write-up is outside the allowed length';
  END IF;
  IF (NEW.repo_url IS NOT NULL AND (char_length(NEW.repo_url) > 2048 OR NEW.repo_url !~* '^https://'))
    OR (NEW.demo_url IS NOT NULL AND (char_length(NEW.demo_url) > 2048 OR NEW.demo_url !~* '^https://')) THEN
    RAISE EXCEPTION 'Studio links must be secure HTTPS URLs';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_studio_submission_write ON studio_submissions;
CREATE TRIGGER validate_studio_submission_write
  BEFORE INSERT OR UPDATE ON studio_submissions
  FOR EACH ROW EXECUTE FUNCTION validate_studio_submission();

DROP POLICY IF EXISTS "Users update own studio submissions" ON studio_submissions;
CREATE POLICY "Users update own studio submissions"
  ON studio_submissions FOR UPDATE TO authenticated
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION validate_essay_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  caller_is_admin BOOLEAN := (SELECT is_admin());
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.author_id <> (SELECT auth.uid()) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Essay author must match the authenticated member';
    END IF;
    IF NOT caller_is_admin THEN
      NEW.is_editorial_pick := false;
    END IF;
  ELSE
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.author_id IS DISTINCT FROM OLD.author_id
      OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'Essay identity cannot be changed';
    END IF;
    IF OLD.author_id <> (SELECT auth.uid()) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only the author or an administrator can update this essay';
    END IF;
    IF NEW.is_editorial_pick IS DISTINCT FROM OLD.is_editorial_pick AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only an administrator can select an editorial pick';
    END IF;
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.body := btrim(NEW.body);
  IF char_length(NEW.title) NOT BETWEEN 1 AND 160
    OR char_length(NEW.body) NOT BETWEEN 100 AND 10000 THEN
    RAISE EXCEPTION 'Essay title or body is outside the allowed length';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_essay_submission_write ON essay_submissions;
CREATE TRIGGER validate_essay_submission_write
  BEFORE INSERT OR UPDATE ON essay_submissions
  FOR EACH ROW EXECUTE FUNCTION validate_essay_submission();

DROP POLICY IF EXISTS "Admin update essays" ON essay_submissions;
DROP POLICY IF EXISTS "Authors update own essays" ON essay_submissions;
CREATE POLICY "Authors update own essays"
  ON essay_submissions FOR UPDATE TO authenticated
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));
CREATE POLICY "Admin update essays"
  ON essay_submissions FOR UPDATE TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

CREATE OR REPLACE FUNCTION validate_introduction_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NEW.author_id <> (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Introduction author must match the authenticated member';
  END IF;
  NEW.headline := btrim(NEW.headline);
  NEW.looking_for := btrim(NEW.looking_for);
  NEW.interests := ARRAY(
    SELECT DISTINCT btrim(value)
    FROM unnest(COALESCE(NEW.interests, '{}')) AS value
    WHERE btrim(value) <> ''
    ORDER BY btrim(value)
  );
  IF char_length(NEW.headline) NOT BETWEEN 1 AND 160
    OR char_length(NEW.looking_for) NOT BETWEEN 1 AND 1000
    OR cardinality(NEW.interests) > 12
    OR EXISTS (SELECT 1 FROM unnest(NEW.interests) AS value WHERE char_length(value) > 40) THEN
    RAISE EXCEPTION 'Introduction content is outside the allowed length';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_introduction_post_write ON introduction_posts;
CREATE TRIGGER validate_introduction_post_write
  BEFORE INSERT ON introduction_posts
  FOR EACH ROW EXECUTE FUNCTION validate_introduction_post();

DROP POLICY IF EXISTS "Users manage own upvotes" ON essay_upvotes;
CREATE POLICY "Users manage own upvotes"
  ON essay_upvotes FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users manage own opportunity interests" ON opportunity_interests;
CREATE POLICY "Users manage own opportunity interests"
  ON opportunity_interests FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Trigger functions are internal implementation details, not Data API methods.
REVOKE ALL ON FUNCTION validate_connection_request() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION validate_studio_submission() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION validate_essay_submission() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION validate_introduction_post() FROM PUBLIC, anon, authenticated;
