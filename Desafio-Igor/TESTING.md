# Testing Guide

## Quick Tests

### Check services status

```bash
docker-compose ps
```

### Test Redis

```bash
docker exec -it gdash-redis redis-cli ping
# Should return: PONG
```

### Test MongoDB

```bash
docker exec -it gdash-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Test API

```bash
curl http://localhost:3000/health
```

Or in PowerShell:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/health
```

### Check MongoDB data

```bash
docker exec -it gdash-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

use gdash
db.weather.countDocuments()
db.weather.find().limit(5)
exit
```

### Check Redis queue

```bash
docker exec -it gdash-redis redis-cli

KEYS *
LLEN weather_queue
exit
```

## API Testing

### Register user

```powershell
$body = @{
    username = "test"
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/auth/register `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Login

```powershell
$body = @{
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:3000/auth/login `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$token = ($response.Content | ConvertFrom-Json).access_token
```

### Get weather data

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri http://localhost:3000/weather `
    -Method GET `
    -Headers $headers
```

### Get insights

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/weather/insights?limit=50" `
    -Headers @{"Authorization"="Bearer $token"}
```

## View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f python-collector
docker-compose logs -f go-worker
docker-compose logs -f nestjs-api
docker-compose logs -f react-frontend
```

## Cleanup

### Clear MongoDB data

```bash
docker exec -it gdash-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "use gdash; db.weather.deleteMany({})"
```

### Clear Redis queue

```bash
docker exec -it gdash-redis redis-cli FLUSHALL
```

### Restart all

```bash
docker-compose down
docker-compose up -d
```
