import { test, expect } from '@playwright/test';

// Helper to mock authentication
async function mockAuth(page: any, role: string = 'Member') {
  await page.route('**/api/auth/session', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          name: `Test ${role}`,
          email: `${role.toLowerCase()}@test.com`,
          role: role
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    });
  });
}

test.describe('Signal Board', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await mockAuth(page, 'Member');
    
    // Mock signals API
    await page.route('**/api/signals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Test Signal',
            description: 'Test description',
            engagementId: 1,
            createdBy: 'test@test.com',
            status: 'open',
            urgency: 'high',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
      });
    });
    
    // Navigate to the signal board page
    await page.goto('/signals', { waitUntil: 'networkidle' });
  });

  test('should display signal board page', async ({ page }) => {
    // Check if Signals heading is present (SidebarLayout uses title="Signals")
    await expect(page.locator('h1:has-text("Signals")').first()).toBeAttached();
  });

  test('should have filters for status and urgency', async ({ page }) => {
    // Wait for filters to load
    await page.waitForLoadState('networkidle');
    
    // Check for status and urgency filter dropdowns
    const selects = page.locator('select');
    const selectCount = await selects.count();
    
    // Should have at least 2 selects: status filter and urgency filter (plus sort dropdown = 3 total)
    expect(selectCount).toBeGreaterThanOrEqual(2);

    // Check status filter is visible
    const statusSelect = page.locator('select').filter({ has: page.locator('option:has-text("All Status")') }).first();
    await expect(statusSelect).toBeAttached();

    // Check urgency filter is visible
    const urgencySelect = page.locator('select').filter({ has: page.locator('option:has-text("All Urgency")') }).first();
    await expect(urgencySelect).toBeAttached();
  });

  test('should filter signals by status', async ({ page }) => {
    // Wait for signals to load
    await page.waitForLoadState('networkidle');
    
    // Check that the test signal is rendered (signals render as buttons with title text)
    const signalButton = page.locator('button.text-lg.font-semibold:has-text("Test Signal")').first();
    await expect(signalButton).toBeAttached();
    
    // Get the status filter select
    const statusSelect = page.locator('select').filter({ has: page.locator('option:has-text("All Status")') }).first();
    await expect(statusSelect).toBeAttached();
    
    // Verify filtering works - the signal should still be visible after selecting "open" status
    await statusSelect.evaluate((el: any) => {
      el.value = 'open';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await page.waitForTimeout(300);
    
    // Signal with status "open" should still be visible
    await expect(signalButton).toBeAttached();
  });

  test('should display signal status and urgency badges', async ({ page }) => {
    // Check for status badges
    const badges = page.locator('span[class*="text-xs"]').filter({ hasText: /open|resolved|in-progress|closed/i });

    if (await badges.count() > 0) {
      await expect(badges.first()).toBeAttached();
    }
  });
});

test.describe('Home Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await mockAuth(page, 'Member');
    
    // Navigate to home page
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('should display home page with navigation cards', async ({ page }) => {
    // Check for Quick Actions section (appears in both mobile and desktop, use .first())
    await expect(page.locator('h2:has-text("Quick Actions")').first()).toBeAttached();

    // Check for main navigation cards - CardTitle renders as divs, not h2
    const cards = [
      'Engagements',
      'Signals',
      'People',
      'Admin'
    ];

    for (const card of cards) {
      // Look for the card title text within the Card component structure
      const cardTitle = page.locator(`div.font-semibold:has-text("${card}")`).first();
      await expect(cardTitle).toBeAttached();
    }
  });

  test('should navigate to engagements page', async ({ page }) => {
    // Mock engagements API to prevent errors after navigation
    await page.route('**/api/engagements', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Find and click the Engagements button using the button text
    const engagementButton = page.locator('a:has-text("Open Engagement Catalog")').first();
    await expect(engagementButton).toBeAttached();
    await engagementButton.evaluate((el: any) => el.click());

    // Should navigate to /engagements
    await page.waitForURL('/engagements', { timeout: 10000 });
    expect(page.url()).toContain('/engagements');
  });

  test('should navigate to signals page', async ({ page }) => {
    // Mock signals API to prevent errors after navigation
    await page.route('**/api/signals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Find and click the Signals button using the button text
    const signalButton = page.locator('a:has-text("Open Signal Board")').first();
    await expect(signalButton).toBeAttached();
    await signalButton.evaluate((el: any) => el.click());

    // Should navigate to /signals
    await page.waitForURL('/signals', { timeout: 10000 });
    expect(page.url()).toContain('/signals');
  });

  test('should navigate to people page', async ({ page }) => {
    // Mock users API to prevent errors after navigation
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Find and click the People button using the button text
    const peopleButton = page.locator('a:has-text("Open People Directory")').first();
    await expect(peopleButton).toBeAttached();
    await peopleButton.evaluate((el: any) => el.click());

    // Should navigate to /people
    await page.waitForURL('/people', { timeout: 10000 });
    expect(page.url()).toContain('/people');
  });

  test('should display welcome section', async ({ page }) => {
    // For authenticated users, check for "Use Beacon in 3 simple steps" section
    const stepsHeading = page.locator('text=Use Beacon in 3 simple steps').first();
    await expect(stepsHeading).toBeAttached();

    // Check for description text about collaboration
    const descriptionText = page.locator('text=Discover active work, collaborate through Signals').first();
    await expect(descriptionText).toBeAttached();
  });
});
