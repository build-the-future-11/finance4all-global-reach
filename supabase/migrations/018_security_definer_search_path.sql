-- Harden every public SECURITY DEFINER function against search-path hijacking.
-- Existing functions intentionally use unqualified public table names, so public
-- remains first and pg_temp is explicitly placed last.
DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS identity
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %s SET search_path = public, pg_temp',
      fn.identity
    );
  END LOOP;
END;
$$;
