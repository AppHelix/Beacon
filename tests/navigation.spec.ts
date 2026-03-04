import { test, expect } from '@playwright/test';

test.describe('Signal Board', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the signal board page
    await page.goto('/signals', { waitUntil: 'networkidle' });

    // If redirected to signin, skip the test
    if (page.url().includes('signin')) {
      test.skip();
    }
  });

  test('should display signal board page', async ({ page }) => {
    // Check if signal board heading is present
    await expect(page.locator('h1:has-text("Signal Board")')).toBeVisible();
  });

  test('should have filters for status and urgency', async ({ page }) => {
    // Check for status filter dropdown
    const selects = page.locator('select');
    expect(await selects.count()).toBeGreaterThanOrEqual(2);

    // First select should be status filter
    const statusSelect = selects.first();
    await expect(statusSelect).toBeVisible();

    // Check for options
    const options = statusSelect.locator('option');
    expect(await options.count()).toBeGreaterThanOrEqual(1);
  });

  test('should filter signals by status', async ({ page }) => {
    // Get initial signal count
    const initialSignals = page.locator('div:has(>h3)');
    const initialCount = await initialSignals.count();

    if (initialCount > 0) {
      // Select a status filter
      const statusSelect = page.locator('select').first();
      const options = await statusSelect.locator('option').all();

      if (options.length > 1) {
        // Select the second option (first status)
        await statusSelect.selectOption({ index: 1 });

        // Wait for filter to apply
        await page.waitForTimeout(500);

        // Check filtered count
        const filteredSignals = page.locator('div:has(>h3)');
        const filteredCount = await filteredSignals.count();

        expect(filteredCount).toBeLessThanOrEqual(initialCount);
      }
    }
  });

  test('should display signal status and urgency badges', async ({ page }) => {
    // Check for status badges
    const badges = page.locator('span[class*="text-xs"]').filter({ hasText: /open|resolved|in-progress|closed/i });

    if (await badges.count() > 0) {
      await expect(badges.first()).toBeVisible();
    }
  });
});

test.describe('Home Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/', { waitUntil: 'networkidle' });

    // If redirected to signin, skip
    if (page.url().includes('signin')) {
      test.skip();
    }
  });

  test('should display home page with navigation cards', async ({ page }) => {
    // Check for Beacon title
    await expect(page.locator('h1:has-text("Beacon")')).toBeVisible();

    // Check for main navigation cards
    const cards = [
      'Engagements',
      'Signals',
      'People',
      'Admin'
    ];

    for (const card of cards) {
      const cardHeading = page.locator(`h2:has-text("${card}")`);
      expect(await cardHeading.isVisible()).toBeTruthy();
    }
  });

  test('should navigate to engagements page', async ({ page }) => {
    // Click on Engagements card
    const engagementCard = page.locator('a').filter({ has: page.locator('h2:has-text("Engagements")') }).first();
    await engagementCard.click();

    // Should navigate to /engagements
    await page.waitForURL('/engagements');
    expect(page.url()).toContain('/engagements');
  });

  test('should navigate to signals page', async ({ page }) => {
    // Click on Signals card
    const signalCard = page.locator('a').filter({ has: page.locator('h2:has-text("Signals")') }).first();
    await signalCard.click();

    // Should navigate to /signals
    await page.waitForURL('/signals');
    expect(page.url()).toContain('/signals');
  });

  test('should navigate to people page', async ({ page }) => {
    // Click on People card
    const peopleCard = page.locator('a').filter({ has: page.locator('h2:has-text("People")') }).first();
    await peopleCard.click();

    // Should navigate to /people
    await page.waitForURL('/people');
    expect(page.url()).toContain('/people');
  });

  test('should display welcome section', async ({ page }) => {
    // Check for welcome section
    const welcomeHeading = page.locator('h2:has-text("Welcome to Beacon")');
    await expect(welcomeHeading).toBeVisible();

    // Check for description text
    const descriptionText = page.locator('text=collaborative platform');
    await expect(descriptionText).toBeVisible();
  });
});
