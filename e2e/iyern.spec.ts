import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("IYERN routes, filters, accessibility and responsive layouts", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/iyern");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Researching the Economy of Tomorrow");
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.getByLabel("Research category", { exact: true }).selectOption("policy");
  await page.getByRole("searchbox").fill("inflation");
  await page.reload();
  await expect(page.getByRole("searchbox")).toHaveValue("inflation");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByLabel("Research category", { exact: true })).toHaveValue("all");
  for (const route of ["journal", "forum", "fellowship", "challenge"]) {
    await page.goto(`/iyern/${route}`);
    await expect(page.locator(`#${route}`)).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://finance4all-global-reach.vercel.app/iyern/${route}`);
  }
  await page.goto("/iyern/articles/missing");
  await expect(page.getByRole("heading", { name: "Article unavailable" })).toBeVisible();
  await page.goto("/");
  await page.getByRole("link", { name: "Open IYERN", exact: true }).click();
  await expect(page).toHaveURL(/\/iyern$/);
  await page.goto("/learn");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});
