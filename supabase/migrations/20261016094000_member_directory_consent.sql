-- Membership is not consent to appear in a directory. Existing profiles opt out.
BEGIN;
ALTER TABLE public.profiles ADD COLUMN directory_visible boolean NOT NULL DEFAULT false;
GRANT SELECT (directory_visible), INSERT (directory_visible), UPDATE (directory_visible)
  ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles require directory consent or ownership" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR directory_visible OR (SELECT public.is_admin()));
CREATE INDEX profiles_visible_directory_name_idx ON public.profiles (display_name, id)
  WHERE directory_visible;

-- Literal case-insensitive substring matching across interests happens before
-- the result bound. Invoker rights preserve the same RLS and safe columns.
CREATE FUNCTION public.member_directory(search_text text DEFAULT '', collaborators_only boolean DEFAULT false)
RETURNS TABLE (id uuid, display_name text, role public.user_role, bio text,
  avatar_url text, interests text[], open_to_collaborate boolean,
  directory_visible boolean, chapter_id uuid, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT p.id, p.display_name, p.role, p.bio, p.avatar_url, p.interests,
    p.open_to_collaborate, p.directory_visible, p.chapter_id, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE p.directory_visible AND p.display_name <> ''
    AND (NOT coalesce(collaborators_only, false) OR p.open_to_collaborate)
    AND position(lower(left(btrim(coalesce(search_text, '')), 128))
      IN lower(concat_ws(' ', p.display_name, p.bio, array_to_string(p.interests, ' ')))) > 0
  ORDER BY p.display_name, p.id LIMIT 60;
$$;
REVOKE ALL ON FUNCTION public.member_directory(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.member_directory(text, boolean) TO authenticated;

COMMENT ON COLUMN public.profiles.directory_visible IS
  'Explicit member consent to display the already column-restricted profile to authenticated members. Default false; never exposes email or Auth metadata.';
INSERT INTO private.portal_schema_revisions(version, name)
VALUES ('20261016094000', 'member_directory_consent') ON CONFLICT (version) DO NOTHING;
COMMIT;
