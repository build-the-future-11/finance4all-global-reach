import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

const DEBUG_LOG = join(process.cwd(), ".cursor/debug-ad3bfc.log");

function coerceHttpsAppUrl(raw: string | undefined, fallback: string): string {
  const v = raw?.trim();
  return v?.startsWith("https://") ? v : fallback;
}

function coerceSupabaseUrl(raw: string | undefined, fallback: string): string {
  const v = raw?.trim();
  return v?.startsWith("https://") && v.includes("supabase.co") ? v : fallback;
}

function coerceAnonKey(raw: string | undefined, fallback: string): string {
  const v = raw?.trim();
  return v?.startsWith("eyJ") ? v : fallback;
}

const CI_APP = "https://ci-placeholder.vercel.app";
const CI_SUPABASE = "https://ci-placeholder.supabase.co";
const CI_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpLXBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.ci-placeholder-signature-for-build-only";

const resolvedAppUrl = coerceHttpsAppUrl(process.env.VITE_APP_URL, CI_APP);
const resolvedSupabaseUrl = coerceSupabaseUrl(process.env.VITE_SUPABASE_URL, CI_SUPABASE);
const resolvedAnonKey = coerceAnonKey(process.env.VITE_SUPABASE_ANON_KEY, CI_ANON);

// #region agent log
try {
  mkdirSync(dirname(DEBUG_LOG), { recursive: true });
  appendFileSync(
    DEBUG_LOG,
    JSON.stringify({
      sessionId: "ad3bfc",
      hypothesisId: "H-empty-or-http-app-url",
      location: "playwright.config.ts:env-coerce",
      message: "CI webServer Vite env resolution",
      data: {
        rawAppUrlLen: process.env.VITE_APP_URL?.length ?? null,
        rawAppStartsHttps: process.env.VITE_APP_URL?.trim().startsWith("https://") ?? null,
        resolvedAppStartsHttps: resolvedAppUrl.startsWith("https://"),
        resolvedSupabaseOk: resolvedSupabaseUrl.includes("supabase.co"),
        resolvedAnonOk: resolvedAnonKey.startsWith("eyJ"),
        ci: Boolean(process.env.CI),
      },
      timestamp: Date.now(),
      runId: "pre-fix",
    }) + "\n",
  );
} catch {
  /* ignore debug log failures */
}
// #endregion

const ciBuildEnv = {
  ...process.env,
  VITE_SUPABASE_URL: resolvedSupabaseUrl,
  VITE_SUPABASE_ANON_KEY: resolvedAnonKey,
  VITE_APP_URL: resolvedAppUrl,
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.CI
    ? {
        command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: false,
        timeout: 120_000,
        env: ciBuildEnv,
      }
    : undefined,
});
