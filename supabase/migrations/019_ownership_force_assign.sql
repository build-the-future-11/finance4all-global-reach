-- Force ownership columns from auth.uid() so clients cannot spoof another member.
-- Also add common query indexes and deep-link lab application received notifications.

-- ─── Shared owner assignment helpers ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION force_user_id_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  NEW.user_id := (SELECT auth.uid());
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION force_user_id_owner() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS force_news_bookmark_owner ON news_bookmarks;
CREATE TRIGGER force_news_bookmark_owner
  BEFORE INSERT ON news_bookmarks
  FOR EACH ROW EXECUTE FUNCTION force_user_id_owner();

DROP TRIGGER IF EXISTS force_project_bookmark_owner ON project_bookmarks;
CREATE TRIGGER force_project_bookmark_owner
  BEFORE INSERT ON project_bookmarks
  FOR EACH ROW EXECUTE FUNCTION force_user_id_owner();

DROP TRIGGER IF EXISTS force_opportunity_interest_owner ON opportunity_interests;
CREATE TRIGGER force_opportunity_interest_owner
  BEFORE INSERT ON opportunity_interests
  FOR EACH ROW EXECUTE FUNCTION force_user_id_owner();

DROP TRIGGER IF EXISTS force_essay_upvote_owner ON essay_upvotes;
CREATE TRIGGER force_essay_upvote_owner
  BEFORE INSERT ON essay_upvotes
  FOR EACH ROW EXECUTE FUNCTION force_user_id_owner();

DROP TRIGGER IF EXISTS force_education_progress_owner ON education_lesson_progress;
CREATE TRIGGER force_education_progress_owner
  BEFORE INSERT ON education_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION force_user_id_owner();

-- ─── Strengthen existing validators to assign, not only check ────────────────

CREATE OR REPLACE FUNCTION validate_lab_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  project research_projects%ROWTYPE;
BEGIN
  SELECT * INTO project FROM research_projects WHERE id = NEW.project_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Research project was not found';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF (SELECT auth.uid()) IS NULL THEN
      RAISE EXCEPTION 'Authentication required';
    END IF;
    NEW.applicant_id := (SELECT auth.uid());
    IF project.status <> 'open' THEN
      RAISE EXCEPTION 'This project is not accepting applications';
    END IF;
    IF project.application_deadline IS NOT NULL AND project.application_deadline <= now() THEN
      RAISE EXCEPTION 'The application deadline has passed';
    END IF;
    IF char_length(trim(NEW.motivation)) NOT BETWEEN 30 AND 3000 THEN
      RAISE EXCEPTION 'Motivation must be between 30 and 3000 characters';
    END IF;
    NEW.motivation := trim(NEW.motivation);
    RETURN NEW;
  END IF;

  IF NEW.project_id IS DISTINCT FROM OLD.project_id
     OR NEW.applicant_id IS DISTINCT FROM OLD.applicant_id
     OR NEW.motivation IS DISTINCT FROM OLD.motivation
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
    RAISE EXCEPTION 'Application ownership and submission details cannot be changed';
  END IF;

  IF NOT is_admin() AND project.lead_researcher_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the project lead may review this application';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status NOT IN ('pending', 'under_review')
       OR NEW.status NOT IN ('under_review', 'accepted', 'rejected') THEN
      RAISE EXCEPTION 'Invalid application status transition';
    END IF;
    NEW.reviewer_id := auth.uid();
    NEW.reviewed_at := now();
  ELSIF NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id
     OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at THEN
    RAISE EXCEPTION 'Review metadata is managed by the server';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_event_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  target_event events%ROWTYPE;
  registration_count INT;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  NEW.user_id := (SELECT auth.uid());

  SELECT * INTO target_event FROM events WHERE id = NEW.event_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event was not found';
  END IF;
  IF target_event.status <> 'upcoming' OR target_event.starts_at <= now() THEN
    RAISE EXCEPTION 'Registration is closed for this event';
  END IF;
  IF target_event.registration_opens_at IS NOT NULL AND target_event.registration_opens_at > now() THEN
    RAISE EXCEPTION 'Registration has not opened yet';
  END IF;
  IF target_event.registration_closes_at IS NOT NULL AND target_event.registration_closes_at <= now() THEN
    RAISE EXCEPTION 'Registration is closed for this event';
  END IF;
  IF target_event.registration_capacity IS NOT NULL THEN
    SELECT COUNT(*)::INT INTO registration_count
    FROM event_registrations
    WHERE event_id = NEW.event_id;
    IF registration_count >= target_event.registration_capacity THEN
      RAISE EXCEPTION 'This event is at capacity';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (SELECT auth.uid()) IS NULL THEN
      RAISE EXCEPTION 'Connections must be sent as the authenticated member';
    END IF;
    NEW.from_user_id := (SELECT auth.uid());
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

