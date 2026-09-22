import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const membershipMigration = readFileSync(
  "supabase/migrations/20260922170000_explicit_membership_authority.sql",
  "utf8",
);
const enrollmentMigration = readFileSync(
  "supabase/migrations/20260922173000_membership_enrollment_authority.sql",
  "utf8",
);

describe("FinanceMeta explicit membership authority", () => {
  it("keeps membership server-owned and separate from profile existence", () => {
    expect(membershipMigration).toContain(
      "CREATE TABLE IF NOT EXISTS private.financemeta_memberships",
    );
    expect(membershipMigration).toContain(
      "user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE",
    );
    expect(membershipMigration).toContain(
      "CHECK (status IN ('active', 'suspended', 'revoked'))",
    );
    expect(membershipMigration).toContain(
      "REVOKE ALL ON TABLE private.financemeta_memberships FROM PUBLIC, anon, authenticated",
    );
    expect(membershipMigration).not.toMatch(
      /CREATE\s+TRIGGER[\s\S]*financemeta_memberships/i,
    );
    expect(membershipMigration).not.toMatch(
      /INSERT\s+INTO\s+private\.financemeta_memberships[\s\S]*SELECT/i,
    );
  });

  it("exposes only an own-identity active-membership predicate", () => {
    expect(membershipMigration).toContain(
      "CREATE OR REPLACE FUNCTION public.financemeta_is_member()",
    );
    expect(membershipMigration).toContain("SECURITY DEFINER");
    expect(membershipMigration).toContain("SET search_path = ''");
    expect(membershipMigration).toContain("membership.user_id = (SELECT auth.uid())");
    expect(membershipMigration).toContain("membership.status = 'active'");
    expect(membershipMigration).toContain(
      "REVOKE ALL ON FUNCTION public.financemeta_is_member() FROM PUBLIC, anon",
    );
    expect(membershipMigration).toContain(
      "GRANT EXECUTE ON FUNCTION public.financemeta_is_member() TO authenticated",
    );
  });

  it("does not prematurely switch existing RLS or infer historical membership", () => {
    expect(membershipMigration).not.toMatch(/DROP\s+POLICY/i);
    expect(membershipMigration).not.toMatch(/CREATE\s+POLICY/i);
    expect(membershipMigration).not.toMatch(/UPDATE\s+public\.profiles/i);
    expect(membershipMigration).not.toMatch(/INSERT\s+INTO\s+public\.profiles/i);
    expect(membershipMigration).not.toMatch(/raw_user_meta_data|raw_app_meta_data/i);
    expect(membershipMigration).toContain(
      "VALUES ('20260922170000', 'explicit_membership_authority')",
    );
  });

  it("keeps enrollment and status mutation service-role only", () => {
    expect(enrollmentMigration).toContain(
      "CREATE OR REPLACE FUNCTION public.financemeta_grant_membership(",
    );
    expect(enrollmentMigration).toContain(
      "CREATE OR REPLACE FUNCTION public.financemeta_set_membership_status(",
    );
    expect(enrollmentMigration).toContain(
      "REVOKE ALL ON FUNCTION public.financemeta_grant_membership(uuid, text, uuid)",
    );
    expect(enrollmentMigration).toContain(
      "REVOKE ALL ON FUNCTION public.financemeta_set_membership_status(uuid, text, uuid)",
    );
    expect(enrollmentMigration).toContain(
      "GRANT EXECUTE ON FUNCTION public.financemeta_grant_membership(uuid, text, uuid)\n  TO service_role",
    );
    expect(enrollmentMigration).toContain(
      "GRANT EXECUTE ON FUNCTION public.financemeta_set_membership_status(uuid, text, uuid)\n  TO service_role",
    );
    expect(enrollmentMigration).not.toMatch(
      /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.financemeta_(?:grant_membership|set_membership_status)[\s\S]*?TO\s+authenticated/i,
    );
  });

  it("requires explicit provenance for activation and keeps reactivation separate from status mutation", () => {
    expect(enrollmentMigration).toContain(
      "normalized_source text := NULLIF(pg_catalog.btrim(enrollment_source), '')",
    );
    expect(enrollmentMigration).toContain(
      "membership source must be between 1 and 120 characters",
    );
    expect(enrollmentMigration).toContain("status = 'active'");
    expect(enrollmentMigration).toContain(
      "IF target_status NOT IN ('suspended', 'revoked') THEN",
    );
    expect(enrollmentMigration).toContain(
      "RAISE EXCEPTION 'membership not found' USING ERRCODE = 'P0002'",
    );
    expect(enrollmentMigration).not.toMatch(/raw_user_meta_data|raw_app_meta_data/i);
    expect(enrollmentMigration).toContain(
      "VALUES ('20260922173000', 'membership_enrollment_authority')",
    );
  });
});
