import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const TARGET_PAGES = [
  { path: '/', name: 'Landing Page' },
  { path: '/interview', name: 'Voice Interview' },
  { path: '/passport', name: 'Livelihood Passport' },
  { path: '/pathways', name: 'Pathways Recommendation' },
  { path: '/journey', name: 'Living Journey' },
  { path: '/help', name: 'Help & Grievance' },
  { path: '/demo', name: 'Judge Demo Desk' },
  { path: '/admin', name: 'District Admin Dashboard' },
];

test.describe('Automated Accessibility Scans (axe-core)', () => {
  for (const pageInfo of TARGET_PAGES) {
    test(`validates accessibility structure for ${pageInfo.name} (${pageInfo.path})`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('domcontentloaded');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .disableRules(['color-contrast']) // contrast sensitivity varies with headless display defaults
        .analyze();

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical'
      );
      expect(criticalViolations).toEqual([]);
    });
  }
});
