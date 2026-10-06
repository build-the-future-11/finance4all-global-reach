-- Keep member privacy exports complete for every retained owner-scoped table.
-- The education progress table is intentionally retained and protected by
-- owner-only RLS, so its rows belong in the authenticated member export.

BEGIN;

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
    'education_lesson_progress', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(p) ORDER BY p.completed_at, p.lesson_id) FROM public.education_lesson_progress p WHERE p.user_id = current_user_id), '[]'::jsonb),
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

REVOKE ALL ON FUNCTION public.export_my_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.export_my_data() TO authenticated;

INSERT INTO private.portal_schema_revisions (version, name)
VALUES ('20260908143000', 'include_education_progress_in_member_export')
ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name;

COMMIT;
