import { test, expect } from "@playwright/test";

test.describe("public site smoke", () => {
  test("landing page loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await expect(page).toHaveTitle(/FinanceMeta/i);
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

  test("competitions overview is public", async ({ page }) => {
    await page.goto("/competitions");
    await expect(page.getByRole("heading", { name: /competitions, workshops/i })).toBeVisible();
  });

  test("discover page explains programs and signup path", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.getByRole("heading", { name: /find a program/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /browse research after signup/i })).toBeVisible();
  });

  test("hero primary CTA opens Discover", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /discover programs/i }).click();
    await expect(page).toHaveURL(/\/discover/);
  });

  test("landing module CTA routes to signup with next", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /meta labs/i }).first().click();
    await expect(page).toHaveURL(/\/signup\?next=/);
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
