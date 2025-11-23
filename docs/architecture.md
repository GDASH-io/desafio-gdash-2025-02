# Arquitetura do Sistema

## 🏗️ Visão Geral

Sistema fullstack de monitoramento climático em tempo real com insights gerados por IA, utilizando arquitetura de microsserviços.

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUXO DE DADOS                            │
└──────────────────────────────────────────────────────────────┘

Python (Collector)
    │ Coleta dados climáticos a cada hora
    │ API: Open-Meteo (gratuita, sem API key)
    ↓
RabbitMQ (Message Broker)
    │ Fila: weather_data_queue
    │ Garante entrega confiável
    ↓
Go (Queue Worker)
    │ Consome mensagens
    │ Validação + Retry/Ack/Nack
    │ HTTP POST para NestJS
    ↓
NestJS (API - Orquestrador)
    │ Salva dados no MongoDB
    │ Gera insights com Groq + Llama 3
    │ Cacheia insights (1h)
    │ REST API + JWT Auth
    ↓
React (Frontend)
    │ Dashboard com shadcn/ui
    │ Gráficos + Cards + Tabelas
    │ Export CSV/XLSX
```

## 📦 Estrutura do Monorepo

```
desafio-gdash-2025-02/
├── services/
│   ├── weather-collector/    # Python - Coleta dados climáticos
│   ├── queue-worker/          # Go - Consome RabbitMQ
│   ├── api/                   # NestJS - Backend principal
│   └── frontend/              # React + Vite + Tailwind + shadcn/ui
├── docs/
│   ├── architecture.md        # Este arquivo
│   └── schemas.md             # Schemas JSON de comunicação
├── docker-compose.yml         # Orquestração de todos serviços
├── .env.example               # Variáveis de ambiente
└── README.md                  # Documentação principal
```

## 🔧 Stack Técnico

### Backend
- **NestJS** (TypeScript) - API REST + Orquestração
- **MongoDB** - Banco de dados NoSQL
- **RabbitMQ** - Message broker
- **Groq API** - LLM para insights (Llama 3.1 70B)

### Coleta & Processamento
- **Python** - Scheduler para coleta de dados (APScheduler)
- **Go** - Worker de alta performance para fila

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos

### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **Redis** (opcional) - Cache de insights

## 🎯 Decisões Arquiteturais

### 1. Por que Open-Meteo?
- ✅ Gratuito sem API key
- ✅ Dados históricos e previsão
- ✅ API simples e bem documentada
- ✅ Sem rate limits restritivos

### 2. Por que Groq + Llama 3?
- ✅ 100% gratuito (tier generoso)
- ✅ Inferência ultra-rápida (~1-2s)
- ✅ API compatível com OpenAI
- ✅ Modelo potente (70B parâmetros)

### 3. Por que Go para o Worker?
- ✅ Alta performance
- ✅ Concorrência nativa (goroutines)
- ✅ Binário compilado (mais rápido)
- ✅ Excelentes bibliotecas para RabbitMQ

### 4. Por que NestJS?
- ✅ TypeScript end-to-end
- ✅ Arquitetura modular
- ✅ Integração nativa com MongoDB (Mongoose)
- ✅ Middleware e Guards para auth
- ✅ Fácil adicionar Swagger

### 5. Por que shadcn/ui?
- ✅ Componentes customizáveis
- ✅ Acessíveis (a11y)
- ✅ Integração perfeita com Tailwind
- ✅ Copy-paste (não é npm package)
- ✅ Dark mode pronto

## 📊 Schemas de Comunicação

### Python → RabbitMQ
```json
{
  "timestamp": "2025-11-23T10:00:00Z",
  "location": {
    "city": "São Paulo",
    "latitude": -23.5505,
    "longitude": -46.6333
  },
  "current": {
    "temperature": 28.5,
    "humidity": 65,
    "wind_speed": 12.3,
    "condition": "partly_cloudy",
    "rain_probability": 30
  }
}
```

### Go → NestJS (POST /api/weather/logs)
```json
{
  "timestamp": "2025-11-23T10:00:00Z",
  "city": "São Paulo",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "temperature": 28.5,
  "humidity": 65,
  "windSpeed": 12.3,
  "condition": "partly_cloudy",
  "rainProbability": 30
}
```

### NestJS → Frontend (GET /api/weather/insights)
```json
{
  "timestamp": "2025-11-23T11:00:00Z",
  "summary": "Nas últimas 24 horas, a temperatura média foi de 27°C com tendência de alta...",
  "metrics": {
    "avgTemperature": 27.3,
    "avgHumidity": 63,
    "comfortScore": 75,
    "trend": "rising"
  },
  "alerts": [
    {
      "type": "heat",
      "severity": "medium",
      "message": "Temperaturas acima de 30°C esperadas"
    }
  ],
  "recommendations": [
    "Mantenha-se hidratado",
    "Evite exercícios ao ar livre entre 12h-16h"
  ]
}
```

## 🔐 Segurança

- JWT para autenticação
- Bcrypt para hash de senhas
- Validação de entrada em todos os endpoints
- Rate limiting na API (opcional)
- CORS configurado

## 📈 Performance

- Cache de insights (1h) para reduzir calls ao Groq
- Índices no MongoDB (timestamp, city)
- Paginação em listagens
- Lazy loading no frontend
- Image optimization (se houver imagens)

## 🚀 Deployment

Todos os serviços rodando via Docker Compose:
- `docker-compose up -d`

Portas padrão:
- Frontend: `http://localhost:3000`
- API: `http://localhost:4000`
- RabbitMQ Management: `http://localhost:15672`
- MongoDB: `localhost:27017`
