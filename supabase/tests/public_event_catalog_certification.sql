-- Disposable/rollback-only certification. No live publication or data change.
BEGIN;
INSERT INTO auth.users(id,email) VALUES
 ('84000000-0000-4000-8000-000000000001','event-admin@example.test'),
 ('84000000-0000-4000-8000-000000000002','event-member-a@example.test'),
 ('84000000-0000-4000-8000-000000000003','event-member-b@example.test');
UPDATE public.profiles SET role='admin' WHERE id='84000000-0000-4000-8000-000000000001';
INSERT INTO public.chapters(id,name,city,country,latitude,longitude,publication_state) VALUES
 ('84000000-0000-4000-8000-000000000010','Reviewed fixture chapter','Rome','Italy',41.9,12.5,'published'),
 ('84000000-0000-4000-8000-000000000011','Draft fixture chapter','Rome','Italy',41.9,12.5,'draft');
INSERT INTO public.events(id,chapter_id,title,description,starts_at,ends_at,public_listing,publication_state,event_details) VALUES
 ('84000000-0000-4000-8000-000000000020','84000000-0000-4000-8000-000000000010','Public approved event','Fixture description',now()+interval '2 days',now()+interval '2 days 1 hour',true,'published','{"host":"Fixture host","timezone":"Europe/Rome","internalContact":"private@example.test"}'),
 ('84000000-0000-4000-8000-000000000021','84000000-0000-4000-8000-000000000010','Member-only event','Fixture description',now()+interval '2 days',now()+interval '2 days 1 hour',false,'published','{}'),
 ('84000000-0000-4000-8000-000000000022','84000000-0000-4000-8000-000000000010','Unreviewed public request','Fixture description',now()+interval '2 days',now()+interval '2 days 1 hour',true,'draft','{}'),
 ('84000000-0000-4000-8000-000000000023','84000000-0000-4000-8000-000000000011','Draft chapter event','Fixture description',now()+interval '2 days',now()+interval '2 days 1 hour',true,'published','{}'),
 ('84000000-0000-4000-8000-000000000024','84000000-0000-4000-8000-000000000010','Held event','Fixture description',now()+interval '2 days',now()+interval '2 days 1 hour',false,'published','{"scheduleState":"on_hold"}'),
 ('84000000-0000-4000-8000-000000000025','84000000-0000-4000-8000-000000000010','Malformed registration date','Fixture description',now()+interval '2 days',now()+interval '2 days 1 hour',false,'published','{"registrationClosesAt":"not-a-date"}');
