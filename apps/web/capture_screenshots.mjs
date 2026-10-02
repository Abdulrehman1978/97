import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, '../../docs/final-ui');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const CREDS = {
  field_worker: { username: 'worker@nagpur.gov.in', password: 'worker123' },
  financial_counsellor: { username: 'counsellor@nagpur.gov.in', password: 'counsel123' },
  provider: { username: 'provider@pmkk.gov.in', password: 'provider123' },
  employer: { username: 'employer@mahavitaran.com', password: 'employer123' },
  district_admin: { username: 'admin@nagpur.gov.in', password: 'admin123' },
  state_admin: { username: 'admin@nagpur.gov.in', password: 'admin123' },
};

async function getAuthToken(role) {
  const cred = CREDS[role];
  if (!cred) return null;
  try {
    const res = await fetch('http://localhost:8000/api/v1/identity/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cred)
    });
    if (res.ok) {
      const data = await res.json();
      return data.access_token;
    }
  } catch (e) {
    console.warn(`Could not login for role ${role}:`, e.message);
  }
  return null;
}

const ROUTES = [
  { name: '01-landing', path: '/' },
  { name: '02-login', path: '/login' },
  { name: '03-interview', path: '/interview' },
  { name: '04-passport', path: '/passport' },
  { name: '05-pathways', path: '/pathways' },
  { name: '06-journey', path: '/journey' },
  { name: '07-help', path: '/help' },
  { name: '08-field', path: '/field', role: 'field_worker' },
  { name: '09-finance-counsellor', path: '/counsellor/finance', role: 'financial_counsellor' },
  { name: '10-provider', path: '/provider', role: 'provider' },
  { name: '11-employer', path: '/employer', role: 'employer' },
  { name: '12-admin', path: '/admin', role: 'district_admin' },
  { name: '13-coordination', path: '/coordination', role: 'state_admin' },
  { name: '14-demo-desk', path: '/demo' },
];

async function main() {
  console.log('Launching browser to capture final visual evidence...');
  const browser = await chromium.launch({ headless: true });

  const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

  for (const route of ROUTES) {
    let token = null;
    if (route.role) {
      token = await getAuthToken(route.role);
    }

    // 1. Desktop
    {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 2
      });
      const page = await context.newPage();

      if (token) {
        await page.goto(`${BASE_URL}/login`);
        await page.evaluate(({ t, r }) => {
          localStorage.setItem('lip_auth_token_v1', t);
          localStorage.setItem('lip_auth_role', r);
          localStorage.setItem('lip_district_code', 'MH-NAG');
        }, { t: token, r: route.role });
      }

      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(1000);
      const outPath = path.join(OUT_DIR, `${route.name}-desktop.png`);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved: ${route.name}-desktop.png`);
      await context.close();
    }

    // 2. Mobile (390x844)
    {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2
      });
      const page = await context.newPage();

      if (token) {
        await page.goto(`${BASE_URL}/login`);
        await page.evaluate(({ t, r }) => {
          localStorage.setItem('lip_auth_token_v1', t);
          localStorage.setItem('lip_auth_role', r);
          localStorage.setItem('lip_district_code', 'MH-NAG');
        }, { t: token, r: route.role });
      }

      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(1000);
      const outPath = path.join(OUT_DIR, `${route.name}-mobile.png`);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved: ${route.name}-mobile.png`);
      await context.close();
    }
  }

  await browser.close();
  console.log(`All screenshots saved successfully to: ${OUT_DIR}`);
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
