-- Pass 3 Wave 2: submission moderation, certificates, chapter leadership, competitions

-- ─── Enums ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE submission_moderation_status AS ENUM ('pending', 'approved', 'rejected', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE chapter_leader_role AS ENUM ('lead', 'co_lead', 'coordinator');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE competition_status AS ENUM ('draft', 'open', 'closed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Studio / essay moderation columns ───────────────────────────────────────

ALTER TABLE studio_submissions
  ADD COLUMN IF NOT EXISTS status submission_moderation_status,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderation_note TEXT;

ALTER TABLE essay_submissions
  ADD COLUMN IF NOT EXISTS status submission_moderation_status,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderation_note TEXT;

-- Legacy rows (NULL status from ADD COLUMN) stay public; new inserts default to pending
UPDATE studio_submissions SET status = 'approved' WHERE status IS NULL;
UPDATE essay_submissions SET status = 'approved' WHERE status IS NULL;

ALTER TABLE studio_submissions
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;
ALTER TABLE essay_submissions
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;

CREATE INDEX IF NOT EXISTS studio_submissions_status_idx ON studio_submissions (status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS essay_submissions_status_idx ON essay_submissions (status, submitted_at DESC);

DROP POLICY IF EXISTS "Studios viewable" ON studio_submissions;
CREATE POLICY "Studios viewable"
  ON studio_submissions FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR author_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

DROP POLICY IF EXISTS "Admin update studio submissions" ON studio_submissions;
CREATE POLICY "Admin update studio submissions"
  ON studio_submissions FOR UPDATE TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

DROP POLICY IF EXISTS "Essays viewable" ON essay_submissions;
CREATE POLICY "Essays viewable"
  ON essay_submissions FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR author_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

CREATE OR REPLACE FUNCTION validate_studio_submission()
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
      RAISE EXCEPTION 'Studio author must match the authenticated member';
    END IF;
    IF NOT caller_is_admin THEN
      NEW.status := 'pending';
      NEW.moderated_at := NULL;
      NEW.moderated_by := NULL;
      NEW.moderation_note := NULL;
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
      NEW.status := 'pending';
      NEW.moderated_at := NULL;
      NEW.moderated_by := NULL;
      NEW.moderation_note := NULL;
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

CREATE OR REPLACE FUNCTION moderate_studio_submission(
  p_id UUID,
  p_status submission_moderation_status,
  p_note TEXT DEFAULT NULL
)
RETURNS studio_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result studio_submissions;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  UPDATE studio_submissions
  SET
    status = p_status,
    moderated_at = now(),
    moderated_by = (SELECT auth.uid()),
    moderation_note = NULLIF(btrim(COALESCE(p_note, '')), '')
  WHERE id = p_id
  RETURNING * INTO result;
  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Studio submission not found';
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
SET search_path = public
AS $$
DECLARE
  result essay_submissions;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
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
  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Essay submission not found';
  END IF;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION moderate_studio_submission(UUID, submission_moderation_status, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION moderate_essay_submission(UUID, submission_moderation_status, TEXT, BOOLEAN) TO authenticated;

CREATE OR REPLACE VIEW essay_submissions_with_counts AS
SELECT
  e.*,
  COALESCE(u.upvote_count, 0)::INTEGER AS upvote_count
FROM essay_submissions e
LEFT JOIN (
  SELECT essay_id, COUNT(*)::INTEGER AS upvote_count
  FROM essay_upvotes
  GROUP BY essay_id
) u ON u.essay_id = e.id;

GRANT SELECT ON essay_submissions_with_counts TO authenticated;

-- ─── Certificates ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS member_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_key TEXT NOT NULL,
  title TEXT NOT NULL,
  verification_code TEXT NOT NULL UNIQUE,
  lesson_ids TEXT[] NOT NULL DEFAULT '{}',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, curriculum_key),
  CONSTRAINT member_certificates_curriculum_key_len CHECK (char_length(curriculum_key) BETWEEN 1 AND 80),
  CONSTRAINT member_certificates_title_len CHECK (char_length(title) BETWEEN 1 AND 200)
);

CREATE INDEX IF NOT EXISTS member_certificates_user_idx ON member_certificates (user_id, issued_at DESC);

ALTER TABLE member_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own certificates" ON member_certificates;
CREATE POLICY "Users read own certificates"
  ON member_certificates FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT is_admin()));

