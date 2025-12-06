# Worker Documentation

## Overview
Go service that consumes weather data from RabbitMQ and posts to the Backend API.

## Tech Stack
- **Language:** Go 1.20+
- **Dependencies:**
  - `github.com/rabbitmq/amqp091-go` - RabbitMQ client

## Architecture

### Data Flow
```
RabbitMQ Queue → Worker → Backend API → MongoDB
```

### Processing
- Consumes from `weather_data` queue
- Posts to Backend `/weather/logs` endpoint
- Acknowledges message on success
- Requeues message on failure

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RABBITMQ_HOST` | No | rabbitmq | RabbitMQ hostname |
| `RABBITMQ_PORT` | No | 5672 | RabbitMQ port |
| `RABBITMQ_USER` | No | guest | RabbitMQ username |
| `RABBITMQ_PASSWORD` | No | guest | RabbitMQ password |
| `BACKEND_URL` | No | http://backend:3000/weather/logs | Backend API endpoint |

## Message Processing

### Input Format
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

### Processing Steps
1. Receive message from queue
2. POST to Backend API
3. Check response status
4. ACK (success) or NACK (failure)

## Error Handling

### Connection Retry
- **Strategy:** Exponential backoff
- **Max Retries:** 10 attempts
- **Initial Delay:** 1 second
- **Backoff:** 2x multiplier
- **Max Delay:** 30 seconds

### Message Retry
- **On Failure:** Message requeued
- **Delay:** 2 seconds before requeue
- **Max Retries:** Unlimited (until success)

### Example Logs
```
2023/01/01 12:00:00 Connected to RabbitMQ
2023/01/01 12:00:01 [*] Waiting for messages. To exit press CTRL+C
2023/01/01 12:00:05 Received a message: {"city":"São Paulo",...}
2023/01/01 12:00:05 Successfully posted to backend
```

### Error Logs
```
2023/01/01 12:00:05 Failed to post to backend: backend returned status: 500
2023/01/01 12:00:07 Received a message: {"city":"São Paulo",...}
```

## Running Locally

### Install Dependencies
```bash
go mod download
```

### Build
```bash
go build -o worker
```

### Run
```bash
./worker
```

### Docker
```bash
docker build -t worker .
docker run -e BACKEND_URL=http://backend:3000/weather/logs worker
```

## Monitoring

### Health Indicators
- **Connected:** `"Connected to RabbitMQ"`
- **Processing:** `"Received a message"`
- **Success:** `"Successfully posted to backend"`
- **Failure:** `"Failed to post to backend"`

### Metrics to Monitor
- Message processing rate
- Success/failure ratio
- Backend response times
- Queue depth

## Troubleshooting

### Issue: Cannot connect to RabbitMQ
**Check:**
1. RabbitMQ service is running
2. Credentials are correct
3. Network connectivity
4. Firewall rules

**Solution:**
```bash
# Test RabbitMQ connection
telnet rabbitmq 5672
```

### Issue: Backend returns 404
**Check:**
1. `BACKEND_URL` environment variable
2. Backend service is running
3. Endpoint path is correct

**Solution:**
```bash
# Test backend endpoint
curl -X POST http://backend:3000/weather/logs \
  -H "Content-Type: application/json" \
  -d '{"city":"Test","temperature":20,"humidity":50,"windSpeed":10,"condition":"Clear"}'
```

### Issue: Messages stuck in queue
**Check:**
1. Worker is running
2. Backend is accessible
3. Check worker logs for errors

**Solution:**
```bash
# Check RabbitMQ queue
docker exec rabbitmq rabbitmqctl list_queues
```

## Development

### Add Logging
```go
import "log"

log.Printf("Custom log message: %v", data)
```

### Change Queue Name
```go
q, err := ch.QueueDeclare(
    "new_queue_name", // Change here
    true,
    false,
    false,
    false,
    nil,
)
```

### Add Message Validation
```go
func validateMessage(data []byte) error {
    var msg map[string]interface{}
    if err := json.Unmarshal(data, &msg); err != nil {
        return err
    }
    // Add validation logic
    return nil
}
```

## Performance

### Throughput
- **Expected:** 1 message per hour (from Collector)
- **Capacity:** Can handle 100+ messages/second
- **Latency:** < 100ms per message

### Resource Usage
- **Memory:** ~10MB
- **CPU:** < 1% (idle)
- **Network:** Minimal

## Security

### Credentials
- Never hardcode credentials
- Use environment variables
- Rotate passwords regularly

### Network
- Use TLS for RabbitMQ in production
- Restrict network access
- Use private networks when possible
