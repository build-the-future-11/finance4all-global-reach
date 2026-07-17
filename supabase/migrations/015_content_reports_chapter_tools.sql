-- Finisher: content reports (youth-safety/spam) + chapter-leader helper view

DO $$ BEGIN
  CREATE TYPE content_report_target AS ENUM (
    'studio',
    'essay',
    'introduction',
    'news',
    'profile',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_report_status AS ENUM (
    'open',
    'reviewing',
    'resolved',
    'dismissed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type content_report_target NOT NULL,
  target_id UUID,
  reason TEXT NOT NULL,
  details TEXT,
  status content_report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolution_note TEXT,
  CONSTRAINT content_reports_reason_len CHECK (char_length(btrim(reason)) BETWEEN 3 AND 120),
  CONSTRAINT content_reports_details_len CHECK (details IS NULL OR char_length(details) <= 2000)
);

CREATE INDEX IF NOT EXISTS content_reports_status_created
  ON content_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS content_reports_reporter
  ON content_reports (reporter_id, created_at DESC);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own content reports" ON content_reports;
CREATE POLICY "Users insert own content reports"
  ON content_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users read own content reports" ON content_reports;
CREATE POLICY "Users read own content reports"
  ON content_reports FOR SELECT TO authenticated
  USING (reporter_id = (SELECT auth.uid()) OR (SELECT is_admin()));

DROP POLICY IF EXISTS "Admin update content reports" ON content_reports;
CREATE POLICY "Admin update content reports"
  ON content_reports FOR UPDATE TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

CREATE OR REPLACE FUNCTION submit_content_report(
  p_target_type content_report_target,
  p_reason TEXT,
  p_target_id UUID DEFAULT NULL,
  p_details TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := (SELECT auth.uid());
  new_id UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT check_rate_limit('content_report', uid::text, 10, 3600) THEN
    RAISE EXCEPTION 'Too many reports. Please try again later.';
  END IF;
  PERFORM record_rate_limit('content_report', uid::text);

  INSERT INTO content_reports (reporter_id, target_type, target_id, reason, details)
  VALUES (
    uid,
    p_target_type,
    p_target_id,
    btrim(p_reason),
    NULLIF(btrim(COALESCE(p_details, '')), '')
  )
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION resolve_content_report(
  p_id UUID,
  p_status content_report_status,
  p_note TEXT DEFAULT NULL
)
RETURNS content_reports
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result content_reports;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  IF p_status NOT IN ('reviewing', 'resolved', 'dismissed') THEN
    RAISE EXCEPTION 'Invalid resolution status';
  END IF;
  UPDATE content_reports
  SET
    status = p_status,
    resolved_at = CASE WHEN p_status IN ('resolved', 'dismissed') THEN now() ELSE resolved_at END,
    resolved_by = (SELECT auth.uid()),
    resolution_note = NULLIF(btrim(COALESCE(p_note, '')), '')
  WHERE id = p_id
  RETURNING * INTO result;
  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Report not found';
  END IF;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_content_report(content_report_target, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_content_report(UUID, content_report_status, TEXT) TO authenticated;

-- Chapter leaders can read a compact activity snapshot for their chapters
CREATE OR REPLACE FUNCTION my_chapter_leader_snapshot()
RETURNS TABLE (
  chapter_id UUID,
  chapter_name TEXT,
  city TEXT,
  country TEXT,
  member_count INTEGER,
  leader_role chapter_leader_role,
  upcoming_events INTEGER,
  open_competitions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  uid UUID := (SELECT auth.uid());
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.city,
    c.country,
    c.member_count,
    cl.role,
    (
      SELECT COUNT(*)::INTEGER
      FROM events e
      WHERE e.chapter_id = c.id
        AND e.status IN ('upcoming', 'live')
        AND e.starts_at >= now() - INTERVAL '1 day'
    ),
    (
      SELECT COUNT(*)::INTEGER
      FROM competitions comp
      WHERE comp.chapter_id = c.id
        AND comp.status = 'open'
    )
  FROM chapter_leaders cl
  JOIN chapters c ON c.id = cl.chapter_id
  WHERE cl.user_id = uid;
END;
$$;

GRANT EXECUTE ON FUNCTION my_chapter_leader_snapshot() TO authenticated;
