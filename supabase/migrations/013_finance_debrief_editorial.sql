-- 013 Finance Debrief trustworthy editorial foundation
-- Approved sources, editorial status, versioning, AI generation logs, publish RPC.

-- ─── Enums ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE news_editorial_status AS ENUM (
    'draft',
    'in_review',
    'scheduled',
    'published',
    'corrected',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Approved source registry ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS approved_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 200),
  homepage_url TEXT NOT NULL CHECK (homepage_url ~* '^https://'),
  allowed_domains TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS approved_sources_name_unique
  ON approved_sources (lower(trim(name)));

CREATE INDEX IF NOT EXISTS approved_sources_active
  ON approved_sources (is_active);

ALTER TABLE approved_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved sources readable by authenticated" ON approved_sources;
CREATE POLICY "Approved sources readable by authenticated"
  ON approved_sources FOR SELECT TO authenticated
  USING (is_active OR is_admin());

DROP POLICY IF EXISTS "Admin manage approved sources" ON approved_sources;
CREATE POLICY "Admin manage approved sources"
  ON approved_sources FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Extend news_articles ────────────────────────────────────────────────────

ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS status news_editorial_status,
  ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES approved_sources(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS source_published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS topics TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS regions TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS importance INT NOT NULL DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS editor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS newsletter_include BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_assisted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS disclaimer_version TEXT NOT NULL DEFAULT 'edu-not-advice-v1',
  ADD COLUMN IF NOT EXISTS body TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Backfill editorial status from legacy is_published
UPDATE news_articles
SET status = CASE WHEN is_published THEN 'published'::news_editorial_status ELSE 'draft'::news_editorial_status END
WHERE status IS NULL;

ALTER TABLE news_articles
  ALTER COLUMN status SET DEFAULT 'draft'::news_editorial_status;

ALTER TABLE news_articles
  ALTER COLUMN status SET NOT NULL;

-- Bootstrap legacy source so pre-existing published rows remain valid under publish rules
INSERT INTO approved_sources (name, homepage_url, allowed_domains, notes, is_active)
SELECT
  'Legacy editorial archive',
  'https://finance4all-global-reach.vercel.app',
  ARRAY['finance4all-global-reach.vercel.app'],
  'Auto-created for articles published before the approved-source registry. Replace with real sources.',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM approved_sources WHERE lower(trim(name)) = lower('Legacy editorial archive')
);

UPDATE news_articles n
SET source_id = s.id
FROM approved_sources s
WHERE n.source_id IS NULL
  AND n.status IN ('published', 'corrected', 'scheduled')
  AND lower(trim(s.name)) = lower('Legacy editorial archive');

CREATE INDEX IF NOT EXISTS news_articles_status_published_at
  ON news_articles (status, published_at DESC);

CREATE INDEX IF NOT EXISTS news_articles_newsletter
  ON news_articles (newsletter_include, published_at DESC)
  WHERE newsletter_include AND status IN ('published', 'corrected');

CREATE INDEX IF NOT EXISTS news_articles_source_id
  ON news_articles (source_id);

-- Members see published/corrected only; admins see all
DROP POLICY IF EXISTS "Published news viewable" ON news_articles;
CREATE POLICY "Published news viewable" ON news_articles FOR SELECT TO authenticated
  USING (
    status IN ('published', 'corrected')
    OR is_admin()
  );

-- ─── Version history ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS news_article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  version INT NOT NULL CHECK (version >= 1),
  snapshot JSONB NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  change_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (article_id, version)
);

CREATE INDEX IF NOT EXISTS news_article_versions_article
  ON news_article_versions (article_id, version DESC);

ALTER TABLE news_article_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read article versions" ON news_article_versions;
CREATE POLICY "Admin read article versions"
  ON news_article_versions FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admin insert article versions" ON news_article_versions;
CREATE POLICY "Admin insert article versions"
  ON news_article_versions FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- ─── AI generation logs ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS debrief_ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES news_articles(id) ON DELETE SET NULL,
  model TEXT NOT NULL DEFAULT 'unconfigured',
  prompt_hash TEXT NOT NULL,
  source_ids UUID[] NOT NULL DEFAULT '{}',
  output_excerpt TEXT NOT NULL DEFAULT '',
  structured_output JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'completed', 'failed', 'rejected', 'applied')),
  error_message TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_in_publish BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS debrief_ai_logs_article
  ON debrief_ai_generation_logs (article_id, created_at DESC);

