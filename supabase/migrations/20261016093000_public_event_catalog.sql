-- Public discovery is an explicit editorial decision. Existing records remain
-- member-only and no record is approved or seeded by this migration.
BEGIN;
ALTER TABLE public.chapters
  ADD COLUMN chapter_status text NOT NULL DEFAULT 'unverified'
    CHECK (chapter_status IN ('unverified','expansion_interest','application_received','lead_screening','pre_launch','approved','active_verified','inactive')),
  ADD COLUMN accepted_owner boolean NOT NULL DEFAULT false,
  ADD COLUMN permissions_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN operating_evidence_url text,
  ADD COLUMN last_activity_at timestamptz,
  ADD CONSTRAINT active_chapter_evidence CHECK (
    chapter_status <> 'active_verified' OR
    (accepted_owner AND permissions_confirmed AND last_activity_at IS NOT NULL
      AND operating_evidence_url IS NOT NULL AND operating_evidence_url ~ '^https?://[^[:space:]]+$')
  );
GRANT INSERT (chapter_status,accepted_owner,permissions_confirmed,operating_evidence_url,last_activity_at),
  UPDATE (chapter_status,accepted_owner,permissions_confirmed,operating_evidence_url,last_activity_at)
  ON public.chapters TO authenticated;

ALTER TABLE public.events
  ADD COLUMN public_listing boolean NOT NULL DEFAULT false,
  ADD COLUMN event_details jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(event_details) = 'object' AND octet_length(event_details::text) <= 16000);

-- Existing admin-only write policies remain authoritative; the existing
-- invalidate_content_approval trigger covers BOTH new columns automatically.
GRANT INSERT (public_listing, event_details), UPDATE (public_listing, event_details)
  ON public.events TO authenticated;

CREATE FUNCTION public.public_event_catalog(target_id uuid DEFAULT NULL, page_offset integer DEFAULT 0)
RETURNS TABLE (
  id uuid, chapter_id uuid, title text, description text, status public.event_status,
  starts_at timestamptz, ends_at timestamptz, registration_url text,
  program_links jsonb, event_details jsonb
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT e.id, e.chapter_id, e.title, e.description, e.status, e.starts_at,
    e.ends_at, e.registration_url,
    coalesce((SELECT jsonb_agg(jsonb_build_object('label', link->'label', 'url', link->'url'))
      FROM jsonb_array_elements(CASE WHEN jsonb_typeof(e.program_links)='array' THEN e.program_links ELSE '[]'::jsonb END) AS link
      WHERE jsonb_typeof(link)='object' AND jsonb_typeof(link->'label')='string' AND jsonb_typeof(link->'url')='string'), '[]'::jsonb),
    -- A fixed projection prevents future internal keys from becoming public.
    jsonb_strip_nulls(jsonb_build_object(
      'host', e.event_details->'host', 'type', e.event_details->'type',
      'modality', e.event_details->'modality', 'timezone', e.event_details->'timezone',
      'location', e.event_details->'location', 'audience', e.event_details->'audience',
      'capacity', e.event_details->'capacity', 'registrationOpensAt', e.event_details->'registrationOpensAt',
      'registrationClosesAt', e.event_details->'registrationClosesAt',
      'sourceUrl', e.event_details->'sourceUrl', 'verifiedAt', e.event_details->'verifiedAt',
      'relatedProgram', e.event_details->'relatedProgram', 'recordingUrl', e.event_details->'recordingUrl',
      'scheduleState', e.event_details->'scheduleState',
      'city', c.city, 'country', c.country
    ))
  FROM public.events e JOIN public.chapters c ON c.id = e.chapter_id
  WHERE e.public_listing AND e.publication_state = 'published'
    AND c.publication_state = 'published'
    AND (target_id IS NULL OR e.id = target_id)
  ORDER BY e.starts_at, e.id
  LIMIT 100 OFFSET greatest(0, least(coalesce(page_offset, 0), 100000));
$$;
REVOKE ALL ON FUNCTION public.public_event_catalog(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_event_catalog(uuid, integer) TO anon, authenticated;
-- No anonymous SELECT privilege on events, chapters, registrations or profiles.

-- Registration deadlines/holds supplement, never replace, publication, owner,
-- future-start, status and abuse-budget policies. Invalid metadata fails closed.
CREATE FUNCTION private.event_registration_window_open(details jsonb)
RETURNS boolean LANGUAGE plpgsql STABLE SET search_path = '' AS $$
BEGIN
  IF coalesce(details->>'scheduleState', 'confirmed') <> 'confirmed' THEN RETURN false; END IF;
  IF (details->>'registrationOpensAt' IS NOT NULL AND details->>'registrationOpensAt' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?Z$')
    OR (details->>'registrationClosesAt' IS NOT NULL AND details->>'registrationClosesAt' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?Z$') THEN RETURN false; END IF;
  RETURN (details->>'registrationOpensAt' IS NULL OR (details->>'registrationOpensAt')::timestamptz <= now())
    AND (details->>'registrationClosesAt' IS NULL OR (details->>'registrationClosesAt')::timestamptz > now());
EXCEPTION WHEN invalid_datetime_format OR datetime_field_overflow THEN RETURN false;
END;
$$;
REVOKE ALL ON FUNCTION private.event_registration_window_open(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.event_registration_window_open(jsonb) TO authenticated;
-- A registration is an immutable owner/event pair. Retargeting an existing
-- row through UPDATE would bypass the INSERT-only publication/window checks.
-- Keep cancellation available through DELETE, and require a checked INSERT
-- when registering for a different event.
REVOKE UPDATE ON public.event_registrations FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (event_id, user_id, created_at) ON public.event_registrations FROM PUBLIC, anon, authenticated;
CREATE POLICY "Event registration window" ON public.event_registrations AS RESTRICTIVE
  FOR INSERT TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_id
      AND private.event_registration_window_open(e.event_details)
  ));

INSERT INTO private.portal_schema_revisions(version, name)
VALUES ('20261016093000', 'public_event_catalog');
COMMIT;
