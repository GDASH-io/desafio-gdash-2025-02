# Arquitetura do Sistema - GDASH Challenge 2025/02

**Versão:** 1.0  
**Data:** 21/11/2025  
**Autor:** Equipe de Desenvolvimento

---

## Visão Geral

O sistema GDASH é uma aplicação full-stack distribuída que coleta, processa e analisa dados climáticos para geração de insights sobre produção de energia solar fotovoltaica. A arquitetura segue princípios de Clean Architecture, microserviços e processamento assíncrono via message broker.

## Objetivo do Sistema

Desenvolver uma aplicação que integre múltiplas linguagens e serviços para:
- Coletar dados climáticos em tempo real
- Processar e calcular métricas de energia solar (PV)
- Armazenar dados históricos
- Gerar insights baseados em IA
- Expor dados via API REST
- Apresentar dashboard interativo

## Arquitetura de Alto Nível

### Diagrama de Componentes

```
┌─────────────────┐
│  Open-Meteo API │
└────────┬────────┘
         │
         │ HTTP/JSON
         │
┌────────▼─────────────────────────────────────────────┐
│              Collector (Python)                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Domain: WeatherReading, KafkaProducer        │   │
│  │ Application: FetchAndPublishUseCase          │   │
│  │ Infrastructure: OpenMeteoClient, KafkaProd   │   │
│  └──────────────────────────────────────────────┘   │
└────────┬─────────────────────────────────────────────┘
         │
         │ Kafka (ana.raw.readings)
         │
┌────────▼─────────────────────────────────────────────┐
│              Worker (Go)                             │
│  ┌──────────────────────────────────────────────┐   │
│  │ Domain: ProcessedReading, Repositories       │   │
│  │ Application: ProcessReadingUseCase           │   │
│  │ Infrastructure: KafkaConsumer, APIClient    │   │
│  └──────────────────────────────────────────────┘   │
└────────┬─────────────────────────────────────────────┘
         │
         │ HTTP/JSON (POST /api/v1/weather/logs)
         │
┌────────▼─────────────────────────────────────────────┐
│              API NestJS (TypeScript)                 │
│  ┌──────────────────────────────────────────────┐   │
│  │ Domain: WeatherLog, User, Insight            │   │
│  │ Application: Use Cases (CRUD, Insights)       │   │
│  │ Infrastructure: MongoDB, JWT, AI Rules       │   │
│  │ Presentation: Controllers, DTOs              │   │
│  └──────────────────────────────────────────────┘   │
└────────┬─────────────────────────────────────────────┘
         │
         │ REST API
         │
┌────────▼─────────────────────────────────────────────┐
│         Frontend React (TypeScript)                  │
│  ┌──────────────────────────────────────────────┐   │
│  │ Pages: Dashboard, Records, Users, Auth      │   │
│  │ Components: Charts, Tables, Forms           │   │
│  │ Contexts: AuthContext                       │   │
│  │ Hooks: usePolling                           │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## Pipeline de Dados

### Fluxo Completo

```
1. Coleta
   Open-Meteo API → Collector (Python)
   
2. Mensageria
   Collector → Kafka (ana.raw.readings)
   
3. Processamento
   Kafka → Worker (Go) → Cálculo de Métricas PV
   
4. Persistência
   Worker → API NestJS → MongoDB
   
5. Análise
   MongoDB → API NestJS (Insights) → Cache
   
6. Apresentação
   API NestJS → Frontend React → Dashboard
```

### Tópicos Kafka

| Tópico | Produtor | Consumidor | Descrição |
|--------|----------|------------|-----------|
| `ana.raw.readings` | Collector | Worker | Dados climáticos brutos |
| `ana.processed.readings` | Worker | - | Dados processados com métricas PV |

## Arquitetura por Serviço

### 1. Collector (Python)

**Responsabilidade:** Coleta periódica de dados climáticos

**Arquitetura:** Clean Architecture

```
colletor-python/
├── domain/
│   ├── entities/
│   │   └── weather_reading.py
│   └── repositories/
│       └── kafka_producer.py (interface)
├── application/
│   └── usecases/
│       └── fetch_and_publish.py
├── infra/
│   ├── http/
│   │   ├── openmeteo_client.py
│   │   └── healthcheck.py
│   └── messaging/
│       └── kafka_producer.py (implementação)
└── shared/
    ├── config.py
    └── logger.py
```

**Tecnologias:**
- Python 3.11+
- kafka-python
- requests
- Flask (healthcheck)

**Configuração:**
- Intervalo de coleta: 3600 segundos (1 hora)
- Tipo: hourly (168 leituras por coleta)
- Cidade: Coronel Fabriciano, MG

### 2. Worker (Go)

**Responsabilidade:** Processamento de mensagens e cálculo de métricas PV

**Arquitetura:** Clean Architecture

```
worker-go/
├── cmd/worker/
│   └── main.go
├── domain/
│   ├── entities/
│   │   └── processed_reading.go
│   └── repositories/
│       ├── kafka_consumer.go (interface)
│       ├── kafka_producer.go (interface)
│       └── api_client.go (interface)
├── application/
│   ├── usecases/
│   │   └── process_reading.go
│   └── services/
│       ├── pv_metrics_calculator.go
│       └── validator.go
├── infra/
│   ├── messaging/
│   │   ├── kafka_consumer.go
│   │   └── kafka_producer.go
│   └── http/
│       ├── api_client.go
│       └── healthcheck.go
└── internal/
    ├── config/
    └── logger/
