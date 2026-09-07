-- Transaction-only production authorization certification.
-- Creates two synthetic ordinary identities and rolls every mutation back.

BEGIN;

CREATE TEMP TABLE portal_certification_identity_seed (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE
);

INSERT INTO portal_certification_identity_seed (id, email) VALUES
  (pg_catalog.gen_random_uuid(), 'rls-member-a-' || pg_catalog.gen_random_uuid()::text || '@example.test'),
  (pg_catalog.gen_random_uuid(), 'rls-member-b-' || pg_catalog.gen_random_uuid()::text || '@example.test');

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000', id,
  'authenticated', 'authenticated', email, '',
  pg_catalog.now(), '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"RLS certification member"}'::jsonb,
  pg_catalog.now(), pg_catalog.now()
FROM portal_certification_identity_seed;

CREATE TEMP TABLE portal_certification_members AS
SELECT p.id, pg_catalog.row_number() OVER (ORDER BY p.id) AS ordinal
FROM public.profiles p
JOIN portal_certification_identity_seed seed USING (id)
WHERE p.role = 'member'::public.user_role
ORDER BY p.id;

DO $preflight$
BEGIN
  IF (SELECT pg_catalog.count(*) FROM portal_certification_members) <> 2 THEN
    RAISE EXCEPTION 'synthetic ordinary member profiles were not created';
  END IF;
END;
$preflight$;

GRANT SELECT ON TABLE portal_certification_members TO authenticated;
SET LOCAL ROLE authenticated;
SELECT pg_catalog.set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM portal_certification_members WHERE ordinal = 1),
  true
);
SELECT pg_catalog.set_config('request.jwt.claim.role', 'authenticated', true);

DO $member_checks$
DECLARE
  member_a uuid := (SELECT id FROM portal_certification_members WHERE ordinal = 1);
  member_b uuid := (SELECT id FROM portal_certification_members WHERE ordinal = 2);
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
    RAISE EXCEPTION 'ordinary member could not update an allowed field on their own profile';
  END IF;

  UPDATE public.profiles SET bio = bio WHERE id = member_b;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'ordinary member updated another profile';
  END IF;

  BEGIN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (member_a, 'connection_request'::public.notification_type, 'forged', 'forged');
    RAISE EXCEPTION 'ordinary member forged a notification';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;

  IF public.is_admin() OR public.is_lead_or_admin() THEN
    RAISE EXCEPTION 'ordinary member inherited an elevated authorization result';
  END IF;
END;
$member_checks$;

RESET ROLE;
ROLLBACK;
