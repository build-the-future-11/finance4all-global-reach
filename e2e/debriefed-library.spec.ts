import { expect, test } from "../playwright-fixture";
import { installMemberFixture } from "./member-fixture";

const slug = "ipo-from-private-company-to-public-market";
const title = "The complete guide to an IPO";

test("anonymous readers search full text, open the complete guide and navigate its sections", async ({ page }) => {
  await page.goto("/debriefed");
  await expect(page.getByRole("heading", { level: 1, name: "Understand what moves your money." })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search articles" }).fill("greenshoe");
  const library = page.locator('section[aria-labelledby="debriefed-library-title"]');
  await expect(library.getByRole("status")).toHaveText("1 guide");
  await page.getByRole("combobox", { name: "Topic" }).selectOption("Policy");
  await expect(library.getByText("No guides match this selection.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(library.getByRole("status")).toHaveText("4 guides");
  await library.getByRole("link").filter({ has: page.getByRole("heading", { name: title, exact: true }) }).click();
  await expect(page).toHaveURL(new RegExp(`/debriefed/${slug}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(page.getByText(/IPO does not prove that a company is profitable/)).toBeVisible();
  const toc = page.getByRole("navigation", { name: "In this guide" });
  const sectionLink = toc.getByRole("link", { name: "Dilution, ownership, and the cap table" });
  const anchor = await sectionLink.getAttribute("href");
  await sectionLink.click();
  expect(anchor).toMatch(/^#section-\d+$/);
  await expect(page.locator(anchor!)).toBeInViewport();
  await expect(page.getByRole("link", { name: "Sign in to save" })).toHaveAttribute("href", "/login");
  await expect(page.getByRole("button", { name: "Mark as read" })).toHaveCount(0);
});

test("legacy links retain the public reader and unapproved manuscript paths stay unavailable", async ({ page }) => {
  await page.goto("/learn/debriefs/what-is-an-ipo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await page.getByRole("link", { name: "All Finance Debriefed guides" }).click();
  await expect(page).toHaveURL(/\/debriefed$/);
  for (const unavailable of ["lower-inflation-does-not-mean-lower-prices", "before-the-backtest-point-in-time-safe-data"]) {
    await page.goto(`/debriefed/${unavailable}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("This guide is not published.");
    await expect(page.getByText("A backtest can fail before a model is trained", { exact: false })).toHaveCount(0);
  }
});

for (const width of [375, 1440]) {
  test(`public article remains readable without horizontal overflow at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto(`/debriefed/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
    await expect(page.getByRole("heading", { name: "Sources & editorial record" })).toBeVisible();
    await page.screenshot({ path: info.outputPath(`debriefed-reader-${width}.png`), fullPage: true });
  });
}

test("member reading positions persist after refresh without automatic activity writes", async ({ page }) => {
  // Rendering and client-request contract only. The fixture does not certify
  // live Auth, database permissions, production data or email delivery.
  await installMemberFixture(page);
  const id = "91000000-0000-4000-8000-000000000001";
  let metadata: Record<string, unknown> = { onboarding_version: 1, school: "QA fixture", age_band: "18–20" };
  let writes = 0;
  await page.route("**/auth/v1/user", async route => {
    if (route.request().method() === "PUT") {
      expect(route.request().headers().authorization).toMatch(/^Bearer /);
      metadata = { ...metadata, ...route.request().postDataJSON().data };
      writes += 1;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id, aud: "authenticated", role: "authenticated", email: "qa@example.test", app_metadata: { provider: "email", providers: ["email"] }, user_metadata: metadata, created_at: "2026-10-11T00:00:00Z" }) });
  });
  await page.goto(`/portal/debriefed/explainers/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  const position = page.getByRole("combobox", { name: "Reading position" });
  await expect(position).toBeVisible();
  expect(writes).toBe(0);
  const selected = await position.locator("option").nth(2).getAttribute("value");
  await position.selectOption(selected!);
  await page.getByRole("button", { name: "Save position", exact: true }).click();
  await expect.poll(() => writes).toBe(1);
  await page.reload();
  await expect(position).toHaveValue(selected!);
  await expect(page.getByRole("link", { name: "Resume reading", exact: true })).toHaveAttribute("href", `#${selected}`);
  await page.goto("/portal/debriefed");
  await expect(page.getByRole("region", { name: "Continue reading" })).toContainText(title);
  await page.getByRole("region", { name: "Continue reading" }).getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`${slug}#${selected}$`));
  await page.getByRole("button", { name: "Mark as read", exact: true }).click();
  await expect.poll(() => writes).toBe(2);
  await expect(page.getByText("Marked as read", { exact: true })).toBeVisible();
});
