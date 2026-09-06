import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const migrationPath = path.resolve(
  process.cwd(),
  "supabase/migrations/20260906121145_portal_security_and_privacy.sql",
);
const migration = fs.readFileSync(migrationPath, "utf8");
const authContext = fs.readFileSync(
  path.resolve(process.cwd(), "src/contexts/AuthContext.tsx"),
  "utf8",
);
const mappers = fs.readFileSync(path.resolve(process.cwd(), "src/lib/mappers.ts"), "utf8");

describe("FinanceMeta authorization boundary", () => {
  it("is a versioned migration after the original schema and hardening patches", () => {
    expect(path.basename(migrationPath)).toMatch(/^\d{14}_portal_security_and_privacy\.sql$/);
    for (const file of [
      "001_initial_schema.sql",
      "002_google_oauth.sql",
      "003_bookmarks_notifications.sql",
      "004_authorization_hardening.sql",
    ]) {
      expect(fs.existsSync(path.resolve(process.cwd(), "supabase/migrations", file))).toBe(true);
    }
  });

  it("removes signed-out table access and dangerous generic privileges", () => {
    expect(migration).toContain("REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon");
    expect(migration).toContain(
      "REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM authenticated",
    );
    expect(migration).toContain("ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public");
  });

  it("keeps member email and role outside public profile reads and writes", () => {
    expect(migration).toContain("REVOKE ALL ON TABLE public.profiles FROM authenticated");
    expect(migration).toContain("GRANT SELECT (");
    expect(migration).toContain("id, display_name, role, bio, avatar_url, interests");
    expect(migration).not.toContain("GRANT UPDATE (role");
    expect(migration).not.toContain("GRANT SELECT (email");
    expect(mappers).toContain("PUBLIC_PROFILE_COLUMNS");
    expect(mappers).not.toContain("email: row.email");
  });

  it("prevents application self-approval and ownership rewrites", () => {
    expect(migration).toContain("GRANT INSERT (project_id, applicant_id, motivation)");
    expect(migration).toContain("GRANT UPDATE (status, reviewed_at, reviewer_id)");
    expect(migration).toContain("status = 'pending'::public.lab_application_status");
    expect(migration).toContain("reviewer_id = (SELECT auth.uid())");
    expect(migration).toContain("GRANT UPDATE (title, description, status, tags, application_deadline)");
    expect(migration).not.toContain("GRANT UPDATE (lead_researcher_id");
  });

  it("prevents editorial self-promotion and connection rewrites", () => {
    expect(migration).toContain("GRANT INSERT (author_id, title, body)");
    expect(migration).toContain("GRANT UPDATE (is_editorial_pick)");
    expect(migration).toContain('CREATE POLICY "Admins update essays"');
    expect(migration).toContain("GRANT INSERT (from_user_id, to_user_id, message)");
    expect(migration).toContain("GRANT UPDATE (status)");
    expect(migration).toContain("status = 'pending'::public.connection_status");
  });

  it("prevents studio authorship and timestamp rewrites", () => {
    expect(migration).toContain('CREATE POLICY "Users update own studio submissions"');
    expect(migration).toContain("WITH CHECK (author_id = (SELECT auth.uid()))");
    expect(migration).toContain("GRANT UPDATE (title, repo_url, demo_url, writeup)");
    expect(migration).not.toContain("GRANT UPDATE (author_id");
    expect(migration).not.toContain("GRANT UPDATE (submitted_at");
  });

  it("keeps notifications trigger-owned and member updates read-only", () => {
    expect(migration).toContain('DROP POLICY IF EXISTS "System insert notifications"');
    expect(migration).toContain(
      "REVOKE INSERT, UPDATE, DELETE ON TABLE public.notifications FROM authenticated",
    );
    expect(migration).toContain("GRANT UPDATE (read) ON TABLE public.notifications TO authenticated");
  });

  it("preserves the public contact path without broad mutation grants", () => {
    expect(migration).toContain("GRANT INSERT (name, email, subject, message)");
    expect(migration).toContain("status = ''new''");
    expect(migration).toContain("BETWEEN 10 AND 5000");
    expect(migration).toContain("GRANT UPDATE (status)");
  });

  it("removes direct access to trigger functions and makes search caller-scoped", () => {
    expect(migration).toContain(
      "ALTER FUNCTION public.portal_search(text, integer) SECURITY INVOKER",
    );
    for (const fn of [
      "rls_auto_enable",
      "sync_chapter_member_counts",
      "protect_profile_role",
      "enforce_profile_insert_defaults",
      "set_updated_at",
    ]) {
      expect(migration).toContain(
        `REVOKE ALL ON FUNCTION public.${fn}() FROM PUBLIC, anon, authenticated`,
      );
    }
  });

  it("keeps the optional avatar bucket private", () => {
    expect(migration).toContain("UPDATE storage.buckets SET public = false");
    expect(migration).toContain('DROP POLICY IF EXISTS "Public avatar read"');
    expect(migration).toContain('CREATE POLICY "Members read avatars"');
  });

  it("pins every security-definer function to an empty search path", () => {
    for (const fn of [
      "handle_new_user",
      "get_user_role",
      "is_admin",
      "is_lead_or_admin",
      "notify_connection_request",
      "notify_connection_accepted",
      "notify_lab_application_received",
      "notify_lab_application_status",
      "get_essay_upvote_count",
    ]) {
      const start = migration.indexOf(`FUNCTION public.${fn}`);
      expect(start, `${fn} must be declared`).toBeGreaterThanOrEqual(0);
      expect(migration.slice(start, start + 400)).toContain("SET search_path = ''");
    }
  });

  it("makes the essay view invoker-safe while retaining aggregate counts", () => {
    expect(migration).toContain(
      "ALTER VIEW public.essay_submissions_with_counts SET (security_invoker = true)",
    );
    expect(migration).toContain("FROM public.essay_upvotes");
    expect(migration).toContain("WHERE essay_id = target_essay_id");
    expect(migration).toContain(
      "GRANT EXECUTE ON FUNCTION public.get_essay_upvote_count(uuid) TO authenticated",
    );
  });

  it("keeps the member profile UI within the safe-column grant", () => {
    expect(authContext).toContain(
      'Pick<UserProfile, "displayName" | "bio" | "interests" | "openToCollaborate" | "chapterId">',
    );
    const updateStart = authContext.indexOf("const updateProfile = useCallback");
    const updateEnd = authContext.indexOf("const needsOnboarding", updateStart);
    const updateProfileSection = authContext.slice(updateStart, updateEnd);
    expect(updateProfileSection).not.toContain("payload.role");
    expect(updateProfileSection).not.toContain("payload.email");
  });
});
