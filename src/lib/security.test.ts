import { describe, it, expect } from "vitest";
import {
  assessPassword,
  isPasswordAcceptable,
  isValidEmail,
  sanitizeDisplayName,
} from "@/lib/security";
import { computeMemberBadges } from "@/lib/badges";
import { formatAuthError } from "@/lib/authErrors";

describe("security", () => {
  it("validates email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("bad")).toBe(false);
  });

  it("assesses password strength", () => {
    const weak = assessPassword("abc");
    expect(weak.strength).toBe("weak");
    const strong = assessPassword("Finance4All2026!");
    expect(strong.strength).toBe("strong");
  });

  it("requires acceptable passwords", () => {
    expect(isPasswordAcceptable("short1")).toBe(false);
    expect(isPasswordAcceptable("longpassword1")).toBe(true);
  });

  it("sanitizes display names", () => {
    expect(sanitizeDisplayName("  Ryan   Doe  ")).toBe("Ryan Doe");
  });
});

describe("authErrors", () => {
  it("maps invalid credentials", () => {
    expect(formatAuthError("Invalid login credentials")).toContain("Incorrect email or password");
  });
});

describe("badges", () => {
  const profile = {
    id: "00000000-0000-4000-8000-000000000001",
    displayName: "Test User",
    email: "test@example.com",
    role: "member" as const,
    interests: ["macro"],
    openToCollaborate: true,
    chapterId: "00000000-0000-4000-8000-000000000002",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("awards member and chapter badges", () => {
    const badges = computeMemberBadges(profile, {
      connections: 2,
      savedArticles: 5,
      savedProjects: 1,
      labApplications: 0,
      eventsRegistered: 1,
    });
    expect(badges.find((b) => b.id === "founding")?.earned).toBe(true);
    expect(badges.find((b) => b.id === "chapter")?.earned).toBe(true);
    expect(badges.find((b) => b.id === "reader")?.earned).toBe(true);
  });
});
