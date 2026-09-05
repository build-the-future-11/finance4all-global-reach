import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const migrationPath = path.resolve(process.cwd(), "supabase/migrations/004_authorization_hardening.sql");
const migration = fs.readFileSync(migrationPath, "utf8");
const authContext = fs.readFileSync(
  path.resolve(process.cwd(), "src/contexts/AuthContext.tsx"),
  "utf8",
);
const notificationMigration = fs.readFileSync(
  path.resolve(process.cwd(), "supabase/migrations/003_bookmarks_notifications.sql"),
  "utf8",
);

describe("FinanceMeta authorization boundary", () => {
  it("uses the next migration version after existing 001/002/003 migrations", () => {
    expect(path.basename(migrationPath)).toBe("004_authorization_hardening.sql");
    expect(fs.existsSync(path.resolve(process.cwd(), "supabase/migrations/002_google_oauth.sql"))).toBe(true);
    expect(fs.existsSync(path.resolve(process.cwd(), "supabase/migrations/003_bookmarks_notifications.sql"))).toBe(true);
  });

  it("removes role from authenticated table-level writes", () => {
    expect(migration).toContain("REVOKE INSERT, UPDATE ON TABLE public.profiles FROM anon, authenticated");
    expect(migration).toContain("GRANT INSERT (id, email, display_name, avatar_url, bio, interests, open_to_collaborate, chapter_id)");
    expect(migration).toContain("GRANT UPDATE (display_name, avatar_url, bio, interests, open_to_collaborate, chapter_id)");
    expect(migration).not.toContain("GRANT UPDATE (role");
    expect(migration).not.toContain("GRANT INSERT (role");
  });

  it("requires owned rows to remain owned after self-service updates", () => {
    expect(migration).toContain("USING (auth.uid() = id)");
    expect(migration).toContain("WITH CHECK (auth.uid() = id)");
    expect(migration).toContain("WITH CHECK (auth.uid() = id AND role = 'member'::public.user_role)");
  });

  it("pins security-definer helper and trigger search paths", () => {
    for (const fn of [
      "handle_new_user",
      "get_user_role",
      "is_admin",
      "is_lead_or_admin",
      "notify_connection_request",
      "notify_connection_accepted",
      "notify_lab_application_received",
      "notify_lab_application_status",
    ]) {
      expect(migration).toContain(`ALTER FUNCTION public.${fn}() SET search_path = public`);
    }
  });

  it("removes direct authenticated notification insertion", () => {
    expect(notificationMigration).toContain('CREATE POLICY "System insert notifications"');
    expect(notificationMigration).toContain("WITH CHECK (true)");
    expect(migration).toContain('DROP POLICY IF EXISTS "System insert notifications" ON public.notifications');
    expect(migration).toContain("REVOKE INSERT ON TABLE public.notifications FROM anon, authenticated");
    expect(migration).not.toContain("GRANT INSERT ON TABLE public.notifications TO authenticated");
  });

  it("keeps the aggregate view invoker-safe without collapsing community upvote counts", () => {
    expect(migration).toContain("ALTER VIEW public.essay_submissions_with_counts SET (security_invoker = true)");
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.get_essay_upvote_count(target_essay_id uuid)");
    expect(migration).toContain("SECURITY DEFINER");
    expect(migration).toContain("SET search_path = ''");
    expect(migration).toContain("FROM public.essay_upvotes");
    expect(migration).toContain("WHERE essay_id = target_essay_id");
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.get_essay_upvote_count(uuid) FROM PUBLIC");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.get_essay_upvote_count(uuid) TO authenticated");
    expect(migration).toContain("COALESCE(public.get_essay_upvote_count(e.id), 0)::int AS upvote_count");
    expect(migration).not.toContain("SELECT essay_id, COUNT(*) AS cnt FROM essay_upvotes GROUP BY essay_id");
  });

  it("keeps the current member profile UI within the safe-column grant", () => {
    expect(authContext).toContain('Pick<UserProfile, "displayName" | "bio" | "interests" | "openToCollaborate" | "chapterId">');
    expect(authContext).toContain("payload.display_name = updates.displayName");
    expect(authContext).toContain("payload.bio = updates.bio");
    expect(authContext).toContain("payload.interests = updates.interests");
    expect(authContext).toContain("payload.open_to_collaborate = updates.openToCollaborate");
    expect(authContext).toContain("payload.chapter_id = updates.chapterId ?? null");
    const updateStart = authContext.indexOf("const updateProfile = useCallback");
    const updateEnd = authContext.indexOf("const needsOnboarding", updateStart);
    expect(updateStart).toBeGreaterThanOrEqual(0);
    expect(updateEnd).toBeGreaterThan(updateStart);
    const updateProfileSection = authContext.slice(updateStart, updateEnd);
    expect(updateProfileSection).not.toContain("payload.role");
    expect(updateProfileSection).not.toContain("payload.email");
  });

  it("keeps authenticated routing blocked until the newest profile hydration finishes", () => {
    expect(authContext).toContain("const hydrationGuard = useRef(createAuthHydrationGuard());");
    expect(authContext).toContain("const initialToken = guard.begin();");
    expect(authContext).toContain("void hydrateSession(data.session, initialToken);");
    expect(authContext).toContain("if (disposed || !guard.isCurrent(token)) return;");
    expect(authContext).toContain("setProfile(null);\n      setLoading(true);");

    const listenerStart = authContext.indexOf("supabase.auth.onAuthStateChange");
    const listenerEnd = authContext.indexOf("return () =>", listenerStart);
    expect(listenerStart).toBeGreaterThanOrEqual(0);
    expect(listenerEnd).toBeGreaterThan(listenerStart);

    const listener = authContext.slice(listenerStart, listenerEnd);
    expect(listener).toContain("const token = guard.begin();");
    expect(listener).toContain("void hydrateSession(nextSession, token);");
    expect(listener).not.toContain("setLoading(false)");
  });

  it("invalidates in-flight auth hydration when the provider unmounts", () => {
    expect(authContext).toContain("disposed = true;");
    expect(authContext).toContain("guard.invalidate();");
    expect(authContext).toContain("sub.subscription.unsubscribe();");
  });

  it("fails closed to onboarding for authenticated users without a hydrated profile", () => {
    expect(authContext).toContain(
      "const needsOnboarding = Boolean(session?.user && (!profile || !profile.displayName?.trim()));",
    );
    expect(authContext).not.toContain("const needsOnboarding = Boolean(profile &&");
  });

  it("fails closed on profile lookup errors and only reflects persisted avatar updates", () => {
    expect(authContext).toContain("const { data: existing, error: existingError } = await supabase");
    expect(authContext).toContain('console.error("Profile lookup failed:", existingError.message);');
    expect(authContext).toContain("if (existingError) {");

    const ensureStart = authContext.indexOf("const ensureProfile = useCallback");
    const ensureEnd = authContext.indexOf("const fetchProfile = useCallback", ensureStart);
    expect(ensureStart).toBeGreaterThanOrEqual(0);
    expect(ensureEnd).toBeGreaterThan(ensureStart);
    const ensureSection = authContext.slice(ensureStart, ensureEnd);
    expect(ensureSection.indexOf("if (existingError) {")).toBeLessThan(
      ensureSection.indexOf('.from("profiles")\n      .insert({'),
    );

    const fetchStart = authContext.indexOf("const fetchProfile = useCallback");
    const fetchEnd = authContext.indexOf("const refreshProfile = useCallback", fetchStart);
    expect(fetchStart).toBeGreaterThanOrEqual(0);
    expect(fetchEnd).toBeGreaterThan(fetchStart);
    const fetchSection = authContext.slice(fetchStart, fetchEnd);
    expect(fetchSection).toContain("const { error: avatarError } = await supabase");
    expect(fetchSection).toContain('console.error("Profile avatar sync failed:", avatarError.message);');
    expect(fetchSection).toContain("} else {\n          mapped.avatarUrl = avatarUrl;");
  });

  it("invalidates stale hydration before sign-out and only clears the matching auth generation", () => {
    const signOutStart = authContext.indexOf("const signOut = useCallback");
    const signOutEnd = authContext.indexOf("const updateProfile", signOutStart);
    expect(signOutStart).toBeGreaterThanOrEqual(0);
    expect(signOutEnd).toBeGreaterThan(signOutStart);

    const signOutSection = authContext.slice(signOutStart, signOutEnd);
    expect(signOutSection).toContain("const guard = hydrationGuard.current;");
    expect(signOutSection).toContain("const token = guard.begin();");
    expect(signOutSection).toContain("setLoading(true);");
    expect(signOutSection).toContain("const { error } = await withDeadline(");
    expect(signOutSection).toContain("() => supabase.auth.signOut(),");
    expect(signOutSection).toContain("AUTH_SESSION_OPERATION_TIMEOUT_MS,");
    expect(signOutSection).toContain("if (guard.isCurrent(token)) setLoading(false);");
    expect(signOutSection).toContain("if (guard.isCurrent(token)) {");
    expect(signOutSection).toContain("activeUserIdRef.current = null;");
    expect(signOutSection).toContain("setSession(null);");
    expect(signOutSection).toContain("setProfile(null);");
  });
});
