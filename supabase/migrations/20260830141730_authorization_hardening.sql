-- FinanceMeta authorization and notification integrity hardening
-- Follows the initial schema, OAuth, and bookmark/notification migrations.
-- Prevent members from escalating profiles.role through direct PostgREST/client writes.
-- Make the authenticated essay aggregate view execute with caller permissions so underlying essay RLS applies.
-- Preserve community upvote totals through a narrow SECURITY DEFINER count function that exposes counts, not voter rows.
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

-- A security-invoker view is required so callers cannot bypass essay_submissions RLS.
-- The original aggregate subquery would also make essay_upvotes obey caller RLS,
-- collapsing community counts to the caller's own upvote. Expose only the aggregate
-- through a tightly scoped definer function instead of exposing other users' upvote rows.
CREATE OR REPLACE FUNCTION public.get_essay_upvote_count(target_essay_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT count(*)
  FROM public.essay_upvotes
  WHERE essay_id = target_essay_id;
$$;

REVOKE ALL ON FUNCTION public.get_essay_upvote_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_essay_upvote_count(uuid) TO authenticated;

CREATE OR REPLACE VIEW public.essay_submissions_with_counts AS
SELECT
  e.*,
  COALESCE(public.get_essay_upvote_count(e.id), 0)::int AS upvote_count
FROM public.essay_submissions e;

ALTER VIEW public.essay_submissions_with_counts SET (security_invoker = true);
GRANT SELECT ON public.essay_submissions_with_counts TO authenticated;

COMMIT;
