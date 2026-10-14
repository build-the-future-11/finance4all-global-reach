import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 390, 1440]) {
  test(`IYERJ direct route is readable at ${width}px without opening intake`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/iyerj");
    await expect(page.locator(".iyerj-page")).toBeVisible();
    await expect(page).toHaveTitle("IYERJ — Journal & Research Forum · Finance for All");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.locator("time")).toHaveAttribute("datetime", "2026-12-01");
    await expect(page.locator("#forum article")).toHaveCount(4);
    await expect(page.getByText("Posting not yet open", { exact: true })).toHaveCount(4);
    await expect(page.locator(".iyerj-page form,.iyerj-page input,.iyerj-page textarea,.iyerj-page iframe")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const fragments = await page.locator('.iyerj-page a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute("href")));
    for (const fragment of fragments) {
      expect(fragment).not.toBeNull();
      await expect(page.locator(fragment!)).toHaveCount(1);
    }
  });
}

test("IYERJ supports keyboard entry, native FAQs and a return to the host site", async ({ page }) => {
  await page.goto("/iyerj");
  await expect(page.locator(".iyerj-page")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(".iyerj-skip")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#iyerj-main")).toBeFocused();
  await page.locator("#standards summary").first().click();
  await expect(page.locator("#standards details").first()).toHaveAttribute("open", "");
  const accessibility = await new AxeBuilder({ page }).include(".iyerj-page").analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole("link", { name: /Back to Finance for All/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".ffa-home")).toBeVisible();
});
