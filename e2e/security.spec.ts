import { test, expect } from "@playwright/test";

test.describe("security regression", () => {
  test("signup honeypot field is hidden from users", async ({ page }) => {
    await page.goto("/signup");
    const honeypot = page.locator('input[name="company"]');
    await expect(honeypot).toHaveAttribute("aria-hidden", "true");
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
  });

  test("login stays on app after poisoned redirect state", async ({ page }) => {
    await page.goto("/login", { state: { from: "https://evil.com/phish" } as never });
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });
});
