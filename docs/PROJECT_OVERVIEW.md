# 🌦️ Weather Dashboard - Projeto Full-Stack

Sistema completo de monitoramento climático em **microserviços**, desenvolvido como desafio técnico.

---

## 🎯 **Objetivo**

Criar uma aplicação que:

1. ✅ Coleta dados climáticos automaticamente (Python)
2. ✅ Processa em fila de mensagens (RabbitMQ)
3. ✅ Consome com workers concorrentes (Go)
4. ✅ Armazena em API REST (NestJS + MongoDB)
5. ✅ Visualiza em dashboard interativo (React)

---

## 🏗️ **Arquitetura**

```
┌─────────────────┐
│ Python Collector│  Coleta a cada 5 min
│   Open-Meteo    │
└────────┬────────┘
         │ Publica
         ▼
┌─────────────────┐
│    RabbitMQ     │  Fila: weather_data
│  Message Broker │
└────────┬────────┘
         │ Consome (5 workers)
         ▼
┌─────────────────┐
│   Go Worker     │  Valida e encaminha
│  Concurrency: 5 │
└────────┬────────┘
         │ HTTP POST
         ▼
┌─────────────────┐
│   NestJS API    │  REST + Mongoose
│   Port: 3000    │
└────────┬────────┘
         │ Persiste
         ▼
┌─────────────────┐       ┌─────────────────┐
│    MongoDB      │◄──────┤  React Frontend │
│   Database      │   API │   Dashboard     │
└─────────────────┘       └─────────────────┘
```

---

## 📁 **Estrutura do Projeto**

```
desafio_gdash/
├── python-weather-collector/    # Coletor de dados climáticos
│   ├── src/
│   │   ├── main.py              # Entry point
│   │   ├── weather_api.py       # Open-Meteo API client
│   │   ├── queue_publisher.py   # RabbitMQ publisher
│   │   └── config.py            # Configurações
│   ├── requirements.txt
│   └── Dockerfile
│
├── go-weather-worker/           # Consumidor RabbitMQ + HTTP client
│   ├── cmd/worker/main.go       # Entry point
│   ├── internal/
│   │   ├── config/              # Variáveis de ambiente
│   │   ├── models/              # WeatherData struct
│   │   ├── api/                 # HTTP client para NestJS
│   │   └── queue/               # Consumer com concorrência
│   ├── go.mod
│   └── Dockerfile
│
├── nestjs-api/                  # API REST + MongoDB
│   ├── src/
│   │   ├── weather/
│   │   │   ├── schemas/         # Mongoose schemas
│   │   │   ├── dto/             # Validação com class-validator
│   │   │   ├── weather.service.ts
│   │   │   ├── weather.controller.ts
│   │   │   └── weather.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── Dockerfile
│
├── desafio_gdash/               # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── WeatherCard.jsx
│   │   │   ├── TemperatureChart.jsx
│   │   │   └── Statistics.jsx
│   │   ├── services/
│   │   │   └── weatherService.js
│   │   └── App.jsx
│   ├── package.json
│   └── .env
│
└── docker-compose.yml           # Orquestração completa
```

---

## 🚀 **Como Executar**

### **1. Pré-requisitos**

- Docker + Docker Compose
- Node.js 20+ (para desenvolvimento frontend)

### **2. Iniciar Backend (Docker)**

```bash
# Na raiz do projeto
docker-compose up --build

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f nestjs-api
```

### **3. Iniciar Frontend (Dev)**

```bash
cd desafio_gdash
npm install
npm run dev
```

### **4. Acessar**

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api/weather/stats
- **RabbitMQ Management**: http://localhost:15672 (admin/admin123)
- **MongoDB**: localhost:27017 (admin/admin123)

---

## 📊 **Dados Coletados**

| Campo           | Tipo     | Descrição                        |
| --------------- | -------- | -------------------------------- |
| `timestamp`     | DateTime | Timestamp da coleta              |
| `collected_at`  | DateTime | Hora da medição (Open-Meteo)     |
| `latitude`      | Float    | Latitude (-23.5505 = São Paulo)  |
| `longitude`     | Float    | Longitude (-46.6333 = São Paulo) |
| `temperature`   | Float    | Temperatura em °C                |
| `humidity`      | Int      | Umidade relativa (%)             |
| `wind_speed`    | Float    | Velocidade do vento (km/h)       |
| `precipitation` | Float    | Precipitação (mm)                |
| `weather_code`  | Int      | Código WMO (0-99)                |
| `condition`     | String   | Condição traduzida (pt-BR)       |

---

## 🔧 **Tecnologias Utilizadas**

### **Backend**

- **Python 3.11**: Requests, Pika (AMQP), Schedule
- **Go 1.21**: Goroutines, AMQP091-Go, Godotenv
- **NestJS 10**: TypeScript, Mongoose, class-validator
- **MongoDB 7**: Banco NoSQL com timestamps automáticos
- **RabbitMQ 3**: Message broker com management UI

### **Frontend**

- **React 19**: Hooks (useState, useEffect)
- **Vite 7**: Build tool com HMR
- **Tailwind CSS 3**: Utility-first styling
- **Recharts**: Gráficos interativos
- **Axios**: Cliente HTTP
- **date-fns**: Formatação de datas

