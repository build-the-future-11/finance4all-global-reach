-- Lock notification content updates, force project/competition ownership,
-- index connection inboxes, and notify authors on studio/essay moderation.

-- ─── Notification content freeze (read flag only) ────────────────────────────

CREATE OR REPLACE FUNCTION protect_notification_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.user_id IS DISTINCT FROM OLD.user_id
    OR NEW.type IS DISTINCT FROM OLD.type
    OR NEW.title IS DISTINCT FROM OLD.title
    OR NEW.body IS DISTINCT FROM OLD.body
    OR NEW.link IS DISTINCT FROM OLD.link
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only the read flag can be updated on notifications';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION protect_notification_content() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_notification_content_write ON notifications;
CREATE TRIGGER protect_notification_content_write
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION protect_notification_content();

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Research project lead ownership ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_research_project_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.lead_researcher_id := (SELECT auth.uid());
    RETURN NEW;
  END IF;

  IF NEW.lead_researcher_id IS DISTINCT FROM OLD.lead_researcher_id
     AND NOT COALESCE((SELECT is_admin()), false) THEN
    RAISE EXCEPTION 'Only an administrator can transfer project leadership';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION validate_research_project_ownership() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS research_projects_validate_ownership ON research_projects;
CREATE TRIGGER research_projects_validate_ownership
  BEFORE INSERT OR UPDATE ON research_projects
  FOR EACH ROW EXECUTE FUNCTION validate_research_project_ownership();

-- ─── Competition audit trail ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_competition_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.created_by := (SELECT auth.uid());
  ELSE
    NEW.created_by := OLD.created_by;
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.description := btrim(NEW.description);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION validate_competition_audit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS competitions_validate_audit ON competitions;
CREATE TRIGGER competitions_validate_audit
  BEFORE INSERT OR UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION validate_competition_audit();

-- ─── Connection request indexes ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS connection_requests_to_user
  ON connection_requests (to_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS connection_requests_from_user
  ON connection_requests (from_user_id, created_at DESC);

-- ─── Moderation status notifications ─────────────────────────────────────────

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'studio_submission_status';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'essay_submission_status';

CREATE OR REPLACE FUNCTION moderate_studio_submission(
  p_id UUID,
  p_status submission_moderation_status,
  p_note TEXT DEFAULT NULL
)
RETURNS studio_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result studio_submissions;
  previous_status submission_moderation_status;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  SELECT status INTO previous_status FROM studio_submissions WHERE id = p_id;
  IF previous_status IS NULL THEN
    RAISE EXCEPTION 'Studio submission not found';
  END IF;

  UPDATE studio_submissions
  SET
    status = p_status,
    moderated_at = now(),
    moderated_by = (SELECT auth.uid()),
    moderation_note = NULLIF(btrim(COALESCE(p_note, '')), '')
  WHERE id = p_id
  RETURNING * INTO result;

  IF result.status IS DISTINCT FROM previous_status
     AND result.status IN ('approved', 'rejected') THEN
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      result.author_id,
      'studio_submission_status',
      'Studio submission update',
      'Your studio submission "' || result.title || '" was ' || result.status::text || '.',
      '/portal/pathways/studios'
    );
  END IF;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION moderate_essay_submission(
  p_id UUID,
  p_status submission_moderation_status,
  p_note TEXT DEFAULT NULL,
  p_editorial_pick BOOLEAN DEFAULT NULL
)
RETURNS essay_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result essay_submissions;
  previous_status submission_moderation_status;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  SELECT status INTO previous_status FROM essay_submissions WHERE id = p_id;
  IF previous_status IS NULL THEN
    RAISE EXCEPTION 'Essay submission not found';
  END IF;

  UPDATE essay_submissions
  SET
    status = p_status,
    moderated_at = now(),
    moderated_by = (SELECT auth.uid()),
    moderation_note = NULLIF(btrim(COALESCE(p_note, '')), ''),
    is_editorial_pick = CASE
      WHEN p_status <> 'approved' THEN false
      WHEN p_editorial_pick IS NULL THEN is_editorial_pick
      ELSE p_editorial_pick
    END
  WHERE id = p_id
  RETURNING * INTO result;

  IF result.status IS DISTINCT FROM previous_status
     AND result.status IN ('approved', 'rejected') THEN
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      result.author_id,
      'essay_submission_status',
      'Essay submission update',
      'Your essay "' || result.title || '" was ' || result.status::text || '.',
      '/portal/pathways/essays'
    );
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION moderate_studio_submission(UUID, submission_moderation_status, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION moderate_essay_submission(UUID, submission_moderation_status, TEXT, BOOLEAN) TO authenticated;
