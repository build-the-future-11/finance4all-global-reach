-- Transaction-only production authorization certification.
-- Requires at least two ordinary profiles. Every fixture and mutation is rolled back.

BEGIN;

CREATE TEMP TABLE portal_certification_members AS
SELECT id, pg_catalog.row_number() OVER (ORDER BY created_at, id) AS ordinal
FROM public.profiles
WHERE role = 'member'::public.user_role
ORDER BY created_at, id
LIMIT 2;

CREATE TEMP TABLE portal_certification_fixtures (
  fixture text PRIMARY KEY,
  id uuid NOT NULL
);

GRANT SELECT ON TABLE portal_certification_members TO authenticated;
GRANT SELECT ON TABLE portal_certification_fixtures TO authenticated;

DO $preflight$
DECLARE
  missing_tables text;
  unexpected_tables text;
  rls_disabled_tables text;
  anon_accessible_tables text;
BEGIN
  IF (SELECT pg_catalog.count(*) FROM portal_certification_members) <> 2 THEN
    RAISE EXCEPTION 'two ordinary member profiles are required';
  END IF;

  SELECT pg_catalog.string_agg(expected.table_name, ', ' ORDER BY expected.table_name)
  INTO missing_tables
  FROM (
    VALUES
      ('chapters'),
      ('connection_requests'),
      ('digest_preferences'),
      ('education_lesson_progress'),
      ('essay_submissions'),
      ('essay_upvotes'),
      ('event_registrations'),
      ('events'),
      ('explainer_cards'),
      ('introduction_posts'),
      ('lab_applications'),
      ('news_articles'),
      ('news_bookmarks'),
      ('notifications'),
      ('opportunities'),
      ('opportunity_interests'),
      ('profiles'),
      ('project_bookmarks'),
      ('research_projects'),
      ('studio_submissions')
  ) AS expected(table_name)
  WHERE pg_catalog.to_regclass(pg_catalog.format('public.%I', expected.table_name)) IS NULL;

  IF missing_tables IS NOT NULL THEN
    RAISE EXCEPTION 'expected public tables are missing: %', missing_tables;
  END IF;

  SELECT pg_catalog.string_agg(c.relname, ', ' ORDER BY c.relname)
  INTO unexpected_tables
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind IN ('r', 'p')
    AND c.relname <> ALL (ARRAY[
      'chapters', 'connection_requests', 'digest_preferences',
      'education_lesson_progress', 'essay_submissions', 'essay_upvotes',
      'event_registrations', 'events', 'explainer_cards',
      'introduction_posts', 'lab_applications', 'news_articles',
      'news_bookmarks', 'notifications', 'opportunities',
      'opportunity_interests', 'profiles', 'project_bookmarks',
      'research_projects', 'studio_submissions'
    ]);

  IF unexpected_tables IS NOT NULL THEN
    RAISE EXCEPTION 'unexpected public tables require explicit certification: %', unexpected_tables;
  END IF;

  SELECT pg_catalog.string_agg(c.relname, ', ' ORDER BY c.relname)
  INTO rls_disabled_tables
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind IN ('r', 'p')
    AND NOT c.relrowsecurity;

  IF rls_disabled_tables IS NOT NULL THEN
    RAISE EXCEPTION 'public tables without RLS: %', rls_disabled_tables;
  END IF;

  SELECT pg_catalog.string_agg(c.relname, ', ' ORDER BY c.relname)
  INTO anon_accessible_tables
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind IN ('r', 'p')
    AND (
      pg_catalog.has_table_privilege('anon', c.oid, 'SELECT')
      OR pg_catalog.has_table_privilege('anon', c.oid, 'INSERT')
      OR pg_catalog.has_table_privilege('anon', c.oid, 'UPDATE')
      OR pg_catalog.has_table_privilege('anon', c.oid, 'DELETE')
    );

  IF anon_accessible_tables IS NOT NULL THEN
    RAISE EXCEPTION 'anonymous role retains public table privileges: %', anon_accessible_tables;
  END IF;

  IF pg_catalog.has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE')
    OR pg_catalog.has_function_privilege('authenticated', 'public.notify_connection_request()', 'EXECUTE')
    OR pg_catalog.has_function_privilege('authenticated', 'public.notify_connection_accepted()', 'EXECUTE')
    OR pg_catalog.has_function_privilege('authenticated', 'public.notify_lab_application_received()', 'EXECUTE')
    OR pg_catalog.has_function_privilege('authenticated', 'public.notify_lab_application_status()', 'EXECUTE')
    OR pg_catalog.has_function_privilege('authenticated', 'public.sync_chapter_member_counts()', 'EXECUTE')
    OR pg_catalog.has_function_privilege('authenticated', 'public.enforce_profile_insert_defaults()', 'EXECUTE')
    OR pg_catalog.has_function_privilege('authenticated', 'public.protect_profile_role()', 'EXECUTE')
  THEN
    RAISE EXCEPTION 'authenticated role can execute an internal privileged function';
  END IF;
