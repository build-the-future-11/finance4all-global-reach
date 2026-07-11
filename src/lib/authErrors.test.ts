import { describe, it, expect } from "vitest";
import { formatAuthError, sanitizeUserFacingError } from "@/lib/authErrors";

describe("authErrors", () => {
  it("maps invalid credentials", () => {
    expect(formatAuthError("Invalid login credentials")).toContain("Incorrect email or password");
  });

  it("sanitizes unknown auth errors", () => {
    expect(formatAuthError("JWT expired")).toBe("Something went wrong. Please try again.");
    expect(formatAuthError("Invalid login credentials")).toContain("Incorrect email or password");
  });

  it("maps rate limit errors", () => {
    expect(formatAuthError("Email rate limit exceeded")).toContain("Too many attempts");
  });

  it("strips internal database errors from user-facing messages", () => {
    expect(sanitizeUserFacingError("new row violates row-level security policy")).toBe(
      "Something went wrong. Please try again.",
    );
    expect(sanitizeUserFacingError("JWT expired")).toBe("Something went wrong. Please try again.");
  });

  it("preserves safe application errors", () => {
    expect(sanitizeUserFacingError("Enter a valid email address.")).toBe("Enter a valid email address.");
  });
});
