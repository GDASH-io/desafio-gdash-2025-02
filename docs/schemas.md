# Schemas de Comunicação entre Serviços

## 📡 Fluxo Completo de Dados

```
Python → RabbitMQ → Go → NestJS → MongoDB → Frontend
```

---

## 1️⃣ Python (Collector) → RabbitMQ

**Fila**: `weather_data_queue`

**Exchange**: `weather_exchange` (type: direct)

**Routing Key**: `weather.data`

### Estrutura da Mensagem

```json
{
  "timestamp": "2025-11-23T10:00:00Z",
  "location": {
    "city": "São Paulo",
    "state": "SP",
    "country": "BR",
    "latitude": -23.5505,
    "longitude": -46.6333
  },
  "current": {
    "temperature": 28.5,
    "feels_like": 30.2,
    "humidity": 65,
    "wind_speed": 12.3,
    "wind_direction": 180,
    "pressure": 1013,
    "uv_index": 7,
    "visibility": 10000,
    "condition": "partly_cloudy",
    "rain_probability": 30,
    "cloud_cover": 40
  },
  "metadata": {
    "source": "open-meteo",
    "collector_version": "1.0.0"
  }
}
```

### Tipos de Campos

```typescript
interface WeatherMessage {
  timestamp: string;           // ISO 8601 format
  location: {
    city: string;
    state: string;
    country: string;
    latitude: number;          // -90 to 90
    longitude: number;         // -180 to 180
  };
  current: {
    temperature: number;       // Celsius
    feels_like: number;        // Celsius
    humidity: number;          // 0-100%
    wind_speed: number;        // km/h
    wind_direction: number;    // degrees (0-360)
    pressure: number;          // hPa
    uv_index: number;          // 0-11+
    visibility: number;        // meters
    condition: WeatherCondition;
    rain_probability: number;  // 0-100%
    cloud_cover: number;       // 0-100%
  };
  metadata: {
    source: string;
    collector_version: string;
  };
}

type WeatherCondition = 
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'overcast'
  | 'rainy'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'foggy'
  | 'snowy';
```

---

## 2️⃣ Go (Worker) → NestJS API

**Endpoint**: `POST /api/weather/logs`

**Headers**:
```
Content-Type: application/json
X-Worker-ID: queue-worker-01
X-Message-ID: <RabbitMQ Message ID>
```

### Request Body

```json
{
  "timestamp": "2025-11-23T10:00:00Z",
  "city": "São Paulo",
  "state": "SP",
  "country": "BR",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "temperature": 28.5,
  "feelsLike": 30.2,
  "humidity": 65,
  "windSpeed": 12.3,
  "windDirection": 180,
  "pressure": 1013,
  "uvIndex": 7,
  "visibility": 10000,
  "condition": "partly_cloudy",
  "rainProbability": 30,
  "cloudCover": 40,
  "source": "open-meteo"
}
```

### Response

**Success (201 Created)**:
```json
{
  "id": "674217e8c3f4a2b1d9e5f6a7",
  "timestamp": "2025-11-23T10:00:00Z",
  "city": "São Paulo",
  "message": "Weather log created successfully"
}
```

