import { describe, expect, it } from "vitest";
import {
  coerceAnonKey,
  coerceHttpsAppUrl,
  coerceSupabaseUrl,
  resolveCiViteEnv,
  CI_VITE_PLACEHOLDERS,
} from "@/lib/ciViteEnv";

describe("ciViteEnv coerce", () => {
  it("replaces http localhost app URL with https fallback", () => {
    expect(coerceHttpsAppUrl("http://localhost:8080", CI_VITE_PLACEHOLDERS.appUrl)).toBe(
      CI_VITE_PLACEHOLDERS.appUrl,
    );
  });

  it("keeps valid https app URL", () => {
    expect(coerceHttpsAppUrl("https://finance4all.example", "fallback")).toBe(
      "https://finance4all.example",
    );
  });

  it("rejects empty or non-supabase URLs", () => {
    expect(coerceSupabaseUrl("", CI_VITE_PLACEHOLDERS.supabaseUrl)).toBe(
      CI_VITE_PLACEHOLDERS.supabaseUrl,
    );
    expect(coerceSupabaseUrl("https://example.com", CI_VITE_PLACEHOLDERS.supabaseUrl)).toBe(
      CI_VITE_PLACEHOLDERS.supabaseUrl,
    );
  });

  it("rejects non-JWT anon keys", () => {
    expect(coerceAnonKey("not-a-jwt", CI_VITE_PLACEHOLDERS.anonKey)).toBe(
      CI_VITE_PLACEHOLDERS.anonKey,
    );
  });

  it("resolveCiViteEnv coerces mixed local env", () => {
    const resolved = resolveCiViteEnv({
      VITE_APP_URL: "http://localhost:8080",
      VITE_SUPABASE_URL: "https://abc.supabase.co",
      VITE_SUPABASE_ANON_KEY: CI_VITE_PLACEHOLDERS.anonKey,
    });
    expect(resolved.VITE_APP_URL).toBe(CI_VITE_PLACEHOLDERS.appUrl);
    expect(resolved.VITE_SUPABASE_URL).toBe("https://abc.supabase.co");
    expect(resolved.VITE_SUPABASE_ANON_KEY.startsWith("eyJ")).toBe(true);
  });
});
