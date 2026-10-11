import { test, expect } from "../playwright-fixture";
import AxeBuilder from "@axe-core/playwright";
import { installMemberFixture } from "./member-fixture";

for (const width of [320, 375, 768, 1024, 1440]) {
  for (const theme of ["light", "dark"]) {
    test(`publication review at ${width}px in ${theme}`, async ({ page }, info) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await installMemberFixture(page, "admin");
      await page.addInitScript(value => localStorage.setItem("theme", value), theme);
      await page.setViewportSize({ width, height: 950 });
      let row = { id: "92000000-0000-4000-8000-000000000001", title: "A detailed article awaiting evidence and editorial review", summary: "LongContent".repeat(35), category: "macro", source_url: "https://example.test/" + "reference".repeat(30), publication_state: "draft", publication_revision: 0 };
      await page.route("**/rest/v1/news_articles*", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([row]) }));
      let submitted = false;
      await page.route("**/rest/v1/rpc/review_publication", route => {
        const request = route.request().postDataJSON();
        expect(request.expected_revision).toBe(row.publication_revision);
        expect(request.review_note).toContain("Fixture evidence");
        row = { ...row, publication_state: request.next_state, publication_revision: row.publication_revision + 1 };
        submitted = true;
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(row) });
      });
      await page.goto("/portal/admin");
      await expect(page.getByRole("heading", { name: "Publication review", exact: true })).toBeVisible();
      await page.getByText("Review full content", { exact: true }).click();
      const note = page.getByLabel(/Review evidence and decision/);
      await note.fill("Fixture evidence reviewed for layout and workflow testing only.");
      await page.getByLabel("Publication state", { exact: true }).selectOption("published");
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
      const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, failure: n.failureSummary })) }))).toEqual([]);
      await page.getByRole("button", { name: "Record review", exact: true }).click();
      await expect.poll(() => submitted).toBe(true);
      await expect(page.getByText("This record changed.", { exact: false })).toBeVisible();
      await expect(page.getByRole("button", { name: "Record review", exact: true })).toBeDisabled();
      await page.getByRole("button", { name: "Review current version and clear this note" }).click();
      await expect(note).toHaveValue("");
      await expect(page.getByText("Current state:", { exact: false })).toContainText("published");
      await page.screenshot({ path: info.outputPath("publication-review.png"), fullPage: true });
      expect(errors).toEqual([]);
    });
  }
}

test("a stale review preserves its note and reports the server conflict", async ({ page }) => {
  await installMemberFixture(page, "admin");
  await page.route("**/rest/v1/news_articles*", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ id: "record", title: "Stale record", publication_state: "draft", publication_revision: 1 }]) }));
  await page.route("**/rest/v1/rpc/review_publication", route => route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ code: "40001", message: "Content changed. Reload and review the current version." }) }));
  await page.goto("/portal/admin");
  const note = page.getByLabel(/Review evidence and decision/);
  await note.fill("This review note must survive a server conflict.");
  await page.getByRole("button", { name: "Record review", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Content changed");
  await expect(note).toHaveValue("This review note must survive a server conflict.");
});
