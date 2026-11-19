import { expect, test } from "../playwright-fixture";
import { installMemberFixture } from "./member-fixture";

test("mobile members can open search and use a public result", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 850 });
  await installMemberFixture(page);
  await page.goto("/portal");
  const search = page.locator(".portal-mobile-header").getByRole("button", { name: "Search", exact: true });
  await expect(search).toBeVisible();
  await search.click();
  await page.getByRole("combobox", { name: "Search portal" }).fill("Milan");
  await page.getByRole("option", { name: /Milan, Italy/ }).click();
  await expect(page).toHaveURL(/\/chapters\?city=milan$/);
});

test("member navigation remains accessible on both sides of the desktop breakpoint", async ({ page }) => {
  await installMemberFixture(page);
  await page.setViewportSize({ width: 1024, height: 850 });
  await page.goto("/portal");
  const nav = page.getByRole("navigation", { name: "Member portal", exact: true });
  await expect(nav).toBeVisible();
  await expect(nav).toBeInViewport();
  await expect(page.locator(".portal-desktop-bar")).toBeVisible();
  await page.setViewportSize({ width: 1023, height: 850 });
  // workspace.css uses visibility:hidden as well as the drawer transform, so
  // closed navigation must be outside both the viewport and accessibility tree.
  const drawer = page.locator("#workspace-sidebar");
  await expect(drawer).not.toBeInViewport();
  await expect(nav).toBeHidden();
  const toggle = page.getByRole("button", { name: "Toggle menu" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(nav).toBeVisible();
  await expect(nav).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeInViewport();
  await expect(nav).toBeHidden();
  await expect(toggle).toBeFocused();
});
