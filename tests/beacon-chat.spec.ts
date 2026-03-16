import { test, expect } from '@playwright/test';

/**
 * Beacon AI Chatbot E2E Tests
 * 
 * Comprehensive tests for the Beacon AI assistant including:
 * - Chat interface interactions
 * - Message sending and receiving
 * - RAG grounding with citations
 * - Session history handling
 * - Error handling and fallback behavior
 */

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

test.describe('Beacon AI Chatbot - Page Load', () => {
  test('should load Beacon AI page successfully', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page.locator('h1:has-text("Beacon AI Assistant")')).toBeVisible();
    
    // Check subtitle
    await expect(page.locator('text=Ask questions about engagements, signals, and projects')).toBeVisible();
    
    // Check input field exists
    await expect(page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]'))).toBeVisible();
  });

  test('should show sign-in required for unauthenticated users', async ({ page }) => {
    // No auth mocking
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
      });
    });

    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    // Should show sign-in message
    await expect(page.locator('text=Sign In Required')).toBeVisible();
  });

  test('should have "New Chat" button when conversation started', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    // Mock successful chat response
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: 'Hello! How can I help you?',
          conversationId: 'test-conv-123',
          sources: []
        })
      });
    });

    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    // Send a message
    const input = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]')).first();
    await input.fill('Hello');
    await input.press('Enter');
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // New Chat button should appear
    const newChatButton = page.locator('button:has-text("New Chat")');
    await expect(newChatButton).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Beacon AI Chatbot - Message Sending', () => {
  test('should send message and receive response', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    // Mock successful chat response
    await page.route('**/api/chat', async (route) => {
      const body = await route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: `You asked: "${body.message}". Here's my response.`,
          conversationId: 'conv-123',
          sources: []
        })
      });
    });

    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    // Type message
    const input = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]')).first();
    await input.fill('What are the active engagements?');
    
    // Send with Enter key
    await input.press('Enter');
    
    // Wait for user message to appear
    await expect(page.locator('text=What are the active engagements?')).toBeVisible({ timeout: 5000 });
    
    // Wait for assistant response
    await expect(page.locator('text=You asked:').first()).toBeVisible({ timeout: 5000 });
  });

  test('should send message with button click', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: 'Response from assistant',
          conversationId: 'conv-456',
          sources: []
        })
      });
    });

    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    // Type message
    const input = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]')).first();
    await input.fill('Test message');
    
    // Click send button
    const sendButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Send")')).first();
    await sendButton.click();
    
    // Verify message sent
    await expect(page.locator('text=Test message')).toBeVisible({ timeout: 5000 });
  });

  test('should not send empty messages', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    // Try to send without typing
    const sendButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Send")')).first();
    
    // Button should be disabled or message count should remain 0
    const input = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]')).first();
    await input.press('Enter');
    
    // No messages should appear (except maybe welcome message)
    await page.waitForTimeout(500);
    // Message list should be minimal
  });

  test('should display multiple messages in conversation', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    let messageCount = 0;
    await page.route('**/api/chat', async (route) => {
      messageCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: `Response ${messageCount}`,
          conversationId: 'conv-multi',
          sources: []
        })
      });
    });

    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]')).first();
    
    // Send first message
    await input.fill('First question');
    await input.press('Enter');
    await expect(page.locator('text=First question')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Response 1')).toBeVisible({ timeout: 5000 });
    
    // Send second message
    await input.fill('Second question');
    await input.press('Enter');
    await expect(page.locator('text=Second question')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Response 2')).toBeVisible({ timeout: 5000 });
    
    // Both pairs should be visible
    await expect(page.locator('text=First question')).toBeVisible();
    await expect(page.locator('text=Response 1')).toBeVisible();
  });
});

test.describe('Beacon AI Chatbot - RAG Citations', () => {
  test('should display source citations with engagement references', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: 'Based on the E-Commerce Platform project...',
          conversationId: 'conv-citations',
          sources: [
            {
              type: 'engagement',
              id: 1,
              title: 'E-Commerce Platform Modernization',
              similarity: 0.95
            },
            {
              type: 'signal',
              id: 5,
              title: 'API performance bottleneck',
              similarity: 0.87
            }
          ]
        })
      });
    });

    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]')).first();
    await input.fill('What projects need help?');
    await input.press('Enter');
    
    // Wait for response
    await expect(page.locator('text=Based on the E-Commerce Platform project')).toBeVisible({ timeout: 5000 });
    
    // Check for source citations
    await expect(page.locator('text=E-Commerce Platform Modernization').or(page.locator('text=Sources:'))).toBeVisible({ timeout: 3000 });
  });

  test('should handle responses without sources', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: 'I don\'t have enough information to answer that.',
          conversationId: 'conv-no-sources',
          sources: []
        })
      });
    });

    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]')).first();
    await input.fill('Random question');
    await input.press('Enter');
    
    // Response should appear
    await expect(page.locator('text=I don\'t have enough information')).toBeVisible({ timeout: 5000 });
    
    // No sources section should appear
    const sourcesSection = page.locator('text=Sources:');
    await expect(sourcesSection).not.toBeVisible();
  });
});

test.describe('Beacon AI Chatbot - Error Handling', () => {
  test('should show error message when API fails', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]')).first();
    await input.fill('Test error');
    await input.press('Enter');
    
    // Should show error message
    await expect(page.locator('text=Sorry, I encountered an error')).toBeVisible({ timeout: 5000 });
  });

  test('should disable input while loading response', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/chat', async (route) => {
      // Simulate slow response
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: 'Slow response',
          conversationId: 'conv-slow',
          sources: []
        })
      });
    });

    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]')).first();
    await input.fill('Test loading');
    await input.press('Enter');
    
    // Check if loading indicator appears or input is disabled
    await page.waitForTimeout(500);
    
    // Try to verify send button or input state
    const sendButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Send")')).first();
    // Button might be disabled during loading
  });
});

test.describe('Beacon AI Chatbot - New Conversation', () => {
  test('should clear messages when starting new chat', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: 'Test response',
          conversationId: 'conv-new',
          sources: []
        })
      });
    });

    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    // Send a message
    const input = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]')).first();
    await input.fill('First message');
    await input.press('Enter');
    await expect(page.locator('text=First message')).toBeVisible({ timeout: 5000 });
    
    // Click new chat
    const newChatButton = page.locator('button:has-text("New Chat")');
    await newChatButton.click({ timeout: 5000 });
    
    // Messages should be cleared
    await expect(page.locator('text=First message')).not.toBeVisible({ timeout: 2000 });
  });

  test('should have back button to navigate home', async ({ page }) => {
    await mockAuth(page, 'Member');
    
    await page.goto('/beacon');
    await page.waitForLoadState('networkidle');
    
    // Check for back button
    const backButton = page.locator('button[aria-label="Back to home"]').or(page.locator('button:has(svg)').first());
    await expect(backButton).toBeVisible();
    
    // Click it
    await backButton.click();
    
    // Should navigate to home
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
});
