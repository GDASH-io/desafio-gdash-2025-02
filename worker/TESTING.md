# Worker Tests

## Overview

Comprehensive test suite for the Worker service (Go) that processes weather data from RabbitMQ and posts it to the backend API.

## Test Coverage

### Unit Tests

#### Environment Variable Handling
- ✅ Default RabbitMQ connection values
- ✅ Custom RabbitMQ connection values
- ✅ Partial custom values with defaults
- ✅ Connection string formation

#### Backend Posting
- ✅ Successful POST requests (200 OK, 201 Created)
- ✅ Error status handling (500, 404, etc.)
- ✅ Network error handling
- ✅ Default backend URL usage
- ✅ JSON parsing and marshaling
- ✅ Request headers (Content-Type)

#### Error Handling
- ✅ Error logging functionality
- ✅ Nil error handling

### Benchmark Tests
- ✅ POST request performance
- ✅ JSON marshaling performance

## Running Tests

### Prerequisites

```bash
cd worker
go mod download
```

### Run All Tests

```bash
go test -v
```

### Run Specific Test

```bash
go test -v -run TestPostToBackend
```

### Run with Coverage

```bash
go test -cover
go test -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### Run Benchmarks

```bash
go test -bench=.
go test -bench=. -benchmem
```

## Test Results

```
=== RUN   TestFailOnError
--- PASS: TestFailOnError (0.00s)

=== RUN   TestConnectRabbitMQ_EnvironmentVariables
--- PASS: TestConnectRabbitMQ_EnvironmentVariables (0.00s)

=== RUN   TestPostToBackend
--- PASS: TestPostToBackend (0.02s)

=== RUN   TestPostToBackend_JSONParsing
--- PASS: TestPostToBackend_JSONParsing (0.00s)

=== RUN   TestPostToBackend_RequestHeaders
--- PASS: TestPostToBackend_RequestHeaders (0.00s)

PASS
ok      worker  0.026s
```

## Test Structure

```
worker/
├── main.go           # Main worker implementation
└── main_test.go      # Test suite
```

## What's Tested

### `failOnError()`
- Error logging
- Nil error handling

### `connectRabbitMQ()` (indirectly)
- Environment variable parsing
- Connection string formation
- Default value handling

### `postToBackend()`
- HTTP POST requests
- JSON content type
- Status code validation
- Error handling
- Response body closure
- Network error handling

## Mocking Strategy

- **HTTP Server**: Uses `httptest.NewServer()` for backend API mocking
- **Environment Variables**: Uses `os.Setenv()` and `os.Unsetenv()` for configuration testing
- **No External Dependencies**: Tests run without RabbitMQ or backend services

## Best Practices

1. **Table-Driven Tests**: Uses table-driven approach for environment variable tests
2. **Cleanup**: Properly cleans up environment variables after each test
3. **Isolation**: Each test is independent and can run in any order
4. **Clear Names**: Test names clearly describe what they're testing
5. **Subtests**: Uses `t.Run()` for organized test output

## Future Improvements

- [ ] Add integration tests with real RabbitMQ (using testcontainers)
- [ ] Add tests for message consumption logic
- [ ] Add tests for retry logic
- [ ] Add tests for graceful shutdown
- [ ] Increase coverage to 90%+

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Worker Tests
  run: |
    cd worker
    go test -v -cover
```

## Troubleshooting

### Tests Fail to Connect
- Check if any services are running on test ports
- Ensure no environment variables are set globally

### Import Errors
- Run `go mod tidy` to clean up dependencies
- Ensure Go version is 1.16+

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Add cleanup code (defer statements)
3. Use subtests for related test cases
4. Update this README with new test coverage
