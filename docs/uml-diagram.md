# Diagramas UML - GDASH Challenge 2025/02

**Versão:** 1.0  
**Data:** 21/11/2025

---

## Diagrama de Classes - API NestJS

### Módulo Weather

```
┌─────────────────────────────────────┐
│      WeatherLogsController          │
├─────────────────────────────────────┤
│ + create()                          │
│ + findAll()                         │
│ + findLatest()                      │
│ + exportCsv()                       │
│ + exportXlsx()                      │
│ + health()                          │
└──────────────┬──────────────────────┘
               │
               │ uses
               ▼
┌─────────────────────────────────────┐
│   CreateWeatherLogsUseCase          │
├─────────────────────────────────────┤
│ - repository: IWeatherLogRepository │
│ + execute(dtos: CreateWeatherLogDto[])│
└──────────────┬──────────────────────┘
               │
               │ uses
               ▼
┌─────────────────────────────────────┐
│    IWeatherLogRepository            │
├─────────────────────────────────────┤
│ + create(log: WeatherLog)           │
│ + createMany(logs: WeatherLog[])    │
│ + findAll(query)                    │
│ + findLatest(city?)                 │
│ + findForExport(query)              │
└──────────────┬──────────────────────┘
               │
               │ implements
               ▼
┌─────────────────────────────────────┐
│   WeatherLogRepositoryImpl          │
├─────────────────────────────────────┤
│ - model: Model<WeatherLogDocument> │
│ + create()                          │
│ + createMany()                      │
│ + findAll()                         │
│ + findLatest()                      │
│ + findForExport()                   │
└──────────────┬──────────────────────┘
               │
               │ uses
               ▼
┌─────────────────────────────────────┐
│         WeatherLog                  │
├─────────────────────────────────────┤
│ + timestamp: Date                   │
│ + city: string                      │
│ + source: string                    │
│ + temperature_c: number             │
│ + relative_humidity: number         │
│ + precipitation_mm: number          │
│ + wind_speed_m_s: number            │
│ + clouds_percent: number            │
│ + weather_code: number              │
│ + estimated_irradiance_w_m2?: number│
│ + temp_effect_factor?: number       │
│ + soiling_risk?: string             │
│ + wind_derating_flag?: boolean      │
│ + pv_derating_pct?: number          │
└─────────────────────────────────────┘
```

### Módulo Insights

```
┌─────────────────────────────────────┐
│      InsightsController             │
├─────────────────────────────────────┤
│ + getInsights(query)                │
│ + generateInsights(body)            │
└──────────────┬──────────────────────┘
               │
               │ uses
               ▼
┌─────────────────────────────────────┐
│      GetInsightsUseCase             │
├─────────────────────────────────────┤
│ - repository: IInsightRepository    │
│ - generateUseCase: GenerateInsights │
│ + execute(input)                    │
└──────────────┬──────────────────────┘
               │
               │ uses
               ▼
┌─────────────────────────────────────┐
│   GenerateInsightsUseCase           │
├─────────────────────────────────────┤
│ - weatherRepo: IWeatherLogRepository│
│ - insightRepo: IInsightRepository   │
│ - soilingRiskRule: SoilingRiskRule  │
│ - cloudyDaysRule: ConsecutiveCloudy │
│ - heatDeratingRule: HeatDeratingRule│
│ - windDeratingRule: WindDeratingRule│
│ - statisticalAnalyzer: Statistical  │
│ - trendAnalyzer: TrendAnalyzer      │
│ - dayClassifier: DayClassifier      │
│ - textGenerator: TextGenerator      │
│ - comfortScorer: ComfortScorer      │
│ - pvScorer: PVProductionScorer      │
│ + execute(input)                    │
└──────────────┬──────────────────────┘
               │
               │ uses
               ▼
┌─────────────────────────────────────┐
│      SoilingRiskRule                │
├─────────────────────────────────────┤
│ - HIGH_RISK_THRESHOLD: number       │
│ - MEDIUM_RISK_THRESHOLD: number     │
│ + calculate(logs: WeatherLog[])     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   StatisticalAnalyzer               │
├─────────────────────────────────────┤
│ + analyze(logs: WeatherLog[])       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      TrendAnalyzer                  │
├─────────────────────────────────────┤
│ + analyze(logs, field)              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      Insight                        │
├─────────────────────────────────────┤
│ + period_from: Date                │
│ + period_to: Date                   │
│ + types: string[]                   │
│ + pv_metrics: object                │
│ + statistics: object                │
│ + alerts: Alert[]                   │
│ + summary: string                   │
│ + scores: object                    │
│ + generated_at: Date                │
│ + expires_at: Date                  │
└─────────────────────────────────────┘
```

### Módulo Auth

```
┌─────────────────────────────────────┐
│        AuthController               │
├─────────────────────────────────────┤
│ + login(dto: LoginDto)              │
│ + register(dto: RegisterDto)        │
└──────────────┬──────────────────────┘
               │
               │ uses
               ▼
┌─────────────────────────────────────┐
│        LoginUseCase                 │
├─────────────────────────────────────┤
│ - repository: IUserRepository        │
│ - jwtService: JwtService            │
│ + execute(dto: LoginDto)            │
└──────────────┬──────────────────────┘
               │
               │ uses
               ▼
┌─────────────────────────────────────┐
│        User                         │
├─────────────────────────────────────┤
│ + email: string                     │
│ + password: string (hashed)          │
│ + name: string                      │
│ + role: 'admin' | 'user'           │
└─────────────────────────────────────┘
```

