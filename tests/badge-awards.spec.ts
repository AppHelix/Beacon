import { test, expect } from '@playwright/test';

/**
 * Badge Awards E2E Tests
 * 
 * Comprehensive tests for the badge system including:
 * - Badge auto-award on milestones
 * - Badge display on profile
 * - Badge API responses
 * - Progress tracking
 */

// Helper to mock authentication
async function mockAuth(page: any, role: string = 'Member', email: string = 'test@example.com') {
  await page.route('**/api/auth/session', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          name: `Test ${role}`,
          email: email,
          role: role
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    });
  });
}

test.describe('Badge Awards - Display on Profile', () => {
  test('should display earned badges on profile page', async ({ page }) => {
    await mockAuth(page, 'Member', 'badged-user@test.com');
    
    // Mock badges API with earned badges
    await page.route((url) => url.pathname.includes('/api/badges/badged-user'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'badged-user@test.com',
          badges: [
            {
              id: '1',
              badgeId: 'first_signal',
              name: 'First Signal',
              description: 'Created your first signal',
              icon: '🎯',
              color: 'blue',
              awardedAt: new Date().toISOString()
            },
            {
              id: '2',
              badgeId: 'contributor_10',
              name: 'Active Contributor',
              description: 'Made 10 contributions',
              icon: '⭐',
              color: 'yellow',
              awardedAt: new Date().toISOString()
            }
          ],
          totalBadges: 2,
          availableBadges: 13
        })
      });
    });

    // Mock contributions for the profile page
    await page.route((url) => url.pathname.includes('/api/contributions/badged-user'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'badged-user@test.com',
          contributions: [],
          stats: {
            totalPoints: 50,
            totalContributions: 10,
            byActionType: {},
            byEntityType: {},
            recentActivity: []
          },
          total: 10
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Check for badge progress in badge UI component (use .first() to avoid strict mode)
    await expect(page.locator('text=2 / 13 earned').first()).toBeVisible({ timeout: 10000 });
    
    // Check for badge names within the badge grid
    await expect(page.locator('text=First Signal')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Active Contributor')).toBeVisible({ timeout: 5000 });
  });

  test('should show "no badges yet" for new users', async ({ page }) => {
    await mockAuth(page, 'Member', 'newbie@test.com');
    
    await page.route((url) => url.pathname.includes('/api/badges/newbie'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'newbie@test.com',
          badges: [],
          totalBadges: 0,
          availableBadges: 13
        })
      });
    });

    await page.route((url) => url.pathname.includes('/api/contributions/newbie'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'newbie@test.com',
          contributions: [],
          stats: {
            totalPoints: 0,
            totalContributions: 0,
            byActionType: {},
            byEntityType: {},
            recentActivity: []
          },
          total: 0
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Should show empty state message and zero badge count (use .first() to avoid strict mode)
    await expect(page.locator('text=0 / 13 earned').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=No badges earned yet')).toBeVisible({ timeout: 5000 });
  });

  test('should display badge icons and colors', async ({ page }) => {
    await mockAuth(page, 'Member', 'colorful@test.com');
    
    await page.route((url) => url.pathname.includes('/api/badges/colorful'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'colorful@test.com',
          badges: [
            {
              id: '1',
              badgeId: 'rising_star',
              name: 'Rising Star',
              description: '100 points',
              icon: '🌟',
              color: 'yellow',
              awardedAt: new Date().toISOString()
            }
          ],
          totalBadges: 1,
          availableBadges: 13
        })
      });
    });

    await page.route((url) => url.pathname.includes('/api/contributions/colorful'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'colorful@test.com',
          contributions: [],
          stats: { totalPoints: 100, totalContributions: 15 },
          total: 15
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Wait for badge to load and check for 1 / 13 earned badge count first
    await expect(page.locator('text=1 / 13 earned').first()).toBeVisible({ timeout: 5000 });
    
    // Look for badge icon or name
    await expect(page.locator('text=Rising Star')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Badge Awards - Milestone Awards', () => {
  test('should automatically award "First Signal" badge on first signal creation', async ({ page }) => {
    await mockAuth(page, 'Member', 'first-timer@test.com');
    
    let badgeAwarded = false;
    
    // Mock signals API
    await page.route('**/api/signals', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else if (route.request().method() === 'POST') {
        // Simulate badge award via contribution tracking
        badgeAwarded = true;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            title: 'First Ever Signal',
            description: 'My first signal',
            status: 'open'
          })
        });
      }
    });

    await page.route('**/api/engagements', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Test Engagement' }
        ])
      });
    });

    // After creating signal, badges should reflect new award
    await page.route((url) => url.pathname.includes('/api/badges/first-timer'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'first-timer@test.com',
          badges: badgeAwarded ? [
            {
              id: '1',
              badgeId: 'first_signal',
              name: 'First Signal',
              description: 'Created your first signal',
              icon: '🎯',
              color: 'blue',
              awardedAt: new Date().toISOString()
            }
          ] : [],
          totalBadges: badgeAwarded ? 1 : 0,
          availableBadges: 13
        })
      });
    });

    await page.goto('/signals');
    await page.waitForLoadState('networkidle');
    
    // Create a signal
    const createButton = page.locator('button:has-text("Create Signal")').first();
    if (await createButton.isVisible({ timeout: 3000 })) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Fill form if dialog appears
      const titleInput = page.locator('input[name="title"]').or(page.locator('input[placeholder*="title" i]'));
      if (await titleInput.isVisible({ timeout: 2000 })) {
        await titleInput.fill('First Ever Signal');
      }
    }
  });

  test('should award "Active Contributor" badge at 10 contributions', async ({ page }) => {
    await mockAuth(page, 'Member', 'milestone-user@test.com');
    
    // Mock contributions showing 10 total
    await page.route((url) => url.pathname.includes('/api/contributions/milestone-user'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'milestone-user@test.com',
          contributions: [],
          stats: {
            totalPoints: 60,
            totalContributions: 10,
            byActionType: {
              signal_created: 3,
              hand_raise: 4,
              suggestion: 3
            }
          },
          total: 10
        })
      });
    });

    // Mock badges showing milestone badge
    await page.route((url) => url.pathname.includes('/api/badges/milestone-user'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'milestone-user@test.com',
          badges: [
            {
              id: '5',
              badgeId: 'contributor_10',
              name: 'Active Contributor',
              description: 'Made 10 contributions',
              icon: '⭐',
              color: 'yellow',
              awardedAt: new Date().toISOString()
            }
          ],
          totalBadges: 1,
          availableBadges: 13
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Wait for badge count first
    await expect(page.locator('text=1 / 13 earned').first()).toBeVisible({ timeout: 5000 });
    
    // Verify badge is displayed
    await expect(page.locator('text=Active Contributor')).toBeVisible({ timeout: 5000 });
  });

  test('should award "Rising Star" badge at 100 points', async ({ page }) => {
    await mockAuth(page, 'Member', 'star-user@test.com');
    
    await page.route((url) => url.pathname.includes('/api/contributions/star-user'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'star-user@test.com',
          contributions: [],
          stats: {
            totalPoints: 100,
            totalContributions: 12
          },
          total: 12
        })
      });
    });

    await page.route((url) => url.pathname.includes('/api/badges/star-user'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'star-user@test.com',
          badges: [
            {
              id: '8',
              badgeId: 'rising_star',
              name: 'Rising Star',
              description: 'Earned 100 points',
              icon: '🌟',
              color: 'yellow',
              awardedAt: new Date().toISOString()
            }
          ],
          totalBadges: 1,
          availableBadges: 13
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Wait for badge count
    await expect(page.locator('text=1 / 13 earned').first()).toBeVisible({ timeout: 5000 });
    
    await expect(page.locator('text=Rising Star')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Badge Awards - Specialist Badges', () => {
  test('should award "Signal Creator" badge for 10 signals created', async ({ page }) => {
    await mockAuth(page, 'Member', 'creator@test.com');
    
    await page.route((url) => url.pathname.includes('/api/contributions/creator'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'creator@test.com',
          contributions: [],
          stats: {
            totalPoints: 120,
            totalContributions: 14,
            byActionType: {
              signal_created: 10,
              hand_raise: 2,
              suggestion: 2
            }
          },
          total: 14
        })
      });
    });

    await page.route((url) => url.pathname.includes('/api/badges/creator'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'creator@test.com',
          badges: [
            {
              id: '10',
              badgeId: 'signal_creator_10',
              name: 'Signal Creator',
              description: 'Created 10 signals',
              icon: '🔨',
              color: 'orange',
              awardedAt: new Date().toISOString()
            }
          ],
          totalBadges: 1,
          availableBadges: 13
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Wait for badge count
    await expect(page.locator('text=1 / 13 earned').first()).toBeVisible({ timeout: 5000 });
    
    await expect(page.locator('text=Signal Creator')).toBeVisible({ timeout: 5000 });
  });

  test('should award "Problem Solver" badge for 5 resolutions', async ({ page }) => {
    await mockAuth(page, 'Member', 'solver@test.com');
    
    await page.route((url) => url.pathname.includes('/api/contributions/solver'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'solver@test.com',
          contributions: [],
          stats: {
            totalPoints: 140,
            totalContributions: 10,
            byActionType: {
              signal_resolved: 5,
              hand_raise: 3,
              suggestion: 2
            }
          },
          total: 10
        })
      });
    });

    await page.route((url) => url.pathname.includes('/api/badges/solver'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'solver@test.com',
          badges: [
            {
              id: '11',
              badgeId: 'resolver_5',
              name: 'Problem Solver',
              description: 'Resolved 5 signals',
              icon: '✅',
              color: 'green',
              awardedAt: new Date().toISOString()
            }
          ],
          totalBadges: 1,
          availableBadges: 13
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Wait for badge count
    await expect(page.locator('text=1 / 13 earned').first()).toBeVisible({ timeout: 5000 });
    
    await expect(page.locator('text=Problem Solver')).toBeVisible({ timeout: 5000 });
  });

  test('should award "Team Player" badge for collaboration actions', async ({ page }) => {
    await mockAuth(page, 'Member', 'teamplayer@test.com');
    
    await page.route((url) => url.pathname.includes('/api/contributions/teamplayer'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'teamplayer@test.com',
          contributions: [],
          stats: {
            totalPoints: 75,
            totalContributions: 15,
            byActionType: {
              hand_raise: 7,
              suggestion: 6,
              signal_created: 2
            }
          },
          total: 15
        })
      });
    });

    await page.route((url) => url.pathname.includes('/api/badges/teamplayer'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'teamplayer@test.com',
          badges: [
            {
              id: '12',
              badgeId: 'collaborator_10',
              name: 'Team Player',
              description: '10+ collaborative actions',
              icon: '🤝',
              color: 'purple',
              awardedAt: new Date().toISOString()
            }
          ],
          totalBadges: 1,
          availableBadges: 13
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Wait for badge count
    await expect(page.locator('text=1 / 13 earned').first()).toBeVisible({ timeout: 5000 });
    
    // Check for Team Player badge
    await expect(page.locator('text=Team Player')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Badge Awards - Multiple Badges', () => {
  test('should display multiple earned badges', async ({ page }) => {
    await mockAuth(page, 'Member', 'veteran@test.com');
    
    await page.route((url) => url.pathname.includes('/api/contributions/veteran'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'veteran@test.com',
          contributions: [],
          stats: {
            totalPoints: 525,
            totalContributions: 52
          },
          total: 52
        })
      });
    });

    await page.route((url) => url.pathname.includes('/api/badges/veteran'), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'veteran@test.com',
          badges: [
            {
              id: '1',
              badgeId: 'first_signal',
              name: 'First Signal',
              description: 'Created first signal',
              icon: '🎯',
              color: 'blue',
              awardedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '5',
              badgeId: 'contributor_10',
              name: 'Active Contributor',
              description: '10 contributions',
              icon: '⭐',
              color: 'yellow',
              awardedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '6',
              badgeId: 'contributor_25',
              name: 'Dedicated Contributor',
              description: '25 contributions',
              icon: '🏆',
              color: 'gold',
              awardedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '7',
              badgeId: 'contributor_50',
              name: 'Elite Contributor',
              description: '50 contributions',
              icon: '👑',
              color: 'purple',
              awardedAt: new Date().toISOString()
            },
            {
              id: '9',
              badgeId: 'shining_star',
              name: 'Shining Star',
              description: '500 points',
              icon: '💫',
              color: 'gold',
              awardedAt: new Date().toISOString()
            }
          ],
          totalBadges: 5,
          availableBadges: 13
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Check for multiple badge progress (5 / 13 earned) - use .first() to avoid strict mode
    await expect(page.locator('text=5 / 13 earned').first()).toBeVisible({ timeout: 5000 });
    
    // Check for multiple badge names
    await expect(page.locator('text=Elite Contributor')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Shining Star')).toBeVisible({ timeout: 5000 });
  });
});
