import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "../playwright-fixture";

const PUBLIC_ROUTES = [
  {
    route: "/",
    heading: /Study financial systems\.\s*Build what the evidence supports\./i,
  },
  { route: "/evidence", heading: "What is verified today" },
  { route: "/login", heading: "Welcome back" },
  { route: "/signup", heading: "Join FinanceMeta" },
  { route: "/forgot-password", heading: "Reset your password" },
  { route: "/reset-password", heading: "Choose a new password" },
] as const;

for (const { route, heading } of PUBLIC_ROUTES) {
  test(`${route} has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.goto(route);
    await page.getByRole("heading", { level: 1, name: heading }).waitFor();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
}
