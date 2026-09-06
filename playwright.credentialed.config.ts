import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e-credentialed",
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_PORTAL_URL ?? "https://finance4all-global-reach.vercel.app",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
