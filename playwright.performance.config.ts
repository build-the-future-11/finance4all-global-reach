import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./performance", timeout: 120_000, workers: 1, retries: 0,
  reporter: [["list"], ["json", { outputFile: "performance-results/results.json" }]],
  outputDir: "performance-results/artifacts",
  use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:4190", trace: "retain-on-failure" },
  webServer: { command: "npm run preview -- --host 127.0.0.1 --port 4190", url: "http://127.0.0.1:4190", reuseExistingServer: false },
});
