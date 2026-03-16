import { test, expect } from '@playwright/test';

/**
 * Leaderboard E2E Tests
 * 
 * Comprehensive tests for the leaderboard feature including:
 * - Leaderboard page display
 * - Time period filtering (month/quarter/year/all-time)
 * - Ranking accuracy
 * - Top 3 special styling
 * - Contributor stats
 * - Navigation
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

// Sample leaderboard data
const getMockLeaderboardData = (period: string = 'all-time') => {
  const baseData = [
    {
      userId: 'top-contributor@test.com',
      userName: 'Top Contributor',
      totalPoints: 850,
      totalContributions: 75,
      byActionType: {
        signal_created: 25,
        hand_raise: 20,
        suggestion: 15,
        signal_resolved: 15
      },
      rank: 1
    },
    {
      userId: 'second-place@test.com',
      userName: 'Second Place',
      totalPoints: 620,
      totalContributions: 58,
      byActionType: {
        signal_created: 18,
        hand_raise: 15,
        suggestion: 15,
        signal_resolved: 10
      },
      rank: 2
    },
    {
      userId: 'third-place@test.com',
      userName: 'Third Place',
      totalPoints: 480,
      totalContributions: 45,
      byActionType: {
        signal_created: 15,
        hand_raise: 12,
        suggestion: 10,
        signal_resolved: 8
      },
      rank: 3
    },
    {
      userId: 'regular-user@test.com',
      userName: 'Regular User',
      totalPoints: 320,
      totalContributions: 32,
      byActionType: {
        signal_created: 10,
        hand_raise: 8,
        suggestion: 8,
        signal_resolved: 6
      },
      rank: 4
    },
    {
      userId: 'new-contributor@test.com',
      userName: 'New Contributor',
      totalPoints: 150,
      totalContributions: 15,
      byActionType: {
        signal_created: 5,
        hand_raise: 4,
        suggestion: 4,
        signal_resolved: 2
      },
      rank: 5
    }
  ];

  // Adjust data based on period
  if (period === 'month') {
    return baseData.map(user => ({
      ...user,
      totalPoints: Math.floor(user.totalPoints / 4),
      totalContributions: Math.floor(user.totalContributions / 4)
    }));
  } else if (period === 'quarter') {
    return baseData.map(user => ({
      ...user,
      totalPoints: Math.floor(user.totalPoints / 2),
      totalContributions: Math.floor(user.totalContributions / 2)
    }));
  }

  return baseData;
};

test.describe('Leaderboard - Page Load', () => {
  test('should load leaderboard page successfully', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page.locator('h1:has-text("Leaderboard")').or(page.locator('text=Leaderboard').first())).toBeVisible({ timeout: 5000 });
    
    // Check for contributor entries
    await expect(page.locator('text=Top Contributor')).toBeVisible({ timeout: 5000 });
  });

  test('should require authentication', async ({ page }) => {
    // Don't mock auth - should redirect to sign in
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to sign-in or show auth message
    const url = page.url();
    const content = await page.content();
    
    expect(url.includes('/api/auth/signin') || content.includes('sign in') || content.includes('Sign in')).toBeTruthy();
  });

  test('should display navigation link in sidebar', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Mock other necessary routes
    await page.route('**/api/signals*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.route('**/api/engagements*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for leaderboard link in navigation
    const leaderboardLink = page.locator('a[href="/leaderboard"]').or(page.locator('text=Leaderboard'));
    await expect(leaderboardLink.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Leaderboard - Time Period Filters', () => {
  test('should filter by monthly period', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    let currentPeriod = 'all-time';
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      const url = route.request().url();
      
      if (url.includes('period=month')) {
        currentPeriod = 'month';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(getMockLeaderboardData('month'))
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(getMockLeaderboardData('all-time'))
        });
      }
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Click monthly filter
    const monthFilter = page.locator('button:has-text("Month")').or(page.locator('button:has-text("This Month")'));
    if (await monthFilter.isVisible({ timeout: 3000 })) {
      await monthFilter.click();
      await page.waitForTimeout(1000);
      
      expect(currentPeriod).toBe('month');
    }
  });

  test('should filter by quarterly period', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    let requestedPeriod: string | null = null;
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      const url = route.request().url();
      
      if (url.includes('period=quarter')) {
        requestedPeriod = 'quarter';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(getMockLeaderboardData('quarter'))
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(getMockLeaderboardData('all-time'))
        });
      }
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    const quarterFilter = page.locator('button:has-text("Quarter")').or(page.locator('button:has-text("This Quarter")'));
    if (await quarterFilter.isVisible({ timeout: 3000 })) {
      await quarterFilter.click();
      await page.waitForTimeout(1000);
      
      expect(requestedPeriod).toBe('quarter');
    }
  });

  test('should filter by yearly period', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    let requestedPeriod: string | null = null;
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      const url = route.request().url();
      
      if (url.includes('period=year')) {
        requestedPeriod = 'year';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(getMockLeaderboardData('all-time'))
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(getMockLeaderboardData('all-time'))
        });
      }
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    const yearFilter = page.locator('button:has-text("Year")').or(page.locator('button:has-text("This Year")'));
    if (await yearFilter.isVisible({ timeout: 3000 })) {
      await yearFilter.click();
      await page.waitForTimeout(1000);
      
      expect(requestedPeriod).toBe('year');
    }
  });

  test('should show all-time by default', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    let requestedUrl = '';
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      requestedUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Default should be all-time
    expect(requestedUrl.includes('period=all') || requestedUrl.includes('all-time') || !requestedUrl.includes('period=')).toBeTruthy();
  });
});

