import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const authContext = fs.readFileSync(
  path.resolve(process.cwd(), "src/contexts/AuthContext.tsx"),
  "utf8",
);

describe("FinanceMeta profile creation race recovery", () => {
  it("recovers only a duplicate-key insert race by re-reading the canonical profile row", () => {
    const ensureStart = authContext.indexOf("const ensureProfile = useCallback");
    const ensureEnd = authContext.indexOf("const fetchProfile = useCallback", ensureStart);
    expect(ensureStart).toBeGreaterThanOrEqual(0);
    expect(ensureEnd).toBeGreaterThan(ensureStart);

    const ensureSection = authContext.slice(ensureStart, ensureEnd);
    expect(ensureSection).toContain('if (error.code === "23505")');
    expect(ensureSection).toContain("const { data: concurrentExisting, error: concurrentReadError } = await supabase");
    expect(ensureSection).toContain(".select(PUBLIC_PROFILE_COLUMNS)");
    expect(ensureSection).toContain('console.error("Profile race recovery failed:", concurrentReadError.message);');
    expect(ensureSection).toContain("if (concurrentExisting) return mapProfile(concurrentExisting);");

    const duplicateRecovery = ensureSection.indexOf('if (error.code === "23505")');
    const genericFailure = ensureSection.indexOf('console.error("Profile ensure failed:", error.message);');
    expect(duplicateRecovery).toBeGreaterThanOrEqual(0);
    expect(genericFailure).toBeGreaterThan(duplicateRecovery);
  });

  it("keeps lookup and non-duplicate insert failures fail-closed", () => {
    const ensureStart = authContext.indexOf("const ensureProfile = useCallback");
    const ensureEnd = authContext.indexOf("const fetchProfile = useCallback", ensureStart);
    const ensureSection = authContext.slice(ensureStart, ensureEnd);

    expect(ensureSection).toContain('console.error("Profile lookup failed:", existingError.message);\n      return null;');
    expect(ensureSection).toContain('console.error("Profile ensure failed:", error.message);\n      return null;');
    expect(ensureSection).not.toContain("if (error) return mapProfile");
  });
});
