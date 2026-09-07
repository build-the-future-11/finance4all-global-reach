-- Recovered from commit 9539faadecc5d5c564b33e7610e02cbe1789f97c.
-- Sequenced one second after the preceding file from the same commit.

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
