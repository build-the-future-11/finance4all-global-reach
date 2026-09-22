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

  it("keeps grant, reactivation, and status mutation service-role only", () => {
    expect(enrollmentMigration).toContain(
      "CREATE OR REPLACE FUNCTION public.financemeta_grant_membership(",
    );
    expect(enrollmentMigration).toContain(
      "CREATE OR REPLACE FUNCTION public.financemeta_reactivate_membership(",
    );
    expect(enrollmentMigration).toContain(
      "CREATE OR REPLACE FUNCTION public.financemeta_set_membership_status(",
    );
    expect(enrollmentMigration).toContain(
      "REVOKE ALL ON FUNCTION public.financemeta_grant_membership(uuid, text, uuid)",
    );
    expect(enrollmentMigration).toContain(
      "REVOKE ALL ON FUNCTION public.financemeta_reactivate_membership(uuid, text, bigint, uuid)",
    );
    expect(enrollmentMigration).toContain(
      "REVOKE ALL ON FUNCTION public.financemeta_set_membership_status(uuid, text, bigint, uuid)",
    );
    expect(enrollmentMigration).toContain(
      "GRANT EXECUTE ON FUNCTION public.financemeta_grant_membership(uuid, text, uuid)\n  TO service_role",
    );
    expect(enrollmentMigration).toContain(
      "GRANT EXECUTE ON FUNCTION public.financemeta_reactivate_membership(uuid, text, bigint, uuid)\n  TO service_role",
    );
    expect(enrollmentMigration).toContain(
      "GRANT EXECUTE ON FUNCTION public.financemeta_set_membership_status(uuid, text, bigint, uuid)\n  TO service_role",
    );
    expect(enrollmentMigration).not.toMatch(
      /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.financemeta_(?:grant_membership|reactivate_membership|set_membership_status)[\s\S]*?TO\s+authenticated/i,
    );
  });

  it("retains validated actor audit ids independently of auth-user lifetime", () => {
    expect(membershipMigration).toContain("granted_by uuid,");
    expect(membershipMigration).not.toContain(
      "granted_by uuid REFERENCES auth.users(id)",
    );
    expect(enrollmentMigration).toContain(
      "ADD COLUMN IF NOT EXISTS updated_by uuid,",
    );
    expect(enrollmentMigration).toContain(
      "ADD COLUMN IF NOT EXISTS last_activated_by uuid,",
    );
    expect(enrollmentMigration).not.toMatch(
      /(?:updated_by|last_activated_by)\s+uuid\s+REFERENCES\s+auth\.users/i,
    );
    expect(
      enrollmentMigration.match(
        /membership actor must reference an existing auth user/g,
      ),
    ).toHaveLength(3);
  });

  it("separates initial grant from revision-checked reactivation", () => {
    expect(enrollmentMigration).toContain(
      "ADD COLUMN IF NOT EXISTS revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0)",
    );
    expect(enrollmentMigration).toContain(
      "membership already exists; use revision-checked reactivation",
    );
    expect(enrollmentMigration).toContain(
      "AND status IN ('suspended', 'revoked')",
    );
    expect(enrollmentMigration).toContain("AND revision = expected_revision");
    expect(enrollmentMigration).toContain("revision = revision + 1");
    expect(enrollmentMigration).toContain(
      "membership changed since it was read or is not inactive",
    );
    expect(enrollmentMigration).not.toContain("ON CONFLICT (user_id) DO UPDATE SET");
  });

  it("requires canonical provenance for activation and keeps activation out of status mutation", () => {
    expect(
      enrollmentMigration.match(
        /\^\[\[:space:\]\]\+\|\[\[:space:\]\]\+\$/g,
      ),
    ).toHaveLength(2);
    expect(enrollmentMigration).toContain("pg_catalog.regexp_replace(");
    expect(enrollmentMigration).not.toContain(
      "NULLIF(pg_catalog.btrim(enrollment_source), '')",
    );
    expect(enrollmentMigration).toContain(
      "membership source must be between 1 and 120 characters",
    );
    expect(enrollmentMigration).toContain(
      "IF target_status NOT IN ('suspended', 'revoked') THEN",
    );
    expect(enrollmentMigration).toContain(
      "expected membership revision must be a positive integer",
    );
    expect(enrollmentMigration).not.toMatch(/raw_user_meta_data|raw_app_meta_data/i);
    expect(enrollmentMigration).toContain(
      "VALUES ('20260922173000', 'membership_enrollment_authority')",
    );
  });

  it("keeps inactive-state changes monotonic and requires explicit reactivation", () => {
    expect(enrollmentMigration).toContain(
      "(status = 'active' AND target_status IN ('suspended', 'revoked'))",
    );
    expect(enrollmentMigration).toContain(
      "OR (status = 'suspended' AND target_status = 'revoked')",
    );
    expect(enrollmentMigration).toContain(
      "membership changed since it was read or transition is not allowed",
    );
    expect(enrollmentMigration).not.toContain(
      "AND status <> target_status;",
    );
  });

  it("preserves original grant provenance and records later activation separately", () => {
    expect(enrollmentMigration).toContain("last_activated_at timestamptz");
    expect(enrollmentMigration).toContain("last_activation_source text");
    const reactivationFunction = enrollmentMigration.split(
      "CREATE OR REPLACE FUNCTION public.financemeta_reactivate_membership(",
    )[1]?.split("CREATE OR REPLACE FUNCTION public.financemeta_set_membership_status(")[0];
    expect(reactivationFunction).toBeTruthy();
    expect(reactivationFunction).toContain("last_activated_at = pg_catalog.now()");
    expect(reactivationFunction).toContain(
      "last_activation_source = normalized_source",
    );
    expect(reactivationFunction).not.toMatch(/\bgranted_at\s*=/);
    expect(reactivationFunction).not.toMatch(/\bgranted_by\s*=/);
    expect(reactivationFunction).not.toMatch(/\bsource\s*=/);
  });
});
