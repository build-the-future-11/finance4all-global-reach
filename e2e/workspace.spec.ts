import { test, expect } from '../playwright-fixture';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const memberId = '10000000-0000-4000-8000-000000000091';
const projectId = '20000000-0000-4000-8000-000000000091';
const timestamp = '2026-09-21T10:00:00Z';

test.beforeEach(async ({ page }) => {
  // Browser rendering fixtures only. All Supabase requests are intercepted;
  // these tests make no claim about a live session or database authorization.
  const user = { id: memberId, aud: 'authenticated', role: 'authenticated', email: 'workspace@example.test', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: { onboarding_version: 1, school: 'Test learning community', age_band: '18–20' }, created_at: timestamp };
  await page.addInitScript(({ user }) => {
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const token = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: user.id, role: 'authenticated', exp: expires })) + '.test-signature';
    localStorage.setItem('sb-pnemeegkwyaicsbnbnmg-auth-token', JSON.stringify({ access_token: token, refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, expires_at: expires, user }));
  }, { user });
  await page.route('https://pnemeegkwyaicsbnbnmg.supabase.co/**', async route => {
    const url = new URL(route.request().url());
    let body: unknown = [];
    if (url.pathname.endsWith('/user')) body = user;
    if (url.pathname.endsWith('/profiles')) body = { id: memberId, display_name: 'Test Researcher', role: 'member', bio: 'Browser fixture', avatar_url: null, interests: ['Economics'], open_to_collaborate: true, chapter_id: null, created_at: timestamp, updated_at: timestamp };
    if (url.pathname.endsWith('/research_projects')) body = [{ id: projectId, title: 'QA fixture research', description: 'A project used only to verify the workspace interface.', lead_researcher_id: memberId, status: 'open', tags: ['Economics'], application_deadline: null, created_at: timestamp, updated_at: timestamp }];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test('workspace layout and accessibility at ' + width + 'px', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/portal');
    await expect(page.getByRole('heading', { name: 'Welcome, Test.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'QA fixture research' })).toBeVisible();
    await expect(page.getByText('No platform applications submitted yet.', { exact: false })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
    if (width === 320 || width === 1440) await page.screenshot({ path: '../evidence/institution-platform-2026-09-21/browser/workspace-' + width + '.png', fullPage: true });
    expect(errors).toEqual([]);
  });
}

test('own research and mobile navigation restore focus', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/portal/my-research');
  await expect(page.getByRole('heading', { name: 'My Research', exact: true })).toBeVisible();
  await expect(page.getByText('Project lead', { exact: true })).toBeVisible();
  await expect(page.getByText('No research applications have been submitted.')).toBeVisible();
  await page.setViewportSize({ width: 375, height: 900 });
  await page.getByRole('button', { name: 'Toggle menu', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Member portal' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Toggle menu', exact: true })).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Member portal' })).toBeHidden();
  expect(errors).toEqual([]);
});

test('failed data loads show retry and recover without inventing an empty result', async ({ page }) => {
  await page.route('**/rest/v1/research_projects*', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Research is temporarily unavailable' }) }));
  await page.goto('/portal/my-research');
  await expect(page.getByText('Research is temporarily unavailable')).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('No project participation is recorded yet.', { exact: false })).toHaveCount(0);
  await page.unroute('**/rest/v1/research_projects*');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: 'QA fixture research' })).toBeVisible();
});

