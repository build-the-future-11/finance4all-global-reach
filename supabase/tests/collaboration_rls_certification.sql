-- Isolated test identities; the complete suite rolls back.
BEGIN;
INSERT INTO auth.users(id,email) VALUES
 ('50000000-0000-4000-8000-000000000001','lead@example.test'),
 ('50000000-0000-4000-8000-000000000002','participant@example.test'),
 ('50000000-0000-4000-8000-000000000003','outsider@example.test');
INSERT INTO public.research_projects(id,title,description,status,lead_researcher_id)
VALUES ('60000000-0000-4000-8000-000000000001','Authorization test','Rollback-only fixture','open','50000000-0000-4000-8000-000000000001');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000001',true);
INSERT INTO public.project_memberships(project_id,user_id)
VALUES ('60000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000002');
INSERT INTO public.project_tasks(project_id,title)
VALUES ('60000000-0000-4000-8000-000000000001','Bounded test task');
SELECT set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.project_tasks)<>0 THEN RAISE EXCEPTION 'Invitation grants premature task access'; END IF;
END $$;
UPDATE public.project_memberships SET status='active';
DO $$ BEGIN
 IF (SELECT count(*) FROM public.project_tasks)<>1 THEN RAISE EXCEPTION 'Accepted member cannot read tasks'; END IF;
 UPDATE public.project_tasks SET status='in_progress';
 IF FOUND THEN RAISE EXCEPTION 'Unassigned participant changed a task'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000001',true);
UPDATE public.project_tasks SET assignee_id='50000000-0000-4000-8000-000000000002';
SELECT set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 BEGIN UPDATE public.project_tasks SET title='Forged detail'; RAISE EXCEPTION 'Participant changed manager-only details'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN UPDATE public.project_tasks SET status='done',evidence_url='https://example.test/evidence'; RAISE EXCEPTION 'Participant accepted own work'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN UPDATE public.project_tasks SET status='submitted'; RAISE EXCEPTION 'Submission without evidence allowed'; EXCEPTION WHEN check_violation THEN NULL; END;
 UPDATE public.project_tasks SET status='submitted',evidence_url='https://example.test/evidence' WHERE revision=1;
 IF NOT FOUND THEN RAISE EXCEPTION 'Assignee cannot submit evidence'; END IF;
 UPDATE public.project_tasks SET status='in_progress' WHERE revision=1;
 IF FOUND THEN RAISE EXCEPTION 'Stale revision overwrote a submission'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000003',true);
DO $$ BEGIN
 BEGIN PERFORM * FROM private.portal_schema_revisions; RAISE EXCEPTION 'Private ledger exposed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 IF EXISTS(SELECT 1 FROM public.project_tasks) OR EXISTS(SELECT 1 FROM public.project_memberships) THEN RAISE EXCEPTION 'Outsider reads private collaboration'; END IF;
 UPDATE public.project_tasks SET status='done';
 IF FOUND THEN RAISE EXCEPTION 'Outsider modifies task'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000001',true);
UPDATE public.project_tasks SET status='done' WHERE revision=2;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.project_tasks WHERE status='done' AND revision=3) THEN RAISE EXCEPTION 'Manager acceptance failed'; END IF;
END $$;
UPDATE public.project_memberships SET status='removed';
SELECT set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.project_tasks) THEN RAISE EXCEPTION 'Removed member retains access'; END IF;
 IF jsonb_array_length(public.export_my_data()->'assigned_project_tasks')<>0 THEN RAISE EXCEPTION 'Export bypasses removed access'; END IF;
 RAISE NOTICE 'PASS collaboration invitation, membership, role, evidence, revision and removal boundaries';
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN PERFORM * FROM public.project_tasks; RAISE EXCEPTION 'Anonymous task access'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;
