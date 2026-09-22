import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260922170000_explicit_membership_authority.sql",
  "utf8",
);

describe("FinanceMeta explicit membership authority", () => {
  it("keeps membership server-owned and separate from profile existence", () => {
    expect(migration).toContain(
      "CREATE TABLE IF NOT EXISTS private.financemeta_memberships",
    );
    expect(migration).toContain(
      "user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE",
    );
    expect(migration).toContain(
      "CHECK (status IN ('active', 'suspended', 'revoked'))",
    );
    expect(migration).toContain(
      "REVOKE ALL ON TABLE private.financemeta_memberships FROM PUBLIC, anon, authenticated",
    );
    expect(migration).not.toMatch(
      /CREATE\s+TRIGGER[\s\S]*financemeta_memberships/i,
    );
    expect(migration).not.toMatch(
      /INSERT\s+INTO\s+private\.financemeta_memberships[\s\S]*SELECT/i,
    );
  });

  it("exposes only an own-identity active-membership predicate", () => {
    expect(migration).toContain(
      "CREATE OR REPLACE FUNCTION public.financemeta_is_member()",
    );
    expect(migration).toContain("SECURITY DEFINER");
    expect(migration).toContain("SET search_path = ''");
    expect(migration).toContain("membership.user_id = (SELECT auth.uid())");
    expect(migration).toContain("membership.status = 'active'");
    expect(migration).toContain(
      "REVOKE ALL ON FUNCTION public.financemeta_is_member() FROM PUBLIC, anon",
    );
    expect(migration).toContain(
      "GRANT EXECUTE ON FUNCTION public.financemeta_is_member() TO authenticated",
    );
  });

  it("does not prematurely switch existing RLS or infer historical membership", () => {
    expect(migration).not.toMatch(/DROP\s+POLICY/i);
    expect(migration).not.toMatch(/CREATE\s+POLICY/i);
    expect(migration).not.toMatch(/UPDATE\s+public\.profiles/i);
    expect(migration).not.toMatch(/INSERT\s+INTO\s+public\.profiles/i);
    expect(migration).not.toMatch(/raw_user_meta_data|raw_app_meta_data/i);
    expect(migration).toContain(
      "VALUES ('20260922170000', 'explicit_membership_authority')",
    );
  });
});
