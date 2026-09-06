-- Reconcile the production portal with the repository's authorization contract.
-- This migration is intentionally idempotent because the original schema was
-- applied manually and the hosted project has no Supabase migration history.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.portal_schema_revisions (
  version text PRIMARY KEY,
  name text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

REVOKE ALL ON TABLE private.portal_schema_revisions FROM PUBLIC, anon, authenticated;

-- Browser clients never need table privileges while signed out. Existing RLS
-- remains defense in depth, but explicit grants are the first authorization gate.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;

-- Keep directory profiles visible to members without exposing email addresses.
DROP POLICY IF EXISTS "Admin manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = id
    AND role = 'member'::public.user_role
    AND email = COALESCE((SELECT auth.jwt() ->> 'email'), '')
  );

REVOKE ALL ON TABLE public.profiles FROM authenticated;
GRANT SELECT (
  id, display_name, role, bio, avatar_url, interests,
  open_to_collaborate, chapter_id, created_at, updated_at
) ON TABLE public.profiles TO authenticated;
GRANT INSERT (
  id, email, display_name, avatar_url, bio, interests,
  open_to_collaborate, chapter_id
) ON TABLE public.profiles TO authenticated;
GRANT UPDATE (
  display_name, avatar_url, bio, interests, open_to_collaborate, chapter_id
) ON TABLE public.profiles TO authenticated;

-- Studio authors can revise their work, but cannot transfer authorship or
-- rewrite the server-owned submission timestamp.
DROP POLICY IF EXISTS "Users update own studio submissions" ON public.studio_submissions;
CREATE POLICY "Users update own studio submissions"
  ON public.studio_submissions
  FOR UPDATE
  TO authenticated
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));

REVOKE UPDATE ON TABLE public.studio_submissions FROM authenticated;
GRANT UPDATE (title, repo_url, demo_url, writeup)
  ON TABLE public.studio_submissions TO authenticated;

-- A lead can edit project content, but cannot transfer ownership through the API.
DROP POLICY IF EXISTS "Leads update own projects" ON public.research_projects;
CREATE POLICY "Leads update own projects"
  ON public.research_projects
  FOR UPDATE
  TO authenticated
  USING (lead_researcher_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (lead_researcher_id = (SELECT auth.uid()) OR public.is_admin());

REVOKE UPDATE ON TABLE public.research_projects FROM authenticated;
GRANT UPDATE (title, description, status, tags, application_deadline)
  ON TABLE public.research_projects TO authenticated;

-- Applicants can only submit a pending application. Reviewers can only change
-- review fields, and the database records the authenticated reviewer identity.
DROP POLICY IF EXISTS "Members apply to projects" ON public.lab_applications;
CREATE POLICY "Members apply to projects"
  ON public.lab_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    applicant_id = (SELECT auth.uid())
    AND status = 'pending'::public.lab_application_status
    AND reviewed_at IS NULL
    AND reviewer_id IS NULL
  );

DROP POLICY IF EXISTS "Leads review applications" ON public.lab_applications;
CREATE POLICY "Leads review applications"
  ON public.lab_applications
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.research_projects rp
      WHERE rp.id = lab_applications.project_id
        AND rp.lead_researcher_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    reviewer_id = (SELECT auth.uid())
    AND reviewed_at IS NOT NULL
    AND status IN (
      'under_review'::public.lab_application_status,
      'accepted'::public.lab_application_status,
      'rejected'::public.lab_application_status
    )
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1
        FROM public.research_projects rp
        WHERE rp.id = lab_applications.project_id
          AND rp.lead_researcher_id = (SELECT auth.uid())
      )
    )
  );

REVOKE INSERT, UPDATE ON TABLE public.lab_applications FROM authenticated;
GRANT INSERT (project_id, applicant_id, motivation)
  ON TABLE public.lab_applications TO authenticated;
GRANT UPDATE (status, reviewed_at, reviewer_id)
  ON TABLE public.lab_applications TO authenticated;

-- Members may submit essays but cannot award themselves an editorial badge.
DROP POLICY IF EXISTS "Admin update essays" ON public.essay_submissions;
DROP POLICY IF EXISTS "Admins update essays" ON public.essay_submissions;
CREATE POLICY "Admins update essays"
  ON public.essay_submissions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users create own essays" ON public.essay_submissions;
CREATE POLICY "Users create own essays"
  ON public.essay_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND is_editorial_pick = false
  );

REVOKE INSERT, UPDATE ON TABLE public.essay_submissions FROM authenticated;
GRANT INSERT (author_id, title, body)
  ON TABLE public.essay_submissions TO authenticated;
