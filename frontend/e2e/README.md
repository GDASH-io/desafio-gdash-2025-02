# E2E Tests with Playwright

This directory contains end-to-end tests for the frontend application using Playwright.

## Structure

```
e2e/
├── auth.spec.ts           # Authentication flow tests
├── dashboard.spec.ts      # Dashboard page tests
├── users.spec.ts          # User management tests
├── fixtures/
│   └── test-data.ts      # Mock data for tests
└── utils/
    └── auth-helper.ts    # Authentication helper functions
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see the browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run specific test by name
npx playwright test -g "should login successfully"
```

## Test Coverage

### Authentication (`auth.spec.ts`)
- Login form display
- Successful login with valid credentials
- Failed login with error message
- Protected route redirection
- Token persistence across page reloads
- Form validation (empty fields)
- Authentication state management

### Dashboard (`dashboard.spec.ts`)
- Dashboard title and layout
- Weather data display (temperature, humidity, condition)
- AI insights rendering
- Temperature trend chart
- Export CSV functionality
- Export XLSX functionality
- Navigation to Users page
- API error handling
- Empty state handling
- Responsive design (mobile viewport)

### Users Management (`users.spec.ts`)
- User management page display
- Create user form
- User list display with creation dates
- User creation workflow
- Form validation
- Form clearing after submission
- API error handling
- Responsive design (mobile viewport)

## API Mocking

All E2E tests use Playwright's `page.route()` to mock API responses. This allows tests to run without a backend server and enables testing various scenarios:

```typescript
// Example: Mock successful API response
await page.route('**/auth/login', async (route) => {
  await route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({ access_token: 'mock-token' }),
  });
});

// Example: Mock error response
await page.route('**/users', async (route) => {
  await route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Internal Server Error' }),
  });
});
```

## Test Data

Mock data is centralized in `fixtures/test-data.ts`:
- `mockWeatherLogs` - Sample weather data
- `mockInsights` - AI insights data
- `mockUsers` - User list data
- `mockAuthResponse` - Authentication response
- `testCredentials` - Valid/invalid credentials for testing

## Helper Functions

Authentication helpers in `utils/auth-helper.ts`:

```typescript
// Setup authenticated state before test
await setupAuthenticatedState(page, 'your-token');

// Clear authentication
await clearAuthState(page);

// Login through UI
await loginViaUI(page, 'email@example.com', 'password');

// Check if on login page
const isLogin = await isOnLoginPage(page);

// Wait for navigation
await waitForNavigation(page, '/dashboard');
```

## Configuration

Playwright is configured in `playwright.config.ts` with:
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Base URL**: http://localhost:5173
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Video**: Retained on failure
- **Dev Server**: Auto-starts before tests

## Best Practices

1. **Use Page Object Pattern**: Consider creating page objects for complex pages
2. **Wait for Elements**: Always wait for elements before interacting
3. **Use Accessible Selectors**: Prefer `getByRole`, `getByLabel` over CSS selectors
4. **Mock API Calls**: Always mock external API calls
5. **Test User Flows**: Focus on complete user journeys
6. **Clean State**: Each test should start with a clean state
7. **Descriptive Names**: Use clear, descriptive test names

## Debugging

### Visual Debugging

```bash
# Run in headed mode
npm run test:e2e:headed

# Use Playwright Inspector
npm run test:e2e:debug
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots in `test-results/`
- Videos in `test-results/`

### Trace Viewer

View detailed traces of test execution:

```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

Tests are ready for CI environments:
- Retries enabled on CI
- Headless by default
- Screenshots/videos on failure
- HTML report generated

Example GitHub Actions:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify API mocks are configured

### Elements not found
- Use `page.waitForSelector()` before interacting
- Check if element is visible: `await expect(element).toBeVisible()`
- Use Playwright Inspector to debug selectors

### Authentication issues
- Verify token is set correctly
- Check localStorage in browser DevTools
- Ensure API mocks return correct auth responses

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
