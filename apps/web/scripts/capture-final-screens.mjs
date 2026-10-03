import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, '../../docs/v3-recovery/final-screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch();

  // Desktop context
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Mobile context
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });

  // Narrow mobile context (320px)
  const mobileNarrow = await browser.newContext({
    viewport: { width: 320, height: 568 },
    isMobile: true,
    hasTouch: true
  });

  console.log('Capturing screenshots to:', OUT_DIR);

  // Helper login
  async function loginAs(context, username, password) {
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#username', username);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    return page;
  }

  // 1. Home Desktop & Mobile
  {
    const page = await desktop.newPage();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '01_home_desktop.png') });
    await page.close();
  }
  {
    const page = await mobile.newPage();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '01_home_mobile.png') });
    await page.close();
  }
  {
    const page = await mobileNarrow.newPage();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '01_home_mobile_320px.png') });
    await page.close();
  }

  // 2. English & Hindi Mode
  {
    const page = await desktop.newPage();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const enBtn = page.locator('button', { hasText: 'EN' }).first();
    if (await enBtn.isVisible()) await enBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, '02_home_english_mode.png') });

    const hiBtn = page.locator('button', { hasText: 'हिंदी' }).first();
    if (await hiBtn.isVisible()) await hiBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, '02_home_hindi_mode.png') });
    await page.close();
  }

  // 3. Login Desktop & Mobile
  {
    const page = await desktop.newPage();
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '03_login_desktop.png') });
    await page.close();
  }
  {
    const page = await mobile.newPage();
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '03_login_mobile.png') });
    await page.close();
  }

  // 4. Interview States (State A, State B, State C)
  {
    const page = await desktop.newPage();
    await page.goto(`${BASE_URL}/interview`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '04_interview_state_a_intake.png') });

    // Fill transcript for State B
    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('मी तीन वर्षे दुचाकी गॅरेजमध्ये काम केले आहे. इंजिन उघडणे, ब्रेक बदलणे आणि ऑइल बदलणे येते.');
      const analyzeBtn = page.locator('button', { hasText: /कौशल्य शोधा|Analyze/i }).first();
      if (await analyzeBtn.isVisible()) {
        await analyzeBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(OUT_DIR, '04_interview_state_c_skills.png') });
      }
    }
    await page.close();
  }

  // 5. Passport (Empty & Populated)
  {
    // Empty / Unauthenticated
    const page = await desktop.newPage();
    await page.goto(`${BASE_URL}/passport`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '05_passport_empty.png') });
    await page.close();
  }
  {
    // Populated as Ramesh
    const benContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await loginAs(benContext, 'ramesh@beneficiary.lip', 'ramesh123');
    await page.goto(`${BASE_URL}/passport`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '05_passport_populated.png') });
    await benContext.close();
  }

  // 6. Pathways & Counterfactual (5km vs 25km)
  {
    const page = await desktop.newPage();
    await page.goto(`${BASE_URL}/pathways`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '06_pathways_15km.png') });

    const btn5 = page.locator('button', { hasText: '5 km' }).first();
    if (await btn5.isVisible()) {
      await btn5.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(OUT_DIR, '06_counterfactual_5km.png') });
    }

    const btn25 = page.locator('button', { hasText: '25 km' }).first();
    if (await btn25.isVisible()) {
      await btn25.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(OUT_DIR, '06_counterfactual_25km.png') });
    }
    await page.close();
  }

  // 7. Journey
  {
    const benContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await loginAs(benContext, 'ramesh@beneficiary.lip', 'ramesh123');
    await page.goto(`${BASE_URL}/journey`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '07_journey_desktop.png') });
    await benContext.close();
  }
  {
    const benContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await loginAs(benContext, 'ramesh@beneficiary.lip', 'ramesh123');
    await page.goto(`${BASE_URL}/journey`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '07_journey_mobile.png') });
    await benContext.close();
  }

  // 8. Help & Grievance
  {
    const page = await desktop.newPage();
    await page.goto(`${BASE_URL}/help`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '08_help_desktop.png') });
    await page.close();
  }

  // 9. Field Worker Desk
  {
    const fieldCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await loginAs(fieldCtx, 'worker@nagpur.gov.in', 'worker123');
    await page.goto(`${BASE_URL}/field`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '09_field_desk_desktop.png') });
    await fieldCtx.close();
  }

  // 10. Financial Counsellor Desk
  {
    const finCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await loginAs(finCtx, 'finance@nagpur.gov.in', 'finance123');
    await page.goto(`${BASE_URL}/counsellor/finance`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '10_finance_desk_desktop.png') });
    await finCtx.close();
  }

  // 11. Provider Portal
  {
    const provCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await loginAs(provCtx, 'provider@pmkk.gov.in', 'provider123');
    await page.goto(`${BASE_URL}/provider`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '11_provider_desk_desktop.png') });
    await provCtx.close();
  }

  // 12. Employer Portal
  {
    const empCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await loginAs(empCtx, 'employer@mahavitaran.com', 'employer123');
    await page.goto(`${BASE_URL}/employer`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '12_employer_desk_desktop.png') });
    await empCtx.close();
  }

  // 13. Admin Dashboard
  {
    const admCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await loginAs(admCtx, 'admin@nagpur.gov.in', 'admin123');
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '13_admin_dashboard_desktop.png') });
    await admCtx.close();
  }

  // 14. Coordination Portal
  {
    const admCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await loginAs(admCtx, 'admin@nagpur.gov.in', 'admin123');
    await page.goto(`${BASE_URL}/coordination`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '14_coordination_portal_desktop.png') });
    await admCtx.close();
  }

  // 15. Judge Desk (/demo)
  {
    const page = await desktop.newPage();
    await page.goto(`${BASE_URL}/demo`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '15_judge_desk_desktop.png') });
    await page.close();
  }
  {
    const page = await mobile.newPage();
    await page.goto(`${BASE_URL}/demo`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUT_DIR, '15_judge_desk_mobile.png') });
    await page.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
