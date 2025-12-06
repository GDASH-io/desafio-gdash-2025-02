# Collector Tests

## Overview

Comprehensive test suite for the Collector service (Python) that fetches weather data from Open-Meteo API and publishes it to RabbitMQ.

## Test Coverage

### Unit Tests

#### Weather Condition Mapping (`get_weather_condition`)
- ✅ Clear sky (code 0)
- ✅ Partly cloudy (codes 1-3)
- ✅ Fog (codes 45, 48)
- ✅ Drizzle (codes 51, 53, 55)
- ✅ Rain (codes 61, 63, 65)
- ✅ Snow (codes 71, 73, 75)
- ✅ Thunderstorm (codes 95, 96, 99)
- ✅ Unknown codes

#### WeatherData Dataclass
- ✅ Object creation
- ✅ Conversion to dictionary
- ✅ Field validation

#### Weather Data Fetching (`fetch_weather_data`)
- ✅ Successful API call
- ✅ API error handling
- ✅ Request timeout handling
- ✅ Missing humidity data fallback
- ✅ Data parsing

#### RabbitMQ Publishing (`publish_to_rabbitmq`)
- ✅ Successful publish
- ✅ Queue declaration
- ✅ Message persistence
- ✅ Connection retry logic
- ✅ Exponential backoff
- ✅ Max retries handling
- ✅ Connection error handling

#### Job Execution (`job`)
- ✅ Successful job execution
- ✅ Handling of missing weather data
- ✅ Integration of fetch and publish

## Running Tests

### Prerequisites

```bash
cd collector
pip install -r requirements.txt
```

Or with virtual environment:

```bash
cd collector
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Run All Tests

```bash
pytest test_main.py -v
```

### Run Specific Test Class

```bash
pytest test_main.py::TestWeatherCondition -v
pytest test_main.py::TestFetchWeatherData -v
pytest test_main.py::TestPublishToRabbitMQ -v
```

### Run with Coverage

```bash
pytest test_main.py --cov=main --cov-report=html
pytest test_main.py --cov=main --cov-report=term-missing
```

### Run with Detailed Output

```bash
pytest test_main.py -vv -s
```

## Test Structure

```
collector/
├── main.py           # Main collector implementation
├── test_main.py      # Test suite
└── requirements.txt  # Dependencies (including pytest)
```

## What's Tested

### `get_weather_condition(code: int) -> str`
- All WMO weather codes
- Edge cases (unknown codes)
- Return value correctness

### `WeatherData` Dataclass
- Field types and values
- Dictionary conversion
- Data integrity

### `fetch_weather_data() -> Optional[WeatherData]`
- API request success
- JSON parsing
- Humidity extraction
- Error handling
- Timeout handling
- Default fallback values

### `publish_to_rabbitmq(data: WeatherData)`
- RabbitMQ connection
- Queue declaration
- Message publishing
- Retry logic
- Exponential backoff
- Error handling

### `job()`
- End-to-end flow
- Error propagation
- Logging

## Mocking Strategy

- **HTTP Requests**: Uses `unittest.mock.patch` for `requests.get`
- **RabbitMQ**: Mocks `pika.BlockingConnection` and related objects
- **Time**: Mocks `datetime.now()` for consistent timestamps
- **Sleep**: Mocks `time.sleep()` to speed up retry tests

## Test Examples

### Testing Successful API Call

```python
@patch('main.requests.get')
@patch('main.datetime')
def test_successful_fetch(self, mock_datetime, mock_get):
    mock_datetime.now.return_value.isoformat.return_value = "2024-01-01T12:00:00"
    
    mock_response = Mock()
    mock_response.json.return_value = {
        'current_weather': {
            'temperature': 25.5,
            'windspeed': 12.3,
            'weathercode': 0,
            'time': '2024-01-01T12:00'
        },
        'hourly': {
            'time': ['2024-01-01T12:00'],
            'relativehumidity_2m': [65]
        }
    }
    mock_get.return_value = mock_response
    
    weather = fetch_weather_data()
    
    assert weather.temperature == 25.5
    assert weather.humidity == 65
```

### Testing Retry Logic

```python
@patch('main.pika.BlockingConnection')
@patch('main.time.sleep')
def test_connection_retry_logic(self, mock_sleep, mock_connection_class):
    # Simulate failures then success
    mock_connection_class.side_effect = [
        AMQPConnectionError("Failed"),
        AMQPConnectionError("Failed"),
        Mock()  # Success on third attempt
    ]
    
    publish_to_rabbitmq(weather_data)
    
    assert mock_connection_class.call_count == 3
    assert mock_sleep.call_count == 2
```

## Dependencies

```
requests      # HTTP client for API calls
pika          # RabbitMQ client
schedule      # Job scheduling
pytest        # Testing framework
pytest-mock   # Mocking utilities
```

## Best Practices

1. **Mocking External Services**: All external dependencies (API, RabbitMQ) are mocked
2. **Isolated Tests**: Each test is independent
3. **Clear Assertions**: Tests have clear, specific assertions
4. **Edge Cases**: Tests cover error conditions and edge cases
5. **Descriptive Names**: Test names clearly describe what they're testing

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Collector Tests
  run: |
    cd collector
    pip install -r requirements.txt
    pytest test_main.py -v --cov=main
```

## Future Improvements

- [ ] Add integration tests with real API (using VCR.py)
- [ ] Add integration tests with real RabbitMQ (using testcontainers)
- [ ] Add tests for schedule configuration
- [ ] Add tests for logging
- [ ] Increase coverage to 95%+
- [ ] Add property-based testing (hypothesis)

## Troubleshooting

### Import Errors
```bash
# Ensure you're in the collector directory
cd collector
# Install dependencies
pip install -r requirements.txt
```

### Module Not Found
```bash
# Make sure pytest is installed
pip install pytest pytest-mock
```

### Tests Fail
- Check that you're running from the collector directory
- Ensure all dependencies are installed
- Check Python version (3.8+)

## Contributing

When adding new tests:
1. Follow existing test class structure
2. Use descriptive test names
3. Mock external dependencies
4. Add docstrings to test classes
5. Update this README with new coverage
