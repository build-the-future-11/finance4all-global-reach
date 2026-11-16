import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "../playwright-fixture";

test.describe.configure({ mode: "serial" });
test.setTimeout(90_000);

const PUBLIC_ROUTES = [
  {
    route: "/",
    heading: /Money shapes\s*every life\.\s*Let's open it up\./i,
  },
  { route: "/evidence", heading: "What is verified today" },
  { route: "/login", heading: "Welcome back" },
  { route: "/signup", heading: "Join Finance for All" },
  { route: "/forgot-password", heading: "Reset your password" },
  { route: "/reset-password", heading: "Choose a new password" },
] as const;

for (const { route, heading } of PUBLIC_ROUTES) {
  test(`${route} has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { level: 1, name: heading }).waitFor();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
}

for (const theme of ["light", "dark"]) {
  for (const state of ["unavailable", "closed"]) {
    test(`signup ${state} notice remains accessible in ${theme} theme`, async ({ page }) => {
      await page.addInitScript(value => localStorage.setItem("theme", value), theme);
      await page.route("**/auth/v1/settings", route => route.fulfill({
        status: state === "unavailable" ? 503 : 200,
        contentType: "application/json",
        body: JSON.stringify(state === "unavailable" ? {} : { disable_signup: true, external: { email: true, google: true } }),
      }));
      await page.goto("/signup");
      await expect(page.getByRole("alert")).toContainText(state === "unavailable" ? "couldn't check signup availability" : "signup is currently closed");
      await expect(page.getByRole("button", { name: "Create account with email" })).toBeDisabled();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
