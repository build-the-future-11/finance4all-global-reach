-- Local/CI transaction: all identities and submissions are rolled back.
BEGIN;
INSERT INTO auth.users(instance_id,id,aud,role,email,encrypted_password,confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
SELECT '00000000-0000-0000-0000-000000000000', id::uuid, 'authenticated','authenticated', email,'',now(),'{"provider":"email"}'::jsonb,'{}'::jsonb,now(),now()
FROM (VALUES ('20000000-0000-4000-8000-000000000001','intake-a@example.test'),('20000000-0000-4000-8000-000000000002','intake-b@example.test'),('20000000-0000-4000-8000-000000000003','intake-admin@example.test')) v(id,email);
UPDATE public.profiles SET role='admin' WHERE id='20000000-0000-4000-8000-000000000003';
INSERT INTO public.intake_calls(id,title,kind,description,status,closes_at) VALUES
 ('test-closed','Closed intake','cohort','An intentionally closed test call.','closed',NULL),
 ('test-expired','Expired intake','cohort','An intentionally expired test call.','open',now()-interval '1 hour');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.role','authenticated',true);
SELECT set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
INSERT INTO public.intake_submissions(id,call_id,motivation,preparation,availability,privacy_version,consent)
VALUES ('30000000-0000-4000-8000-000000000001','quant-research',repeat('Research question. ',8),repeat('Preparation. ',5),'4 hours UTC','2026-09-21',true);
DO $$ BEGIN
 IF jsonb_array_length(public.export_my_data()->'intake_submissions')<>1 THEN RAISE EXCEPTION 'Intake export missing'; END IF;
 IF (SELECT count(*) FROM public.intake_submissions)<>1 THEN RAISE EXCEPTION 'Owner cannot read receipt'; END IF;
 BEGIN UPDATE public.intake_submissions SET status='accepted'; RAISE EXCEPTION 'Owner self-accept allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN UPDATE public.intake_submissions SET review_note='Changed'; RAISE EXCEPTION 'Owner review note edit allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.intake_submissions(call_id,motivation,preparation,availability,privacy_version,consent) VALUES ('quant-research',repeat('Question ',15),repeat('Prepared ',8),'4 hours','2026-09-21',true); RAISE EXCEPTION 'Duplicate accepted'; EXCEPTION WHEN unique_violation THEN NULL; END;
 BEGIN INSERT INTO public.intake_submissions(call_id,motivation,preparation,availability,privacy_version,consent) VALUES ('financial-ml','short','short','4 hours','2026-09-21',true); RAISE EXCEPTION 'Invalid length accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN INSERT INTO public.intake_submissions(call_id,motivation,preparation,availability,privacy_version,consent) VALUES ('test-closed',repeat('Question ',15),repeat('Prepared ',8),'4 hours','2026-09-21',true); RAISE EXCEPTION 'Closed call accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN INSERT INTO public.intake_submissions(call_id,motivation,preparation,availability,privacy_version,consent) VALUES ('test-expired',repeat('Question ',15),repeat('Prepared ',8),'4 hours','2026-09-21',true); RAISE EXCEPTION 'Expired call accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN INSERT INTO public.intake_submissions(call_id,motivation,preparation,availability,privacy_version,consent) VALUES ('financial-ml',repeat('Question ',15),repeat('Prepared ',8),'4 hours','2026-09-21',false); RAISE EXCEPTION 'Consent bypass accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN INSERT INTO public.intake_submissions(applicant_id,call_id,motivation,preparation,availability,privacy_version,consent) VALUES ('20000000-0000-4000-8000-000000000002','financial-ml',repeat('Question ',15),repeat('Prepared ',8),'4 hours','2026-09-21',true); RAISE EXCEPTION 'Owner spoof accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN UPDATE public.intake_calls SET status='open' WHERE id='test-closed'; IF FOUND THEN RAISE EXCEPTION 'Member opened intake'; END IF; END;
 RAISE NOTICE 'PASS owner access, self-accept denial, note protection, duplicates, lengths, closure, expiry, consent, spoofing, call authorization';
END $$;
SELECT set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 IF jsonb_array_length(public.export_my_data()->'intake_submissions')<>0 THEN RAISE EXCEPTION 'Cross-account export allowed'; END IF;
 IF EXISTS(SELECT 1 FROM public.intake_submissions) THEN RAISE EXCEPTION 'Cross-account read allowed'; END IF;
 UPDATE public.intake_submissions SET status='withdrawn' WHERE id='30000000-0000-4000-8000-000000000001';
 IF FOUND THEN RAISE EXCEPTION 'Cross-account mutation allowed'; END IF;
 RAISE NOTICE 'PASS cross-account read and write isolation';
END $$;
SELECT set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000003',true);
UPDATE public.intake_submissions SET status='under_review',review_note='Review started' WHERE id='30000000-0000-4000-8000-000000000001';
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.intake_submissions WHERE status='under_review' AND review_note='Review started') THEN RAISE EXCEPTION 'Admin review failed'; END IF;
 BEGIN UPDATE public.intake_submissions SET motivation='Changed'; RAISE EXCEPTION 'Admin altered answers'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 RAISE NOTICE 'PASS admin review and immutable answers';
END $$;
SELECT set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
UPDATE public.intake_submissions SET status='withdrawn' WHERE id='30000000-0000-4000-8000-000000000001';
INSERT INTO public.intake_submissions(call_id,motivation,preparation,availability,privacy_version,consent)
SELECT id,repeat('Question ',15),repeat('Prepared ',8),'4 hours','2026-09-21',true FROM public.intake_calls WHERE id IN ('financial-ml','economic-research','investment-research','research-engineering');
DO $$ BEGIN
 BEGIN INSERT INTO public.intake_submissions(call_id,motivation,preparation,availability,privacy_version,consent) VALUES ('chapter-proposal',repeat('Question ',15),repeat('Prepared ',8),'4 hours','2026-09-21',true); RAISE EXCEPTION 'Rate cap bypass'; EXCEPTION WHEN check_violation THEN NULL; END;
 IF (SELECT count(*) FROM public.intake_submissions)<>5 THEN RAISE EXCEPTION 'Quota invariant failed'; END IF;
 RAISE NOTICE 'PASS withdrawal retained and five-per-day cap';
END $$;
SELECT set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000003',true);
DO $$ BEGIN
 BEGIN UPDATE public.intake_submissions SET status='accepted' WHERE id='30000000-0000-4000-8000-000000000001'; RAISE EXCEPTION 'Withdrawn review allowed'; EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN PERFORM * FROM public.intake_submissions; RAISE EXCEPTION 'Anonymous access'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 RAISE NOTICE 'PASS anonymous access denied';
END $$;
RESET ROLE;
DELETE FROM auth.users WHERE id='20000000-0000-4000-8000-000000000001';
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.intake_submissions WHERE applicant_id='20000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'Deletion cascade failed'; END IF;
 RAISE NOTICE 'PASS account deletion removes intake data';
END $$;
ROLLBACK;
