-- Private member learning and draft state. Submitted intake remains immutable.
BEGIN;
CREATE TABLE public.member_learning (
 user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
 lesson_id text NOT NULL CHECK (lesson_id ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
 completed boolean NOT NULL DEFAULT false,
 notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 12000),
 revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id,lesson_id)
);
CREATE TABLE public.application_drafts (
 user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
 call_id text NOT NULL REFERENCES public.intake_calls(id),
 motivation text NOT NULL DEFAULT '' CHECK (char_length(motivation) <= 4000),
 preparation text NOT NULL DEFAULT '' CHECK (char_length(preparation) <= 2000),
 availability text NOT NULL DEFAULT '' CHECK (char_length(availability) <= 160),
 work_url text NOT NULL DEFAULT '' CHECK (char_length(work_url) <= 500),
 revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id,call_id)
);
CREATE INDEX application_drafts_call ON public.application_drafts(call_id);
CREATE FUNCTION private.stamp_member_state() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF TG_OP = 'INSERT' THEN NEW.revision := 0;
 ELSE NEW.revision := OLD.revision + 1; END IF;
 NEW.updated_at := now();
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.stamp_member_state() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER stamp_member_learning BEFORE INSERT OR UPDATE ON public.member_learning
 FOR EACH ROW EXECUTE FUNCTION private.stamp_member_state();
CREATE TRIGGER stamp_application_drafts BEFORE INSERT OR UPDATE ON public.application_drafts
 FOR EACH ROW EXECUTE FUNCTION private.stamp_member_state();
ALTER TABLE public.member_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_drafts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.member_learning,public.application_drafts FROM PUBLIC,anon,authenticated;
GRANT SELECT,DELETE ON public.member_learning,public.application_drafts TO authenticated;
GRANT INSERT (lesson_id,completed,notes), UPDATE (completed,notes) ON public.member_learning TO authenticated;
GRANT INSERT (call_id,motivation,preparation,availability,work_url), UPDATE (motivation,preparation,availability,work_url) ON public.application_drafts TO authenticated;
CREATE POLICY "Own learning" ON public.member_learning FOR ALL TO authenticated
 USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Own drafts" ON public.application_drafts FOR ALL TO authenticated
 USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE TABLE public.intake_history (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 submission_id uuid NOT NULL REFERENCES public.intake_submissions(id) ON DELETE CASCADE,
 status text NOT NULL CHECK (status IN ('submitted','under_review','accepted','declined','withdrawn')),
 note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 2000),
 recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX intake_history_submission ON public.intake_history(submission_id,recorded_at,id);
ALTER TABLE public.intake_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.intake_history FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.intake_history TO authenticated;
CREATE POLICY "History follows private submission" ON public.intake_history FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.intake_submissions s WHERE s.id=submission_id));
-- Trigger-only elevated insert: caller cannot forge or rewrite history.
CREATE FUNCTION private.record_intake_history() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status OR NEW.review_note IS DISTINCT FROM OLD.review_note THEN
  INSERT INTO public.intake_history(submission_id,status,note) VALUES (NEW.id,NEW.status,NEW.review_note);
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.record_intake_history() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER record_intake_history AFTER INSERT OR UPDATE ON public.intake_submissions
 FOR EACH ROW EXECUTE FUNCTION private.record_intake_history();
-- No invented timestamps/backfill for decisions made before history was installed.
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
    'member_learning', COALESCE((SELECT jsonb_agg(to_jsonb(l)) FROM public.member_learning l WHERE l.user_id=current_user_id),'[]'::jsonb),
    'application_drafts', COALESCE((SELECT jsonb_agg(to_jsonb(d)) FROM public.application_drafts d WHERE d.user_id=current_user_id),'[]'::jsonb),
    'intake_history', COALESCE((SELECT jsonb_agg(to_jsonb(h) ORDER BY h.recorded_at,h.id) FROM public.intake_history h JOIN public.intake_submissions s ON s.id=h.submission_id WHERE s.applicant_id=current_user_id),'[]'::jsonb),
    'intake_submissions', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) ORDER BY s.created_at) FROM public.intake_submissions s WHERE s.applicant_id = current_user_id), '[]'::jsonb),
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
REVOKE ALL ON FUNCTION public.export_my_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.export_my_data() TO authenticated;

INSERT INTO private.portal_schema_revisions(version,name) VALUES ('20260924155017','member_learning_and_application_drafts');
COMMIT;
