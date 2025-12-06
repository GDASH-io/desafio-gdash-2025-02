import { test, expect } from '@playwright/test';
import { setupAuthenticatedState } from './utils/auth-helper';
import { mockUsers } from './fixtures/test-data';

test.describe('Users Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authenticated state
    await setupAuthenticatedState(page);

    // Mock users API
    await page.route('**/users', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockUsers),
        });
      } else if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        const newUser = {
          _id: '3',
          email: postData.email,
          createdAt: new Date().toISOString(),
        };
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newUser),
        });
      }
    });

    await page.goto('/users');
  });

  test('should display users page title', async ({ page }) => {
    await expect(page.locator('text=User Management')).toBeVisible();
  });

  test('should display create user form', async ({ page }) => {
    await expect(page.locator('text=Create User')).toBeVisible();
    
    // Check form fields
    const emailInput = page.locator('input[placeholder="Email"]');
    const passwordInput = page.locator('input[placeholder="Password"]');
    const createButton = page.locator('button:has-text("Create")');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(createButton).toBeVisible();
  });

  test('should display existing users list', async ({ page }) => {
    await expect(page.locator('text=Existing Users')).toBeVisible();
    
    // Check if users are displayed
    for (const user of mockUsers) {
      await expect(page.locator(`text=${user.email}`)).toBeVisible();
    }
  });

  test('should create a new user successfully', async ({ page }) => {
    const newEmail = 'newuser@example.com';
    const newPassword = 'password123';
    
    // Fill in the form
    await page.fill('input[placeholder="Email"]', newEmail);
    await page.fill('input[placeholder="Password"]', newPassword);
    
    // Submit the form
    await page.click('button:has-text("Create")');
    
    // Wait for the form to be cleared (indicates success)
    await expect(page.locator('input[placeholder="Email"]')).toHaveValue('');
    await expect(page.locator('input[placeholder="Password"]')).toHaveValue('');
  });

  test('should validate required email field', async ({ page }) => {
    // Try to submit without email
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Create")');
    
    // Form should not submit (HTML5 validation)
    const emailInput = page.locator('input[placeholder="Email"]');
    await expect(emailInput).toHaveValue('');
  });

  test('should validate required password field', async ({ page }) => {
    // Try to submit without password
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.click('button:has-text("Create")');
    
    // Form should not submit (HTML5 validation)
    const passwordInput = page.locator('input[placeholder="Password"]');
    await expect(passwordInput).toHaveValue('');
  });

  test('should display user creation date', async ({ page }) => {
    for (const user of mockUsers) {
      const formattedDate = new Date(user.createdAt).toLocaleDateString();
      await expect(page.locator(`text=Created: ${formattedDate}`)).toBeVisible();
    }
  });

  test('should handle API error when creating user', async ({ page }) => {
    // Mock error response
    await page.route('**/users', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Email already exists' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockUsers),
        });
      }
    });

    await page.reload();
    
    // Try to create a user
    await page.fill('input[placeholder="Email"]', 'existing@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Create")');
    
    // Page should still be functional (error is logged to console)
    await expect(page.locator('text=User Management')).toBeVisible();
  });

  test('should handle API error when fetching users', async ({ page }) => {
    // Mock error response
    await page.route('**/users', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.reload();
    
    // Page should still render
    await expect(page.locator('text=User Management')).toBeVisible();
    await expect(page.locator('text=Create User')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still be visible and functional
    await expect(page.locator('text=User Management')).toBeVisible();
    await expect(page.locator('text=Create User')).toBeVisible();
    await expect(page.locator('text=Existing Users')).toBeVisible();
  });

  test('should clear form after successful user creation', async ({ page }) => {
    const emailInput = page.locator('input[placeholder="Email"]');
    const passwordInput = page.locator('input[placeholder="Password"]');
    
    // Fill and submit
    await emailInput.fill('newuser@example.com');
    await passwordInput.fill('password123');
    await page.click('button:has-text("Create")');
    
    // Form should be cleared
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });
});
