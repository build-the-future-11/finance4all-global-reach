import { describe, it, expect } from "vitest";
import {
  assessPassword,
  isClientSafeSupabaseKey,
  isPasswordAcceptable,
  isValidEmail,
  isDisposableEmail,
  sanitizeTextInput,
  sanitizeDisplayName,
  sanitizeBio,
  sanitizeInterests,
  sanitizeSearchQuery,
  sanitizeUrl,
  safeInternalPath,
  sanitizeTags,
  sanitizeOptionalUrl,
  checkLoginRateLimit,
  recordLoginAttempt,
  clearLoginAttempts,
  checkContactRateLimit,
  recordContactSubmission,
} from "@/lib/security";
import { computeMemberBadges } from "@/lib/badges";
import { formatAuthError } from "@/lib/authErrors";
import { searchGlossary } from "@/lib/glossarySearch";

describe("security", () => {
  it("validates email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("bad")).toBe(false);
    expect(isValidEmail("user@mailinator.com")).toBe(false);
  });

  it("blocks disposable email domains", () => {
    expect(isDisposableEmail("user@mailinator.com")).toBe(true);
    expect(isDisposableEmail("user@example.com")).toBe(false);
  });

  it("sanitizes text input for admin forms", () => {
    expect(sanitizeTextInput("  Hello <b>world</b>  ")).toBe("Hello world");
    expect(sanitizeTextInput("a".repeat(600)).length).toBe(500);
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

  it("sanitizes bio HTML and control characters", () => {
    expect(sanitizeBio("  Hello <script>x</script>  ")).toBe("Hello x");
  });

  it("sanitizes display names", () => {
    expect(sanitizeDisplayName("  Ryan   Doe  ")).toBe("Ryan Doe");
    expect(sanitizeDisplayName("<b>Eve</b>")).toBe("Eve");
  });

  it("blocks unsafe markdown URLs", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeUrl("https://example.com/path")).toBe("https://example.com/path");
    expect(sanitizeUrl("/portal/education")).toBe("/portal/education");
  });

  it("sanitizes search queries", () => {
    expect(sanitizeSearchQuery("  IPO  ")).toBe("IPO");
    expect(sanitizeSearchQuery("a".repeat(100)).length).toBe(80);
  });

  it("rejects secret supabase keys in client", () => {
    expect(isClientSafeSupabaseKey("eyJhbGciOiJIUzI1NiJ9.test")).toBe(true);
    expect(isClientSafeSupabaseKey("sb_secret_abc")).toBe(false);
  });

  it("blocks open redirect paths", () => {
    expect(safeInternalPath("/portal/debriefed")).toBe("/portal/debriefed");
    expect(safeInternalPath("https://evil.com")).toBe("/portal");
    expect(safeInternalPath("//evil.com")).toBe("/portal");
  });

  it("blocks encoded open redirect paths", () => {
    expect(safeInternalPath("%2F%2Fevil.com")).toBe("/portal");
    expect(safeInternalPath("/portal\\admin")).toBe("/portal");
  });

  it("sanitizes interests", () => {
    expect(sanitizeInterests(["Macro", "macro", "  equities  ", "bad@tag"])).toEqual([
      "macro",
      "equities",
    ]);
  });

  it("sanitizes admin tags", () => {
    expect(sanitizeTags("Macro, macro, IPO, bad@tag")).toEqual(["macro", "ipo"]);
  });

  it("sanitizes optional URLs", () => {
    expect(sanitizeOptionalUrl("javascript:alert(1)")).toBeUndefined();
    expect(sanitizeOptionalUrl("https://example.com")).toBe("https://example.com/");
    expect(sanitizeOptionalUrl("")).toBeUndefined();
  });

  it("rate limits contact submissions per email", () => {
    localStorage.clear();
    const email = "contact@example.com";
    expect(checkContactRateLimit(email).allowed).toBe(true);
    recordContactSubmission(email);
    recordContactSubmission(email);
    recordContactSubmission(email);
    expect(checkContactRateLimit(email).allowed).toBe(false);
  });

  it("rate limits login attempts per email", () => {
    localStorage.clear();
    const email = "user@example.com";
    expect(checkLoginRateLimit(email).allowed).toBe(true);
    for (let i = 0; i < 8; i++) recordLoginAttempt(email);
    const locked = checkLoginRateLimit(email);
    expect(locked.allowed).toBe(false);
    clearLoginAttempts(email);
    expect(checkLoginRateLimit(email).allowed).toBe(true);
  });
});

describe("authErrors", () => {
  it("maps invalid credentials", () => {
    expect(formatAuthError("Invalid login credentials")).toContain("Incorrect email or password");
  });
});

describe("glossarySearch", () => {
  it("finds explainer matches for IPO queries", () => {
    const results = searchGlossary("IPO", [
      {
        title: "What is an IPO?",
        summary: "How companies go public and sell shares.",
        body: "An initial public offering lets a private company list on a stock exchange.",
        slug: "what-is-an-ipo",
      },
    ]);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title.toLowerCase()).toContain("ipo");
    expect(results[0].href).toContain("what-is-an-ipo");
  });

  it("returns empty results for short queries", () => {
    expect(searchGlossary("a", [])).toEqual([]);
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

describe("personalization", () => {
  it("greets by time of day and finds shared interests", async () => {
    const { timeGreeting, sharedInterests } = await import("@/lib/personalization");
    expect(timeGreeting(new Date("2026-01-01T09:00:00"))).toBe("Good morning");
    expect(timeGreeting(new Date("2026-01-01T15:00:00"))).toBe("Good afternoon");
    expect(sharedInterests(["macro", "fintech"], ["Macro", "equities"])).toEqual(["macro"]);
  });
});