## Diagrama de Sequência - Fluxo Completo

### Coleta e Processamento

```
Open-Meteo    Collector    Kafka    Worker    API NestJS    MongoDB
    │            │          │        │           │            │
    │            │          │        │           │            │
    │──HTTP──>   │          │        │           │            │
    │            │          │        │           │            │
    │<--JSON--   │          │        │           │            │
    │            │          │        │           │            │
    │            │──pub──>  │        │           │            │
    │            │          │        │           │            │
    │            │          │──msg──>│           │            │
    │            │          │        │           │            │
    │            │          │        │─validate─>│            │
    │            │          │        │           │            │
    │            │          │        │─calc PV──>│            │
    │            │          │        │           │            │
    │            │          │        │──POST──>  │            │
    │            │          │        │           │            │
    │            │          │        │           │──save──>   │
    │            │          │        │           │            │
    │            │          │        │<--201----│            │
    │            │          │        │           │            │
```

### Geração de Insights

```
Frontend    API NestJS    GetInsightsUseCase    InsightRepository    MongoDB
    │            │                │                      │              │
    │            │                │                      │              │
    │──GET──>    │                │                      │              │
    │            │                │                      │              │
    │            │──execute()──>   │                      │              │
    │            │                │                      │              │
    │            │                │──findOne()────────>  │              │
    │            │                │                      │              │
    │            │                │                      │──query──>   │
    │            │                │                      │              │
    │            │                │<--null--------------│              │
    │            │                │                      │              │
    │            │                │──generate()─────────┐              │
    │            │                │                      │              │
    │            │                │<--insights──────────┘              │
    │            │                │                      │              │
    │            │                │──create()────────>  │              │
    │            │                │                      │              │
    │            │                │                      │──save──>     │
    │            │                │                      │              │
    │            │<--insights─────│                      │              │
    │            │                │                      │              │
    │<--200------│                │                      │              │
    │            │                │                      │              │
```

## Diagrama de Componentes - Sistema Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend React                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Dashboard   │  │   Records    │  │    Users     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                               │
│                   ┌────────▼────────┐                      │
│                   │   API Client    │                      │
│                   └────────┬────────┘                      │
└────────────────────────────┼──────────────────────────────┘
                              │ HTTP/REST
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                    API NestJS                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Weather    │  │   Insights   │  │     Auth     │    │
│  │   Module     │  │    Module    │  │    Module    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                               │
│                   ┌────────▼────────┐                      │
│                   │   MongoDB       │                      │
│                   └────────────────┘                      │
└────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTP/POST
                              │
┌─────────────────────────────┼──────────────────────────────┐
│                    Worker Go                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Consumer   │  │   Processor  │  │  API Client  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────┬──────────────────────────────┘
                              │
                              │ Kafka
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                    Kafka                                    │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Topic: ana.raw.readings                           │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────┬──────────────────────────────┘
                              │
                              │ Kafka Producer
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                    Collector Python                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Open-Meteo   │  │  Normalizer │  │   Producer   │    │
│  │   Client     │  │             │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────┬──────────────────────────────┘
                              │
                              │ HTTP/GET
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                 Open-Meteo API                              │
└─────────────────────────────────────────────────────────────┘
```

## Diagrama de Estados - Processamento de Mensagem

```
[Raw Message]
    │
    ▼
[Validated]
    │
    ▼
[Calculating PV Metrics]
    │
    ▼
[Processed]
    │
    ├──> [Published to Kafka] ──> [Sent to API] ──> [Saved to MongoDB]
    │
    └──> [Error] ──> [Retry] ──> [Max Retries] ──> [Dead Letter]
```

## Diagrama de Pacotes - API NestJS

```
api-nest
│
├── domain
│   ├── entities
│   │   ├── WeatherLog
│   │   ├── User
│   │   └── Insight
│   └── repositories
│       ├── IWeatherLogRepository
│       ├── IUserRepository
│       └── IInsightRepository
│
├── application
│   └── usecases
│       ├── auth
│       ├── users
│       ├── weather
│       └── insights
│
├── infra
│   ├── auth
│   ├── database
│   └── ai
│       ├── rules
│       ├── analyzers
│       ├── generators
│       └── scorers
│
├── presentation
│   ├── controllers
│   └── dto
│
└── modules
    ├── auth
    ├── users
    ├── weather
    └── insights
```

## Diagrama de Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                           │
│                  (gdash-network)                           │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Zookeeper   │  │   Kafka     │  │  MongoDB    │        │
│  │  :2181      │  │  :9092-9093│  │  :27017     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Collector  │  │   Worker    │  │     API     │        │
│  │   :8080     │  │   :8081     │  │   :3000     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐                                          │
│  │  Frontend   │                                          │
│  │   :5173     │                                          │
│  └─────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Relacionamentos entre Entidades

### Modelo de Dados MongoDB

```
WeatherLog
├── timestamp (indexed)
├── city (indexed)
├── source
├── temperature_c
├── relative_humidity
├── precipitation_mm
├── wind_speed_m_s
├── clouds_percent
├── weather_code
├── estimated_irradiance_w_m2
├── temp_effect_factor
├── soiling_risk
├── wind_derating_flag
└── pv_derating_pct

User
├── email (unique, indexed)
├── password (hashed)
├── name
├── role
└── timestamps

Insight
├── period_from (indexed)
├── period_to (indexed)
├── types
├── pv_metrics
├── statistics
├── alerts
├── summary
├── scores
├── generated_at
└── expires_at (TTL index)
```

---

**Última atualização:** 21/11/2025

