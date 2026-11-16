import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.FINANCEMETA_E2E_PORT ?? "4187";
const e2eOrigin = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  fullyParallel: true,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  maxFailures: process.env.CI ? 8 : undefined,
  reporter: [["list"], ["json", { outputFile: "test-results/browser-results.json" }]],
  use: {
    baseURL: e2eOrigin,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${e2ePort}`,
    url: e2eOrigin,
    reuseExistingServer: false,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    env: {
      VITE_SUPABASE_URL: "https://pnemeegkwyaicsbnbnmg.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_ci_browser_contract",
      VITE_AUTH_REDIRECT_ORIGIN: "https://finance4all-global-reach.vercel.app",
    },
  },
});
