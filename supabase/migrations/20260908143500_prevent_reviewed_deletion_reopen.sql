-- Once an administrator has moved a deletion request out of pending review,
-- they must not put a reviewed row back into a member-cancellable pending state.
-- Authenticated members, including administrators acting on their own account,
-- may still use the controlled member lifecycle transitions: pending -> cancelled
-- and cancelled/rejected -> pending through request_account_deletion().

BEGIN;

CREATE OR REPLACE FUNCTION private.stamp_account_deletion_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();

  IF NEW.status IS DISTINCT FROM OLD.status
    AND NEW.user_id = (SELECT auth.uid())
    AND (
      (OLD.status = 'pending' AND NEW.status = 'cancelled')
      OR (OLD.status IN ('cancelled', 'rejected') AND NEW.status = 'pending')
    ) THEN
    NEW.reviewed_at := NULL;
    NEW.reviewed_by := NULL;
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND public.is_admin() THEN
    IF NEW.status = 'pending' AND OLD.status <> 'pending' THEN
      RAISE EXCEPTION 'reviewed deletion requests cannot be moved back to pending'
        USING ERRCODE = 'P0003';
    END IF;
    NEW.reviewed_at := pg_catalog.now();
    NEW.reviewed_by := (SELECT auth.uid());
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
