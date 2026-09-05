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

  it("bounds credential sign-in transport without fabricating auth state on timeout", () => {
    const signInStart = authContext.indexOf("const signIn = useCallback");
    const signUpStart = authContext.indexOf("const signUp = useCallback", signInStart);
    const signInSection = authContext.slice(signInStart, signUpStart);

    expect(signInSection).toContain("await withDeadline(");
    expect(signInSection).toContain("() => supabase.auth.signInWithPassword({ email, password })");
    expect(signInSection).toContain("AUTH_SESSION_OPERATION_TIMEOUT_MS");
    expect(signInSection).toContain('"Sign in"');
    expect(signInSection).toContain("} catch (error) {");
    expect(signInSection).toContain("Sign in failed. Please try again.");
    expect(signInSection).not.toContain("setSession(");
    expect(signInSection).not.toContain("setProfile(");
  });

  it("bounds credential sign-up transport without fabricating auth state on timeout", () => {
    const signUpStart = authContext.indexOf("const signUp = useCallback");
    const googleStart = authContext.indexOf("const signInWithGoogle = useCallback", signUpStart);
    const signUpSection = authContext.slice(signUpStart, googleStart);

    expect(signUpSection).toContain("await withDeadline(");
    expect(signUpSection).toContain("supabase.auth.signUp({");
    expect(signUpSection).toContain("AUTH_SESSION_OPERATION_TIMEOUT_MS");
    expect(signUpSection).toContain('"Sign up"');
    expect(signUpSection).toContain("} catch (error) {");
    expect(signUpSection).toContain("Sign up failed. Please try again.");
    expect(signUpSection).not.toContain("setSession(");
    expect(signUpSection).not.toContain("setProfile(");
  });

  it("bounds Google OAuth bootstrap without manufacturing local session state", () => {
    const googleStart = authContext.indexOf("const signInWithGoogle = useCallback");
    const signOutStart = authContext.indexOf("const signOut = useCallback", googleStart);
    const googleSection = authContext.slice(googleStart, signOutStart);

    expect(googleSection).toContain("await withDeadline(");
    expect(googleSection).toContain("supabase.auth.signInWithOAuth({");
    expect(googleSection).toContain("AUTH_SESSION_OPERATION_TIMEOUT_MS");
    expect(googleSection).toContain('"Google sign in"');
    expect(googleSection).toContain("} catch (error) {");
    expect(googleSection).toContain("Google sign in failed. Please try again.");
    expect(googleSection).not.toContain("setSession(");
    expect(googleSection).not.toContain("setProfile(");
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
