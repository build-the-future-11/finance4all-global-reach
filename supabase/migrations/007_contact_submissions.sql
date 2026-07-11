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