GRANT UPDATE (is_editorial_pick)
  ON TABLE public.essay_submissions TO authenticated;

-- Senders create immutable pending requests. Only the recipient may choose the
-- final status, and no client can rewrite either participant or the message.
DROP POLICY IF EXISTS "Users send connections" ON public.connection_requests;
CREATE POLICY "Users send connections"
  ON public.connection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    from_user_id = (SELECT auth.uid())
    AND to_user_id <> (SELECT auth.uid())
    AND status = 'pending'::public.connection_status
  );

DROP POLICY IF EXISTS "Recipients respond to connections" ON public.connection_requests;
CREATE POLICY "Recipients respond to connections"
  ON public.connection_requests
  FOR UPDATE
  TO authenticated
  USING (
    to_user_id = (SELECT auth.uid())
    AND status = 'pending'::public.connection_status
  )
  WITH CHECK (
    to_user_id = (SELECT auth.uid())
    AND status IN (
      'accepted'::public.connection_status,
      'declined'::public.connection_status
    )
  );

REVOKE INSERT, UPDATE, DELETE ON TABLE public.connection_requests FROM authenticated;
GRANT INSERT (from_user_id, to_user_id, message)
  ON TABLE public.connection_requests TO authenticated;
GRANT UPDATE (status)
  ON TABLE public.connection_requests TO authenticated;

-- Notifications are trigger-owned. Members may only mark their own rows read.
DROP POLICY IF EXISTS "System insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

REVOKE INSERT, UPDATE, DELETE ON TABLE public.notifications FROM authenticated;
GRANT UPDATE (read) ON TABLE public.notifications TO authenticated;

-- Qualify every privileged function and remove caller-controlled search paths.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      pg_catalog.split_part(COALESCE(NEW.email, ''), '@', 1),
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = CASE
      WHEN profiles.display_name = '' OR profiles.display_name IS NULL
        THEN EXCLUDED.display_name
      ELSE profiles.display_name
    END,
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'::public.user_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_lead_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role IN ('admin'::public.user_role, 'lead_researcher'::public.user_role)
  );
$$;

