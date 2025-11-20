# 📊 Diagramas Visuais da Arquitetura

Este arquivo contém diagramas em formato Mermaid que podem ser renderizados em GitHub, GitLab ou outras ferramentas que suportam Mermaid.

---

## 🔄 Pipeline Principal de Dados

```mermaid
graph TB
    A[Open-Meteo API] -->|HTTP GET| B[Python Collector]
    B -->|JSON Message| C[RabbitMQ Queue]
    C -->|Consume| D[Go Worker]
    D -->|HTTP POST| E[NestJS API]
    E -->|Save| F[MongoDB]
    F -->|Query| E
    E -->|JSON Response| G[React Frontend]
    G -->|Display| H[Dashboard]
    
    style A fill:#4A90E2,stroke:#2E5C8A,color:#fff
    style B fill:#3776AB,stroke:#2E5C8A,color:#fff
    style C fill:#FF6600,stroke:#CC5200,color:#fff
    style D fill:#00ADD8,stroke:#007A9E,color:#fff
    style E fill:#E0234E,stroke:#B01C3D,color:#fff
    style F fill:#47A248,stroke:#2E7D32,color:#fff
    style G fill:#61DAFB,stroke:#3B82F6,color:#000
    style H fill:#61DAFB,stroke:#3B82F6,color:#000
```

---

## 📥 Fluxo de Ingestão de Dados

```mermaid
sequenceDiagram
    participant Go as Go Worker
    participant API as NestJS API
    participant DTO as DTO Validation
    participant Service as WeatherService
    participant Model as Mongoose Model
    participant DB as MongoDB

    Go->>API: POST /api/weather/logs
    API->>DTO: Validate CreateWeatherLogDto
    DTO-->>API: Validated
    API->>Service: create(dto)
    Service->>Model: WeatherLog.create()
    Model->>DB: Insert Document
    DB-->>Model: Document Created
    Model-->>Service: WeatherLog Object
    Service-->>API: WeatherLog
    API-->>Go: 201 Created
```

---

## 📤 Fluxo de Consulta de Dados

```mermaid
sequenceDiagram
    participant Frontend as React Frontend
    participant API as NestJS API
    participant Guard as JWT Guard
    participant Service as WeatherService
    participant DB as MongoDB

    Frontend->>API: GET /api/weather/logs?limit=100
    API->>Guard: Validate JWT Token
    Guard-->>API: Authenticated
    API->>Service: findAll(filters)
    Service->>DB: Query with Filters
    DB-->>Service: Documents Array
    Service-->>API: Paginated Response
    API-->>Frontend: JSON { data, total, page }
```

---

## 🧠 Fluxo de Geração de Insights

```mermaid
graph LR
    A[GET /api/insights/weather] --> B[InsightsController]
    B --> C[InsightsService]
    C --> D[WeatherService.getAggregatedData]
    D --> E[MongoDB Aggregation]
    E --> D
    D --> C
    C --> F[Calculate Metrics]
    C --> G[Calculate Comfort Score]
    C --> H[Classify Weather]
    C --> I[Generate Summary]
    C --> J[Generate Alerts]
    F --> K[JSON Response]
    G --> K
    H --> K
    I --> K
    J --> K
    
    style A fill:#4A90E2,stroke:#2E5C8A,color:#fff
    style C fill:#E0234E,stroke:#B01C3D,color:#fff
    style K fill:#47A248,stroke:#2E7D32,color:#fff
```

---

## 🔐 Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Frontend as React
    participant API as NestJS API
    participant Auth as AuthService
    participant DB as MongoDB

    User->>Frontend: Login (email, password)
    Frontend->>API: POST /api/auth/login
    API->>Auth: validateUser()
    Auth->>DB: Find User
    DB-->>Auth: User Object
    Auth->>Auth: Generate JWT Token
    Auth-->>API: { access_token }
    API-->>Frontend: Token
    Frontend->>Frontend: Store in localStorage
    
    Note over Frontend,API: Próximas requisições
    Frontend->>API: GET /api/weather/logs<br/>Header: Authorization: Bearer <token>
    API->>API: JWT Guard Validates
    API-->>Frontend: Data
```

---

## 🖥️ Arquitetura de Componentes Frontend

```mermaid
graph TB
    A[App.tsx] --> B[Layout]
    B --> C[ProtectedRoute]
    C --> D[DashboardPage]
    C --> E[UsersPage]
    C --> F[ExplorePage]
    C --> G[LoginPage]
    
    D --> H[WeatherService]
    D --> I[InsightsService]
    E --> J[UsersService]
    F --> K[PokemonService]
    
    H --> L[API Client]
    I --> L
    J --> L
    K --> L
    
    L --> M[NestJS API]
    
    style A fill:#61DAFB,stroke:#3B82F6,color:#000
    style D fill:#61DAFB,stroke:#3B82F6,color:#000
    style M fill:#E0234E,stroke:#B01C3D,color:#fff