END;
$preflight$;

DO $fixtures$
DECLARE
  member_a uuid := (SELECT id FROM portal_certification_members WHERE ordinal = 1);
  member_b uuid := (SELECT id FROM portal_certification_members WHERE ordinal = 2);
  chapter_id uuid := pg_catalog.gen_random_uuid();
  news_id uuid := pg_catalog.gen_random_uuid();
  alternate_news_id uuid := pg_catalog.gen_random_uuid();
  explainer_id uuid := pg_catalog.gen_random_uuid();
  project_id uuid := pg_catalog.gen_random_uuid();
  draft_project_id uuid := pg_catalog.gen_random_uuid();
  opportunity_id uuid := pg_catalog.gen_random_uuid();
  alternate_opportunity_id uuid := pg_catalog.gen_random_uuid();
  studio_id uuid := pg_catalog.gen_random_uuid();
  essay_id uuid := pg_catalog.gen_random_uuid();
  event_id uuid := pg_catalog.gen_random_uuid();
  alternate_event_id uuid := pg_catalog.gen_random_uuid();
  connection_id uuid := pg_catalog.gen_random_uuid();
  introduction_id uuid := pg_catalog.gen_random_uuid();
  application_id uuid := pg_catalog.gen_random_uuid();
  notification_id uuid := pg_catalog.gen_random_uuid();
BEGIN
  INSERT INTO public.chapters (id, name, city, country, latitude, longitude)
  VALUES (chapter_id, 'Certification chapter', 'Test city', 'Test country', 0, 0);

  INSERT INTO public.news_articles (id, title, summary, category)
  VALUES
    (news_id, 'Certification article', 'Rollback-only fixture', 'markets'),
    (alternate_news_id, 'Alternate certification article', 'Rollback-only fixture', 'macro');

  INSERT INTO public.explainer_cards (id, slug, title, summary, body)
  VALUES (
    explainer_id,
    'certification-' || explainer_id::text,
    'Certification explainer',
    'Rollback-only fixture',
    'Rollback-only fixture'
  );

  INSERT INTO public.research_projects (
    id, title, description, status, lead_researcher_id
  ) VALUES
    (project_id, 'Certification project', 'Rollback-only fixture', 'open', member_b),
    (draft_project_id, 'Private draft project', 'Rollback-only fixture', 'draft', member_b);

  INSERT INTO public.opportunities (id, title, organization, type, description)
  VALUES
    (opportunity_id, 'Certification opportunity', 'FinanceMeta', 'program', 'Rollback-only fixture'),
    (alternate_opportunity_id, 'Alternate certification opportunity', 'FinanceMeta', 'program', 'Rollback-only fixture');

  INSERT INTO public.studio_submissions (id, author_id, title, writeup)
  VALUES (studio_id, member_b, 'Member B studio fixture', 'Rollback-only fixture');

  INSERT INTO public.essay_submissions (id, author_id, title, body)
  VALUES (essay_id, member_b, 'Member B essay fixture', 'Rollback-only fixture');

  INSERT INTO public.events (
    id, chapter_id, title, description, status, starts_at
  ) VALUES
    (event_id, chapter_id, 'Certification event', 'Rollback-only fixture', 'upcoming', pg_catalog.now() + interval '1 day'),
    (alternate_event_id, chapter_id, 'Alternate certification event', 'Rollback-only fixture', 'upcoming', pg_catalog.now() + interval '2 days');

  INSERT INTO public.connection_requests (
    id, from_user_id, to_user_id, status, message
  ) VALUES (connection_id, member_b, member_a, 'pending', 'Rollback-only fixture');

  INSERT INTO public.introduction_posts (
    id, author_id, headline, looking_for, interests
  ) VALUES (introduction_id, member_b, 'Member B fixture', 'Rollback-only fixture', '{}');

  INSERT INTO public.lab_applications (
    id, project_id, applicant_id, motivation
  ) VALUES (application_id, project_id, member_b, 'Rollback-only fixture');

  INSERT INTO public.digest_preferences (user_id, weekly_digest_enabled)
  VALUES (member_b, true);

  INSERT INTO public.education_lesson_progress (user_id, lesson_id)
  VALUES (member_b, 'certification-member-b');

  INSERT INTO public.news_bookmarks (user_id, article_id)
  VALUES (member_b, news_id);

  INSERT INTO public.project_bookmarks (user_id, project_id)
  VALUES (member_b, project_id);

  INSERT INTO public.opportunity_interests (opportunity_id, user_id)
  VALUES (opportunity_id, member_b);

  INSERT INTO public.event_registrations (event_id, user_id)
  VALUES (event_id, member_b);

  INSERT INTO public.essay_upvotes (essay_id, user_id)
  VALUES (essay_id, member_b);

  INSERT INTO public.notifications (id, user_id, type, title, body)
  VALUES (notification_id, member_b, 'connection_request', 'Member B fixture', 'Rollback-only fixture');

  INSERT INTO portal_certification_fixtures (fixture, id) VALUES
    ('chapter', chapter_id),
    ('news', news_id),
    ('alternate_news', alternate_news_id),
    ('explainer', explainer_id),
    ('project', project_id),
    ('draft_project', draft_project_id),
    ('opportunity', opportunity_id),
    ('alternate_opportunity', alternate_opportunity_id),
    ('studio', studio_id),
    ('essay', essay_id),
    ('event', event_id),
    ('alternate_event', alternate_event_id),
    ('connection', connection_id),
    ('introduction', introduction_id),
    ('application', application_id),
    ('notification', notification_id);
