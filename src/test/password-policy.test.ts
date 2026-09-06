import { describe, expect, it } from "vitest";
import {
  getPasswordValidationError,
  MIN_PASSWORD_LENGTH,
  PASSWORD_REQUIREMENT,
} from "@/lib/password-policy";

describe("password policy", () => {
  it("matches the hosted minimum length", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(10);
    expect(getPasswordValidationError("123456789")).toBe(PASSWORD_REQUIREMENT);
    expect(getPasswordValidationError("1234567890")).toBeNull();
  });
});