CREATE OR REPLACE FUNCTION issue_my_curriculum_certificate(
  p_curriculum_key TEXT,
  p_title TEXT,
  p_lesson_ids TEXT[]
)
RETURNS member_certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := (SELECT auth.uid());
  completed_count INTEGER;
  required_count INTEGER;
  result member_certificates;
  code TEXT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_lesson_ids IS NULL OR cardinality(p_lesson_ids) < 1 THEN
    RAISE EXCEPTION 'At least one lesson is required';
  END IF;

  required_count := cardinality(p_lesson_ids);
  SELECT COUNT(DISTINCT lesson_id)::INTEGER INTO completed_count
  FROM education_lesson_progress
  WHERE user_id = uid
    AND lesson_id = ANY (p_lesson_ids);

  IF completed_count < required_count THEN
    RAISE EXCEPTION 'Complete all required lessons before requesting a certificate';
  END IF;

  code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

  INSERT INTO member_certificates (user_id, curriculum_key, title, verification_code, lesson_ids)
  VALUES (
    uid,
    btrim(p_curriculum_key),
    btrim(p_title),
    code,
    (
      SELECT ARRAY(
        SELECT DISTINCT btrim(value)
        FROM unnest(p_lesson_ids) AS value
        WHERE btrim(value) <> ''
        ORDER BY btrim(value)
      )
    )
  )
  ON CONFLICT (user_id, curriculum_key) DO UPDATE
    SET title = EXCLUDED.title,
        lesson_ids = EXCLUDED.lesson_ids
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION issue_my_curriculum_certificate(TEXT, TEXT, TEXT[]) TO authenticated;

-- ─── Chapter leadership ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chapter_leaders (
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role chapter_leader_role NOT NULL DEFAULT 'lead',
  appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  appointed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (chapter_id, user_id)
);

CREATE INDEX IF NOT EXISTS chapter_leaders_user_idx ON chapter_leaders (user_id);

ALTER TABLE chapter_leaders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chapter leaders readable" ON chapter_leaders;
CREATE POLICY "Chapter leaders readable"
  ON chapter_leaders FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin manage chapter leaders" ON chapter_leaders;
CREATE POLICY "Admin manage chapter leaders"
  ON chapter_leaders FOR ALL TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

CREATE OR REPLACE FUNCTION appoint_chapter_leader(
  p_chapter_id UUID,
  p_user_id UUID,
  p_role chapter_leader_role DEFAULT 'lead'
)
RETURNS chapter_leaders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result chapter_leaders;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  INSERT INTO chapter_leaders (chapter_id, user_id, role, appointed_by)
  VALUES (p_chapter_id, p_user_id, p_role, (SELECT auth.uid()))
  ON CONFLICT (chapter_id, user_id) DO UPDATE
    SET role = EXCLUDED.role,
        appointed_by = EXCLUDED.appointed_by,
        appointed_at = now()
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION remove_chapter_leader(
  p_chapter_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  DELETE FROM chapter_leaders
  WHERE chapter_id = p_chapter_id AND user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION appoint_chapter_leader(UUID, UUID, chapter_leader_role) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_chapter_leader(UUID, UUID) TO authenticated;

-- ─── Competitions ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status competition_status NOT NULL DEFAULT 'draft',
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  registration_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT competitions_title_len CHECK (char_length(btrim(title)) BETWEEN 1 AND 160),
  CONSTRAINT competitions_description_len CHECK (char_length(btrim(description)) BETWEEN 20 AND 5000)
);

CREATE INDEX IF NOT EXISTS competitions_status_idx ON competitions (status, starts_at DESC NULLS LAST);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Open competitions readable" ON competitions;
CREATE POLICY "Open competitions readable"
  ON competitions FOR SELECT TO authenticated
  USING (status IN ('open', 'closed') OR (SELECT is_admin()));

DROP POLICY IF EXISTS "Admin manage competitions" ON competitions;
CREATE POLICY "Admin manage competitions"
  ON competitions FOR ALL TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));
