import { describe, expect, it } from "vitest";
import { e2eAuthSkipReason, hasE2ECredentials } from "./e2eAuthCredentials";

describe("e2e auth credentials helper", () => {
  it("requires both email and password", () => {
    expect(hasE2ECredentials("", "")).toBe(false);
    expect(hasE2ECredentials("a@b.co", "")).toBe(false);
    expect(hasE2ECredentials("", "secret")).toBe(false);
    expect(hasE2ECredentials("a@b.co", "secret")).toBe(true);
  });

  it("documents skip reason", () => {
    expect(e2eAuthSkipReason()).toMatch(/E2E_EMAIL/);
  });
});
