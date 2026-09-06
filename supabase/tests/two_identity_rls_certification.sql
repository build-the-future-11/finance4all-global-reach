-- Transaction-only production authorization certification.
-- Requires at least two ordinary profiles. Every mutation is rolled back.

BEGIN;

CREATE TEMP TABLE portal_certification_members AS
SELECT id, pg_catalog.row_number() OVER (ORDER BY created_at, id) AS ordinal
FROM public.profiles
WHERE role = 'member'::public.user_role
ORDER BY created_at, id
LIMIT 2;

DO $preflight$
BEGIN
  IF (SELECT pg_catalog.count(*) FROM portal_certification_members) <> 2 THEN
    RAISE EXCEPTION 'two ordinary member profiles are required';
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