END;
$fixtures$;

SET LOCAL ROLE authenticated;
DO $claims$
BEGIN
  PERFORM pg_catalog.set_config(
    'request.jwt.claim.sub',
    (SELECT id::text FROM portal_certification_members WHERE ordinal = 1),
    true
  );
  PERFORM pg_catalog.set_config('request.jwt.claim.role', 'authenticated', true);
END;
$claims$;

DO $member_checks$
DECLARE
  member_a uuid := (SELECT id FROM portal_certification_members WHERE ordinal = 1);
  member_b uuid := (SELECT id FROM portal_certification_members WHERE ordinal = 2);
  chapter_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'chapter');
  news_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'news');
  alternate_news_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'alternate_news');
  explainer_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'explainer');
  project_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'project');
  draft_project_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'draft_project');
  opportunity_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'opportunity');
  alternate_opportunity_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'alternate_opportunity');
  studio_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'studio');
  essay_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'essay');
  event_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'event');
  alternate_event_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'alternate_event');
  connection_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'connection');
  introduction_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'introduction');
  application_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'application');
  notification_id uuid := (SELECT id FROM portal_certification_fixtures WHERE fixture = 'notification');
  own_studio_id uuid;
  own_essay_id uuid;
  own_introduction_id uuid;
  own_application_id uuid;
  affected integer;
