import { test, expect } from "@playwright/test";
import { installMemberFixture } from "../e2e/member-fixture";

// Defined before measurements. UI lab budgets; no live Auth/database or field-INP claim.
const budgets = { lcpMs: 5000, readyMs: 6500, cls: 0.1, transferredBytes: 1024 * 1024, interactionMs: 300 };
for (const route of ["/", "/portal"]) {
  test(`constrained mobile production build ${route}`, async ({ browser }, info) => {
    const samples = [];
    for (let sample = 0; sample < 3; sample++) {
      const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      if (route === "/portal") await installMemberFixture(page);
      else await page.route("https://pnemeegkwyaicsbnbnmg.supabase.co/**", request => request.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 200_000, uploadThroughput: 93_750 });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      let transferredBytes = 0;
      cdp.on("Network.loadingFinished", event => { transferredBytes += event.encodedDataLength; });
      await page.addInitScript(() => {
        const metrics = { lcpMs: 0, cls: 0 };
        Object.assign(window, { qaMetrics: metrics });
        new PerformanceObserver(list => { for (const entry of list.getEntries()) metrics.lcpMs = entry.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver(list => { for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!shift.hadRecentInput) metrics.cls += shift.value;
        } }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(`http://127.0.0.1:4190${route}`, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      if (route === "/portal") await expect(page.getByRole("heading", { name: "Welcome back, QA." })).toBeVisible();
      const readyMs = await page.evaluate(() => performance.now());
      await page.waitForTimeout(750);
      const measured = await page.evaluate(() => (window as unknown as { qaMetrics: { lcpMs: number; cls: number } }).qaMetrics);
      const bytesAtReady = transferredBytes;
      // Measure a local UI response after dispatching a real click event. This
      // is a lab interaction check, not a claimed field INP percentile.
      const target = route === "/portal" ? page.getByRole("button", { name: "Toggle menu", exact: true }) : page.getByRole("link", { name: "Start with a free lesson" });
      const interactionMs = await target.evaluate(async element => {
        const start = performance.now();
        (element as HTMLElement).click();
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        return performance.now() - start;
      });
      if (route === "/portal") await expect(page.getByRole("navigation", { name: "Member portal" })).toBeVisible();
      else await expect(page).toHaveURL(/\/learn\/five-foundations$/);
      expect(errors).toEqual([]);
      samples.push({ ...measured, readyMs, transferredBytes: bytesAtReady, interactionMs });
      await context.close();
    }
    const median = Object.fromEntries(Object.keys(budgets).map(key => [key, samples.map(s => s[key as keyof typeof s]).sort((a, b) => a - b)[1]]));
    const report = { route, source: process.env.EXPECTED_SOURCE_SHA, viewport: "375x812", network: "1.6 Mbps down, 0.75 Mbps up, 150 ms latency", cpuSlowdown: 4, samples, median, budgets, backend: "intercepted fixtures" };
    await info.attach("mobile-lab.json", { body: JSON.stringify(report, null, 2), contentType: "application/json" });
    console.log("PERFORMANCE_RESULT " + JSON.stringify(report));
    expect(median.lcpMs).toBeGreaterThan(0);
    for (const [metric, ceiling] of Object.entries(budgets)) expect(median[metric], metric).toBeLessThanOrEqual(ceiling);
  });
}
