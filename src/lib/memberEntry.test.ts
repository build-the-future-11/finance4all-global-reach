import { describe, expect, it } from "vitest";
import { loginWithNext, signupWithNext } from "@/lib/memberEntry";

describe("memberEntry", () => {
  it("encodes portal return paths on signup", () => {
    expect(signupWithNext("/portal/labs")).toBe("/signup?next=%2Fportal%2Flabs");
  });

  it("encodes login return paths", () => {
    expect(loginWithNext("/portal/events")).toBe("/login?next=%2Fportal%2Fevents");
  });
});
