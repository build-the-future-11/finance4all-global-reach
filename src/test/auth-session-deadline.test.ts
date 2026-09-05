import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const authContext = fs.readFileSync(
  path.resolve(process.cwd(), "src/contexts/AuthContext.tsx"),
  "utf8",
);

describe("FinanceMeta auth session deadline contract", () => {
  it("bounds the initial Supabase session probe so global loading cannot hang forever", () => {
    expect(authContext).toContain("const AUTH_SESSION_OPERATION_TIMEOUT_MS = 15_000;");
    expect(authContext).toContain(
      '() => supabase.auth.getSession(),\n      AUTH_SESSION_OPERATION_TIMEOUT_MS,\n      "Initial auth session fetch",',
    );
    expect(authContext).toContain('console.error("Initial auth session fetch failed:", error);');
    expect(authContext).toContain("setLoading(false);");
  });

  it("bounds remote sign-out without fabricating a local logout on timeout", () => {
    const signOutStart = authContext.indexOf("const signOut = useCallback");
    const updateStart = authContext.indexOf("const updateProfile = useCallback", signOutStart);
    expect(signOutStart).toBeGreaterThanOrEqual(0);
    expect(updateStart).toBeGreaterThan(signOutStart);

    const signOutSection = authContext.slice(signOutStart, updateStart);
    expect(signOutSection).toContain(
      '() => supabase.auth.signOut(),\n        AUTH_SESSION_OPERATION_TIMEOUT_MS,\n        "Sign out",',
    );
    expect(signOutSection).toContain("if (guard.isCurrent(token)) setLoading(false);");

    const deadlineCall = signOutSection.indexOf("await withDeadline(");
    const localClear = signOutSection.indexOf("setSession(null);");
    expect(deadlineCall).toBeGreaterThanOrEqual(0);
    expect(localClear).toBeGreaterThan(deadlineCall);
  });
});
