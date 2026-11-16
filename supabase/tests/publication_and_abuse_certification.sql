-- Disposable database / rollback-only. Never approves production content.
BEGIN;
INSERT INTO auth.users(id,email) VALUES
 ('81000000-0000-4000-8000-000000000001','publication-a@example.test'),
 ('81000000-0000-4000-8000-000000000002','publication-b@example.test'),
 ('81000000-0000-4000-8000-000000000003','publication-admin@example.test'),
 ('81000000-0000-4000-8000-000000000004','publication-lead@example.test');
UPDATE public.profiles SET role='admin' WHERE id='81000000-0000-4000-8000-000000000003';
UPDATE public.profiles SET role='lead_researcher' WHERE id='81000000-0000-4000-8000-000000000004';
INSERT INTO public.news_articles(id,title,summary,category) VALUES
 ('82000000-0000-4000-8000-000000000001','Unreviewed historical copy','This remains a private draft.','macro');
INSERT INTO public.essay_submissions(id,author_id,title,body) VALUES
 ('82000000-0000-4000-8000-000000000002','81000000-0000-4000-8000-000000000001','Private essay','Unreviewed essay body');
INSERT INTO public.essay_upvotes(essay_id,user_id) VALUES
 ('82000000-0000-4000-8000-000000000002','81000000-0000-4000-8000-000000000001');
DO $$ DECLARE relation text; BEGIN
 FOREACH relation IN ARRAY ARRAY['chapters','news_articles','explainer_cards','events','opportunities','research_projects','intake_calls','studio_submissions','essay_submissions','introduction_posts'] LOOP
   IF has_column_privilege('authenticated','public.'||relation,'publication_state','INSERT')
     OR has_column_privilege('authenticated','public.'||relation,'publication_state','UPDATE')
     OR has_column_privilege('authenticated','public.'||relation,'publication_revision','UPDATE') THEN
     RAISE EXCEPTION 'Publication metadata is client writable: %',relation;
   END IF;
   IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=relation AND policyname='Reviewed publication only' AND permissive='RESTRICTIVE') THEN
     RAISE EXCEPTION 'Missing restrictive publication policy: %',relation;
   END IF;
 END LOOP;
END $$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.news_articles WHERE id='82000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'Unreviewed news leaked'; END IF;
 IF EXISTS(SELECT 1 FROM public.essay_submissions_with_counts WHERE id='82000000-0000-4000-8000-000000000002') THEN RAISE EXCEPTION 'Draft essay leaked via view'; END IF;
 IF public.get_essay_upvote_count('82000000-0000-4000-8000-000000000002')<>0 THEN RAISE EXCEPTION 'Draft count leaked via RPC'; END IF;
 BEGIN PERFORM public.review_publication('news_articles','82000000-0000-4000-8000-000000000001',0,'published','Forged ordinary member review'); RAISE EXCEPTION 'Member published'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN UPDATE public.news_articles SET publication_state='published'; RAISE EXCEPTION 'Direct metadata write'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM * FROM private.member_write_budgets; RAISE EXCEPTION 'Counters exposed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM private.consume_member_budget('introduction_posts'); RAISE EXCEPTION 'Client chose budget'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM private.export_member_data_unmetered(); RAISE EXCEPTION 'Export bypass'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM * FROM private.publication_reviews; RAISE EXCEPTION 'Review audit exposed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.news_bookmarks(user_id,article_id) VALUES (auth.uid(),'82000000-0000-4000-8000-000000000001'); RAISE EXCEPTION 'Unpublished bookmark accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000004',true);
DO $$ BEGIN
 BEGIN PERFORM public.review_publication('news_articles','82000000-0000-4000-8000-000000000001',0,'published','Lead without editorial permission'); RAISE EXCEPTION 'Lead published'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000001',true);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.essay_submissions_with_counts WHERE id='82000000-0000-4000-8000-000000000002') THEN RAISE EXCEPTION 'Author lost draft access'; END IF;
 INSERT INTO public.introduction_posts(author_id,headline,looking_for) SELECT auth.uid(),'Budget fixture '||n,'Test only' FROM generate_series(1,4)n;
 BEGIN
   INSERT INTO public.introduction_posts(author_id,headline,looking_for) SELECT auth.uid(),'Atomic batch '||n,'Test only' FROM generate_series(1,2)n;
   RAISE EXCEPTION 'Over-budget batch succeeded';
 EXCEPTION WHEN SQLSTATE 'PT429' THEN NULL; END;
 IF (SELECT count(*) FROM public.introduction_posts WHERE author_id=auth.uid())<>4 THEN RAISE EXCEPTION 'Failed batch was partially committed'; END IF;
 INSERT INTO public.introduction_posts(author_id,headline,looking_for) VALUES(auth.uid(),'Fifth valid introduction','Test only');
 BEGIN INSERT INTO public.introduction_posts(author_id,headline,looking_for) VALUES(auth.uid(),'Over limit','Test only'); RAISE EXCEPTION 'Hourly cap bypass'; EXCEPTION WHEN SQLSTATE 'PT429' THEN NULL; END;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF (SELECT used FROM private.member_write_budgets WHERE user_id='81000000-0000-4000-8000-000000000001' AND action='introduction_posts')<>5 THEN RAISE EXCEPTION 'Rolled back writes consumed slots'; END IF;
