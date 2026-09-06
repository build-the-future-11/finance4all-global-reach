import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  FINANCEMETA_SUPABASE_HOST,
  assertFinanceMetaSupabaseProject,
  assertFinanceMetaSupabasePublicKey,
} from "@/lib/supabaseProjectContract";

const validatorPath = path.resolve(process.cwd(), "scripts/validate-public-env.mjs");

function syntheticJwt(role: string) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ role })}.synthetic-signature`;
}

function runValidator(url: string, nodeEnv: "production" | "development", key = syntheticJwt("anon")) {
  return spawnSync(process.execPath, [validatorPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      NODE_ENV: nodeEnv,
      VITE_SUPABASE_URL: url,
      VITE_SUPABASE_ANON_KEY: key,
      VITE_SUPABASE_PUBLISHABLE_KEY: "",
      VITE_AUTH_REDIRECT_ORIGIN: "https://finance4all-global-reach.vercel.app",
    },
  });
}

describe("FinanceMeta Supabase project contract", () => {
  it("accepts only the canonical https project in production runtime", () => {
    expect(() => assertFinanceMetaSupabaseProject(`https://${FINANCEMETA_SUPABASE_HOST}`, { allowLocal: false })).not.toThrow();
    expect(() => assertFinanceMetaSupabaseProject(`http://${FINANCEMETA_SUPABASE_HOST}`, { allowLocal: false })).toThrow(/must use https/i);
    expect(() => assertFinanceMetaSupabaseProject("https://foreign-project.supabase.co", { allowLocal: false })).toThrow(/foreign Supabase project/i);
  });

  it("fails closed when the production runtime has no Supabase URL", () => {
    expect(() => assertFinanceMetaSupabaseProject(undefined, { allowLocal: false })).toThrow(/required outside development/i);
    expect(() => assertFinanceMetaSupabaseProject(undefined, { allowLocal: true })).not.toThrow();
  });

  it("requires a real public Supabase key outside development", () => {
    expect(() => assertFinanceMetaSupabasePublicKey("sb_publishable_test_fixture", { allowLocal: false })).not.toThrow();
    expect(() => assertFinanceMetaSupabasePublicKey(syntheticJwt("anon"), { allowLocal: false })).not.toThrow();
    expect(() => assertFinanceMetaSupabasePublicKey(undefined, { allowLocal: false })).toThrow(/required outside development/i);
    expect(() => assertFinanceMetaSupabasePublicKey("public-anon-key", { allowLocal: false })).toThrow(/sb_publishable_ key or a legacy anon JWT/i);
    expect(() => assertFinanceMetaSupabasePublicKey(syntheticJwt("authenticated"), { allowLocal: false })).toThrow(/sb_publishable_ key or a legacy anon JWT/i);
  });

  it("rejects secret and service-role keys from the public client", () => {
    for (const key of ["sb_secret_test_fixture", syntheticJwt("service_role")]) {
      expect(() => assertFinanceMetaSupabasePublicKey(key, { allowLocal: false })).toThrow(/secret\/service-role key/i);
      expect(() => assertFinanceMetaSupabasePublicKey(key, { allowLocal: true })).toThrow(/secret\/service-role key/i);
    }
  });

  it("rejects production credentials, ports, paths, queries, and fragments", () => {
    const host = FINANCEMETA_SUPABASE_HOST;
    const cases = [
      [`https://user:pass@${host}`, /credentials/i],
      [`https://${host}:8443`, /default https port/i],
      [`https://${host}/rest`, /canonical project origin/i],
      [`https://${host}?tenant=other`, /canonical project origin/i],
      [`https://${host}#fragment`, /canonical project origin/i],
    ] as const;
    for (const [url, expected] of cases) expect(() => assertFinanceMetaSupabaseProject(url, { allowLocal: false })).toThrow(expected);
  });

  it("allows loopback only in development and rejects the port-0 fallback", () => {
    for (const url of ["http://localhost:54321", "http://127.0.0.1:54321", "http://[::1]:54321"]) {
      expect(() => assertFinanceMetaSupabaseProject(url, { allowLocal: true })).not.toThrow();
      expect(() => assertFinanceMetaSupabaseProject(url, { allowLocal: false })).toThrow(/only in development/i);
    }
    expect(() => assertFinanceMetaSupabaseProject("http://localhost:0", { allowLocal: true })).toThrow(/port-0 fallback/i);
  });

  it("build validator accepts the canonical production project", () => {
    const result = runValidator(`https://${FINANCEMETA_SUPABASE_HOST}`, "production");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Public Supabase configuration contract passed");
  });

  it("build validator rejects foreign, local-production, and noncanonical origins", () => {
    const foreign = runValidator("https://foreign-project.supabase.co", "production");
    expect(foreign.status).toBe(1);
    expect(foreign.stderr).toContain("must target the FinanceMeta Supabase project");
    const local = runValidator("http://127.0.0.1:54321", "production");
    expect(local.status).toBe(1);
    expect(local.stderr).toContain("only in development");
    for (const url of [`https://${FINANCEMETA_SUPABASE_HOST}:8443`, `https://${FINANCEMETA_SUPABASE_HOST}/rest`, `https://${FINANCEMETA_SUPABASE_HOST}?tenant=other`, `https://${FINANCEMETA_SUPABASE_HOST}#fragment`, `https://user:pass@${FINANCEMETA_SUPABASE_HOST}`]) {
      expect(runValidator(url, "production").status).toBe(1);
    }
  });

  it("build validator rejects secret/service-role and malformed public keys", () => {
    const url = `https://${FINANCEMETA_SUPABASE_HOST}`;
    for (const key of ["sb_secret_test_fixture", syntheticJwt("service_role")]) {
      const result = runValidator(url, "production", key);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("must not contain a secret/service-role key");
    }
    for (const key of ["public-anon-key", syntheticJwt("authenticated"), "sb_publishable_"]) {
      const result = runValidator(url, "production", key);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("must use an sb_publishable_ key or a legacy anon JWT");
    }
  });

  it("build validator preserves localhost development support", () => {
    for (const url of ["http://localhost:54321", "http://[::1]:54321"]) {
      expect(runValidator(url, "development", "local-test-key").status).toBe(0);
    }
  });
});
