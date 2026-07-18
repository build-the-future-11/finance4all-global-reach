-- Expand first-party product analytics allowlist for FinanceMeta golden-journey instrumentation.

CREATE OR REPLACE FUNCTION track_product_event(
  p_event_name TEXT,
  p_properties JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
    'education.certificate_issued',
    'event.registered',
    'opportunity.interest_saved',
    'research.application_submitted',
    'research.application_decided'
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
    RAISE EXCEPTION 'Daily analytics limit reached';
  END IF;

  INSERT INTO product_analytics_events (user_id, event_name, properties)
  VALUES ((SELECT auth.uid()), p_event_name, p_properties)
  RETURNING id INTO event_id;

  RETURN event_id;
END;
$$;

REVOKE ALL ON FUNCTION track_product_event(TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION track_product_event(TEXT, JSONB) TO authenticated;
