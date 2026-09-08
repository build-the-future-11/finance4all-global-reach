-- CI/local-test compatibility for the bare Supabase Postgres image only.
-- Hosted Supabase provides auth.jwt and the Storage catalog; never apply this
-- file to a linked or production database.

CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT pg_catalog.jsonb_build_object(
    'email', NULLIF(pg_catalog.current_setting('request.jwt.claim.email', true), ''),
    'sub', NULLIF(pg_catalog.current_setting('request.jwt.claim.sub', true), ''),
    'role', NULLIF(pg_catalog.current_setting('request.jwt.claim.role', true), '')
  );
$$;

CREATE SCHEMA IF NOT EXISTS storage;
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  public boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text
);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