CREATE OR REPLACE FUNCTION public.notify_connection_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  sender_name text;
BEGIN
  SELECT display_name INTO sender_name
  FROM public.profiles
  WHERE id = NEW.from_user_id;

  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (
    NEW.to_user_id,
    'connection_request'::public.notification_type,
    'New connection request',
    COALESCE(sender_name, 'A member') || ' wants to connect with you.',
    '/portal/network'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_connection_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  accepter_name text;
BEGIN
  IF NEW.status = 'accepted'::public.connection_status
     AND OLD.status = 'pending'::public.connection_status THEN
    SELECT display_name INTO accepter_name
    FROM public.profiles
    WHERE id = NEW.to_user_id;

    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.from_user_id,
      'connection_accepted'::public.notification_type,
      'Connection accepted',
      COALESCE(accepter_name, 'A member') || ' accepted your connection request.',
      '/portal/network'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_lab_application_received()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  applicant_name text;
  project_title text;
  lead_id uuid;
BEGIN
  SELECT display_name INTO applicant_name
  FROM public.profiles
  WHERE id = NEW.applicant_id;

  SELECT title, lead_researcher_id INTO project_title, lead_id
  FROM public.research_projects
  WHERE id = NEW.project_id;

  IF lead_id IS NOT NULL AND lead_id <> NEW.applicant_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      lead_id,
      'lab_application_received'::public.notification_type,
      'New lab application',
      COALESCE(applicant_name, 'A member') || ' applied to "' ||
        COALESCE(project_title, 'your project') || '".',
      '/portal/labs/review'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_lab_application_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  project_title text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN (
       'accepted'::public.lab_application_status,
       'rejected'::public.lab_application_status,
       'under_review'::public.lab_application_status
     ) THEN
    SELECT title INTO project_title
    FROM public.research_projects
    WHERE id = NEW.project_id;

    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.applicant_id,
      'lab_application_status'::public.notification_type,
      'Application update',
      'Your application to "' || COALESCE(project_title, 'a project') ||
        '" is now ' || pg_catalog.replace(NEW.status::text, '_', ' ') || '.',
      '/portal/labs'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_essay_upvote_count(target_essay_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT pg_catalog.count(*)
  FROM public.essay_upvotes
  WHERE essay_id = target_essay_id;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_connection_request() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_connection_accepted() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_lab_application_received() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_lab_application_status() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_lead_or_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_essay_upvote_count(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_lead_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_essay_upvote_count(uuid) TO authenticated;

CREATE OR REPLACE VIEW public.essay_submissions_with_counts AS
SELECT
  e.*,
  COALESCE(public.get_essay_upvote_count(e.id), 0)::integer AS upvote_count
FROM public.essay_submissions e;

ALTER VIEW public.essay_submissions_with_counts SET (security_invoker = true);
REVOKE ALL ON TABLE public.essay_submissions_with_counts FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.essay_submissions_with_counts TO authenticated;

-- Some production extensions predate this repository's migration history.
-- Harden them when present without making a clean database depend on them.
DO $portal_extensions$
BEGIN
  IF pg_catalog.to_regclass('public.contact_submissions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public submit contact" ON public.contact_submissions';
    EXECUTE 'CREATE POLICY "Public submit contact" ON public.contact_submissions
      FOR INSERT TO anon, authenticated
      WITH CHECK (
        status = ''new''
        AND pg_catalog.char_length(pg_catalog.btrim(name)) BETWEEN 1 AND 120
        AND pg_catalog.char_length(pg_catalog.btrim(email)) BETWEEN 3 AND 254
        AND pg_catalog.char_length(pg_catalog.btrim(subject)) BETWEEN 1 AND 200
        AND pg_catalog.char_length(pg_catalog.btrim(message)) BETWEEN 10 AND 5000
      )';

    EXECUTE 'DROP POLICY IF EXISTS "Admin update contact submissions" ON public.contact_submissions';
    EXECUTE 'CREATE POLICY "Admin update contact submissions" ON public.contact_submissions
      FOR UPDATE TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';

    EXECUTE 'REVOKE ALL ON TABLE public.contact_submissions FROM anon, authenticated';
    EXECUTE 'GRANT INSERT (name, email, subject, message)
      ON TABLE public.contact_submissions TO anon, authenticated';
    EXECUTE 'GRANT SELECT, DELETE ON TABLE public.contact_submissions TO authenticated';
    EXECUTE 'GRANT UPDATE (status) ON TABLE public.contact_submissions TO authenticated';
  END IF;

  IF pg_catalog.to_regprocedure('public.portal_search(text,integer)') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.portal_search(text, integer) SECURITY INVOKER';
    EXECUTE 'ALTER FUNCTION public.portal_search(text, integer) SET search_path = public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.portal_search(text, integer) FROM PUBLIC, anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.portal_search(text, integer) TO authenticated';
  END IF;

  IF pg_catalog.to_regprocedure('public.check_rate_limit(text,text,integer,integer)') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.check_rate_limit(text, text, integer, integer) SET search_path = public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM PUBLIC';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO anon, authenticated';
  END IF;

  IF pg_catalog.to_regprocedure('public.record_rate_limit(text,text)') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.record_rate_limit(text, text) SET search_path = public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.record_rate_limit(text, text) FROM PUBLIC';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.record_rate_limit(text, text) TO anon, authenticated';
  END IF;

  IF pg_catalog.to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
  END IF;

  IF pg_catalog.to_regprocedure('public.sync_chapter_member_counts()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.sync_chapter_member_counts() SET search_path = public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.sync_chapter_member_counts() FROM PUBLIC, anon, authenticated';
  END IF;

  IF pg_catalog.to_regprocedure('public.protect_profile_role()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.protect_profile_role() SET search_path = public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.protect_profile_role() FROM PUBLIC, anon, authenticated';
  END IF;

  IF pg_catalog.to_regprocedure('public.enforce_profile_insert_defaults()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.enforce_profile_insert_defaults() SET search_path = public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.enforce_profile_insert_defaults() FROM PUBLIC, anon, authenticated';
  END IF;

  IF pg_catalog.to_regprocedure('public.set_updated_at()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.set_updated_at() SET search_path = public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated';
  END IF;
END;
$portal_extensions$;

-- The hosted project also contains an empty, currently unused avatar bucket.
-- Keep it available for future member uploads without allowing public listing.
DO $avatar_storage$
BEGIN
  IF pg_catalog.to_regclass('storage.buckets') IS NOT NULL
    AND EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    UPDATE storage.buckets SET public = false WHERE id = 'avatars';

    DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;
    DROP POLICY IF EXISTS "Members read avatars" ON storage.objects;
    CREATE POLICY "Members read avatars"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'avatars');
  END IF;
END;
$avatar_storage$;

INSERT INTO private.portal_schema_revisions (version, name)
VALUES ('20260906121145', 'portal_security_and_privacy')
ON CONFLICT (version) DO UPDATE SET
  name = EXCLUDED.name,
  applied_at = pg_catalog.now();

COMMIT;
