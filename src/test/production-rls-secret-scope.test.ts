import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  ".github/workflows/production-rls-certification.yml",
  "utf8",
);

const secretBinding =
  "FINANCEMETA_DATABASE_URL: ${{ secrets.FINANCEMETA_DATABASE_URL }}";

describe("production RLS workflow secret scope", () => {
  it("exposes the production database URL only to the two database steps", () => {
    const occurrences = [...workflow.matchAll(new RegExp(secretBinding.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))]
      .map((match) => match.index ?? -1);

    const targetValidation = workflow.indexOf(
      "- name: Require the canonical FinanceMeta database connection",
    );
    const clientCheck = workflow.indexOf("- name: Verify PostgreSQL client");
    const authorizationMatrix = workflow.indexOf(
      "- name: Run rollback-only two-identity authorization matrix",
    );
    const evidenceUpload = workflow.indexOf("- name: Retain production RLS evidence");

    expect(occurrences).toHaveLength(2);
    expect(targetValidation).toBeGreaterThanOrEqual(0);
    expect(clientCheck).toBeGreaterThan(targetValidation);
    expect(authorizationMatrix).toBeGreaterThan(clientCheck);
    expect(evidenceUpload).toBeGreaterThan(authorizationMatrix);

    expect(occurrences[0]).toBeGreaterThan(targetValidation);
    expect(occurrences[0]).toBeLessThan(clientCheck);
    expect(occurrences[1]).toBeGreaterThan(authorizationMatrix);
    expect(occurrences[1]).toBeLessThan(evidenceUpload);
  });
});
