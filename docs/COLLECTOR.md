# Collector Documentation

## Overview
Python service that fetches weather data from Open-Meteo API and publishes to RabbitMQ.

## Tech Stack
- **Language:** Python 3.9+
- **Dependencies:**
  - `requests` - HTTP client
  - `pika` - RabbitMQ client
  - `schedule` - Job scheduling

## Architecture

### Data Flow
```
Open-Meteo API → Collector → RabbitMQ → Worker → Backend
```

### Schedule
- Runs immediately on startup
- Scheduled to run every 1 hour

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RABBITMQ_HOST` | No | rabbitmq | RabbitMQ hostname |
| `RABBITMQ_PORT` | No | 5672 | RabbitMQ port |
| `RABBITMQ_USER` | No | guest | RabbitMQ username |
| `RABBITMQ_PASSWORD` | No | guest | RabbitMQ password |
| `LATITUDE` | No | -23.5505 | Location latitude |
| `LONGITUDE` | No | -46.6333 | Location longitude |
| `CITY_NAME` | No | Sao Paulo | City name |

### Data Source
**API:** Open-Meteo (https://api.open-meteo.com)
- Free, no API key required
- Provides current weather and forecasts
- Updates hourly

## Data Structure

### Output Format
```json
{
  "city": "São Paulo",
  "temperature": 25.5,
  "humidity": 60,
  "windSpeed": 10.2,
  "condition": "Partly Cloudy",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Weather Condition Mapping
Based on WMO Weather interpretation codes:
- `0` → Clear sky
- `1-3` → Mainly clear, partly cloudy, and overcast
- `45, 48` → Fog
- `51-57` → Drizzle
- `61-67` → Rain
- `71-77` → Snow
- `80-86` → Showers
- `95-99` → Thunderstorm

## Error Handling

### API Errors
- **Timeout:** 10 seconds
- **Retry:** No automatic retry (waits for next scheduled run)
- **Logging:** Errors logged to stdout

### RabbitMQ Connection
- **Retry Logic:** Exponential backoff
- **Max Retries:** 5 attempts
- **Initial Delay:** 5 seconds
- **Backoff:** 2x multiplier

### Example Error Log
```
2023-01-01 12:00:00 - ERROR - Error fetching weather data: Connection timeout
2023-01-01 12:00:05 - WARNING - Connection failed, retrying in 5s... (Attempt 1/5)
```

## Running Locally

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run
```bash
python main.py
```

### Docker
```bash
docker build -t collector .
docker run -e RABBITMQ_HOST=localhost collector
```

## Monitoring

### Health Check
Monitor logs for:
- `"Starting data collection job..."` - Job started
- `"[x] Sent data for {city}"` - Success
- `"No weather data collected."` - API failure
- `"Failed to connect to RabbitMQ..."` - Connection failure

### Metrics
- Collection frequency: 1 hour
- Average execution time: < 5 seconds
- Success rate: Monitor via logs

## Troubleshooting

### Issue: No data being sent
**Check:**
1. RabbitMQ connection (host, port, credentials)
2. Internet connectivity to Open-Meteo API
3. Logs for error messages

### Issue: Connection timeout
**Solution:**
- Increase timeout in `requests.get(url, timeout=10)`
- Check network/firewall settings

### Issue: RabbitMQ connection failed
**Solution:**
- Verify RabbitMQ is running
- Check credentials
- Verify network connectivity

## Development

### Add New Data Source
1. Create new fetch function
2. Map data to `WeatherData` dataclass
3. Call in `job()` function

### Change Schedule
```python
# Current: Every hour
schedule.every(1).hours.do(job)

# Example: Every 30 minutes
schedule.every(30).minutes.do(job)
```

### Custom Location
Set environment variables:
```bash
export LATITUDE="40.7128"
export LONGITUDE="-74.0060"
export CITY_NAME="New York"
```
