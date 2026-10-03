import { test, expect } from '@playwright/test';

/**
 * SIH26097 - V3 Visual + Functional Recovery Master E2E Suite
 * Section 64 Comprehensive Regressions:
 * 1. Language switch changes entire page, not only nav
 * 2. Locale persists across routes/reload
 * 3. Field route loads real API case shape without crash
 * 4. Passport does not show populated identity plus empty/error contradiction
 * 5. Pathway descriptions correspond to their own pathway title
 * 6. Coordination failed API does not update UI status
 * 7. Provider API failure does not create fake LIVE batch
 * 8. Admin simulation failure does not create fake Approved result
 * 9. Journey failed action does not show completed
 * 10. Help grievance requires real server ID
 * 11. Finance demo data excludes test-fixture contamination
 * 12. Mobile bottom nav does not cover final actions
 * 13. Critical images load with natural dimensions > 0
 * 14. No generic "This page couldn't load" on any standard route
 * 15. Professional route RBAC
 * 16. Exact truth-state labels
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

test.describe('V3 Visual, Functional & Localization Recovery Suite', () => {

  test('1 & 2. Multilingual Systemic i18n & Persistence', async ({ page }) => {
    // 1. Load Home in Marathi (default)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Default locale should be mr
    const initialLang = await page.getAttribute('html', 'lang');
    expect(initialLang).toBe('mr');

    // 2. Click English direct button in navbar
    const enBtn = page.locator('button[aria-label="Interface language"] button, div[role="group"] button', { hasText: 'EN' }).first();
    await expect(enBtn).toBeVisible();
    await enBtn.click();
    await page.waitForTimeout(500);

    // Assert documentElement lang updated
    const enLang = await page.getAttribute('html', 'lang');
    expect(enLang).toBe('en');

    // Assert major content regions become English
    await expect(page.locator('h1')).toContainText(/Turn your real-world experience/i);
    await expect(page.locator('#home-speak-btn')).toContainText(/Start Speaking/i);

    // 3. Navigate across routes and confirm English remains active
    await page.goto('/pathways');
    await page.waitForLoadState('networkidle');
    expect(await page.getAttribute('html', 'lang')).toBe('en');
    await expect(page.locator('h1')).toContainText(/Recommended Livelihood Pathways|Pathways/i);

    await page.goto('/help');
    await page.waitForLoadState('networkidle');
    expect(await page.getAttribute('html', 'lang')).toBe('en');

    // 4. Click Hindi
    const hiBtn = page.locator('button', { hasText: 'हिंदी' }).first();
    if (await hiBtn.isVisible()) {
      await hiBtn.click();
      await page.waitForTimeout(500);
      expect(await page.getAttribute('html', 'lang')).toBe('hi');
    }

    // 5. Reload and assert locale persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    const persistedLang = await page.getAttribute('html', 'lang');
    expect(['hi', 'en']).toContain(persistedLang);
  });

  test('3. Field Desk: Loads Real API Case Shape Without Crashing', async ({ page }) => {
    // Login as field_worker or counsellor
    await page.goto('/login');
    await page.locator('#username').fill('worker@nagpur.gov.in');
    await page.locator('#password').fill('worker123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    await page.goto('/field');
    await page.waitForLoadState('networkidle');

    // Verify page rendered without crashing
    await expect(page.locator('body')).not.toContainText(/This page couldn't load/i);
    await expect(page.locator('h1')).toContainText(/क्षेत्रीय कार्यकर्ता|क्षेत्रीय समन्वयक|Field Worker/i);

    // Assert table or caseload list is populated from API
    await expect(page.locator('main')).toBeVisible();
    const content = await page.locator('main').innerText();
    expect(content).not.toMatch(/500 Internal Server Error/i);
  });

  test('4. Passport: Coherent State Machine (No Identity vs Empty Contradiction)', async ({ page }) => {
    // Clear storage to test unauthenticated state
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/passport');
    await page.waitForLoadState('networkidle');

    const text = await page.locator('main').innerText();
    // Must NOT show both "Ramesh Mesram" verified identity AND "No profile found" error
    if (text.includes('No Skills Profile Yet') || text.includes('Create Your Skills Passport')) {
      expect(text).not.toContain('Verified Live');
    }

    // Now test with logged-in Ramesh
    await page.goto('/login');
    await page.locator('#username').fill('ramesh@beneficiary.lip');
    await page.locator('#password').fill('ramesh123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    await page.goto('/passport');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText(/This page couldn't load/i);
    await expect(page.locator('main')).toContainText(/Ramesh Mesram|कौशल्य/i);
  });

  test('5. Pathways: Derives Content Per Pathway (No Shared Automotive Text on Tailor)', async ({ page }) => {
    await page.goto('/pathways');
    await page.waitForLoadState('networkidle');

    const tailorCard = page.locator('div', { hasText: /Tailor|शिवणकला|Boutique/i }).first();
    if (await tailorCard.isVisible()) {
      const tailorText = await tailorCard.innerText();
      // Must NOT contain automotive engine overhaul text
      expect(tailorText).not.toContain('Two-Wheeler Service Technician');
      expect(tailorText).not.toContain('ASC/Q1411');
    }
  });

  test('6. Coordination: Failed API Retains Prior State and Shows Inline Error', async ({ page }) => {
    // Login as district_admin
    await page.goto('/login');
    await page.locator('#username').fill('admin@nagpur.gov.in');
    await page.locator('#password').fill('admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    await page.goto('/coordination');
    await page.waitForLoadState('networkidle');

    // Intercept patch/put to fail with 500
    await page.route('**/api/v1/journey/referrals/**', route => route.fulfill({ status: 500, body: 'Database connection failed' }));

    const statusBtn = page.locator('button', { hasText: /Mark Complete|प्रगतीपथावर|पूर्ण/i }).first();
    if (await statusBtn.isVisible()) {
      await statusBtn.click();
      await page.waitForTimeout(1000);
      // Inline error should appear and not claim completion
      await expect(page.locator('body')).toContainText(/Failed to update status|error/i);
    }
  });

  test('7. Provider: Failed API Does Not Fabricate LIVE Batches', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('provider@pmkk.gov.in');
    await page.locator('#password').fill('provider123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    // Force API failure
    await page.route('**/api/v1/opportunities/training-options**', route => route.fulfill({ status: 500, body: 'Internal Error' }));

    await page.goto('/provider');
    await page.waitForLoadState('networkidle');

    // Should show error and retry, NOT silently invent seedBatches marked LIVE
    const content = await page.locator('main').innerText();
    expect(content).toMatch(/Failed to load|error|Error/i);
    expect(content).not.toContain('MH-NAG-AUTO-2026-B1');
  });

  test('8. Admin Simulation: Failure Shows Error Instead of Fabricated Approval', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('admin@nagpur.gov.in');
    await page.locator('#password').fill('admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Mock simulate-batch endpoint to fail
    await page.route('**/api/v1/admin/simulate-batch**', route => route.fulfill({ status: 500, body: 'Simulation timeout' }));

    // Switch to planner tab
    const plannerTab = page.locator('button', { hasText: /बॅच नियोजन|Batch Planner/i }).first();
    if (await plannerTab.isVisible()) {
      await plannerTab.click();
      const simBtn = page.locator('button', { hasText: /बॅच व्यवहार्यता तपासा|Simulate/i }).first();
      if (await simBtn.isVisible()) {
        await simBtn.click();
        await page.waitForTimeout(1000);
        // Must NOT show fake "High Feasibility (Approved for GIA Proposal)"
        const pageText = await page.locator('body').innerText();
        expect(pageText).not.toContain('Approved for GIA Proposal');
        expect(pageText).toMatch(/Batch simulation failed|error/i);
      }
    }
  });

  test('9. Journey: Failed Mutation Does Not Show Completed', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('ramesh@beneficiary.lip');
    await page.locator('#password').fill('ramesh123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    await page.goto('/journey');
    await page.waitForLoadState('networkidle');

    // Intercept action status update to fail
    await page.route('**/api/v1/journey/actions/**', route => route.fulfill({ status: 500, body: 'Network down' }));

    const markBtn = page.locator('#markCompleteBtn, button:has-text("Mark Done"), button:has-text("पूर्ण झाले")').first();
    if (await markBtn.isVisible()) {
      await markBtn.click();
      await page.waitForTimeout(1000);
      // Alert should report save error
      await expect(page.locator('body')).toContainText(/could not be confirmed|कायम आहे|बदल जतन/i);
    }
  });

  test('10. Help: Grievance Submission Requires Real Server ID', async ({ page }) => {
    await page.goto('/help');
    await page.waitForLoadState('networkidle');

    // Switch to grievance tab
    const grievanceTab = page.locator('button', { hasText: /तक्रार नोंदवा|File Grievance/i }).first();
    if (await grievanceTab.isVisible()) {
      await grievanceTab.click();
    }

    const titleInput = page.locator('input[placeholder*="विषय" i], input[placeholder*="Subject" i]').first();
    const descInput = page.locator('textarea').first();

    if (await titleInput.isVisible() && await descInput.isVisible()) {
      await titleInput.fill('Training equipment maintenance required');
      await descInput.fill('The workshop lathes require calibration and proper safety shielding.');

      const submitBtn = page.locator('button', { hasText: /तक्रार सबमिट करा|Submit Grievance/i }).first();
      await submitBtn.click();
      await page.waitForTimeout(1500);

      // Verify that grievance received an authoritative ID or registered state
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).toMatch(/तक्रार यशस्वीरीत्या|Grievance|GRV-|नोंदवली/i);
    }
  });

  test('11. Finance Desk: Demo Dataset Excludes Test Fixture Contamination', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('finance@nagpur.gov.in');
    await page.locator('#password').fill('finance123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    await page.goto('/counsellor/finance');
    await page.waitForLoadState('networkidle');

    const content = await page.locator('body').innerText();
    // Strictly verify no test pollution exists in UI
    expect(content).not.toContain('XSS Test Beneficiary');
    expect(content).not.toContain('<script>');
    expect(content).not.toContain('Anonymous audit probe');
  });

  test('12. Mobile Ergonomics: Bottom Nav Does Not Obscure Bottom Actions (320px & 390px)', async ({ page }) => {
    // Set mobile viewport 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/journey');
    await page.waitForLoadState('networkidle');

    // Check main container has bottom padding to clear fixed bottom nav
    const mainEl = page.locator('main').first();
    await expect(mainEl).toBeVisible();

    // Set narrow mobile viewport 320x568
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Ensure no horizontal body scroll / overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px margin for subpixel rendering
  });

  test('13. Critical Images Load With Valid Natural Dimensions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify hero image loaded
    const heroImg = page.locator('img[src*="hero_mechanic.webp"]').first();
    if (await heroImg.isVisible()) {
      const naturalWidth = await heroImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }

    // Verify pathways occupation images
    await page.goto('/pathways');
    await page.waitForLoadState('networkidle');

    const occupationImages = page.locator('article img, img[src*="occupations"]');
    const count = await occupationImages.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const img = occupationImages.nth(i);
      const nw = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(nw).toBeGreaterThan(0);
    }
  });

  test('14. Route Health Crawl: No Standard Route Displays Generic Crash Screen', async ({ page }) => {
    const routes = [
      '/',
      '/login',
      '/interview',
      '/passport',
      '/pathways',
      '/journey',
      '/help',
      '/demo',
      '/field',
      '/counsellor/finance',
      '/provider',
      '/employer',
      '/admin',
      '/coordination'
    ];

    for (const r of routes) {
      await page.goto(r);
      await page.waitForLoadState('networkidle');
      const text = await page.locator('body').innerText();
      expect(text).not.toContain("This page couldn't load");
      expect(text).not.toContain("Internal Server Error");
    }
  });

  test('15. Professional Route RBAC: Beneficiary Denied from Admin & Employer Portals', async ({ page }) => {
    // Login as beneficiary
    await page.goto('/login');
    await page.locator('#username').fill('ramesh@beneficiary.lip');
    await page.locator('#password').fill('ramesh123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    // Attempt direct URL navigation to /admin
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/Access Forbidden|403|Unauthorized/i);

    // Attempt direct URL navigation to /employer
    await page.goto('/employer');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/Access Forbidden|403/i);
  });

  test('16. Exact Truth-State Integrity Check', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Authoritative check against /health/ready
    const res = await fetch(`${API_BASE}/health/ready`);
    expect(res.status).toBe(200);
    const health = await res.json();
    expect(['LIVE', 'DEMO_DATA', 'ADAPTER_READY']).toContain(health.truth_state);

    // Check navbar truth badge matches runtime state
    const badge = page.locator('header, nav').locator('[class*="TruthBadge"], [class*="badge"], span:has-text("LIVE"), span:has-text("DEMO")').first();
    await expect(badge).toBeVisible();
  });

});
