import { test, expect } from '@playwright/test';
import { setupAuthenticatedState, clearAuthState, loginViaUI } from './utils/auth-helper';
import { mockAuthResponse, testCredentials } from './fixtures/test-data';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Mock the API response
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockAuthResponse),
      });
    });

    await page.goto('/login');
    
    // Fill in credentials
    await page.fill('input[type="email"]', testCredentials.valid.email);
    await page.fill('input[type="password"]', testCredentials.valid.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify token is stored
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe(mockAuthResponse.access_token);
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    // Mock the API error response
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    });

    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', testCredentials.invalid.email);
    await page.fill('input[type="password"]', testCredentials.invalid.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing protected route without token', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should allow access to protected route with valid token', async ({ page }) => {
    // Mock API responses
    await page.route('**/weather/logs', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/weather/insights', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    // Setup authenticated state
    await setupAuthenticatedState(page);
    
    await page.goto('/dashboard');
    
    // Should stay on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Weather Dashboard')).toBeVisible();
  });

  test('should handle empty email field', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without email
    await page.fill('input[type="password"]', testCredentials.valid.password);
    await page.click('button[type="submit"]');
    
    // Form should not submit (HTML5 validation)
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle empty password field', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without password
    await page.fill('input[type="email"]', testCredentials.valid.email);
    await page.click('button[type="submit"]');
    
    // Form should not submit (HTML5 validation)
    await expect(page).toHaveURL(/\/login/);
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Mock API responses
    await page.route('**/weather/logs', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/weather/insights', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    // Setup authenticated state
    await setupAuthenticatedState(page);
    await page.goto('/dashboard');
    
    // Reload page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Weather Dashboard')).toBeVisible();
  });
});
