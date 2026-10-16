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
      for (const path of ["/research", "/programs", "/debriefed", "/chapters", "/events", "/learn", "/about"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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
