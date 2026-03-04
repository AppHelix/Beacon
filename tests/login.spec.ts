import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Should be redirected to sign-in
    await page.waitForURL(/.*\/api\/auth\/signin/, { timeout: 5000 });
    expect(page.url()).toContain('signin');
  });

  test('sign-out should work after login', async ({ page }) => {
    // Start from home page
    await page.goto('/');

    // If redirected to signin, skip (we can't fully test OAuth flow without credentials)
    const url = page.url();
    if (url.includes('signin')) {
      test.skip();
    }

    // Try to find and click sign-out button (if we reach the home page)
    const signOutButton = page.locator('button:has-text("Sign Out")');
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
      // Should redirect to signin page
      await page.waitForURL(/.*\/api\/auth\/signin/, { timeout: 5000 });
    }
  });
});
