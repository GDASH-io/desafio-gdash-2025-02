# Documentação de Endpoints - GDASH Challenge

Este documento descreve todos os endpoints da aplicação, incluindo os já implementados e os que serão desenvolvidos nas próximas fases.

**Última atualização:** 21/11/2025 - Melhorias no Dashboard (Fluxo 1, 2, 3) implementadas

---

## Índice

1. [Collector (Python)](#1-collector-python)
2. [Worker (Go)](#2-worker-go)
3. [API NestJS](#3-api-nestjs)
   - [3.1. Weather Logs](#31-weather-logs)
   - [3.2. Insights de IA](#32-insights-de-ia)
   - [3.3. Autenticação](#33-autenticação)
   - [3.4. Usuários](#34-usuários)
   - [3.5. API Pública (Opcional)](#35-api-pública-opcional)
4. [Frontend (React)](#4-frontend-react)

---

## 1. Collector (Python)

### ✅ GET `/healthz`

**Status:** Implementado

**Descrição:** Verifica a saúde do serviço collector e conexão com Kafka.

**Base URL:** `http://localhost:8080`

**Método:** `GET`

**Headers:**
```
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "status": "healthy",
  "kafka": "connected"
}
```

**Resposta de Erro (503):**
```json
{
  "status": "healthy",
  "kafka": "disconnected"
}
```

**Exemplo de Requisição:**
```bash
curl http://localhost:8080/healthz
```

---

## 2. Worker (Go)

### ✅ GET `/healthz`

**Status:** Implementado

**Descrição:** Verifica a saúde do worker e conexões com Kafka e API NestJS.

**Base URL:** `http://localhost:8081`

**Método:** `GET`

**Headers:**
```
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "status": "healthy",
  "kafka": "connected",
  "api": "connected"
}
```

**Resposta de Erro (503):**
```json
{
  "status": "healthy",
  "kafka": "disconnected",
  "api": "disconnected"
}
```

**Exemplo de Requisição:**
```bash
curl http://localhost:8081/healthz
```

---

## 3. API NestJS

**Base URL:** `http://localhost:3000`

**Prefixo:** `/api/v1`

---

### 3.1. Weather Logs

#### ✅ POST `/api/v1/weather/logs`

**Status:** Implementado (Fase 4)

**Descrição:** Recebe logs de clima processados pelo worker Go e armazena no MongoDB.

**Autenticação:** Não requerida (endpoint interno)

**Método:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body (Array de logs):**
```json
[
  {
    "timestamp": "2025-11-19T20:00:00-03:00",
    "city": "Coronel Fabriciano",
    "source": "openmeteo",
    "temperature_c": 23.5,
    "relative_humidity": 78,
    "precipitation_mm": 0.0,
    "wind_speed_m_s": 2.3,
    "clouds_percent": 75,
    "weather_code": 801,
    "estimated_irradiance_w_m2": 420.0,
    "temp_effect_factor": 0.98,
    "soiling_risk": "low",
    "wind_derating_flag": false,
    "pv_derating_pct": 2.0
  }
]
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Logs criados com sucesso",
  "created": 1,
  "ids": ["507f1f77bcf86cd799439011"]
}
```

**Resposta de Erro (400):**
```json
{
  "statusCode": 400,
  "message": "Dados inválidos",
  "errors": [
    {
      "field": "temperature_c",
      "message": "temperature_c deve ser um número"
    }
  ]
}
```

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/api/v1/weather/logs \
  -H "Content-Type: application/json" \
  -d '[
    {
      "timestamp": "2025-11-19T20:00:00-03:00",
      "city": "Coronel Fabriciano",
      "source": "openmeteo",
      "temperature_c": 23.5,
      "relative_humidity": 78,
      "precipitation_mm": 0.0,
      "wind_speed_m_s": 2.3,
      "clouds_percent": 75,
      "weather_code": 801,
      "estimated_irradiance_w_m2": 420.0,
      "temp_effect_factor": 0.98,
      "soiling_risk": "low",
      "wind_derating_flag": false,
      "pv_derating_pct": 2.0
    }
  ]'
```

---

#### ✅ GET `/api/v1/weather/logs`

**Status:** Implementado (Fase 4)

**Descrição:** Lista registros climáticos com paginação.

**Autenticação:** Requerida (JWT)

**Método:** `GET`

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10, máximo: 100)
- `start` (opcional): Data inicial (ISO 8601)
- `end` (opcional): Data final (ISO 8601)
- `city` (opcional): Filtrar por cidade
- `sort` (opcional): Ordenação (`asc` ou `desc`, padrão: `desc`)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "timestamp": "2025-11-19T20:00:00-03:00",
      "city": "Coronel Fabriciano",
      "source": "openmeteo",
      "temperature_c": 23.5,
      "relative_humidity": 78,
      "precipitation_mm": 0.0,
      "wind_speed_m_s": 2.3,
      "clouds_percent": 75,
      "weather_code": 801,
      "estimated_irradiance_w_m2": 420.0,
      "temp_effect_factor": 0.98,
      "soiling_risk": "low",
      "wind_derating_flag": false,
      "pv_derating_pct": 2.0,
      "createdAt": "2025-11-19T20:01:00-03:00",
      "updatedAt": "2025-11-19T20:01:00-03:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

**Exemplo de Requisição:**
```bash
curl -X GET "http://localhost:3000/api/v1/weather/logs?page=1&limit=10&start=2025-11-19T00:00:00-03:00" \
  -H "Authorization: Bearer <token>"
```

---

#### ✅ GET `/api/v1`

**Status:** Implementado

**Descrição:** Retorna informações sobre a API e seus endpoints disponíveis.

**Autenticação:** Não requerida (público)

**Método:** `GET`

**Headers:**
```
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "name": "GDASH API",
  "version": "1.0.0",
  "description": "API para sistema de monitoramento climático e energia solar",
  "endpoints": {
    "health": "/api/v1/weather/health",
    "auth": {
      "login": "/api/v1/auth/login",
      "register": "/api/v1/auth/register"
    },
    "weather": {
      "logs": "/api/v1/weather/logs",
      "latest": "/api/v1/weather/logs/latest",
      "precipitation24h": "/api/v1/weather/precipitation/24h",
      "insights": "/api/v1/weather/insights",
      "export": {
        "csv": "/api/v1/weather/export.csv",
        "xlsx": "/api/v1/weather/export.xlsx"
      }
    },
    "users": "/api/v1/users"
  }
}
```

**Exemplo de Requisição:**
```bash
curl -X GET http://localhost:3000/api/v1
```

---

#### ✅ GET `/api/v1/weather/logs/latest`

**Status:** Implementado (Fase 4)

**Descrição:** Retorna a leitura mais recente.

**Autenticação:** Requerida (JWT)

**Método:** `GET`

**Query Parameters:**
- `city` (opcional): Filtrar por cidade

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "timestamp": "2025-11-19T20:00:00-03:00",
  "city": "Coronel Fabriciano",
  "source": "openmeteo",
  "temperature_c": 23.5,
  "relative_humidity": 78,
  "precipitation_mm": 0.0,
  "wind_speed_m_s": 2.3,
  "clouds_percent": 75,
  "weather_code": 801,
  "estimated_irradiance_w_m2": 420.0,
  "temp_effect_factor": 0.98,
  "uv_index": 5.2,
  "pressure_hpa": 1013.5,
  "visibility_m": 10000,
  "wind_direction_10m": 180,
  "wind_gusts_10m": 3.5,
  "precipitation_probability": 20,
  "soiling_risk": "low",
  "wind_derating_flag": false,
  "pv_derating_pct": 2.0,
  "createdAt": "2025-11-19T20:01:00-03:00",
  "updatedAt": "2025-11-19T20:01:00-03:00"
}
```

**Resposta quando não há dados (404):**
```json
{
  "statusCode": 404,
  "message": "Nenhum registro encontrado"
}
```

**Exemplo de Requisição:**
```bash
curl -X GET http://localhost:3000/api/v1/weather/logs/latest \
  -H "Authorization: Bearer <token>"
```

---

#### ✅ GET `/api/v1/weather/precipitation/24h`

**Status:** Implementado

**Descrição:** Retorna a precipitação acumulada das últimas 24 horas.

**Autenticação:** Requerida (JWT)

**Método:** `GET`

**Query Parameters:**
- `city` (opcional): Filtrar por cidade

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "accumulated_mm": 12.5,
  "count": 24
}
```

**Exemplo de Requisição:**
```bash
curl -X GET "http://localhost:3000/api/v1/weather/precipitation/24h" \
  -H "Authorization: Bearer <token>"
```

---

#### ✅ GET `/api/v1/weather/export.csv`

**Status:** Implementado (Fase 4)

**Descrição:** Exporta registros climáticos em formato CSV.

**Autenticação:** Requerida (JWT)

**Método:** `GET`

**Query Parameters:**
- `start` (opcional): Data inicial (ISO 8601)
- `end` (opcional): Data final (ISO 8601)
- `city` (opcional): Filtrar por cidade

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="weather_logs_2025-11-19.csv"

timestamp,city,source,temperature_c,relative_humidity,precipitation_mm,wind_speed_m_s,clouds_percent,weather_code,estimated_irradiance_w_m2,temp_effect_factor,soiling_risk,wind_derating_flag,pv_derating_pct
2025-11-19T20:00:00-03:00,Coronel Fabriciano,openmeteo,23.5,78,0.0,2.3,75,801,420.0,0.98,low,false,2.0
```

**Exemplo de Requisição:**
```bash
curl -X GET "http://localhost:3000/api/v1/weather/export.csv?start=2025-11-19T00:00:00-03:00" \
  -H "Authorization: Bearer <token>" \
  -o weather_logs.csv
```

---

#### ✅ GET `/api/v1/weather/export.xlsx`

**Status:** Implementado (Fase 4)

**Descrição:** Exporta registros climáticos em formato XLSX.

**Autenticação:** Requerida (JWT)

**Método:** `GET`

**Query Parameters:**
- `start` (opcional): Data inicial (ISO 8601)
- `end` (opcional): Data final (ISO 8601)
- `city` (opcional): Filtrar por cidade

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="weather_logs_2025-11-19.xlsx"

[Arquivo XLSX binário]
```

**Exemplo de Requisição:**
```bash
curl -X GET "http://localhost:3000/api/v1/weather/export.xlsx?start=2025-11-19T00:00:00-03:00" \
  -H "Authorization: Bearer <token>" \
  -o weather_logs.xlsx
```

---

### 3.2. Insights de IA

#### ✅ GET `/api/v1/weather/insights`

**Status:** Implementado (Fase 6)

**Descrição:** Gera e retorna insights de IA baseados em dados históricos de clima.

**Autenticação:** Requerida (JWT)

**Método:** `GET`

**Query Parameters:**
- `from` (obrigatório): Data inicial (ISO 8601)
- `to` (obrigatório): Data final (ISO 8601)
- `types` (opcional): Tipos de insights (`pv_metrics`, `alerts`, `summary`, `statistics`) - separados por vírgula

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "period": {
    "from": "2025-11-12T00:00:00-03:00",
    "to": "2025-11-19T00:00:00-03:00"
  },
  "pv_metrics": {
    "soiling_risk": {
      "level": "medium",
      "score": 45,
      "message": "Precipitação acumulada de 12mm nas últimas 24h indica risco médio de sujeira nos painéis"
    },
    "consecutive_cloudy_days": {
      "consecutive_days": 2,
      "estimated_reduction_pct": 15
    },
    "heat_derating": {
      "temp_c": 32,
      "derating_pct": 2.8
    },
    "wind_derating": {
      "wind_speed_m_s": 8,
      "risk_level": "low"
    },
    "estimated_production_pct": 82.2,
    "estimated_production_kwh": 125.5
  },
  "statistics": {
    "avg_temp": 26.5,
    "avg_humidity": 72,
    "trend": "rising",
    "slope": 0.15,
    "classification": "agradável"
  },
  "alerts": [
    {
      "type": "precipitation",
      "severity": "medium",
      "message": "Chuva prevista nas próximas 6h"
    }
  ],
  "summary": "Nos últimos 7 dias, a temperatura média foi de 26.5°C com umidade de 72%. A tendência é de aumento gradual. Condições favoráveis para produção de energia solar, com derating estimado de 2%.",
  "scores": {
    "comfort_score": 75,
    "pv_production_score": 82
  },
  "generated_at": "2025-11-19T21:00:00-03:00"
}
```

**Exemplo de Requisição:**
```bash
curl -X GET "http://localhost:3000/api/v1/weather/insights?from=2025-11-12T00:00:00-03:00&to=2025-11-19T00:00:00-03:00&types=pv_metrics,alerts" \
  -H "Authorization: Bearer <token>"
```

---

#### ✅ POST `/api/v1/weather/insights`

**Status:** Implementado (Fase 6)

**Descrição:** Força recálculo de insights (ignora cache).

**Autenticação:** Requerida (JWT)

**Método:** `POST`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "from": "2025-11-12T00:00:00-03:00",
  "to": "2025-11-19T00:00:00-03:00",
  "types": ["pv_metrics", "alerts", "summary"]
}
```

**Resposta de Sucesso (200):**
```json
{
  "period": {
    "from": "2025-11-12T00:00:00-03:00",
    "to": "2025-11-19T00:00:00-03:00"
  },
  "pv_metrics": { ... },
  "statistics": { ... },
  "alerts": [ ... ],
  "summary": "...",
  "scores": { ... },
  "generated_at": "2025-11-19T21:00:00-03:00"
}
```

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/api/v1/weather/insights \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "2025-11-12T00:00:00-03:00",
    "to": "2025-11-19T00:00:00-03:00",
    "types": ["pv_metrics", "alerts"]
  }'
```

---

### 3.3. Autenticação

#### ✅ POST `/api/v1/auth/login`

**Status:** Implementado (Fase 4)

**Descrição:** Autentica usuário e retorna token JWT.

**Autenticação:** Não requerida

**Método:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

**Resposta de Sucesso (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "name": "Admin"
  }
}
```

**Resposta de Erro (401):**
```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas"
}
```

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "123456"
  }'
```

---

#### ✅ POST `/api/v1/auth/register`

**Status:** Implementado (Fase 4)

**Descrição:** Registra novo usuário.

**Autenticação:** Não requerida

**Método:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  }
}
```

**Resposta de Erro (400):**
```json
{
  "statusCode": 400,
  "message": "Email já cadastrado"
}
```

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123",
    "name": "Nome do Usuário"
  }'
```

---

### 3.4. Usuários

#### ✅ GET `/api/v1/users`

**Status:** Implementado (Fase 4)

**Descrição:** Lista usuários (apenas admin).

**Autenticação:** Requerida (JWT) + Role: Admin

**Método:** `GET`

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "name": "Admin",
      "role": "admin",
      "createdAt": "2025-11-19T10:00:00-03:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

#### ✅ GET `/api/v1/users/:id`

**Status:** Implementado (Fase 4)

**Descrição:** Retorna detalhes de um usuário.

**Autenticação:** Requerida (JWT)

**Método:** `GET`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "admin@example.com",
  "name": "Admin",
  "role": "admin",
  "createdAt": "2025-11-19T10:00:00-03:00",
  "updatedAt": "2025-11-19T10:00:00-03:00"
}
```

---

#### ✅ PUT `/api/v1/users/:id`

**Status:** Implementado (Fase 4)

**Descrição:** Atualiza dados de um usuário.

**Autenticação:** Requerida (JWT) - apenas próprio usuário ou admin

**Método:** `PUT`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Novo Nome",
  "email": "novoemail@example.com"
}
```

