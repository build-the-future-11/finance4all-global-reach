# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> public site smoke >> login page is reachable
- Location: e2e/smoke.spec.ts:16:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /sign in/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /sign in/i })

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("public site smoke", () => {
  4  |   test("landing page loads without console errors", async ({ page }) => {
  5  |     const errors: string[] = [];
  6  |     page.on("pageerror", (err) => errors.push(err.message));
  7  | 
  8  |     await page.goto("/");
  9  |     await expect(page).toHaveTitle(/Finance4All/i);
  10 |     await expect(page.locator("body")).toBeVisible();
  11 | 
  12 |     const critical = errors.filter((e) => !e.includes("ResizeObserver"));
  13 |     expect(critical).toEqual([]);
  14 |   });
  15 | 
  16 |   test("login page is reachable", async ({ page }) => {
  17 |     await page.goto("/login");
> 18 |     await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
  19 |   });
  20 | 
  21 |   test("contact form is visible on landing page", async ({ page }) => {
  22 |     await page.goto("/#contact");
  23 |     await expect(page.getByLabel("Name")).toBeVisible();
  24 |     await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
  25 |   });
  26 | 
  27 |   test("portal redirects unauthenticated users to login", async ({ page }) => {
  28 |     await page.goto("/portal");
  29 |     await expect(page).toHaveURL(/\/login/);
  30 |   });
  31 | 
  32 |   test("network page redirects unauthenticated users to login", async ({ page }) => {
  33 |     await page.goto("/portal/network");
  34 |     await expect(page).toHaveURL(/\/login/);
  35 |   });
  36 | });
  37 | 
```