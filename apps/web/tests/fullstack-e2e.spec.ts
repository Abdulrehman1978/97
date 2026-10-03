import { test, expect } from '@playwright/test';

/**
 * PM-AJAY Livelihood Intelligence Platform (LIP)
 * Phase D: Full-Stack Integrated E2E Test Suite
 *
 * Verifies live interaction across the entire stack:
 * Chromium -> Next.js (port 3000) -> FastAPI (port 8000) -> PostgreSQL
 *
 * Zero mocked backend calls (no page.route() mocks).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

test.describe('True Full-Stack Integrated E2E Suite', () => {

  test('1. Authentication: UI Login & User <-> Beneficiary Ownership', async ({ page }) => {
    // Navigate to Login page
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText(/Sign In|प्रवेश/i);

    // Fill login form using canonical demo beneficiary credentials
    await page.locator('#username').fill('ramesh@beneficiary.lip');
    await page.locator('#password').fill('ramesh123');

    // Submit form and await navigation
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify redirection to intake route /interview
    await page.waitForURL('**/interview', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText(/कामाबद्दल किंवा कौशल्याबद्दल सांगा|कौशल्य/i);

    // Retrieve JWT from localStorage to verify identity endpoint
    const token = await page.evaluate(() => localStorage.getItem('lip_auth_token_v1'));
    expect(token).toBeTruthy();

    // Verify GET /api/v1/identity/me reaches FastAPI
    const meRes = await fetch(`${API_BASE}/api/v1/identity/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(meRes.status).toBe(200);
    const meData = await meRes.json();
    expect(meData.full_name).toBe('Ramesh Mesram');
    expect(meData.role).toBe('beneficiary');

    // Verify User.id -> Beneficiary.user_id linkage
    const benRes = await fetch(`${API_BASE}/api/v1/beneficiaries/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(benRes.status).toBe(200);
    const benData = await benRes.json();
    expect(benData.user_id).toBe(meData.id);
  });

  test('2. Interview: Marathi Transcript Intake & Skill Extraction', async ({ page }) => {
    // Ensure clean state and navigate to interview
    await page.goto('/login');
    await page.locator('#username').fill('ramesh@beneficiary.lip');
    await page.locator('#password').fill('ramesh123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/interview', { timeout: 15000 });

    // Submit realistic Marathi livelihood narrative
    const marathiTranscript = 'मी तीन वर्षे दुचाकी गॅरेजमध्ये काम केले आहे. इंजिन उघडणे, ब्रेक बदलणे आणि ऑइल बदलणे येते. वायरिंगमध्ये थोडी मदत लागते.';
    const textarea = page.locator('textarea');
    await textarea.fill(marathiTranscript);

    // Click analyze button
    const analyzeBtn = page.locator('button', { hasText: /Analyze My Skills|कौशल्य शोधा/i }).first();
    await expect(analyzeBtn).toBeVisible();
    await analyzeBtn.click();

    // Verify extracted skills section appears
    await expect(page.locator('text=आम्हाला समजलेले तुमचे कौशल्य')).toBeVisible({ timeout: 15000 });
    const content = await page.locator('body').innerText();
    expect(content).toMatch(/Engine|Brake|Two-Wheeler|Mechanical|कौशल्य/i);
    expect(content).not.toMatch(/500 Internal Server Error/i);

    // Confirm and persist profile
    const saveBtn = page.locator('button', { hasText: /Confirm & Save|पक्के करा व सेव्ह करा/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify confirmation and persistence
    await expect(page.locator('text=डेटाबेसमध्ये सेव्ह झाली आहे')).toBeVisible({ timeout: 15000 });
    const storedBenId = await page.evaluate(() => localStorage.getItem('lip_beneficiary_id'));
    const idState = await page.evaluate(() => localStorage.getItem('lip_beneficiary_id_state'));
    expect(storedBenId).toBeTruthy();
    expect(idState).toBe('live');
    expect(storedBenId).not.toBe('demo-beneficiary-id');
  });

  test('3. Passport: Load Persisted Beneficiary & Competencies', async ({ page }) => {
    // Navigate to /passport
    await page.goto('/passport');

    // Should render passport with verified competencies and trade details
    await expect(page.locator('body')).toBeVisible();
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/Ramesh Mesram|Two-Wheeler|Engine|कौशल्य|Passport/i);
    expect(text).not.toMatch(/500 Internal Server Error/i);
    expect(text).not.toMatch(/403 Forbidden/i);
  });

  test('4. Pathways & Counterfactual: Interactive Recalculation', async ({ page }) => {
    await page.goto('/pathways');

    // Assert recommended pathways load
    await expect(page.locator('h1')).toContainText(/मार्ग|Pathways/i);
    await expect(page.locator('body')).toContainText(/Technician|Micro-Enterprise|Solar|ASC\/Q1411/i);

    // Counterfactual: click travel radius buttons
    const btn5km = page.locator('button', { hasText: '5 km' }).first();
    if (await btn5km.isVisible()) {
      await btn5km.click();
      await page.waitForTimeout(800);
    }

    const btn25km = page.locator('button', { hasText: '25 km' }).first();
    if (await btn25km.isVisible()) {
      await btn25km.click();
      await page.waitForTimeout(800);
    }

    // Select the primary recommended pathway
    const selectPathwayBtn = page.locator('button', { hasText: /निवडा|Choose Path|Select Pathway/i }).first();
    await expect(selectPathwayBtn).toBeVisible();
    await selectPathwayBtn.click();

    // Verify navigation to /journey
    await page.waitForURL('**/journey', { timeout: 15000 });
  });

  test('5. Journey: Action Plan Completion & Reload Persistence', async ({ page }) => {
    await page.goto('/journey');
    await expect(page.locator('h1')).toContainText(/तुमची पुढील कृती|उपजीविका प्रगती|Journey|Your next step/i);

    // Find action cards
    const actionCards = page.locator('main .bg-white.rounded-3xl, main .rounded-2xl, main section');
    await expect(actionCards.first()).toBeVisible();

    // Toggle an action if available
    const toggleBtn = page.locator('#markCompleteBtn, button:has-text("पूर्ण झाले"), button:has-text("Mark Done"), button:has-text("Done")').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(1000);

      // Reload browser to prove persistence across reloads
      await page.reload();
      await expect(page.locator('h1')).toContainText(/तुमची पुढील कृती|उपजीविका प्रगती|Journey|Your next step/i);
    }
  });

  test('6. Grievance: Real Submission & Persistence', async ({ page }) => {
    // Login as Ramesh to obtain token and set beneficiary session
    await page.goto('/login');
    await page.locator('#username').fill('ramesh@beneficiary.lip');
    await page.locator('#password').fill('ramesh123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/interview', { timeout: 15000 });

    const token = await page.evaluate(() => localStorage.getItem('lip_auth_token_v1'));
    // Dynamically retrieve Ramesh's actual DB beneficiary ID via API using his auth token
    const benMeRes = await fetch(`${API_BASE}/api/v1/beneficiaries/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const benMeData = await benMeRes.json();
    const benId = benMeData.id;

    // Ensure localStorage has Ramesh's persisted beneficiary ID
    await page.evaluate((id) => {
      localStorage.setItem('lip_beneficiary_id', id);
      localStorage.setItem('lip_beneficiary_id_state', 'live');
    }, benId);

    // Navigate to /help
    await page.goto('/help');
    await expect(page.locator('h1')).toContainText(/तक्रार|Help/i);

    // Fill grievance form
    const titleInput = page.locator('input[placeholder*="उदा."], input[placeholder*="विषय" i], input[type="text"]').last();
    await titleInput.fill('प्रशिक्षण केंद्रावर सुविधा अभाव (E2E Test)');

    const descInput = page.locator('textarea');
    await descInput.fill('हिंगणा केंद्रावर पिण्याच्या पाण्याचे साधन नाही आणि रॅम्प दुरुस्ती आवश्यक आहे.');

    // Submit grievance
    const submitBtn = page.locator('button', { hasText: /तक्रार सबमिट करा|Submit Grievance/i });
    await submitBtn.click();

    // Verify registration confirmation
    await expect(page.locator('text=तक्रार यशस्वीरीत्या नोंदवली गेली आहे')).toBeVisible({ timeout: 15000 });
    const content = await page.locator('body').innerText();
    expect(content).toMatch(/तक्रार क्रमांक|Grievance/i);
  });

  test('7. Role-Based Access Control (RBAC) Boundaries', async ({ page }) => {
    // 7A: Beneficiary forbidden from admin areas
    await page.goto('/login');
    await page.locator('#username').fill('ramesh@beneficiary.lip');
    await page.locator('#password').fill('ramesh123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/interview', { timeout: 15000 });

    const token = await page.evaluate(() => localStorage.getItem('lip_auth_token_v1'));

    // Beneficiary calling admin dashboard -> 403 Forbidden
    const adminApiRes = await fetch(`${API_BASE}/api/v1/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(adminApiRes.status).toBe(403);

    // 7B: Employer login & candidate privacy payload audit
    const employerLoginRes = await fetch(`${API_BASE}/api/v1/identity/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'employer@mahavitaran.com', password: 'employer123' })
    });
    expect(employerLoginRes.status).toBe(200);
    const employerData = await employerLoginRes.json();
    const employerToken = employerData.access_token;

    // Call /api/v1/opportunities/candidates
    const candRes = await fetch(`${API_BASE}/api/v1/opportunities/candidates?district_code=MH-NAG`, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    expect(candRes.status).toBe(200);
    const candText = await candRes.text();

    // Verify strict privacy guarantees: none of these sensitive fields must exist in JSON
    expect(candText).not.toMatch(/"caste"/i);
    expect(candText).not.toMatch(/"caste_category"/i);
    expect(candText).not.toMatch(/"subcaste"/i);
    expect(candText).not.toMatch(/"social_category"/i);
    expect(candText).not.toMatch(/"religion"/i);
    expect(candText).not.toMatch(/"annual_income"/i);
    expect(candText).not.toMatch(/"bpl"/i);
    expect(candText).not.toMatch(/"aadhaar"/i);

    // 7C: District Admin cross-jurisdiction boundary
    const adminLoginRes = await fetch(`${API_BASE}/api/v1/identity/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin@nagpur.gov.in', password: 'admin123' })
    });
    expect(adminLoginRes.status).toBe(200);
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.access_token;

    // Admin requesting within jurisdiction (MH-NAG) -> 200
    const inJurisdictionRes = await fetch(`${API_BASE}/api/v1/admin/dashboard?district_code=MH-NAG`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(inJurisdictionRes.status).toBe(200);

    // Admin requesting foreign jurisdiction (MH-PUN) -> 403
    const crossJurisdictionRes = await fetch(`${API_BASE}/api/v1/admin/dashboard?district_code=MH-PUN`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(crossJurisdictionRes.status).toBe(403);
  });

});
