import { test, expect } from "@playwright/test";

test.describe("public site smoke", () => {
  test("landing page loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await expect(page).toHaveTitle(/Finance4All/i);
    await expect(page.locator("body")).toBeVisible();

    const critical = errors.filter((e) => !e.includes("ResizeObserver"));
    expect(critical).toEqual([]);
  });

  test("login page is reachable", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("contact form is visible on landing page", async ({ page }) => {
    await page.goto("/#contact");
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
  });

  test("portal redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/login/);
  });

  test("network page redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/portal/network");
    await expect(page).toHaveURL(/\/login/);
  });
});