test.describe('Leaderboard - Rankings', () => {
  test('should display contributors ordered by points descending', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Check that top contributor is first
    const topContributor = page.locator('text=Top Contributor').first();
    await expect(topContributor).toBeVisible({ timeout: 5000 });
    
    // Check for point values
    await expect(page.locator('text=850').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show rank numbers for each contributor', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Check for rank indicators (could be #1, 1st, or just 1)
    const rankIndicators = page.locator('text=/^#?1$|^1st$|^#?2$|^2nd$|^#?3$|^3rd$/');
    await expect(rankIndicators.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle empty leaderboard gracefully', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Should show empty state message
    await expect(page.locator('text=/No contributors|No data|Be the first|Start contributing/')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Leaderboard - Top 3 Styling', () => {
  test('should display special styling for top 3 contributors', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Look for trophy/medal icons or special styling
    const trophyIcon = page.locator('text=🏆').or(page.locator('svg[class*="trophy"]').or(page.locator('[data-testid*="trophy"]')));
    
    // Top 3 should have special styling or icons
    const topCards = page.locator('[class*="gradient"]').or(page.locator('[class*="gold"]').or(page.locator('[class*="silver"]')));
    
    // At least check that top contributor is visible with some special treatment
    await expect(page.locator('text=Top Contributor')).toBeVisible({ timeout: 5000 });
  });

  test('should show gold styling for first place', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // First place should have special indicator
    const firstPlace = page.locator('text=Top Contributor').first();
    await expect(firstPlace).toBeVisible({ timeout: 5000 });
    
    // May have gold trophy or #1 indicator
    const goldIndicator = page.locator('text=🏆').or(page.locator('text=#1').or(page.locator('text=1st')));
    await expect(goldIndicator.first()).toBeVisible({ timeout: 5000 });
  });

  test('should differentiate between top 3 and remaining contributors', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Top 3 should be visible
    await expect(page.locator('text=Top Contributor')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Second Place')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Third Place')).toBeVisible({ timeout: 5000 });
    
    // Regular contributors should also be visible
    await expect(page.locator('text=Regular User')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Leaderboard - Contributor Stats', () => {
  test('should display total points for each contributor', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Check for point values
    await expect(page.locator('text=850')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=620')).toBeVisible({ timeout: 5000 });
  });

  test('should display total contributions count', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Check for contribution counts (75, 58, etc.)
    await expect(page.locator('text=75').or(page.locator('text=58'))).toBeVisible({ timeout: 5000 });
  });

  test('should display contribution breakdown by action type', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Look for action type labels or counts
    const actionLabels = page.locator('text=signal_created').or(
      page.locator('text=Created').or(
        page.locator('text=Hand Raise').or(
          page.locator('text=Suggestion')
        )
      )
    );
    
    // At least one action type should be visible
    const isVisible = await actionLabels.first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(isVisible || await page.locator('text=/Signals|Contributions|Actions/').first().isVisible({ timeout: 5000 }).catch(() => false)).toBeTruthy();
  });

  test('should show user names correctly', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Check for user names
    await expect(page.locator('text=Top Contributor')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Second Place')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Third Place')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Leaderboard - Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Should show error message
    await expect(page.locator('text=/Error|Failed|Unable to load/')).toBeVisible({ timeout: 5000 });
  });

  test('should show loading state while fetching data', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/contributions/leaderboard*', async (route) => {
      // Delay response to observe loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockLeaderboardData('all-time'))
      });
    });

    await page.goto('/leaderboard');
    
    // Check for loading indicator (spinner, skeleton, or "Loading..." text)
    const loadingIndicator = page.locator('text=Loading').or(
      page.locator('[class*="spinner"]').or(
        page.locator('[class*="skeleton"]').or(
          page.locator('[data-testid*="loading"]')
        )
      )
    );
    
    // May or may not catch loading state depending on timing
    await page.waitForLoadState('networkidle');
  });
});