END $$;
UPDATE private.member_write_budgets SET window_started_at=now()-interval '2 hours' WHERE user_id='81000000-0000-4000-8000-000000000001';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000001',true);
INSERT INTO public.introduction_posts(author_id,headline,looking_for) VALUES(auth.uid(),'Next window','Test only');
DO $$ BEGIN
 BEGIN INSERT INTO public.introduction_posts(author_id,headline,looking_for) VALUES(auth.uid(),'Oversized fixture',repeat('x',65536)); RAISE EXCEPTION 'Oversized member record allowed'; EXCEPTION WHEN string_data_right_truncation THEN NULL; END;
 FOR i IN 1..5 LOOP PERFORM public.export_my_data(); END LOOP;
 BEGIN PERFORM public.export_my_data(); RAISE EXCEPTION 'Export quota bypass'; EXCEPTION WHEN SQLSTATE 'PT429' THEN NULL; END;
 PERFORM public.request_account_deletion('Disposable cancellation test');
END $$;
RESET ROLE;
UPDATE private.member_write_budgets SET used=600 WHERE user_id='81000000-0000-4000-8000-000000000001' AND action='all_writes';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000001',true);
DO $$ BEGIN
 PERFORM public.cancel_account_deletion();
 IF NOT EXISTS(SELECT 1 FROM public.account_deletion_requests WHERE user_id=auth.uid() AND status='cancelled') THEN RAISE EXCEPTION 'Exhausted activity budget blocked cancellation'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000003',true);
DO $$ BEGIN
 BEGIN PERFORM public.review_publication('profiles','81000000-0000-4000-8000-000000000001',0,'published','Invalid target table'); RAISE EXCEPTION 'Arbitrary table review allowed'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.review_publication('news_articles','82000000-0000-4000-8000-000000000001',0,NULL,'Null state is invalid'); RAISE EXCEPTION 'Null state allowed'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.review_publication('news_articles','82000000-0000-4000-8000-000000000001',0,'published','short'); RAISE EXCEPTION 'Empty evidence allowed'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $$;
SELECT public.review_publication('news_articles','82000000-0000-4000-8000-000000000001',0,'published','Fixture sources and permissions reviewed.');
SELECT set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.news_articles WHERE id='82000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'Published article unavailable'; END IF;
END $$;
INSERT INTO public.news_bookmarks(user_id,article_id) VALUES(auth.uid(),'82000000-0000-4000-8000-000000000001');
SELECT set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000003',true);
UPDATE public.news_articles SET title='Revised copy needs review' WHERE id='82000000-0000-4000-8000-000000000001';
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.news_articles WHERE id='82000000-0000-4000-8000-000000000001' AND publication_state='draft' AND publication_revision=2) THEN RAISE EXCEPTION 'Edit retained approval'; END IF;
 BEGIN PERFORM public.review_publication('news_articles','82000000-0000-4000-8000-000000000001',1,'published','Stale reviewer attempted publication'); RAISE EXCEPTION 'Stale approval accepted'; EXCEPTION WHEN serialization_failure THEN NULL; END;
END $$;
SELECT public.review_publication('news_articles','82000000-0000-4000-8000-000000000001',2,'archived','Archived pending editorial correction.');
SELECT set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.news_articles WHERE id='82000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'Archived article leaked'; END IF;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF (SELECT count(*) FROM private.publication_reviews WHERE content_id='82000000-0000-4000-8000-000000000001')<>3 THEN RAISE EXCEPTION 'Missing review/change audit'; END IF;
 IF (SELECT used FROM private.member_write_budgets WHERE user_id='81000000-0000-4000-8000-000000000001' AND action='introduction_posts')<>1 THEN RAISE EXCEPTION 'Expired budget did not reset'; END IF;
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN PERFORM public.review_publication('news_articles','82000000-0000-4000-8000-000000000001',3,'published','Anonymous review attempt'); RAISE EXCEPTION 'Anonymous publication allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM * FROM public.news_articles; RAISE EXCEPTION 'Anonymous member content read'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000003',true);
SET LOCAL ROLE authenticated;
SELECT public.review_publication('essay_submissions','82000000-0000-4000-8000-000000000002',0,'published','Essay sources and permissions reviewed.');
RESET ROLE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM private.member_write_budgets WHERE user_id='81000000-0000-4000-8000-000000000003' AND action='essay_submissions') THEN RAISE EXCEPTION 'Publication consumed a submission allowance'; END IF;
 IF (SELECT used FROM private.member_write_budgets WHERE user_id='81000000-0000-4000-8000-000000000003' AND action='all_writes')<>3 THEN RAISE EXCEPTION 'Review aggregate budget was charged twice'; END IF;
 IF (SELECT used FROM private.member_write_budgets WHERE user_id='81000000-0000-4000-8000-000000000003' AND action='publication_review')<>3 THEN RAISE EXCEPTION 'Review budget did not count every review'; END IF;
END $$;
ROLLBACK;
\echo PASS publication states, all ten metadata grants/policies, actor isolation, stale reviews, audit, write limits, atomic rollback and rollover
