import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const retirementMigration = readFileSync(
  "supabase/migrations/20260906150000_retire_unused_hosted_extensions.sql",
  "utf8",
);
const abandonedTableArchive = readFileSync(
  "supabase/migrations/20260906171941_archive_abandoned_public_tables.sql",
  "utf8",
);
const recoveredFunctionHardening = readFileSync(
  "supabase/migrations/20260906172830_harden_recovered_profile_functions.sql",
  "utf8",
);
const rlsCertification = readFileSync(
  "supabase/tests/two_identity_rls_certification.sql",
  "utf8",
);

describe("production completion contracts", () => {
  it("retires empty hosted-only surfaces and preserves existing telemetry", () => {
    expect(retirementMigration).toContain("contact_submissions contains");
    expect(retirementMigration).toContain("ALTER TABLE public.rate_limit_events SET SCHEMA private");
    expect(retirementMigration).toContain("UPDATE storage.buckets SET public = false");
    expect(retirementMigration).toContain('DROP POLICY IF EXISTS "Members read avatars"');
    expect(retirementMigration).toContain("DROP FUNCTION IF EXISTS public.portal_search");
  });

  it("archives every unused table found in the production drift audit", () => {
    for (const table of [
      "digest_send_log",
      "education_lessons",
      "education_modules",
      "resource_guides",
      "resource_items",
      "testimonials",
      "webinars",
      "weekly_goal_baselines",
    ]) {
      expect(abandonedTableArchive).toContain(`'${table}'`);
    }

    expect(abandonedTableArchive).toContain("REVOKE ALL ON TABLE public.%I");
    expect(abandonedTableArchive).toContain("ALTER TABLE public.%I SET SCHEMA private");
    expect(abandonedTableArchive).not.toMatch(/DROP TABLE/i);
    expect(abandonedTableArchive).not.toContain("education_lesson_progress',");
  });

  it("hardens recovered trigger functions against search-path injection", () => {
    expect(recoveredFunctionHardening).toContain("SET search_path = ''");
    expect(recoveredFunctionHardening).toContain("UPDATE public.chapters");
    expect(recoveredFunctionHardening).toContain("public.is_admin()");

    for (const fn of [
      "sync_chapter_member_counts",
      "enforce_profile_insert_defaults",
      "protect_profile_role",
    ]) {
      expect(recoveredFunctionHardening).toContain(
        `REVOKE ALL ON FUNCTION public.${fn}() FROM PUBLIC, anon, authenticated`,
      );
    }
  });

  it("certifies two identities without retaining mutations", () => {
    expect(rlsCertification).toContain("SET LOCAL ROLE authenticated");
    expect(rlsCertification).toContain("ordinary member updated another profile");
    expect(rlsCertification).toContain("ordinary member forged a notification");
    expect(rlsCertification.trimEnd()).toMatch(/ROLLBACK;$/);
  });
});
