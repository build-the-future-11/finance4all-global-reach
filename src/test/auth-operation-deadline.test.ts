import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const authContext = fs.readFileSync(
  path.resolve(process.cwd(), "src/contexts/AuthContext.tsx"),
  "utf8",
);

describe("FinanceMeta auth operation deadline contract", () => {
  it("bounds initial session bootstrap so global loading cannot hang forever", () => {
    expect(authContext).toContain("const AUTH_OPERATION_TIMEOUT_MS = 15_000;");
    expect(authContext).toContain("() => supabase.auth.getSession()");
    expect(authContext).toContain('"Initial auth session fetch"');
    expect(authContext).toContain(".finally(() => setLoading(false));");
  });

  it("bounds sign-in, sign-up, and OAuth bootstrap without fabricating local state", () => {
    expect(authContext).toContain("() => supabase.auth.signInWithPassword({ email, password })");
    expect(authContext).toContain('"Sign in"');
    expect(authContext).toContain("supabase.auth.signUp({");
    expect(authContext).toContain('"Sign up"');
    expect(authContext).toContain("supabase.auth.signInWithOAuth({");
    expect(authContext).toContain('"Google sign in"');

    const signInStart = authContext.indexOf("const signIn = useCallback");
    const signUpStart = authContext.indexOf("const signUp = useCallback", signInStart);
    const signInSection = authContext.slice(signInStart, signUpStart);
    expect(signInSection).not.toContain("setSession(");
    expect(signInSection).not.toContain("setProfile(");
  });

  it("does not clear local profile when remote sign-out errors or times out", () => {
    const signOutStart = authContext.indexOf("const signOut = useCallback");
    const updateStart = authContext.indexOf("const updateProfile = useCallback", signOutStart);
    const signOutSection = authContext.slice(signOutStart, updateStart);

    const deadlineCall = signOutSection.indexOf("await withDeadline(");
    const errorGuard = signOutSection.indexOf("if (error) {");
    const localClear = signOutSection.indexOf("setProfile(null);");
    expect(deadlineCall).toBeGreaterThanOrEqual(0);
    expect(errorGuard).toBeGreaterThan(deadlineCall);
    expect(localClear).toBeGreaterThan(errorGuard);
    expect(signOutSection).toContain('"Sign out"');
  });

  it("bounds profile persistence before reporting successful write truth", () => {
    const updateStart = authContext.indexOf("const updateProfile = useCallback");
    const onboardingStart = authContext.indexOf("const needsOnboarding", updateStart);
    const updateSection = authContext.slice(updateStart, onboardingStart);

    expect(updateSection).toContain("await withDeadline(");
    expect(updateSection).toContain('.update(payload).eq("id", session.user.id)');
    expect(updateSection).toContain('"Profile update"');
    expect(updateSection).toContain("if (!error) await fetchProfile(session.user);");
  });
});
