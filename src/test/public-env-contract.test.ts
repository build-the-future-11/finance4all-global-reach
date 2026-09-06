import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const script = "scripts/validate-public-env.mjs";
const validEnv = {
  ...process.env,
  NODE_ENV: "production",
  VITE_SUPABASE_URL: "https://pnemeegkwyaicsbnbnmg.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_ci_contract_fixture",
  VITE_SUPABASE_ANON_KEY: "",
  VITE_AUTH_REDIRECT_ORIGIN: "https://finance4all-global-reach.vercel.app",
};

describe("public environment contract", () => {
  it("accepts the canonical FinanceMeta Supabase project", () => {
    const result = spawnSync(process.execPath, [script], { env: validEnv, encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
  }, 15_000);

  it("rejects the VertexED Supabase project", () => {
    const result = spawnSync(process.execPath, [script], {
      env: {
        ...validEnv,
        VITE_SUPABASE_URL: "https://xwlrzgfuhfbckgvcmyoq.supabase.co",
      },
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("canonical FinanceMeta project");
  }, 15_000);
});
