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
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  ADD COLUMN IF NOT EXISTS last_activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_activated_by uuid,
  ADD COLUMN IF NOT EXISTS last_activation_source text
    CHECK (
      last_activation_source IS NULL
      OR pg_catalog.char_length(pg_catalog.btrim(last_activation_source)) BETWEEN 1 AND 120
    );

COMMENT ON COLUMN private.financemeta_memberships.granted_at IS
  'Timestamp of the original membership grant. Reactivation must not rewrite it.';
COMMENT ON COLUMN private.financemeta_memberships.granted_by IS
  'Original grant actor UUID validated when recorded and retained if that auth identity is later deleted.';
COMMENT ON COLUMN private.financemeta_memberships.source IS
  'Original bounded enrollment provenance. Reactivation provenance is stored separately.';
COMMENT ON COLUMN private.financemeta_memberships.updated_by IS
  'Latest mutation actor UUID validated when recorded and retained if that auth identity is later deleted.';
COMMENT ON COLUMN private.financemeta_memberships.revision IS
  'Monotonic optimistic-concurrency token for server-owned membership mutations.';
COMMENT ON COLUMN private.financemeta_memberships.last_activated_by IS
  'Most recent activation actor UUID validated when recorded and retained if that auth identity is later deleted.';
COMMENT ON COLUMN private.financemeta_memberships.last_activation_source IS
  'Most recent explicit activation/reactivation provenance; null only for legacy rows predating this authority.';

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

  IF actor_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM auth.users AS actor WHERE actor.id = actor_user_id
  ) THEN
    RAISE EXCEPTION 'membership actor must reference an existing auth user'
      USING ERRCODE = '22023';
  END IF;

  IF normalized_source IS NULL OR pg_catalog.char_length(normalized_source) > 120 THEN
    RAISE EXCEPTION 'membership source must be between 1 and 120 characters'
      USING ERRCODE = '22023';
  END IF;

  BEGIN
    INSERT INTO private.financemeta_memberships (
      user_id, status, granted_at, granted_by, source,
      updated_at, updated_by, revision,
      last_activated_at, last_activated_by, last_activation_source
    )
    VALUES (
      target_user_id, 'active', pg_catalog.now(), actor_user_id, normalized_source,
      pg_catalog.now(), actor_user_id, 1,
      pg_catalog.now(), actor_user_id, normalized_source
    );
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'membership already exists; use revision-checked reactivation'
      USING ERRCODE = 'P0003';
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.financemeta_reactivate_membership(
  target_user_id uuid,
  enrollment_source text,
  expected_revision bigint,
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

  IF expected_revision IS NULL OR expected_revision <= 0 THEN
    RAISE EXCEPTION 'expected membership revision must be a positive integer'
      USING ERRCODE = '22023';
  END IF;

  IF actor_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM auth.users AS actor WHERE actor.id = actor_user_id
  ) THEN
    RAISE EXCEPTION 'membership actor must reference an existing auth user'
      USING ERRCODE = '22023';
  END IF;

  IF normalized_source IS NULL OR pg_catalog.char_length(normalized_source) > 120 THEN
    RAISE EXCEPTION 'membership source must be between 1 and 120 characters'
      USING ERRCODE = '22023';
  END IF;

  UPDATE private.financemeta_memberships
  SET status = 'active',
      updated_at = pg_catalog.now(),
      updated_by = actor_user_id,
      revision = revision + 1,
      last_activated_at = pg_catalog.now(),
      last_activated_by = actor_user_id,
      last_activation_source = normalized_source
  WHERE user_id = target_user_id
    AND status IN ('suspended', 'revoked')
    AND revision = expected_revision;

  IF NOT FOUND THEN
    IF NOT EXISTS (
      SELECT 1 FROM private.financemeta_memberships WHERE user_id = target_user_id
    ) THEN
      RAISE EXCEPTION 'membership not found' USING ERRCODE = 'P0002';
    END IF;
    RAISE EXCEPTION 'membership changed since it was read or is not inactive'
      USING ERRCODE = 'P0003';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.financemeta_set_membership_status(
  target_user_id uuid,
  target_status text,
  expected_revision bigint,
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

  IF expected_revision IS NULL OR expected_revision <= 0 THEN
    RAISE EXCEPTION 'expected membership revision must be a positive integer'
      USING ERRCODE = '22023';
  END IF;

  IF actor_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM auth.users AS actor WHERE actor.id = actor_user_id
  ) THEN
    RAISE EXCEPTION 'membership actor must reference an existing auth user'
      USING ERRCODE = '22023';
  END IF;

  IF target_status NOT IN ('suspended', 'revoked') THEN
    RAISE EXCEPTION 'status changes must suspend or revoke membership'
      USING ERRCODE = '22023';
  END IF;

  UPDATE private.financemeta_memberships
  SET status = target_status,
      updated_at = pg_catalog.now(),
      updated_by = actor_user_id,
      revision = revision + 1
  WHERE user_id = target_user_id
    AND revision = expected_revision
    AND (
      (status = 'active' AND target_status IN ('suspended', 'revoked'))
      OR (status = 'suspended' AND target_status = 'revoked')
    );

  IF NOT FOUND THEN
    IF NOT EXISTS (
      SELECT 1 FROM private.financemeta_memberships WHERE user_id = target_user_id
    ) THEN
      RAISE EXCEPTION 'membership not found' USING ERRCODE = 'P0002';
    END IF;
    RAISE EXCEPTION 'membership changed since it was read or transition is not allowed'
      USING ERRCODE = 'P0003';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.financemeta_grant_membership(uuid, text, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.financemeta_reactivate_membership(uuid, text, bigint, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.financemeta_set_membership_status(uuid, text, bigint, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.financemeta_grant_membership(uuid, text, uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.financemeta_reactivate_membership(uuid, text, bigint, uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.financemeta_set_membership_status(uuid, text, bigint, uuid)
  TO service_role;

INSERT INTO private.portal_schema_revisions (version, name)
VALUES ('20260922173000', 'membership_enrollment_authority')
ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name;

COMMIT;
