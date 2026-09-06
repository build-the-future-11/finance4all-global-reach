import { expect, test } from "../playwright-fixture";

test("public claims stay inside the evidence boundary", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Global Financial Literacy Initiative" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Programs With Explicit Evidence Gates" })).toBeVisible();
  await expect(page.getByText("0", { exact: true })).toBeVisible();
  await expect(page.getByText("Unsupported impact claims", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Founder" })).toHaveCount(0);
  await expect(page.getByText(/global nonprofit building/i)).toHaveCount(0);
  await expect(page.getByText(/growing network of students/i)).toHaveCount(0);
});

test("login and password recovery routes are reachable", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send recovery link" })).toBeEnabled();
});

test("provider-unavailable signup fails closed", async ({ page }) => {
  await page.route("**/auth/v1/settings", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ disable_signup: true, external: { email: true, google: true } }),
    }),
  );
  await page.goto("/signup");

  await expect(page.getByRole("alert")).toContainText("signup is currently closed");
  await expect(page.getByRole("button", { name: "Sign up with Google" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Create account with email" })).toBeDisabled();
});

test("auth callback explains provider failures instead of silently looping", async ({ page }) => {
  await page.goto(
    "/auth/callback#error=access_denied&error_code=signup_disabled&error_description=Signups+not+allowed",
  );

  await expect(page.getByRole("heading", { name: "Sign in was not completed" })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("signup is currently closed");
  await expect(page.getByRole("link", { name: "Return to sign in" })).toHaveAttribute(
    "href",
    "/login",
  );
});
