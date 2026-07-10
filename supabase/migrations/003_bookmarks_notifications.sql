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
