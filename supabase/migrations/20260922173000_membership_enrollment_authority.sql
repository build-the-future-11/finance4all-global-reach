-- Provide the server-owned enrollment/status path required before FinanceMeta
-- membership can become an authorization boundary. Browser-authenticated users
-- must never be able to create, reactivate, suspend, or revoke memberships.
--
-- This migration does NOT infer membership, backfill historical identities, or
-- switch existing RLS policies. It only gives trusted server infrastructure a
-- narrow audited primitive for later controlled reconciliation/enrollment.

BEGIN;

ALTER TABLE private.financemeta_memberships
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.financemeta_grant_membership(
  target_user_id uuid,
  enrollment_source text,
  actor_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  normalized_source text := NULLIF(pg_catalog.btrim(enrollment_source), '');
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target user is required' USING ERRCODE = '22004';
  END IF;

  IF normalized_source IS NULL OR pg_catalog.char_length(normalized_source) > 120 THEN
    RAISE EXCEPTION 'membership source must be between 1 and 120 characters'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO private.financemeta_memberships (
    user_id, status, granted_at, granted_by, source, updated_at, updated_by
  )
  VALUES (
    target_user_id, 'active', pg_catalog.now(), actor_user_id,
    normalized_source, pg_catalog.now(), actor_user_id
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'active',
    granted_at = pg_catalog.now(),
    granted_by = EXCLUDED.granted_by,
    source = EXCLUDED.source,
    updated_at = pg_catalog.now(),
    updated_by = EXCLUDED.updated_by;
END;
$$;

CREATE OR REPLACE FUNCTION public.financemeta_set_membership_status(
  target_user_id uuid,
  target_status text,
  actor_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target user is required' USING ERRCODE = '22004';
  END IF;

  IF target_status NOT IN ('suspended', 'revoked') THEN
    RAISE EXCEPTION 'status changes must suspend or revoke membership'
      USING ERRCODE = '22023';
  END IF;

  UPDATE private.financemeta_memberships
  SET status = target_status,
      updated_at = pg_catalog.now(),
      updated_by = actor_user_id
  WHERE user_id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'membership not found' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.financemeta_grant_membership(uuid, text, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.financemeta_set_membership_status(uuid, text, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.financemeta_grant_membership(uuid, text, uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.financemeta_set_membership_status(uuid, text, uuid)
  TO service_role;

INSERT INTO private.portal_schema_revisions (version, name)
VALUES ('20260922173000', 'membership_enrollment_authority')
ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name;

COMMIT;