SET LOCAL ROLE anon;
DO $$ DECLARE event_data jsonb; BEGIN
 IF (SELECT count(*) FROM public.public_event_catalog() WHERE id::text LIKE '84000000%') <> 1 THEN RAISE EXCEPTION 'Anonymous approval/public opt-in/chapter boundary failed'; END IF;
 SELECT to_jsonb(e) INTO event_data FROM public.public_event_catalog('84000000-0000-4000-8000-000000000020') e;
 IF event_data->'event_details' ? 'internalContact' OR event_data ? 'publication_revision' OR event_data ? 'user_id' OR event_data ? 'member_count' THEN RAISE EXCEPTION 'Private fields leaked in public projection'; END IF;
 IF event_data->'event_details'->>'city' <> 'Rome' THEN RAISE EXCEPTION 'Published location missing'; END IF;
 IF EXISTS(SELECT 1 FROM public.public_event_catalog('84000000-0000-4000-8000-000000000021')) THEN RAISE EXCEPTION 'Targeted private record leaked'; END IF;
 BEGIN PERFORM * FROM public.events; RAISE EXCEPTION 'Anonymous direct event access'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM * FROM public.chapters; RAISE EXCEPTION 'Anonymous direct chapter access'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM * FROM public.event_registrations; RAISE EXCEPTION 'Anonymous registration exposure'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','84000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 UPDATE public.events SET public_listing=true WHERE id='84000000-0000-4000-8000-000000000021';
 IF FOUND THEN RAISE EXCEPTION 'Ordinary member changed public visibility'; END IF;
 BEGIN INSERT INTO public.event_registrations(user_id,event_id) VALUES(auth.uid(),'84000000-0000-4000-8000-000000000024'); RAISE EXCEPTION 'Hold accepted registration'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.event_registrations(user_id,event_id) VALUES(auth.uid(),'84000000-0000-4000-8000-000000000025'); RAISE EXCEPTION 'Invalid deadline accepted registration'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 INSERT INTO public.event_registrations(user_id,event_id) VALUES(auth.uid(),'84000000-0000-4000-8000-000000000020');
 -- INSERT gates cannot be bypassed by moving an existing owned registration.
 BEGIN UPDATE public.event_registrations SET event_id='84000000-0000-4000-8000-000000000024' WHERE user_id=auth.uid() AND event_id='84000000-0000-4000-8000-000000000020'; RAISE EXCEPTION 'Registration UPDATE bypassed hold'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN UPDATE public.event_registrations SET event_id='84000000-0000-4000-8000-000000000022' WHERE user_id=auth.uid() AND event_id='84000000-0000-4000-8000-000000000020'; RAISE EXCEPTION 'Registration UPDATE bypassed publication'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 IF NOT EXISTS (SELECT 1 FROM public.event_registrations WHERE user_id=auth.uid() AND event_id='84000000-0000-4000-8000-000000000020') THEN RAISE EXCEPTION 'Registration retargeted'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','84000000-0000-4000-8000-000000000003',true);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.event_registrations WHERE user_id='84000000-0000-4000-8000-000000000002') THEN RAISE EXCEPTION 'Cross-member registration leaked'; END IF;
 DELETE FROM public.event_registrations WHERE user_id='84000000-0000-4000-8000-000000000002';
 IF FOUND THEN RAISE EXCEPTION 'Cross-member registration deleted'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','84000000-0000-4000-8000-000000000001',true);
UPDATE public.events SET event_details=event_details || '{"scheduleState":"on_hold"}'::jsonb WHERE id='84000000-0000-4000-8000-000000000020';
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.events WHERE id='84000000-0000-4000-8000-000000000020' AND publication_state='draft' AND publication_revision=1) THEN RAISE EXCEPTION 'Metadata edit retained approval'; END IF;
 IF EXISTS(SELECT 1 FROM public.public_event_catalog('84000000-0000-4000-8000-000000000020')) THEN RAISE EXCEPTION 'Revised unapproved public event leaked'; END IF;
END $$;
-- Withdrawals remain possible after a hold/unpublication.
SELECT set_config('request.jwt.claim.sub','84000000-0000-4000-8000-000000000002',true);
DELETE FROM public.event_registrations WHERE event_id='84000000-0000-4000-8000-000000000020' AND user_id=auth.uid();
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.event_registrations WHERE event_id='84000000-0000-4000-8000-000000000020') THEN RAISE EXCEPTION 'Withdrawal blocked'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','84000000-0000-4000-8000-000000000001',true);
UPDATE public.events SET public_listing=true WHERE id='84000000-0000-4000-8000-000000000021';
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.events WHERE id='84000000-0000-4000-8000-000000000021' AND publication_state='draft') THEN RAISE EXCEPTION 'Public opt-in retained approval'; END IF;
END $$;
DO $$ BEGIN
 BEGIN
   UPDATE public.chapters SET chapter_status='active_verified' WHERE id='84000000-0000-4000-8000-000000000010';
   RAISE EXCEPTION 'Active chapter accepted without evidence';
 EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
UPDATE public.chapters SET chapter_status='active_verified', accepted_owner=true,
  permissions_confirmed=true, operating_evidence_url='https://example.test/reviewed-activity',
  last_activity_at=now()-interval '1 day'
  WHERE id='84000000-0000-4000-8000-000000000010';
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.chapters WHERE id='84000000-0000-4000-8000-000000000010' AND publication_state='draft') THEN RAISE EXCEPTION 'Chapter status edit retained approval'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','84000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 UPDATE public.chapters SET chapter_status='approved' WHERE id='84000000-0000-4000-8000-000000000010';
 IF FOUND THEN RAISE EXCEPTION 'Ordinary member changed chapter operating status'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
\echo PASS public event opt-in, approval/chapter gating, fixed projection, invalidation, registration hold, ownership, withdrawal and chapter evidence controls
