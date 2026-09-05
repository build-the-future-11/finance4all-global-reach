import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  FINANCEMETA_SUPABASE_HOST,
  assertFinanceMetaSupabaseProject,
  assertFinanceMetaSupabasePublicKey,
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

  it("fails closed when the production runtime has no Supabase URL", () => {
    expect(() =>
      assertFinanceMetaSupabaseProject(undefined, { allowLocal: false }),
    ).toThrow(/required outside development/i);
    expect(() =>
      assertFinanceMetaSupabaseProject("", { allowLocal: false }),
    ).toThrow(/required outside development/i);

    expect(() =>
      assertFinanceMetaSupabaseProject(undefined, { allowLocal: true }),
    ).not.toThrow();
  });

  it("requires a real public Supabase key outside development", () => {
    expect(() =>
      assertFinanceMetaSupabasePublicKey("public-anon-key", { allowLocal: false }),
    ).not.toThrow();
    expect(() =>
      assertFinanceMetaSupabasePublicKey(undefined, { allowLocal: false }),
    ).toThrow(/required outside development/i);
    expect(() =>
      assertFinanceMetaSupabasePublicKey("", { allowLocal: false }),
    ).toThrow(/required outside development/i);
    expect(() =>
      assertFinanceMetaSupabasePublicKey("missing-key", { allowLocal: false }),
    ).toThrow(/missing-key fallback/i);

    expect(() =>
      assertFinanceMetaSupabasePublicKey(undefined, { allowLocal: true }),
    ).not.toThrow();
  });

  it("rejects production credentials, custom ports, paths, queries, and fragments", () => {
    const host = FINANCEMETA_SUPABASE_HOST;
    const cases = [
      [`https://user:pass@${host}`, /credentials/i],
      [`https://${host}:8443`, /default https port/i],
      [`https://${host}/rest`, /canonical project origin/i],
      [`https://${host}?tenant=other`, /canonical project origin/i],
      [`https://${host}#fragment`, /canonical project origin/i],
    ] as const;

    for (const [url, expected] of cases) {
      expect(() =>
        assertFinanceMetaSupabaseProject(url, { allowLocal: false }),
      ).toThrow(expected);
    }
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

  it("build validator rejects foreign, production-local, and noncanonical origins", () => {
    const foreign = runValidator("https://foreign-project.supabase.co", "production");
    expect(foreign.status).toBe(1);
    expect(foreign.stderr).toContain("must target the FinanceMeta Supabase project");

    const local = runValidator("http://127.0.0.1:54321", "production");
    expect(local.status).toBe(1);
    expect(local.stderr).toContain("only in development");

    for (const url of [
      `https://${FINANCEMETA_SUPABASE_HOST}:8443`,
      `https://${FINANCEMETA_SUPABASE_HOST}/rest`,
      `https://${FINANCEMETA_SUPABASE_HOST}?tenant=other`,
      `https://${FINANCEMETA_SUPABASE_HOST}#fragment`,
      `https://user:pass@${FINANCEMETA_SUPABASE_HOST}`,
    ]) {
      expect(runValidator(url, "production").status).toBe(1);
    }
  });

  it("build validator preserves localhost development support including IPv6", () => {
    for (const url of ["http://localhost:54321", "http://[::1]:54321"]) {
      const result = runValidator(url, "development");
      expect(result.status).toBe(0);
    }
  });
});