```

**Tecnologias:**
- Go 1.21+
- Sarama (Kafka client)
- net/http

**Métricas Calculadas:**
- Estimated Irradiance (W/m²)
- Temperature Effect Factor
- Soiling Risk (low/medium/high)
- Wind Derating Flag
- PV Derating Total (%)

### 3. API NestJS (TypeScript)

**Responsabilidade:** Persistência, endpoints REST, autenticação, insights de IA

**Arquitetura:** Clean Architecture

```
api-nest/src/
├── domain/
│   ├── entities/
│   │   ├── weather-log.entity.ts
│   │   ├── user.entity.ts
│   │   └── insight.entity.ts
│   └── repositories/
│       ├── weather-log.repository.ts
│       ├── user.repository.ts
│       └── insight.repository.ts
├── application/
│   └── usecases/
│       ├── auth/
│       │   ├── login.use-case.ts
│       │   └── register.use-case.ts
│       ├── users/
│       │   ├── create-user.use-case.ts
│       │   ├── get-users.use-case.ts
│       │   ├── get-user.use-case.ts
│       │   ├── update-user.use-case.ts
│       │   └── delete-user.use-case.ts
│       ├── weather/
│       │   ├── create-weather-logs.use-case.ts
│       │   ├── get-weather-logs.use-case.ts
│       │   ├── get-latest-weather-log.use-case.ts
│       │   └── export-weather-logs.use-case.ts
│       └── insights/
│           ├── generate-insights.use-case.ts
│           └── get-insights.use-case.ts
├── infra/
│   ├── auth/
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── database/
│   │   └── repositories/
│   │       ├── weather-log.repository.impl.ts
│   │       ├── user.repository.impl.ts
│   │       └── insight.repository.impl.ts
│   └── ai/
│       ├── rules/
│       │   ├── soiling-risk.rule.ts
│       │   ├── consecutive-cloudy-days.rule.ts
│       │   ├── heat-derating.rule.ts
│       │   └── wind-derating.rule.ts
│       ├── analyzers/
│       │   ├── statistical-analyzer.ts
│       │   ├── trend-analyzer.ts
│       │   └── day-classifier.ts
│       ├── generators/
│       │   └── text-generator.ts
│       └── scorers/
│           ├── comfort-scorer.ts
│           └── pv-production-scorer.ts
├── presentation/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── weather-logs.controller.ts
│   │   └── insights.controller.ts
│   └── dto/
│       ├── login.dto.ts
│       ├── register.dto.ts
│       ├── create-user.dto.ts
│       ├── update-user.dto.ts
│       ├── create-weather-log.dto.ts
│       ├── get-weather-logs-query.dto.ts
│       ├── get-insights-query.dto.ts
│       └── generate-insights.dto.ts
└── modules/
    ├── auth/
    ├── users/
    ├── weather/
    └── insights/
```

**Tecnologias:**
- NestJS 10+
- TypeScript 5+
- MongoDB (Mongoose)
- JWT (Passport)
- ExcelJS (export XLSX)

**Módulos:**
- AuthModule: Autenticação JWT
- UsersModule: CRUD de usuários
- WeatherModule: Logs climáticos
- InsightsModule: Geração de insights de IA

### 4. Frontend React (TypeScript)

**Responsabilidade:** Interface web e visualização de dados

**Arquitetura:** Component-based

```
frontend-react/src/
├── app/
│   ├── api.ts
│   └── routes.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── Chart/
│   │   └── LineChart.tsx
│   ├── Insights/
│   │   └── InsightsSection.tsx
│   ├── Layout.tsx
│   └── PrivateRoute.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── usePolling.ts
├── pages/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Dashboard/
│   │   └── Dashboard.tsx
│   ├── Records/
│   │   └── RecordsTable.tsx
│   └── Users/
│       └── UsersCrud.tsx
└── utils/
    └── cn.ts
