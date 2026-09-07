-- Finance4All Portal — initial schema
-- Run in Supabase SQL Editor or via supabase db push

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('member', 'lead_researcher', 'admin');
CREATE TYPE news_category AS ENUM ('macro', 'markets', 'ipo', 'company');
CREATE TYPE research_project_status AS ENUM ('draft', 'open', 'reviewing', 'closed');
CREATE TYPE lab_application_status AS ENUM ('pending', 'under_review', 'accepted', 'rejected');
CREATE TYPE opportunity_type AS ENUM ('internship', 'program', 'challenge', 'project_role');
CREATE TYPE event_status AS ENUM ('upcoming', 'live', 'completed');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE explainer_difficulty AS ENUM ('beginner', 'intermediate');

-- ─── Chapters (before profiles FK) ───────────────────────────────────────────

CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  member_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Profiles ────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  bio TEXT,
  avatar_url TEXT,
  interests TEXT[] NOT NULL DEFAULT '{}',
  open_to_collaborate BOOLEAN NOT NULL DEFAULT false,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup (email, Google OAuth, etc.)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1),
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Debriefed ───────────────────────────────────────────────────────────────

CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category news_category NOT NULL,
  source_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE explainer_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  difficulty explainer_difficulty NOT NULL DEFAULT 'beginner',
  related_terms TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE digest_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  weekly_digest_enabled BOOLEAN NOT NULL DEFAULT false,
  substack_subscribed BOOLEAN NOT NULL DEFAULT false,
  preferred_categories news_category[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Meta Labs ─────────────────────────────────────────────────────────────────

CREATE TABLE research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status research_project_status NOT NULL DEFAULT 'draft',
  lead_researcher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  application_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lab_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status lab_application_status NOT NULL DEFAULT 'pending',
  motivation TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (project_id, applicant_id)
);

-- ─── Pathways ──────────────────────────────────────────────────────────────────

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  type opportunity_type NOT NULL,
  description TEXT NOT NULL,
  application_url TEXT,
  deadline TIMESTAMPTZ,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE opportunity_interests (
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (opportunity_id, user_id)
);

CREATE TABLE studio_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  repo_url TEXT,
  demo_url TEXT,
  writeup TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE essay_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_editorial_pick BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE essay_upvotes (
  essay_id UUID NOT NULL REFERENCES essay_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (essay_id, user_id)
);

-- ─── Events ────────────────────────────────────────────────────────────────────

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status event_status NOT NULL DEFAULT 'upcoming',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  registration_url TEXT,
  program_links JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE event_registrations (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- ─── Networking ────────────────────────────────────────────────────────────────

CREATE TABLE connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id),
  CHECK (from_user_id <> to_user_id)
);

CREATE TABLE introduction_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  looking_for TEXT NOT NULL,
  interests TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Helpers ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_lead_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'lead_researcher')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── updated_at trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER research_projects_updated_at BEFORE UPDATE ON research_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE explainer_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE essay_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE essay_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE introduction_posts ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Chapters & events (read all, admin write)
CREATE POLICY "Chapters viewable by authenticated" ON chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage chapters" ON chapters FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Events viewable by authenticated" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage events" ON events FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Users manage own event registrations"
  ON event_registrations FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Debriefed
CREATE POLICY "News viewable by authenticated" ON news_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage news" ON news_articles FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Explainers viewable by authenticated" ON explainer_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage explainers" ON explainer_cards FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Users manage own digest prefs"
  ON digest_preferences FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Labs
CREATE POLICY "Open projects viewable" ON research_projects FOR SELECT TO authenticated
  USING (status <> 'draft' OR lead_researcher_id = auth.uid() OR is_admin());
CREATE POLICY "Leads create projects" ON research_projects FOR INSERT TO authenticated
  WITH CHECK (lead_researcher_id = auth.uid() AND is_lead_or_admin());
CREATE POLICY "Leads update own projects" ON research_projects FOR UPDATE TO authenticated
  USING (lead_researcher_id = auth.uid() OR is_admin());

CREATE POLICY "Applicants view own applications" ON lab_applications FOR SELECT TO authenticated
  USING (
    applicant_id = auth.uid()
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_id AND rp.lead_researcher_id = auth.uid()
    )
  );
CREATE POLICY "Members apply to projects" ON lab_applications FOR INSERT TO authenticated
  WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "Leads review applications" ON lab_applications FOR UPDATE TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_id AND rp.lead_researcher_id = auth.uid()
    )
  );

-- Pathways
CREATE POLICY "Opportunities viewable" ON opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage opportunities" ON opportunities FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Users manage own opportunity interests"
  ON opportunity_interests FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Studios viewable" ON studio_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own studio submissions" ON studio_submissions FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users update own studio submissions" ON studio_submissions FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Essays viewable" ON essay_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own essays" ON essay_submissions FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());
CREATE POLICY "Admin update essays" ON essay_submissions FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR is_admin());

CREATE POLICY "Users manage own upvotes" ON essay_upvotes FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Networking
CREATE POLICY "Introductions viewable" ON introduction_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own introductions" ON introduction_posts FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users delete own introductions" ON introduction_posts FOR DELETE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Users view own connections" ON connection_requests FOR SELECT TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
CREATE POLICY "Users send connections" ON connection_requests FOR INSERT TO authenticated
  WITH CHECK (from_user_id = auth.uid());
CREATE POLICY "Recipients respond to connections" ON connection_requests FOR UPDATE TO authenticated
  USING (to_user_id = auth.uid());

-- Essay upvote count view
CREATE OR REPLACE VIEW essay_submissions_with_counts AS
SELECT
  e.*,
  COALESCE(u.cnt, 0)::int AS upvote_count
FROM essay_submissions e
LEFT JOIN (
  SELECT essay_id, COUNT(*) AS cnt FROM essay_upvotes GROUP BY essay_id
) u ON u.essay_id = e.id;

GRANT SELECT ON essay_submissions_with_counts TO authenticated;
