# Backend API Documentation

## Overview
NestJS-based REST API for weather data management with JWT authentication.

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require JWT Bearer token authentication.

### Get Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## API Endpoints

### Users

#### Create User
```http
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `201 Created`
```json
{
  "email": "user@example.com",
  "id": "507f1f77bcf86cd799439011",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### List Users
```http
GET /users
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "email": "user@example.com",
    "id": "507f1f77bcf86cd799439011",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Weather

#### Create Weather Log
```http
POST /weather/logs
Content-Type: application/json

{
  "city": "São Paulo",
  "temperature": 25.5,
  "humidity": 60,
  "windSpeed": 10.2,
  "condition": "Partly Cloudy"
}
```

**Response:** `201 Created`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "city": "São Paulo",
  "temperature": 25.5,
  "humidity": 60,
  "windSpeed": 10.2,
  "condition": "Partly Cloudy",
  "timestamp": 1640995200
}
```

#### Get Weather Logs
```http
GET /weather/logs
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "city": "São Paulo",
    "temperature": 25.5,
    "humidity": 60,
    "windSpeed": 10.2,
    "condition": "Partly Cloudy",
    "timestamp": 1640995200
  }
]
```

#### Get Weather Insights
```http
GET /weather/insights
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "latestCondition": "Partly Cloudy",
  "currentTemp": 25.5,
  "averageTemp": "24.3",
  "insight": "It is very hot! Stay hydrated."
}
```

#### Export CSV
```http
GET /weather/export/csv
```

**Response:** `200 OK` (CSV file download)

#### Export XLSX
```http
GET /weather/export/xlsx
```

**Response:** `200 OK` (XLSX file download)

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400,
    "timestamp": "2023-01-01T00:00:00.000Z",
    "path": "/api/endpoint"
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `AUTHENTICATION_ERROR` | 401 | Invalid or missing credentials |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting
- **Limit:** 100 requests per minute per IP
- **Response:** `429 Too Many Requests`

## Security Headers
- Helmet.js enabled for security headers
- CORS configured (configurable via `CORS_ORIGIN` env var)
- Input validation and sanitization enabled

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | JWT signing secret (min 32 chars) |
| `DEFAULT_ADMIN_EMAIL` | No | admin@example.com | Default admin email |
| `DEFAULT_ADMIN_PASSWORD` | No | - | Default admin password |
| `CORS_ORIGIN` | No | * | Allowed CORS origins |

## Swagger Documentation
Interactive API documentation available at:
```
http://localhost:3000/api
```
