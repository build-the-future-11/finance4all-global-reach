import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  ".github/workflows/production-rls-certification.yml",
  "utf8",
);

describe("production RLS dispatch scope", () => {
  it("fails non-main dispatch before any production secret-bearing job can start", () => {
    const preflightJobIndex = workflow.indexOf("validate-dispatch:");
    const targetRefIndex = workflow.indexOf("TARGET_REF: ${{ github.ref }}");
    const explicitMainCheckIndex = workflow.indexOf(
      'test "$TARGET_REF" != "refs/heads/main"',
    );
    const certificationJobIndex = workflow.indexOf("two-identity-rls:");
    const needsIndex = workflow.indexOf("needs: validate-dispatch");
    const firstSecretIndex = workflow.indexOf(
      "FINANCEMETA_DATABASE_URL: ${{ secrets.FINANCEMETA_DATABASE_URL }}",
    );

    expect(preflightJobIndex).toBeGreaterThanOrEqual(0);
    expect(targetRefIndex).toBeGreaterThan(preflightJobIndex);
    expect(explicitMainCheckIndex).toBeGreaterThan(targetRefIndex);
    expect(certificationJobIndex).toBeGreaterThan(explicitMainCheckIndex);
    expect(needsIndex).toBeGreaterThan(certificationJobIndex);
    expect(firstSecretIndex).toBeGreaterThan(needsIndex);
    expect(workflow).toContain("exit 1");
    expect(workflow).not.toContain("if: github.ref == 'refs/heads/main'");
  });
});
