-- Every existing record starts unreviewed. This migration never approves or
-- deletes historical content. Publishing is a separate, audited admin action.
BEGIN;

CREATE TABLE private.publication_reviews (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content_table text NOT NULL,
  content_id text NOT NULL,
  revision integer NOT NULL,
  previous_state text NOT NULL,
  next_state text NOT NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_note text NOT NULL CHECK (char_length(review_note) BETWEEN 10 AND 2000),
  reviewed_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);
CREATE INDEX publication_reviews_record ON private.publication_reviews(content_table, content_id, revision);
REVOKE ALL ON private.publication_reviews FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE private.publication_reviews_id_seq FROM PUBLIC, anon, authenticated;

CREATE FUNCTION private.invalidate_content_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  -- Routine timestamp/member-count maintenance does not change reviewed copy.
  IF (pg_catalog.to_jsonb(NEW) - ARRAY['publication_state','publication_revision','updated_at','member_count'])
    IS DISTINCT FROM
    (pg_catalog.to_jsonb(OLD) - ARRAY['publication_state','publication_revision','updated_at','member_count']) THEN
    NEW.publication_state := 'draft';
    NEW.publication_revision := OLD.publication_revision + 1;
    INSERT INTO private.publication_reviews(content_table, content_id, revision, previous_state, next_state, reviewer_id, review_note)
    VALUES (TG_TABLE_NAME, NEW.id::text, NEW.publication_revision, OLD.publication_state, 'draft', auth.uid(), 'Content changed; a new review is required.');
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.invalidate_content_approval() FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  relation text;
  owner_condition text;
  insert_columns text;
  update_columns text;
