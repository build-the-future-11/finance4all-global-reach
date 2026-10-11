-- Per-account budgets for committed writes. No browser-supplied identity,
-- action limit, clock or counter is trusted. Does not replace edge/Auth limits.
BEGIN;

CREATE TABLE private.member_write_budgets (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  window_started_at timestamptz NOT NULL,
  used integer NOT NULL CHECK (used > 0),
  PRIMARY KEY (user_id, action)
);
REVOKE ALL ON private.member_write_budgets FROM PUBLIC, anon, authenticated;

CREATE FUNCTION private.consume_member_budget(action_name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  actor uuid := auth.uid();
  allowed integer;
  consumed integer;
  at_time timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF actor IS NULL THEN
    RAISE EXCEPTION 'A signed-in account is required' USING ERRCODE = '42501';
  END IF;
  allowed := CASE action_name
    WHEN 'connection_requests' THEN 20
    WHEN 'introduction_posts' THEN 5
    WHEN 'studio_submissions' THEN 10
    WHEN 'essay_submissions' THEN 10
    WHEN 'lab_applications' THEN 20
    WHEN 'intake_submissions' THEN 20
    WHEN 'account_deletion_requests' THEN 20
    WHEN 'project_memberships' THEN 60
    WHEN 'project_tasks' THEN 120
    WHEN 'export_my_data' THEN 5
    WHEN 'publication_review' THEN 60
    WHEN 'all_writes' THEN 600
    WHEN 'profiles' THEN 60
    WHEN 'digest_preferences' THEN 60
    WHEN 'education_lesson_progress' THEN 120
    WHEN 'member_learning' THEN 120
    WHEN 'application_drafts' THEN 120
    WHEN 'news_bookmarks' THEN 120
    WHEN 'project_bookmarks' THEN 120
    WHEN 'opportunity_interests' THEN 60
    WHEN 'event_registrations' THEN 60
    WHEN 'essay_upvotes' THEN 120
    ELSE NULL
  END;
  IF allowed IS NULL THEN
    RAISE EXCEPTION 'Unknown member budget' USING ERRCODE = '22023';
  END IF;
  INSERT INTO private.member_write_budgets AS budget
    (user_id, action, window_started_at, used)
  VALUES (actor, action_name, at_time, 1)
  ON CONFLICT (user_id, action) DO UPDATE SET
    window_started_at = CASE WHEN budget.window_started_at <= at_time - interval '1 hour'
      THEN at_time ELSE budget.window_started_at END,
    used = CASE WHEN budget.window_started_at <= at_time - interval '1 hour'
      THEN 1 ELSE budget.used + 1 END
  WHERE budget.window_started_at <= at_time - interval '1 hour' OR budget.used < allowed
  RETURNING used INTO consumed;
  IF consumed IS NULL THEN
    RAISE EXCEPTION 'Hourly activity limit reached. Please try again later.'
      USING ERRCODE = 'PT429', HINT = 'The limit resets within one hour.';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION private.consume_member_budget(text) FROM PUBLIC, anon, authenticated;

CREATE FUNCTION private.enforce_member_write_budget()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  -- Trusted maintenance without a user JWT is not a member request. RLS/grants
  -- still deny anonymous writes; members cannot select their own exemption.
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND NEW IS NOT DISTINCT FROM OLD THEN RETURN NEW; END IF;
  -- The review RPC already meters publication transitions. These protected
  -- metadata-only updates must not also consume a submission/edit allowance.
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME IN ('introduction_posts','studio_submissions','essay_submissions')
    AND (pg_catalog.to_jsonb(NEW) - ARRAY['publication_state','publication_revision','updated_at'])
      IS NOT DISTINCT FROM
      (pg_catalog.to_jsonb(OLD) - ARRAY['publication_state','publication_revision','updated_at'])
    THEN RETURN NEW; END IF;
  -- Existing guards still authorize these transitions. A spent activity budget
  -- must not prevent withdrawal, cancellation or leaving a project.
  IF TG_OP = 'UPDATE' AND (
    (TG_TABLE_NAME = 'intake_submissions' AND to_jsonb(NEW)->>'status' = 'withdrawn') OR
    (TG_TABLE_NAME = 'account_deletion_requests' AND to_jsonb(NEW)->>'status' = 'cancelled') OR
    (TG_TABLE_NAME = 'project_memberships' AND to_jsonb(NEW)->>'status' IN ('left','declined','removed'))
  ) THEN RETURN NEW; END IF;
  IF pg_catalog.octet_length(pg_catalog.to_jsonb(NEW)::text) > 65536 THEN
    RAISE EXCEPTION 'This record exceeds the 64 KiB content limit' USING ERRCODE = '22001';
  END IF;
  -- Consistent lock order: aggregate before action, including RPC callers.
  PERFORM private.consume_member_budget('all_writes');
  PERFORM private.consume_member_budget(TG_TABLE_NAME);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.enforce_member_write_budget() FROM PUBLIC, anon, authenticated;

DO $$
DECLARE relation text;
BEGIN
  FOREACH relation IN ARRAY ARRAY[
    'profiles', 'digest_preferences', 'education_lesson_progress',
    'member_learning', 'application_drafts', 'news_bookmarks', 'project_bookmarks',
    'opportunity_interests', 'event_registrations', 'essay_upvotes',
    'connection_requests', 'introduction_posts', 'studio_submissions',
    'essay_submissions', 'lab_applications', 'intake_submissions',
    'account_deletion_requests', 'project_memberships', 'project_tasks'
  ] LOOP
    EXECUTE pg_catalog.format('CREATE TRIGGER member_write_budget AFTER INSERT OR UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION private.enforce_member_write_budget()', relation);
  END LOOP;
END;
$$;

-- Keep the existing export implementation private; bound the expensive public
-- entry point without changing its data/ownership contract.
ALTER FUNCTION public.export_my_data() SET SCHEMA private;
ALTER FUNCTION private.export_my_data() RENAME TO export_member_data_unmetered;
REVOKE ALL ON FUNCTION private.export_member_data_unmetered() FROM PUBLIC, anon, authenticated;
CREATE FUNCTION public.export_my_data()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM private.consume_member_budget('all_writes');
  PERFORM private.consume_member_budget('export_my_data');
  RETURN private.export_member_data_unmetered();
END;
$$;
REVOKE ALL ON FUNCTION public.export_my_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.export_my_data() TO authenticated;

INSERT INTO private.portal_schema_revisions(version, name)
VALUES ('20261011090000', 'member_abuse_budgets');
COMMIT;
