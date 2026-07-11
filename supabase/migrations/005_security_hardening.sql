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
