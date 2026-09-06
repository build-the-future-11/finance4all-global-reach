-- Member privacy controls and an honest account-deletion review workflow.
-- Deleting the Supabase Auth identity remains a privileged operator action;
-- the request row is removed automatically when that identity is deleted.

BEGIN;

CREATE TABLE public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'cancelled', 'rejected')),
  reason text CHECK (reason IS NULL OR pg_catalog.char_length(reason) <= 1000),
  review_note text CHECK (review_note IS NULL OR pg_catalog.char_length(review_note) <= 2000),
  requested_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own deletion request"
  ON public.account_deletion_requests
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins view deletion requests"
  ON public.account_deletion_requests
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins review deletion requests"
  ON public.account_deletion_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION private.stamp_account_deletion_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();
  IF NEW.status IS DISTINCT FROM OLD.status AND public.is_admin() THEN
    NEW.reviewed_at := pg_catalog.now();
    NEW.reviewed_by := (SELECT auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status
    AND NEW.status IN ('pending', 'cancelled') THEN
    NEW.reviewed_at := NULL;
    NEW.reviewed_by := NULL;
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'only administrators may review deletion requests' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER account_deletion_requests_reviewed
  BEFORE UPDATE ON public.account_deletion_requests
  FOR EACH ROW EXECUTE FUNCTION private.stamp_account_deletion_review();

CREATE OR REPLACE FUNCTION public.request_account_deletion(request_reason text DEFAULT NULL)
RETURNS public.account_deletion_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
  current_email text := COALESCE((SELECT auth.jwt() ->> 'email'), '');
  normalized_reason text := NULLIF(pg_catalog.btrim(request_reason), '');
  result public.account_deletion_requests;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000';
  END IF;
  IF pg_catalog.char_length(normalized_reason) > 1000 THEN
    RAISE EXCEPTION 'reason must be 1000 characters or fewer' USING ERRCODE = '22001';
  END IF;

  INSERT INTO public.account_deletion_requests (
    user_id, contact_email, status, reason, requested_at, updated_at,
    reviewed_at, reviewed_by, review_note
  )
  VALUES (
    current_user_id, current_email, 'pending', normalized_reason,
    pg_catalog.now(), pg_catalog.now(), NULL, NULL, NULL
  )
  ON CONFLICT (user_id) DO UPDATE SET
    contact_email = EXCLUDED.contact_email,
    status = 'pending',
    reason = EXCLUDED.reason,
    requested_at = pg_catalog.now(),
    updated_at = pg_catalog.now(),
    reviewed_at = NULL,
    reviewed_by = NULL,
    review_note = NULL
  WHERE account_deletion_requests.status IN ('pending', 'cancelled', 'rejected')
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'deletion request is already in review' USING ERRCODE = 'P0001';
  END IF;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_account_deletion()
RETURNS public.account_deletion_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
  result public.account_deletion_requests;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000';
  END IF;

  UPDATE public.account_deletion_requests
  SET status = 'cancelled'
  WHERE user_id = current_user_id
    AND status = 'pending'
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'no pending deletion request found' USING ERRCODE = 'P0002';
  END IF;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.export_my_data()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000';
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'exported_at', pg_catalog.now(),
    'account_email', (SELECT auth.jwt() ->> 'email'),
    'profile', (SELECT pg_catalog.to_jsonb(p) FROM public.profiles p WHERE p.id = current_user_id),
    'digest_preferences', (SELECT pg_catalog.to_jsonb(d) FROM public.digest_preferences d WHERE d.user_id = current_user_id),
    'research_projects', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(r) ORDER BY r.created_at) FROM public.research_projects r WHERE r.lead_researcher_id = current_user_id), '[]'::jsonb),
    'lab_applications', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY a.submitted_at) FROM public.lab_applications a WHERE a.applicant_id = current_user_id), '[]'::jsonb),
    'opportunity_interests', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) ORDER BY i.created_at) FROM public.opportunity_interests i WHERE i.user_id = current_user_id), '[]'::jsonb),
    'studio_submissions', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) ORDER BY s.submitted_at) FROM public.studio_submissions s WHERE s.author_id = current_user_id), '[]'::jsonb),
    'essay_submissions', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) ORDER BY e.submitted_at) FROM public.essay_submissions e WHERE e.author_id = current_user_id), '[]'::jsonb),
    'essay_upvotes', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(u) ORDER BY u.created_at) FROM public.essay_upvotes u WHERE u.user_id = current_user_id), '[]'::jsonb),
    'event_registrations', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) ORDER BY e.created_at) FROM public.event_registrations e WHERE e.user_id = current_user_id), '[]'::jsonb),
    'connection_requests', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) ORDER BY c.created_at) FROM public.connection_requests c WHERE c.from_user_id = current_user_id OR c.to_user_id = current_user_id), '[]'::jsonb),
    'introduction_posts', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) ORDER BY i.created_at) FROM public.introduction_posts i WHERE i.author_id = current_user_id), '[]'::jsonb),
    'news_bookmarks', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(b) ORDER BY b.created_at) FROM public.news_bookmarks b WHERE b.user_id = current_user_id), '[]'::jsonb),
    'project_bookmarks', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(b) ORDER BY b.created_at) FROM public.project_bookmarks b WHERE b.user_id = current_user_id), '[]'::jsonb),
    'notifications', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(n) ORDER BY n.created_at) FROM public.notifications n WHERE n.user_id = current_user_id), '[]'::jsonb),
    'account_deletion_request', (SELECT pg_catalog.to_jsonb(d) FROM public.account_deletion_requests d WHERE d.user_id = current_user_id)
  );
END;
$$;

REVOKE ALL ON TABLE public.account_deletion_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.account_deletion_requests TO authenticated;
GRANT UPDATE (status, review_note) ON TABLE public.account_deletion_requests TO authenticated;

REVOKE ALL ON FUNCTION private.stamp_account_deletion_review() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.request_account_deletion(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_account_deletion() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.export_my_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_account_deletion(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_account_deletion() TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_my_data() TO authenticated;

INSERT INTO private.portal_schema_revisions (version, name)
VALUES ('20260906150632', 'member_account_lifecycle')
ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name;

COMMIT;