```

---

## 🐳 Infraestrutura Docker Compose

```mermaid
graph TB
    subgraph "Docker Compose - gdash-network"
        A[MongoDB<br/>:27017]
        B[RabbitMQ<br/>:5672, :15672]
        C[NestJS API<br/>:3000]
        D[React Frontend<br/>:5173]
        E[Python Collector]
        F[Go Worker]
    end
    
    E -->|Publish| B
    B -->|Consume| F
    F -->|HTTP POST| C
    C -->|Save| A
    C -->|Query| A
    D -->|HTTP GET| C
    
    style A fill:#47A248,stroke:#2E7D32,color:#fff
    style B fill:#FF6600,stroke:#CC5200,color:#fff
    style C fill:#E0234E,stroke:#B01C3D,color:#fff
    style D fill:#61DAFB,stroke:#3B82F6,color:#000
    style E fill:#3776AB,stroke:#2E5C8A,color:#fff
    style F fill:#00ADD8,stroke:#007A9E,color:#fff
```

---

## 📊 Módulos NestJS

```mermaid
graph TB
    A[AppModule] --> B[AuthModule]
    A --> C[WeatherModule]
    A --> D[UsersModule]
    A --> E[InsightsModule]
    A --> F[ExternalApiModule]
    A --> G[MongooseModule]
    
    B --> B1[AuthController]
    B --> B2[AuthService]
    B --> B3[JwtStrategy]
    B --> B4[JwtAuthGuard]
    
    C --> C1[WeatherController]
    C --> C2[WeatherService]
    C --> C3[WeatherLogSchema]
    C --> C4[ExportService]
    
    D --> D1[UsersController]
    D --> D2[UsersService]
    D --> D3[UserSchema]
    
    E --> E1[InsightsController]
    E --> E2[InsightsService]
    
    F --> F1[ExternalApiController]
    F --> F2[ExternalApiService]
    
    style A fill:#E0234E,stroke:#B01C3D,color:#fff
    style G fill:#47A248,stroke:#2E7D32,color:#fff
```

---

## 🔄 Fluxo Completo End-to-End

```mermaid
graph LR
    subgraph "Coleta"
        A1[Open-Meteo] --> A2[Python]
        A2 --> A3[RabbitMQ]
    end
    
    subgraph "Processamento"
        A3 --> B1[Go Worker]
        B1 --> B2[NestJS API]
        B2 --> B3[MongoDB]
    end
    
    subgraph "Visualização"
        B3 --> C1[NestJS API]
        C1 --> C2[React Frontend]
        C2 --> C3[Dashboard]
    end
    
    style A1 fill:#4A90E2,stroke:#2E5C8A,color:#fff
    style A2 fill:#3776AB,stroke:#2E5C8A,color:#fff
    style A3 fill:#FF6600,stroke:#CC5200,color:#fff
    style B1 fill:#00ADD8,stroke:#007A9E,color:#fff
    style B2 fill:#E0234E,stroke:#B01C3D,color:#fff
    style B3 fill:#47A248,stroke:#2E7D32,color:#fff
    style C1 fill:#E0234E,stroke:#B01C3D,color:#fff
    style C2 fill:#61DAFB,stroke:#3B82F6,color:#000
    style C3 fill:#61DAFB,stroke:#3B82F6,color:#000
```

---

## 📝 Como Visualizar os Diagramas

### No GitHub/GitLab
Os diagramas Mermaid são renderizados automaticamente quando você visualiza o arquivo `.md` no GitHub ou GitLab.

### Localmente
1. Use extensões do VS Code como "Markdown Preview Mermaid Support"
2. Use ferramentas online como [Mermaid Live Editor](https://mermaid.live/)
3. Use ferramentas como [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli) para gerar imagens

### Gerar Imagens
```bash
# Instalar Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Gerar imagem PNG
mmdc -i DIAGRAMAS.md -o diagramas.png

# Gerar imagem SVG
mmdc -i DIAGRAMAS.md -o diagramas.svg
```

---

**Nota:** Estes diagramas complementam os fluxogramas em texto do arquivo `FLUXOGRAMA_ARQUITETURA.md` e podem ser usados no vídeo explicativo ou na documentação.

