-- Fix #47: research protocols must inherit the visibility boundary of their
-- parent research project. The production extension that introduced
-- research_protocols predates the repository's complete migration history, so
-- this migration deliberately fails closed until that history is reconciled.

BEGIN;

DO $protocol_visibility$
DECLARE
  admin_predicate text;
BEGIN
  IF pg_catalog.to_regclass('public.research_projects') IS NULL THEN
    RAISE EXCEPTION
      'research_projects is missing; reconcile migration history before applying protocol visibility hardening';
  END IF;

  IF pg_catalog.to_regclass('public.research_protocols') IS NULL THEN
    RAISE EXCEPTION
      'research_protocols is missing; reconcile FinanceMeta migration history (#48) before applying protocol visibility hardening';
  END IF;

  -- Production currently uses the private helper introduced by the retained
  -- FinanceMeta migrations; a clean repository database still has public.is_admin().
  -- Resolve either known-safe helper explicitly rather than weakening the policy.
  IF pg_catalog.to_regprocedure('financemeta_private.financemeta_is_admin()') IS NOT NULL THEN
    admin_predicate := 'financemeta_private.financemeta_is_admin()';
  ELSIF pg_catalog.to_regprocedure('public.is_admin()') IS NOT NULL THEN
    admin_predicate := 'public.is_admin()';
  ELSE
    RAISE EXCEPTION
      'no supported FinanceMeta admin predicate is installed; refusing to create a weaker protocol policy';
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "Protocols follow project visibility" ON public.research_protocols';

  EXECUTE pg_catalog.format(
    $policy$
      CREATE POLICY "Protocols follow project visibility"
        ON public.research_protocols
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM public.research_projects AS p
            WHERE p.id = research_protocols.project_id
              AND (
                p.status <> 'draft'::public.research_project_status
                OR p.lead_researcher_id = (SELECT auth.uid())
                OR %s
              )
          )
        )
    $policy$,
    admin_predicate
  );
END;
$protocol_visibility$;

COMMIT;
