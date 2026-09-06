-- Harden trigger functions recovered from the abandoned security branch.

CREATE OR REPLACE FUNCTION public.sync_chapter_member_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.chapter_id IS NOT NULL THEN
      UPDATE public.chapters
      SET member_count = member_count + 1
      WHERE id = NEW.chapter_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.chapter_id IS NOT NULL THEN
      UPDATE public.chapters
      SET member_count = GREATEST(0, member_count - 1)
      WHERE id = OLD.chapter_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.chapter_id IS DISTINCT FROM NEW.chapter_id THEN
      IF OLD.chapter_id IS NOT NULL THEN
        UPDATE public.chapters
        SET member_count = GREATEST(0, member_count - 1)
        WHERE id = OLD.chapter_id;
      END IF;
      IF NEW.chapter_id IS NOT NULL THEN
        UPDATE public.chapters
        SET member_count = member_count + 1
        WHERE id = NEW.chapter_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_profile_insert_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.role := 'member';
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins may change profile roles';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_chapter_member_counts() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_profile_insert_defaults() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_profile_role() FROM PUBLIC, anon, authenticated;
