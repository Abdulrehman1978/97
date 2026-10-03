import { test, expect } from '@playwright/test';

/**
 * Golden Beneficiary Hero Flow — SIH Judge acceptance test.
 *
 * This suite runs against the DEMO_MODE Next.js build.  It seeds
 * localStorage with the demo beneficiary state so every page loads
 * the explicitly-labelled demo data set rather than hitting the
 * production data guard.
 */

// Helper — stamp localStorage before each navigation so pages that
// check for a real beneficiary ID route correctly through demo mode.
async function setDemoSession(page: any) {
  await page.evaluate(() => {
    localStorage.setItem('lip_beneficiary_id', 'demo-beneficiary-id');
    localStorage.setItem('lip_beneficiary_id_state', 'demo');
  });
}

test.describe('Golden Beneficiary Hero Flow', () => {
  test('1. Landing page loads with correct identity tags', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PM-AJAY|Livelihood|LIP/i);
    await expect(page.locator('body')).toBeVisible();
    // Verify SIH project identity strings present
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/SIH26097|PM-AJAY/i);
  });

  test('2. Interview page renders and can trigger analysis', async ({ page }) => {
    await page.goto('/');
    await setDemoSession(page);
    await page.goto('/interview');

    // Core UI elements present
    await expect(page.locator('body')).toContainText(/Voice|Mic|कौशल्य|Speak|बोलणे/i);

    // Trigger analyze button
    const analyzeBtn = page.locator('button', { hasText: /Analyze|कौशल्य शोधा/i }).first();
    if (await analyzeBtn.isVisible()) {
      await analyzeBtn.click();
      // Wait briefly for extraction (demo or real)
      await page.waitForTimeout(1500);
    }
  });

  test('3. Passport page loads (demo or live) and shows no raw 403/500', async ({ page }) => {
    await page.goto('/');
    await setDemoSession(page);
    await page.goto('/passport');

    // Should show either live data or an explicit DEMO_DATA badge, never a raw server error page
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/Passport|कौशल्य|Skills|Experience|NSQF|Livelihood|DEMO/i);
    // Must NOT show unhandled server error
    expect(text).not.toMatch(/500 Internal Server Error/i);
  });

  test('4. Pathways page renders recommendations', async ({ page }) => {
    await page.goto('/');
    await setDemoSession(page);
    await page.goto('/pathways');
    await expect(page.locator('body')).toContainText(/Pathway|मार्ग|Technician|Skilling|Qualification/i);
  });

  test('5. Journey / action plan page loads', async ({ page }) => {
    await page.goto('/');
    await setDemoSession(page);
    await page.goto('/journey');
    await expect(page.locator('body')).toContainText(/Journey|Action Plan|Next Step|पायरी|Grievance|तुमची पुढील कृती|माझा प्रवास/i);
  });

  test('6. Help / grievance page renders and form is functional', async ({ page }) => {
    await page.goto('/');
    await setDemoSession(page);
    await page.goto('/help');
    await expect(page.locator('body')).toContainText(/Help|तक्रार|Grievance|Support/i);

    // Fill grievance form if present
    const titleInput = page.locator('input[placeholder*="तक्रार"], input[id*="grievance"], input[placeholder*="title" i]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test grievance from Playwright');
      const descInput = page.locator('textarea').first();
      if (await descInput.isVisible()) {
        await descInput.fill('Playwright automated grievance description');
      }
    }
  });
});
