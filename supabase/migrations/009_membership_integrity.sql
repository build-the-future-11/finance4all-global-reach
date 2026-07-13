-- Membership integrity: server-enforced lifecycle, ownership, and public-write rules.
-- This migration is additive and safe for existing populated environments.

-- ─── Profiles and onboarding ────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Existing members with a completed profile should not be forced through a new
-- onboarding flow just because this field did not exist when they joined.
UPDATE profiles
SET onboarding_completed_at = COALESCE(onboarding_completed_at, now())
WHERE NULLIF(trim(display_name), '') IS NOT NULL;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1),
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- A recovery path for historical accounts where the auth trigger was absent.
-- It deliberately derives identity fields from auth.users, not browser input.
CREATE OR REPLACE FUNCTION ensure_my_profile()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auth_user auth.users%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO auth_user FROM auth.users WHERE id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Authenticated user was not found';
  END IF;

  INSERT INTO profiles (id, email, display_name, avatar_url)
  VALUES (
    auth_user.id,
    COALESCE(auth_user.email, ''),
    COALESCE(
      auth_user.raw_user_meta_data->>'display_name',
      auth_user.raw_user_meta_data->>'full_name',
      auth_user.raw_user_meta_data->>'name',
      split_part(COALESCE(auth_user.email, ''), '@', 1),
      ''
    ),
    COALESCE(
      auth_user.raw_user_meta_data->>'avatar_url',
      auth_user.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION complete_profile_onboarding(
  p_display_name TEXT,
  p_bio TEXT DEFAULT NULL,
  p_interests TEXT[] DEFAULT '{}',
  p_open_to_collaborate BOOLEAN DEFAULT FALSE,
  p_chapter_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_name TEXT := trim(p_display_name);
  clean_bio TEXT := NULLIF(trim(COALESCE(p_bio, '')), '');
  clean_interests TEXT[] := ARRAY(
    SELECT DISTINCT trim(interest)
    FROM unnest(COALESCE(p_interests, '{}')) AS interest
    WHERE trim(interest) <> ''
  );
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF char_length(clean_name) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Display name must be between 1 and 120 characters';
  END IF;
  IF clean_bio IS NOT NULL AND char_length(clean_bio) > 1000 THEN
    RAISE EXCEPTION 'Bio must be 1000 characters or fewer';
  END IF;
  IF cardinality(clean_interests) > 12
     OR EXISTS (SELECT 1 FROM unnest(clean_interests) AS interest WHERE char_length(interest) > 40) THEN
    RAISE EXCEPTION 'Choose up to 12 interests of 40 characters or fewer';
  END IF;
  IF p_chapter_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM chapters WHERE id = p_chapter_id) THEN
    RAISE EXCEPTION 'Selected chapter was not found';
  END IF;

  UPDATE profiles
  SET display_name = clean_name,
      bio = clean_bio,
      interests = clean_interests,
      open_to_collaborate = COALESCE(p_open_to_collaborate, false),
      chapter_id = p_chapter_id,
      onboarding_completed_at = COALESCE(onboarding_completed_at, now())
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile was not found';
  END IF;
END;
$$;

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
GRANT EXECUTE ON FUNCTION ensure_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION complete_profile_onboarding(TEXT, TEXT, TEXT[], BOOLEAN, UUID) TO authenticated;

-- ─── Research applications ─────────────────────────────────────────────────

ALTER TABLE lab_applications
  ADD CONSTRAINT lab_applications_motivation_length
  CHECK (char_length(trim(motivation)) BETWEEN 30 AND 3000) NOT VALID;

CREATE OR REPLACE FUNCTION validate_lab_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project research_projects%ROWTYPE;
BEGIN
  SELECT * INTO project FROM research_projects WHERE id = NEW.project_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Research project was not found';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.applicant_id <> auth.uid() THEN
      RAISE EXCEPTION 'Applications must belong to the signed-in member';
    END IF;
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

DROP TRIGGER IF EXISTS lab_applications_validate ON lab_applications;
CREATE TRIGGER lab_applications_validate
  BEFORE INSERT OR UPDATE ON lab_applications
  FOR EACH ROW EXECUTE FUNCTION validate_lab_application();

DROP POLICY IF EXISTS "Members apply to projects" ON lab_applications;
CREATE POLICY "Members apply to open projects" ON lab_applications FOR INSERT TO authenticated
  WITH CHECK (applicant_id = auth.uid());

DROP POLICY IF EXISTS "Leads review applications" ON lab_applications;
CREATE POLICY "Leads review applications" ON lab_applications FOR UPDATE TO authenticated
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_id AND rp.lead_researcher_id = auth.uid()
    )
  )
  WITH CHECK (
    is_admin() OR EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_id AND rp.lead_researcher_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS research_projects_open_deadline
  ON research_projects (status, application_deadline);
CREATE INDEX IF NOT EXISTS lab_applications_project_submitted
  ON lab_applications (project_id, submitted_at DESC);

-- ─── Event and competition registration ────────────────────────────────────

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS registration_opens_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registration_closes_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registration_capacity INT;

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_valid_times;
ALTER TABLE events ADD CONSTRAINT events_valid_times
  CHECK (ends_at IS NULL OR ends_at >= starts_at) NOT VALID;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_valid_registration_window;
ALTER TABLE events ADD CONSTRAINT events_valid_registration_window
  CHECK (
    registration_opens_at IS NULL
    OR registration_closes_at IS NULL
    OR registration_opens_at <= registration_closes_at
  ) NOT VALID;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_valid_registration_capacity;
ALTER TABLE events ADD CONSTRAINT events_valid_registration_capacity
  CHECK (registration_capacity IS NULL OR registration_capacity > 0) NOT VALID;

CREATE OR REPLACE FUNCTION validate_event_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_event events%ROWTYPE;
  registration_count INT;
BEGIN
  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Registrations must belong to the signed-in member';
  END IF;

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

DROP TRIGGER IF EXISTS event_registrations_validate ON event_registrations;
CREATE TRIGGER event_registrations_validate
  BEFORE INSERT ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION validate_event_registration();

DROP POLICY IF EXISTS "Users manage own event registrations" ON event_registrations;
CREATE POLICY "Users manage own event registrations" ON event_registrations FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS events_status_starts_at ON events (status, starts_at);
CREATE INDEX IF NOT EXISTS event_registrations_event ON event_registrations (event_id);

-- ─── Published member content ──────────────────────────────────────────────

ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

DROP POLICY IF EXISTS "News viewable by authenticated" ON news_articles;
CREATE POLICY "Published news viewable" ON news_articles FOR SELECT TO authenticated
  USING (is_published OR is_admin());

DROP POLICY IF EXISTS "Opportunities viewable" ON opportunities;
CREATE POLICY "Active opportunities viewable" ON opportunities FOR SELECT TO authenticated
  USING (is_active OR is_admin());

CREATE INDEX IF NOT EXISTS news_articles_published_at
  ON news_articles (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS opportunities_active_deadline
  ON opportunities (is_active, deadline);

-- ─── Contact submission anti-abuse ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION submit_contact_submission(
  p_name TEXT,
  p_email TEXT,
  p_subject TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_id UUID;
  clean_name TEXT := trim(p_name);
  clean_email TEXT := lower(trim(p_email));
  clean_subject TEXT := trim(p_subject);
  clean_message TEXT := trim(p_message);
  attempt_count INT;
BEGIN
  IF char_length(clean_name) NOT BETWEEN 1 AND 120
     OR char_length(clean_email) NOT BETWEEN 3 AND 254
     OR clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     OR char_length(clean_subject) NOT BETWEEN 1 AND 200
     OR char_length(clean_message) NOT BETWEEN 10 AND 5000 THEN
    RAISE EXCEPTION 'Invalid contact submission';
  END IF;

  SELECT COUNT(*)::INT INTO attempt_count
  FROM rate_limit_events
  WHERE action = 'contact_submit'
    AND identifier = clean_email
    AND created_at > now() - interval '1 hour';
  IF attempt_count >= 3 THEN
    RAISE EXCEPTION 'Too many submissions. Try again in about an hour.';
  END IF;

  INSERT INTO contact_submissions (name, email, subject, message)
  VALUES (clean_name, clean_email, clean_subject, clean_message)
  RETURNING id INTO submission_id;

  INSERT INTO rate_limit_events (action, identifier)
  VALUES ('contact_submit', clean_email);
  RETURN submission_id;
END;
$$;

DROP POLICY IF EXISTS "Public submit contact" ON contact_submissions;
GRANT EXECUTE ON FUNCTION submit_contact_submission(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
