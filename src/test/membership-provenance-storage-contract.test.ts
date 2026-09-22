import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260922202000_canonical_membership_provenance_constraints.sql",
  "utf8",
);

describe("FinanceMeta membership provenance storage contract", () => {
  it("rejects non-canonical original and activation provenance at the table boundary", () => {
    expect(migration).toContain(
      "CONSTRAINT financemeta_memberships_source_canonical_check",
    );
    expect(migration).toContain(
      "CONSTRAINT financemeta_memberships_last_activation_source_canonical_check",
    );
    expect(
      migration.match(/\^\[\[:space:\]\]\+\|\[\[:space:\]\]\+\$/g),
    ).toHaveLength(2);
    expect(migration).toContain(
      "source = pg_catalog.regexp_replace(",
    );
    expect(migration).toContain(
      "last_activation_source = pg_catalog.regexp_replace(",
    );
    expect(migration).not.toContain("pg_catalog.btrim(");
  });

  it("registers the storage hardening as an ordered repository migration", () => {
    expect(migration).toContain(
      "VALUES ('20260922202000', 'canonical_membership_provenance_constraints')",
    );
  });
});
