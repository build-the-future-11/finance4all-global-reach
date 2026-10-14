BEGIN;
CREATE TABLE public.intake_calls (
 id text PRIMARY KEY CHECK (id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
 title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
 kind text NOT NULL CHECK (kind IN ('cohort','research','chapter','partnership','event','competition')),
 description text NOT NULL CHECK (char_length(description) BETWEEN 20 AND 3000),
 status text NOT NULL DEFAULT 'closed' CHECK (status IN ('interest','open','closed')),
 closes_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.intake_calls ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.intake_calls FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.intake_calls TO authenticated;
GRANT INSERT (id,title,kind,description,status,closes_at), UPDATE (title,kind,description,status,closes_at) ON public.intake_calls TO authenticated;
CREATE POLICY "Members read calls" ON public.intake_calls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins create calls" ON public.intake_calls FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "Admins update calls" ON public.intake_calls FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

CREATE TABLE public.intake_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 applicant_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
 call_id text NOT NULL REFERENCES public.intake_calls(id),
 motivation text NOT NULL CHECK (char_length(btrim(motivation)) BETWEEN 80 AND 4000),
 preparation text NOT NULL CHECK (char_length(btrim(preparation)) BETWEEN 30 AND 2000),
 availability text NOT NULL CHECK (char_length(btrim(availability)) BETWEEN 3 AND 160),
 work_url text CHECK (work_url IS NULL OR (char_length(work_url) <= 500 AND work_url ~ '^https://[^[:space:]@]+')),
 privacy_version text NOT NULL CHECK (privacy_version = '2026-09-21'),
 consent boolean NOT NULL CHECK (consent),
 status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','accepted','declined','withdrawn')),
 review_note text NOT NULL DEFAULT '' CHECK (char_length(review_note) <= 2000),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (applicant_id,call_id)
);
CREATE INDEX intake_submissions_queue ON public.intake_submissions (status,created_at,id);
CREATE INDEX intake_submissions_call ON public.intake_submissions (call_id);
ALTER TABLE public.intake_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.intake_submissions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.intake_submissions TO authenticated;
GRANT INSERT (id,call_id,motivation,preparation,availability,work_url,privacy_version,consent) ON public.intake_submissions TO authenticated;
GRANT UPDATE (status,review_note) ON public.intake_submissions TO authenticated;
CREATE POLICY "Private submission read" ON public.intake_submissions FOR SELECT TO authenticated
 USING (applicant_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
CREATE POLICY "Owner submission create" ON public.intake_submissions FOR INSERT TO authenticated
 WITH CHECK (applicant_id = (SELECT auth.uid()) AND status = 'submitted' AND review_note = '');
CREATE POLICY "Owner withdrawal or admin review" ON public.intake_submissions FOR UPDATE TO authenticated
 USING (applicant_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
 WITH CHECK ((applicant_id = (SELECT auth.uid()) AND status = 'withdrawn') OR (SELECT public.is_admin()));

-- Trigger-only elevated code, outside the exposed API schema. Account locks
-- prevent concurrent requests from racing through the submission cap.
CREATE FUNCTION private.guard_intake_submission() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE caller uuid := auth.uid(); target public.intake_calls; total integer;
BEGIN
 IF caller IS NULL THEN RAISE EXCEPTION 'Sign in before submitting' USING ERRCODE = '42501'; END IF;
 IF TG_OP = 'INSERT' THEN
  IF NEW.applicant_id <> caller THEN RAISE EXCEPTION 'Invalid applicant' USING ERRCODE = '42501'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(caller::text, 714));
  SELECT * INTO target FROM public.intake_calls WHERE id = NEW.call_id FOR SHARE;
  IF NOT FOUND OR target.status = 'closed' OR (target.closes_at IS NOT NULL AND target.closes_at <= now()) THEN
   RAISE EXCEPTION 'This intake is closed' USING ERRCODE = '23514';
  END IF;
  SELECT count(*) INTO total FROM public.intake_submissions WHERE applicant_id = caller AND created_at > now() - interval '24 hours';
  IF total >= 5 THEN RAISE EXCEPTION 'Submission limit reached. Try again after 24 hours.' USING ERRCODE = '23514'; END IF;
  NEW.created_at := now(); NEW.updated_at := now(); NEW.status := 'submitted'; NEW.review_note := '';
 ELSE
  IF (to_jsonb(NEW) - ARRAY['status','review_note','updated_at']) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['status','review_note','updated_at']) THEN
   RAISE EXCEPTION 'Submitted answers are immutable' USING ERRCODE = '42501';
  END IF;
  IF OLD.status = 'withdrawn' THEN RAISE EXCEPTION 'Withdrawn submissions cannot be reviewed' USING ERRCODE = '23514'; END IF;
  IF NOT public.is_admin() THEN
   IF caller <> OLD.applicant_id OR NEW.status <> 'withdrawn' OR NEW.review_note <> OLD.review_note THEN
    RAISE EXCEPTION 'Only withdrawal is permitted' USING ERRCODE = '42501';
   END IF;
  ELSIF NEW.status NOT IN ('under_review','accepted','declined','withdrawn') THEN
   RAISE EXCEPTION 'Invalid review status' USING ERRCODE = '23514';
  END IF;
  NEW.updated_at := now();
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.guard_intake_submission() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_intake_submission BEFORE INSERT OR UPDATE ON public.intake_submissions FOR EACH ROW EXECUTE FUNCTION private.guard_intake_submission();

-- General interest only: scheduled programs require their own reviewed call.
INSERT INTO public.intake_calls(id,title,kind,description,status) VALUES
 ('quant-research','Quantitative research interest','cohort','Describe your preparation and a question in factor models, portfolio evaluation, or market frictions. This is an expression of interest, not admission to a scheduled cohort.','interest'),
 ('financial-ml','Financial machine learning interest','cohort','Describe a representation-learning or forecasting question and how you would prevent leakage. No confirmed cohort dates or admission are implied.','interest'),
 ('economic-research','Economic research interest','cohort','Propose a macroeconomic, household-finance, or causal question. This records interest while program capacity and dates are being established.','interest'),
 ('investment-research','Investment research interest','cohort','Describe a source-led company or industry question. Work is educational and does not involve investing money through this platform.','interest'),
 ('research-engineering','Research engineering interest','research','Describe a reproducibility, data, benchmark, or interface contribution and relevant experience. This is an interest record, not an employment offer.','interest'),
 ('chapter-proposal','Start a chapter','chapter','Propose an audience, responsible organizers, meeting cadence, safeguarding plan, and first output. Approval is required before using the organization name.','interest'),
 ('research-submission','Submit research for consideration','research','Share a public manuscript or repository, question, methods, evidence and limitations. This is an editorial inquiry; peer review, acceptance and publication are not guaranteed.','interest'),
 ('partnership-proposal','Propose a collaboration','partnership','Describe the scope, accountable contact, resources, data permissions and intended output. Submission does not establish a partnership or endorsement.','interest');
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

INSERT INTO private.portal_schema_revisions(version,name) VALUES ('20260921141333','platform_intake') ON CONFLICT (version) DO NOTHING;
COMMIT;
