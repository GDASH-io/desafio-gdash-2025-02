# GDASH - Architecture

## Overview

Weather intelligence platform that collects, processes and analyzes climate data in real-time with AI-generated insights.

## Data Flow

```
OpenWeather API -> Python Collector -> Redis Queue -> Go Worker -> NestJS API -> MongoDB
                                                                        |
                                                                   React Frontend
```

## Services

### 1. Python Collector (services/python-collector)

Collects weather data every 5 minutes from OpenWeather API and publishes to Redis queue.

**Main file**: `main.py`

- HTTP requests to OpenWeather API
- Data normalization and validation
- Publishes to 'weather:queue' channel

### 2. Go Worker (services/go-worker)

Consumes messages from Redis queue and sends to NestJS API via HTTP POST.

**Files**:

- `main.go` - Entry point
- `worker/consumer.go` - Redis queue consumer
- `worker/processor.go` - Data processing
- `client/api_client.go` - HTTP client for NestJS API

### 3. NestJS API (services/nestjs-api)

Main backend with JWT authentication, AI insights generation, CSV/XLSX export and MongoDB persistence.

**Structure**:

- `auth/` - Authentication (login/register)
- `users/` - User management
- `weather/` - Core module
  - `weather.controller.ts` - API routes
  - `weather.service.ts` - Business logic
  - `insights.service.ts` - AI insights generation
  - `schemas/` - MongoDB models

**AI Insights**: `src/weather/insights.service.ts`

The AI analysis happens in the `generateInsights()` method:

1. Fetches recent weather data from MongoDB
2. Calculates statistics (avg, min, max)
3. Builds contextual prompt for OpenAI
4. Uses GPT-4 Turbo (configurable model)
5. Returns analysis in Portuguese

Endpoint: `GET /weather/insights?limit=50`

### 4. React Frontend (services/react-frontend)

Modern web interface with real-time weather dashboard.

**Structure**:

- `components/` - Reusable components (WeatherCard, Charts, etc)
- `pages/` - Main pages (Dashboard, Login, WeatherList)
- `services/api.ts` - HTTP client (Axios)
- `contexts/AuthContext.tsx` - Authentication management

Tech stack: React 18 + TypeScript + Vite + Tailwind CSS

## Data Models

### MongoDB - weathers collection

```javascript
{
  city: "Lisboa",
  country: "PT",
  temperature: 18.5,
  feelsLike: 17.2,
  humidity: 75,
  pressure: 1013,
  windSpeed: 3.5,
  description: "Clear sky",
  icon: "01d",
  timestamp: ISODate("2025-11-25T12:00:00Z")
}
```

### Redis Queue

Queue: `weather:queue`
Format: JSON string

## API Endpoints

### Auth

- POST /auth/register
- POST /auth/login

### Weather

- POST /weather - Create record (internal)
- GET /weather - List data
- GET /weather/statistics - Aggregated stats
- GET /weather/insights - AI insights
- GET /weather/export/csv - Export CSV
- GET /weather/export/xlsx - Export Excel
- GET /weather/:id - Get specific record

### Users

- GET /users
- GET /users/:id
- PUT /users/:id
- DELETE /users/:id

## Environment Variables

```env
# MongoDB
MONGO_URI=mongodb://admin:password@mongodb:27017/gdash?authSource=admin

# Redis
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# OpenAI (AI Insights)
OPENAI_API_KEY=sk-proj-xxx
OPENAI_MODEL=gpt-4-turbo-preview

# OpenWeather (Collection)
OPENWEATHER_API_KEY=your-key
OPENWEATHER_CITIES=Lisboa,Porto,São Paulo,Rio de Janeiro
COLLECTOR_INTERVAL=300

# Frontend
VITE_API_URL=http://localhost:3000
```

## Docker Setup

### Containers

1. **gdash-redis** (redis:7-alpine) - Port 6379
2. **gdash-mongodb** (mongo:7) - Port 27017
3. **gdash-python-collector** - Data collection
4. **gdash-go-worker** - Queue processing
5. **gdash-nestjs-api** - Port 3000 - Main API
6. **gdash-react-frontend** - Port 5173 - Web UI

### Network

Bridge network: `gdash_gdash-network`
All containers communicate via service names.

## Tech Stack

### Backend

- NestJS 10 + TypeScript
- MongoDB + Mongoose
- Passport JWT
- OpenAI SDK

### Worker & Collector

- Go 1.21
- Python 3.11
- Redis 7

### Frontend

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Axios

### Infrastructure

- Docker & Docker Compose
- Redis 7
- MongoDB 7