test('learning refresh failure keeps unsaved notes usable on mobile', async ({ page }) => {
  let unavailable = false;
  const saved = { user_id: memberId, lesson_id: 'ipo-from-private-company-to-public-market', completed: false, notes: 'Earlier saved notes', revision: 3, updated_at: timestamp };
  await page.route('**/rest/v1/member_learning*', route => route.fulfill({
    status: unavailable ? 503 : 200, contentType: 'application/json',
    body: JSON.stringify(unavailable ? { message: 'Learning records unavailable' } : [saved]),
  }));
  await page.setViewportSize({ width: 375, height: 950 });
  await page.goto('/portal/learning');
  await page.getByRole('combobox', { name: 'Lesson', exact: true }).selectOption(saved.lesson_id);
  const notes = page.getByRole('textbox', { name: 'Private notes', exact: true });
  await notes.fill('Unsent notes that must survive a failed refresh.');
  await page.getByLabel('I have read this lesson').check();
  unavailable = true;
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Reload saved version' }).click();
  await expect(page.getByRole('alert')).toContainText('Learning records could not be refreshed', { timeout: 20000 });
  await expect(notes).toHaveValue('Unsent notes that must survive a failed refresh.');
  await expect(page.getByLabel('I have read this lesson')).toBeChecked();
  unavailable = false;
  await page.getByRole('button', { name: 'Retry learning refresh' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(notes).toHaveValue('Unsent notes that must survive a failed refresh.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  await page.screenshot({ path: '../evidence/institution-platform-2026-09-21/browser/learning-recovery-375.png', fullPage: true });
  expect(audit.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => ({ target: node.target, failure: node.failureSummary })) }))).toEqual([]);
  await page.getByRole('button', { name: 'Save progress & notes' }).hover();
  const hoverAudit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(hoverAudit.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => node.target) }))).toEqual([]);
});

test('recovered intake receipt and unsent current answers download separately', async ({ page }) => {
  const callId = 'quant-research';
  let receipt: Record<string, unknown> | null = null;
  const original = 'Evaluate a chronological baseline with explicit leakage controls, uncertainty and transaction cost assumptions.';
  const edited = 'This revised research question uses a different dataset and a stronger chronological comparison while retaining clear evaluation constraints.';
  await page.route('**/rest/v1/intake_calls*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: callId, title: 'Quant Research', kind: 'cohort', status: 'interest', description: 'Browser fixture only.', closes_at: null, created_at: timestamp }]) }));
  await page.route('**/rest/v1/application_drafts*', route => {
    const payload = route.request().postDataJSON();
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload ? { ...payload, user_id: memberId, revision: 1, updated_at: timestamp } : null) });
  });
  await page.route('**/rest/v1/intake_submissions*', route => {
    const request = route.request();
    if (request.method() === 'POST') {
      if (receipt) return route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ code: '23505', message: 'Original request already saved' }) });
      receipt = { ...request.postDataJSON(), applicant_id: memberId, status: 'submitted', review_note: '', created_at: timestamp, updated_at: timestamp };
      return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'The response was lost after persistence' }) });
    }
    const byId = new URL(request.url()).searchParams.has('id');
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(byId ? receipt : receipt ? [receipt] : []) });
  });
  await page.goto('/portal/apply?call=' + callId);
  await page.getByLabel(/Question or contribution/).fill(original);
  await page.getByLabel(/Relevant preparation/).fill('Python, statistics and reproducible data analysis.');
  await page.getByLabel('Availability and timezone').fill('4 hours per week, UTC');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit for review' }).click();
  await expect(page.getByText('The action could not be confirmed. Your answers remain on this page. Refresh submissions before retrying.')).toBeVisible();
  await page.getByLabel(/Question or contribution/).fill(edited);
  await page.getByRole('button', { name: 'Submit for review' }).click();
  await expect(page.getByText(/edits currently shown in the form were not submitted/)).toBeVisible();
  await expect(page.getByLabel(/Question or contribution/)).toHaveValue(edited);
  const [storedDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download receipt', exact: true }).click()]);
  expect(JSON.parse(await readFile((await storedDownload.path())!, 'utf8')).motivation).toBe(original);
  const [currentDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download current answers', exact: true }).click()]);
  expect(JSON.parse(await readFile((await currentDownload.path())!, 'utf8')).motivation).toBe(edited);
});

test('existing bright save controls retain readable text in both themes', async ({ page }) => {
  await page.goto('/portal/settings');
  const button = page.getByRole('button', { name: 'Save changes', exact: true });
  await expect(button).toBeVisible();
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.classList.toggle('dark', value === 'dark'), theme);
    for (const hovered of [false, true]) {
      if (hovered) await button.hover();
      else await page.mouse.move(0, 0);
      const audit = await new AxeBuilder({ page }).include('button[type="submit"]').withRules(['color-contrast']).analyze();
      expect(audit.violations.map(violation => ({ theme, hovered, id: violation.id, nodes: violation.nodes.map(node => ({ target: node.target, failure: node.failureSummary })) }))).toEqual([]);
    }
  }
});
