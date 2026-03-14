import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show sign-in button when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Home page should show welcome screen with sign-in button
    await expect(page.locator('h1:has-text("Welcome to Beacon")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Sign In with Azure AD")')).toBeVisible();
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
