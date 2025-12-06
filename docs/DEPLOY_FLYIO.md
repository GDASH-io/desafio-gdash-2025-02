# Fly.io Deployment Guide

## Overview
Deploy the entire stack on Fly.io with managed Postgres and Redis.

## Architecture
```
Fly.io Apps (Frontend, Backend, Worker, Collector)
       ↓
Fly Postgres + Fly Redis (as message queue alternative)
```

## Prerequisites
- Fly.io account
- `flyctl` CLI installed
- Docker installed

## Step 1: Install Fly CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login
```

## Step 2: Create Fly Apps

```bash
# Create apps
flyctl apps create weather-backend
flyctl apps create weather-frontend
flyctl apps create weather-worker
flyctl apps create weather-collector
```

## Step 3: Create Postgres Database

```bash
# Create Postgres cluster
flyctl postgres create --name weather-db --region sjc

# Attach to backend
flyctl postgres attach weather-db --app weather-backend
```

**Note:** Fly Postgres is PostgreSQL, not MongoDB. You'll need to either:
1. Use MongoDB Atlas (recommended)
2. Deploy MongoDB as a Fly app
3. Migrate to PostgreSQL

### Option: Use MongoDB Atlas
```bash
# Set MongoDB connection string as secret
flyctl secrets set MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/weather" --app weather-backend
```

## Step 4: Create Redis (for RabbitMQ alternative)

```bash
# Create Redis
flyctl redis create --name weather-redis --region sjc

# Get connection URL
flyctl redis status weather-redis
```

**Note:** You'll need to modify Worker/Collector to use Redis instead of RabbitMQ, or use CloudAMQP.

### Option: Use CloudAMQP
```bash
# Set RabbitMQ URL as secret
flyctl secrets set RABBITMQ_URI="amqps://user:pass@cloudamqp.com/vhost" --app weather-backend
flyctl secrets set RABBITMQ_URI="amqps://user:pass@cloudamqp.com/vhost" --app weather-worker
flyctl secrets set RABBITMQ_URI="amqps://user:pass@cloudamqp.com/vhost" --app weather-collector
```

## Step 5: Deploy Backend

Create `backend/fly.toml`:
```toml
app = "weather-backend"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3000"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.http_checks]]
    interval = "10s"
    timeout = "2s"
    grace_period = "5s"
    method = "GET"
    path = "/api"
```

Deploy:
```bash
cd backend
flyctl deploy

# Set secrets
flyctl secrets set JWT_SECRET="your-super-secret-jwt-key" --app weather-backend
flyctl secrets set DEFAULT_ADMIN_PASSWORD="secure_password" --app weather-backend
```

## Step 6: Deploy Frontend

Create `frontend/fly.toml`:
```toml
app = "weather-frontend"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "4173"

[[services]]
  internal_port = 4173
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

Update `frontend/.env.production`:
```
VITE_API_URL=https://weather-backend.fly.dev
```

Deploy:
```bash
cd frontend
flyctl deploy
```

## Step 7: Deploy Worker

Create `worker/fly.toml`:
```toml
app = "weather-worker"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile"

[env]
  BACKEND_URL = "https://weather-backend.fly.dev/weather/logs"
```

Deploy:
```bash
cd worker
flyctl deploy
```

## Step 8: Deploy Collector

Create `collector/fly.toml`:
```toml
app = "weather-collector"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile"

[env]
  LATITUDE = "-23.5505"
  LONGITUDE = "-46.6333"
  CITY_NAME = "Sao Paulo"
```

Deploy:
```bash
cd collector
flyctl deploy
```

## Step 9: Configure Secrets

```bash
# Backend
flyctl secrets set \
  MONGO_URI="mongodb+srv://..." \
  JWT_SECRET="..." \
  RABBITMQ_URI="..." \
  --app weather-backend

# Worker
flyctl secrets set \
  RABBITMQ_URI="..." \
  --app weather-worker

# Collector
flyctl secrets set \
  RABBITMQ_URI="..." \
  --app weather-collector
```

## Step 10: Scale Services

```bash
# Scale backend
flyctl scale count 2 --app weather-backend

# Scale worker
flyctl scale count 1 --app weather-worker

# Scale collector
flyctl scale count 1 --app weather-collector

# Scale frontend
flyctl scale count 1 --app weather-frontend
```

## Custom Domain

```bash
# Add custom domain
flyctl certs create www.your-domain.com --app weather-frontend

# Add DNS records as instructed
# A record: @ → fly.io IP
# AAAA record: @ → fly.io IPv6
```

## Monitoring

### View Logs
```bash
# Real-time logs
flyctl logs --app weather-backend

# Specific app
flyctl logs --app weather-worker
```

### Metrics
```bash
# App status
flyctl status --app weather-backend

# VM status
flyctl vm status --app weather-backend
```

### Monitoring Dashboard
Access at: https://fly.io/apps/weather-backend/monitoring

## Cost Estimation

| Service | Configuration | Monthly Cost (USD) |
|---------|--------------|-------------------|
| Backend | 1 shared-cpu-1x | ~$5 |
| Frontend | 1 shared-cpu-1x | ~$5 |
| Worker | 1 shared-cpu-1x | ~$5 |
| Collector | 1 shared-cpu-1x | ~$5 |
| MongoDB Atlas | M0 Free | Free |
| CloudAMQP | Free Tier | Free |
| **Total** | | **~$20/month** |

**Note:** Fly.io includes $5 free credit per month.

## Auto Scaling

Configure in `fly.toml`:
```toml
[http_service]
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
```

## Health Checks

Add to `fly.toml`:
```toml
[[services.http_checks]]
  interval = "10s"
  timeout = "2s"
  grace_period = "5s"
  method = "GET"
  path = "/health"
```

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        working-directory: ./backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Troubleshooting

### App not starting
```bash
# Check logs
flyctl logs --app weather-backend

# SSH into machine
flyctl ssh console --app weather-backend
```

### Database connection issues
```bash
# Check database status
flyctl postgres db list --app weather-db

# Connect to database
flyctl postgres connect --app weather-db
```

### High latency
```bash
# Check regions
flyctl regions list --app weather-backend

# Add region
flyctl regions add sjc --app weather-backend
```

## Security

1. **Secrets:** Use `flyctl secrets` for sensitive data
2. **Private Network:** Use Fly's private network (6PN)
3. **HTTPS:** Automatic with Fly.io
4. **Firewall:** Configure in `fly.toml`

## Backup

### Database Backup
```bash
# Create snapshot
flyctl postgres backup create --app weather-db

# List backups
flyctl postgres backup list --app weather-db

# Restore
flyctl postgres backup restore <backup-id> --app weather-db
```