```

**Tecnologias:**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Chart.js
- React Hook Form + Zod

## Padrões Arquiteturais

### Clean Architecture

Todos os serviços seguem Clean Architecture com separação clara de responsabilidades:

1. **Domain Layer**
   - Entidades de negócio
   - Interfaces de repositórios
   - Regras de negócio puras

2. **Application Layer**
   - Use cases (casos de uso)
   - Lógica de negócio
   - Orquestração

3. **Infrastructure Layer**
   - Implementações concretas
   - Acesso a dados
   - Serviços externos

4. **Presentation Layer** (quando aplicável)
   - Controllers
   - DTOs
   - Validação de entrada

### Princípios Aplicados

- **Dependency Inversion:** Camadas internas não dependem de camadas externas
- **Single Responsibility:** Cada classe/componente tem uma única responsabilidade
- **Open/Closed:** Aberto para extensão, fechado para modificação
- **Interface Segregation:** Interfaces específicas e coesas

## Infraestrutura

### Serviços de Infraestrutura

| Serviço | Tecnologia | Porta | Descrição |
|---------|------------|-------|-----------|
| Zookeeper | Confluent | 2181 | Coordenação do Kafka |
| Kafka | Confluent | 9092, 9093 | Message broker |
| MongoDB | MongoDB 6 | 27017 | Banco de dados |
| RabbitMQ | RabbitMQ 3 | 5672, 15672 | Message broker (opcional) |

### Orquestração

- **Docker Compose:** Orquestração de todos os serviços
- **Networks:** Rede isolada `gdash-network`
- **Volumes:** Persistência de dados (MongoDB)

## Segurança

### Autenticação e Autorização

- **JWT (JSON Web Tokens):** Autenticação stateless
- **Passport.js:** Estratégia JWT no NestJS
- **Guards:** Proteção de rotas
- **Roles:** Controle de acesso baseado em papéis (admin/user)

### Endpoints Protegidos

- Todos os endpoints de dados requerem autenticação JWT
- Endpoint interno `POST /api/v1/weather/logs` é público (usado pelo Worker)
- Endpoints de usuários requerem role `admin`

## Processamento de Dados

### Fluxo de Processamento

1. **Coleta:** Collector busca dados da Open-Meteo API
2. **Normalização:** Dados são normalizados para contrato padrão
3. **Publicação:** Mensagens publicadas no Kafka
4. **Consumo:** Worker consome mensagens do Kafka
5. **Validação:** Dados são validados
6. **Cálculo:** Métricas PV são calculadas
7. **Persistência:** Dados são enviados para API NestJS
8. **Armazenamento:** Dados são persistidos no MongoDB
9. **Análise:** Insights são gerados sob demanda
10. **Apresentação:** Frontend consome dados via API REST

### Idempotência

- Worker utiliza UUID para garantir idempotência
- API NestJS valida duplicatas baseado em timestamp + cidade

## Insights de IA

### Arquitetura de Insights

O módulo de Insights segue Clean Architecture:

```
InsightsModule
├── Domain
│   ├── Insight (entidade)
│   └── IInsightRepository (interface)
├── Application
│   ├── GenerateInsightsUseCase
│   └── GetInsightsUseCase
├── Infrastructure
│   ├── Rules (regras heurísticas)
│   ├── Analyzers (análise estatística)
│   ├── Generators (geração de texto)
│   ├── Scorers (pontuações)
│   └── InsightRepositoryImpl
└── Presentation
    ├── InsightsController
    └── DTOs
```

### Tipos de Insights

1. **Métricas PV**
   - Soiling Risk (risco de sujeira)
   - Consecutive Cloudy Days (dias nublados)
   - Heat Derating (derating por calor)
   - Wind Derating (derating por vento)
   - Estimated Production (%)

2. **Estatísticas**
   - Médias (temperatura, umidade)
   - Tendências (rising/falling/stable)
   - Classificação do dia

3. **Alertas**
   - Chuva prevista
   - Calor extremo
   - Frio intenso
   - Vento forte

4. **Pontuações**
   - Comfort Score (0-100)
   - PV Production Score (0-100)

### Cache

- Cache em MongoDB com TTL de 1 hora
- Chave baseada em período (from, to) e tipos
- Invalidação automática via TTL

## Escalabilidade

### Pontos de Escala

1. **Collector:** Múltiplas instâncias podem coletar de diferentes localizações
2. **Worker:** Múltiplos workers podem processar mensagens em paralelo (consumer groups)
3. **API:** Stateless, pode ser escalada horizontalmente
4. **Frontend:** Pode ser servido via CDN

### Limitações Atuais

- Kafka com replication factor 1 (desenvolvimento)
- MongoDB sem replica set
- Sem load balancer

## Monitoramento e Observabilidade

### Healthchecks

Todos os serviços expõem endpoints de healthcheck:

- Collector: `GET /healthz`
- Worker: `GET /healthz`
- API: `GET /api/v1/weather/health`

### Logs

- Logs estruturados em JSON
- Níveis: DEBUG, INFO, WARNING, ERROR
- Contexto adicional para rastreabilidade

## Próximos Passos Arquiteturais

1. **Testes:** Implementar testes unitários e de integração
2. **Monitoramento:** Adicionar métricas (Prometheus/Grafana)
3. **Tracing:** Implementar distributed tracing
4. **CI/CD:** Pipeline de deploy automatizado
5. **Documentação API:** Swagger/OpenAPI
6. **Rate Limiting:** Proteção contra abuso
7. **Caching:** Redis para cache distribuído

---

**Última atualização:** 21/11/2025

