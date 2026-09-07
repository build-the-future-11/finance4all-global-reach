-- Keep browser-originated role changes fail-closed while preserving a real
-- operator path for initial administrator provisioning and incident recovery.

BEGIN;

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
    AND CURRENT_USER NOT IN ('postgres', 'supabase_admin')
    AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins or trusted database operators may change profile roles'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_profile_role() FROM PUBLIC, anon, authenticated;

INSERT INTO private.portal_schema_revisions (version, name)
VALUES ('20260907110357', 'trusted_profile_role_administration')
ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name;

COMMIT;