BEGIN
  FOREACH relation IN ARRAY ARRAY['chapters','news_articles','explainer_cards','events','opportunities',
    'research_projects','intake_calls','studio_submissions','essay_submissions','introduction_posts'] LOOP
    -- Preserve exactly the existing column-write surface while removing table
    -- grants that would accidentally expose the newly added review metadata.
    SELECT string_agg(quote_ident(a.attname), ', ' ORDER BY a.attnum)
      FILTER (WHERE has_column_privilege('authenticated', c.oid, a.attname, 'INSERT')),
      string_agg(quote_ident(a.attname), ', ' ORDER BY a.attnum)
      FILTER (WHERE has_column_privilege('authenticated', c.oid, a.attname, 'UPDATE'))
    INTO insert_columns, update_columns
    FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    JOIN pg_catalog.pg_attribute a ON a.attrelid=c.oid
    WHERE n.nspname='public' AND c.relname=relation AND a.attnum>0 AND NOT a.attisdropped;

    EXECUTE format('ALTER TABLE public.%I ADD COLUMN publication_state text NOT NULL DEFAULT ''draft''
      CHECK (publication_state IN (''draft'',''published'',''archived'')),
      ADD COLUMN publication_revision integer NOT NULL DEFAULT 0 CHECK (publication_revision >= 0)', relation);
    EXECUTE format('REVOKE INSERT, UPDATE ON public.%I FROM PUBLIC, anon, authenticated', relation);
    IF insert_columns IS NOT NULL THEN
      EXECUTE format('GRANT INSERT (%s) ON public.%I TO authenticated', insert_columns, relation);
    END IF;
    IF update_columns IS NOT NULL THEN
      EXECUTE format('GRANT UPDATE (%s) ON public.%I TO authenticated', update_columns, relation);
    END IF;
    owner_condition := CASE
      WHEN relation IN ('studio_submissions','essay_submissions','introduction_posts') THEN ' OR author_id = (SELECT auth.uid())'
      WHEN relation = 'research_projects' THEN ' OR lead_researcher_id = (SELECT auth.uid())'
      ELSE '' END;
    EXECUTE format('CREATE POLICY "Reviewed publication only" ON public.%I AS RESTRICTIVE
      FOR SELECT TO authenticated USING (publication_state = ''published'' OR (SELECT public.is_admin())%s)', relation, owner_condition);
    EXECUTE format('CREATE TRIGGER invalidate_content_approval BEFORE UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION private.invalidate_content_approval()', relation);
    EXECUTE format('CREATE INDEX %I ON public.%I(id) WHERE publication_state = ''published''', relation || '_published', relation);
  END LOOP;
END;
$$;

-- Include publication columns in the invoker view, preserving voter privacy.
DROP VIEW public.essay_submissions_with_counts;
CREATE VIEW public.essay_submissions_with_counts WITH (security_invoker = true) AS
SELECT e.*, COALESCE(public.get_essay_upvote_count(e.id), 0)::integer AS upvote_count
FROM public.essay_submissions e;
REVOKE ALL ON public.essay_submissions_with_counts FROM PUBLIC, anon;
GRANT SELECT ON public.essay_submissions_with_counts TO authenticated;

CREATE FUNCTION public.review_publication(
  content_table text, content_id text, expected_revision integer, next_state text, review_note text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE current_row jsonb; result_row jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator review is required' USING ERRCODE = '42501';
  END IF;
  IF content_table IS NULL OR content_table <> ALL (ARRAY['chapters','news_articles','explainer_cards','events','opportunities',
    'research_projects','intake_calls','studio_submissions','essay_submissions','introduction_posts']) THEN
    RAISE EXCEPTION 'Unsupported publication type' USING ERRCODE = '22023';
  END IF;
  IF next_state IS NULL OR next_state NOT IN ('draft','published','archived')
    OR review_note IS NULL OR char_length(btrim(review_note)) NOT BETWEEN 10 AND 2000 THEN
    RAISE EXCEPTION 'Choose a publication state and provide a review note of 10 to 2000 characters' USING ERRCODE = '22023';
  END IF;
  -- Row lock plus a caller-observed revision prevents approval of stale copy.
  EXECUTE format('SELECT to_jsonb(c) FROM public.%I c WHERE id = $1::%s FOR UPDATE',
    content_table, CASE WHEN content_table='intake_calls' THEN 'text' ELSE 'uuid' END)
    INTO current_row USING content_id;
  IF current_row IS NULL THEN RAISE EXCEPTION 'Content is unavailable' USING ERRCODE = 'P0002'; END IF;
  IF expected_revision IS NULL OR (current_row->>'publication_revision')::integer <> expected_revision THEN
    RAISE EXCEPTION 'Content changed. Reload and review the current version.' USING ERRCODE = '40001';
  END IF;
  PERFORM private.consume_member_budget('all_writes');
  PERFORM private.consume_member_budget('publication_review');
  IF next_state='published' AND content_table='events' AND NOT EXISTS (
    SELECT 1 FROM public.chapters WHERE id=(current_row->>'chapter_id')::uuid AND publication_state='published'
  ) THEN RAISE EXCEPTION 'Review and publish the event chapter first' USING ERRCODE = '23514'; END IF;
  EXECUTE format('UPDATE public.%I SET publication_state=$1, publication_revision=publication_revision+1
    WHERE id=$2::%s RETURNING to_jsonb(%I)', content_table,
    CASE WHEN content_table='intake_calls' THEN 'text' ELSE 'uuid' END, content_table)
    INTO result_row USING next_state, content_id;
  INSERT INTO private.publication_reviews(content_table,content_id,revision,previous_state,next_state,reviewer_id,review_note)
  VALUES (content_table,content_id,(result_row->>'publication_revision')::integer,current_row->>'publication_state',next_state,auth.uid(),btrim(review_note));
  RETURN result_row;
END;
$$;
REVOKE ALL ON FUNCTION public.review_publication(text,text,integer,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_publication(text,text,integer,text,text) TO authenticated;

CREATE POLICY "Published event chapter" ON public.events AS RESTRICTIVE FOR SELECT TO authenticated
USING ((SELECT public.is_admin()) OR EXISTS (
  SELECT 1 FROM public.chapters c WHERE c.id=chapter_id AND c.publication_state='published'
));

-- Direct writes to dependent records must honor publication, too. Cancellation,
-- existing private receipts and project collaboration keep their existing rules.
CREATE POLICY "Published event registration" ON public.event_registrations AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.events WHERE id=event_id AND publication_state='published' AND status='upcoming' AND starts_at>now()));
CREATE POLICY "Published opportunity interest" ON public.opportunity_interests AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.opportunities WHERE id=opportunity_id AND publication_state='published' AND is_active AND (deadline IS NULL OR deadline>now())));
CREATE POLICY "Published news bookmark" ON public.news_bookmarks AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.news_articles WHERE id=article_id AND publication_state='published'));
CREATE POLICY "Published project bookmark" ON public.project_bookmarks AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects WHERE id=project_id AND publication_state='published'));
CREATE POLICY "Published essay vote" ON public.essay_upvotes AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.essay_submissions WHERE id=essay_id AND publication_state='published'));
CREATE POLICY "Published project application" ON public.lab_applications AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects WHERE id=project_id AND publication_state='published' AND status='open' AND (application_deadline IS NULL OR application_deadline>now())));
CREATE POLICY "Published intake submission" ON public.intake_submissions AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.intake_calls WHERE id=call_id AND publication_state='published'));

-- The aggregate must not become an oracle for private/unreviewed essay IDs.
CREATE OR REPLACE FUNCTION public.get_essay_upvote_count(target_essay_id uuid)
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT count(*) FROM public.essay_upvotes u WHERE u.essay_id=target_essay_id AND EXISTS (
  SELECT 1 FROM public.essay_submissions e WHERE e.id=target_essay_id
  AND (e.publication_state='published' OR e.author_id=auth.uid() OR public.is_admin())
);
$$;

INSERT INTO private.portal_schema_revisions(version,name)
VALUES ('20261011091000','reviewed_publication');
COMMIT;
