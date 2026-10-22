import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const portProbe = createServer();
await new Promise((resolveReady, reject) => {
  portProbe.once("error", reject);
  portProbe.listen(0, "127.0.0.1", resolveReady);
});
const { port } = portProbe.address();
await new Promise((resolveClosed) => portProbe.close(resolveClosed));
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [
  "node_modules/vite/bin/vite.js",
  "--config", "scripts/invitation-validation-browser-vite.config.mjs",
  "--host", "127.0.0.1",
  "--port", String(port),
  "--strictPort",
], { stdio: ["ignore", "pipe", "pipe"] });
let serverOutput = "";
server.stdout.on("data", chunk => { serverOutput = (serverOutput + chunk).slice(-12_000); });
server.stderr.on("data", chunk => { serverOutput = (serverOutput + chunk).slice(-12_000); });

let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Vite exited ${server.exitCode}: ${serverOutput}`);
    try {
      const response = await fetch(`${base}/invitation-validation.html`, { signal: AbortSignal.timeout(500) });
      if (response.ok) { ready = true; break; }
    } catch {}
    await delay(100);
  }
  assert.ok(ready, `Invitation fixture startup deadline exceeded: ${serverOutput}`);

  browser = await chromium.launch();
  const context = await browser.newContext();
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    return url.origin === base ? route.continue() : route.abort("blockedbyclient");
  });
  const page = await context.newPage();
  const browserErrors = [];
  page.on("pageerror", error => browserErrors.push(error.message));
  page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  await page.goto(`${base}/invitation-validation.html`);

  const input = page.getByLabel("Member account ID");
  const button = page.getByRole("button", { name: "Create invitation" });
  const malformed = "------------------------------------";
  const memberA = "10000000-0000-4000-8000-000000000092";
  const memberB = "10000000-0000-4000-8000-000000000093";

  await input.fill(malformed);
  await button.click();
  const invalidAlert = page.getByRole("alert");
  await invalidAlert.waitFor();
  assert.match(await invalidAlert.textContent(), /valid member account ID/);
  assert.equal(await input.getAttribute("aria-invalid"), "true");
  assert.equal(await input.getAttribute("aria-describedby"), await invalidAlert.getAttribute("id"));
  assert.equal(await input.evaluate(element => element === document.activeElement), true);
  assert.deepEqual(await page.evaluate(() => window.invitationHarness.attempts), []);

  await input.fill(memberA);
  assert.equal(await input.getAttribute("aria-invalid"), null);
  await button.click();
  await page.getByRole("status").filter({ hasText: memberA }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.invitationHarness.attempts), [memberA]);
  assert.equal(await input.inputValue(), "");

  await page.evaluate(() => { window.invitationHarness.mode = "deferred-failure"; });
  await input.fill(memberA);
  await button.click();
  await page.waitForFunction(() => window.invitationHarness.attempts.length === 2);
  assert.equal(await button.isDisabled(), true);
  await input.fill(memberB);
  await page.evaluate(() => window.invitationHarness.releaseFailure());
  const failureAlert = page.getByRole("alert");
  await failureAlert.waitFor();
  assert.match(await failureAlert.textContent(), new RegExp(memberA));
  assert.match(await failureAlert.textContent(), /newer edits have not been submitted/i);
  assert.equal(await input.inputValue(), memberB);
  assert.equal(await button.isEnabled(), true);

  await page.evaluate(() => { window.invitationHarness.mode = "success"; });
  await button.click();
  await page.getByRole("status").filter({ hasText: memberB }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.invitationHarness.attempts), [memberA, memberA, memberB]);
  assert.equal(await input.inputValue(), "");
  assert.equal(browserErrors.length, 0, browserErrors.join(" | "));
  console.log("PASS invitation browser: malformed focus/error, valid UUID, pending failure isolation, corrected retry");
  await context.close();
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
