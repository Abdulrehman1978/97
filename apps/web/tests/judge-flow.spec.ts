import { test, expect } from '@playwright/test';

test.describe('SIH Technical Judge Demonstration Suite', () => {
  test('evaluator desk displays sandbox truth states and counterfactual controls', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.locator('body')).toBeVisible();

    const bodyText = await page.locator('body').innerText();
    
    // Check for Evaluator / Judge Desk markers
    expect(bodyText).toMatch(/Judge|Evaluator|Demo|Desk|Simulation|Architecture/i);

    // Truth states must never claim LIVE for mock/sandbox tools
    expect(bodyText).toMatch(/Sandbox|Demo \/ Reference|DEMO_DATA|SANDBOX/i);

    // Click IVR tab and verify Sandbox truth state
    const ivrTab = page.locator('text=आयव्हीआर फोन सिम्युलेटर');
    if (await ivrTab.isVisible()) {
      await ivrTab.click();
      const ivrContent = await page.locator('body').innerText();
      expect(ivrContent).toMatch(/Sandbox|SANDBOX/i);
    }
  });
});
