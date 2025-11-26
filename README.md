# GDASH - Sistema de Monitoramento Climático e Análise de Energia Solar

## 📋 Índice

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Modelagem UML](#4-modelagem-uml)
5. [MER / Modelo de Dados](#5-mer--modelo-de-dados)
6. [Pipeline CI/CD](#6-pipeline-cicd)
7. [Guia de Execução do Projeto](#7-guia-de-execução-do-projeto)
8. [Documentação da API](#8-documentação-da-api)
9. [Guia de Desenvolvimento](#9-guia-de-desenvolvimento)

---

## 1. Visão Geral do Projeto

### 1.1 Descrição

O **GDASH** (Dashboard Coronel Fabriciano) é uma solução completa de monitoramento climático em tempo real e análise de eficiência de energia solar fotovoltaica. O sistema integra múltiplas tecnologias em uma arquitetura de microsserviços moderna, orientada a eventos e totalmente containerizada.

### 📹 Vídeo Explicativo

Assista ao vídeo de apresentação do projeto explicando a arquitetura, pipeline de dados, insights de IA e principais decisões técnicas:

🎥 **[Vídeo de Apresentação - YouTube](https://youtu.be/oUIVsIPLNvI)**

### 🚀 Guia de Execução Rápida

#### Requisitos
- **Docker**: 20.10+ ou Docker Desktop
- **Docker Compose**: v2.0+
- **Git**: Para clonar o repositório
- **8GB RAM**: Mínimo recomendado

#### Como Rodar com Docker

**Passo 1: Clonar o Repositório**
```bash
git clone <repository-url>
cd desafio-gdash-2025-02
```

**Passo 2: Configurar Variáveis de Ambiente**
```bash
cp env.example .env
# Editar .env se necessário
```

**Passo 3: Executar Script de Inicialização (Linux/Mac)**
```bash
chmod +x start.sh
./start.sh
```

**Passo 4: Executar Manualmente (Windows)**
```powershell
# Iniciar infraestrutura
docker compose up -d zookeeper kafka mongodb rabbitmq

# Aguardar 15 segundos
Start-Sleep -Seconds 15

# Iniciar aplicações
docker compose up -d api frontend worker collector

# Aguardar 20 segundos
Start-Sleep -Seconds 20

# Executar seed
docker compose exec api node dist/database/seed/users.seed.js
```

#### Acessando o Sistema

Após a inicialização, os serviços estarão disponíveis em:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:5173 | Dashboard principal |
| **API** | http://localhost:3000/api/v1 | Backend REST API |
| **API Health** | http://localhost:3000/api/v1/weather/health | Healthcheck da API |
| **Collector Health** | http://localhost:8080/healthz | Status do collector |
| **Worker Health** | http://localhost:8081/healthz | Status do worker |
| **RabbitMQ UI** | http://localhost:15672 | Interface RabbitMQ (guest/guest) |

#### Credenciais Padrão

```
Email: admin@example.com
Senha: 123456
```

#### Parando o Sistema

```bash
# Parar todos os serviços
docker compose down

# Parar e remover volumes (reset completo)
docker compose down -v
```

> 💡 **Para instruções detalhadas de execução, variáveis de ambiente e estrutura de diretórios, consulte a [seção 7 - Guia de Execução do Projeto](#7-guia-de-execução-do-projeto)**

### 1.2 Objetivo e Domínio do Negócio

**Objetivo Principal:**
Fornecer monitoramento contínuo de condições climáticas e análise inteligente de dados meteorológicos para otimização de sistemas de geração de energia solar fotovoltaica.

**Domínio:**
- **Energia Renovável**: Foco em energia solar fotovoltaica
- **Monitoramento Climático**: Coleta e análise de dados meteorológicos em tempo real
- **Análise Preditiva**: Geração de insights baseados em IA para previsão de eficiência energética
- **Localização**: Coronel Fabriciano, MG, Brasil (Latitude: -19.5186, Longitude: -42.6289)

### 1.3 Funcionalidades Principais

#### Monitoramento Climático
- Coleta automatizada de dados meteorológicos a cada 1 hora
- Visualização em tempo real de temperatura, umidade, vento, precipitação e cobertura de nuvens
- Gráficos históricos e análise de tendências
- Cálculo de acumulado de chuva (24h)
- Previsão de 7 dias com detalhamento horário

#### Análise de Energia Solar (PV)
- Estimativa de irradiância solar (W/m²)
- Cálculo de métricas PV:
  - Fator de efeito de temperatura
  - Risco de sujeira (soiling risk)
  - Derating por vento extremo
  - Percentual de derating total
- Alertas de eficiência e impacto na produção

#### Inteligência Artificial e Insights
- Sistema Especialista baseado em regras heurísticas
- Geração automática de insights contextuais
- Análise estatística de tendências
- Pontuações de conforto climático e eficiência de produção (0-100)
- Alertas inteligentes e resumos textuais legíveis

#### Gestão de Usuários
- Autenticação segura via JWT (JSON Web Tokens)
- CRUD completo de usuários
- Controle de acesso baseado em roles (admin/user)
- Usuário padrão criado automaticamente no seed

#### Exportação e Visualização
- Exportação de dados históricos em CSV e XLSX
- Dashboard interativo com gráficos em tempo real
- Background animado na tela de login
- Integração com API da NASA para visualização de imagens de satélite

### 1.4 Princípios de Arquitetura Adotados

#### Clean Architecture
Todos os serviços seguem os princípios de **Clean Architecture**, garantindo:
- **Separação de responsabilidades**: Domain, Application, Infrastructure e Presentation
- **Independência de frameworks**: Lógica de negócio desacoplada de tecnologias específicas
- **Testabilidade**: Facilita testes unitários e de integração
- **Manutenibilidade**: Código organizado e fácil de evoluir

#### Arquitetura de Microsserviços
- **Desacoplamento**: Serviços independentes e comunicando via APIs REST e message broker
- **Escalabilidade horizontal**: Cada serviço pode ser escalado independentemente
- **Resiliência**: Tolerância a falhas com retry e circuit breakers
- **Orientação a eventos**: Comunicação assíncrona via Apache Kafka

#### Event-Driven Architecture
- **Producer-Consumer**: Collector produz eventos, Worker consome e processa
- **Message Broker**: Apache Kafka para garantia de entrega e ordenação
- **Idempotência**: Processamento seguro com identificadores únicos

---

## 2. Stack Tecnológica

### 2.1 Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 19.2.0 | Framework de interface de usuário |
| **TypeScript** | 5.9.3 | Tipagem estática e segurança de tipos |
| **Vite** | 7.2.4 | Build tool rápido e moderno |
| **Tailwind CSS** | 3.4.18 | Framework CSS utility-first |
| **ShadCN/UI** | Custom | Biblioteca de componentes reutilizáveis |
| **Chart.js** | 4.5.1 | Visualização de gráficos e dados |
| **React Router** | 7.9.6 | Roteamento e navegação |
| **Axios** | 1.13.2 | Cliente HTTP para comunicação com API |
| **React Hook Form** | 7.66.1 | Gerenciamento de formulários |
| **Zod** | 4.1.12 | Validação de schemas |
| **Vitest** | 4.0.12 | Framework de testes |

**Justificativa Técnica:**
- **React 19**: Última versão estável com melhorias de performance e hooks otimizados
- **Vite**: Build extremamente rápido comparado ao Webpack, melhor DX
- **Tailwind CSS**: Produtividade alta, consistência visual, bundle otimizado
- **TypeScript**: Reduz bugs em runtime, melhora manutenibilidade

### 2.2 Backend (API)

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **NestJS** | 10.3.0 | Framework Node.js baseado em decorators |
| **Node.js** | 20.x | Runtime JavaScript |
| **TypeScript** | 5.3.3 | Tipagem estática |
| **Mongoose** | 8.0.3 | ODM para MongoDB |
| **Passport** | 0.7.0 | Middleware de autenticação |
| **JWT** | 4.0.1 | Tokens de autenticação |
| **bcryptjs** | 2.4.3 | Hash de senhas |
| **ExcelJS** | 4.4.0 | Geração de arquivos XLSX |
| **Axios** | 1.13.2 | Cliente HTTP para APIs externas |
| **class-validator** | 0.14.0 | Validação de DTOs |
| **class-transformer** | 0.5.1 | Transformação de objetos |

**Justificativa Técnica:**
- **NestJS**: Arquitetura modular, suporte nativo a TypeScript, decorators para clean code
- **Mongoose**: Schema validation, middleware, queries otimizadas
- **JWT**: Stateless authentication, escalável, padrão da indústria

### 2.3 Banco de Dados

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **MongoDB** | 5.x | Banco de dados NoSQL orientado a documentos |
| **Mongoose** | 8.0.3 | ODM (Object Document Mapper) |

**Justificativa Técnica:**
- **MongoDB**: Flexibilidade de schema para dados meteorológicos variáveis, excelente performance para séries temporais, suporte a índices compostos, integração nativa com Node.js

### 2.4 Workers e Processamento

#### Worker Go
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Go** | 1.21 | Linguagem de programação |
| **Sarama** | 1.42.1 | Cliente Kafka para Go |
| **UUID** | 1.5.0 | Geração de identificadores únicos |

**Justificativa Técnica:**
- **Go**: Alta performance, concorrência nativa (goroutines), baixo consumo de memória, ideal para workers de alta throughput

#### Collector Python
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Python** | 3.11 | Linguagem de programação |
| **requests** | 2.31.0 | Cliente HTTP |
| **kafka-python** | 2.0.2 | Cliente Kafka para Python |
| **pytz** | 2024.1 | Manipulação de timezones |
| **pytest** | 7.4.3 | Framework de testes |

**Justificativa Técnica:**
- **Python**: Ecossistema rico para processamento de dados, fácil integração com APIs, produtividade alta para scripts de coleta

### 2.5 Infraestrutura e DevOps

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Docker** | Latest | Containerização |
| **Docker Compose** | 2.0+ | Orquestração de containers |
| **Apache Kafka** | 7.5.0 | Message broker para eventos |
| **Zookeeper** | 7.5.0 | Coordenação do Kafka |
| **RabbitMQ** | 3-management | Message queue alternativa |
| **Nginx** | Latest | Servidor web para frontend |
| **MongoDB** | 5.x | Banco de dados |

**Justificativa Técnica:**
- **Kafka**: Alta throughput, retenção de mensagens, particionamento para escalabilidade, ideal para streams de dados
- **Docker Compose**: Orquestração simples, ambiente de desenvolvimento consistente, fácil deploy

### 2.6 APIs Externas

| API | Tipo | Propósito |
|-----|------|-----------|
| **Open-Meteo** | Gratuita | Dados meteorológicos em tempo real e previsão |
| **NASA Worldview** | Gratuita | Imagens de satélite para visualização |

---

## 3. Arquitetura do Sistema

### 3.1 Diagrama Geral da Arquitetura (C4 - Nível 1)

```mermaid
graph TB
    subgraph "Sistema GDASH"
        subgraph "Usuários"
            USER[Usuário Final]
        end
        
        subgraph "Aplicações"
            FE[Frontend React]
            API[API NestJS]
        end
        
        subgraph "Processamento"
            COL[Collector Python]
            WORK[Worker Go]
        end
        
        subgraph "Infraestrutura"
            KAFKA[Apache Kafka]
            MONGO[(MongoDB)]
        end
        
        subgraph "APIs Externas"
            OM[Open-Meteo API]
            NASA[NASA API]
        end
    end
    
    USER -->|HTTP| FE
    FE -->|REST API| API
    COL -->|HTTP| OM
    COL -->|Publish| KAFKA
    KAFKA -->|Consume| WORK
    WORK -->|HTTP POST| API
    API -->|Query| MONGO
    API -->|HTTP| NASA
```

### 3.2 Diagrama de Containers (C4 - Nível 2)

```mermaid
graph TB
    subgraph "Browser"
        UI[Interface Web React]
    end
    
    subgraph "Frontend Container"
        FE[Frontend React<br/>Nginx]
    end
    
    subgraph "API Container"
        API[NestJS API<br/>Node.js 20]
        AUTH[JWT Auth]
        AI[AI Insights Service]
    end
    
    subgraph "Collector Container"
        COL[Python Collector<br/>Python 3.11]
        OM_CLIENT[Open-Meteo Client]
    end
    
    subgraph "Worker Container"
        WORK[Go Worker<br/>Go 1.21]
        VALIDATOR[Data Validator]
        PV_CALC[PV Metrics Calculator]
    end
    
    subgraph "Message Broker"
        KAFKA[Apache Kafka<br/>7.5.0]
        ZOOK[Zookeeper<br/>7.5.0]
    end
    
    subgraph "Database"
        MONGO[(MongoDB<br/>v5)]
    end
    
    subgraph "External Services"
        OM_API[Open-Meteo API]
        NASA_API[NASA Worldview API]
    end
    
    UI -->|HTTP/HTTPS| FE
    FE -->|REST API| API
    API -->|JWT| AUTH
    API -->|Query| MONGO
    API -->|Generate| AI
    API -->|HTTP| NASA_API
    
    COL -->|HTTP| OM_API
    COL -->|Publish JSON| KAFKA
    
    KAFKA -->|Consume| WORK
    WORK -->|Validate| VALIDATOR
    WORK -->|Calculate| PV_CALC
    WORK -->|HTTP POST| API
    
    KAFKA -.->|Coordination| ZOOK
```

### 3.3 Diagrama de Sequência - Pipeline Completo

```mermaid
sequenceDiagram
    participant OM as Open-Meteo API
    participant COL as Collector Python
    participant KAFKA as Kafka Broker
    participant WORK as Worker Go
    participant API as API NestJS
    participant MONGO as MongoDB
    participant FE as Frontend React
    participant USER as Usuário

    Note over COL: Agendado a cada 1 hora
    
    COL->>OM: GET /forecast?latitude=-19.5186&longitude=-42.6289
    OM-->>COL: JSON Response (hourly/daily data)
    
    COL->>COL: Normalizar dados
    COL->>KAFKA: Publish to "ana.raw.readings"
    KAFKA-->>COL: ACK
    
    KAFKA->>WORK: Consume message
    WORK->>WORK: Validar dados
    WORK->>WORK: Calcular métricas PV
    WORK->>WORK: Transformar para formato API
    
    WORK->>API: POST /api/v1/weather/logs
    API->>API: Validar DTO
    API->>MONGO: Insert weather logs
    MONGO-->>API: Confirmation
    API-->>WORK: 201 Created
    
    Note over FE: Polling a cada 30 segundos
    
    USER->>FE: Acessa Dashboard
    FE->>API: GET /api/v1/weather/logs/latest<br/>(Bearer Token)
    API->>MONGO: Query latest log
    MONGO-->>API: Weather data
    API-->>FE: JSON Response
    FE-->>USER: Renderiza gráficos
    
    USER->>FE: Solicita Insights
    FE->>API: GET /api/v1/weather/insights?from=...&to=...<br/>(Bearer Token)
    API->>API: Verificar cache
    alt Cache Hit
        API-->>FE: Insights do cache
    else Cache Miss
        API->>MONGO: Query historical data
        MONGO-->>API: Historical logs
        API->>API: Gerar insights (IA)
        API->>MONGO: Cache insights (TTL: 1h)
        API-->>FE: Insights JSON
    end
```

### 3.4 Diagrama de Comunicação entre Módulos

```mermaid
graph LR
    subgraph "API NestJS - Módulos"
        WEATHER[Weather Module]
        AUTH_MOD[Auth Module]
        USERS_MOD[Users Module]
        INSIGHTS_MOD[Insights Module]
        NASA_MOD[NASA Module]
    end
    
    subgraph "API NestJS - Camadas"
        CONTROLLERS[Controllers]
        USECASES[Use Cases]
        REPOS[Repositories]
        ENTITIES[Entities]
    end
    
    subgraph "Infrastructure"
        MONGO[(MongoDB)]
        JWT_SVC[JWT Service]
        AI_SVC[AI Service]
    end
    
    CONTROLLERS -->|Calls| USECASES
    USECASES -->|Uses| REPOS
    REPOS -->|Implements| ENTITIES
    REPOS -->|Queries| MONGO
    
    WEATHER --> CONTROLLERS
    AUTH_MOD --> JWT_SVC
    INSIGHTS_MOD --> AI_SVC
    AI_SVC --> REPOS
    AI_SVC --> MONGO
```

### 3.5 Diagrama de Implantação (Deployment)

```mermaid
graph TB
    subgraph "Docker Network: gdash-network"
        subgraph "Frontend Service"
            FE_CONTAINER[Frontend Container<br/>Port: 5173]
        end
        
        subgraph "API Service"
            API_CONTAINER[API Container<br/>Port: 3000]
        end
        
        subgraph "Collector Service"
            COL_CONTAINER[Collector Container<br/>Health: 8080]
        end
        
        subgraph "Worker Service"
            WORK_CONTAINER[Worker Container<br/>Health: 8081]
        end
        
        subgraph "Kafka Service"
            KAFKA_CONTAINER[Kafka Container<br/>Port: 9092, 9093]
            ZOOK_CONTAINER[Zookeeper Container<br/>Port: 2181]
        end
        
        subgraph "Database Service"
            MONGO_CONTAINER[MongoDB Container<br/>Port: 27017]
            MONGO_VOLUME[(MongoDB Volume)]
        end
        
        subgraph "RabbitMQ Service"
            RABBIT_CONTAINER[RabbitMQ Container<br/>Port: 5672, 15672]
        end
    end
    
    subgraph "External"
        INTERNET[Internet]
        OM_API[Open-Meteo API]
        NASA_API[NASA API]
    end
    
    INTERNET -->|HTTP| FE_CONTAINER
    FE_CONTAINER -->|REST| API_CONTAINER
    API_CONTAINER -->|Query| MONGO_CONTAINER
    MONGO_CONTAINER -->|Persist| MONGO_VOLUME
    
    COL_CONTAINER -->|HTTP| OM_API
    COL_CONTAINER -->|Publish| KAFKA_CONTAINER
    KAFKA_CONTAINER -->|Consume| WORK_CONTAINER
    WORK_CONTAINER -->|HTTP POST| API_CONTAINER
    
    API_CONTAINER -->|HTTP| NASA_API
    
    KAFKA_CONTAINER -.->|Coordination| ZOOK_CONTAINER
```

---

## 4. Modelagem UML

### 4.1 Diagrama de Classes

```mermaid
classDiagram
    class WeatherLog {
        +Date timestamp
        +String city
        +String source
        +Number temperature_c
        +Number relative_humidity
        +Number precipitation_mm
        +Number wind_speed_m_s
        +Number clouds_percent
        +Number weather_code
        +Number estimated_irradiance_w_m2
        +Number temp_effect_factor
        +String soiling_risk
        +Boolean wind_derating_flag
        +Number pv_derating_pct
        +Date createdAt
        +Date updatedAt
    }
    
    class User {
        +String email
        +String password
        +String name
        +String role
        +Date createdAt
        +Date updatedAt
    }
    
    class Insight {
        +Date period_from
        +Date period_to
        +Array types
        +Object pv_metrics
        +Object statistics
        +Array alerts
        +String summary
        +Object scores
        +Date generated_at
        +Date expires_at
    }
    
    class CreateWeatherLogsUseCase {
        -IWeatherLogRepository repository
        +execute(logs: CreateWeatherLogDto[]): Promise
    }
    
    class GetWeatherLogsUseCase {
        -IWeatherLogRepository repository
        +execute(query: GetWeatherLogsQueryDto): Promise
    }
    
    class GenerateInsightsUseCase {
        -IWeatherLogRepository weatherRepo
        -IInsightRepository insightRepo
        -InsightsService aiService
        +execute(from: Date, to: Date): Promise
    }
    
    class WeatherLogsController {
        -CreateWeatherLogsUseCase createUseCase
        -GetWeatherLogsUseCase getUseCase
        +create(createDtos: CreateWeatherLogDto[]): Promise
        +findAll(query: GetWeatherLogsQueryDto): Promise
        +findLatest(city?: string): Promise
    }
    
    class IWeatherLogRepository {
        <<interface>>
        +createMany(logs: Partial~WeatherLog~[]): Promise
        +findAll(query: QueryDto): Promise
        +findLatest(city?: string): Promise
    }
    
    class WeatherLogRepositoryImpl {
        -Model model
        +createMany(logs): Promise
        +findAll(query): Promise
        +findLatest(city): Promise
    }
    
    class InsightsService {
        -SoilingRiskRule soilingRule
        -ConsecutiveCloudyDaysRule cloudyRule
        -HeatDeratingRule heatRule
        -WindDeratingRule windRule
        -StatisticalAnalyzer statAnalyzer
        -TrendAnalyzer trendAnalyzer
        -TextGenerator textGenerator
        +generateInsights(logs: WeatherLog[]): Promise
    }
    
    WeatherLogsController --> CreateWeatherLogsUseCase
    WeatherLogsController --> GetWeatherLogsUseCase
    CreateWeatherLogsUseCase --> IWeatherLogRepository
    GetWeatherLogsUseCase --> IWeatherLogRepository
    IWeatherLogRepository <|.. WeatherLogRepositoryImpl
    WeatherLogRepositoryImpl --> WeatherLog
    GenerateInsightsUseCase --> IWeatherLogRepository
    GenerateInsightsUseCase --> InsightsService
    InsightsService --> WeatherLog
```

### 4.2 Diagrama de Casos de Uso

```mermaid
graph TB
    USER[Usuário]
    ADMIN[Administrador]
    SYSTEM[Sistema]
    WORKER[Worker Go]
    COLLECTOR[Collector Python]
    
    USER -->|Autenticar| UC1[UC1: Login]
    USER -->|Visualizar Dashboard| UC2[UC2: Visualizar Dados Climáticos]
    USER -->|Solicitar Insights| UC3[UC3: Gerar Insights de IA]
    USER -->|Exportar Dados| UC4[UC4: Exportar CSV/XLSX]
    USER -->|Visualizar NASA| UC5[UC5: Visualizar Imagens Satélite]
    
    ADMIN -->|Gerenciar Usuários| UC6[UC6: CRUD de Usuários]
    
    COLLECTOR -->|Coletar Dados| UC7[UC7: Coletar Dados Meteorológicos]
    COLLECTOR -->|Publicar no Kafka| UC8[UC8: Publicar no Message Broker]
    
    WORKER -->|Consumir Mensagens| UC9[UC9: Processar Mensagens Kafka]
    WORKER -->|Calcular Métricas| UC10[UC10: Calcular Métricas PV]
    WORKER -->|Enviar para API| UC11[UC11: Enviar Dados Processados]
    
    SYSTEM -->|Armazenar Dados| UC12[UC12: Persistir no MongoDB]
    SYSTEM -->|Gerar Cache| UC13[UC13: Cachear Insights]
```

### 4.3 Diagrama de Atividades - Fluxo Principal

```mermaid
flowchart TD
    START([Início])
    COLLECT[Collector: Coletar dados Open-Meteo]
    NORMALIZE[Collector: Normalizar dados]
    PUBLISH[Collector: Publicar no Kafka]
    CONSUME[Worker: Consumir mensagem]
    VALIDATE[Worker: Validar dados]
    CALC_PV[Worker: Calcular métricas PV]
    SEND_API[Worker: Enviar para API]
    SAVE_DB[API: Salvar no MongoDB]
    USER_REQ[Usuário: Acessa Dashboard]
    FETCH_DATA[Frontend: Buscar dados da API]
    DISPLAY[Frontend: Exibir gráficos]
    REQ_INSIGHTS[Usuário: Solicita Insights]
    CHECK_CACHE[API: Verificar cache]
    GEN_INSIGHTS[API: Gerar insights IA]
    CACHE_INSIGHTS[API: Cachear insights]
    RETURN[Retornar dados]
    END([Fim])
    
    START --> COLLECT
    COLLECT --> NORMALIZE
    NORMALIZE --> PUBLISH
    PUBLISH --> CONSUME
    CONSUME --> VALIDATE
    VALIDATE --> CALC_PV
    CALC_PV --> SEND_API
    SEND_API --> SAVE_DB
    SAVE_DB --> USER_REQ
    USER_REQ --> FETCH_DATA
    FETCH_DATA --> DISPLAY
    DISPLAY --> REQ_INSIGHTS
    REQ_INSIGHTS --> CHECK_CACHE
    
    CHECK_CACHE -->|Cache Hit| RETURN
    CHECK_CACHE -->|Cache Miss| GEN_INSIGHTS
    GEN_INSIGHTS --> CACHE_INSIGHTS
    CACHE_INSIGHTS --> RETURN
    RETURN --> END
```

---

## 5. MER / Modelo de Dados

### 5.1 Diagrama ERD Completo

```mermaid
erDiagram
    WEATHER_LOGS {
        ObjectId _id PK
        Date timestamp
        String city
        String source
        Number temperature_c
        Number relative_humidity
        Number precipitation_mm
        Number wind_speed_m_s
        Number clouds_percent
        Number weather_code
        Number estimated_irradiance_w_m2
        Number temp_effect_factor
        String soiling_risk
        Boolean wind_derating_flag
        Number pv_derating_pct
        Number uv_index
        Number pressure_hpa
        Number visibility_m
        Number wind_direction_10m
        Number wind_gusts_10m
        Number precipitation_probability
        Date createdAt
        Date updatedAt
    }
    
    USERS {
        ObjectId _id PK
        String email UK
        String password
        String name
        String role
        Date createdAt
        Date updatedAt
    }
    
    INSIGHTS_CACHE {
        ObjectId _id PK
        Date period_from
        Date period_to
        Array types
        Object pv_metrics
        Object statistics
        Array alerts
        String summary
        Object scores
        Date generated_at
        Date expires_at
    }
    
    WEATHER_LOGS ||--o{ INSIGHTS_CACHE : "generates"
```

### 5.2 Descrição das Tabelas/Coleções

#### Collection: `weather_logs`
Armazena os logs climáticos processados pelo Worker Go.

**Índices:**
- `{ timestamp: -1, city: 1 }` - Índice composto para consultas por data e cidade
- `{ createdAt: -1 }` - Índice para ordenação por data de criação

**Campos Principais:**
- `timestamp`: Data/hora da leitura
- `city`: Cidade monitorada
- `source`: Fonte dos dados (ex: "openmeteo")
- `temperature_c`: Temperatura em Celsius
- `relative_humidity`: Umidade relativa (%)
- `precipitation_mm`: Precipitação em mm
- `wind_speed_m_s`: Velocidade do vento em m/s
- `clouds_percent`: Cobertura de nuvens (%)
- `weather_code`: Código do clima (WMO)
- `estimated_irradiance_w_m2`: Irradiância solar estimada (W/m²)
- `temp_effect_factor`: Fator de efeito de temperatura
- `soiling_risk`: Risco de sujeira (low/medium/high)
- `wind_derating_flag`: Flag de derating por vento
- `pv_derating_pct`: Percentual total de derating

#### Collection: `users`
Armazena os usuários do sistema.

**Índices:**
- `{ email: 1 }` - Índice único para email

**Campos Principais:**
- `email`: Email único do usuário
- `password`: Hash bcrypt da senha
- `name`: Nome do usuário
- `role`: Role do usuário (admin/user)

#### Collection: `insights_cache`
Cache de insights gerados pela IA com TTL de 1 hora.

**Índices:**
- `{ period_from: 1, period_to: 1, types: 1 }` - Índice composto para busca por período
- `{ expires_at: 1 }` - Índice TTL para expiração automática

**Campos Principais:**
- `period_from`: Data inicial do período analisado
- `period_to`: Data final do período analisado
- `types`: Tipos de insights gerados
- `pv_metrics`: Métricas de energia solar
- `statistics`: Estatísticas climáticas
- `alerts`: Array de alertas
- `summary`: Resumo textual
- `scores`: Pontuações (comfort_score, pv_production_score)
- `expires_at`: Data de expiração (TTL)

---

## 6. Pipeline CI/CD

### 6.1 Diagrama de Pipeline CI/CD Sugerido

```mermaid
graph LR
    subgraph "GitHub Repository"
        CODE[Código Fonte]
    end
    
    subgraph "CI Pipeline - GitHub Actions"
        TRIGGER[Push/PR]
        LINT[Lint & Format Check]
        TEST_UNIT[Testes Unitários]
        TEST_INTEG[Testes de Integração]
        BUILD[Build Docker Images]
        SECURITY[Security Scan]
    end
    
    subgraph "CD Pipeline"
        TAG[Tag Version]
        PUSH_REGISTRY[Push to Registry]
        DEPLOY_DEV[Deploy Dev]
        DEPLOY_STAGE[Deploy Stage]
        DEPLOY_PROD[Deploy Prod]
    end
    
    subgraph "Environments"
        DEV[Development]
        STAGE[Staging]
        PROD[Production]
    end
    
    CODE --> TRIGGER
    TRIGGER --> LINT
    LINT --> TEST_UNIT
    TEST_UNIT --> TEST_INTEG
    TEST_INTEG --> BUILD
    BUILD --> SECURITY
    SECURITY --> TAG
    TAG --> PUSH_REGISTRY
    PUSH_REGISTRY --> DEPLOY_DEV
    DEPLOY_DEV --> DEV
    DEPLOY_DEV --> DEPLOY_STAGE
    DEPLOY_STAGE --> STAGE
    DEPLOY_STAGE --> DEPLOY_PROD
    DEPLOY_PROD --> PROD
```

### 6.2 Pipeline GitHub Actions Sugerido

**Arquivo: `.github/workflows/ci-cd.yml`** (Sugerido)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Lint API
        run: |
          cd api-nest
          npm ci
          npm run lint
      - name: Lint Frontend
        run: |
          cd frontend-react
          npm ci
          npm run lint

  test-api:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:5
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Test API
        run: |
          cd api-nest
          npm ci
          npm test

  test-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Test Collector
        run: |
          cd colletor-python
          pip install -r requirements.txt
          pytest

  test-go:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      - name: Test Worker
        run: |
          cd worker-go
          go test ./...

  build:
    needs: [lint, test-api, test-python, test-go]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker Images
        run: |
          docker-compose build

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          echo "Deploy to production"
          # Adicionar comandos de deploy aqui
```

### 6.3 Ambientes

| Ambiente | Descrição | URL Base |
|----------|-----------|----------|
| **Development** | Ambiente local com Docker Compose | `http://localhost:5173` |
| **Staging** | Ambiente de testes pré-produção | `https://staging.gdash.io` (sugerido) |
| **Production** | Ambiente de produção | `https://gdash.io` (sugerido) |

---

## 7. Guia de Execução do Projeto

### 7.1 Requisitos

#### Software
- **Docker**: 20.10+ ou Docker Desktop
- **Docker Compose**: v2.0+
- **Git**: Para clonar o repositório
- **8GB RAM**: Mínimo recomendado

#### Opcional (para desenvolvimento local)
- **Node.js**: 20.x (para API)
- **Python**: 3.11 (para Collector)
- **Go**: 1.21 (para Worker)
- **MongoDB**: 5.x (se não usar Docker)

### 7.2 Como Rodar Localmente com Docker

#### Passo 1: Clonar o Repositório
```bash
git clone <repository-url>
cd desafio-gdash-2025-02
```

#### Passo 2: Configurar Variáveis de Ambiente
```bash
cp env.example .env
# Editar .env se necessário
```

#### Passo 3: Executar Script de Inicialização (Linux/Mac)
```bash
chmod +x start.sh
./start.sh
```

#### Passo 4: Executar Manualmente (Windows)
```powershell
# Iniciar infraestrutura
docker compose up -d zookeeper kafka mongodb rabbitmq

# Aguardar 15 segundos
Start-Sleep -Seconds 15

# Iniciar aplicações
docker compose up -d api frontend worker collector

# Aguardar 20 segundos
Start-Sleep -Seconds 20

# Executar seed
docker compose exec api node dist/database/seed/users.seed.js
```

### 7.3 Como Rodar Localmente (Sem Docker)

#### API NestJS
```bash
cd api-nest
npm install
npm run build
npm run start:dev
```

#### Frontend React
```bash
cd frontend-react
npm install
npm run dev
```

#### Collector Python
```bash
cd colletor-python
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python src/main.py
```

#### Worker Go
```bash
cd worker-go
go mod download
go run cmd/worker/main.go
```

### 7.4 Variáveis de Ambiente

**Arquivo: `.env`**

```env
# Infrastructure
MONGO_URL=mongodb://root:root@mongodb:27017/gdash?authSource=admin
KAFKA_BOOTSTRAP_SERVERS=kafka:9093
ZOOKEEPER_CLIENT_PORT=2181
ZOOKEEPER_TICK_TIME=2000

# API NestJS
JWT_SECRET=changeme_please_use_secure_secret
PORT=3000

# Collector
LATITUDE=-19.5186
LONGITUDE=-42.6289
TIMEZONE=America/Sao_Paulo
COLLECT_INTERVAL_SECONDS=3600
COLLECT_INTERVAL_TYPE=hourly
KAFKA_TOPIC_RAW=ana.raw.readings
LOG_LEVEL=INFO

# Worker
KAFKA_TOPIC_PROCESSED=ana.processed.readings
KAFKA_GROUP_ID=gdash-worker-group
API_URL=http://api:3000
API_TIMEOUT_SECONDS=10
API_MAX_RETRIES=3
WORKER_MAX_RETRIES=3
WORKER_BATCH_SIZE=10
WORKER_PROCESSING_INTERVAL_MS=1000

# Frontend
VITE_API_URL=http://localhost:3000/api/v1
```

### 7.5 Estrutura de Diretórios

```
desafio-gdash-2025-02/
├── api-nest/                      # API NestJS
│   ├── src/
│   │   ├── domain/                # Entidades e interfaces
│   │   │   ├── entities/          # WeatherLog, User, Insight
│   │   │   └── repositories/      # Interfaces de repositórios
│   │   ├── application/           # Use cases
│   │   │   └── usecases/
│   │   │       ├── auth/          # Login, Register
│   │   │       ├── users/         # CRUD de usuários
│   │   │       ├── weather/       # Weather logs
│   │   │       └── insights/     # Geração de insights
│   │   ├── infra/                 # Implementações
│   │   │   ├── auth/             # JWT, Guards
│   │   │   ├── database/         # Repositórios MongoDB
│   │   │   ├── ai/               # Sistema de IA
│   │   │   │   ├── rules/        # Regras heurísticas
│   │   │   │   ├── analyzers/     # Análise estatística
│   │   │   │   ├── generators/   # Geração de texto
│   │   │   │   └── scorers/      # Pontuações
│   │   │   └── interceptors/     # Interceptors
│   │   ├── presentation/         # Controllers e DTOs
│   │   │   ├── controllers/     # REST controllers
│   │   │   └── dto/             # Data Transfer Objects
│   │   ├── modules/             # Módulos NestJS
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── weather/
│   │   │   ├── insights/
│   │   │   └── nasa/
│   │   ├── app.module.ts        # Módulo principal
│   │   └── main.ts              # Entry point
│   ├── database/
│   │   └── seed/               # Seeds
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── colletor-python/             # Collector Python
│   ├── src/
│   │   ├── domain/             # Entidades
│   │   │   ├── entities/      # WeatherReading
│   │   │   └── repositories/  # Interfaces
│   │   ├── application/       # Use cases
│   │   │   └── usecases/      # FetchAndPublishUseCase
│   │   ├── infra/             # Implementações
│   │   │   ├── http/         # OpenMeteoClient, Healthcheck
│   │   │   └── messaging/    # KafkaProducer
│   │   ├── shared/           # Config, Logger
│   │   └── main.py           # Entry point
│   ├── tests/                # Testes
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pytest.ini
│
├── worker-go/                 # Worker Go
│   ├── cmd/
│   │   └── worker/           # Entry point
│   ├── domain/               # Entidades e interfaces
│   │   ├── entities/         # ProcessedReading
│   │   └── repositories/     # Interfaces
│   ├── application/          # Services e use cases
│   │   ├── services/         # Validator, PVMetricsCalculator
│   │   └── usecases/        # ProcessReadingUseCase
│   ├── infra/               # Implementações
│   │   ├── http/           # APIClient, Healthcheck
│   │   └── messaging/      # KafkaConsumer, KafkaProducer
│   ├── internal/           # Config, Logger
│   ├── tests/              # Testes
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
│
├── frontend-react/          # Frontend React
│   ├── src/
│   │   ├── app/            # Config API, Routes
│   │   ├── components/     # Componentes reutilizáveis
│   │   │   ├── Chart/      # Componentes de gráficos
│   │   │   ├── Forecast/   # Componentes de previsão
│   │   │   ├── Insights/   # Componentes de insights
│   │   │   ├── NASA/       # Componentes NASA
│   │   │   └── ui/        # Componentes ShadCN/UI
│   │   ├── pages/          # Páginas
│   │   │   ├── Auth/      # Login, Register
│   │   │   ├── Dashboard/ # Dashboard principal
│   │   │   ├── Records/   # Tabela de registros
│   │   │   ├── Users/     # CRUD de usuários
│   │   │   └── NASA/      # Página NASA
│   │   ├── contexts/       # Context API
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilitários
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                    # Documentação
│   ├── API.md             # Referência da API
│   ├── ARCHITECTURE.md    # Arquitetura detalhada
│   ├── RUNNING.md        # Guia de execução
│   ├── TESTING.md        # Guia de testes
│   └── ARCHIVE/          # Histórico
│
├── docker-compose.yml     # Orquestração
├── env.example           # Template de variáveis
├── start.sh             # Script de inicialização
└── README.md           # Este arquivo
```

### 7.6 Acessando o Sistema

Após a inicialização, os serviços estarão disponíveis em:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:5173 | Dashboard principal |
| **API** | http://localhost:3000/api/v1 | Backend REST API |
| **API Health** | http://localhost:3000/api/v1/weather/health | Healthcheck da API |
| **Collector Health** | http://localhost:8080/healthz | Status do collector |
| **Worker Health** | http://localhost:8081/healthz | Status do worker |
| **RabbitMQ UI** | http://localhost:15672 | Interface RabbitMQ (guest/guest) |

### 7.7 Credenciais Padrão

```
Email: admin@example.com
Senha: 123456
```

### 7.8 Parando o Sistema

```bash
# Parar todos os serviços
docker compose down

# Parar e remover volumes (reset completo)
docker compose down -v
```

---

## 8. Documentação da API

### 8.1 Base URL

```
http://localhost:3000/api/v1
```

### 8.2 Autenticação

A maioria dos endpoints requer autenticação via JWT. Obtenha o token através do endpoint de login:

**POST** `/auth/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "name": "Admin",
    "role": "admin"
  }
}
```

**Uso do Token:**
```
Authorization: Bearer <access_token>
```

### 8.3 Endpoints Principais

#### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/login` | Login e obtenção de JWT | Não |
| POST | `/auth/register` | Registro de novo usuário | Não |

#### Dados Climáticos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/weather/logs` | Lista logs (paginação) | ✅ |
| GET | `/weather/logs/latest` | Última leitura | ✅ |
| GET | `/weather/precipitation/24h` | Chuva acumulada 24h | ✅ |
| GET | `/weather/forecast/7days` | Previsão de 7 dias | ✅ |
| GET | `/weather/forecast/day/:date` | Detalhes de um dia | ✅ |
| POST | `/weather/logs` | Criar log (interno) | Não |
| GET | `/weather/health` | Healthcheck | Não |

**Exemplo: GET `/weather/logs`**

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `city`: Filtrar por cidade (opcional)
- `start`: Data inicial (ISO 8601)
- `end`: Data final (ISO 8601)

**Response:**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "timestamp": "2025-01-15T10:00:00.000Z",
      "city": "Coronel Fabriciano",
      "temperature_c": 28.5,
      "relative_humidity": 65,
      "precipitation_mm": 0,
      "wind_speed_m_s": 3.2,
      "clouds_percent": 20,
      "estimated_irradiance_w_m2": 850,
      "pv_derating_pct": 5.2
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

#### Insights (IA)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/weather/insights?from=...&to=...` | Buscar insights | ✅ |
| POST | `/weather/insights` | Gerar insights | ✅ |

**Exemplo: GET `/weather/insights?from=2025-01-01&to=2025-01-15`**

**Response:**
```json
{
  "summary": "Nos últimos 15 dias, a temperatura média foi de 28°C, com alta umidade e tendência de chuva no fim da tarde.",
  "scores": {
    "comfort_score": 75,
    "pv_production_score": 82
  },
  "statistics": {
    "avg_temp": 28.0,
    "avg_humidity": 68,
    "trend": "rising"
  },
  "pv_metrics": {
    "soiling_risk": {
      "level": "low",
      "score": 15
    },
    "estimated_production_pct": 85
  },
  "alerts": [
    {
      "type": "heat",
      "severity": "medium",
      "message": "Temperaturas acima da média podem reduzir eficiência"
    }
  ]
}
```

#### Usuários

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/users` | Listar usuários | ✅ Admin |
| GET | `/users/:id` | Detalhes do usuário | ✅ Admin |
| PUT | `/users/:id` | Atualizar usuário | ✅ Admin |
| DELETE | `/users/:id` | Remover usuário | ✅ Admin |

#### Exportação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/weather/export.csv` | Download CSV | ✅ |
| GET | `/weather/export.xlsx` | Download XLSX | ✅ |

**Query Parameters:**
- `start`: Data inicial (opcional)
- `end`: Data final (opcional)
- `city`: Filtrar por cidade (opcional)

#### NASA (Opcional)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/nasa?page=...&limit=...` | Listar imagens | ✅ |

---

## 9. Guia de Desenvolvimento

### 9.1 Padrões de Código

#### TypeScript/JavaScript
- **ESLint**: Configurado para manter consistência
- **Prettier**: Formatação automática
- **Convenções**:
  - Nomes de classes: PascalCase
  - Nomes de funções/variáveis: camelCase
  - Constantes: UPPER_SNAKE_CASE
  - Arquivos: kebab-case

#### Python
- **PEP 8**: Seguir padrões Python
- **Type Hints**: Usar type hints quando possível
- **Docstrings**: Documentar funções e classes

#### Go
- **gofmt**: Formatação automática
- **Convenções**:
  - Nomes públicos: PascalCase
  - Nomes privados: camelCase
  - Arquivos: snake_case

### 9.2 Convenção de Commits

Seguir **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção

**Exemplos:**
```
feat(api): add export CSV endpoint
fix(worker): handle Kafka connection errors
docs(readme): update installation guide
```

### 9.3 Estratégia de Branches

**Git Flow:**

- `main`: Código de produção
- `develop`: Código de desenvolvimento
- `feature/*`: Novas funcionalidades
- `bugfix/*`: Correções de bugs
- `hotfix/*`: Correções urgentes

**Exemplo:**
```bash
git checkout -b feature/add-export-functionality
# Desenvolver...
git commit -m "feat(api): add export functionality"
git push origin feature/add-export-functionality
# Criar Pull Request
```

### 9.4 Como Contribuir

1. **Fork** o repositório
2. **Clone** seu fork
3. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
4. **Commit** suas mudanças (`git commit -m 'feat: add AmazingFeature'`)
5. **Push** para a branch (`git push origin feature/AmazingFeature`)
6. **Abra** um Pull Request

### 9.5 Testes

#### API NestJS
```bash
cd api-nest
npm test
npm run test:cov  # Com cobertura
```

#### Collector Python
```bash
cd colletor-python
pytest
pytest --cov  # Com cobertura
```

#### Worker Go
```bash
cd worker-go
go test ./...
go test -cover ./...  # Com cobertura
```

#### Frontend React
```bash
cd frontend-react
npm test
```

---

##  Licença

Este projeto foi desenvolvido exclusivamente para fins de avaliação técnica do processo seletivo GDASH 2025/02.

---

## Desenvolvido por

**Wilker Junio Coelho Pimenta**

---

##  Documentação Adicional

Para informações detalhadas sobre aspectos específicos do projeto, consulte:

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitetura detalhada do sistema
- **[docs/API.md](docs/API.md)** - Referência completa da API REST
- **[docs/RUNNING.md](docs/RUNNING.md)** - Guia detalhado de execução
- **[docs/TESTING.md](docs/TESTING.md)** - Guia de testes automatizados

---

**Última atualização**: 26/11/2025