### **DevOps**

- **Docker**: Multi-stage builds
- **Docker Compose**: Orquestração com healthchecks

---

## 📈 **Endpoints da API**

### **POST /api/weather/logs**

Recebe dados do Go Worker (uso interno).

### **GET /api/weather/logs?limit=100**

Lista últimos N registros.

### **GET /api/weather/recent?hours=24**

Registros das últimas N horas.

### **GET /api/weather/stats**

Estatísticas gerais (total, último registro, status).

---

## 🧪 **Como Testar**

### **1. Verificar Coleta Python**

```bash
docker-compose logs python-weather-collector
# Deve mostrar: "✅ Dados publicados na fila 'weather_data'"
```

### **2. Verificar Consumo Go**

```bash
docker-compose logs go-weather-worker
# Deve mostrar: "✅ Dados enviados com sucesso para a API"
```

### **3. Verificar API NestJS**

```bash
curl http://localhost:3000/api/weather/stats
# Deve retornar JSON com total_records > 0
```

### **4. Verificar MongoDB**

```bash
docker exec -it gdash-mongodb mongosh -u admin -p admin123 \
  --authenticationDatabase admin weather_dashboard \
  --eval "db.weathers.countDocuments()"
```

### **5. Verificar Frontend**

Abra http://localhost:5173 e veja o dashboard atualizado.

---

## 🔄 **Fluxo de Dados**

1. **A cada 5 minutos**:

   - Python consulta Open-Meteo API
   - Valida dados (fallback para hourly se current === null)
   - Publica JSON na fila RabbitMQ `weather_data`

2. **Go Workers (5 concorrentes)**:

   - Consomem mensagens da fila
   - Validam struct WeatherData
   - Enviam POST para NestJS (retry 3x)
   - ACK/NACK na fila

3. **NestJS API**:

   - Valida DTO com class-validator
   - Salva no MongoDB via Mongoose
   - Retorna 201 Created

4. **React Frontend**:
   - Busca dados via Axios (stats + recent)
   - Auto-refresh a cada 30 segundos
   - Renderiza dashboard com Recharts

---

## 🐳 **Docker Compose Services**

| Service                    | Imagem                | Porta       | Healthcheck          |
| -------------------------- | --------------------- | ----------- | -------------------- |
| `mongodb`                  | mongo:7               | 27017       | mongosh ping         |
| `rabbitmq`                 | rabbitmq:3-management | 5672, 15672 | rabbitmq-diagnostics |
| `python-weather-collector` | custom                | -           | -                    |
| `go-weather-worker`        | custom                | -           | -                    |
| `nestjs-api`               | custom                | 3000        | HTTP GET /stats      |

---

## 🚧 **Próximas Funcionalidades**

### **Backend**

- [ ] JWT Authentication (proteger endpoints)
- [ ] Exportação CSV/XLSX
- [ ] Endpoints de insights com IA
- [ ] Cache com Redis
- [ ] Rate limiting

### **Frontend**

- [ ] Filtros de data (date range picker)
- [ ] Dark mode toggle
- [ ] Gráfico de vento adicional
- [ ] Exportação de relatórios
- [ ] PWA (Service Worker)

### **DevOps**

- [ ] CI/CD com GitHub Actions
- [ ] Deploy em nuvem (Azure/AWS)
- [ ] Monitoring com Prometheus + Grafana
- [ ] Logs centralizados (ELK Stack)

---

## 📚 **Documentação Técnica**

- [Python Collector README](python-weather-collector/README.md)
- [Go Worker README](go-weather-worker/README.md)
- [NestJS API README](nestjs-api/README.md)
- [React Frontend README](desafio_gdash/FRONTEND.md)

---

## 🤝 **Contribuindo**

Este é um projeto de aprendizado! Sugestões:

- Adicionar testes unitários (Jest, Go testing, pytest)
- Implementar cache de consultas
- Melhorar tratamento de erros
- Adicionar documentação Swagger

---

## 📝 **Licença**

MIT License - Sinta-se livre para usar como base de estudo!

---

## 🎓 **Conceitos Aprendidos**

### **Microserviços**

- Comunicação assíncrona (message broker)
- HTTP REST entre serviços
- Desacoplamento de responsabilidades

### **Concorrência**

- Go goroutines com workers pool
- Channel para ACK/NACK no RabbitMQ
- Controle de concorrência (5 workers simultâneos)

### **DevOps**

- Multi-stage Docker builds (otimização de imagem)
- Healthchecks para dependências
- Ordem de inicialização (depends_on + condition)

### **Backend**

- NestJS Dependency Injection
- Mongoose schemas com timestamps
- Validação de DTOs com decorators

### **Frontend**

- React Hooks (useState, useEffect)
- Auto-refresh com setInterval + cleanup
- Fetch paralelo com Promise.all
- Recharts com duplo eixo Y

---

**Desenvolvido como parte do desafio GDash** 🚀  
**Tech Stack**: Python · Go · NestJS · React · MongoDB · RabbitMQ · Docker
