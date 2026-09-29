BEGIN;
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'project_task';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'intake_status';
COMMIT;
BEGIN;
-- Authenticated policies/triggers resolve the explicitly granted project helpers.
-- USAGE grants no access to private tables or ungranted functions.
GRANT USAGE ON SCHEMA private TO authenticated;
CREATE TABLE public.project_memberships (
 project_id uuid NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 invited_by uuid DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE SET NULL,
 status text NOT NULL DEFAULT 'invited' CHECK(status IN ('invited','active','declined','left','removed')),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(project_id,user_id)
);
CREATE INDEX project_memberships_user ON public.project_memberships(user_id,status);
CREATE INDEX project_memberships_inviter ON public.project_memberships(invited_by);
CREATE FUNCTION private.manages_project(target uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT auth.uid() IS NOT NULL AND EXISTS(SELECT 1 FROM public.research_projects p WHERE p.id=target AND (p.lead_researcher_id=auth.uid() OR public.is_admin()))
$$;
CREATE FUNCTION private.joins_project(target uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT auth.uid() IS NOT NULL AND (private.manages_project(target) OR EXISTS(SELECT 1 FROM public.project_memberships m WHERE m.project_id=target AND m.user_id=auth.uid() AND m.status='active'))
$$;
REVOKE ALL ON FUNCTION private.manages_project(uuid),private.joins_project(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION private.manages_project(uuid),private.joins_project(uuid) TO authenticated;
ALTER TABLE public.project_memberships ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.project_memberships FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.project_memberships TO authenticated;
GRANT INSERT(project_id,user_id),UPDATE(status) ON public.project_memberships TO authenticated;
CREATE POLICY "Own invitation or project manager" ON public.project_memberships FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()) OR private.manages_project(project_id) OR private.joins_project(project_id));
CREATE POLICY "Manager invites" ON public.project_memberships FOR INSERT TO authenticated WITH CHECK(private.manages_project(project_id) AND invited_by=(SELECT auth.uid()) AND status='invited');
CREATE POLICY "Member responds or manager removes" ON public.project_memberships FOR UPDATE TO authenticated USING(user_id=(SELECT auth.uid()) OR private.manages_project(project_id)) WITH CHECK(user_id=(SELECT auth.uid()) OR private.manages_project(project_id));
CREATE FUNCTION private.guard_membership() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW.status=OLD.status THEN RETURN NEW; END IF;
  IF NEW.user_id=auth.uid() AND ((OLD.status='invited' AND NEW.status IN ('active','declined')) OR (OLD.status='active' AND NEW.status='left')) THEN NULL;
  ELSIF private.manages_project(NEW.project_id) AND (NEW.status='removed' OR (OLD.status IN ('declined','left','removed') AND NEW.status='invited')) THEN NULL;
  ELSE RAISE EXCEPTION 'Invalid membership transition' USING ERRCODE='42501'; END IF;
 END IF;
 NEW.updated_at:=now();RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.guard_membership() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_membership BEFORE INSERT OR UPDATE ON public.project_memberships FOR EACH ROW EXECUTE FUNCTION private.guard_membership();
CREATE TABLE public.project_tasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 project_id uuid NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
 title text NOT NULL CHECK(char_length(btrim(title)) BETWEEN 3 AND 200),
 description text NOT NULL DEFAULT '' CHECK(char_length(description)<=4000),
 assignee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
 due_date date,
 kind text NOT NULL DEFAULT 'task' CHECK(kind IN ('task','milestone')),
 status text NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','in_progress','submitted','done')),
 evidence_url text NOT NULL DEFAULT '' CHECK(evidence_url='' OR (char_length(evidence_url)<=1000 AND evidence_url ~ '^https://[^[:space:]@]+')),
 revision integer NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_tasks_project ON public.project_tasks(project_id,status,due_date);
CREATE INDEX project_tasks_assignee ON public.project_tasks(assignee_id);
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.project_tasks FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.project_tasks TO authenticated;
GRANT INSERT(project_id,title,description,assignee_id,due_date,kind),UPDATE(title,description,assignee_id,due_date,status,evidence_url) ON public.project_tasks TO authenticated;
CREATE POLICY "Participants read tasks" ON public.project_tasks FOR SELECT TO authenticated USING(private.joins_project(project_id));
CREATE POLICY "Managers create tasks" ON public.project_tasks FOR INSERT TO authenticated WITH CHECK(private.manages_project(project_id));
CREATE POLICY "Manager or active assignee updates task" ON public.project_tasks FOR UPDATE TO authenticated USING(private.manages_project(project_id) OR (assignee_id=(SELECT auth.uid()) AND private.joins_project(project_id))) WITH CHECK(private.manages_project(project_id) OR (assignee_id=(SELECT auth.uid()) AND private.joins_project(project_id)));
CREATE FUNCTION private.guard_project_task() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT private.joins_project(NEW.project_id) THEN RAISE EXCEPTION 'Project access required' USING ERRCODE='42501'; END IF;
 IF TG_OP='UPDATE' THEN
  IF NOT private.manages_project(NEW.project_id) AND ((to_jsonb(NEW)-ARRAY['status','evidence_url','revision','updated_at']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['status','evidence_url','revision','updated_at']) OR NEW.status='done' OR OLD.status='done') THEN
   RAISE EXCEPTION 'Only a manager may change task details or accept work' USING ERRCODE='42501';
  END IF;
  NEW.revision:=OLD.revision+1;
 END IF;
 IF NEW.assignee_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.project_memberships m WHERE m.project_id=NEW.project_id AND m.user_id=NEW.assignee_id AND m.status='active') AND NOT EXISTS(SELECT 1 FROM public.research_projects p WHERE p.id=NEW.project_id AND p.lead_researcher_id=NEW.assignee_id) THEN
  RAISE EXCEPTION 'Assignee must be the lead or an active member' USING ERRCODE='23514';
 END IF;
 IF NEW.status IN ('submitted','done') AND NEW.evidence_url='' THEN RAISE EXCEPTION 'An evidence link is required for submitted or accepted work' USING ERRCODE='23514'; END IF;
 NEW.updated_at:=now();RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.guard_project_task() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_project_task BEFORE INSERT OR UPDATE ON public.project_tasks FOR EACH ROW EXECUTE FUNCTION private.guard_project_task();
