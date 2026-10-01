import { test, expect } from '@playwright/test';

test.describe('Role & Authorization Boundaries', () => {
  test('login page renders with sign-in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('body')).toContainText(/Sign In|प्रवेश|Login|Email|Phone/i);
    // Must have a username input
    const usernameInput = page.locator('#username');
    await expect(usernameInput).toBeVisible();
  });

  test('unauthenticated user navigating to interview sees interview page (open route)', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/interview');
    // Interview is intentionally a public/open intake route
    const text = await page.locator('body').innerText();
    const hasInterviewContent = /Voice|Mic|कौशल्य|Speak|बोलणे|Analyze/i.test(text);
    expect(hasInterviewContent).toBeTruthy();
  });

  test('navbar shows Sign In button when no token is in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('lip_auth_token_v1'));
    // Reload to trigger auth check
    await page.reload();
    await page.waitForTimeout(500);
    const navText = await page.locator('header').innerText();
    // Should show Sign In or have link to /login
    const hasSignIn = /Sign In|Login/i.test(navText);
    expect(hasSignIn).toBeTruthy();
  });

  test('employer workspace strictly maintains candidate privacy notice', async ({ page }) => {
    await page.goto('/employer');
    const pageText = await page.locator('body').innerText();
    expect(pageText).toMatch(/Employer|Candidate|Requisition|Privacy/i);
    // Explicit assertion that caste identity is never asked or displayed
    expect(pageText).not.toContain('Caste Category');
    expect(pageText).not.toContain('Sub-caste');
  });
});
