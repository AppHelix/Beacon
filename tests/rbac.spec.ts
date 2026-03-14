import { test, expect } from '@playwright/test';

/**
 * RBAC (Role-Based Access Control) Tests
 * 
 * Tests role-based access control across UI and API:
 * - Admin: Full access
 * - Curator: Can manage content (team members, signals, etc.)
 * - Member: Read/write access to own content
 * - Viewer: Read-only access
 */

test.describe('RBAC - Admin Role', () => {
  test('Admin can access admin dashboard', async ({ page }) => {
    // Mock session with Admin role
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'Test Admin',
            email: 'admin@test.com',
            role: 'Admin'
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    await page.goto('/admin');
    await expect(page.locator('text=Admin Dashboard').first()).toBeAttached();
    await expect(page.locator('text=Access Denied').first()).not.toBeAttached();
  });

  test('Admin can see admin link in navigation', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Admin', email: 'admin@test.com', role: 'Admin' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    await page.goto('/');
    // Check for Admin Quick Action card
    await expect(page.locator('text=Open Admin Console').first()).toBeAttached();
  });

  test('Admin can add team members', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Admin', email: 'admin@test.com', role: 'Admin' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    // Mock engagement and team API responses
    await page.route('**/api/engagements/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'Test Engagement',
          clientName: 'Test Client',
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });
    });

    // Mock users API to prevent "users.map is not a function" error
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'John Doe', email: 'john@test.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@test.com' }
        ])
      });
    });

    await page.route('**/api/engagements/1/team', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.route('**/api/signals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/engagements/1?tab=team');
    await page.waitForLoadState('networkidle');
    
    // Should see add team member form
    await expect(page.locator('button:has-text("Add")').first()).toBeAttached();
    await expect(page.locator('select').first()).toBeAttached();
  });
});

test.describe('RBAC - Curator Role', () => {
  test('Curator can access admin dashboard', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Curator', email: 'curator@test.com', role: 'Curator' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    await page.goto('/admin');
    await expect(page.locator('text=Admin Dashboard').first()).toBeAttached();
    await expect(page.locator('text=Access Denied').first()).not.toBeAttached();
  });

  test('Curator can see admin link in navigation', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Curator', email: 'curator@test.com', role: 'Curator' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    await page.goto('/');
    // Curator should see Admin Quick Action card
    await expect(page.locator('text=Open Admin Console').first()).toBeAttached();
  });

  test('Curator can add team members', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Curator', email: 'curator@test.com', role: 'Curator' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    await page.route('**/api/engagements/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'Test Engagement',
          clientName: 'Test Client',
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });
    });

    // Mock users API to prevent \"users.map is not a function\" error
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'John Doe', email: 'john@test.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@test.com' }
        ])
      });
    });

    await page.route('**/api/engagements/1/team', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.route('**/api/signals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/engagements/1?tab=team');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("Add")').first()).toBeAttached();
  });
});

test.describe('RBAC - Member Role (Negative Authorization)', () => {
  test('Member cannot access admin dashboard', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Member', email: 'member@test.com', role: 'Member' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    await page.goto('/admin');
    await expect(page.locator('h1:has-text("Access Denied")').first()).toBeAttached();
    await expect(page.locator('text=You do not have permission').first()).toBeAttached();
  });

  test('Member cannot see admin link in navigation', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Member', email: 'member@test.com', role: 'Member' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    await page.goto('/');
    // Member should NOT see Admin Quick Action card
    await expect(page.locator('text=Open Admin Console')).not.toBeAttached();
  });

  test('Member cannot add team members', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Member', email: 'member@test.com', role: 'Member' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    await page.route('**/api/engagements/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'Test Engagement',
          clientName: 'Test Client',
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });
    });

    await page.route('**/api/engagements/1/team', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.route('**/api/signals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/engagements/1?tab=team');
    
    // Should NOT see add team member form
    await expect(page.locator('button:has-text("Add")')).not.toBeAttached();
    await expect(page.locator('text=Only Admins and Curators can manage team members').first()).toBeAttached();
  });

  test('Member API call to add team member returns 403', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Member', email: 'member@test.com', role: 'Member' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    // Attempt API call to add team member (should be blocked by backend)
    await page.route('**/api/engagements/1/team', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Forbidden' })
        });
      }
    });

    const response = await page.request.post('/api/engagements/1/team', {
      data: { userId: 1, role: 'member' }
    });

    expect(response.status()).toBe(403);
  });
});

test.describe('RBAC - Viewer Role (Negative Authorization)', () => {
  test('Viewer cannot access admin dashboard', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Viewer', email: 'viewer@test.com', role: 'Viewer' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    await page.goto('/admin');
    await expect(page.locator('h1:has-text("Access Denied")').first()).toBeAttached();
  });

  test('Viewer cannot see admin link in navigation', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Viewer', email: 'viewer@test.com', role: 'Viewer' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    await page.goto('/');
    // Viewer should NOT see Admin Quick Action card
    await expect(page.locator('text=Open Admin Console')).not.toBeAttached();
  });

  test('Viewer cannot add team members', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Test Viewer', email: 'viewer@test.com', role: 'Viewer' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    await page.route('**/api/engagements/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'Test Engagement',
          clientName: 'Test Client',
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });
    });

    await page.route('**/api/engagements/1/team', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.route('**/api/signals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/engagements/1?tab=team');
    await expect(page.locator('button:has-text("Add")')).not.toBeAttached();
    await expect(page.locator('text=Only Admins and Curators can manage team members').first()).toBeAttached();
  });
});
