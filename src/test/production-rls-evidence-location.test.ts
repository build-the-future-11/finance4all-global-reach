import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  ".github/workflows/production-rls-certification.yml",
  "utf8",
);

describe("production RLS evidence location", () => {
  it("keeps pre-checkout evidence outside the checkout-cleaned workspace", () => {
    const initializeIndex = workflow.indexOf(
      "- name: Initialize redacted certification evidence",
    );
    const checkoutIndex = workflow.indexOf("- name: Checkout exact source");
    const finalizeIndex = workflow.indexOf(
      "- name: Finalize redacted certification evidence",
    );
    const uploadIndex = workflow.indexOf("- name: Retain production RLS evidence");

    expect(initializeIndex).toBeGreaterThanOrEqual(0);
    expect(checkoutIndex).toBeGreaterThan(initializeIndex);
    expect(finalizeIndex).toBeGreaterThan(checkoutIndex);
    expect(uploadIndex).toBeGreaterThan(finalizeIndex);

    const preCheckout = workflow.slice(initializeIndex, checkoutIndex);
    expect(preCheckout).toContain('cd "$RUNNER_TEMP"');
    expect(preCheckout).toContain("mkdir -p production-rls-evidence");
    expect(preCheckout).toContain("> production-rls-evidence/preflight.txt");

    expect(workflow).toContain(
      'tee "$RUNNER_TEMP/production-rls-evidence/rls-certification.log"',
    );
    expect(workflow).toContain("if test -f production-rls-evidence/rls-certification.log");
    expect(workflow).toContain("production-rls-evidence/SHA256SUMS");
    expect(workflow).toContain(
      "path: ${{ runner.temp }}/production-rls-evidence",
    );
  });
});
