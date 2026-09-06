import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const retirementMigration = readFileSync(
  "supabase/migrations/20260906150000_retire_unused_hosted_extensions.sql",
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

  it("certifies two identities without retaining mutations", () => {
    expect(rlsCertification).toContain("SET LOCAL ROLE authenticated");
    expect(rlsCertification).toContain("ordinary member updated another profile");
    expect(rlsCertification).toContain("ordinary member forged a notification");
    expect(rlsCertification.trimEnd()).toMatch(/ROLLBACK;$/);
  });
});
