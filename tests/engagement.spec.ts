import { test, expect } from '@playwright/test';

test.describe('Engagement Catalog', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the engagement catalog page
    await page.goto('/engagements', { waitUntil: 'networkidle' });

    // If redirected to signin, skip the test
    if (page.url().includes('signin')) {
      test.skip();
    }
  });

  test('should display engagement catalog page', async ({ page }) => {
    // Check if catalog heading is present
    await expect(page.locator('h1:has-text("Engagement Catalog")')).toBeVisible();
  });

  test('should have filters for search and status', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('input[placeholder*="Filter by name"]');
    await expect(searchInput).toBeVisible();

    // Check for status filter dropdown
    const statusSelect = page.locator('select').first();
    await expect(statusSelect).toBeVisible();
  });

  test('should filter engagements by search term', async ({ page }) => {
    // Get initial count of engagement cards
    const initialCards = page.locator('button:has-text("View Details")');
    const initialCount = await initialCards.count();

    if (initialCount > 0) {
      // Find the first engagement card
      const firstCard = page.locator('div.shadow').first();
      const cardText = await firstCard.textContent();

      // Extract a search term from the card (e.g., engagement name)
      const searchTerm = cardText?.split('\n')[0].split(' ')[0] || 'Project';

      // Search using the search input
      const searchInput = page.locator('input[placeholder*="Filter by name"]');
      await searchInput.fill(searchTerm);

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Check if cards are filtered
      const filteredCards = page.locator('button:has-text("View Details")');
      const filteredCount = await filteredCards.count();

      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should navigate to engagement detail page on View Details click', async ({ page }) => {
    // Look for View Details button
    const viewButton = page.locator('a:has-text("View Details")').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();

      // Should navigate to engagement detail page
      await page.waitForURL(/\/engagements\/\d+/);

      // Check for breadcrumb navigation
      const backLink = page.locator('a:has-text("Back to")');
      await expect(backLink).toBeVisible();
    }
  });
});

test.describe('Engagement Detail', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to catalog first
    await page.goto('/engagements', { waitUntil: 'networkidle' });

    if (page.url().includes('signin')) {
      test.skip();
    }

    // Click on first engagement if available
    const viewButton = page.locator('a:has-text("View Details")').first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForURL(/\/engagements\/\d+/);
    } else {
      test.skip();
    }
  });

  test('should display engagement detail page with tabs', async ({ page }) => {
    // Check for main heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Check for tabs
    const tabs = page.locator('button').filter({ hasText: /Overview|Signals|Details/ });
    expect(await tabs.count()).toBeGreaterThanOrEqual(2);
  });

  test('should switch tabs on click', async ({ page }) => {
    // Find and click Signals tab
    const signalsTab = page.locator('button:has-text("Signals")');

    if (await signalsTab.isVisible()) {
      await signalsTab.click();

      // Tab should be highlighted
      await expect(signalsTab).toHaveClass(/text-blue-600|bg-blue/);
    }
  });

  test('should display back to catalog link', async ({ page }) => {
    const backLink = page.locator('a:has-text("Back to Catalog")');
    await expect(backLink).toBeVisible();

    // Click and navigate back
    await backLink.click();
    await page.waitForURL('/engagements');
  });
});
