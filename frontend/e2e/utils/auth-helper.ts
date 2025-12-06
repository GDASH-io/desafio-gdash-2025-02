import { Page } from '@playwright/test';

/**
 * Helper function to login and set authentication token
 */
export async function setupAuthenticatedState(page: Page, token: string = 'mock-jwt-token-12345') {
  await page.addInitScript((token) => {
    localStorage.setItem('token', token);
  }, token);
}

/**
 * Helper function to clear authentication
 */
export async function clearAuthState(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Helper function to perform login via UI
 */
export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

/**
 * Helper function to check if user is on login page
 */
export async function isOnLoginPage(page: Page): Promise<boolean> {
  return page.url().includes('/login');
}

/**
 * Helper function to wait for navigation to complete
 */
export async function waitForNavigation(page: Page, url: string) {
  await page.waitForURL(url, { timeout: 5000 });
}
