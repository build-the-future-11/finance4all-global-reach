import { beforeEach, describe, expect, it } from "vitest";
import {
  readAuthCallbackError,
  rememberPostAuthPath,
  sanitizePostAuthPath,
  takePostAuthPath,
} from "@/lib/auth-navigation";

describe("post-auth navigation", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("preserves an internal portal destination through OAuth", () => {
    rememberPostAuthPath("/portal/labs/review?queue=pending");
    expect(takePostAuthPath()).toBe("/portal/labs/review?queue=pending");
    expect(takePostAuthPath()).toBe("/portal");
  });

  it("rejects external and public return destinations", () => {
    expect(sanitizePostAuthPath("https://example.com/portal")).toBe("/portal");
    expect(sanitizePostAuthPath("//example.com/portal")).toBe("/portal");
    expect(sanitizePostAuthPath("/signup")).toBe("/portal");
  });
});

describe("auth callback errors", () => {
  it("reads OAuth errors from query strings and fragments", () => {
    expect(readAuthCallbackError("", "#error=access_denied&error_description=User+cancelled"))
      .toEqual({ code: "access_denied", message: "User cancelled" });
  });

  it("turns disabled signup into a useful member message", () => {
    expect(readAuthCallbackError("?error_code=signup_disabled", "")?.message)
      .toContain("signup is currently closed");
  });
});
