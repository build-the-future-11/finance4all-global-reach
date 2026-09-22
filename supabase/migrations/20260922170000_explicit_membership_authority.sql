-- Add a server-owned FinanceMeta membership authority without changing existing
-- browser authorization yet. This is the first bounded step toward separating
-- shared Supabase Auth identity from FinanceMeta membership.
--
-- Important: this migration intentionally does NOT auto-enrol existing profiles,
-- change member-facing RLS policies, or infer membership from profile existence.
-- Enforcement must land only after historical membership reconciliation and an
-- independently reviewed enrollment path are available.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.financemeta_memberships (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'revoked')),
  granted_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  granted_by uuid,
  source text NOT NULL
    CHECK (pg_catalog.char_length(pg_catalog.btrim(source)) BETWEEN 1 AND 120)
);

ALTER TABLE private.financemeta_memberships ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.financemeta_memberships FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE private.financemeta_memberships IS
  'Server-owned FinanceMeta authorization records. Profile existence is not membership.';
COMMENT ON COLUMN private.financemeta_memberships.granted_by IS
  'Original grant actor UUID captured at mutation time and retained even if that auth identity is later deleted.';
COMMENT ON COLUMN private.financemeta_memberships.source IS
  'Bounded enrollment provenance such as invite/program/admin workflow; never user-editable metadata.';

CREATE OR REPLACE FUNCTION public.financemeta_is_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM private.financemeta_memberships AS membership
    WHERE membership.user_id = (SELECT auth.uid())
      AND membership.status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.financemeta_is_member() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.financemeta_is_member() TO authenticated;

INSERT INTO private.portal_schema_revisions (version, name)
VALUES ('20260922170000', 'explicit_membership_authority')
ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name;

COMMIT;