CREATE INDEX IF NOT EXISTS debrief_ai_logs_created_by
  ON debrief_ai_generation_logs (created_by, created_at DESC);

ALTER TABLE debrief_ai_generation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage debrief AI logs" ON debrief_ai_generation_logs;
CREATE POLICY "Admin manage debrief AI logs"
  ON debrief_ai_generation_logs FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Snapshot helper ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION news_article_snapshot(article news_articles)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'id', article.id,
    'title', article.title,
    'summary', article.summary,
    'body', article.body,
    'category', article.category,
    'source_url', article.source_url,
    'source_id', article.source_id,
    'source_published_at', article.source_published_at,
    'topics', article.topics,
    'regions', article.regions,
    'importance', article.importance,
    'status', article.status,
    'is_published', article.is_published,
    'newsletter_include', article.newsletter_include,
    'ai_assisted', article.ai_assisted,
    'disclaimer_version', article.disclaimer_version,
    'tags', article.tags,
    'author_id', article.author_id,
    'editor_id', article.editor_id,
    'scheduled_for', article.scheduled_for,
    'published_at', article.published_at
  );
$$;

CREATE OR REPLACE FUNCTION record_news_article_version(
  p_article_id UUID,
  p_change_note TEXT DEFAULT ''
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version INT;
  article news_articles%ROWTYPE;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can version Finance Debrief articles';
  END IF;

  SELECT * INTO article FROM news_articles WHERE id = p_article_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Article not found';
  END IF;

  SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
  FROM news_article_versions
  WHERE article_id = p_article_id;

  INSERT INTO news_article_versions (article_id, version, snapshot, changed_by, change_note)
  VALUES (
    p_article_id,
    next_version,
    news_article_snapshot(article),
    auth.uid(),
    COALESCE(trim(p_change_note), '')
  );

  RETURN next_version;
END;
$$;

-- ─── Publish / transition RPC (hard guards) ──────────────────────────────────

CREATE OR REPLACE FUNCTION transition_news_article_status(
  p_article_id UUID,
  p_new_status news_editorial_status,
  p_change_note TEXT DEFAULT '',
  p_ai_log_id UUID DEFAULT NULL
)
RETURNS news_articles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  article news_articles%ROWTYPE;
  source_ok BOOLEAN := false;
BEGIN
  IF auth.uid() IS NULL OR NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can transition Finance Debrief status';
  END IF;

  SELECT * INTO article FROM news_articles WHERE id = p_article_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Article not found';
  END IF;

  IF p_new_status IN ('published', 'corrected', 'scheduled') THEN
    IF article.source_id IS NULL THEN
      RAISE EXCEPTION 'Cannot publish Finance Debrief content without an approved source';
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM approved_sources s
      WHERE s.id = article.source_id AND s.is_active = true
    ) INTO source_ok;

    IF NOT source_ok THEN
      RAISE EXCEPTION 'Approved source must exist and be active before publish';
    END IF;
  END IF;

  IF p_new_status IN ('published', 'corrected') AND article.ai_assisted THEN
    IF p_ai_log_id IS NULL THEN
      RAISE EXCEPTION 'AI-assisted articles require a generation log id before publish';
    END IF;

    UPDATE debrief_ai_generation_logs
    SET
      article_id = p_article_id,
      used_in_publish = true,
      status = 'applied'
    WHERE id = p_ai_log_id
      AND created_by = auth.uid()
      AND status IN ('completed', 'queued', 'applied');

    IF NOT FOUND THEN
      -- allow admin to attach any completed log they own or any admin log
      UPDATE debrief_ai_generation_logs
      SET
        article_id = p_article_id,
        used_in_publish = true,
        status = 'applied'
      WHERE id = p_ai_log_id
        AND status IN ('completed', 'queued', 'applied')
        AND is_admin();

      IF NOT FOUND THEN
        RAISE EXCEPTION 'AI generation log not found or not eligible for publish';
      END IF;
    END IF;
  END IF;

  -- Snapshot prior state when leaving a published surface or entering publish
  IF article.status IS DISTINCT FROM p_new_status THEN
    IF article.status IN ('published', 'corrected')
       OR p_new_status IN ('published', 'corrected', 'archived') THEN
      PERFORM record_news_article_version(
        p_article_id,
        COALESCE(NULLIF(trim(p_change_note), ''), format('status %s → %s', article.status, p_new_status))
      );
    END IF;
  END IF;

  UPDATE news_articles SET
    status = p_new_status,
    is_published = (p_new_status IN ('published', 'corrected')),
    published_at = CASE
      WHEN p_new_status IN ('published', 'corrected') AND article.status NOT IN ('published', 'corrected')
        THEN now()
      ELSE article.published_at
    END,
    editor_id = COALESCE(auth.uid(), article.editor_id),
    author_id = COALESCE(article.author_id, auth.uid()),
    updated_at = now()
  WHERE id = p_article_id
  RETURNING * INTO article;

  RETURN article;
