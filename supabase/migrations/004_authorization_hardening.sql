-- FinanceMeta authorization and notification integrity hardening
-- Apply after 001_initial_schema.sql, 002_google_oauth.sql and 003_bookmarks_notifications.sql.
-- Prevent members from escalating profiles.role through direct PostgREST/client writes.
-- Make the authenticated essay aggregate view execute with caller permissions so underlying RLS applies.
-- Prevent authenticated clients from fabricating notifications; notification inserts remain trigger-owned.
-- Pin SECURITY DEFINER helper/trigger search paths and remove unnecessary public execution.

BEGIN;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'member'::public.user_role);

REVOKE INSERT, UPDATE ON TABLE public.profiles FROM anon, authenticated;
GRANT INSERT (id, email, display_name, avatar_url, bio, interests, open_to_collaborate, chapter_id)
  ON TABLE public.profiles TO authenticated;
GRANT UPDATE (display_name, avatar_url, bio, interests, open_to_collaborate, chapter_id)
  ON TABLE public.profiles TO authenticated;

ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_lead_or_admin() SET search_path = public;
ALTER FUNCTION public.notify_connection_request() SET search_path = public;
ALTER FUNCTION public.notify_connection_accepted() SET search_path = public;
ALTER FUNCTION public.notify_lab_application_received() SET search_path = public;
ALTER FUNCTION public.notify_lab_application_status() SET search_path = public;

REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_lead_or_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_lead_or_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_connection_request() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_connection_accepted() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_lab_application_received() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_lab_application_status() FROM PUBLIC;

DROP POLICY IF EXISTS "System insert notifications" ON public.notifications;
REVOKE INSERT ON TABLE public.notifications FROM anon, authenticated;

ALTER VIEW public.essay_submissions_with_counts SET (security_invoker = true);

COMMIT;
