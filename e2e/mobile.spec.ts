import { test, expect } from "@playwright/test";

test.describe("mobile public smoke", () => {
  test("landing and discover remain usable on mobile viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /discover programs/i })).toBeVisible();
    await page.getByRole("button", { name: /open menu|close menu/i }).click();
    await expect(page.getByRole("link", { name: /^discover$/i }).first()).toBeVisible();
    await page.goto("/discover");
    await expect(page.getByRole("heading", { name: /find a program/i })).toBeVisible();
  });
});
