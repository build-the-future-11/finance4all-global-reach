import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "../playwright-fixture";

for (const width of [390, 768, 1440]) {
  for (const theme of ["light", "dark"]) {
    test(`public discovery at ${width}px in ${theme}`, async ({ page }, info) => {
      test.setTimeout(120_000);
      await page.addInitScript(value => localStorage.setItem("theme", value), theme);
      await page.setViewportSize({ width, height: 900 });
      await page.route("**/rest/v1/rpc/public_event_catalog", route => route.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      for (const path of ["/ecosystem", "/research", "/programs", "/debriefed", "/chapters", "/events", "/learn", "/about"]) {
        await page.goto(path);
        await expect(page.getByRole("main", { name: "Loading page" })).toBeHidden();
        await expect(page.locator("#public-content").getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.getByRole("main")).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), path).toBe(false);
        const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, failure: n.failureSummary })) })), path).toEqual([]);
        await page.screenshot({ path: info.outputPath(`${path.slice(1)}.png`), fullPage: true });
      }
      expect(errors).toEqual([]);
      if (width < 1200) {
        const menu = page.getByRole("button", { name: "Open menu" });
        await menu.click();
        await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
      }
    });
  }
}

for (const theme of ["light", "dark"]) {
  test(`route loading is accessible in ${theme}`, async ({ page }) => {
    await page.addInitScript(value => localStorage.setItem("theme", value), theme);
    await page.setViewportSize({ width: 390, height: 900 });
    await page.route("**/rest/v1/rpc/public_event_catalog", route => route.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
    let releaseModule = () => {};
    const moduleReady = new Promise<void>(resolve => { releaseModule = resolve; });
    // Hold the real lazy route module so the shared loading screen is audited,
    // regardless of module-cache speed or the time needed to run Axe.
    await page.route("**/src/pages/Events.tsx*", async route => {
      await moduleReady;
      await route.continue();
    });
    try {
      await page.goto("/events", { waitUntil: "commit" });
      await expect(page.getByRole("main", { name: "Loading page" })).toBeVisible();
      await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
      const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, failure: n.failureSummary })) }))).toEqual([]);
    } finally {
      releaseModule();
    }
    await expect(page.getByRole("heading", { name: "Events with a purpose.", level: 1 })).toBeVisible();
  });
}
