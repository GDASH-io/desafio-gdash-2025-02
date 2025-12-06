# Testing Documentation

## Overview

This document provides comprehensive information about the testing setup for the frontend application, including unit tests with Vitest and E2E tests with Playwright.

## Test Structure

```
frontend/
├── e2e/                          # E2E tests with Playwright
│   ├── auth.spec.ts             # Authentication flow tests
│   ├── dashboard.spec.ts        # Dashboard page tests
│   ├── users.spec.ts            # Users page tests
│   ├── fixtures/
│   │   └── test-data.ts         # Mock data for tests
│   └── utils/
│       └── auth-helper.ts       # Authentication helpers
├── src/
│   ├── pages/
│   │   ├── Login.test.tsx       # Login page unit tests
│   │   ├── Dashboard.test.tsx   # Dashboard unit tests
│   │   └── Users.test.tsx       # Users unit tests
│   ├── components/ui/
│   │   ├── button.test.tsx      # Button component tests
│   │   ├── card.test.tsx        # Card component tests
│   │   └── input.test.tsx       # Input component tests
│   ├── App.test.tsx             # App routing tests
│   └── test/
│       └── setup.ts             # Global test setup
├── playwright.config.ts         # Playwright configuration
└── vitest.config.ts            # Vitest configuration
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

### Run All Tests

```bash
npm run test:all
```

## Test Coverage

### Unit Tests

#### Pages
- **Login** (`Login.test.tsx`)
  - ✅ Form rendering
  - ✅ Successful login flow
  - ✅ Failed login with error message
  - ✅ Form validation

- **Dashboard** (`Dashboard.test.tsx`)
  - ✅ Data fetching and display
  - ✅ Weather cards rendering
  - ✅ AI insights display
  - ✅ Chart rendering
  - ✅ Export buttons
  - ✅ Navigation
  - ✅ Error handling

- **Users** (`Users.test.tsx`)
  - ✅ User list display
  - ✅ User creation form
  - ✅ Form submission
  - ✅ Data refetching
  - ✅ Error handling

#### Components
- **Button** (`button.test.tsx`)
  - ✅ All variants (default, secondary, outline, destructive, ghost, link)
  - ✅ All sizes (sm, default, lg, icon)
  - ✅ Click handling
  - ✅ Disabled state
  - ✅ Custom className
  - ✅ AsChild prop

- **Card** (`card.test.tsx`)
  - ✅ Card rendering
  - ✅ CardHeader rendering
  - ✅ CardTitle rendering
  - ✅ CardContent rendering
  - ✅ Card composition
  - ✅ Custom className

- **Input** (`input.test.tsx`)
  - ✅ Input types (text, email, password, number)
  - ✅ Value changes
  - ✅ Disabled state
  - ✅ Required attribute
  - ✅ Controlled/uncontrolled modes
  - ✅ HTML attributes (maxLength, minLength, pattern, etc.)

#### Routing
- **App** (`App.test.tsx`)
  - ✅ Protected routes
  - ✅ Authentication-based navigation
  - ✅ Route redirects

### E2E Tests

#### Authentication Flow (`auth.spec.ts`)
- ✅ Login form display
- ✅ Successful login
- ✅ Failed login with error
- ✅ Protected route redirection
- ✅ Token persistence
- ✅ Form validation
- ✅ Authentication across page reloads

#### Dashboard (`dashboard.spec.ts`)
- ✅ Dashboard title and layout
- ✅ Weather data display
- ✅ AI insights display
- ✅ Temperature trend chart
- ✅ Export CSV functionality
- ✅ Export XLSX functionality
- ✅ Navigation to Users page
- ✅ API error handling
- ✅ Empty state handling
- ✅ Responsive design (mobile viewport)

#### Users Management (`users.spec.ts`)
- ✅ User management page display
- ✅ Create user form
- ✅ User list display
- ✅ User creation
- ✅ Form validation
- ✅ Form clearing after submission
- ✅ API error handling
- ✅ Responsive design (mobile viewport)

## Test Configuration

### Vitest Configuration

The Vitest configuration (`vitest.config.ts`) includes:
- **Environment**: jsdom for DOM testing
- **Globals**: Enabled for describe, it, expect
- **Setup Files**: Global test setup with mocks
- **Coverage**: V8 provider with HTML, JSON, and text reports
- **Exclude**: E2E tests are excluded from unit test runs

### Playwright Configuration

The Playwright configuration (`playwright.config.ts`) includes:
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Base URL**: http://localhost:5173
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Video**: Retained on failure
- **Dev Server**: Automatically starts before tests

## Test Utilities

### Global Setup (`src/test/setup.ts`)

Provides:
- Automatic cleanup after each test
- localStorage mock with realistic behavior
- window.matchMedia mock
- @testing-library/jest-dom matchers

### E2E Fixtures (`e2e/fixtures/test-data.ts`)

Mock data for:
- Weather logs
- AI insights
- Users
- Authentication responses
- Test credentials

### E2E Helpers (`e2e/utils/auth-helper.ts`)

Helper functions:
- `setupAuthenticatedState()` - Set authentication token
- `clearAuthState()` - Clear authentication
- `loginViaUI()` - Login through UI
- `isOnLoginPage()` - Check current page
- `waitForNavigation()` - Wait for navigation

## API Mocking Strategy

### Unit Tests
- Uses `vi.mock('axios')` to mock all API calls
- Each test configures specific mock responses
- Allows testing error scenarios easily

### E2E Tests
- Uses Playwright's `page.route()` to intercept network requests
- Provides mock responses for all API endpoints
- Tests run without requiring backend server
- Enables testing of various API scenarios (success, error, empty data)

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Cleanup**: Automatic cleanup after each test
3. **Realistic Mocks**: localStorage and other browser APIs behave realistically
4. **Error Testing**: Both success and error scenarios are tested
5. **Accessibility**: Tests use accessible queries (getByRole, getByLabelText)
6. **User-Centric**: E2E tests simulate real user interactions
7. **Coverage**: Comprehensive coverage of components and user flows

## Continuous Integration

Tests are designed to run in CI environments:
- Playwright retries failed tests twice on CI
- Screenshots and videos captured on failure
- Coverage reports can be uploaded to coverage services
- All tests run headless by default

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in test configuration
   - Check if API mocks are properly configured

2. **localStorage errors**
   - Ensure test setup is imported
   - Check that localStorage is cleared between tests

3. **E2E tests failing**
   - Verify dev server is running
   - Check network route mocks
   - Use `--headed` mode to debug visually

4. **Coverage not generated**
   - Ensure `@vitest/coverage-v8` is installed
   - Check vitest.config.ts coverage settings

## Future Improvements

- [ ] Add visual regression testing
- [ ] Implement accessibility testing with axe-core
- [ ] Add performance testing
- [ ] Increase coverage to 90%+
- [ ] Add mutation testing
- [ ] Implement contract testing for API
