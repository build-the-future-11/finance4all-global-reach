\set ON_ERROR_STOP on
BEGIN;
INSERT INTO auth.users(id, email, raw_user_meta_data, raw_app_meta_data)
VALUES
 ('b4160000-0000-4000-8000-000000000001', 'directory-a@example.invalid', '{"display_name":"Directory A"}', '{"provider":"email","providers":["email"]}'),
 ('b4160000-0000-4000-8000-000000000002', 'directory-b@example.invalid', '{"display_name":"Directory B"}', '{"provider":"email","providers":["email"]}');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"b4160000-0000-4000-8000-000000000001","role":"authenticated"}', true);
DO $$ BEGIN
  IF NOT EXISTS (SELECT id FROM public.profiles WHERE id = 'b4160000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'Owner cannot read own hidden profile'; END IF;
  IF EXISTS (SELECT id FROM public.profiles WHERE id = 'b4160000-0000-4000-8000-000000000002') THEN RAISE EXCEPTION 'Unconsented profile is visible'; END IF;
  UPDATE public.profiles SET directory_visible = true, interests = ARRAY['Economics','Financial Machine Learning'] WHERE id = 'b4160000-0000-4000-8000-000000000002';
  IF FOUND THEN RAISE EXCEPTION 'Cross-member consent update succeeded'; END IF;
END $$;
SELECT set_config('request.jwt.claims', '{"sub":"b4160000-0000-4000-8000-000000000002","role":"authenticated"}', true);
UPDATE public.profiles SET directory_visible = true, interests = ARRAY['Economics','Financial Machine Learning'] WHERE id = 'b4160000-0000-4000-8000-000000000002';
SELECT set_config('request.jwt.claims', '{"sub":"b4160000-0000-4000-8000-000000000001","role":"authenticated"}', true);
DO $$ BEGIN
  IF NOT EXISTS (SELECT id FROM public.profiles WHERE id = 'b4160000-0000-4000-8000-000000000002') THEN RAISE EXCEPTION 'Opted-in member missing'; END IF;
  IF NOT EXISTS (SELECT id FROM public.member_directory('eCoNoMiCs') WHERE id = 'b4160000-0000-4000-8000-000000000002') THEN RAISE EXCEPTION 'Case-insensitive interest match missing'; END IF;
  IF NOT EXISTS (SELECT id FROM public.member_directory('machine') WHERE id = 'b4160000-0000-4000-8000-000000000002') THEN RAISE EXCEPTION 'Partial interest match missing'; END IF;
  IF EXISTS (SELECT id FROM public.member_directory('%')) THEN RAISE EXCEPTION 'Search wildcard expanded'; END IF;
  IF EXISTS (SELECT id FROM public.member_directory('machine', true)) THEN RAISE EXCEPTION 'Collaboration filter ignored'; END IF;
  BEGIN
    PERFORM email FROM public.profiles WHERE id = 'b4160000-0000-4000-8000-000000000002';
    RAISE EXCEPTION 'Directory exposes email';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claims', '{"sub":"b4160000-0000-4000-8000-000000000002","role":"authenticated"}', true);
UPDATE public.profiles SET directory_visible = false WHERE id = 'b4160000-0000-4000-8000-000000000002';
SELECT set_config('request.jwt.claims', '{"sub":"b4160000-0000-4000-8000-000000000001","role":"authenticated"}', true);
DO $$ BEGIN
  IF EXISTS (SELECT id FROM public.profiles WHERE id = 'b4160000-0000-4000-8000-000000000002') OR EXISTS (SELECT id FROM public.member_directory('machine')) THEN RAISE EXCEPTION 'Revoked profile remains visible'; END IF;
END $$;
RESET ROLE;
DO $$ BEGIN
  IF has_function_privilege('anon', 'public.member_directory(text,boolean)', 'EXECUTE') THEN RAISE EXCEPTION 'Anonymous directory access granted'; END IF;
  IF has_column_privilege('anon', 'public.profiles', 'directory_visible', 'SELECT') THEN RAISE EXCEPTION 'Anonymous profile access granted'; END IF;
END $$;
ROLLBACK;
\echo member_directory_consent result=PASS
