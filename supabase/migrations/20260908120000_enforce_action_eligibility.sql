-- Enforce parent-record eligibility for member applications, interests, and registrations.
-- Client-side visibility is advisory; direct PostgREST writes must obey the same rules.

BEGIN;

DROP POLICY IF EXISTS "Members apply to projects" ON public.lab_applications;
CREATE POLICY "Members apply to projects"
  ON public.lab_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    applicant_id = (SELECT auth.uid())
    AND status = 'pending'::public.lab_application_status
    AND reviewed_at IS NULL
    AND reviewer_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.research_projects AS project
      WHERE project.id = lab_applications.project_id
        AND project.status = 'open'::public.research_project_status
        AND (
          project.application_deadline IS NULL
          OR project.application_deadline > pg_catalog.now()
        )
    )
  );

DROP POLICY IF EXISTS "Users manage own opportunity interests" ON public.opportunity_interests;
DROP POLICY IF EXISTS "Users read own opportunity interests" ON public.opportunity_interests;
DROP POLICY IF EXISTS "Users create eligible opportunity interests" ON public.opportunity_interests;
DROP POLICY IF EXISTS "Users delete own opportunity interests" ON public.opportunity_interests;

CREATE POLICY "Users read own opportunity interests"
  ON public.opportunity_interests
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users create eligible opportunity interests"
  ON public.opportunity_interests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.opportunities AS opportunity
      WHERE opportunity.id = opportunity_interests.opportunity_id
        AND opportunity.is_active
        AND (
          opportunity.deadline IS NULL
          OR opportunity.deadline > pg_catalog.now()
        )
    )
  );

CREATE POLICY "Users delete own opportunity interests"
  ON public.opportunity_interests
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

REVOKE INSERT, UPDATE ON TABLE public.opportunity_interests FROM authenticated;
GRANT INSERT (opportunity_id, user_id)
  ON TABLE public.opportunity_interests TO authenticated;

DROP POLICY IF EXISTS "Users manage own event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users read own event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users create eligible event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users delete own event registrations" ON public.event_registrations;

CREATE POLICY "Users read own event registrations"
  ON public.event_registrations
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users create eligible event registrations"
  ON public.event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.events AS event
      WHERE event.id = event_registrations.event_id
        AND event.status = 'upcoming'::public.event_status
        AND event.starts_at > pg_catalog.now()
    )
  );

CREATE POLICY "Users delete own event registrations"
  ON public.event_registrations
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

REVOKE INSERT, UPDATE ON TABLE public.event_registrations FROM authenticated;
GRANT INSERT (event_id, user_id)
  ON TABLE public.event_registrations TO authenticated;

COMMIT;
