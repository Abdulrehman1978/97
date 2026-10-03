import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../../');
const OUT_DIR = path.resolve(__dirname, '../../../docs/v3-recovery/final-screens');
const CONTACT_DIR = path.resolve(OUT_DIR, 'contact-sheets');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(CONTACT_DIR, { recursive: true });

const BASE_URL = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch();
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  console.log('Capturing missing evidence screenshots to:', OUT_DIR);

  // 1. Marathi mode
  {
    console.log('Capturing 02_home_marathi_mode.png...');
    const page = await desktop.newPage();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const mrBtn = page.locator('button', { hasText: 'मराठी' }).first();
    if (await mrBtn.isVisible()) {
      await mrBtn.click();
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: path.join(OUT_DIR, '02_home_marathi_mode.png') });
    await page.close();
  }

  // 2. Interview State B & State C
  {
    console.log('Capturing 04_interview_state_b_transcript_review.png and State C...');
    const page = await desktop.newPage();
    await page.goto(`${BASE_URL}/interview`);
    await page.waitForLoadState('networkidle');

    // Fill manual transcript
    const textarea = page.locator('#manual-work-story');
    if (await textarea.isVisible()) {
      await textarea.fill('मी तीन वर्षे दुचाकी गॅरेजमध्ये काम केले आहे. इंजिन उघडणे, ब्रेक बदलणे आणि ऑइल बदलणे येते.');
    }

    // Submit to State B
    const reviewBtn = page.locator('#submit-voice-btn');
    if (await reviewBtn.isVisible()) {
      await reviewBtn.click();
      await page.waitForSelector('#transcript-edit-area', { timeout: 10000 });
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: path.join(OUT_DIR, '04_interview_state_b_transcript_review.png') });

    // Click Analyze Skills to transition to State C
    const analyzeBtn = page.locator('#analyze-skills-btn');
    if (await analyzeBtn.isVisible()) {
      await analyzeBtn.click();
      await page.waitForSelector('text=पायरी ३ / ३', { timeout: 15000 });
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: path.join(OUT_DIR, '04_interview_state_c_skills_extracted.png') });
    await page.close();
  }

  // 3. Counterfactuals 5km and 25km
  {
    console.log('Capturing 06_counterfactual_5km.png and 25km...');
    const page = await desktop.newPage();
    await page.goto(`${BASE_URL}/pathways`);
    await page.waitForLoadState('networkidle');

    // 5 km
    const btn5 = page.locator('button', { hasText: /5 km|५ किमी|Within 5/i }).first();
    if (await btn5.isVisible()) {
      await btn5.click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(OUT_DIR, '06_counterfactual_5km.png') });
    }

    // 25 km
    const btn25 = page.locator('button', { hasText: /25 km|२५ किमी|Within 25/i }).first();
    if (await btn25.isVisible()) {
      await btn25.click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(OUT_DIR, '06_counterfactual_25km.png') });
    }
    await page.close();
  }

  await desktop.close();

  // 4. Duplicate-hash scan and Manifest Generation
  console.log('Generating SHA-256 manifest and duplicate-hash scan...');
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png')).sort();
  const hashes = new Map();
  const duplicates = [];
  const manifestEntries = [];

  const metadataMap = {
    '01_home_desktop.png': { route: '/', role: 'public / beneficiary', viewport: '1440x900', state: 'LIVE', desc: 'Hero landing page with livelihood mechanic imagery and 4-step pipeline' },
    '01_home_mobile.png': { route: '/', role: 'public / beneficiary', viewport: '390x844', state: 'LIVE', desc: 'Mobile landing page with responsive action buttons and safe-area insets' },
    '01_home_mobile_320px.png': { route: '/', role: 'public / beneficiary', viewport: '320x568', state: 'LIVE', desc: 'Ultra-narrow viewport verified without horizontal scroll or overflow' },
    '02_home_marathi_mode.png': { route: '/', role: 'public / beneficiary', viewport: '1440x900', state: 'LIVE', desc: 'Full homepage interface rendered in Marathi (मराठी) locale' },
    '02_home_hindi_mode.png': { route: '/', role: 'public / beneficiary', viewport: '1440x900', state: 'LIVE', desc: 'Full homepage interface rendered in Hindi (हिंदी) locale' },
    '02_home_english_mode.png': { route: '/', role: 'public / beneficiary', viewport: '1440x900', state: 'LIVE', desc: 'Full homepage interface rendered in English (EN) locale' },
    '03_login_desktop.png': { route: '/login', role: 'anonymous / all roles', viewport: '1440x900', state: 'LIVE', desc: 'Unified citizen sign-in desk with quick demo switcher' },
    '03_login_mobile.png': { route: '/login', role: 'anonymous / all roles', viewport: '390x844', state: 'LIVE', desc: 'Mobile view of the citizen sign-in desk' },
    '04_interview_state_a_intake.png': { route: '/interview', role: 'beneficiary', viewport: '1440x900', state: 'ADAPTER_READY', desc: 'State A: Voice intake hub with live waveform and typing drawer' },
    '04_interview_state_b_transcript_review.png': { route: '/interview', role: 'beneficiary', viewport: '1440x900', state: 'DRAFT', desc: 'State B: Transcript review & edit before skill extraction' },
    '04_interview_state_c_skills_extracted.png': { route: '/interview', role: 'beneficiary', viewport: '1440x900', state: 'LIVE', desc: 'State C: Confirmed skills, detected tools, and bridge gap modules' },
    '05_passport_empty.png': { route: '/passport', role: 'anonymous / new user', viewport: '1440x900', state: 'UNVERIFIED', desc: 'Unauthenticated exploration state inviting profile creation' },
    '05_passport_populated.png': { route: '/passport', role: 'beneficiary (Ramesh)', viewport: '1440x900', state: 'LIVE', desc: 'Authoritative Skills Passport with RPL readiness and competencies' },
    '06_pathways_15km.png': { route: '/pathways', role: 'beneficiary', viewport: '1440x900', state: 'LIVE', desc: 'Baseline 15km pathway cards with occupation photography' },
    '06_counterfactual_5km.png': { route: '/pathways', role: 'beneficiary', viewport: '1440x900', state: 'LIVE', desc: 'Adaptive recalculation for constrained 5km local travel radius' },
    '06_counterfactual_25km.png': { route: '/pathways', role: 'beneficiary', viewport: '1440x900', state: 'LIVE', desc: 'Expanded regional opportunity set for 25km travel radius' },
    '07_journey_desktop.png': { route: '/journey', role: 'beneficiary', viewport: '1440x900', state: 'LIVE', desc: 'Dominant Next Action card with persisted action checklist' },
    '07_journey_mobile.png': { route: '/journey', role: 'beneficiary', viewport: '390x844', state: 'LIVE', desc: 'Mobile view of the living action plan with safe-area spacing' },
    '08_help_desktop.png': { route: '/help', role: 'beneficiary / citizen', viewport: '1440x900', state: 'LIVE', desc: 'Tri-split support desk: Callback (SANDBOX), Grievance (LIVE), FAQs' },
    '09_field_desk_desktop.png': { route: '/field', role: 'field_worker', viewport: '1440x900', state: 'LIVE', desc: 'Field Worker Desk with priority queue and typed FieldCaseViewModel' },
    '10_finance_desk_desktop.png': { route: '/counsellor/finance', role: 'financial_counsellor', viewport: '1440x900', state: 'LIVE', desc: 'Financial Counsellor desk with capital composition and JSON export' },
    '11_provider_desk_desktop.png': { route: '/provider', role: 'provider', viewport: '1440x900', state: 'LIVE', desc: 'VTC Training Provider portal with batch capacity management' },
    '12_employer_desk_desktop.png': { route: '/employer', role: 'employer', viewport: '1440x900', state: 'LIVE', desc: 'Privacy-safe employer portal with candidate matching rationale' },
    '13_admin_dashboard_desktop.png': { route: '/admin', role: 'district_admin', viewport: '1440x900', state: 'LIVE', desc: 'Nagpur District Livelihood Intelligence planning dashboard' },
    '14_coordination_portal_desktop.png': { route: '/coordination', role: 'district_admin', viewport: '1440x900', state: 'LIVE', desc: 'Inter-agency coordination and referral handoff workflow desk' },
    '15_judge_desk_desktop.png': { route: '/demo', role: 'evaluator / judge', viewport: '1440x900', state: 'SANDBOX', desc: '3-minute visual proof chain: Person → Voice → Skills → Action' },
    '15_judge_desk_mobile.png': { route: '/demo', role: 'evaluator / judge', viewport: '390x844', state: 'SANDBOX', desc: 'Mobile evaluation layout of the Judge Demo Desk' },
  };

  for (const file of files) {
    const filePath = path.join(OUT_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    if (hashes.has(hash)) {
      duplicates.push({ file1: hashes.get(hash), file2: file, hash });
    } else {
      hashes.set(hash, file);
    }

    const meta = metadataMap[file] || {
      route: 'unknown',
      role: 'unknown',
      viewport: '1440x900',
      state: 'LIVE',
      desc: 'UI evidence snapshot',
    };

    manifestEntries.push({
      file,
      ...meta,
      hash,
      sizeKb: (buffer.length / 1024).toFixed(1)
    });
  }

  console.log(`Duplicate hash scan complete. Total files: ${files.length}. Duplicates found: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.warn('Duplicate hashes detected:', duplicates);
  }

  // 5. Build FINAL_SCREENSHOT_MANIFEST.md
  let manifestMd = `# SIH26097 — V3 FINAL SCREENSHOT EVIDENCE MANIFEST\n\n`;
  manifestMd += `Total Screenshots: **${files.length}**  \n`;
  manifestMd += `Duplicate SHA-256 Collisions: **${duplicates.length}**  \n`;
  manifestMd += `Generated Timestamp: \`${new Date().toISOString()}\`  \n\n`;
  manifestMd += `| # | Filename | Route | Role / Persona | Viewport | Truth State | Size (KB) | SHA-256 Digest | Description |\n`;
  manifestMd += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  manifestEntries.forEach((entry, idx) => {
    manifestMd += `| ${idx + 1} | \`${entry.file}\` | \`${entry.route}\` | ${entry.role} | \`${entry.viewport}\` | \`${entry.state}\` | ${entry.sizeKb} KB | \`${entry.hash.slice(0, 16)}...\` | ${entry.desc} |\n`;
  });

  manifestMd += `\n## Complete SHA-256 Checksums\n\n\`\`\`\n`;
  manifestEntries.forEach(entry => {
    manifestMd += `${entry.hash}  ${entry.file}\n`;
  });
  manifestMd += `\`\`\`\n`;

  fs.writeFileSync(path.resolve(ROOT_DIR, 'docs/v3-recovery/FINAL_SCREENSHOT_MANIFEST.md'), manifestMd, 'utf8');
  console.log('Manifest written to docs/v3-recovery/FINAL_SCREENSHOT_MANIFEST.md');

  // 6. Generate Contact Sheets via Playwright HTML rendering
  console.log('Generating contact sheets...');

  async function createContactSheet(sheetName, imageList, title, subtitle) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    const cardsHtml = imageList.map(imgName => {
      const imgPath = path.join(OUT_DIR, imgName);
      if (!fs.existsSync(imgPath)) return '';
      const base64 = fs.readFileSync(imgPath).toString('base64');
      const meta = metadataMap[imgName] || {};
      return `
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="padding: 10px 14px; background: #0f4c81; color: white; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 14px; font-family: monospace;">${imgName}</span>
            <span style="font-size: 11px; background: #002d54; padding: 2px 8px; border-radius: 4px;">${meta.viewport || '1440x900'}</span>
          </div>
          <div style="padding: 6px 12px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
            ${meta.desc || ''}
          </div>
          <div style="padding: 8px; flex: 1; display: flex; align-items: center; justify-content: center; background: #f1f5f9;">
            <img src="data:image/png;base64,${base64}" style="max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />
          </div>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 32px; }
            .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #0f4c81; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 26px; font-weight: 800; color: #0f4c81; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
            .badge { background: #dbeafe; color: #1e40af; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">${title}</div>
              <div class="subtitle">${subtitle} • LUNA Livelihood Intelligence Platform (SIH26097)</div>
            </div>
            <div class="badge">V3 FROZEN RELEASE EVIDENCE</div>
          </div>
          <div class="grid">
            ${cardsHtml}
          </div>
        </body>
      </html>
    `;

    await page.setContent(html);
    await page.waitForTimeout(1000);
    const contentHandle = await page.$('body');
    await contentHandle.screenshot({ path: path.join(CONTACT_DIR, sheetName) });
    await page.close();
    console.log(`Contact sheet generated: ${sheetName}`);
  }

  // Contact Sheet 1: Beneficiary Flow
  await createContactSheet(
    'beneficiary-flow.png',
    [
      '01_home_desktop.png',
      '04_interview_state_a_intake.png',
      '04_interview_state_b_transcript_review.png',
      '04_interview_state_c_skills_extracted.png',
      '05_passport_populated.png',
      '06_pathways_15km.png',
      '07_journey_desktop.png',
      '08_help_desktop.png'
    ],
    'Beneficiary Core Experience & Living Journey',
    '8-Step Golden Flow: Home → Voice Intake → Review → Skills Extract → Passport → Pathways → Action Journey → Support'
  );

  // Contact Sheet 2: Professional Workspaces
  await createContactSheet(
    'professional-workspaces.png',
    [
      '09_field_desk_desktop.png',
      '10_finance_desk_desktop.png',
      '11_provider_desk_desktop.png',
      '12_employer_desk_desktop.png',
      '13_admin_dashboard_desktop.png',
      '14_coordination_portal_desktop.png'
    ],
    'Professional Governance & Operational Workspaces',
    'Field Worker, Financial Counsellor, Training Provider, Industry Partner, District Admin & Inter-Agency Coordination'
  );

  // Contact Sheet 3: Localization
  await createContactSheet(
    'localization.png',
    [
      '02_home_marathi_mode.png',
      '02_home_hindi_mode.png',
      '02_home_english_mode.png'
    ],
    'Deterministic Multilingual System (मराठी • हिंदी • EN)',
    'Full UI localization without translation lag or bilingual card density'
  );

  // Contact Sheet 4: Judge Flow
  await createContactSheet(
    'judge-flow.png',
    [
      '15_judge_desk_desktop.png',
      '06_counterfactual_5km.png',
      '06_pathways_15km.png',
      '06_counterfactual_25km.png'
    ],
    'Technical Judge Proof Chain & Counterfactual Modeling',
    '3-Minute Evaluator Desk and travel constraint adaptation (5km vs 15km vs 25km)'
  );

  await browser.close();
  console.log('All evidence artifacts and contact sheets successfully created!');
}

main().catch(err => {
  console.error('Evidence generation failed:', err);
  process.exit(1);
});