END;
$$;

CREATE OR REPLACE FUNCTION publish_news_article(
  p_article_id UUID,
  p_change_note TEXT DEFAULT 'Published',
  p_ai_log_id UUID DEFAULT NULL
)
RETURNS news_articles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN transition_news_article_status(
    p_article_id,
    'published'::news_editorial_status,
    p_change_note,
    p_ai_log_id
  );
END;
$$;

REVOKE ALL ON FUNCTION transition_news_article_status(UUID, news_editorial_status, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION publish_news_article(UUID, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION record_news_article_version(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION transition_news_article_status(UUID, news_editorial_status, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION publish_news_article(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_news_article_version(UUID, TEXT) TO authenticated;

-- Block direct publish bypass: sync is_published; reject publish-like writes without source
CREATE OR REPLACE FUNCTION enforce_news_article_publish_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Keep legacy boolean in sync when status present
  IF NEW.status IS NOT NULL THEN
    NEW.is_published := NEW.status IN ('published', 'corrected');
  END IF;

  IF NEW.is_published = true OR NEW.status IN ('published', 'corrected', 'scheduled') THEN
    IF NEW.source_id IS NULL THEN
      RAISE EXCEPTION 'Finance Debrief articles that are scheduled or published require source_id';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM approved_sources s WHERE s.id = NEW.source_id AND s.is_active
    ) THEN
      RAISE EXCEPTION 'Finance Debrief source_id must reference an active approved source';
    END IF;
  END IF;

  -- AI-assisted content may never flip to published via raw UPDATE without a used log
  IF TG_OP = 'UPDATE'
     AND NEW.ai_assisted = true
     AND NEW.status IN ('published', 'corrected')
     AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.is_published IS DISTINCT FROM NEW.is_published) THEN
    IF NOT EXISTS (
      SELECT 1 FROM debrief_ai_generation_logs l
      WHERE l.article_id = NEW.id AND l.used_in_publish = true
    ) THEN
      RAISE EXCEPTION 'AI-assisted Finance Debrief articles must publish via publish_news_article with a generation log';
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_news_publish_rules ON news_articles;
CREATE TRIGGER trg_enforce_news_publish_rules
  BEFORE INSERT OR UPDATE ON news_articles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_news_article_publish_rules();

-- Queue AI generation (adapter writes here; live model is owner-configured)
CREATE OR REPLACE FUNCTION queue_debrief_ai_generation(
  p_prompt_hash TEXT,
  p_source_ids UUID[] DEFAULT '{}',
  p_article_id UUID DEFAULT NULL,
  p_model TEXT DEFAULT 'unconfigured'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  IF auth.uid() IS NULL OR NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can queue Debrief AI generation';
  END IF;

  IF p_source_ids IS NULL OR cardinality(p_source_ids) = 0 THEN
    RAISE EXCEPTION 'AI generation requires at least one approved source id';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_source_ids) sid
    WHERE NOT EXISTS (
      SELECT 1 FROM approved_sources s WHERE s.id = sid AND s.is_active
    )
  ) THEN
    RAISE EXCEPTION 'All AI generation source ids must be active approved sources';
  END IF;

  INSERT INTO debrief_ai_generation_logs (
    article_id, model, prompt_hash, source_ids, status, created_by, output_excerpt
  ) VALUES (
    p_article_id,
    COALESCE(NULLIF(trim(p_model), ''), 'unconfigured'),
    trim(p_prompt_hash),
    p_source_ids,
    'queued',
    auth.uid(),
    'Queued — live model adapter not configured in this environment'
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

REVOKE ALL ON FUNCTION queue_debrief_ai_generation(TEXT, UUID[], UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION queue_debrief_ai_generation(TEXT, UUID[], UUID, TEXT) TO authenticated;
