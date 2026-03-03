import { test, expect } from '@playwright/test';

test('Login page loads and allows user to log in', async ({ page }) => {
  await page.goto('/login');

  // Check if login form is visible
  await expect(page.locator('form')).toBeVisible();

  // Fill in login form
  await page.fill('input[name="email"]', 'testuser@example.com');
  await page.fill('input[name="password"]', 'password123');

  // Submit the form
  await page.click('button[type="submit"]');

  // Check if redirected to dashboard
  await expect(page).toHaveURL('/dashboard');
});