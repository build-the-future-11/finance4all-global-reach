import { test, expect } from "../playwright-fixture";
import { installMemberFixture } from "./member-fixture";

const forms = [
  { path: "/portal/pathways/essays", trigger: "Submit essay", dialog: "Submit your take", table: "essay_submissions", bodyLabel: "Essay", bodyField: "body" },
  { path: "/portal/pathways/studios", trigger: "Submit project", dialog: "Submit to Studios", table: "studio_submissions", bodyLabel: "Writeup", bodyField: "writeup" },
] as const;

for (const form of forms) {
  for (const width of [390, 1440]) {
    test(`${form.table} preserves a newer draft while saving at ${width}px`, async ({ page }, info) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await installMemberFixture(page);
      await page.setViewportSize({ width, height: 950 });
      const submitted: Record<string, unknown>[] = [];
      let acknowledge!: () => void;
      const firstSave = new Promise<void>(resolve => { acknowledge = resolve; });
      await page.route(`**/rest/v1/${form.table}?*`, async route => {
        if (route.request().method() === "GET") {
          await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
          return;
        }
        expect(route.request().method()).toBe("POST");
        const payload = route.request().postDataJSON() as Record<string, unknown>;
        submitted.push(payload);
        if (submitted.length === 1) await firstSave;
        await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: `submission-${submitted.length}`, ...payload }) });
      });
      await page.goto(form.path);
      await page.getByRole("button", { name: form.trigger, exact: true }).click();
      const dialog = page.getByRole("dialog", { name: form.dialog });
      await dialog.getByLabel("Title", { exact: true }).fill("Original submitted title");
      await dialog.getByLabel(form.bodyLabel, { exact: true }).fill("Original submitted evidence.");
      await dialog.getByRole("button", { name: "Submit for review" }).click();
      await expect.poll(() => submitted.length).toBe(1);
      await expect(dialog.getByRole("button", { name: "Saving for review…" })).toBeDisabled();
      await dialog.getByLabel("Title", { exact: true }).fill("Newer title still being edited");
      await dialog.getByLabel(form.bodyLabel, { exact: true }).fill("Newer evidence that has not yet been submitted.");
      expect(submitted[0]).toMatchObject({ title: "Original submitted title", [form.bodyField]: "Original submitted evidence." });
      acknowledge();
      await expect(dialog.getByRole("status")).toContainText("The version you submitted was saved for review. Your form is still open.");
      await expect(dialog.getByLabel("Title", { exact: true })).toHaveValue("Newer title still being edited");
      await expect(dialog.getByLabel(form.bodyLabel, { exact: true })).toHaveValue("Newer evidence that has not yet been submitted.");
      expect(submitted).toHaveLength(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
      await page.screenshot({ path: info.outputPath("preserved-submission-draft.png"), fullPage: true });
      await dialog.getByRole("button", { name: "Submit for review" }).click();
      await expect(dialog).not.toBeVisible();
      expect(submitted).toHaveLength(2);
      expect(submitted[1]).toMatchObject({ title: "Newer title still being edited", [form.bodyField]: "Newer evidence that has not yet been submitted." });
      expect(errors).toEqual([]);
    });
  }
}
