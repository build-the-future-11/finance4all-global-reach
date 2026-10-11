import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./public-qa", timeout: 60_000, workers: 2, retries: 0, fullyParallel: true,
  reporter: [["list"], ["json", { outputFile: "public-qa-results/results.json" }]],
  outputDir: "public-qa-results/artifacts",
  use: { trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", grep: /@critical/, use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", grep: /@critical/, use: { ...devices["Desktop Safari"] } },
  ],
});
