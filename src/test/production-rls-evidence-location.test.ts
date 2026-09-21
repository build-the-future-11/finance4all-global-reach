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
    expect(preCheckout).toContain(
      "EVIDENCE_DIR: ${{ runner.temp }}/production-rls-evidence",
    );
    expect(preCheckout).toContain('mkdir -p "$EVIDENCE_DIR"');
    expect(preCheckout).toContain('> "$EVIDENCE_DIR/preflight.txt"');
    expect(preCheckout).not.toContain("mkdir -p production-rls-evidence");
    expect(preCheckout).not.toContain("> production-rls-evidence/preflight.txt");

    expect(workflow).toContain('tee "$EVIDENCE_DIR/rls-certification.log"');
    expect(workflow).toContain('test -f "$EVIDENCE_DIR/preflight.txt"');
    expect(workflow).toContain('> "$EVIDENCE_DIR/SHA256SUMS"');
    expect(workflow).toContain(
      "path: ${{ runner.temp }}/production-rls-evidence",
    );
  });
});