**Resposta de Sucesso (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "novoemail@example.com",
  "name": "Novo Nome",
  "role": "admin",
  "updatedAt": "2025-11-19T21:00:00-03:00"
}
```

---

#### ✅ DELETE `/api/v1/users/:id`

**Status:** Implementado (Fase 4)

**Descrição:** Remove um usuário.

**Autenticação:** Requerida (JWT) - apenas admin

**Método:** `DELETE`

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Usuário removido com sucesso"
}
```

---

### 3.5. API Pública (Opcional)

#### ⏳ GET `/api/v1/pokemon`

**Status:** Opcional (Fase 4)

**Descrição:** Lista Pokémons com paginação (exemplo de integração com API pública).

**Autenticação:** Requerida (JWT)

**Método:** `GET`

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "bulbasaur",
      "url": "https://pokeapi.co/api/v2/pokemon/1/"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1154,
    "totalPages": 58
  }
}
```

---

#### ⏳ GET `/api/v1/pokemon/:id`

**Status:** Opcional (Fase 4)

**Descrição:** Retorna detalhes de um Pokémon.

**Autenticação:** Requerida (JWT)

**Método:** `GET`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "name": "bulbasaur",
  "height": 7,
  "weight": 69,
  "types": ["grass", "poison"],
  "abilities": ["overgrow", "chlorophyll"]
}
```

