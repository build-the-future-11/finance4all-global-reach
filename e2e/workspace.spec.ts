import { test, expect } from '../playwright-fixture';
import AxeBuilder from '@axe-core/playwright';

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
