import { test, expect, Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const API = 'http://localhost:8000';
async function signIn(page: Page, username = 'ramesh@beneficiary.lip', password = 'ramesh123') {
  await page.goto('/login');
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'प्रवेश करा (Sign In)', exact: true }).click();
  await page.waitForURL('**/interview');
  // Wait for authoritative beneficiary resolution, not just the navigation effect.
  await expect.poll(() => page.evaluate(() => localStorage.getItem('lip_beneficiary_id'))).toBeTruthy();
  return page.evaluate(() => localStorage.getItem('lip_auth_token_v1')!);
}

test.describe('Independent audit security gate', () => {
  for (const route of ['/admin', '/field', '/provider', '/employer', '/coordination', '/counsellor/finance']) {
    test(`anonymous ${route} does not render professional data`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login\?next=/);
      await expect(page.getByRole('heading', { name: /Sign In/ })).toBeVisible();
      await expect(page.locator('body')).not.toContainText('9876543210');
    });
  }

  test('beneficiary cannot enter admin workspace', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Access Forbidden' })).toBeVisible();
  });

  test('anonymous intake previews skills but cannot persist an ownerless profile', async ({ page, request }) => {
    await page.goto('/interview');
    await page.getByRole('button', { name: /Analyze My Skills/ }).click();
    await page.getByRole('button', { name: /Confirm & Save/ }).click();
    await expect(page.getByText(/Sign in before saving your profile/)).toBeVisible();
    const response = await request.post(`${API}/api/v1/beneficiaries/`, { data: { full_name: 'Audit rejected anonymous' } });
    expect(response.status()).toBe(401);
    const count = execFileSync('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', 'postgres', '-d', 'lip_db', '-tAc', "SELECT count(*) FROM beneficiaries WHERE full_name='Audit rejected anonymous'"], { cwd: '../..', encoding: 'utf8' });
    expect(count.trim()).toBe('0');
  });

  test('failed journey mutation does not show completion', async ({ page, request }) => {
    const login = await request.post(`${API}/api/v1/identity/login`, {data: {username: 'audit.browser@example.invalid', password: 'audit-local-only-2026'}});
    expect(login.status()).toBe(200);
    const setupHeaders = {Authorization: `Bearer ${(await login.json()).access_token}`};
    const profile = await request.post(`${API}/api/v1/beneficiaries/`, {headers: setupHeaders, data: {full_name: 'Synthetic Browser Verification'}});
    expect(profile.status()).toBe(200);
    const selection = await request.post(`${API}/api/v1/journey/select-pathway`, {headers: setupHeaders, data: {beneficiary_id: (await profile.json()).id, title: 'Synthetic audit regression pathway'}});
    expect(selection.status()).toBe(200);
    const token = await signIn(page, 'audit.browser@example.invalid', 'audit-local-only-2026');
    const headers = { Authorization: `Bearer ${token}` };
    const me = await (await request.get(`${API}/api/v1/beneficiaries/me`, { headers })).json();
    const journey = await (await request.get(`${API}/api/v1/journey/${me.id}`, { headers })).json();
    const action = journey.action_plan.find((item: { status: string }) => item.status !== 'completed');
    expect(action, 'Seeded beneficiary must have a pending real action').toBeTruthy();
    await page.route(`${API}/api/v1/journey/actions/**`, route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Injected mutation failure' }) }));
    await page.goto('/journey');
    await page.getByRole('button', { name: /Mark Completed/ }).click();
    await expect(page.locator('main [role="alert"]')).toContainText('Injected mutation failure');
    await expect(page.getByRole('heading', { name: action.title })).toBeVisible();
    const after = await (await request.get(`${API}/api/v1/journey/${me.id}`, { headers })).json();
    expect(after.action_plan.find((item: { id: string }) => item.id === action.id).status).toBe(action.status);
    await page.reload();
    await expect(page.getByRole('heading', { name: action.title })).toBeVisible();
    await page.unroute(`${API}/api/v1/journey/actions/**`);
    await page.getByRole('button', { name: /Mark Completed/ }).click();
    await expect(page.getByText('Progress saved.', { exact: true })).toBeVisible();
    const persisted = await (await request.get(`${API}/api/v1/journey/${me.id}`, { headers })).json();
    expect(persisted.action_plan.find((item: { id: string }) => item.id === action.id).status).toBe('completed');
    expect(action.id).toMatch(/^[a-zA-Z0-9-]+$/);
    const dbStatus = execFileSync('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', 'postgres', '-d', 'lip_db', '-tAc', `SELECT status FROM pathway_actions WHERE id='${action.id}'`], { cwd: '../..', encoding: 'utf8' });
    expect(dbStatus.trim()).toBe('completed');
    await page.reload();
    await expect(page.getByRole('button', { pressed: true }).filter({hasText: action.title})).toBeVisible();
    await page.screenshot({ path: '../../docs/audit/evidence/security-journey-persisted.png', fullPage: true });
  });

  test('service worker does not cache authenticated API responses', async ({ page, request }) => {
    const token = await signIn(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect(page.locator('#user-menu-btn')).toBeVisible();
    await page.goto('/passport');
    await expect(page.locator('body')).not.toContainText('Passport Unavailable');
    const cacheUrls = await page.evaluate(async () => {
      const keys = await caches.keys();
      const requests = await Promise.all(keys.map(async key => (await caches.open(key)).keys()));
      return requests.flat().map(request => request.url);
    });
    expect(cacheUrls.filter(url => url.includes(':8000/') || url.includes('/api/'))).toEqual([]);
    expect((await request.get(`${API}/api/v1/identity/me`, { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(200);
  });
});

test.describe('Functional honesty gate', () => {
  test('finance draft contains the retrieved plan, not a certificate', async ({page}) => {
    await page.goto('/login');
    await page.locator('#username').fill('finance@nagpur.gov.in');
    await page.locator('#password').fill('finance123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/interview');
    const planResponse = page.waitForResponse(response => response.url().includes('/enterprise/') && response.request().method() === 'GET');
    await page.goto('/counsellor/finance');
    const response = await planResponse;
    expect(response.ok()).toBe(true);
    const plan = await response.json();
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', {name: /Download Readiness Draft/}).click();
    const document = JSON.parse(await readFile((await (await downloaded).path())!, 'utf8'));
    expect(document.data).toEqual(plan);
    expect(document.document_type).toContain('not a certificate or sanction');
  });

  test('counterfactual uses saved evidence and does not invent a live batch', async ({page, request}) => {
    const token = await signIn(page);
    const headers = {Authorization: `Bearer ${token}`};
    const me = await (await request.get(`${API}/api/v1/beneficiaries/me`, {headers})).json();
    const passport = await (await request.get(`${API}/api/v1/beneficiaries/${me.id}/passport`, {headers})).json();
    await page.goto('/pathways');
    const recalc = page.waitForRequest(req => req.url().includes('counterfactual') && req.method() === 'POST');
    await page.getByRole('button', {name: '25 km', exact: true}).click();
    const payload = (await recalc).postDataJSON();
    expect(payload.candidate_skill_ids).toEqual(passport.skills.map((skill: {skill_id: string}) => skill.skill_id));
    expect(payload.base_profile.education).toEqual(passport.profile.education);
    await expect(page.locator('body')).not.toContainText('PM-AJAY-NAG-2026-B1');
  });

  test('field API failure renders an error instead of sample contacts', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('worker@nagpur.gov.in');
    await page.locator('#password').fill('worker123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/interview');
    await page.route(`${API}/api/v1/journey/cases**`, route => route.fulfill({status: 503, contentType: 'application/json', body: JSON.stringify({detail: 'Injected caseload outage'})}));
    await page.goto('/field');
    await expect(page.getByRole('heading', {name: 'Caseload unavailable'})).toBeVisible();
    await expect(page.locator('main')).toContainText('Injected caseload outage');
    await expect(page.locator('main')).not.toContainText('9876543210');
  });

  test('offline completion stays pending until same-account explicit sync', async ({ page, context, request }) => {
    const token = await signIn(page, 'audit.browser@example.invalid', 'audit-local-only-2026');
    const headers = {Authorization: `Bearer ${token}`};
    const me = await (await request.get(`${API}/api/v1/beneficiaries/me`, {headers})).json();
    const before = await (await request.get(`${API}/api/v1/journey/${me.id}`, {headers})).json();
    const next = before.action_plan.find((item: {status: string}) => item.status !== 'completed');
    expect(next).toBeTruthy();
    await page.goto('/journey');
    await expect(page.getByRole('heading', {name: next.title})).toBeVisible();
    await context.setOffline(true);
    await page.getByRole('button', {name: /Mark Completed/}).click();
    await expect(page.getByText(/Queued offline — not yet saved/)).toBeVisible();
    await expect(page.getByRole('heading', {name: next.title})).toBeVisible();
    await context.setOffline(false);
    const pending = await (await request.get(`${API}/api/v1/journey/${me.id}`, {headers})).json();
    expect(pending.action_plan.find((item: {id: string}) => item.id === next.id).status).toBe(next.status);
    await page.getByRole('button', {name: 'Sync my changes'}).click();
    await expect(page.getByText(/1 saved; 0 failed/)).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', {pressed: true}).filter({hasText: next.title})).toBeVisible();
  });

  test('confirmed interview evidence reaches passport and PostgreSQL', async ({ page, request }) => {
    const token = await signIn(page, 'audit.browser@example.invalid', 'audit-local-only-2026');
    const transcript = 'I repair engines and brakes at a garage. Independent browser evidence.';
    await page.locator('textarea').fill(transcript);
    await page.getByRole('button', {name: /Analyze My Skills/}).click();
    await page.getByRole('button', {name: /Confirm & Save/}).click();
    await page.getByRole('button', {name: /View My Skills/}).click();
    await expect(page).toHaveURL(/\/passport$/);
    await expect(page.locator('main')).toContainText(/Engine|Brake/);
    const headers = {Authorization: `Bearer ${token}`};
    const me = await (await request.get(`${API}/api/v1/beneficiaries/me`, {headers})).json();
    const passport = await (await request.get(`${API}/api/v1/beneficiaries/${me.id}/passport`, {headers})).json();
    expect(passport.skills.length).toBeGreaterThan(0);
    expect(passport.work_experiences.some((item: {raw_utterance: string}) => item.raw_utterance === transcript)).toBe(true);
    const result = execFileSync('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', 'postgres', '-d', 'lip_db', '-tAc', "SELECT count(*) FROM skill_evidence e JOIN beneficiaries_skills s ON s.id=e.beneficiary_skill_id JOIN beneficiaries b ON b.id=s.beneficiary_id WHERE b.user_id='audit-browser-beneficiary'"], {cwd: '../..', encoding: 'utf8'});
    expect(Number(result.trim())).toBeGreaterThan(0);
    await page.reload();
    await expect(page.locator('main')).toContainText(/Engine|Brake/);
  });

  test('admin exports actual API proposal as an explicitly labelled draft', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('admin@nagpur.gov.in');
    await page.locator('#password').fill('admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/interview');
    await page.goto('/admin');
    await page.getByRole('button', {name: /PM-AJAY Project Builder/}).click();
    await page.getByRole('button', {name: /Generate Project Proposal/}).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', {name: /Download Draft JSON/}).click();
    const download = await downloadPromise;
    const document = JSON.parse(await readFile((await download.path())!, 'utf8'));
    expect(document.document_type).toContain('not a certificate or sanction');
    expect(document.data.project_title).toContain('Nagpur');
    expect(document.truth_state).toBe('DEMO_DATA');
  });

  test('demo runtime never presents verified-live badges', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('✦ Demo / Reference').first()).toBeVisible();
    await expect(page.locator('[title="Truth State: LIVE"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('100% PWA Offline');
  });
});
