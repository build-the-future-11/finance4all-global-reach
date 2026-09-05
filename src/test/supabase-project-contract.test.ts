import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  FINANCEMETA_SUPABASE_HOST,
  assertFinanceMetaSupabaseProject,
} from "@/lib/supabaseProjectContract";

const validatorPath = path.resolve(process.cwd(), "scripts/validate-public-env.mjs");

function runValidator(url: string, nodeEnv: "production" | "development") {
  return spawnSync(process.execPath, [validatorPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      NODE_ENV: nodeEnv,
      VITE_SUPABASE_URL: url,
      VITE_SUPABASE_ANON_KEY: "test-public-key",
      VITE_SUPABASE_PUBLISHABLE_KEY: "",
    },
  });
}

describe("FinanceMeta Supabase project contract", () => {
  it("accepts only the canonical https project in production runtime", () => {
    expect(() =>
      assertFinanceMetaSupabaseProject(`https://${FINANCEMETA_SUPABASE_HOST}`, {
        allowLocal: false,
      }),
    ).not.toThrow();

    expect(() =>
      assertFinanceMetaSupabaseProject(`http://${FINANCEMETA_SUPABASE_HOST}`, {
        allowLocal: false,
      }),
    ).toThrow(/must use https/i);

    expect(() =>
      assertFinanceMetaSupabaseProject("https://foreign-project.supabase.co", {
        allowLocal: false,
      }),
    ).toThrow(/foreign Supabase project/i);
  });

  it("allows loopback only for development and rejects the old port-0 fallback", () => {
    for (const url of [
      "http://localhost:54321",
      "http://127.0.0.1:54321",
      "http://[::1]:54321",
    ]) {
      expect(() =>
        assertFinanceMetaSupabaseProject(url, { allowLocal: true }),
      ).not.toThrow();
      expect(() =>
        assertFinanceMetaSupabaseProject(url, { allowLocal: false }),
      ).toThrow(/only in development/i);
    }

    expect(() =>
      assertFinanceMetaSupabaseProject("http://localhost:0", { allowLocal: true }),
    ).toThrow(/port-0 fallback/i);
  });

  it("fails closed on malformed runtime URLs", () => {
    expect(() =>
      assertFinanceMetaSupabaseProject("not-a-url", { allowLocal: false }),
    ).toThrow(/valid absolute URL/i);
  });

  it("build validator accepts the canonical production project", () => {
    const result = runValidator(`https://${FINANCEMETA_SUPABASE_HOST}`, "production");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Public Supabase configuration contract passed");
  });

  it("build validator rejects foreign and production-local targets", () => {
    const foreign = runValidator("https://foreign-project.supabase.co", "production");
    expect(foreign.status).toBe(1);
    expect(foreign.stderr).toContain("must target the FinanceMeta Supabase project");

    const local = runValidator("http://127.0.0.1:54321", "production");
    expect(local.status).toBe(1);
    expect(local.stderr).toContain("only in development");
  });

  it("build validator preserves localhost development support including IPv6", () => {
    for (const url of ["http://localhost:54321", "http://[::1]:54321"]) {
      const result = runValidator(url, "development");
      expect(result.status).toBe(0);
    }
  });
});
