import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  FINANCEMETA_SUPABASE_HOST,
  assertFinanceMetaSupabasePublicKey,
} from "@/lib/supabaseProjectContract";

const validatorPath = path.resolve(process.cwd(), "scripts/validate-public-env.mjs");

function syntheticJwt(role: string) {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ role })}.synthetic-signature`;
}

describe("FinanceMeta public Supabase JWT role boundary", () => {
  it("rejects non-anon legacy JWT roles even in development runtime", () => {
    for (const role of ["authenticated", "postgres", "supabase_admin"]) {
      expect(() =>
        assertFinanceMetaSupabasePublicKey(syntheticJwt(role), { allowLocal: true }),
      ).toThrow(/sb_publishable_ key or a legacy anon JWT/i);
    }

    expect(() =>
      assertFinanceMetaSupabasePublicKey(syntheticJwt("anon"), { allowLocal: true }),
    ).not.toThrow();
  });

  it("mirrors the same role boundary in the development build validator", () => {
    const result = spawnSync(process.execPath, [validatorPath], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        NODE_ENV: "development",
        VITE_SUPABASE_URL: `https://${FINANCEMETA_SUPABASE_HOST}`,
        VITE_SUPABASE_ANON_KEY: syntheticJwt("authenticated"),
        VITE_SUPABASE_PUBLISHABLE_KEY: "",
      },
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("must use an sb_publishable_ key or a legacy anon JWT");
  });
});