CREATE FUNCTION private.notify_project_task() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.assignee_id IS NOT NULL AND (TG_OP='INSERT' OR NEW.assignee_id IS DISTINCT FROM OLD.assignee_id OR NEW.status IS DISTINCT FROM OLD.status) THEN
  INSERT INTO public.notifications(user_id,type,title,body,link) VALUES(NEW.assignee_id,'project_task','Project task updated',NEW.title,'/portal/collaboration?project='||NEW.project_id::text);
 END IF;RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.notify_project_task() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER notify_project_task AFTER INSERT OR UPDATE ON public.project_tasks FOR EACH ROW EXECUTE FUNCTION private.notify_project_task();
CREATE FUNCTION private.notify_intake_status() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.status IS DISTINCT FROM OLD.status THEN
  INSERT INTO public.notifications(user_id,type,title,body,link) VALUES(NEW.applicant_id,'intake_status','Application status changed',replace(NEW.status,'_',' '),'/portal/apply');
 END IF;RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.notify_intake_status() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER notify_intake_status AFTER UPDATE ON public.intake_submissions FOR EACH ROW EXECUTE FUNCTION private.notify_intake_status();
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
    'project_memberships', COALESCE((SELECT jsonb_agg(to_jsonb(m)) FROM public.project_memberships m WHERE m.user_id=current_user_id),'[]'::jsonb),
    'assigned_project_tasks', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM public.project_tasks t WHERE t.assignee_id=current_user_id AND private.joins_project(t.project_id)),'[]'::jsonb),
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

INSERT INTO private.portal_schema_revisions(version,name) VALUES('20260924160333','project_collaboration');
COMMIT;
