import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  ".github/workflows/production-rls-certification.yml",
  "utf8",
);

describe("production RLS dispatch scope", () => {
  it("refuses to expose production certification secrets on non-main refs", () => {
    const jobIndex = workflow.indexOf("two-identity-rls:");
    const mainGuardIndex = workflow.indexOf(
      "if: github.ref == 'refs/heads/main'",
    );
    const firstSecretIndex = workflow.indexOf(
      "FINANCEMETA_DATABASE_URL: ${{ secrets.FINANCEMETA_DATABASE_URL }}",
    );

    expect(jobIndex).toBeGreaterThanOrEqual(0);
    expect(mainGuardIndex).toBeGreaterThan(jobIndex);
    expect(firstSecretIndex).toBeGreaterThan(mainGuardIndex);
    expect(workflow.match(/if: github\.ref == 'refs\/heads\/main'/g)).toHaveLength(1);
  });
});
