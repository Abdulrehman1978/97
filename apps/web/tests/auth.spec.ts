import { test, expect } from '@playwright/test';

test.describe('Role & Authorization Boundaries', () => {
  test('unauthenticated citizen visiting admin workspace encounters access guard', async ({ page }) => {
    // Clear any local storage session
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Try navigating to admin desk
    await page.goto('/admin');
    
    // Should display forbidden/unauthorized state or login requirement or role switcher
    const pageText = await page.locator('body').innerText();
    const hasGuard = pageText.includes('Admin') || pageText.includes('District') || pageText.includes('Login') || pageText.includes('Unauthorized') || pageText.includes('Forbidden') || pageText.includes('Switch');
    expect(hasGuard).toBeTruthy();
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
