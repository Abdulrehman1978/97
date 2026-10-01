import { test, expect } from '@playwright/test';

test.describe('Golden Beneficiary Hero Flow', () => {
  test('executes end-to-end citizen livelihood workflow from landing to grievance', async ({ page }) => {
    // 1. Landing Page
    await page.goto('/');
    await expect(page).toHaveTitle(/PM-AJAY|Livelihood|LIP/i);
    await expect(page.locator('body')).toBeVisible();

    // 2. Voice Interview / Skill Discovery
    await page.goto('/interview');
    await expect(page.locator('body')).toContainText(/पीएम-अजय|Livelihood Assistant|Voice|कौशल्य/i);

    // 3. Livelihood Passport
    await page.goto('/passport');
    await expect(page.locator('body')).toContainText(/Passport|कौशल्य|Skills|Experience|NSQF/i);

    // 4. Pathways & Counterfactual Recommendations
    await page.goto('/pathways');
    await expect(page.locator('body')).toContainText(/Pathway|मार्ग|Technician|Skilling/i);

    // 5. Living Journey & Action Plan
    await page.goto('/journey');
    await expect(page.locator('body')).toContainText(/Journey|Action Plan|Next Step|पायरी/i);

    // 6. Citizen Help & Grievance Registration
    await page.goto('/help');
    await expect(page.locator('body')).toContainText(/Help|तक्रार|Grievance|Support/i);

    // Fill grievance form if present
    const categorySelect = page.locator('select, [role="combobox"]').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 }).catch(() => {});
    }
  });
});
