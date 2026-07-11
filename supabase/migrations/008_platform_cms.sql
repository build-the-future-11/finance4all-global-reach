-- CMS content, weekly goals, server-side rate limiting, digest tracking, portal search

-- ─── Education CMS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS education_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  eyebrow TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  inclusive_note TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS education_lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_min INT NOT NULL,
  summary TEXT NOT NULL,
  objectives TEXT[] NOT NULL DEFAULT '{}',
  body TEXT NOT NULL DEFAULT '',
  exercise TEXT NOT NULL DEFAULT '',
  key_terms TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Resources CMS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS resource_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('curriculum', 'journal', 'podcast', 'toolkit', 'partner', 'webinar')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  href TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  free BOOLEAN NOT NULL DEFAULT true,
  external BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resource_guides (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  checklist TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webinars (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  host TEXT NOT NULL,
  recurrence_label TEXT NOT NULL,
  description TEXT NOT NULL,
  href TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Landing testimonials ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL CHECK (char_length(quote) BETWEEN 10 AND 2000),
  attribution TEXT NOT NULL,
  role_label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Weekly goals ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS weekly_goal_baselines (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  saved_articles INT NOT NULL DEFAULT 0,
  connections INT NOT NULL DEFAULT 0,
  completed_lessons INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_start)
);

-- ─── Digest delivery tracking ────────────────────────────────────────────────

ALTER TABLE digest_preferences
  ADD COLUMN IF NOT EXISTS last_digest_sent_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS digest_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  article_count INT NOT NULL DEFAULT 0,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS digest_send_log_user ON digest_send_log (user_id, sent_at DESC);

-- ─── Server-side rate limiting ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limit_lookup
  ON rate_limit_events (action, identifier, created_at DESC);

ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_action TEXT,
  p_identifier TEXT,
  p_max_attempts INT,
  p_window_seconds INT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INT;
BEGIN
  SELECT COUNT(*)::INT INTO attempt_count
  FROM rate_limit_events
  WHERE action = p_action
    AND identifier = lower(trim(p_identifier))
    AND created_at > now() - make_interval(secs => p_window_seconds);
  RETURN attempt_count < p_max_attempts;
END;
$$;

CREATE OR REPLACE FUNCTION record_rate_limit(
  p_action TEXT,
  p_identifier TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO rate_limit_events (action, identifier)
  VALUES (p_action, lower(trim(p_identifier)));
  DELETE FROM rate_limit_events WHERE created_at < now() - interval '48 hours';
END;
$$;

GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_rate_limit(TEXT, TEXT) TO anon, authenticated;

-- ─── Portal search RPC ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION portal_search(p_query TEXT, p_limit INT DEFAULT 12)
RETURNS TABLE (
  id TEXT,
  result_type TEXT,
  title TEXT,
  subtitle TEXT,
  href TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH q AS (SELECT lower(trim(p_query)) AS term)
  SELECT * FROM (
    SELECT n.id::TEXT, 'news'::TEXT, n.title, left(n.summary, 80), '/portal/debriefed'
    FROM news_articles n, q
    WHERE length(q.term) >= 2
      AND (lower(n.title) LIKE '%' || q.term || '%' OR lower(n.summary) LIKE '%' || q.term || '%')
    UNION ALL
    SELECT rp.id::TEXT, 'lab', rp.title, 'Research project', '/portal/labs/' || rp.id::TEXT
    FROM research_projects rp, q
    WHERE length(q.term) >= 2 AND rp.status <> 'draft'
      AND (lower(rp.title) LIKE '%' || q.term || '%' OR lower(rp.description) LIKE '%' || q.term || '%')
    UNION ALL
    SELECT o.id::TEXT, 'opportunity', o.title, o.organization, '/portal/pathways/opportunities'
    FROM opportunities o, q
    WHERE length(q.term) >= 2 AND o.is_active
      AND (lower(o.title) LIKE '%' || q.term || '%' OR lower(o.organization) LIKE '%' || q.term || '%')
    UNION ALL
    SELECT e.id::TEXT, 'event', e.title, 'Event', '/portal/events'
    FROM events e, q
    WHERE length(q.term) >= 2
      AND (lower(e.title) LIKE '%' || q.term || '%' OR lower(e.description) LIKE '%' || q.term || '%')
    UNION ALL
    SELECT p.id::TEXT, 'member', p.display_name, 'Member', '/portal/network/profile/' || p.id::TEXT
    FROM profiles p, q
    WHERE length(q.term) >= 2 AND p.display_name <> ''
      AND (lower(p.display_name) LIKE '%' || q.term || '%' OR lower(coalesce(p.bio, '')) LIKE '%' || q.term || '%')
    UNION ALL
    SELECT ex.id::TEXT, 'explainer', ex.title, 'Explainer', '/portal/debriefed/explainers/' || ex.slug
    FROM explainer_cards ex, q
    WHERE length(q.term) >= 2
      AND (lower(ex.title) LIKE '%' || q.term || '%' OR lower(ex.summary) LIKE '%' || q.term || '%')
    UNION ALL
    SELECT el.id, 'education', el.title, em.title, '/portal/education/' || el.id
    FROM education_lessons el
    JOIN education_modules em ON em.id = el.module_id, q
    WHERE length(q.term) >= 2
      AND (lower(el.title) LIKE '%' || q.term || '%' OR lower(el.summary) LIKE '%' || q.term || '%' OR lower(em.title) LIKE '%' || q.term || '%')
    UNION ALL
    SELECT ri.id, 'resource', ri.title, 'Resource', ri.href
    FROM resource_items ri, q
    WHERE length(q.term) >= 2
      AND (lower(ri.title) LIKE '%' || q.term || '%' OR lower(ri.description) LIKE '%' || q.term || '%')
  ) results
  LIMIT GREATEST(1, LEAST(p_limit, 30));
$$;

GRANT EXECUTE ON FUNCTION portal_search(TEXT, INT) TO authenticated;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE education_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_goal_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_send_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Education modules readable" ON education_modules;
CREATE POLICY "Education modules readable" ON education_modules FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin manage education modules" ON education_modules;
CREATE POLICY "Admin manage education modules" ON education_modules FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Education lessons readable" ON education_lessons;
CREATE POLICY "Education lessons readable" ON education_lessons FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin manage education lessons" ON education_lessons;
CREATE POLICY "Admin manage education lessons" ON education_lessons FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Resource items readable" ON resource_items;
CREATE POLICY "Resource items readable" ON resource_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin manage resource items" ON resource_items;
CREATE POLICY "Admin manage resource items" ON resource_items FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Resource guides readable" ON resource_guides;
CREATE POLICY "Resource guides readable" ON resource_guides FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin manage resource guides" ON resource_guides;
CREATE POLICY "Admin manage resource guides" ON resource_guides FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Webinars readable" ON webinars;
CREATE POLICY "Webinars readable" ON webinars FOR SELECT TO authenticated USING (is_active);
DROP POLICY IF EXISTS "Admin manage webinars" ON webinars;
CREATE POLICY "Admin manage webinars" ON webinars FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Published testimonials public" ON testimonials;
CREATE POLICY "Published testimonials public" ON testimonials FOR SELECT TO anon, authenticated USING (is_published);
DROP POLICY IF EXISTS "Admin manage testimonials" ON testimonials;
CREATE POLICY "Admin manage testimonials" ON testimonials FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Users manage own weekly goals" ON weekly_goal_baselines;
CREATE POLICY "Users manage own weekly goals" ON weekly_goal_baselines FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own digest log" ON digest_send_log;
CREATE POLICY "Users view own digest log" ON digest_send_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin view digest log" ON digest_send_log;
CREATE POLICY "Admin view digest log" ON digest_send_log FOR SELECT TO authenticated USING (is_admin());
