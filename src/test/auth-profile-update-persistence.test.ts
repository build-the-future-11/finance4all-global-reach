import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const authContext = fs.readFileSync(
  path.resolve(process.cwd(), "src/contexts/AuthContext.tsx"),
  "utf8",
);

describe("FinanceMeta profile update persistence contract", () => {
  it("requires the authenticated profile row to be returned before reporting success", () => {
    const updateStart = authContext.indexOf("const updateProfile = useCallback");
    const updateEnd = authContext.indexOf("const needsOnboarding", updateStart);
    expect(updateStart).toBeGreaterThanOrEqual(0);
    expect(updateEnd).toBeGreaterThan(updateStart);

    const updateSection = authContext.slice(updateStart, updateEnd);
    expect(updateSection).toContain('.eq("id", user.id)\n        .select("id")\n        .maybeSingle();');
    expect(updateSection).toContain("if (!error && !updatedRow)");
    expect(updateSection).toContain('const message = "Profile update did not persist to an authenticated profile row";');
    expect(updateSection).toContain("return { error: message };");
  });

  it("does not refresh local profile state until persistence has been proven", () => {
    const updateStart = authContext.indexOf("const updateProfile = useCallback");
    const updateEnd = authContext.indexOf("const needsOnboarding", updateStart);
    const updateSection = authContext.slice(updateStart, updateEnd);

    const missingRowGuard = updateSection.indexOf("if (!error && !updatedRow)");
    const refresh = updateSection.indexOf("const refreshed = await fetchProfile(user);");
    expect(missingRowGuard).toBeGreaterThanOrEqual(0);
    expect(refresh).toBeGreaterThan(missingRowGuard);
  });
});
