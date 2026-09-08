-- Once an administrator has moved a deletion request out of pending review,
-- they must not put that same reviewed row back into a member-cancellable
-- pending state. Members may still create a fresh pending cycle through the
-- controlled request_account_deletion() RPC after cancelled/rejected states.

BEGIN;

CREATE OR REPLACE FUNCTION private.stamp_account_deletion_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();

  IF NEW.status IS DISTINCT FROM OLD.status AND public.is_admin() THEN
    IF NEW.status = 'pending' AND OLD.status <> 'pending' THEN
      RAISE EXCEPTION 'reviewed deletion requests cannot be moved back to pending'
        USING ERRCODE = 'P0003';
    END IF;
    NEW.reviewed_at := pg_catalog.now();
    NEW.reviewed_by := (SELECT auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status
    AND NEW.status IN ('pending', 'cancelled') THEN
    NEW.reviewed_at := NULL;
    NEW.reviewed_by := NULL;
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'only administrators may review deletion requests' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

INSERT INTO private.portal_schema_revisions (version, name)
VALUES ('20260908143500', 'prevent_reviewed_deletion_reopen')
ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name;

COMMIT;
