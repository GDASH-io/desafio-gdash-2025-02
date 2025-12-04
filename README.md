# Weather Dashboard - Sistema de Monitoramento Climático com IA

<div align="center">

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

**Uma aplicação full-stack moderna que integra coleta de dados climáticos em tempo real, processamento assíncrono com filas, análise inteligente com IA e recomendações personalizadas.**

[Funcionalidades](#funcionalidades) • [Tecnologias](#tecnologias) • [Arquitetura](#arquitetura) • [Instalação](#instalação) • [Uso](#uso)

</div>

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Fluxograma do Sistema](#fluxograma-do-sistema)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Documentação da API](#documentação-da-api)
- [Docker Compose](#docker-compose)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Desenvolvimento](#desenvolvimento)
- [Contribuição](#contribuição)
- [Licença](#licença)
- [Autor](#autor)

---

## Sobre o Projeto

Este projeto é um **sistema completo de monitoramento climático** que coleta dados meteorológicos em tempo real, processa informações através de filas de mensagens, armazena dados históricos e fornece insights inteligentes baseados em IA para ajudar usuários a tomar decisões informadas sobre o clima.

### Características Principais

- **Coleta Automatizada**: Python coleta dados climáticos periodicamente
- **Processamento Assíncrono**: Worker em Go processa mensagens da fila RabbitMQ
- **Armazenamento Persistente**: MongoDB armazena histórico de dados
- **Inteligência Artificial**: Groq API fornece insights e recomendações personalizadas
- **Interface Moderna**: React com Tailwind CSS e shadcn/ui
- **Recomendações de Filmes**: Sugestões baseadas nas condições climáticas
- **Dashboards Interativos**: Visualização de dados em tempo real

---

## Funcionalidades

### Autenticação e Usuários

- **Sistema de Login e Registro**: Autenticação JWT segura
- **Gerenciamento de Usuários**: CRUD completo com diferentes roles
- **Usuário Administrador Padrão**: Criado automaticamente na inicialização
- **Proteção de Rotas**: Middleware de autenticação no frontend e backend

### Monitoramento Climático

- **Previsão do Tempo em Tempo Real**: Dados de múltiplas fontes (Open-Meteo)
- **Histórico de Dados**: Armazenamento de logs climáticos no MongoDB
- **Busca por Cidade**: Seleção de cidades pré-configuradas ou geolocalização
- **Visualização Gráfica**: Gráficos horários e diários de temperatura, umidade, vento
- **Exportação de Dados**: Download em CSV e XLSX

### Inteligência Artificial

- **Resumo Diário Personalizado**: Análise das condições climáticas do dia
- **Alertas Inteligentes**: Avisos sobre condições extremas
- **Recomendações de Atividades**: Sugestões baseadas no clima
- **Sugestões de Roupas**: Orientações sobre o que vestir
- **Análise de Humor**: Insights sobre como o clima afeta o bem-estar
- **Recomendações de Filmes**: Sugestões personalizadas baseadas no clima

### Integração com TMDB

- **Filmes Populares**: Listagem de filmes em alta
- **Busca de Filmes**: Pesquisa por título
- **Detalhes de Filmes**: Informações completas sobre cada filme
- **Recomendações Climáticas**: Filmes sugeridos conforme o clima
- **Filtros por Gênero**: Busca por gêneros específicos

### Dashboard e Visualizações

- **Dashboard Principal**: Visão geral do clima atual
- **Histórico Visual**: Gráficos de temperatura, umidade e precipitação
- **Previsão Horária**: Próximas 24 horas detalhadas
- **Previsão Semanal**: 7 dias de previsão
- **Tabela de Logs**: Visualização paginada e ordenável dos dados históricos

### Processamento de Dados

- **Coleta Automatizada**: Python coleta dados a cada hora (configurável)
- **Fila de Mensagens**: RabbitMQ gerencia a fila de processamento
- **Worker em Go**: Processa mensagens e envia para API NestJS
- **Retry Logic**: Sistema de retentativas em caso de falha
- **Logs Detalhados**: Rastreamento completo do fluxo de dados

---

## Tecnologias

### Frontend

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool rápida
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI acessíveis
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones

### Backend

- **NestJS** - Framework Node.js progressivo
- **TypeScript** - Tipagem estática
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **Passport.js** - Autenticação
- **JWT** - JSON Web Tokens
- **Swagger** - Documentação da API
- **Class Validator** - Validação de DTOs

### Coleta de Dados

- **Python 3** - Linguagem de programação
- **Requests** - Biblioteca HTTP
- **Pika** - Cliente RabbitMQ

### Processamento

- **Go** - Linguagem de programação
- **AMQP091** - Cliente RabbitMQ para Go

### Infraestrutura

- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **RabbitMQ** - Message broker
- **MongoDB** - Banco de dados
- **Nginx** - Servidor web para frontend

### Integrações

- **Open-Meteo API** - Dados climáticos
- **Groq API** - Inteligência Artificial
- **TMDB API** - Dados de filmes

---

## Arquitetura

O sistema segue uma **arquitetura de microserviços** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────────┐
│                        REACT FRONTEND                            │
│  (Interface do usuário - Dashboard, Autenticação, Filmes)       │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      NESTJS API                                  │
│  (Backend principal - Autenticação, CRUD, Integrações)          │
└─────────────┬───────────────────────┬───────────────────────────┘
              │                       │
              │                       │
┌─────────────▼─────────┐   ┌────────▼────────────────────────────┐
│      MONGODB          │   │     TMDB API                        │
│  (Armazenamento)      │   │  (Filmes)                           │
└───────────────────────┘   └─────────────────────────────────────┘
              │
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                    RABBITMQ                                      │
│              (Message Broker)                                    │
└─────────────┬───────────────────────┬───────────────────────────┘
              │                       │
              │                       │
┌─────────────▼──────────┐  ┌────────▼────────────────────────────┐
│   PYTHON COLLECTOR     │  │      GO WORKER                      │
│  (Coleta de dados)     │  │  (Processamento)                    │
│                        │  │                                      │
│  ┌──────────────────┐  │  │  Consome mensagens                  │
│  │ Open-Meteo API   │  │  │  Envia para NestJS                  │
│  └──────────────────┘  │  │                                      │
└────────────────────────┘  └─────────────────────────────────────┘
              │
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                    GROQ API                                      │
│              (Inteligência Artificial)                           │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Coleta**: Python busca dados do Open-Meteo API periodicamente
2. **Fila**: Dados são enviados para a fila RabbitMQ
3. **Processamento**: Worker Go consome mensagens da fila
4. **Armazenamento**: Worker envia dados para API NestJS que salva no MongoDB
5. **Visualização**: Frontend consome API NestJS para exibir dados
6. **IA**: NestJS consulta Groq API para gerar insights quando solicitado

---

## Estrutura de Pastas

```
GDASH-TEST/
│
├── nestjs-api/                    # Backend NestJS
│   ├── src/
│   │   ├── ai/                    # Módulo de IA (Groq)
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts
│   │   │   └── groq.service.ts
│   │   ├── auth/                  # Autenticação
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── jwt-auth.guard.ts
│   │   ├── users/                 # Gerenciamento de usuários
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── dto/
│   │   │   └── schemas/
│   │   ├── weather/               # Módulo climático
│   │   │   ├── weather.controller.ts
│   │   │   ├── weather.service.ts
│   │   │   ├── city-coordinates.service.ts
│   │   │   ├── dto/
│   │   │   └── schemas/
│   │   ├── tmdb/                  # Integração TMDB
│   │   │   ├── tmdb.controller.ts
│   │   │   └── tmdb.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── react-frontend/                # Frontend React
│   ├── src/
│   │   ├── auth/                  # Autenticação
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PrivateRoute.tsx
│   │   ├── components/
│   │   │   ├── ai/                # Componentes de IA
│   │   │   │   ├── DaySummaryCard.tsx
│   │   │   │   ├── MoodInsights.tsx
│   │   │   │   ├── MovieRecommendations.tsx
│   │   │   │   ├── SmartAlerts.tsx
│   │   │   │   └── WeatherHistory.tsx
│   │   │   ├── layout/            # Layout
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── ui/                # Componentes UI
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── ...
│   │   │   └── weather/           # Componentes climáticos
│   │   │       └── CitySelector.tsx
│   │   ├── pages/                 # Páginas
│   │   │   ├── WeatherDashboard.tsx
│   │   │   ├── WeatherLogsPage.tsx
│   │   │   ├── MovieList.tsx
│   │   │   ├── MovieDetail.tsx
│   │   │   └── UserManagement.tsx
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── python-collector/              # Coletor Python
│   ├── collector.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── go-worker/                     # Worker Go
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
│
├── docker-compose.yml             # Orquestração Docker
├── docker-compose.example.yml     # Exemplo de configuração
└── README.md                      # Este arquivo
```

---

## Fluxograma do Sistema

```mermaid
graph TB
    Start([Usuário acessa o sistema]) --> Login{Login válido?}
    Login -->|Não| LoginForm[Formulário de Login]
    LoginForm --> Login
    Login -->|Sim| Dashboard[Dashboard Principal]
    
    Dashboard --> SelectCity{Selecionar Cidade?}
    SelectCity -->|Sim| CityList[Lista de Cidades]
    SelectCity -->|Não| UseLocation[Usar Geolocalização]
    
    CityList --> WeatherAPI[Buscar Previsão do Tempo]
    UseLocation --> WeatherAPI
    
    WeatherAPI --> DisplayWeather[Exibir Dados Climáticos]
    DisplayWeather --> AIInsights[Gerar Insights de IA]
    
    AIInsights --> GroqAPI[Groq API]
    GroqAPI --> DaySummary[Resumo do Dia]
    GroqAPI --> Recommendations[Recomendações]
    GroqAPI --> Alerts[Alertas Inteligentes]
    GroqAPI --> Movies[Filmes Sugeridos]
    
    DisplayWeather --> Charts[Gráficos e Visualizações]
    DisplayWeather --> Export{Exportar Dados?}
    Export -->|CSV| ExportCSV[Download CSV]
    Export -->|XLSX| ExportXLSX[Download XLSX]
    
    Movies --> TMDBAPI[TMDB API]
    TMDBAPI --> MovieList[Lista de Filmes]
    
    Dashboard --> MoviesPage[Página de Filmes]
    MoviesPage --> SearchMovies{Buscar Filme?}
    SearchMovies -->|Sim| MovieSearch[Busca por Nome]
    SearchMovies -->|Não| PopularMovies[Filmes Populares]
    
    MovieSearch --> TMDBAPI
    PopularMovies --> TMDBAPI
    
    Dashboard --> LogsPage[Página de Logs]
    LogsPage --> ViewHistory[Visualizar Histórico]
    ViewHistory --> FilterLogs{Filtrar/Ordenar}
    
    Dashboard --> UserMgmt[Gerenciar Usuários]
    UserMgmt --> CRUDUsers[CRUD de Usuários]
    
    subgraph Background[Processamento em Background]
        PythonCollector[Python Collector]
        PythonCollector -->|Coleta a cada hora| OpenMeteo[Open-Meteo API]
        OpenMeteo -->|Dados normalizados| RabbitMQ[RabbitMQ Queue]
        RabbitMQ -->|Consome mensagens| GoWorker[Go Worker]
        GoWorker -->|Envia dados| NestJSAPI[NestJS API]
        NestJSAPI -->|Armazena| MongoDB[(MongoDB)]
    end
    
    style Dashboard fill:#3B82F6,stroke:#1E40AF,color:#fff
    style AIInsights fill:#10B981,stroke:#059669,color:#fff
    style RabbitMQ fill:#F59E0B,stroke:#D97706,color:#fff
    style MongoDB fill:#EC4899,stroke:#BE185D,color:#fff
```

### Fluxo de Coleta Automatizada

```mermaid
sequenceDiagram
    participant Python as Python Collector
    participant OpenMeteo as Open-Meteo API
    participant RabbitMQ as RabbitMQ
    participant GoWorker as Go Worker
    participant NestJS as NestJS API
    participant MongoDB as MongoDB
    
    loop A cada hora
        Python->>OpenMeteo: GET /forecast
        OpenMeteo-->>Python: Dados climáticos
        Python->>Python: Normalizar dados
        Python->>RabbitMQ: Publicar mensagem JSON
    end
    
    loop Consumo contínuo
        RabbitMQ->>GoWorker: Consumir mensagem
        GoWorker->>GoWorker: Validar dados
        GoWorker->>NestJS: POST /api/weather/logs
        NestJS->>MongoDB: Salvar log climático
        MongoDB-->>NestJS: Confirmação
        NestJS-->>GoWorker: Status 201
        GoWorker->>RabbitMQ: ACK (confirmação)
    end
```

---

## Instalação

### Pré-requisitos

- Docker e Docker Compose instalados
- Git instalado
- (Opcional) Node.js, Python 3 e Go para desenvolvimento local

### Passo a Passo

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/weather-dashboard.git
cd weather-dashboard
```

2. **Configure as variáveis de ambiente**

```bash
cp docker-compose.example.yml docker-compose.yml
# Edite o docker-compose.yml com suas configurações
```

3. **Inicie os serviços**

```bash
docker-compose up -d
```

4. **Aguarde a inicialização**

Os serviços serão iniciados na seguinte ordem:
- MongoDB
- RabbitMQ
- NestJS API
- Go Worker
- Python Collector
- React Frontend

5. **Acesse a aplicação**

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

---

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` ou configure no `docker-compose.yml`:

```env
# MongoDB
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=rootpassword
MONGODB_URI=mongodb://root:rootpassword@mongodb:27017/weather_db?authSource=admin

# RabbitMQ
RABBITMQ_DEFAULT_USER=guest
RABBITMQ_DEFAULT_PASS=guest

# NestJS
JWT_SECRET=supersecretjwtkey
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=123456
TMDB_API_KEY=sua-chave-tmdb
GROQ_API_KEY=sua-chave-groq

# Python Collector
OPEN_METEO_API_URL=https://api.open-meteo.com/v1/forecast
LATITUDE=-12.9714
LONGITUDE=-38.5014
COLLECTION_INTERVAL=3600

# Frontend
VITE_API_BASE_URL=http://localhost:3000
```

### Chaves de API Necessárias

1. **TMDB API Key**: Obtenha em https://www.themoviedb.org/settings/api
2. **Groq API Key**: Obtenha em https://console.groq.com/keys
3. **Open-Meteo**: Não requer chave (gratuita)

---

## Uso

### Primeiro Acesso

1. Acesse http://localhost:5173
2. Faça login com as credenciais padrão:
   - **Email**: admin@example.com
   - **Senha**: 123456
3. Ou crie uma nova conta através do link "Cadastre-se"

### Dashboard Principal

- Visualize o clima atual da sua localização
- Selecione uma cidade diferente no seletor de cidades
- Veja insights de IA personalizados
- Receba recomendações de atividades e roupas
- Explore filmes sugeridos baseados no clima

### Gerenciamento de Dados

- **Exportar Logs**: Acesse a página de Logs e clique em "Exportar CSV" ou "Exportar XLSX"
- **Visualizar Histórico**: Navegue pela tabela de logs com filtros e ordenação
- **Gerenciar Usuários**: Acesse o menu "Usuários" (requer permissões de admin)

---

## API Endpoints

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login e obter token JWT

### Clima

- `GET /api/weather/forecast` - Obter previsão do tempo
  - Query params: `city`, `latitude`, `longitude`
- `GET /api/weather/ai-insights` - Obter insights de IA
  - Query params: `city`, `latitude`, `longitude`
- `GET /api/weather/logs` - Listar logs climáticos
- `POST /api/weather/logs` - Criar novo log (usado pelo worker)
- `GET /api/weather/export.csv` - Exportar logs em CSV
- `GET /api/weather/export.xlsx` - Exportar logs em XLSX
- `GET /api/weather/cities` - Listar cidades disponíveis
  - Query param: `search` - Buscar cidade

### Filmes (TMDB)

- `GET /api/tmdb/popular` - Filmes populares
  - Query param: `page`
- `GET /api/tmdb/search` - Buscar filmes
  - Query params: `query`, `page`
- `GET /api/tmdb/movie/:id` - Detalhes de um filme
- `GET /api/tmdb/by-genres` - Filmes por gêneros
  - Query params: `genres`, `page`
- `GET /api/tmdb/genres` - Lista de gêneros

### Usuários

- `GET /api/users` - Listar usuários (autenticado)
- `GET /api/users/:id` - Obter usuário por ID
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Health Check

- `GET /api/health` - Status da API

---

## Documentação da API

A documentação completa da API está disponível através do Swagger:

**Acesse**: http://localhost:3000/api/docs

O Swagger fornece:
- Lista completa de endpoints
- Parâmetros necessários
- Exemplos de requisições e respostas
- Possibilidade de testar endpoints diretamente

---

## Docker Compose

O projeto usa Docker Compose para orquestrar todos os serviços. O arquivo `docker-compose.yml` define:

- **mongodb**: Banco de dados MongoDB
- **rabbitmq**: Message broker RabbitMQ
- **nestjs-api**: API backend NestJS
- **go-worker**: Worker Go para processar mensagens
- **python-collector**: Coletor Python de dados climáticos
- **react-frontend**: Frontend React servido por Nginx

### Comandos Úteis

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Rebuild e reiniciar
docker-compose up -d --build

# Ver status dos serviços
docker-compose ps
```

---

## Desenvolvimento

### Desenvolvimento Local

Para desenvolver localmente sem Docker:

#### Backend (NestJS)

```bash
cd nestjs-api
npm install
npm run start:dev
```

#### Frontend (React)

```bash
cd react-frontend
npm install
npm run dev
```

#### Python Collector

```bash
cd python-collector
pip install -r requirements.txt
python collector.py
```

#### Go Worker

```bash
cd go-worker
go mod download
go run main.go
```

### Estrutura de Desenvolvimento

- Backend roda em: http://localhost:3000
- Frontend roda em: http://localhost:5173
- MongoDB deve estar rodando (via Docker ou local)
- RabbitMQ deve estar rodando (via Docker ou local)

---

## Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## Licença

Uso educacional e demonstrativo.

---

## Autor

**William D. Barreto da Conceição**

- GitHub: [@willtenisom](https://github.com/willtenisom)
- Email: wil_barretto@hotmail.com
- LinkedIn: [William D. Barreto da Conceição](https://www.linkedin.com/in/william-douglas-barreto-da-conceição/)

---

<div align="center">

**Desenvolvido por William D. Barreto da Conceição**

Se este projeto foi útil para você, considere dar uma estrela!

</div>
