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
