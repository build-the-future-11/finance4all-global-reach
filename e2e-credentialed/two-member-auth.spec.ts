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

async function openSettings(page: Page, email: string) {
  await page.goto("/portal/settings");
  await expect(page).toHaveURL(/\/portal\/settings$/);
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await expect(page.getByLabel("Display name")).toBeVisible();
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).first().click();
  await expect(page).toHaveURL(/\/login$/);
}

test.beforeAll(requireCredentials);

test("two members stay isolated and member activity survives reload and reauthentication", async ({
  browser,
}) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  let originalBio: string | undefined;

  try {
    await signIn(pageA, memberA);
    await signIn(pageB, memberB);

    await openSettings(pageA, memberA.email);
    await openSettings(pageB, memberB.email);
    await expect(pageA.getByText(memberB.email, { exact: true })).toHaveCount(0);
    await expect(pageB.getByText(memberA.email, { exact: true })).toHaveCount(0);

    const bioA = pageA.getByLabel("Bio");
    const bioB = pageB.getByLabel("Bio");
    originalBio = await bioA.inputValue();
    const persistenceMarker = `FinanceMeta production certification ${Date.now()}`;

    await bioA.fill(persistenceMarker);
    await pageA.getByRole("button", { name: "Save changes" }).click();
    await expect(pageA.getByText("Profile updated", { exact: true })).toBeVisible();

    await pageA.reload();
    await expect(pageA.getByLabel("Bio")).toHaveValue(persistenceMarker);
    await expect(bioB).not.toHaveValue(persistenceMarker);

    await signOut(pageA);
    await pageA.goto("/portal/settings");
    await expect(pageA).toHaveURL(/\/login$/);
    await expect(pageB).toHaveURL(/\/portal\/settings$/);

    await signIn(pageA, memberA);
    await openSettings(pageA, memberA.email);
    await expect(pageA.getByLabel("Bio")).toHaveValue(persistenceMarker);
  } finally {
    try {
      if (originalBio !== undefined) {
        if (new URL(pageA.url()).pathname === "/login") await signIn(pageA, memberA);
        await openSettings(pageA, memberA.email);
        await pageA.getByLabel("Bio").fill(originalBio);
        await pageA.getByRole("button", { name: "Save changes" }).click();
        await expect(pageA.getByText("Profile updated", { exact: true })).toBeVisible();
        await pageA.reload();
        await expect(pageA.getByLabel("Bio")).toHaveValue(originalBio);
      }
    } finally {
      await contextA.close();
      await contextB.close();
    }
  }
});
