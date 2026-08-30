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

  it("forces the authenticated aggregate view to respect caller RLS", () => {
    expect(migration).toContain("ALTER VIEW public.essay_submissions_with_counts SET (security_invoker = true)");
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
});
