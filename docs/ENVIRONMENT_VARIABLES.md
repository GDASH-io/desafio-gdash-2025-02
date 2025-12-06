# Environment Variables Guide

## Overview
Complete reference for all environment variables used across the application.

---

## Backend (NestJS)

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `MONGO_URI` | string | MongoDB connection string | `mongodb://localhost:27017/weather` |
| `JWT_SECRET` | string | Secret key for JWT signing (min 32 chars) | `your-super-secret-jwt-key-min-32-characters` |

### Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DEFAULT_ADMIN_EMAIL` | string | `admin@example.com` | Default admin user email |
| `DEFAULT_ADMIN_PASSWORD` | string | - | Default admin password (⚠️ Set in production!) |
| `CORS_ORIGIN` | string | `*` | Allowed CORS origins (comma-separated) |
| `PORT` | number | `3000` | Server port |

### Security Notes
- ⚠️ **Never commit** `JWT_SECRET` to version control
- ⚠️ **Always set** `DEFAULT_ADMIN_PASSWORD` in production
- ⚠️ **Restrict** `CORS_ORIGIN` in production (e.g., `https://yourdomain.com`)

---

## Frontend (React + Vite)

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `VITE_API_URL` | string | Backend API URL | `http://localhost:3000` |

### Build-time vs Runtime
- All `VITE_*` variables are **build-time** only
- Values are embedded in the bundle during build
- Changes require rebuild

### Production Example
```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com
```

---

## Collector (Python)

### Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RABBITMQ_HOST` | string | `rabbitmq` | RabbitMQ hostname |
| `RABBITMQ_PORT` | int | `5672` | RabbitMQ port |
| `RABBITMQ_USER` | string | `guest` | RabbitMQ username |
| `RABBITMQ_PASSWORD` | string | `guest` | RabbitMQ password |
| `LATITUDE` | float | `-23.5505` | Location latitude |
| `LONGITUDE` | float | `-46.6333` | Location longitude |
| `CITY_NAME` | string | `Sao Paulo` | City name for weather data |

### Alternative: Connection URI
```bash
RABBITMQ_URI=amqp://user:pass@host:5672/
```

---

## Worker (Go)

### Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RABBITMQ_HOST` | string | `rabbitmq` | RabbitMQ hostname |
| `RABBITMQ_PORT` | string | `5672` | RabbitMQ port |
| `RABBITMQ_USER` | string | `guest` | RabbitMQ username |
| `RABBITMQ_PASSWORD` | string | `guest` | RabbitMQ password |
| `BACKEND_URL` | string | `http://backend:3000/weather/logs` | Backend API endpoint |

### Alternative: Connection URI
```bash
RABBITMQ_URI=amqp://user:pass@host:5672/
```

---

## Docker Compose

### Complete `.env` Example

```bash
# MongoDB
MONGO_USER=admin
MONGO_PASSWORD=secure_random_password_here

# RabbitMQ
RABBITMQ_USER=weather_user
RABBITMQ_PASSWORD=secure_random_password_here

# Backend
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=change_this_in_production
CORS_ORIGIN=http://localhost:5173

# Collector
LATITUDE=-23.5505
LONGITUDE=-46.6333
CITY_NAME=Sao Paulo
```

---

## Production Deployment

### AWS Secrets Manager
```bash
aws secretsmanager create-secret \
  --name weather-app-secrets \
  --secret-string '{
    "MONGO_PASSWORD":"xxx",
    "JWT_SECRET":"xxx",
    "RABBITMQ_PASSWORD":"xxx",
    "DEFAULT_ADMIN_PASSWORD":"xxx"
  }'
```

### Google Cloud Secret Manager
```bash
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
```

### Vercel
```bash
vercel env add VITE_API_URL production
```

### Railway
```bash
railway variables set JWT_SECRET=your-secret
```

### Fly.io
```bash
flyctl secrets set JWT_SECRET="your-secret" --app weather-backend
```

---

## Security Best Practices

### 1. Never Hardcode Secrets
❌ **Bad:**
```typescript
const JWT_SECRET = 'my-secret-key';
```

✅ **Good:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
```

### 2. Use Strong Secrets
- **JWT_SECRET:** Minimum 32 characters, random
- **Passwords:** Minimum 12 characters, mixed case, numbers, symbols
- **API Keys:** Use platform-generated keys

### 3. Rotate Secrets Regularly
- JWT secrets: Every 90 days
- Database passwords: Every 180 days
- API keys: When compromised

### 4. Restrict Access
- Use environment-specific secrets
- Limit who can view/edit secrets
- Audit secret access logs

### 5. Use Secret Management Tools
- **AWS:** Secrets Manager, Parameter Store
- **GCP:** Secret Manager
- **Azure:** Key Vault
- **HashiCorp:** Vault
- **Doppler:** Universal secrets manager

---

## Validation

### Backend Validation
```typescript
// src/config/env.validation.ts
import { plainToClass } from 'class-transformer';
import { IsString, IsNumber, validateSync, MinLength } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  MONGO_URI: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsNumber()
  PORT: number = 3000;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
```

### Frontend Validation
```typescript
// src/config/env.ts
const requiredEnvVars = ['VITE_API_URL'];

requiredEnvVars.forEach((envVar) => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
};
```

---

## Troubleshooting

### Issue: "Environment variable not found"
**Solution:**
1. Check `.env` file exists
2. Verify variable name (case-sensitive)
3. Restart application after changes
4. Check `.env` is not in `.gitignore` (for local dev)

### Issue: "Invalid JWT secret"
**Solution:**
1. Ensure `JWT_SECRET` is at least 32 characters
2. Check for special characters that need escaping
3. Verify secret is the same across all instances

### Issue: "CORS error"
**Solution:**
1. Set `CORS_ORIGIN` to frontend URL
2. Include protocol (http/https)
3. No trailing slash
4. For multiple origins: `https://app1.com,https://app2.com`

---

## Templates

### Development `.env`
```bash
# Copy to .env for local development
MONGO_URI=mongodb://localhost:27017/weather
JWT_SECRET=dev-secret-key-min-32-chars-long-for-testing
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=123456
CORS_ORIGIN=http://localhost:5173
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

### Production `.env.example`
```bash
# Copy to .env and fill in values
MONGO_URI=
JWT_SECRET=
DEFAULT_ADMIN_EMAIL=
DEFAULT_ADMIN_PASSWORD=
CORS_ORIGIN=
RABBITMQ_USER=
RABBITMQ_PASSWORD=
```
