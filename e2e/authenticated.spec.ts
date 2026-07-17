import { test, expect } from "@playwright/test";
import { e2eAuthSkipReason, hasE2ECredentials } from "./authCredentials";

test.describe("auth surfaces (unauthenticated)", () => {
  test("signup page is reachable with honeypot still present", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
    await expect(page.locator('input[name="company_website"]')).toBeHidden();
  });

  test("forgot-password page accepts email field", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send|reset/i })).toBeVisible();
  });

  test("onboarding redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/portal/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("authenticated portal journeys", () => {
  test.skip(!hasE2ECredentials(), e2eAuthSkipReason());

  test("member can sign in and reach dashboard", async ({ page }) => {
    const email = process.env.E2E_EMAIL!;
    const password = process.env.E2E_PASSWORD!;

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /sign in with email/i }).click();

    await expect(page).toHaveURL(/\/(portal|onboarding)/, { timeout: 30_000 });

    if (page.url().includes("/onboarding")) {
      await expect(page.getByText(/onboarding|profile|display/i).first()).toBeVisible();
      return;
    }

    await expect(page.getByRole("navigation").or(page.locator("main"))).toBeVisible();
    await page.goto("/portal/education");
    await expect(page).toHaveURL(/\/portal\/education/);
    await expect(page.getByText(/learn|catalyst|lesson/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("member can open settings after sign-in", async ({ page }) => {
    const email = process.env.E2E_EMAIL!;
    const password = process.env.E2E_PASSWORD!;

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /sign in with email/i }).click();
    await expect(page).toHaveURL(/\/(portal|onboarding)/, { timeout: 30_000 });

    test.skip(page.url().includes("/onboarding"), "Onboarding incomplete for E2E user");

    await page.goto("/portal/settings");
    await expect(page).toHaveURL(/\/portal\/settings/);
    await expect(page.getByText(/profile|settings|notification/i).first()).toBeVisible();
  });
});