CREATE OR REPLACE FUNCTION validate_studio_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_is_admin BOOLEAN := (SELECT is_admin());
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT caller_is_admin THEN
      NEW.author_id := (SELECT auth.uid());
      NEW.status := 'pending';
      NEW.moderated_at := NULL;
      NEW.moderated_by := NULL;
      NEW.moderation_note := NULL;
    ELSIF NEW.author_id IS NULL THEN
      NEW.author_id := (SELECT auth.uid());
    END IF;
  ELSE
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.author_id IS DISTINCT FROM OLD.author_id
      OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'Studio identity cannot be changed';
    END IF;
    IF OLD.author_id <> (SELECT auth.uid()) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only the author or an administrator can update this studio submission';
    END IF;
    IF (
      NEW.status IS DISTINCT FROM OLD.status
      OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
      OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
      OR NEW.moderation_note IS DISTINCT FROM OLD.moderation_note
    ) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only an administrator can moderate studio submissions';
    END IF;
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
  IF NEW.moderation_note IS NOT NULL THEN
    NEW.moderation_note := btrim(NEW.moderation_note);
    IF char_length(NEW.moderation_note) > 1000 THEN
      RAISE EXCEPTION 'Moderation note is too long';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_essay_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_is_admin BOOLEAN := (SELECT is_admin());
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT caller_is_admin THEN
      NEW.author_id := (SELECT auth.uid());
      NEW.is_editorial_pick := false;
      NEW.status := 'pending';
      NEW.moderated_at := NULL;
      NEW.moderated_by := NULL;
      NEW.moderation_note := NULL;
    ELSIF NEW.author_id IS NULL THEN
      NEW.author_id := (SELECT auth.uid());
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
    IF (
      NEW.status IS DISTINCT FROM OLD.status
      OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
      OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
      OR NEW.moderation_note IS DISTINCT FROM OLD.moderation_note
    ) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only an administrator can moderate essays';
    END IF;
    IF NEW.status IS DISTINCT FROM 'approved' THEN
      NEW.is_editorial_pick := false;
    END IF;
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.body := btrim(NEW.body);
  IF char_length(NEW.title) NOT BETWEEN 1 AND 160
    OR char_length(NEW.body) NOT BETWEEN 100 AND 10000 THEN
    RAISE EXCEPTION 'Essay title or body is outside the allowed length';
  END IF;
  IF NEW.moderation_note IS NOT NULL THEN
    NEW.moderation_note := btrim(NEW.moderation_note);
    IF char_length(NEW.moderation_note) > 1000 THEN
      RAISE EXCEPTION 'Moderation note is too long';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_introduction_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Introduction author must match the authenticated member';
  END IF;
  NEW.author_id := (SELECT auth.uid());
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

-- ─── Lab lead notification deep-link ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_lab_application_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  applicant_name TEXT;
  project_title TEXT;
  lead_id UUID;
BEGIN
  SELECT display_name INTO applicant_name FROM profiles WHERE id = NEW.applicant_id;
  SELECT title, lead_researcher_id INTO project_title, lead_id
    FROM research_projects WHERE id = NEW.project_id;

  IF lead_id IS NOT NULL AND lead_id <> NEW.applicant_id THEN
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      lead_id,
      'lab_application_received',
      'New lab application',
      COALESCE(applicant_name, 'A member') || ' applied to "' || COALESCE(project_title, 'your project') || '".',
      '/portal/labs/review?project=' || NEW.project_id::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Keep status notifications on the deep-linked project detail path.
CREATE OR REPLACE FUNCTION notify_lab_application_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  project_title TEXT;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('accepted', 'rejected', 'under_review') THEN
    SELECT title INTO project_title FROM research_projects WHERE id = NEW.project_id;
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      NEW.applicant_id,
      'lab_application_status',
      'Application update',
      'Your application to "' || COALESCE(project_title, 'a project') || '" is now ' ||
        replace(NEW.status::text, '_', ' ') || '.',
      '/portal/labs/' || NEW.project_id::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$;

-- ─── Indexes for common ownership / dashboard queries ────────────────────────

CREATE INDEX IF NOT EXISTS opportunity_interests_user
  ON opportunity_interests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS news_bookmarks_user
  ON news_bookmarks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS project_bookmarks_user
  ON project_bookmarks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS event_registrations_user
  ON event_registrations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lab_applications_applicant
  ON lab_applications (applicant_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS essay_upvotes_user
  ON essay_upvotes (user_id, created_at DESC);
