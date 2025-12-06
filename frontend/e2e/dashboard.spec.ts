import { test, expect } from '@playwright/test';
import { setupAuthenticatedState } from './utils/auth-helper';
import { mockWeatherLogs, mockInsights } from './fixtures/test-data';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authenticated state
    await setupAuthenticatedState(page);

    // Mock API responses
    await page.route('**/weather/logs', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockWeatherLogs),
      });
    });

    await page.route('**/weather/insights', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockInsights),
      });
    });

    await page.goto('/dashboard');
  });

  test('should display dashboard title', async ({ page }) => {
    await expect(page.locator('text=Weather Dashboard')).toBeVisible();
  });

  test('should display current weather data', async ({ page }) => {
    const latest = mockWeatherLogs[0];
    
    // Check temperature card
    await expect(page.locator('text=Temperature')).toBeVisible();
    await expect(page.locator(`text=${latest.temperature.toFixed(1)}°C`)).toBeVisible();
    
    // Check humidity card
    await expect(page.locator('text=Humidity')).toBeVisible();
    await expect(page.locator(`text=${latest.humidity}%`)).toBeVisible();
    
    // Check condition card
    await expect(page.locator('text=Condition')).toBeVisible();
    await expect(page.locator(`text=${latest.condition}`)).toBeVisible();
  });

  test('should display AI insights', async ({ page }) => {
    await expect(page.locator('text=AI Insights')).toBeVisible();
    await expect(page.locator(`text=${mockInsights.insight}`)).toBeVisible();
    await expect(page.locator(`text=Average Temp: ${mockInsights.averageTemp.toFixed(1)}°C`)).toBeVisible();
  });

  test('should display temperature trend chart', async ({ page }) => {
    await expect(page.locator('text=Temperature Trend')).toBeVisible();
    
    // Check if chart container exists
    const chartContainer = page.locator('.recharts-wrapper');
    await expect(chartContainer).toBeVisible();
  });

  test('should have export CSV button', async ({ page }) => {
    const exportCsvButton = page.locator('button:has-text("Export CSV")');
    await expect(exportCsvButton).toBeVisible();
    await expect(exportCsvButton).toBeEnabled();
  });

  test('should have export XLSX button', async ({ page }) => {
    const exportXlsxButton = page.locator('button:has-text("Export XLSX")');
    await expect(exportXlsxButton).toBeVisible();
    await expect(exportXlsxButton).toBeEnabled();
  });

  test('should navigate to users page when clicking Manage Users button', async ({ page }) => {
    // Mock users API
    await page.route('**/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    const manageUsersButton = page.locator('button:has-text("Manage Users")');
    await expect(manageUsersButton).toBeVisible();
    
    await manageUsersButton.click();
    
    // Should navigate to users page
    await expect(page).toHaveURL(/\/users/);
  });

  test('should open export CSV in new tab', async ({ context, page }) => {
    const exportCsvButton = page.locator('button:has-text("Export CSV")');
    
    // Listen for new page
    const pagePromise = context.waitForEvent('page');
    
    await exportCsvButton.click();
    
    const newPage = await pagePromise;
    
    // Verify the URL contains the export endpoint
    expect(newPage.url()).toContain('/weather/export/csv');
    expect(newPage.url()).toContain('token=');
    
    await newPage.close();
  });

  test('should open export XLSX in new tab', async ({ context, page }) => {
    const exportXlsxButton = page.locator('button:has-text("Export XLSX")');
    
    // Listen for new page
    const pagePromise = context.waitForEvent('page');
    
    await exportXlsxButton.click();
    
    const newPage = await pagePromise;
    
    // Verify the URL contains the export endpoint
    expect(newPage.url()).toContain('/weather/export/xlsx');
    expect(newPage.url()).toContain('token=');
    
    await newPage.close();
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Create a new page with error responses
    await page.route('**/weather/logs', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.route('**/weather/insights', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.reload();
    
    // Dashboard should still render without crashing
    await expect(page.locator('text=Weather Dashboard')).toBeVisible();
  });

  test('should display empty state when no data available', async ({ page }) => {
    // Mock empty responses
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
        body: JSON.stringify(null),
      });
    });

    await page.reload();
    
    // Should still show the dashboard structure
    await expect(page.locator('text=Weather Dashboard')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Dashboard should still be visible and functional
    await expect(page.locator('text=Weather Dashboard')).toBeVisible();
    await expect(page.locator('text=Temperature')).toBeVisible();
    await expect(page.locator('text=Humidity')).toBeVisible();
  });
});
