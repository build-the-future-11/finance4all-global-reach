import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("supabase config", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports configured when env vars are valid", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiJ9.test");
    const { isSupabaseConfigured } = await import("@/lib/supabase");
    expect(isSupabaseConfigured).toBe(true);
  });

  it("reports unconfigured when env vars are missing", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
    const { isSupabaseConfigured } = await import("@/lib/supabase");
    expect(isSupabaseConfigured).toBe(false);
  });
});
