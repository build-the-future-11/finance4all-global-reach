-- Retire hosted-only objects that have no caller in the portal source.
-- Existing rate-limit telemetry is preserved in the private schema.

BEGIN;

DO $retire_contact$
DECLARE
  contact_rows bigint;
BEGIN
  IF pg_catalog.to_regclass('public.contact_submissions') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM public.contact_submissions' INTO contact_rows;
    IF contact_rows <> 0 THEN
      RAISE EXCEPTION 'contact_submissions contains % row(s); archive them before retirement', contact_rows;
    END IF;
    EXECUTE 'DROP TABLE public.contact_submissions';
  END IF;
END;
$retire_contact$;

DROP FUNCTION IF EXISTS public.portal_search(text, integer);
DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, integer, integer);
DROP FUNCTION IF EXISTS public.record_rate_limit(text, text);

DO $archive_rate_limits$
BEGIN
  IF pg_catalog.to_regclass('public.rate_limit_events') IS NOT NULL
     AND pg_catalog.to_regclass('private.legacy_rate_limit_events') IS NULL THEN
    REVOKE ALL ON TABLE public.rate_limit_events FROM PUBLIC, anon, authenticated;
    ALTER TABLE public.rate_limit_events SET SCHEMA private;
    ALTER TABLE private.rate_limit_events RENAME TO legacy_rate_limit_events;
    COMMENT ON TABLE private.legacy_rate_limit_events IS
      'Archived hosted-only telemetry. No FinanceMeta portal release reads or writes this table.';
  ELSIF pg_catalog.to_regclass('public.rate_limit_events') IS NOT NULL THEN
    RAISE EXCEPTION 'private.legacy_rate_limit_events already exists; reconcile before retirement';
  END IF;
END;
$archive_rate_limits$;

DO $retire_avatar_bucket$
BEGIN
  IF pg_catalog.to_regclass('storage.objects') IS NOT NULL
     AND EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    UPDATE storage.buckets SET public = false WHERE id = 'avatars';
    DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;
    DROP POLICY IF EXISTS "Members read avatars" ON storage.objects;
  END IF;
END;
$retire_avatar_bucket$;

INSERT INTO private.portal_schema_revisions (version, name)
VALUES ('20260906150000', 'retire_unused_hosted_extensions')
ON CONFLICT (version) DO UPDATE SET
  name = EXCLUDED.name,
  applied_at = pg_catalog.now();

COMMIT;
