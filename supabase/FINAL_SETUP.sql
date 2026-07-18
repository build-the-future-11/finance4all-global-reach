-- FinanceMeta / Finance4All final consolidated Supabase setup.
-- Generated from supabase/migrations/*.sql in filename order.
-- Apply to a new Supabase project in SQL Editor, then run supabase/VERIFY_SETUP.sql.

-- ============================================================
-- 001_initial_schema.sql
-- ============================================================
-- Finance4All Portal — initial schema
-- Run in Supabase SQL Editor or via supabase db push
-- Safe to re-run: enums/tables use IF NOT EXISTS / duplicate_object guards

-- ─── Enums ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('member', 'lead_researcher', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE news_category AS ENUM ('macro', 'markets', 'ipo', 'company');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE research_project_status AS ENUM ('draft', 'open', 'reviewing', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lab_application_status AS ENUM ('pending', 'under_review', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_type AS ENUM ('internship', 'program', 'challenge', 'project_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('upcoming', 'live', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE explainer_difficulty AS ENUM ('beginner', 'intermediate');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Chapters (before profiles FK) ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chapters (
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

CREATE TABLE IF NOT EXISTS profiles (
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

-- ============================================================
-- 002_google_oauth.sql
-- ============================================================
-- Patch: Google OAuth profile fields + fallback profile insert policy
-- Run this in Supabase SQL Editor if you already ran 001_initial_schema.sql

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
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = CASE
      WHEN profiles.display_name = '' OR profiles.display_name IS NULL
      THEN EXCLUDED.display_name
      ELSE profiles.display_name
    END,
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fallback if trigger missed (e.g. OAuth edge cases)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ============================================================
-- 003_bookmarks_notifications.sql
-- ============================================================
-- Bookmarks, notifications, and activity triggers

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'connection_request',
    'connection_accepted',
    'lab_application_status',
    'lab_application_received'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Bookmarks ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS news_bookmarks (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, article_id)
);

CREATE TABLE IF NOT EXISTS project_bookmarks (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

-- ─── Notifications ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_created ON notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_unread ON notifications (user_id) WHERE NOT read;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE news_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own news bookmarks"
  ON news_bookmarks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own project bookmarks"
  ON project_bookmarks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Inserts via triggers only (SECURITY DEFINER functions)
CREATE POLICY "System insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- ─── Notification triggers ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT display_name INTO sender_name FROM profiles WHERE id = NEW.from_user_id;
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    NEW.to_user_id,
    'connection_request',
    'New connection request',
    COALESCE(sender_name, 'A member') || ' wants to connect with you.',
    '/portal/network'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_connection_request_created
  AFTER INSERT ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION notify_connection_request();

CREATE OR REPLACE FUNCTION notify_connection_accepted()
RETURNS TRIGGER AS $$
DECLARE
  accepter_name TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    SELECT display_name INTO accepter_name FROM profiles WHERE id = NEW.to_user_id;
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      NEW.from_user_id,
      'connection_accepted',
      'Connection accepted',
      COALESCE(accepter_name, 'A member') || ' accepted your connection request.',
      '/portal/network'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_connection_accepted
  AFTER UPDATE ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION notify_connection_accepted();

CREATE OR REPLACE FUNCTION notify_lab_application_received()
RETURNS TRIGGER AS $$
DECLARE
  applicant_name TEXT;
  project_title TEXT;
  lead_id UUID;
BEGIN
  SELECT display_name INTO applicant_name FROM profiles WHERE id = NEW.applicant_id;
  SELECT title, lead_researcher_id INTO project_title, lead_id
    FROM research_projects WHERE id = NEW.project_id;

  IF lead_id IS NOT NULL AND lead_id <> NEW.applicant_id THEN
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      lead_id,
      'lab_application_received',
      'New lab application',
      COALESCE(applicant_name, 'A member') || ' applied to "' || COALESCE(project_title, 'your project') || '".',
      '/portal/labs/review'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_lab_application_created
  AFTER INSERT ON lab_applications
  FOR EACH ROW EXECUTE FUNCTION notify_lab_application_received();

CREATE OR REPLACE FUNCTION notify_lab_application_status()
RETURNS TRIGGER AS $$
DECLARE
  project_title TEXT;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('accepted', 'rejected', 'under_review') THEN
    SELECT title INTO project_title FROM research_projects WHERE id = NEW.project_id;
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      NEW.applicant_id,
      'lab_application_status',
      'Application update',
      'Your application to "' || COALESCE(project_title, 'a project') || '" is now ' ||
        replace(NEW.status::text, '_', ' ') || '.',
      '/portal/labs'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_lab_application_status_changed
  AFTER UPDATE ON lab_applications
  FOR EACH ROW EXECUTE FUNCTION notify_lab_application_status();

-- ============================================================
-- 004_avatar_storage.sql
-- ============================================================
-- Avatar storage bucket and policies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public avatar read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 005_security_hardening.sql
-- ============================================================
-- Security hardening: prevent profile privilege escalation and notification spam
-- Safe to re-run: uses DROP POLICY IF EXISTS

-- ─── Profiles: block role/email self-escalation ───────────────────────────────

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
    AND email = (SELECT p.email FROM profiles p WHERE p.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admin manage profiles" ON profiles;
CREATE POLICY "Admin manage profiles"
  ON profiles FOR UPDATE TO authenticated
  USING (is_admin());

-- ─── Notifications: inserts via SECURITY DEFINER triggers only ────────────────
-- Migration 003 defines notify_*() functions as SECURITY DEFINER; they bypass RLS.
-- No INSERT policy remains — clients cannot spam notifications; only triggers insert.

DROP POLICY IF EXISTS "System insert notifications" ON notifications;

-- ─── Chapter member counts: keep member_count in sync ───────────────────────

CREATE OR REPLACE FUNCTION sync_chapter_member_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.chapter_id IS NOT NULL THEN
      UPDATE chapters SET member_count = member_count + 1 WHERE id = NEW.chapter_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.chapter_id IS NOT NULL THEN
      UPDATE chapters SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.chapter_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.chapter_id IS DISTINCT FROM NEW.chapter_id THEN
      IF OLD.chapter_id IS NOT NULL THEN
        UPDATE chapters SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.chapter_id;
      END IF;
      IF NEW.chapter_id IS NOT NULL THEN
        UPDATE chapters SET member_count = member_count + 1 WHERE id = NEW.chapter_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_chapter_member_count ON profiles;
CREATE TRIGGER profiles_chapter_member_count
  AFTER INSERT OR UPDATE OF chapter_id OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_chapter_member_counts();

-- Backfill member counts from current profile assignments
UPDATE chapters c
SET member_count = (
  SELECT COUNT(*)::int FROM profiles p WHERE p.chapter_id = c.id
);

-- ─── Profiles: belt-and-suspenders triggers ───────────────────────────────────

CREATE OR REPLACE FUNCTION enforce_profile_insert_defaults()
RETURNS TRIGGER AS $$
BEGIN
  NEW.role := 'member';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_enforce_insert_role ON profiles;
CREATE TRIGGER profiles_enforce_insert_role
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_profile_insert_defaults();

CREATE OR REPLACE FUNCTION protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins may change profile roles';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_protect_role ON profiles;
CREATE TRIGGER profiles_protect_role
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_profile_role();

-- ============================================================
-- 006_education_progress.sql
-- ============================================================
-- Persist Catalyst education lesson completion per user

CREATE TABLE IF NOT EXISTS education_lesson_progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS education_lesson_progress_user
  ON education_lesson_progress (user_id);

ALTER TABLE education_lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own education progress" ON education_lesson_progress;
CREATE POLICY "Users manage own education progress"
  ON education_lesson_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 007_contact_submissions.sql
-- ============================================================
-- Public contact form submissions (landing page inquiries)

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
  email TEXT NOT NULL CHECK (char_length(trim(email)) BETWEEN 3 AND 254),
  subject TEXT NOT NULL CHECK (char_length(trim(subject)) BETWEEN 1 AND 200),
  message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 10 AND 5000),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_submissions_status_created
  ON contact_submissions (status, created_at DESC);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public submit contact" ON contact_submissions;
CREATE POLICY "Public submit contact"
  ON contact_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view contact submissions" ON contact_submissions;
CREATE POLICY "Admin view contact submissions"
  ON contact_submissions FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admin update contact submissions" ON contact_submissions;
CREATE POLICY "Admin update contact submissions"
  ON contact_submissions FOR UPDATE TO authenticated
  USING (is_admin());

-- ============================================================
-- 008_platform_cms.sql
-- ============================================================
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

-- ============================================================
-- 009_membership_integrity.sql
-- ============================================================
-- Membership integrity: server-enforced lifecycle, ownership, and public-write rules.
-- This migration is additive and safe for existing populated environments.

-- ─── Profiles and onboarding ────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Existing members with a completed profile should not be forced through a new
-- onboarding flow just because this field did not exist when they joined.
UPDATE profiles
SET onboarding_completed_at = COALESCE(onboarding_completed_at, now())
WHERE NULLIF(trim(display_name), '') IS NOT NULL;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- A recovery path for historical accounts where the auth trigger was absent.
-- It deliberately derives identity fields from auth.users, not browser input.
CREATE OR REPLACE FUNCTION ensure_my_profile()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auth_user auth.users%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO auth_user FROM auth.users WHERE id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Authenticated user was not found';
  END IF;

  INSERT INTO profiles (id, email, display_name, avatar_url)
  VALUES (
    auth_user.id,
    COALESCE(auth_user.email, ''),
    COALESCE(
      auth_user.raw_user_meta_data->>'display_name',
      auth_user.raw_user_meta_data->>'full_name',
      auth_user.raw_user_meta_data->>'name',
      split_part(COALESCE(auth_user.email, ''), '@', 1),
      ''
    ),
    COALESCE(
      auth_user.raw_user_meta_data->>'avatar_url',
      auth_user.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION complete_profile_onboarding(
  p_display_name TEXT,
  p_bio TEXT DEFAULT NULL,
  p_interests TEXT[] DEFAULT '{}',
  p_open_to_collaborate BOOLEAN DEFAULT FALSE,
  p_chapter_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_name TEXT := trim(p_display_name);
  clean_bio TEXT := NULLIF(trim(COALESCE(p_bio, '')), '');
  clean_interests TEXT[] := ARRAY(
    SELECT DISTINCT trim(interest)
    FROM unnest(COALESCE(p_interests, '{}')) AS interest
    WHERE trim(interest) <> ''
  );
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF char_length(clean_name) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Display name must be between 1 and 120 characters';
  END IF;
  IF clean_bio IS NOT NULL AND char_length(clean_bio) > 1000 THEN
    RAISE EXCEPTION 'Bio must be 1000 characters or fewer';
  END IF;
  IF cardinality(clean_interests) > 12
     OR EXISTS (SELECT 1 FROM unnest(clean_interests) AS interest WHERE char_length(interest) > 40) THEN
    RAISE EXCEPTION 'Choose up to 12 interests of 40 characters or fewer';
  END IF;
  IF p_chapter_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM chapters WHERE id = p_chapter_id) THEN
    RAISE EXCEPTION 'Selected chapter was not found';
  END IF;

  UPDATE profiles
  SET display_name = clean_name,
      bio = clean_bio,
      interests = clean_interests,
      open_to_collaborate = COALESCE(p_open_to_collaborate, false),
      chapter_id = p_chapter_id,
      onboarding_completed_at = COALESCE(onboarding_completed_at, now())
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile was not found';
  END IF;
END;
$$;

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
GRANT EXECUTE ON FUNCTION ensure_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION complete_profile_onboarding(TEXT, TEXT, TEXT[], BOOLEAN, UUID) TO authenticated;

-- ─── Research applications ─────────────────────────────────────────────────

ALTER TABLE lab_applications
  ADD CONSTRAINT lab_applications_motivation_length
  CHECK (char_length(trim(motivation)) BETWEEN 30 AND 3000) NOT VALID;

CREATE OR REPLACE FUNCTION validate_lab_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project research_projects%ROWTYPE;
BEGIN
  SELECT * INTO project FROM research_projects WHERE id = NEW.project_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Research project was not found';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.applicant_id <> auth.uid() THEN
      RAISE EXCEPTION 'Applications must belong to the signed-in member';
    END IF;
    IF project.status <> 'open' THEN
      RAISE EXCEPTION 'This project is not accepting applications';
    END IF;
    IF project.application_deadline IS NOT NULL AND project.application_deadline <= now() THEN
      RAISE EXCEPTION 'The application deadline has passed';
    END IF;
    IF char_length(trim(NEW.motivation)) NOT BETWEEN 30 AND 3000 THEN
      RAISE EXCEPTION 'Motivation must be between 30 and 3000 characters';
    END IF;
    NEW.motivation := trim(NEW.motivation);
    RETURN NEW;
  END IF;

  IF NEW.project_id IS DISTINCT FROM OLD.project_id
     OR NEW.applicant_id IS DISTINCT FROM OLD.applicant_id
     OR NEW.motivation IS DISTINCT FROM OLD.motivation
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
    RAISE EXCEPTION 'Application ownership and submission details cannot be changed';
  END IF;

  IF NOT is_admin() AND project.lead_researcher_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the project lead may review this application';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status NOT IN ('pending', 'under_review')
       OR NEW.status NOT IN ('under_review', 'accepted', 'rejected') THEN
      RAISE EXCEPTION 'Invalid application status transition';
    END IF;
    NEW.reviewer_id := auth.uid();
    NEW.reviewed_at := now();
  ELSIF NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id
     OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at THEN
    RAISE EXCEPTION 'Review metadata is managed by the server';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lab_applications_validate ON lab_applications;
CREATE TRIGGER lab_applications_validate
  BEFORE INSERT OR UPDATE ON lab_applications
  FOR EACH ROW EXECUTE FUNCTION validate_lab_application();

DROP POLICY IF EXISTS "Members apply to projects" ON lab_applications;
CREATE POLICY "Members apply to open projects" ON lab_applications FOR INSERT TO authenticated
  WITH CHECK (applicant_id = auth.uid());

DROP POLICY IF EXISTS "Leads review applications" ON lab_applications;
CREATE POLICY "Leads review applications" ON lab_applications FOR UPDATE TO authenticated
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_id AND rp.lead_researcher_id = auth.uid()
    )
  )
  WITH CHECK (
    is_admin() OR EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_id AND rp.lead_researcher_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS research_projects_open_deadline
  ON research_projects (status, application_deadline);
CREATE INDEX IF NOT EXISTS lab_applications_project_submitted
  ON lab_applications (project_id, submitted_at DESC);

-- ─── Event and competition registration ────────────────────────────────────

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS registration_opens_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registration_closes_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registration_capacity INT;

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_valid_times;
ALTER TABLE events ADD CONSTRAINT events_valid_times
  CHECK (ends_at IS NULL OR ends_at >= starts_at) NOT VALID;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_valid_registration_window;
ALTER TABLE events ADD CONSTRAINT events_valid_registration_window
  CHECK (
    registration_opens_at IS NULL
    OR registration_closes_at IS NULL
    OR registration_opens_at <= registration_closes_at
  ) NOT VALID;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_valid_registration_capacity;
ALTER TABLE events ADD CONSTRAINT events_valid_registration_capacity
  CHECK (registration_capacity IS NULL OR registration_capacity > 0) NOT VALID;

CREATE OR REPLACE FUNCTION validate_event_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_event events%ROWTYPE;
  registration_count INT;
BEGIN
  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Registrations must belong to the signed-in member';
  END IF;

  SELECT * INTO target_event FROM events WHERE id = NEW.event_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event was not found';
  END IF;
  IF target_event.status <> 'upcoming' OR target_event.starts_at <= now() THEN
    RAISE EXCEPTION 'Registration is closed for this event';
  END IF;
  IF target_event.registration_opens_at IS NOT NULL AND target_event.registration_opens_at > now() THEN
    RAISE EXCEPTION 'Registration has not opened yet';
  END IF;
  IF target_event.registration_closes_at IS NOT NULL AND target_event.registration_closes_at <= now() THEN
    RAISE EXCEPTION 'Registration is closed for this event';
  END IF;
  IF target_event.registration_capacity IS NOT NULL THEN
    SELECT COUNT(*)::INT INTO registration_count
    FROM event_registrations
    WHERE event_id = NEW.event_id;
    IF registration_count >= target_event.registration_capacity THEN
      RAISE EXCEPTION 'This event is at capacity';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS event_registrations_validate ON event_registrations;
CREATE TRIGGER event_registrations_validate
  BEFORE INSERT ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION validate_event_registration();

DROP POLICY IF EXISTS "Users manage own event registrations" ON event_registrations;
CREATE POLICY "Users manage own event registrations" ON event_registrations FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS events_status_starts_at ON events (status, starts_at);
CREATE INDEX IF NOT EXISTS event_registrations_event ON event_registrations (event_id);

-- ─── Published member content ──────────────────────────────────────────────

ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

DROP POLICY IF EXISTS "News viewable by authenticated" ON news_articles;
CREATE POLICY "Published news viewable" ON news_articles FOR SELECT TO authenticated
  USING (is_published OR is_admin());

DROP POLICY IF EXISTS "Opportunities viewable" ON opportunities;
CREATE POLICY "Active opportunities viewable" ON opportunities FOR SELECT TO authenticated
  USING (is_active OR is_admin());

CREATE INDEX IF NOT EXISTS news_articles_published_at
  ON news_articles (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS opportunities_active_deadline
  ON opportunities (is_active, deadline);

-- ─── Contact submission anti-abuse ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION submit_contact_submission(
  p_name TEXT,
  p_email TEXT,
  p_subject TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_id UUID;
  clean_name TEXT := trim(p_name);
  clean_email TEXT := lower(trim(p_email));
  clean_subject TEXT := trim(p_subject);
  clean_message TEXT := trim(p_message);
  attempt_count INT;
BEGIN
  IF char_length(clean_name) NOT BETWEEN 1 AND 120
     OR char_length(clean_email) NOT BETWEEN 3 AND 254
     OR clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     OR char_length(clean_subject) NOT BETWEEN 1 AND 200
     OR char_length(clean_message) NOT BETWEEN 10 AND 5000 THEN
    RAISE EXCEPTION 'Invalid contact submission';
  END IF;

  SELECT COUNT(*)::INT INTO attempt_count
  FROM rate_limit_events
  WHERE action = 'contact_submit'
    AND identifier = clean_email
    AND created_at > now() - interval '1 hour';
  IF attempt_count >= 3 THEN
    RAISE EXCEPTION 'Too many submissions. Try again in about an hour.';
  END IF;

  INSERT INTO contact_submissions (name, email, subject, message)
  VALUES (clean_name, clean_email, clean_subject, clean_message)
  RETURNING id INTO submission_id;

  INSERT INTO rate_limit_events (action, identifier)
  VALUES ('contact_submit', clean_email);
  RETURN submission_id;
END;
$$;

DROP POLICY IF EXISTS "Public submit contact" ON contact_submissions;
GRANT EXECUTE ON FUNCTION submit_contact_submission(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- ============================================================
-- 010_directory_privacy.sql
-- ============================================================
-- Keep account email and onboarding state out of the member directory.
-- Member-facing reads use the fixed-column view below; direct profile reads are
-- limited to the account owner or an administrator.

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins view profiles" ON profiles;
CREATE POLICY "Admins view profiles"
  ON profiles FOR SELECT TO authenticated
  USING (is_admin());

CREATE OR REPLACE VIEW member_directory
WITH (security_invoker = false)
AS
SELECT
  id,
  display_name,
  role,
  bio,
  avatar_url,
  interests,
  open_to_collaborate,
  chapter_id,
  created_at,
  updated_at
FROM profiles
WHERE onboarding_completed_at IS NOT NULL
  AND NULLIF(trim(display_name), '') IS NOT NULL;

REVOKE ALL ON TABLE member_directory FROM anon;
GRANT SELECT ON TABLE member_directory TO authenticated;

-- ============================================================
-- 011_profile_write_boundary.sql
-- ============================================================
-- Profile write boundary: members may update only validated member-facing fields
-- through server functions. Role, email, and onboarding lifecycle state remain
-- outside the browser's direct write surface.

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE OR REPLACE FUNCTION update_my_profile(
  p_display_name TEXT,
  p_bio TEXT DEFAULT NULL,
  p_interests TEXT[] DEFAULT '{}',
  p_open_to_collaborate BOOLEAN DEFAULT FALSE,
  p_chapter_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_name TEXT := trim(p_display_name);
  clean_bio TEXT := NULLIF(trim(COALESCE(p_bio, '')), '');
  clean_interests TEXT[] := ARRAY(
    SELECT DISTINCT trim(interest)
    FROM unnest(COALESCE(p_interests, '{}')) AS interest
    WHERE trim(interest) <> ''
  );
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF char_length(clean_name) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Display name must be between 1 and 120 characters';
  END IF;
  IF clean_name ~ '[[:cntrl:]]' THEN
    RAISE EXCEPTION 'Display name contains invalid characters';
  END IF;
  IF clean_bio IS NOT NULL AND char_length(clean_bio) > 1000 THEN
    RAISE EXCEPTION 'Bio must be 1000 characters or fewer';
  END IF;
  IF cardinality(clean_interests) > 12
     OR EXISTS (
       SELECT 1
       FROM unnest(clean_interests) AS interest
       WHERE char_length(interest) > 40 OR interest ~ '[[:cntrl:]]'
     ) THEN
    RAISE EXCEPTION 'Choose up to 12 interests of 40 characters or fewer';
  END IF;
  IF p_chapter_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM chapters WHERE id = p_chapter_id) THEN
    RAISE EXCEPTION 'Selected chapter was not found';
  END IF;

  UPDATE profiles
  SET display_name = clean_name,
      bio = clean_bio,
      interests = clean_interests,
      open_to_collaborate = COALESCE(p_open_to_collaborate, false),
      chapter_id = p_chapter_id
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile was not found';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION set_my_avatar(
  p_object_name TEXT,
  p_avatar_url TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_object_name TEXT := trim(p_object_name);
  clean_avatar_url TEXT := trim(p_avatar_url);
  expected_path_pattern TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- The client always writes one canonical avatar filename in the caller's
  -- storage folder. The matching storage row proves the reference is real.
  IF clean_object_name !~ ('^' || auth.uid()::text || E'/avatar\\.(jpg|png|webp|gif)$') THEN
    RAISE EXCEPTION 'Avatar path is invalid';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'avatars' AND name = clean_object_name
  ) THEN
    RAISE EXCEPTION 'Uploaded avatar was not found';
  END IF;

  expected_path_pattern :=
    E'^https://[a-z0-9-]+\\.supabase\\.co/storage/v1/object/public/avatars/' ||
    replace(clean_object_name, '.', E'\\.') ||
    E'(\\?t=[0-9]{13})?$';
  IF clean_avatar_url !~ expected_path_pattern THEN
    RAISE EXCEPTION 'Avatar URL is invalid';
  END IF;

  UPDATE profiles
  SET avatar_url = clean_avatar_url
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile was not found';
  END IF;
  RETURN clean_avatar_url;
END;
$$;

REVOKE ALL ON FUNCTION ensure_my_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION complete_profile_onboarding(TEXT, TEXT, TEXT[], BOOLEAN, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_my_profile(TEXT, TEXT, TEXT[], BOOLEAN, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION set_my_avatar(TEXT, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION ensure_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION complete_profile_onboarding(TEXT, TEXT, TEXT[], BOOLEAN, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_my_profile(TEXT, TEXT, TEXT[], BOOLEAN, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION set_my_avatar(TEXT, TEXT) TO authenticated;

-- ============================================================
-- 012_operational_integrity.sql
-- ============================================================
-- Operational integrity, first-party telemetry, and member-content write boundaries.

-- ─── Idempotent weekly digests ───────────────────────────────────────────────

ALTER TABLE digest_send_log
  ADD COLUMN IF NOT EXISTS period_start DATE;

UPDATE digest_send_log
SET period_start = date_trunc('week', timezone('UTC', sent_at))::date
WHERE period_start IS NULL;

WITH ranked AS (
  SELECT id,
    row_number() OVER (
      PARTITION BY user_id, period_start
      ORDER BY CASE status WHEN 'sent' THEN 0 WHEN 'failed' THEN 1 ELSE 2 END, sent_at DESC
    ) AS row_number
  FROM digest_send_log
)
DELETE FROM digest_send_log
WHERE id IN (SELECT id FROM ranked WHERE row_number > 1);

ALTER TABLE digest_send_log
  ALTER COLUMN period_start SET DEFAULT date_trunc('week', timezone('UTC', now()))::date,
  ALTER COLUMN period_start SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS digest_send_log_user_period
  ON digest_send_log (user_id, period_start);

-- ─── Privacy-conscious, first-party product telemetry ───────────────────────

CREATE TABLE IF NOT EXISTS product_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_analytics_events_name_time
  ON product_analytics_events (event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS product_analytics_events_user_time
  ON product_analytics_events (user_id, occurred_at DESC);

ALTER TABLE product_analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin view product analytics" ON product_analytics_events;
CREATE POLICY "Admin view product analytics"
  ON product_analytics_events FOR SELECT TO authenticated
  USING ((SELECT is_admin()));

CREATE OR REPLACE FUNCTION track_product_event(
  p_event_name TEXT,
  p_properties JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_event_name NOT IN (
    'auth.onboarding_completed',
    'auth.sign_in',
    'auth.sign_out',
    'auth.sign_up',
    'contact.submit',
    'content.saved',
    'education.lesson_complete',
    'event.registered',
    'research.application_submitted'
  ) THEN
    RAISE EXCEPTION 'Unsupported analytics event';
  END IF;

  IF p_properties IS NULL OR jsonb_typeof(p_properties) <> 'object'
    OR octet_length(p_properties::text) > 2048 THEN
    RAISE EXCEPTION 'Invalid analytics properties';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_each(p_properties)
    WHERE key !~ '^[a-z][a-z0-9_]{0,39}$'
      OR jsonb_typeof(value) NOT IN ('string', 'number', 'boolean', 'null')
  ) THEN
    RAISE EXCEPTION 'Analytics properties must use short keys and scalar values';
  END IF;

  IF (
    SELECT count(*)
    FROM product_analytics_events
    WHERE user_id = (SELECT auth.uid())
      AND occurred_at >= now() - interval '1 day'
  ) >= 200 THEN
    RAISE EXCEPTION 'Analytics rate limit exceeded';
  END IF;

  INSERT INTO product_analytics_events (user_id, event_name, properties)
  VALUES ((SELECT auth.uid()), p_event_name, p_properties)
  RETURNING id INTO event_id;

  RETURN event_id;
END;
$$;

REVOKE ALL ON TABLE product_analytics_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE product_analytics_events TO authenticated;
REVOKE ALL ON FUNCTION track_product_event(TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION track_product_event(TEXT, JSONB) TO authenticated;

-- ─── Authenticated client error reporting ───────────────────────────────────

CREATE TABLE IF NOT EXISTS client_error_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  error_name TEXT NOT NULL,
  message TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_error_events_time
  ON client_error_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS client_error_events_user_time
  ON client_error_events (user_id, occurred_at DESC);

ALTER TABLE client_error_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin view client errors" ON client_error_events;
CREATE POLICY "Admin view client errors"
  ON client_error_events FOR SELECT TO authenticated
  USING ((SELECT is_admin()));

CREATE OR REPLACE FUNCTION report_client_error(
  p_error_name TEXT,
  p_message TEXT,
  p_tags JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  error_id UUID;
  clean_name TEXT := btrim(COALESCE(p_error_name, ''));
  clean_message TEXT := btrim(COALESCE(p_message, ''));
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF char_length(clean_name) NOT BETWEEN 1 AND 80
    OR char_length(clean_message) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'Invalid error report';
  END IF;

  IF p_tags IS NULL OR jsonb_typeof(p_tags) <> 'object'
    OR octet_length(p_tags::text) > 1024 THEN
    RAISE EXCEPTION 'Invalid error tags';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_each(p_tags)
    WHERE key !~ '^[a-z][a-z0-9_]{0,39}$'
      OR jsonb_typeof(value) NOT IN ('string', 'number', 'boolean', 'null')
  ) THEN
    RAISE EXCEPTION 'Error tags must use short keys and scalar values';
  END IF;

  IF (
    SELECT count(*)
    FROM client_error_events
    WHERE user_id = (SELECT auth.uid())
      AND occurred_at >= now() - interval '1 hour'
  ) >= 20 THEN
    RAISE EXCEPTION 'Error report rate limit exceeded';
  END IF;

  INSERT INTO client_error_events (user_id, error_name, message, tags)
  VALUES ((SELECT auth.uid()), clean_name, clean_message, p_tags)
  RETURNING id INTO error_id;

  RETURN error_id;
END;
$$;

REVOKE ALL ON TABLE client_error_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE client_error_events TO authenticated;
REVOKE ALL ON FUNCTION report_client_error(TEXT, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION report_client_error(TEXT, TEXT, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION purge_operational_events()
RETURNS TABLE (
  deleted_product_events INTEGER,
  deleted_client_errors INTEGER,
  deleted_rate_limit_events INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM product_analytics_events
  WHERE occurred_at < now() - interval '180 days';
  GET DIAGNOSTICS deleted_product_events = ROW_COUNT;

  DELETE FROM client_error_events
  WHERE occurred_at < now() - interval '30 days';
  GET DIAGNOSTICS deleted_client_errors = ROW_COUNT;

  DELETE FROM rate_limit_events
  WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS deleted_rate_limit_events = ROW_COUNT;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION purge_operational_events() FROM PUBLIC, anon, authenticated;

-- ─── Member-content write boundaries ────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (SELECT auth.uid()) IS NULL OR NEW.from_user_id <> (SELECT auth.uid()) THEN
      RAISE EXCEPTION 'Connections must be sent as the authenticated member';
    END IF;
    NEW.status := 'pending';
    NEW.message := NULLIF(btrim(NEW.message), '');
    IF char_length(COALESCE(NEW.message, '')) > 500 THEN
      RAISE EXCEPTION 'Connection message must be 500 characters or fewer';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.from_user_id IS DISTINCT FROM OLD.from_user_id
    OR NEW.to_user_id IS DISTINCT FROM OLD.to_user_id
    OR NEW.message IS DISTINCT FROM OLD.message
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Connection identity and message cannot be changed';
  END IF;

  IF OLD.to_user_id <> (SELECT auth.uid())
    OR OLD.status <> 'pending'
    OR NEW.status NOT IN ('accepted', 'declined') THEN
    RAISE EXCEPTION 'Only the recipient can accept or decline a pending connection';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_connection_request_write ON connection_requests;
CREATE TRIGGER validate_connection_request_write
  BEFORE INSERT OR UPDATE ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION validate_connection_request();

DROP POLICY IF EXISTS "Recipients respond to connections" ON connection_requests;
CREATE POLICY "Recipients respond to connections"
  ON connection_requests FOR UPDATE TO authenticated
  USING (to_user_id = (SELECT auth.uid()) AND status = 'pending')
  WITH CHECK (to_user_id = (SELECT auth.uid()) AND status IN ('accepted', 'declined'));

CREATE OR REPLACE FUNCTION validate_studio_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NEW.author_id <> (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Submission author must match the authenticated member';
  END IF;
  IF TG_OP = 'UPDATE' AND (
    NEW.id IS DISTINCT FROM OLD.id
    OR NEW.author_id IS DISTINCT FROM OLD.author_id
    OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
  ) THEN
    RAISE EXCEPTION 'Submission identity cannot be changed';
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.writeup := btrim(NEW.writeup);
  NEW.repo_url := NULLIF(btrim(NEW.repo_url), '');
  NEW.demo_url := NULLIF(btrim(NEW.demo_url), '');

  IF char_length(NEW.title) NOT BETWEEN 1 AND 160
    OR char_length(NEW.writeup) NOT BETWEEN 20 AND 5000 THEN
    RAISE EXCEPTION 'Studio title or write-up is outside the allowed length';
  END IF;
  IF (NEW.repo_url IS NOT NULL AND (char_length(NEW.repo_url) > 2048 OR NEW.repo_url !~* '^https://'))
    OR (NEW.demo_url IS NOT NULL AND (char_length(NEW.demo_url) > 2048 OR NEW.demo_url !~* '^https://')) THEN
    RAISE EXCEPTION 'Studio links must be secure HTTPS URLs';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_studio_submission_write ON studio_submissions;
CREATE TRIGGER validate_studio_submission_write
  BEFORE INSERT OR UPDATE ON studio_submissions
  FOR EACH ROW EXECUTE FUNCTION validate_studio_submission();

DROP POLICY IF EXISTS "Users update own studio submissions" ON studio_submissions;
CREATE POLICY "Users update own studio submissions"
  ON studio_submissions FOR UPDATE TO authenticated
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION validate_essay_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  caller_is_admin BOOLEAN := (SELECT is_admin());
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.author_id <> (SELECT auth.uid()) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Essay author must match the authenticated member';
    END IF;
    IF NOT caller_is_admin THEN
      NEW.is_editorial_pick := false;
    END IF;
  ELSE
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.author_id IS DISTINCT FROM OLD.author_id
      OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'Essay identity cannot be changed';
    END IF;
    IF OLD.author_id <> (SELECT auth.uid()) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only the author or an administrator can update this essay';
    END IF;
    IF NEW.is_editorial_pick IS DISTINCT FROM OLD.is_editorial_pick AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only an administrator can select an editorial pick';
    END IF;
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.body := btrim(NEW.body);
  IF char_length(NEW.title) NOT BETWEEN 1 AND 160
    OR char_length(NEW.body) NOT BETWEEN 100 AND 10000 THEN
    RAISE EXCEPTION 'Essay title or body is outside the allowed length';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_essay_submission_write ON essay_submissions;
CREATE TRIGGER validate_essay_submission_write
  BEFORE INSERT OR UPDATE ON essay_submissions
  FOR EACH ROW EXECUTE FUNCTION validate_essay_submission();

DROP POLICY IF EXISTS "Admin update essays" ON essay_submissions;
DROP POLICY IF EXISTS "Authors update own essays" ON essay_submissions;
CREATE POLICY "Authors update own essays"
  ON essay_submissions FOR UPDATE TO authenticated
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));
CREATE POLICY "Admin update essays"
  ON essay_submissions FOR UPDATE TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

CREATE OR REPLACE FUNCTION validate_introduction_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NEW.author_id <> (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Introduction author must match the authenticated member';
  END IF;
  NEW.headline := btrim(NEW.headline);
  NEW.looking_for := btrim(NEW.looking_for);
  NEW.interests := ARRAY(
    SELECT DISTINCT btrim(value)
    FROM unnest(COALESCE(NEW.interests, '{}')) AS value
    WHERE btrim(value) <> ''
    ORDER BY btrim(value)
  );
  IF char_length(NEW.headline) NOT BETWEEN 1 AND 160
    OR char_length(NEW.looking_for) NOT BETWEEN 1 AND 1000
    OR cardinality(NEW.interests) > 12
    OR EXISTS (SELECT 1 FROM unnest(NEW.interests) AS value WHERE char_length(value) > 40) THEN
    RAISE EXCEPTION 'Introduction content is outside the allowed length';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_introduction_post_write ON introduction_posts;
CREATE TRIGGER validate_introduction_post_write
  BEFORE INSERT ON introduction_posts
  FOR EACH ROW EXECUTE FUNCTION validate_introduction_post();

DROP POLICY IF EXISTS "Users manage own upvotes" ON essay_upvotes;
CREATE POLICY "Users manage own upvotes"
  ON essay_upvotes FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users manage own opportunity interests" ON opportunity_interests;
CREATE POLICY "Users manage own opportunity interests"
  ON opportunity_interests FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Trigger functions are internal implementation details, not Data API methods.
REVOKE ALL ON FUNCTION validate_connection_request() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION validate_studio_submission() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION validate_essay_submission() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION validate_introduction_post() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION get_user_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION is_lead_or_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_lead_or_admin() TO authenticated;

-- ============================================================
-- 013_finance_debrief_editorial.sql
-- ============================================================
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

-- ============================================================
-- 014_portal_completeness.sql
-- ============================================================
-- Pass 3 Wave 2: submission moderation, certificates, chapter leadership, competitions

-- ─── Enums ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE submission_moderation_status AS ENUM ('pending', 'approved', 'rejected', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE chapter_leader_role AS ENUM ('lead', 'co_lead', 'coordinator');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE competition_status AS ENUM ('draft', 'open', 'closed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Studio / essay moderation columns ───────────────────────────────────────

ALTER TABLE studio_submissions
  ADD COLUMN IF NOT EXISTS status submission_moderation_status,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderation_note TEXT;

ALTER TABLE essay_submissions
  ADD COLUMN IF NOT EXISTS status submission_moderation_status,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderation_note TEXT;

-- Legacy rows (NULL status from ADD COLUMN) stay public; new inserts default to pending
UPDATE studio_submissions SET status = 'approved' WHERE status IS NULL;
UPDATE essay_submissions SET status = 'approved' WHERE status IS NULL;

ALTER TABLE studio_submissions
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;
ALTER TABLE essay_submissions
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;

CREATE INDEX IF NOT EXISTS studio_submissions_status_idx ON studio_submissions (status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS essay_submissions_status_idx ON essay_submissions (status, submitted_at DESC);

DROP POLICY IF EXISTS "Studios viewable" ON studio_submissions;
CREATE POLICY "Studios viewable"
  ON studio_submissions FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR author_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

DROP POLICY IF EXISTS "Admin update studio submissions" ON studio_submissions;
CREATE POLICY "Admin update studio submissions"
  ON studio_submissions FOR UPDATE TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

DROP POLICY IF EXISTS "Essays viewable" ON essay_submissions;
CREATE POLICY "Essays viewable"
  ON essay_submissions FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR author_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

CREATE OR REPLACE FUNCTION validate_studio_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  caller_is_admin BOOLEAN := (SELECT is_admin());
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.author_id <> (SELECT auth.uid()) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Studio author must match the authenticated member';
    END IF;
    IF NOT caller_is_admin THEN
      NEW.status := 'pending';
      NEW.moderated_at := NULL;
      NEW.moderated_by := NULL;
      NEW.moderation_note := NULL;
    END IF;
  ELSE
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.author_id IS DISTINCT FROM OLD.author_id
      OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'Studio identity cannot be changed';
    END IF;
    IF OLD.author_id <> (SELECT auth.uid()) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only the author or an administrator can update this studio submission';
    END IF;
    IF (
      NEW.status IS DISTINCT FROM OLD.status
      OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
      OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
      OR NEW.moderation_note IS DISTINCT FROM OLD.moderation_note
    ) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only an administrator can moderate studio submissions';
    END IF;
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.writeup := btrim(NEW.writeup);
  IF char_length(NEW.title) NOT BETWEEN 1 AND 160
    OR char_length(NEW.writeup) NOT BETWEEN 20 AND 5000 THEN
    RAISE EXCEPTION 'Studio title or write-up is outside the allowed length';
  END IF;
  IF (NEW.repo_url IS NOT NULL AND (char_length(NEW.repo_url) > 2048 OR NEW.repo_url !~* '^https://'))
    OR (NEW.demo_url IS NOT NULL AND (char_length(NEW.demo_url) > 2048 OR NEW.demo_url !~* '^https://')) THEN
    RAISE EXCEPTION 'Studio links must be secure HTTPS URLs';
  END IF;
  IF NEW.moderation_note IS NOT NULL THEN
    NEW.moderation_note := btrim(NEW.moderation_note);
    IF char_length(NEW.moderation_note) > 1000 THEN
      RAISE EXCEPTION 'Moderation note is too long';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_essay_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  caller_is_admin BOOLEAN := (SELECT is_admin());
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.author_id <> (SELECT auth.uid()) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Essay author must match the authenticated member';
    END IF;
    IF NOT caller_is_admin THEN
      NEW.is_editorial_pick := false;
      NEW.status := 'pending';
      NEW.moderated_at := NULL;
      NEW.moderated_by := NULL;
      NEW.moderation_note := NULL;
    END IF;
  ELSE
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.author_id IS DISTINCT FROM OLD.author_id
      OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'Essay identity cannot be changed';
    END IF;
    IF OLD.author_id <> (SELECT auth.uid()) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only the author or an administrator can update this essay';
    END IF;
    IF NEW.is_editorial_pick IS DISTINCT FROM OLD.is_editorial_pick AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only an administrator can select an editorial pick';
    END IF;
    IF (
      NEW.status IS DISTINCT FROM OLD.status
      OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
      OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
      OR NEW.moderation_note IS DISTINCT FROM OLD.moderation_note
    ) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only an administrator can moderate essays';
    END IF;
    IF NEW.status IS DISTINCT FROM 'approved' THEN
      NEW.is_editorial_pick := false;
    END IF;
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.body := btrim(NEW.body);
  IF char_length(NEW.title) NOT BETWEEN 1 AND 160
    OR char_length(NEW.body) NOT BETWEEN 100 AND 10000 THEN
    RAISE EXCEPTION 'Essay title or body is outside the allowed length';
  END IF;
  IF NEW.moderation_note IS NOT NULL THEN
    NEW.moderation_note := btrim(NEW.moderation_note);
    IF char_length(NEW.moderation_note) > 1000 THEN
      RAISE EXCEPTION 'Moderation note is too long';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION moderate_studio_submission(
  p_id UUID,
  p_status submission_moderation_status,
  p_note TEXT DEFAULT NULL
)
RETURNS studio_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result studio_submissions;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  UPDATE studio_submissions
  SET
    status = p_status,
    moderated_at = now(),
    moderated_by = (SELECT auth.uid()),
    moderation_note = NULLIF(btrim(COALESCE(p_note, '')), '')
  WHERE id = p_id
  RETURNING * INTO result;
  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Studio submission not found';
  END IF;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION moderate_essay_submission(
  p_id UUID,
  p_status submission_moderation_status,
  p_note TEXT DEFAULT NULL,
  p_editorial_pick BOOLEAN DEFAULT NULL
)
RETURNS essay_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result essay_submissions;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  UPDATE essay_submissions
  SET
    status = p_status,
    moderated_at = now(),
    moderated_by = (SELECT auth.uid()),
    moderation_note = NULLIF(btrim(COALESCE(p_note, '')), ''),
    is_editorial_pick = CASE
      WHEN p_status <> 'approved' THEN false
      WHEN p_editorial_pick IS NULL THEN is_editorial_pick
      ELSE p_editorial_pick
    END
  WHERE id = p_id
  RETURNING * INTO result;
  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Essay submission not found';
  END IF;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION moderate_studio_submission(UUID, submission_moderation_status, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION moderate_essay_submission(UUID, submission_moderation_status, TEXT, BOOLEAN) TO authenticated;

CREATE OR REPLACE VIEW essay_submissions_with_counts AS
SELECT
  e.*,
  COALESCE(u.upvote_count, 0)::INTEGER AS upvote_count
FROM essay_submissions e
LEFT JOIN (
  SELECT essay_id, COUNT(*)::INTEGER AS upvote_count
  FROM essay_upvotes
  GROUP BY essay_id
) u ON u.essay_id = e.id;

GRANT SELECT ON essay_submissions_with_counts TO authenticated;

-- ─── Certificates ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS member_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_key TEXT NOT NULL,
  title TEXT NOT NULL,
  verification_code TEXT NOT NULL UNIQUE,
  lesson_ids TEXT[] NOT NULL DEFAULT '{}',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, curriculum_key),
  CONSTRAINT member_certificates_curriculum_key_len CHECK (char_length(curriculum_key) BETWEEN 1 AND 80),
  CONSTRAINT member_certificates_title_len CHECK (char_length(title) BETWEEN 1 AND 200)
);

CREATE INDEX IF NOT EXISTS member_certificates_user_idx ON member_certificates (user_id, issued_at DESC);

ALTER TABLE member_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own certificates" ON member_certificates;
CREATE POLICY "Users read own certificates"
  ON member_certificates FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT is_admin()));

CREATE OR REPLACE FUNCTION issue_my_curriculum_certificate(
  p_curriculum_key TEXT,
  p_title TEXT,
  p_lesson_ids TEXT[]
)
RETURNS member_certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := (SELECT auth.uid());
  completed_count INTEGER;
  required_count INTEGER;
  result member_certificates;
  code TEXT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_lesson_ids IS NULL OR cardinality(p_lesson_ids) < 1 THEN
    RAISE EXCEPTION 'At least one lesson is required';
  END IF;

  required_count := cardinality(p_lesson_ids);
  SELECT COUNT(DISTINCT lesson_id)::INTEGER INTO completed_count
  FROM education_lesson_progress
  WHERE user_id = uid
    AND lesson_id = ANY (p_lesson_ids);

  IF completed_count < required_count THEN
    RAISE EXCEPTION 'Complete all required lessons before requesting a certificate';
  END IF;

  code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

  INSERT INTO member_certificates (user_id, curriculum_key, title, verification_code, lesson_ids)
  VALUES (
    uid,
    btrim(p_curriculum_key),
    btrim(p_title),
    code,
    (
      SELECT ARRAY(
        SELECT DISTINCT btrim(value)
        FROM unnest(p_lesson_ids) AS value
        WHERE btrim(value) <> ''
        ORDER BY btrim(value)
      )
    )
  )
  ON CONFLICT (user_id, curriculum_key) DO UPDATE
    SET title = EXCLUDED.title,
        lesson_ids = EXCLUDED.lesson_ids
  RETURNING * INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION issue_my_curriculum_certificate(TEXT, TEXT, TEXT[]) TO authenticated;

-- ─── Chapter leadership ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chapter_leaders (
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role chapter_leader_role NOT NULL DEFAULT 'lead',
  appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  appointed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (chapter_id, user_id)
);

CREATE INDEX IF NOT EXISTS chapter_leaders_user_idx ON chapter_leaders (user_id);

ALTER TABLE chapter_leaders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chapter leaders readable" ON chapter_leaders;
CREATE POLICY "Chapter leaders readable"
  ON chapter_leaders FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin manage chapter leaders" ON chapter_leaders;
CREATE POLICY "Admin manage chapter leaders"
  ON chapter_leaders FOR ALL TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

CREATE OR REPLACE FUNCTION appoint_chapter_leader(
  p_chapter_id UUID,
  p_user_id UUID,
  p_role chapter_leader_role DEFAULT 'lead'
)
RETURNS chapter_leaders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result chapter_leaders;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  INSERT INTO chapter_leaders (chapter_id, user_id, role, appointed_by)
  VALUES (p_chapter_id, p_user_id, p_role, (SELECT auth.uid()))
  ON CONFLICT (chapter_id, user_id) DO UPDATE
    SET role = EXCLUDED.role,
        appointed_by = EXCLUDED.appointed_by,
        appointed_at = now()
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION remove_chapter_leader(
  p_chapter_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  DELETE FROM chapter_leaders
  WHERE chapter_id = p_chapter_id AND user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION appoint_chapter_leader(UUID, UUID, chapter_leader_role) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_chapter_leader(UUID, UUID) TO authenticated;

-- ─── Competitions ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status competition_status NOT NULL DEFAULT 'draft',
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  registration_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT competitions_title_len CHECK (char_length(btrim(title)) BETWEEN 1 AND 160),
  CONSTRAINT competitions_description_len CHECK (char_length(btrim(description)) BETWEEN 20 AND 5000)
);

CREATE INDEX IF NOT EXISTS competitions_status_idx ON competitions (status, starts_at DESC NULLS LAST);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Open competitions readable" ON competitions;
CREATE POLICY "Open competitions readable"
  ON competitions FOR SELECT TO authenticated
  USING (status IN ('open', 'closed') OR (SELECT is_admin()));

DROP POLICY IF EXISTS "Admin manage competitions" ON competitions;
CREATE POLICY "Admin manage competitions"
  ON competitions FOR ALL TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- ============================================================
-- 015_content_reports_chapter_tools.sql
-- ============================================================
-- Finisher: content reports (youth-safety/spam) + chapter-leader helper view

DO $$ BEGIN
  CREATE TYPE content_report_target AS ENUM (
    'studio',
    'essay',
    'introduction',
    'news',
    'profile',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_report_status AS ENUM (
    'open',
    'reviewing',
    'resolved',
    'dismissed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type content_report_target NOT NULL,
  target_id UUID,
  reason TEXT NOT NULL,
  details TEXT,
  status content_report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolution_note TEXT,
  CONSTRAINT content_reports_reason_len CHECK (char_length(btrim(reason)) BETWEEN 3 AND 120),
  CONSTRAINT content_reports_details_len CHECK (details IS NULL OR char_length(details) <= 2000)
);

CREATE INDEX IF NOT EXISTS content_reports_status_created
  ON content_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS content_reports_reporter
  ON content_reports (reporter_id, created_at DESC);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Inserts only via submit_content_report (rate-limited SECURITY DEFINER)
DROP POLICY IF EXISTS "Users insert own content reports" ON content_reports;

DROP POLICY IF EXISTS "Users read own content reports" ON content_reports;
CREATE POLICY "Users read own content reports"
  ON content_reports FOR SELECT TO authenticated
  USING (reporter_id = (SELECT auth.uid()) OR (SELECT is_admin()));

DROP POLICY IF EXISTS "Admin update content reports" ON content_reports;
CREATE POLICY "Admin update content reports"
  ON content_reports FOR UPDATE TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

CREATE OR REPLACE FUNCTION submit_content_report(
  p_target_type content_report_target,
  p_reason TEXT,
  p_target_id UUID DEFAULT NULL,
  p_details TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := (SELECT auth.uid());
  new_id UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT check_rate_limit('content_report', uid::text, 10, 3600) THEN
    RAISE EXCEPTION 'Too many reports. Please try again later.';
  END IF;
  PERFORM record_rate_limit('content_report', uid::text);

  INSERT INTO content_reports (reporter_id, target_type, target_id, reason, details)
  VALUES (
    uid,
    p_target_type,
    p_target_id,
    btrim(p_reason),
    NULLIF(btrim(COALESCE(p_details, '')), '')
  )
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION resolve_content_report(
  p_id UUID,
  p_status content_report_status,
  p_note TEXT DEFAULT NULL
)
RETURNS content_reports
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result content_reports;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  IF p_status NOT IN ('reviewing', 'resolved', 'dismissed') THEN
    RAISE EXCEPTION 'Invalid resolution status';
  END IF;
  UPDATE content_reports
  SET
    status = p_status,
    resolved_at = CASE WHEN p_status IN ('resolved', 'dismissed') THEN now() ELSE resolved_at END,
    resolved_by = (SELECT auth.uid()),
    resolution_note = NULLIF(btrim(COALESCE(p_note, '')), '')
  WHERE id = p_id
  RETURNING * INTO result;
  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Report not found';
  END IF;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_content_report(content_report_target, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_content_report(UUID, content_report_status, TEXT) TO authenticated;

-- Chapter leaders can read a compact activity snapshot for their chapters
CREATE OR REPLACE FUNCTION my_chapter_leader_snapshot()
RETURNS TABLE (
  chapter_id UUID,
  chapter_name TEXT,
  city TEXT,
  country TEXT,
  member_count INTEGER,
  leader_role chapter_leader_role,
  upcoming_events INTEGER,
  open_competitions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  uid UUID := (SELECT auth.uid());
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.city,
    c.country,
    c.member_count,
    cl.role,
    (
      SELECT COUNT(*)::INTEGER
      FROM events e
      WHERE e.chapter_id = c.id
        AND e.status IN ('upcoming', 'live')
        AND e.starts_at >= now() - INTERVAL '1 day'
    ),
    (
      SELECT COUNT(*)::INTEGER
      FROM competitions comp
      WHERE comp.chapter_id = c.id
        AND comp.status = 'open'
    )
  FROM chapter_leaders cl
  JOIN chapters c ON c.id = cl.chapter_id
  WHERE cl.user_id = uid;
END;
$$;

GRANT EXECUTE ON FUNCTION my_chapter_leader_snapshot() TO authenticated;

-- ============================================================
-- 016_content_reports_rpc_only.sql
-- ============================================================
-- Harden content_reports: remove direct INSERT so rate limits cannot be bypassed
DROP POLICY IF EXISTS "Users insert own content reports" ON content_reports;

-- ============================================================
-- 017_lab_notification_deep_link.sql
-- ============================================================
-- Deep-link lab application status notifications to the project detail page
CREATE OR REPLACE FUNCTION notify_lab_application_status()
RETURNS TRIGGER AS $$
DECLARE
  project_title TEXT;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('accepted', 'rejected', 'under_review') THEN
    SELECT title INTO project_title FROM research_projects WHERE id = NEW.project_id;
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      NEW.applicant_id,
      'lab_application_status',
      'Application update',
      'Your application to "' || COALESCE(project_title, 'a project') || '" is now ' ||
        replace(NEW.status::text, '_', ' ') || '.',
      '/portal/labs/' || NEW.project_id::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- ============================================================
-- 018_security_definer_search_path.sql
-- ============================================================
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

-- ============================================================
-- 019_ownership_force_assign.sql
-- ============================================================
-- Force ownership columns from auth.uid() so clients cannot spoof another member.
-- Also add common query indexes and deep-link lab application received notifications.

-- ─── Shared owner assignment helpers ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION force_user_id_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  NEW.user_id := (SELECT auth.uid());
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION force_user_id_owner() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS force_news_bookmark_owner ON news_bookmarks;
CREATE TRIGGER force_news_bookmark_owner
  BEFORE INSERT ON news_bookmarks
  FOR EACH ROW EXECUTE FUNCTION force_user_id_owner();

DROP TRIGGER IF EXISTS force_project_bookmark_owner ON project_bookmarks;
CREATE TRIGGER force_project_bookmark_owner
  BEFORE INSERT ON project_bookmarks
  FOR EACH ROW EXECUTE FUNCTION force_user_id_owner();

DROP TRIGGER IF EXISTS force_opportunity_interest_owner ON opportunity_interests;
CREATE TRIGGER force_opportunity_interest_owner
  BEFORE INSERT ON opportunity_interests
  FOR EACH ROW EXECUTE FUNCTION force_user_id_owner();

DROP TRIGGER IF EXISTS force_essay_upvote_owner ON essay_upvotes;
CREATE TRIGGER force_essay_upvote_owner
  BEFORE INSERT ON essay_upvotes
  FOR EACH ROW EXECUTE FUNCTION force_user_id_owner();

DROP TRIGGER IF EXISTS force_education_progress_owner ON education_lesson_progress;
CREATE TRIGGER force_education_progress_owner
  BEFORE INSERT ON education_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION force_user_id_owner();

-- ─── Strengthen existing validators to assign, not only check ────────────────

CREATE OR REPLACE FUNCTION validate_lab_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  project research_projects%ROWTYPE;
BEGIN
  SELECT * INTO project FROM research_projects WHERE id = NEW.project_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Research project was not found';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF (SELECT auth.uid()) IS NULL THEN
      RAISE EXCEPTION 'Authentication required';
    END IF;
    NEW.applicant_id := (SELECT auth.uid());
    IF project.status <> 'open' THEN
      RAISE EXCEPTION 'This project is not accepting applications';
    END IF;
    IF project.application_deadline IS NOT NULL AND project.application_deadline <= now() THEN
      RAISE EXCEPTION 'The application deadline has passed';
    END IF;
    IF char_length(trim(NEW.motivation)) NOT BETWEEN 30 AND 3000 THEN
      RAISE EXCEPTION 'Motivation must be between 30 and 3000 characters';
    END IF;
    NEW.motivation := trim(NEW.motivation);
    RETURN NEW;
  END IF;

  IF NEW.project_id IS DISTINCT FROM OLD.project_id
     OR NEW.applicant_id IS DISTINCT FROM OLD.applicant_id
     OR NEW.motivation IS DISTINCT FROM OLD.motivation
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
    RAISE EXCEPTION 'Application ownership and submission details cannot be changed';
  END IF;

  IF NOT is_admin() AND project.lead_researcher_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the project lead may review this application';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status NOT IN ('pending', 'under_review')
       OR NEW.status NOT IN ('under_review', 'accepted', 'rejected') THEN
      RAISE EXCEPTION 'Invalid application status transition';
    END IF;
    NEW.reviewer_id := auth.uid();
    NEW.reviewed_at := now();
  ELSIF NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id
     OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at THEN
    RAISE EXCEPTION 'Review metadata is managed by the server';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_event_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  target_event events%ROWTYPE;
  registration_count INT;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  NEW.user_id := (SELECT auth.uid());

  SELECT * INTO target_event FROM events WHERE id = NEW.event_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event was not found';
  END IF;
  IF target_event.status <> 'upcoming' OR target_event.starts_at <= now() THEN
    RAISE EXCEPTION 'Registration is closed for this event';
  END IF;
  IF target_event.registration_opens_at IS NOT NULL AND target_event.registration_opens_at > now() THEN
    RAISE EXCEPTION 'Registration has not opened yet';
  END IF;
  IF target_event.registration_closes_at IS NOT NULL AND target_event.registration_closes_at <= now() THEN
    RAISE EXCEPTION 'Registration is closed for this event';
  END IF;
  IF target_event.registration_capacity IS NOT NULL THEN
    SELECT COUNT(*)::INT INTO registration_count
    FROM event_registrations
    WHERE event_id = NEW.event_id;
    IF registration_count >= target_event.registration_capacity THEN
      RAISE EXCEPTION 'This event is at capacity';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (SELECT auth.uid()) IS NULL THEN
      RAISE EXCEPTION 'Connections must be sent as the authenticated member';
    END IF;
    NEW.from_user_id := (SELECT auth.uid());
    NEW.status := 'pending';
    NEW.message := NULLIF(btrim(NEW.message), '');
    IF char_length(COALESCE(NEW.message, '')) > 500 THEN
      RAISE EXCEPTION 'Connection message must be 500 characters or fewer';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.from_user_id IS DISTINCT FROM OLD.from_user_id
    OR NEW.to_user_id IS DISTINCT FROM OLD.to_user_id
    OR NEW.message IS DISTINCT FROM OLD.message
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Connection identity and message cannot be changed';
  END IF;

  IF OLD.to_user_id <> (SELECT auth.uid())
    OR OLD.status <> 'pending'
    OR NEW.status NOT IN ('accepted', 'declined') THEN
    RAISE EXCEPTION 'Only the recipient can accept or decline a pending connection';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_studio_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_is_admin BOOLEAN := (SELECT is_admin());
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT caller_is_admin THEN
      NEW.author_id := (SELECT auth.uid());
      NEW.status := 'pending';
      NEW.moderated_at := NULL;
      NEW.moderated_by := NULL;
      NEW.moderation_note := NULL;
    ELSIF NEW.author_id IS NULL THEN
      NEW.author_id := (SELECT auth.uid());
    END IF;
  ELSE
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.author_id IS DISTINCT FROM OLD.author_id
      OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'Studio identity cannot be changed';
    END IF;
    IF OLD.author_id <> (SELECT auth.uid()) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only the author or an administrator can update this studio submission';
    END IF;
    IF (
      NEW.status IS DISTINCT FROM OLD.status
      OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
      OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
      OR NEW.moderation_note IS DISTINCT FROM OLD.moderation_note
    ) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only an administrator can moderate studio submissions';
    END IF;
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.writeup := btrim(NEW.writeup);
  NEW.repo_url := NULLIF(btrim(NEW.repo_url), '');
  NEW.demo_url := NULLIF(btrim(NEW.demo_url), '');
  IF char_length(NEW.title) NOT BETWEEN 1 AND 160
    OR char_length(NEW.writeup) NOT BETWEEN 20 AND 5000 THEN
    RAISE EXCEPTION 'Studio title or write-up is outside the allowed length';
  END IF;
  IF (NEW.repo_url IS NOT NULL AND (char_length(NEW.repo_url) > 2048 OR NEW.repo_url !~* '^https://'))
    OR (NEW.demo_url IS NOT NULL AND (char_length(NEW.demo_url) > 2048 OR NEW.demo_url !~* '^https://')) THEN
    RAISE EXCEPTION 'Studio links must be secure HTTPS URLs';
  END IF;
  IF NEW.moderation_note IS NOT NULL THEN
    NEW.moderation_note := btrim(NEW.moderation_note);
    IF char_length(NEW.moderation_note) > 1000 THEN
      RAISE EXCEPTION 'Moderation note is too long';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_essay_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_is_admin BOOLEAN := (SELECT is_admin());
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT caller_is_admin THEN
      NEW.author_id := (SELECT auth.uid());
      NEW.is_editorial_pick := false;
      NEW.status := 'pending';
      NEW.moderated_at := NULL;
      NEW.moderated_by := NULL;
      NEW.moderation_note := NULL;
    ELSIF NEW.author_id IS NULL THEN
      NEW.author_id := (SELECT auth.uid());
    END IF;
  ELSE
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.author_id IS DISTINCT FROM OLD.author_id
      OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'Essay identity cannot be changed';
    END IF;
    IF OLD.author_id <> (SELECT auth.uid()) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only the author or an administrator can update this essay';
    END IF;
    IF NEW.is_editorial_pick IS DISTINCT FROM OLD.is_editorial_pick AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only an administrator can select an editorial pick';
    END IF;
    IF (
      NEW.status IS DISTINCT FROM OLD.status
      OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
      OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
      OR NEW.moderation_note IS DISTINCT FROM OLD.moderation_note
    ) AND NOT caller_is_admin THEN
      RAISE EXCEPTION 'Only an administrator can moderate essays';
    END IF;
    IF NEW.status IS DISTINCT FROM 'approved' THEN
      NEW.is_editorial_pick := false;
    END IF;
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.body := btrim(NEW.body);
  IF char_length(NEW.title) NOT BETWEEN 1 AND 160
    OR char_length(NEW.body) NOT BETWEEN 100 AND 10000 THEN
    RAISE EXCEPTION 'Essay title or body is outside the allowed length';
  END IF;
  IF NEW.moderation_note IS NOT NULL THEN
    NEW.moderation_note := btrim(NEW.moderation_note);
    IF char_length(NEW.moderation_note) > 1000 THEN
      RAISE EXCEPTION 'Moderation note is too long';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_introduction_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Introduction author must match the authenticated member';
  END IF;
  NEW.author_id := (SELECT auth.uid());
  NEW.headline := btrim(NEW.headline);
  NEW.looking_for := btrim(NEW.looking_for);
  NEW.interests := ARRAY(
    SELECT DISTINCT btrim(value)
    FROM unnest(COALESCE(NEW.interests, '{}')) AS value
    WHERE btrim(value) <> ''
    ORDER BY btrim(value)
  );
  IF char_length(NEW.headline) NOT BETWEEN 1 AND 160
    OR char_length(NEW.looking_for) NOT BETWEEN 1 AND 1000
    OR cardinality(NEW.interests) > 12
    OR EXISTS (SELECT 1 FROM unnest(NEW.interests) AS value WHERE char_length(value) > 40) THEN
    RAISE EXCEPTION 'Introduction content is outside the allowed length';
  END IF;
  RETURN NEW;
END;
$$;

-- ─── Lab lead notification deep-link ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_lab_application_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  applicant_name TEXT;
  project_title TEXT;
  lead_id UUID;
BEGIN
  SELECT display_name INTO applicant_name FROM profiles WHERE id = NEW.applicant_id;
  SELECT title, lead_researcher_id INTO project_title, lead_id
    FROM research_projects WHERE id = NEW.project_id;

  IF lead_id IS NOT NULL AND lead_id <> NEW.applicant_id THEN
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      lead_id,
      'lab_application_received',
      'New lab application',
      COALESCE(applicant_name, 'A member') || ' applied to "' || COALESCE(project_title, 'your project') || '".',
      '/portal/labs/review?project=' || NEW.project_id::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Keep status notifications on the deep-linked project detail path.
CREATE OR REPLACE FUNCTION notify_lab_application_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  project_title TEXT;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('accepted', 'rejected', 'under_review') THEN
    SELECT title INTO project_title FROM research_projects WHERE id = NEW.project_id;
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      NEW.applicant_id,
      'lab_application_status',
      'Application update',
      'Your application to "' || COALESCE(project_title, 'a project') || '" is now ' ||
        replace(NEW.status::text, '_', ' ') || '.',
      '/portal/labs/' || NEW.project_id::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$;

-- ─── Indexes for common ownership / dashboard queries ────────────────────────

CREATE INDEX IF NOT EXISTS opportunity_interests_user
  ON opportunity_interests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS news_bookmarks_user
  ON news_bookmarks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS project_bookmarks_user
  ON project_bookmarks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS event_registrations_user
  ON event_registrations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lab_applications_applicant
  ON lab_applications (applicant_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS essay_upvotes_user
  ON essay_upvotes (user_id, created_at DESC);

-- ============================================================
-- 020_notification_ownership_moderation.sql
-- ============================================================
-- Lock notification content updates, force project/competition ownership,
-- index connection inboxes, and notify authors on studio/essay moderation.

-- ─── Notification content freeze (read flag only) ────────────────────────────

CREATE OR REPLACE FUNCTION protect_notification_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.user_id IS DISTINCT FROM OLD.user_id
    OR NEW.type IS DISTINCT FROM OLD.type
    OR NEW.title IS DISTINCT FROM OLD.title
    OR NEW.body IS DISTINCT FROM OLD.body
    OR NEW.link IS DISTINCT FROM OLD.link
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only the read flag can be updated on notifications';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION protect_notification_content() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_notification_content_write ON notifications;
CREATE TRIGGER protect_notification_content_write
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION protect_notification_content();

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Research project lead ownership ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_research_project_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.lead_researcher_id := (SELECT auth.uid());
    RETURN NEW;
  END IF;

  IF NEW.lead_researcher_id IS DISTINCT FROM OLD.lead_researcher_id
     AND NOT COALESCE((SELECT is_admin()), false) THEN
    RAISE EXCEPTION 'Only an administrator can transfer project leadership';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION validate_research_project_ownership() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS research_projects_validate_ownership ON research_projects;
CREATE TRIGGER research_projects_validate_ownership
  BEFORE INSERT OR UPDATE ON research_projects
  FOR EACH ROW EXECUTE FUNCTION validate_research_project_ownership();

-- ─── Competition audit trail ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_competition_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.created_by := (SELECT auth.uid());
  ELSE
    NEW.created_by := OLD.created_by;
  END IF;

  NEW.title := btrim(NEW.title);
  NEW.description := btrim(NEW.description);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION validate_competition_audit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS competitions_validate_audit ON competitions;
CREATE TRIGGER competitions_validate_audit
  BEFORE INSERT OR UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION validate_competition_audit();

-- ─── Connection request indexes ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS connection_requests_to_user
  ON connection_requests (to_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS connection_requests_from_user
  ON connection_requests (from_user_id, created_at DESC);

-- ─── Moderation status notifications ─────────────────────────────────────────

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'studio_submission_status';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'essay_submission_status';

CREATE OR REPLACE FUNCTION moderate_studio_submission(
  p_id UUID,
  p_status submission_moderation_status,
  p_note TEXT DEFAULT NULL
)
RETURNS studio_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result studio_submissions;
  previous_status submission_moderation_status;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  SELECT status INTO previous_status FROM studio_submissions WHERE id = p_id;
  IF previous_status IS NULL THEN
    RAISE EXCEPTION 'Studio submission not found';
  END IF;

  UPDATE studio_submissions
  SET
    status = p_status,
    moderated_at = now(),
    moderated_by = (SELECT auth.uid()),
    moderation_note = NULLIF(btrim(COALESCE(p_note, '')), '')
  WHERE id = p_id
  RETURNING * INTO result;

  IF result.status IS DISTINCT FROM previous_status
     AND result.status IN ('approved', 'rejected') THEN
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      result.author_id,
      'studio_submission_status',
      'Studio submission update',
      'Your studio submission "' || result.title || '" was ' || result.status::text || '.',
      '/portal/pathways/studios'
    );
  END IF;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION moderate_essay_submission(
  p_id UUID,
  p_status submission_moderation_status,
  p_note TEXT DEFAULT NULL,
  p_editorial_pick BOOLEAN DEFAULT NULL
)
RETURNS essay_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result essay_submissions;
  previous_status submission_moderation_status;
BEGIN
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  SELECT status INTO previous_status FROM essay_submissions WHERE id = p_id;
  IF previous_status IS NULL THEN
    RAISE EXCEPTION 'Essay submission not found';
  END IF;

  UPDATE essay_submissions
  SET
    status = p_status,
    moderated_at = now(),
    moderated_by = (SELECT auth.uid()),
    moderation_note = NULLIF(btrim(COALESCE(p_note, '')), ''),
    is_editorial_pick = CASE
      WHEN p_status <> 'approved' THEN false
      WHEN p_editorial_pick IS NULL THEN is_editorial_pick
      ELSE p_editorial_pick
    END
  WHERE id = p_id
  RETURNING * INTO result;

  IF result.status IS DISTINCT FROM previous_status
     AND result.status IN ('approved', 'rejected') THEN
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      result.author_id,
      'essay_submission_status',
      'Essay submission update',
      'Your essay "' || result.title || '" was ' || result.status::text || '.',
      '/portal/pathways/essays'
    );
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION moderate_studio_submission(UUID, submission_moderation_status, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION moderate_essay_submission(UUID, submission_moderation_status, TEXT, BOOLEAN) TO authenticated;
