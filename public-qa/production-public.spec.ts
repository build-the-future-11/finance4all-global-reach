import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

const inventory = JSON.parse(await readFile(new URL("./routes.json", import.meta.url), "utf8")) as { origin: string; revision: string; paths: string[] };
const critical = new Set(["/", "/learn", "/finance-for-all", "/projects", "/apply", "/privacy", "/signin"]);
test.beforeAll(async ({ request }) => {
  const response = await request.get(inventory.origin + "/release-revision.json");
  expect((await response.json()).revision).toBe(inventory.revision);
});
test.afterAll(async ({ request }) => {
  const response = await request.get(inventory.origin + "/release-revision.json");
  expect((await response.json()).revision).toBe(inventory.revision);
});
for (const path of inventory.paths) {
  test(`public ${path}${critical.has(path) ? " @critical" : ""}`, async ({ page }, info) => {
    // Read-only production rendering. No form, analytics or account mutations.
    await page.route("**/*", route => ["GET", "HEAD"].includes(route.request().method()) ? route.continue() : route.abort("blockedbyclient"));
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width: 375, height: 900 });
    const response = await page.goto(inventory.origin + path, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", inventory.origin + path);
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      // Allow the observed responsive transition to settle before measuring.
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: innerWidth }));
      expect(overflow.page, `${path} at ${width}px`).toBeLessThanOrEqual(overflow.viewport + 1);
    }
    const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, failure: n.failureSummary })) }))).toEqual([]);
    expect(errors).toEqual([]);
    if (critical.has(path)) await page.screenshot({ path: info.outputPath("public-page.png"), fullPage: true });
  });
}
