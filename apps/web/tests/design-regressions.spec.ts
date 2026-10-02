import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const [route, username, password] of [
  ['field', 'worker@nagpur.gov.in', 'worker123'],
  ['provider', 'provider@pmkk.gov.in', 'provider123'],
  ['employer', 'employer@mahavitaran.com', 'employer123'],
  ['admin', 'admin@nagpur.gov.in', 'admin123'],
  ['coordination', 'worker@nagpur.gov.in', 'worker123'],
  ['counsellor/finance', 'finance@nagpur.gov.in', 'finance123'],
]) {
  test(`${route} authorized workspace fits mobile and desktop`, async ({page}) => {
    await page.goto('/login');
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/interview');
    await page.goto(`/${route}`);
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
    for (const width of [390, 1440]) {
      await page.setViewportSize({width, height: 900});
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${route} at ${width}`).toBeLessThanOrEqual(width);
      await page.screenshot({path: `../../docs/audit/evidence/redesign-${route.replace('/', '-')}-${width}.png`, fullPage: true});
    }
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`fieldbook layout fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('main').getByText('✦ Demo / Reference').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `../../docs/audit/evidence/redesign-home-${width}.png`, fullPage: true });
    if (width === 390 || width === 1440) {
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(scan.violations).toEqual([]);
    }
  });
}

test('authenticated beneficiary pages fit a 320px screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/login');
  await page.locator('#username').fill('ramesh@beneficiary.lip');
  await page.locator('#password').fill('ramesh123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/interview');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('lip_beneficiary_id'))).toBeTruthy();
  for (const route of ['interview', 'passport', 'pathways', 'journey', 'help']) {
    await page.goto(`/${route}`);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth), route).toBeLessThanOrEqual(320);
    await page.screenshot({path: `../../docs/audit/evidence/redesign-${route}-320.png`, fullPage: true});
  }
});