**Error (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": ["temperature must be a number", "humidity is required"],
  "error": "Bad Request"
}
```

**Error (500 Internal Server Error)**:
```json
{
  "statusCode": 500,
  "message": "Failed to save weather log",
  "error": "Internal Server Error"
}
```

---

## 3️⃣ NestJS API → Frontend

### GET /api/weather/logs

**Query Parameters**:
```
?page=1
&limit=20
&city=São Paulo
&startDate=2025-11-22T00:00:00Z
&endDate=2025-11-23T23:59:59Z
&sortBy=timestamp
&order=desc
```

**Response**:
```json
{
  "data": [
    {
      "id": "674217e8c3f4a2b1d9e5f6a7",
      "timestamp": "2025-11-23T10:00:00Z",
      "city": "São Paulo",
      "temperature": 28.5,
      "humidity": 65,
      "condition": "partly_cloudy"
      // ... outros campos
    }
  ],
  "pagination": {
    "total": 487,
    "page": 1,
    "limit": 20,
    "totalPages": 25
  }
}
```

---

### GET /api/weather/insights

**Response**:
```json
{
  "timestamp": "2025-11-23T11:00:00Z",
  "period": "24h",
  "summary": "Nas últimas 24 horas, a temperatura média em São Paulo foi de 27°C, com tendência de alta ao longo do dia. A umidade permaneceu estável em torno de 63%. Recomenda-se hidratação adequada, especialmente durante as horas mais quentes.",
  "metrics": {
    "avgTemperature": 27.3,
    "minTemperature": 22.1,
    "maxTemperature": 31.8,
    "avgHumidity": 63,
    "avgWindSpeed": 11.2,
    "comfortScore": 75,
    "trend": "rising"
  },
  "alerts": [
    {
      "type": "heat",
      "severity": "medium",
      "message": "Temperaturas acima de 30°C esperadas entre 13h-16h",
      "icon": "☀️"
    },
    {
      "type": "uv",
      "severity": "high",
      "message": "Índice UV alto. Use protetor solar.",
      "icon": "🌞"
    }
  ],
  "recommendations": [
    "Mantenha-se hidratado bebendo pelo menos 2L de água",
    "Evite exercícios intensos ao ar livre entre 12h-16h",
    "Use protetor solar FPS 30+ se expor ao sol"
  ],
  "cachedAt": "2025-11-23T11:00:00Z",
  "expiresAt": "2025-11-23T12:00:00Z"
}
```

---

### GET /api/weather/export.csv

**Response Headers**:
```
Content-Type: text/csv
Content-Disposition: attachment; filename="weather-data-2025-11-23.csv"
```

**Response Body** (CSV):
```csv
timestamp,city,temperature,humidity,wind_speed,condition
2025-11-23T10:00:00Z,São Paulo,28.5,65,12.3,partly_cloudy
2025-11-23T09:00:00Z,São Paulo,27.2,68,10.5,cloudy
...
```

---

### GET /api/weather/export.xlsx

**Response Headers**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="weather-data-2025-11-23.xlsx"
```

---

### POST /api/auth/login

**Request**:
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "674217e8c3f4a2b1d9e5f6a7",
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
```

---

### GET /api/users

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "data": [
    {
      "id": "674217e8c3f4a2b1d9e5f6a7",
      "email": "admin@example.com",
      "name": "Admin User",
      "createdAt": "2025-11-20T10:00:00Z"
    }
  ]
}
```

---

## 🔒 Validações

### Weather Log (NestJS DTO)

```typescript
import { IsNumber, IsString, IsDate, Min, Max } from 'class-validator';

export class CreateWeatherLogDto {
  @IsDate()
  timestamp: Date;

  @IsString()
  city: string;

  @IsNumber()
  @Min(-50)
  @Max(60)
  temperature: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @IsNumber()
  @Min(0)
  windSpeed: number;

  @IsString()
  condition: string;

  // ... outros campos
}
```

---

## 🔄 Retry Strategy (Go Worker)

```go
type RetryConfig struct {
    MaxRetries      int           // 3
    InitialDelay    time.Duration // 1s
    MaxDelay        time.Duration // 30s
    BackoffFactor   float64       // 2.0 (exponential)
}
```

**Exemplo de retry**:
- Tentativa 1: Imediata
- Tentativa 2: Após 1s
- Tentativa 3: Após 2s
- Tentativa 4: Após 4s
- Se falhar todas → Dead Letter Queue (DLQ)

---

## 📦 Convenções

- **Datas**: Sempre em ISO 8601 (UTC)
- **Números**: Sempre com ponto decimal (não vírgula)
- **CamelCase**: Frontend e NestJS (TypeScript)
- **snake_case**: Python e mensagens RabbitMQ
- **PascalCase**: Go (structs)
