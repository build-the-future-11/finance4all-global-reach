import { test, expect } from "../playwright-fixture";
import AxeBuilder from "@axe-core/playwright";

test("research filters persist and lead to a substantive evidence record", async ({ page }, info) => {
  await page.goto("/research");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ask a sharper question");
  await page.getByLabel("Search research", { exact: true }).fill("covariance");
  await page.getByLabel("Research topic", { exact: true }).selectOption("financial-ml");
  await page.getByLabel("Evidence status", { exact: true }).selectOption("Repository available");
  await expect(page.locator("#directory").getByRole("status")).toHaveText("1 record found");
  await page.reload();
  await expect(page.getByLabel("Search research", { exact: true })).toHaveValue("covariance");
  await expect(page.getByLabel("Research topic", { exact: true })).toHaveValue("financial-ml");
  await page.locator("#directory").getByRole("link", { name: "Eigen-JEPA: market geometry and regimes", exact: true }).click();
  await expect(page).toHaveURL(/\/research\/projects\/eigen-jepa$/);
  for (const name of ["What the evidence establishes", "Data & provenance", "Baselines & evaluation", "Leakage & falsification controls", "Publication status"]) await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(page.getByText(/synthetic research baseline rather than trading alpha/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Source repository/ })).toHaveAttribute("href", "https://github.com/Finance-Meta-Research/Eigen-JEPA");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://finance4all-global-reach.vercel.app/research/projects/eigen-jepa");
  await page.screenshot({ path: info.outputPath("research-evidence-detail.png"), fullPage: true });
  await page.goto("/research?q=no-such-research-question");
  await expect(page.getByRole("heading", { name: "No research matches these filters" })).toBeVisible();
  await page.getByRole("button", { name: "Clear research filters" }).click();
  await expect(page.getByLabel("Search research", { exact: true })).toHaveValue("");
  await expect(page.getByRole("heading", { name: "No authorized papers are published here yet" })).toBeVisible();
});

test("programs preserve held status and distinguish launch interest from registration", async ({ page }, info) => {
  await page.goto("/programs?status=On%20hold&q=investment");
  await expect(page.getByLabel("Program status", { exact: true })).toHaveValue("On hold");
  await expect(page.getByRole("status")).toHaveText("1 program found");
  await page.getByRole("link", { name: "Global Investment Model Challenge 2026", exact: true }).click();
  await expect(page).toHaveURL(/\/programs\/investment-model-challenge$/);
  await expect(page.getByText("On hold", { exact: true })).toBeVisible();
  await expect(page.getByText(/Submission form remains a draft/)).toBeVisible();
  await expect(page.getByText(/does not accept an entry, confirm a chapter, or reserve a place/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Request rules and launch updates/ })).toHaveAttribute("href", "https://tally.so/r/kbayyj");
  await expect(page.locator('a[href*="GxN8Vz"]')).toHaveCount(0);
  await page.getByText("Does submitting interest mean I have been accepted?", { exact: true }).click();
  await expect(page.getByText(/Acceptance, project assignment, chapter approval and publication decisions are separate/)).toBeVisible();
  await page.screenshot({ path: info.outputPath("held-program-detail.png"), fullPage: true });
  await page.goto("/programs/iyer-journal");
  await expect(page.getByText(/December 1, 2026 is an unresolved planning milestone/)).toBeVisible();
  await expect(page.getByText(/Submission is not publication or acceptance/)).toBeVisible();
});

test("public catalogs remain accessible at phone, tablet and desktop widths", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const route of ["/research", "/research/projects/fi-jepa", "/programs", "/programs/fintech-studio"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} at ${width}px`).toBe(true);
    }
  }
  const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(audit.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }))).toEqual([]);
  await page.goto("/programs?status=On%20hold");
  const status = page.getByLabel("Program status", { exact: true });
  await status.focus();
  await expect(status).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Sort programs", { exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});