BEGIN
  BEGIN
    PERFORM email FROM public.profiles LIMIT 1;
    RAISE EXCEPTION 'profile email was readable by an ordinary member';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    UPDATE public.profiles SET role = 'admin'::public.user_role WHERE id = member_a;
    RAISE EXCEPTION 'ordinary member changed their role';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  UPDATE public.profiles SET bio = bio WHERE id = member_a;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN
    RAISE EXCEPTION 'ordinary member could not update their allowed profile fields';
  END IF;

  UPDATE public.profiles SET bio = bio WHERE id = member_b;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'ordinary member updated another profile';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.chapters WHERE id = chapter_id)
    OR NOT EXISTS (SELECT 1 FROM public.news_articles WHERE id = news_id)
    OR NOT EXISTS (SELECT 1 FROM public.explainer_cards WHERE id = explainer_id)
    OR NOT EXISTS (SELECT 1 FROM public.research_projects WHERE id = project_id)
    OR NOT EXISTS (SELECT 1 FROM public.opportunities WHERE id = opportunity_id)
    OR NOT EXISTS (SELECT 1 FROM public.studio_submissions WHERE id = studio_id)
    OR NOT EXISTS (SELECT 1 FROM public.essay_submissions WHERE id = essay_id)
    OR NOT EXISTS (SELECT 1 FROM public.events WHERE id = event_id)
    OR NOT EXISTS (SELECT 1 FROM public.introduction_posts WHERE id = introduction_id)
  THEN
    RAISE EXCEPTION 'ordinary member could not read an intended member-visible surface';
  END IF;

  IF EXISTS (SELECT 1 FROM public.research_projects WHERE id = draft_project_id) THEN
    RAISE EXCEPTION 'ordinary member read another member-owned draft project';
  END IF;

  IF EXISTS (SELECT 1 FROM public.digest_preferences WHERE user_id = member_b)
    OR EXISTS (SELECT 1 FROM public.education_lesson_progress WHERE user_id = member_b)
    OR EXISTS (SELECT 1 FROM public.news_bookmarks WHERE user_id = member_b)
    OR EXISTS (SELECT 1 FROM public.project_bookmarks WHERE user_id = member_b)
    OR EXISTS (SELECT 1 FROM public.opportunity_interests WHERE user_id = member_b)
    OR EXISTS (SELECT 1 FROM public.event_registrations WHERE user_id = member_b)
    OR EXISTS (SELECT 1 FROM public.essay_upvotes WHERE user_id = member_b)
    OR EXISTS (SELECT 1 FROM public.notifications WHERE id = notification_id)
    OR EXISTS (SELECT 1 FROM public.lab_applications WHERE id = application_id)
  THEN
    RAISE EXCEPTION 'ordinary member read another member-owned private data';
  END IF;

  INSERT INTO public.digest_preferences (user_id, weekly_digest_enabled)
  VALUES (member_a, true);
  UPDATE public.digest_preferences SET weekly_digest_enabled = false WHERE user_id = member_a;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN
    RAISE EXCEPTION 'ordinary member could not persist their digest preference';
  END IF;

  UPDATE public.digest_preferences SET weekly_digest_enabled = false WHERE user_id = member_b;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'ordinary member updated another digest preference';
  END IF;

  INSERT INTO public.education_lesson_progress (user_id, lesson_id)
  VALUES (member_a, 'certification-member-a');
  BEGIN
    INSERT INTO public.education_lesson_progress (user_id, lesson_id)
    VALUES (member_b, 'certification-forged-member-b');
    RAISE EXCEPTION 'ordinary member forged another member education progress';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  INSERT INTO public.news_bookmarks (user_id, article_id)
  VALUES (member_a, news_id);
  BEGIN
    INSERT INTO public.news_bookmarks (user_id, article_id)
    VALUES (member_b, alternate_news_id);
    RAISE EXCEPTION 'ordinary member forged another member news bookmark';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  INSERT INTO public.project_bookmarks (user_id, project_id)
  VALUES (member_a, project_id);
  BEGIN
    INSERT INTO public.project_bookmarks (user_id, project_id)
    VALUES (member_b, draft_project_id);
    RAISE EXCEPTION 'ordinary member forged another member project bookmark';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  INSERT INTO public.opportunity_interests (opportunity_id, user_id)
  VALUES (alternate_opportunity_id, member_a);
  BEGIN
    INSERT INTO public.opportunity_interests (opportunity_id, user_id)
    VALUES (alternate_opportunity_id, member_b);
    RAISE EXCEPTION 'ordinary member forged another member opportunity interest';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  INSERT INTO public.event_registrations (event_id, user_id)
  VALUES (alternate_event_id, member_a);
  BEGIN
    INSERT INTO public.event_registrations (event_id, user_id)
    VALUES (alternate_event_id, member_b);
    RAISE EXCEPTION 'ordinary member forged another member event registration';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  INSERT INTO public.studio_submissions (author_id, title, writeup)
  VALUES (member_a, 'Member A certification fixture', 'Rollback-only fixture')
  RETURNING id INTO own_studio_id;

  UPDATE public.studio_submissions SET title = title WHERE id = own_studio_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN
    RAISE EXCEPTION 'ordinary member could not update their studio submission';
  END IF;

  UPDATE public.studio_submissions SET title = title WHERE id = studio_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'ordinary member updated another studio submission';
  END IF;

  BEGIN
    UPDATE public.studio_submissions SET author_id = member_b WHERE id = own_studio_id;
    RAISE EXCEPTION 'ordinary member transferred studio ownership';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  INSERT INTO public.essay_submissions (author_id, title, body)
  VALUES (member_a, 'Member A certification essay', 'Rollback-only fixture')
  RETURNING id INTO own_essay_id;

  BEGIN
    INSERT INTO public.essay_submissions (author_id, title, body, is_editorial_pick)
    VALUES (member_a, 'Forged editorial essay', 'Rollback-only fixture', true);
    RAISE EXCEPTION 'ordinary member awarded an editorial pick';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  INSERT INTO public.essay_upvotes (essay_id, user_id)
  VALUES (essay_id, member_a);
  BEGIN
    INSERT INTO public.essay_upvotes (essay_id, user_id)
    VALUES (own_essay_id, member_b);
    RAISE EXCEPTION 'ordinary member forged another member essay upvote';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  INSERT INTO public.introduction_posts (author_id, headline, looking_for)
  VALUES (member_a, 'Member A certification introduction', 'Rollback-only fixture')
  RETURNING id INTO own_introduction_id;

  DELETE FROM public.introduction_posts WHERE id = introduction_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'ordinary member deleted another introduction';
  END IF;

  DELETE FROM public.introduction_posts WHERE id = own_introduction_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN
    RAISE EXCEPTION 'ordinary member could not delete their introduction';
  END IF;

  INSERT INTO public.connection_requests (from_user_id, to_user_id, message)
  VALUES (member_a, member_b, 'Rollback-only fixture');

  UPDATE public.connection_requests SET status = 'accepted' WHERE id = connection_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN
    RAISE EXCEPTION 'connection recipient could not accept a pending request';
  END IF;

  UPDATE public.connection_requests SET status = 'declined' WHERE id = connection_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'connection recipient changed a finalized request';
  END IF;

  BEGIN
    UPDATE public.connection_requests SET message = 'rewritten' WHERE id = connection_id;
    RAISE EXCEPTION 'connection recipient rewrote the request message';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  INSERT INTO public.lab_applications (project_id, applicant_id, motivation)
  VALUES (project_id, member_a, 'Rollback-only fixture')
  RETURNING id INTO own_application_id;

  UPDATE public.lab_applications
  SET status = 'accepted', reviewed_at = pg_catalog.now(), reviewer_id = member_a
  WHERE id = own_application_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'ordinary applicant reviewed their own lab application';
  END IF;

  BEGIN
    INSERT INTO public.lab_applications (project_id, applicant_id, motivation)
    VALUES (draft_project_id, member_b, 'Forged applicant fixture');
    RAISE EXCEPTION 'ordinary member forged another member lab application';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  UPDATE public.notifications SET read = true WHERE user_id = member_a;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected < 1 THEN
    RAISE EXCEPTION 'ordinary member could not mark their notification read';
  END IF;

  UPDATE public.notifications SET read = true WHERE id = notification_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'ordinary member updated another notification';
  END IF;

  BEGIN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (member_a, 'connection_request', 'forged', 'forged');
    RAISE EXCEPTION 'ordinary member forged a notification';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    INSERT INTO public.research_projects (
      title, description, status, lead_researcher_id
    ) VALUES ('Forged member project', 'Rollback-only fixture', 'open', member_a);
    RAISE EXCEPTION 'ordinary member created a lead-only research project';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  UPDATE public.research_projects SET title = title WHERE id = project_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'ordinary member updated another research project';
  END IF;

  BEGIN
    UPDATE public.chapters SET name = name WHERE id = chapter_id;
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected <> 0 THEN RAISE EXCEPTION 'ordinary member updated a chapter'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    UPDATE public.news_articles SET title = title WHERE id = news_id;
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected <> 0 THEN RAISE EXCEPTION 'ordinary member updated a news article'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    UPDATE public.explainer_cards SET title = title WHERE id = explainer_id;
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected <> 0 THEN RAISE EXCEPTION 'ordinary member updated an explainer'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    UPDATE public.opportunities SET title = title WHERE id = opportunity_id;
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected <> 0 THEN RAISE EXCEPTION 'ordinary member updated an opportunity'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    UPDATE public.events SET title = title WHERE id = event_id;
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected <> 0 THEN RAISE EXCEPTION 'ordinary member updated an event'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  IF public.is_admin() OR public.is_lead_or_admin() THEN
    RAISE EXCEPTION 'ordinary member inherited an elevated authorization result';
  END IF;
END;
$member_checks$;

RESET ROLE;
ROLLBACK;
