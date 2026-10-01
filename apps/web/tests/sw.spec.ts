import { test, expect } from '@playwright/test';

test.describe('PWA & Service Worker Functionality', () => {
  test('verifies web app manifest is available and properly formatted', async ({ request }) => {
    const res = await request.get('/manifest.json');
    expect(res.status()).toBe(200);
    const manifest = await res.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('verifies service worker script exists and is served', async ({ request }) => {
    const res = await request.get('/sw.js');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('install');
    expect(text).toContain('fetch');
  });
});
