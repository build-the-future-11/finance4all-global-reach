-- Archive unused tables created by a partially applied, unmerged migration.
-- Moving them preserves any data while removing them from the public API surface.

DO $$
DECLARE
  table_name text;
  archive_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'digest_send_log',
    'education_lessons',
    'education_modules',
    'resource_guides',
    'resource_items',
    'testimonials',
    'webinars',
    'weekly_goal_baselines'
  ]
  LOOP
    archive_name := 'legacy_' || table_name;

    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      IF to_regclass(format('private.%I', archive_name)) IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot archive %.%: private.% already exists',
          'public', table_name, archive_name;
      END IF;

      EXECUTE format(
        'REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated',
        table_name
      );
      EXECUTE format('ALTER TABLE public.%I SET SCHEMA private', table_name);
      EXECUTE format('ALTER TABLE private.%I RENAME TO %I', table_name, archive_name);
    END IF;
  END LOOP;
END;
$$;

-- education_lesson_progress is retained: it came from a complete migration and
-- remains protected by owner-only RLS, even though the current UI does not use it.
