import { expect, test, type Page } from "@playwright/test";

const memberA = {
  email: process.env.E2E_MEMBER_A_EMAIL ?? "",
  password: process.env.E2E_MEMBER_A_PASSWORD ?? "",
};
const memberB = {
  email: process.env.E2E_MEMBER_B_EMAIL ?? "",
  password: process.env.E2E_MEMBER_B_PASSWORD ?? "",
};

function requireCredentials() {
  for (const [name, value] of Object.entries({
    E2E_MEMBER_A_EMAIL: memberA.email,
    E2E_MEMBER_A_PASSWORD: memberA.password,
    E2E_MEMBER_B_EMAIL: memberB.email,
    E2E_MEMBER_B_PASSWORD: memberB.password,
  })) {
    if (!value) throw new Error(`${name} is required for the credentialed production journey.`);
  }
}

async function signIn(page: Page, account: typeof memberA) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign in with email" }).click();
  await expect(page).toHaveURL(/\/portal(?:\/|$)/);
}

test.beforeAll(requireCredentials);

test("two independent members authenticate, stay isolated, and sign out", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  await signIn(pageA, memberA);
  await signIn(pageB, memberB);

  await pageA.goto("/portal/settings");
  await pageB.goto("/portal/settings");
  await expect(pageA.getByText(memberA.email, { exact: true })).toBeVisible();
  await expect(pageB.getByText(memberB.email, { exact: true })).toBeVisible();
  await expect(pageA.getByText(memberB.email, { exact: true })).toHaveCount(0);
  await expect(pageB.getByText(memberA.email, { exact: true })).toHaveCount(0);

  await pageA.getByRole("button", { name: "Sign out" }).first().click();
  await expect(pageA).toHaveURL(/\/login$/);
  await pageA.goto("/portal/settings");
  await expect(pageA).toHaveURL(/\/login$/);
  await expect(pageB).toHaveURL(/\/portal\/settings$/);

  await contextA.close();
  await contextB.close();
});