---

## 4. Frontend (React)

**Base URL:** `http://localhost:5173`

O frontend React consome os endpoints da API NestJS descritos acima. Não expõe endpoints próprios, mas utiliza:

- **Autenticação:** Login/Logout via `/api/v1/auth/login`
- **Dashboard:** Dados via `/api/v1/weather/logs` e `/api/v1/weather/logs/latest`
- **Insights:** Via `/api/v1/weather/insights`
- **Export:** Download via `/api/v1/weather/export.csv` e `/api/v1/weather/export.xlsx`

---

## Códigos de Status HTTP

| Código | Descrição | Uso |
|--------|-----------|-----|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Sem permissão para acessar o recurso |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro interno do servidor |
| 503 | Service Unavailable | Serviço temporariamente indisponível |

---

## Autenticação

A maioria dos endpoints da API NestJS requer autenticação via **JWT (JSON Web Token)**.

**Formato do Header:**
```
Authorization: Bearer <token>
```

**Token obtido via:**
```
POST /api/v1/auth/login
```

**Validade:** Tokens expiram após 1 hora (3600 segundos)

---

## Formato de Datas

Todas as datas seguem o formato **ISO 8601** com timezone:

```
2025-11-19T20:00:00-03:00
```

Onde:
- `2025-11-19`: Data (YYYY-MM-DD)
- `T20:00:00`: Hora (HH:MM:SS)
- `-03:00`: Timezone (UTC-3 para horário de Brasília)

---

## Paginação

Endpoints que retornam listas utilizam paginação padrão:

**Query Parameters:**
- `page`: Número da página (inicia em 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)

**Resposta:**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

## Tratamento de Erros

Todas as respostas de erro seguem o formato:

```json
{
  "statusCode": 400,
  "message": "Mensagem de erro descritiva",
  "errors": [
    {
      "field": "campo",
      "message": "Mensagem específica do campo"
    }
  ]
}
```

---

## Notas de Implementação

- ✅ **Implementado:** Endpoint já desenvolvido e testado
- ⏳ **A ser implementado:** Endpoint planejado para futuras fases
- 🔄 **Em desenvolvimento:** Endpoint em implementação

## Resumo de Status

### Implementados (Fases 1, 3, 4, 5)
- ✅ Collector healthcheck
- ✅ Worker healthcheck
- ✅ Weather Logs (POST, GET, GET latest, export CSV/XLSX, health)
- ✅ Autenticação (login, register)
- ✅ Usuários (CRUD completo)

### Implementados (Fase 6)
- ✅ Insights de IA (GET, POST)

### Opcionais
- ⏳ API Pública (Pokemon endpoints)

Este documento será atualizado conforme as fases do projeto forem concluídas.

